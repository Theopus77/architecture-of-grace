
(function(){
  "use strict";
  var PILOT_EMAIL = "Theopus77@yahoo.com";
  var PDIR = "pilot/";
  function T(en,es){ return {en:en, es:es}; }
  function curLang(){ try{ return (window.lang==='es')?'es':'en'; }catch(e){ return 'en'; } }
  function tx(v){ return (v && typeof v==='object' && ('en' in v)) ? (v[curLang()]!=null?v[curLang()]:v.en) : v; }

  /* ---------- static-chrome Spanish (registered into the site's I18N_UI) ---------- */
  var PILOT_I18N = {
    pp_nav:{en:'Pilot Program', es:'Programa piloto'},
    pp_ey:{en:'Pilot Program', es:'Programa piloto'},
    pp_h:{en:'Run a pilot with confidence', es:'Lleva a cabo un piloto con confianza'},
    pp_lead:{en:'Everything a school, family, or team needs to try Architecture of Grace — a five-minute Quick-Start for each role, and a short feedback form you can fill out right here or print. No sign-up, no code. Answers stay on the device by default; your feedback is the only thing you choose to send.',
             es:'Todo lo que una escuela, familia o equipo necesita para probar Architecture of Grace: una Guía rápida de cinco minutos para cada rol y un breve formulario de comentarios que puedes completar aquí mismo o imprimir. Sin registro, sin código. Las respuestas se quedan en el dispositivo por defecto; tus comentarios son lo único que eliges enviar.'},
    pp_s1t:{en:'Pick your role', es:'Elige tu rol'},
    pp_s1b:{en:'Teacher, specialist, parent, child, adult, or leader — choose the card that fits you.', es:'Docente, especialista, familia, niño, adulto o líder: elige la tarjeta que te corresponde.'},
    pp_s2t:{en:'Open the Quick-Start', es:'Abre la Guía rápida'},
    pp_s2b:{en:'Preview it here or download the PDF. About five minutes to your first self-reflection.', es:'Míralo aquí o descarga el PDF. Unos cinco minutos hasta tu primera autorreflexión.'},
    pp_s3t:{en:'Run the self-reflection', es:'Haz la autorreflexión'},
    pp_s3b:{en:'With a class, a child, a team, or just yourself. Nothing is sent anywhere.', es:'Con una clase, un niño, un equipo o solo contigo. No se envía nada a ningún lugar.'},
    pp_s4t:{en:'Share your read', es:'Comparte tu opinión'},
    pp_s4b:{en:'Fill out the feedback form online or on paper. What confused someone or broke is gold.', es:'Completa el formulario de comentarios en línea o en papel. Lo que confundió a alguien o falló vale oro.'},
    pp_priv:{en:'<strong>About the online forms:</strong> nothing you type is stored on this site or sent to any server. When you press <em>Send feedback</em>, your own email app opens with the answers filled in, addressed to the project — you stay in control of what goes. Prefer paper? Every form is also a printable PDF.',
             es:'<strong>Sobre los formularios en línea:</strong> nada de lo que escribes se guarda en este sitio ni se envía a ningún servidor. Al pulsar <em>Enviar comentarios</em>, se abre tu propia app de correo con las respuestas completadas y dirigida al proyecto: tú decides qué se envía. ¿Prefieres papel? Cada formulario también es un PDF para imprimir.'},
    pp_cta_h:{en:'Ready to pilot Architecture of Grace?', es:'¿Listo para hacer un piloto de Architecture of Grace?'},
    pp_cta_p:{en:'Tell us a little about your school, district, or family and we’ll help you set up a pilot — including licensing, privacy paperwork, and a walkthrough if you’d like one.',
              es:'Cuéntanos un poco sobre tu escuela, distrito o familia y te ayudaremos a preparar un piloto, incluyendo licencias, los documentos de privacidad y una orientación guiada si la deseas.'},
    pp_cta_b1:{en:'Request to pilot &rarr;', es:'Solicitar un piloto &rarr;'},
    pp_cta_b2:{en:'For schools &amp; districts &rarr;', es:'Para escuelas y distritos &rarr;'},
    /* legal block */
    lg_ey:{en:'For schools &amp; districts', es:'Para escuelas y distritos'},
    lg_h:{en:'Privacy &amp; legal documents', es:'Documentos de privacidad y legales'},
    lg_sub:{en:'Everything your IT, privacy, and legal teams need to evaluate the self-reflection — written in plain language for busy administrators. All are PDFs you can download, share, and review.',
            es:'Todo lo que tus equipos de TI, privacidad y legal necesitan para evaluar la autorreflexión, en lenguaje claro para administradores ocupados. Todos son PDF que puedes descargar, compartir y revisar.'},
    lg_d1h:{en:'Data Privacy Agreement (DPA)', es:'Acuerdo de privacidad de datos (DPA)'},
    lg_d1p:{en:'A ready-to-edit DPA modeled on the SDPC national template — a starting draft for your counsel, covering FERPA, COPPA, and PPRA.',
            es:'Un DPA listo para editar, basado en la plantilla nacional del SDPC: un borrador inicial para tu asesoría legal, que cubre FERPA, COPPA y PPRA.'},
    lg_d2h:{en:'IT Deployment Guide', es:'Guía de implementación para TI'},
    lg_d2p:{en:'Step-by-step setup for your IT team, including the optional Google Sheets sync script. The data lives in your Google, under your control — no servers of ours.',
            es:'Configuración paso a paso para tu equipo de TI, incluido el script opcional de sincronización con Hojas de Google. Los datos viven en tu Google, bajo tu control; sin servidores nuestros.'},
    lg_d3h:{en:'Data &amp; Privacy Statement', es:'Declaración de datos y privacidad'},
    lg_d3p:{en:'A plain-language summary of what is collected, where it lives, and the on-device-by-default design — the quick read for a privacy review.',
            es:'Un resumen en lenguaje claro de qué se recopila, dónde vive y el diseño en el dispositivo por defecto: la lectura rápida para una revisión de privacidad.'},
    lg_d4h:{en:'How to Drop Everything In', es:'Cómo integrarlo todo'},
    lg_d4p:{en:'The fast implementation guide — how to get the whole self-reflection running in your environment, start to finish.',
            es:'La guía de implementación rápida: cómo poner en marcha todo la autorreflexión en tu entorno, de principio a fin.'},
    lg_dl:{en:'Download PDF', es:'Descargar PDF'},
    lg_foot1:{en:'Explore the Pilot Program &rarr;', es:'Explora el Programa piloto &rarr;'},
    lg_foot2:{en:'Read the full Privacy page &rarr;', es:'Lee la página completa de Privacidad &rarr;'},
    lg_disc:{en:'The DPA is a draft template for discussion, not legal advice; have it reviewed by qualified counsel for your LEA and jurisdiction before signing.',
             es:'El DPA es una plantilla preliminar para discusión, no asesoría legal; haz que un abogado calificado lo revise para tu LEA y jurisdicción antes de firmarlo.'}
  };

  /* ---------- UI strings (dynamic) ---------- */
  var UI = {
    quickstart:T('Quick-Start','Guía rápida'), feedback:T('Site feedback (optional)','Comentarios del sitio (opcional)'),
    preview:T('Preview','Vista previa'), pdf:T('PDF','PDF'),
    fill:T('Fill out online','Completar en línea'), printpdf:T('Print PDF','PDF para imprimir'),
    subFb:T('Feedback · about 3–4 min','Comentarios · unos 3–4 min'),
    subQs:T('Quick-Start','Guía rápida'),
    dlQs:T('Open Quick-Start (PDF)','Abrir Guía rápida (PDF)'),
    goForm:T('Go to feedback form &rarr;','Ir al formulario de comentarios &rarr;'),
    send:T('Send feedback &rarr;','Enviar comentarios &rarr;'),
    privMini:T('Your answers aren’t saved on this site. When you’re done, you’ll tap once to open your email app with everything filled in.','Tus respuestas no se guardan en este sitio. Al terminar, tocarás una vez para abrir tu app de correo con todo completado.'),
    doneH:T('Thank you — one last step','Gracias: un último paso'),
    doneP:T('Your answers are ready. Tap <b>Open email app</b> below to finish — it opens already filled in and addressed to the project; just press send there. No email app on this device? Tap <b>Copy my answers</b> instead.','Tus respuestas están listas. Toca <b>Abrir app de correo</b> abajo para terminar: se abre ya completado y dirigido al proyecto; solo pulsa enviar allí. ¿No hay app de correo en este dispositivo? Toca <b>Copiar mis respuestas</b>.'),
    openEmail:T('Open email app','Abrir app de correo'),
    openAgain:T('Open email again','Abrir el correo de nuevo'),
    copy:T('Copy my answers','Copiar mis respuestas'), copied:T('Copied ✓','Copiado ✓'),
    done:T('Done','Listo'),
    copyNote:T('If you copy your answers, you can paste them into an email to <b>'+PILOT_EMAIL+'</b> yourself.','Si copias tus respuestas, puedes pegarlas tú mismo en un correo a <b>'+PILOT_EMAIL+'</b>.'),
    mailHdr:T('Architecture of Grace — Self-Reflection pilot feedback','Architecture of Grace — Comentarios del piloto del Autorreflexión'),
    mailForm:T('Form','Formulario'), mailDate:T('Date submitted','Fecha de envío'),
    mailFoot:T('(Sent from the pilot form on architectureofgrace.com)','(Enviado desde el formulario del piloto en architectureofgrace.com)'),
    noAns:T('(no answer)','(sin respuesta)'), none:T('(none)','(ninguna)'), blank:T('(blank)','(en blanco)'),
    subj:T('AoG Pilot Feedback','Comentarios del piloto AoG'),
    progLab:T('Your progress','Tu progreso'),
    preparing:T('Finishing up…','Finalizando…'),
    resend:T('<b>Nothing is sent until you press send</b> in your email app. Your typed answers are never stored on this site.','<b>Nada se envía hasta que pulses enviar</b> en tu app de correo. Tus respuestas no se guardan en este sitio.')
  };

  /* ---------- audience cards ---------- */
  var CARDS = [
    {key:'teacher', title:T('Teachers &amp; Educators','Docentes y educadores'), who:T('Run the self-reflection with a class and read the group at a glance.','Haz la autorreflexión con una clase y lee al grupo de un vistazo.'), qs:'AoG-QuickStart-Teacher.pdf', fb:'AoG-Feedback-Teacher.pdf', form:'teacher'},
    {key:'specialist', title:T('Specialists &amp; Support Staff','Especialistas y personal de apoyo'), who:T('Paraprofessionals, teacher aides, counselors, psychologists, social workers, SLPs, OTs, PTs, and behavior staff working across tiers.','Paraprofesionales, auxiliares docentes, consejeros, psicólogos, trabajadores sociales, fonoaudiólogos, terapeutas ocupacionales, fisioterapeutas y personal de conducta que trabajan en todos los niveles.'), qs:'AoG-QuickStart-Specialist.pdf', fb:'AoG-Feedback-Specialist.pdf', form:'specialist'},
    {key:'outside', title:T('Outside &amp; Community Providers','Proveedores externos y comunitarios'), who:T('Private-practice therapists, outside OTs, PTs &amp; SLPs, and community clinics partnering with a family or school.','Terapeutas en consulta privada, terapeutas ocupacionales, fisioterapeutas y fonoaudiólogos externos, y clínicas comunitarias que colaboran con una familia o escuela.'), qs:'AoG-QuickStart-Outside.pdf', fb:null, form:'outside', note:T('A private, consent-first workspace for providers who aren’t employed by the school — on-device by default.','Un espacio privado que da prioridad al consentimiento, para proveedores que no son empleados de la escuela: en el dispositivo por defecto.')},
    {key:'parent', title:T('Parents &amp; Families','Familias y cuidadores'), who:T('Five quiet minutes with your child at home, with conversation starters you can print.','Cinco minutos tranquilos con tu hijo en casa, con preguntas para conversar que puedes imprimir.'), qs:'AoG-QuickStart-Parent.pdf', fb:'AoG-Feedback-Parent.pdf', form:'parent'},
    {key:'adult', title:T('Adults (self-use)','Adultos (uso personal)'), who:T('A private self-reflection for the grown-up in the room — a mirror, not a report.','Una autorreflexión privado para el adulto presente: un espejo, no un informe.'), qs:'AoG-QuickStart-Adult.pdf', fb:'AoG-Feedback-Adult.pdf', form:'adult'},
    {key:'leader', title:T('Leadership','Liderazgo'), who:T('Principals, curriculum &amp; SEL directors, and MTSS coordinators — a five-minute look built around the decision.','Directores, coordinadores de currículo y SEL, y coordinadores de MTSS: una mirada de cinco minutos centrada en la decisión.'), qs:'AoG-QuickStart-Leadership.pdf', fb:null, form:'leader', note:T('Leadership feedback is an online form for now.','Por ahora, los comentarios de liderazgo se recogen en un formulario en línea.')},
    {key:'child', title:T('Children (simplified)','Niños (versión simple)'), who:T('A kid-friendly version with faces and short questions — given by a parent or teacher.','Una versión para niños con caritas y preguntas cortas, guiada por una familia o un docente.'), qs:null, fb:'AoG-Feedback-Child.pdf', form:'child', note:T('Set it up using the Parent or Teacher Quick-Start.','Configúralo con la Guía rápida de familias o de docentes.')},
    {key:'faith', title:T('Faith-Based &amp; Ministry','Organizaciones de fe y ministerios'), who:T('Churches, ministries, faith-based schools, and youth groups — the universal tool, with an optional faith companion you turn on.','Iglesias, ministerios, escuelas religiosas y grupos juveniles: la herramienta universal, con un acompañante de fe opcional que tú activas.'), qs:'AoG-QuickStart-Faith.pdf', fb:null, form:'faith', note:T('The core stays universal. The Faith Companion is optional, on-device, and off until you turn it on.','El núcleo permanece universal. El Acompañante de fe es opcional, en el dispositivo, y está apagado hasta que lo actives.')},
  ].filter(function (c) { return c.key !== 'faith' || window.AOG_FAITH_ENABLED; });

  var IC = {
    teacher:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
    specialist:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M19 8l2 2-2 2"/></svg>',
    parent:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.35-9-8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 3.65-9 8-9 8z"/></svg>',
    child:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
    adult:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>',
    leader:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01"/></svg>',
    outside:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h6"/><path d="M12 9v6"/><path d="M21 12a9 9 0 1 1-9-9"/><path d="M16 3h5v5"/></svg>',
    faith:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.3-8.5-8A5 5 0 0 1 12 6a5 5 0 0 1 8.5 7c-2.5 3.7-8.5 8-8.5 8z"/><path d="M12 8v6M9.5 11h5"/></svg>'
  };

  /* Start Here: non-pilot Quick-Start PDFs (titled "Quick-Start", not "Pilot Quick-Start") */
  var SHQS = {
    teacher:'AoG-StartHere-Teacher.pdf', specialist:'AoG-StartHere-Specialist.pdf',
    parent:'AoG-StartHere-Parent.pdf', adult:'AoG-StartHere-Adult.pdf', leader:'AoG-StartHere-Leader.pdf',
    outside:'AoG-StartHere-Outside.pdf', faith:'AoG-StartHere-Faith.pdf'
  };

  /* Start Here: getting-started wording (not the pilot framing) */
  var SHWHO = {
    teacher:T('New here? Start with one class. The Quick-Start walks you through your first five-minute self-reflection.','¿Recién llegas? Empieza con una clase. La guía rápida te lleva paso a paso por tu primera autorreflexión de cinco minutos.'),
    specialist:T('Begin right where you already work — across tiers. The Quick-Start shows how to run and read your first self-reflection.','Empieza justo donde ya trabajas, en todos los niveles. La guía rápida muestra cómo hacer y leer tu primera autorreflexión.'),
    parent:T('Try it at home tonight. The Quick-Start gives you five quiet minutes with your child and questions to talk through.','Pruébalo en casa esta noche. La guía rápida te da cinco minutos tranquilos con tu hijo y preguntas para conversar.'),
    adult:T('Start with yourself first. The Quick-Start is a short, private self-reflection — a mirror, not a report.','Empieza por ti. La guía rápida es una autorreflexión breve y privado: un espejo, no un informe.'),
    leader:T('See what it is in five minutes. The Quick-Start lays out how it works and the decision it helps you make.','Conócelo en cinco minutos. La guía rápida explica cómo funciona y la decisión que te ayuda a tomar.'),
    outside:T('Bring it into your practice. The Quick-Start walks the consent-first, on-device flow for outside and community providers.','Llévalo a tu práctica. La guía rápida recorre el flujo con consentimiento primero y en el dispositivo para proveedores externos y comunitarios.'),
    faith:T('Use it in your community. The Quick-Start shows the universal core and the optional Faith Companion you turn on.','Úsalo en tu comunidad. La guía rápida muestra el núcleo universal y el Acompañante de fe opcional que tú activas.')
  };

  /* ---------- Quick-Start previews ---------- */
  var QS = {
    teacher:{lede:T('Hand out your first self-reflection in about five minutes. No login, no code.','Comparte tu primera autorreflexión en unos cinco minutos. Sin cuenta, sin código.'), steps:[
      [T('Open the site','Abre el sitio'),T('Go to architectureofgrace.com on a laptop, tablet, phone, or interactive board. It works offline once it has loaded.','Entra a architectureofgrace.com en una computadora, tableta, teléfono o pizarra interactiva. Funciona sin conexión una vez que ha cargado.')],
      [T('Build the class link','Crea el enlace de la clase'),T('Tap <b>Open the Educator Dashboard</b>, then <b>Set up → Distribute → Student self-reflection</b>. Choose a grade band and the options you want — it builds a link and QR code for the class.','Toca <b>Abre el Panel del Educador</b>, luego <b>Configurar → Distribuir → Autorreflexión del estudiante</b>. Elige el nivel de grado y las opciones que quieras: se crea un enlace y un código QR para la clase.')],
      [T('Let students answer','Deja que respondan'),T('Share the link or project the QR. Students can use their own devices or pass one around. By default, answers stay on each device — nothing leaves it unless your school turns on optional Google Sheet sync.','Comparte el enlace o proyecta el QR. Los estudiantes pueden usar sus propios dispositivos o pasar uno. De forma predeterminada, las respuestas se quedan en cada dispositivo: no se envía nada a menos que la escuela active la sincronización opcional con Google Sheets.')],
      [T('Read the group','Lee al grupo'),T('Back in the <b>Dashboard</b>, open Overview and Class trends. The class view is aggregate — but you can open any individual student, and if your school has sync turned on, that response is in the school’s Sheet too.','De vuelta en el <b>Panel</b>, abre Resumen y Tendencias de la clase. La vista de clase es agregada, pero puedes abrir a cualquier estudiante, y si tu escuela tiene la sincronización activada, esa respuesta también está en la Hoja de la escuela.')],
      [T('See the tiers','Ve los niveles'),T('Go to <b>Dashboard → MTSS Report</b> (gold button). No data yet? Tap <b>Load demo data</b> to explore it instantly.','Ve a <b>Panel → Informe MTSS</b> (botón dorado). ¿Aún sin datos? Toca <b>Cargar datos de ejemplo</b> para explorarlo al instante.')]
    ], close:T('Then fill out the Teacher Feedback Form — what confused a student or broke is the most useful thing you can tell us.','Luego completa el Formulario de comentarios del docente: lo que confundió a un estudiante o falló es lo más útil que puedes contarnos.')},
    specialist:{lede:T('A five-minute orientation for paraprofessionals, teacher aides, counselors, psychologists, social workers, SLPs, OTs, PTs, and behavior staff.','Una orientación de cinco minutos para paraprofesionales, auxiliares docentes, consejeros, psicólogos, trabajadores sociales, fonoaudiólogos, terapeutas ocupacionales, fisioterapeutas y personal de conducta.'), steps:[
      [T('Open the site','Abre el sitio'),T('Go to architectureofgrace.com (laptop, tablet, or phone). It works offline once loaded.','Entra a architectureofgrace.com (computadora, tableta o teléfono). Funciona sin conexión una vez cargado.')],
      [T('See how it connects','Mira cómo conecta'),T('Open <b>Explore → Framework</b> (top bar) — the four pillars and how one answer becomes a next step.','Abre <b>Explorar → Marco</b> (barra superior): los cuatro pilares y cómo una respuesta se convierte en un siguiente paso.')],
      [T('Run a self-reflection','Haz una autorreflexión'),T('<b>Start Here → Start the Self-Reflection</b> → grade band → Quick or Thorough, with a student you support — or use the class link a teacher already shares.','<b>Empieza aquí → Comienza la Autorreflexión</b> → nivel de grado → Rápido o Completo, con un estudiante que apoyas — o usa el enlace de clase que un docente ya comparte.')],
      [T('Open the MTSS report','Abre el informe MTSS'),T('Dashboard → <b>MTSS Report</b> (gold button) for tier movement and an auto summary. No data? Load demo data.','Panel → <b>Informe MTSS</b> (botón dorado) para ver el movimiento entre niveles y un resumen automático. ¿Sin datos? Carga datos de ejemplo.')],
      [T('Find the materials','Encuentra los materiales'),T('The Library maps lessons, anchor charts, and scenario cards to each need.','La Biblioteca relaciona lecciones, láminas y tarjetas de escenarios con cada necesidad.')]
    ], close:T('Then fill out the Specialists &amp; Support Staff Feedback Form.','Luego completa el Formulario de comentarios de especialistas y personal de apoyo.')},
    parent:{lede:T('Five quiet minutes with your child. Everything stays private on your device.','Cinco minutos tranquilos con tu hijo. Todo se queda privado en tu dispositivo.'), steps:[
      [T('Open the site','Abre el sitio'),T('Go to architectureofgrace.com on your phone, tablet, or computer — and if the school sent you a link or QR, it opens the right page directly.','Entra a architectureofgrace.com en tu teléfono, tableta o computadora — y si la escuela te envió un enlace o QR, abre la página correcta directamente.')],
      [T('Set up Family Mode','Configura el Modo Familia'),T('On <b>Start Here</b>, tap <b>Open Family Mode</b>, and add each child once.','En <b>Empieza aquí</b>, toca <b>Abrir el Modo Familia</b> y agrega a cada hijo una vez.')],
      [T('Check in together','Hagan la autorreflexión juntos'),T('Let your child answer honestly — there are no wrong answers.','Deja que tu hijo responda con sinceridad: no hay respuestas incorrectas.')],
      [T('Talk it through','Conversen'),T('Read the results together and use the conversation starters (you can print them).','Lean juntos los resultados y usen las preguntas para conversar (puedes imprimirlas).')],
      [T('Make it theirs','Hazlo suyo'),T('Nothing is sent anywhere. Use <b>Personalize</b> (sliders icon) to set the Word of Grace to Child or Teen.','No se envía nada. Usa <b>Personalizar</b> (icono de controles) para ajustar la Palabra de Gracia a Niño o Adolescente.')]
    ], close:T('Then fill out the Parent Feedback Form.','Luego completa el Formulario de comentarios de familias.')},
    adult:{lede:T('A private self-reflection for the adult in the room. About five minutes — a mirror, not a report.','Una autorreflexión privado para el adulto presente. Unos cinco minutos: un espejo, no un informe.'), steps:[
      [T('Open the site','Abre el sitio'),T('Go to architectureofgrace.com.','Entra a architectureofgrace.com.')],
      [T('Take it for yourself','Hazlo para ti'),T('On <b>Start Here</b>, tap <b>Start the Self-Reflection → For grown-ups &amp; teams</b>, then <b>Quick</b> or <b>Thorough</b>.','En <b>Empieza aquí</b>, toca <b>Comienza la Autorreflexión → Para adultos y equipos</b>, luego <b>Rápido</b> o <b>Completo</b>.')],
      [T('Answer honestly','Responde con sinceridad'),T('Nothing is shared; your responses stay on your device.','No se comparte nada; tus respuestas se quedan en tu dispositivo.')],
      [T('Catch your breath','Toma un respiro'),T('Read your results, and try a tool from the Tools menu (breathing, Take 5) if you’d like.','Lee tus resultados y prueba una herramienta del menú de Herramientas (respiración, Take 5) si quieres.')],
      [T('Make it yours','Hazlo tuyo'),T('Use <b>Personalize</b> (sliders icon) to set the Word of Grace to Adult — and pick an accent color from the <b>Accessibility</b> menu.','Usa <b>Personalizar</b> (icono de controles) para ajustar la Palabra de Gracia a Adulto, y elige un color de acento en el menú de <b>Accesibilidad</b>.')]
    ], close:T('Then fill out the Adult Feedback Form.','Luego completa el Formulario de comentarios de adultos.')},
    leader:{lede:T('A five-minute look built around the decision, not the classroom.','Una mirada de cinco minutos centrada en la decisión, no en el aula.'), steps:[
      [T('See the why','Ve el porqué'),T('Go to architectureofgrace.com and open <b>Explore → Framework</b> — the four pillars and how one answer becomes a next step.','Entra a architectureofgrace.com y abre <b>Explorar → Marco</b>: los cuatro pilares y cómo una respuesta se convierte en un siguiente paso.')],
      [T('Explore with demo data','Explora con datos de ejemplo'),T('Open the <b>Dashboard</b>, then <b>Load demo data</b> to see Overview and Class trends on a sample group.','Abre el <b>Panel</b> y luego <b>Cargar datos de ejemplo</b> para ver Resumen y Tendencias de la clase en un grupo de muestra.')],
      [T('Open the MTSS report','Abre el informe MTSS'),T('Dashboard → <b>MTSS Report</b> (gold button): Individual / Class / School-wide, tier movement, auto summary, CSV + print cover.','Panel → <b>Informe MTSS</b> (botón dorado): Individual / Clase / Toda la escuela, movimiento entre niveles, resumen automático, CSV + portada para imprimir.')],
      [T('Check the data story','Revisa el tema de los datos'),T('Privacy is on-device by default — no account, no login. Schools can optionally sync to their own Google Sheet. See Export &amp; data.','La privacidad es en el dispositivo por defecto: sin cuenta, sin inicio de sesión. Las escuelas pueden sincronizar opcionalmente con su propia Hoja de Google. Ve Exportar y datos.')],
      [T('Picture rollout','Imagina la implementación'),T('The <b>Distribute</b> tab makes a link or QR for a class — no code, no login. The Library and Store hold the curriculum.','La pestaña <b>Distribuir</b> crea un enlace o QR para una clase, sin código ni inicio de sesión. La Biblioteca y la Tienda contienen el currículo.')]
    ], close:T('Then share your read on reporting, privacy, and rollout — it’s what moves this from promising to adopted.','Luego comparte tu opinión sobre informes, privacidad e implementación: es lo que lleva esto de prometedor a adoptado.')},
    outside:{lede:T('For providers who work WITH a school or family but aren’t employed by one — private practice, outside OT/PT/SLP, and community clinics. Consent-first, on your own device.','Para proveedores que trabajan CON una escuela o familia pero no son empleados de ellas: consulta privada, terapeutas externos (OT/PT/fono) y clínicas comunitarias. Damos prioridad al consentimiento, en tu propio dispositivo.'), steps:[
      [T('Open the site','Abre el sitio'),T('Go to architectureofgrace.com on your laptop, tablet, or phone. It works offline once loaded.','Entra a architectureofgrace.com en tu computadora, tableta o teléfono. Funciona sin conexión una vez cargado.')],
      [T('Get consent first','Primero el consentimiento'),T('Because you’re outside the school, start with the family’s (or student’s) written consent to use a private workspace. Nothing is shared with anyone unless they choose to.','Como estás fuera de la escuela, empieza con el consentimiento por escrito de la familia (o del estudiante) para usar un espacio privado. No se comparte nada con nadie a menos que ellos lo decidan.')],
      [T('Open the Specialist workspace','Abre el espacio de especialista'),T('Dashboard → <b>View as: Specialist</b>. Add each client once; track sessions and scored screeners (PHQ-9 / GAD-7) with safety flags — all on this device.','Panel → <b>Ver como: Especialista</b>. Agrega a cada cliente una vez; registra sesiones y tamizajes puntuados (PHQ-9 / GAD-7) con señales de riesgo, todo en este dispositivo.')],
      [T('Bring two settings together','Une dos contextos'),T('If the family also uses Family Mode at home, the <b>Both</b> view overlays home + your sessions for a fuller picture in a parent meeting.','Si la familia también usa el Modo Familia en casa, la vista <b>Ambos</b> superpone el hogar y tus sesiones para un panorama más completo en una reunión con la familia.')],
      [T('Hand off cleanly','Entrega con claridad'),T('Export a CSV or print a cover to share progress with the family or, with their permission, the school team. You decide what leaves the device.','Exporta un CSV o imprime una portada para compartir el progreso con la familia o, con su permiso, con el equipo escolar. Tú decides qué sale del dispositivo.')]
    ], close:T('Then tell us how the consent-first, outside-provider flow fit your practice.','Luego cuéntanos cómo se ajustó a tu práctica este flujo para proveedores externos que da prioridad al consentimiento.')},
    faith:{lede:T('Use the universal self-reflection in a congregation, ministry, or faith-based school. The optional Faith Companion adds values language you can turn on — and off.','Usa la autorreflexión universal en una congregación, ministerio o escuela religiosa. El Acompañante de fe opcional añade un lenguaje de valores que puedes activar y desactivar.'), steps:[
      [T('Open the site','Abre el sitio'),T('Go to architectureofgrace.com on any device. No account, no login; answers stay on the device.','Entra a architectureofgrace.com en cualquier dispositivo. Sin cuenta, sin inicio de sesión; las respuestas se quedan en el dispositivo.')],
      [T('Know what stays universal','Conoce lo que permanece universal'),T('The four pillars — Identity, Self-Compassion, Forgiveness, Grace — and every lesson stay fully universal by default, so the tool works for everyone in your community.','Los cuatro pilares —Identidad, Autocompasión, Perdón, Gracia— y cada lección permanecen totalmente universales por defecto, para que la herramienta sirva a toda tu comunidad.')],
      [T('Turn on the Faith Companion (optional)','Activa el Acompañante de fe (opcional)'),T('Open the Faith Companion and toggle it <b>on</b> — it’s off until you choose it. It maps each pillar to virtue and values language a congregation can use, and gives you a printable handout.','Abre el Acompañante de fe y actívalo: está apagado hasta que tú lo elijas. Relaciona cada pilar con un lenguaje de virtudes y valores que una congregación puede usar, y te da un material imprimible.')],
      [T('Run it with your group','Hazlo con tu grupo'),T('Use it in a youth group, family ministry, or class. A leader can run a group check-in; nothing is collected or sent.','Úsalo en un grupo juvenil, ministerio familiar o clase. Un líder puede guiar un registro grupal; no se recoge ni se envía nada.')],
      [T('Keep it yours','Hazlo tuyo'),T('The companion lives only on your device and can be turned off anytime, returning everything to the universal core.','El acompañante vive solo en tu dispositivo y puede apagarse cuando quieras, devolviendo todo al núcleo universal.')]
    ], close:T('Then tell us whether the universal core + optional faith layer felt respectful and useful for your community.','Luego cuéntanos si el núcleo universal y la capa de fe opcional se sintieron respetuosos y útiles para tu comunidad.')}
  };

  /* ---------- scales ---------- */
  var S5 = [T('Strongly disagree','Muy en desacuerdo'),T('Disagree','En desacuerdo'),T('Neutral','Neutral'),T('Agree','De acuerdo'),T('Strongly agree','Muy de acuerdo')];
  var S3 = [T('Yes!','¡Sí!'),T('Kind of','Más o menos'),T('Not really','La verdad no')];
  var NA = T('N/A','N/A');
  var NA_HINT = T('didn’t use this / can’t say','no lo usé / no sabría decir');
  function L(rows){ return {type:'likert', scale:S5, rows:rows}; }
  var YMN = [T('Yes','Sí'),T('Maybe','Quizás'),T('No','No')];
  var LANGOPT = [T('English','Inglés'),T('Spanish','Español'),T('Both','Ambos')];
  var npsL = T('Not likely','Nada probable'), npsR = T('Extremely likely','Muy probable');
  var GRADES6 = ['K–2','3–5','6–8','9–10','11–12',T('Adults','Adultos')];
  var GRADES5 = ['K–2','3–5','6–8','9–10','11–12'];

  /* ---------- feedback forms ---------- */
  var FORMS = {
    qparticipant:{ title:T('Quick Feedback \u2014 Participant','Opini\u00f3n r\u00e1pida \u2014 Participante'),
      intro:T('How it felt for you. About two minutes \u2014 there are no wrong answers.','C\u00f3mo te result\u00f3. Unos dos minutos \u2014 no hay respuestas incorrectas.'),
      sections:[
        {title:T('You','T\u00fa'), fields:[
          {type:'text', id:'name', label:T('Name (optional)','Nombre (opcional)')},
          {type:'radio', id:'grade', label:T('Grade band','Nivel de grado'), opts:GRADES6}]},
        {title:T('Your experience','Tu experiencia'), fields:[
          L([T('The lessons helped me understand my feelings and what to do with them.','Las lecciones me ayudaron a entender mis sentimientos y qu\u00e9 hacer con ellos.'),
             T('I learned something I can actually use.','Aprend\u00ed algo que realmente puedo usar.'),
             T('I felt safe and respected during the lessons.','Me sent\u00ed seguro y respetado durante las lecciones.'),
             T('I would want to keep doing this.','Me gustar\u00eda seguir haciendo esto.')])]},
        {title:T('In your words','En tus palabras'), fields:[
          {type:'textarea', id:'helped', label:T('One thing that helped me','Una cosa que me ayud\u00f3')},
          {type:'textarea', id:'change', label:T('One thing I would change','Una cosa que cambiar\u00eda')}]}
      ]},
    qfacilitator:{ title:T('Quick Feedback \u2014 Facilitator','Opini\u00f3n r\u00e1pida \u2014 Facilitador'),
      intro:T('Your read on delivery and impact. About two minutes.','Tu opini\u00f3n sobre la implementaci\u00f3n y el impacto. Unos dos minutos.'),
      sections:[
        {title:T('About the group','Sobre el grupo'), fields:[
          {type:'text', id:'group', label:T('Grade band / group','Nivel / grupo')},
          {type:'text', id:'count', label:T('Approx. number of participants','N.\u00ba aprox. de participantes')}]},
        {title:T('Your experience','Tu experiencia'), fields:[
          L([T('The lessons were easy to deliver as written.','Las lecciones fueron f\u00e1ciles de impartir tal como est\u00e1n escritas.'),
             T('The closed-loop routing (the check-in score points to the right lesson) was clear and usable.','El enrutamiento de ciclo cerrado (la puntuaci\u00f3n del check-in indica la lecci\u00f3n correcta) fue claro y utilizable.'),
             T('I saw growth in my participants over the pilot.','Vi crecimiento en mis participantes durante el piloto.'),
             T('I would continue using this.','Continuar\u00eda usando esto.')])]},
        {title:T('Detail','Detalle'), fields:[
          {type:'text', id:'fidelity', label:T('Roughly what % of lessons did you deliver as designed?','\u00bfAproximadamente qu\u00e9 % de las lecciones impartiste seg\u00fan el dise\u00f1o?')},
          {type:'textarea', id:'win', label:T('Biggest win','Mayor logro')},
          {type:'textarea', id:'friction', label:T('Biggest friction / what to fix','Mayor fricci\u00f3n / qu\u00e9 corregir')}]}
      ]},
    teacher:{ title:T('Teacher &amp; Educator Feedback','Comentarios de docentes y educadores'),
      intro:T('Thank you for piloting the self-reflection with your students. About 4 minutes. Be candid — what confused a student or broke on your device is the most useful thing you can tell us. There are no wrong answers.','Gracias por probar la autorreflexión con tus estudiantes. Unos 4 minutos. Sé sincero: lo que confundió a un estudiante o falló en tu dispositivo es lo más útil que puedes contarnos. No hay respuestas incorrectas.'),
      sections:[
        {title:T('About you','Sobre ti'), fields:[
          {type:'text', id:'name', label:T('Name (optional)','Nombre (opcional)')},
          {type:'radio', id:'role', label:T('Your role','Tu rol'), opts:[T('Teacher','Docente'),T('Counselor','Consejero'),T('Aide / Para','Asistente'),T('Administrator','Administrador'),T('Other','Otro')]},
          {type:'radio', id:'grade', label:T('Grade band piloted','Nivel de grado del piloto'), opts:GRADES6},
          {type:'radio', id:'device', label:T('Device','Dispositivo'), opts:[T('Laptop','Portátil'),T('Tablet','Tableta'),T('Phone','Teléfono'),T('Interactive board','Pizarra interactiva')]}
        ]},
        {title:T('First impressions &amp; framework','Primeras impresiones y el marco'), fields:[
          L([T('The opening page made the purpose clear within a few seconds.','La página de inicio dejó claro el propósito en pocos segundos.'),T('It’s polished enough that I’d comfortably show it to a colleague or parent.','Está lo bastante pulida como para mostrarla con confianza a un colega o a una familia.'),T('The four pillars were easy to understand.','Los cuatro pilares fueron fáciles de entender.'),T('The “How one answer becomes growth” walkthrough made the closed-loop system clear.','El recorrido “Cómo una respuesta se convierte en crecimiento” dejó claro el sistema de ciclo cerrado.')])]},
        {title:T('The self-reflection','La autorreflexión'), fields:[
          L([T('The questions were age-appropriate for my students.','Las preguntas eran apropiadas para la edad de mis estudiantes.'),T('The length felt right (Quick vs Thorough modes worked well).','La duración se sintió adecuada (los modos Rápido y Completo funcionaron bien).'),T('The results read as kind and supportive, not as a scorecard.','Los resultados se leían amables y de apoyo, no como una calificación.')])]},
        {title:T('Calm &amp; Regulation Tools','Herramientas de calma y regulación'), fields:[
          {type:'checks', id:'tools', label:T('Which tools did you or your students actually try?','¿Qué herramientas probaron tú o tus estudiantes realmente?'), opts:[T('Paced Breathing','Respiración guiada'),T('Take 5 (hand tracing)','Take 5 (traza la mano)'),T('Tap Pad','Tablero táctil'),T('Calm-Down Jar','Frasco de la calma'),T('Weather Self-reflection','Autorreflexión del clima'),T('Emotion / Feelings Wheel','Rueda de emociones'),T('Grounding (5-4-3-2-1)','Anclaje (5-4-3-2-1)'),T('Other','Otra')]},
          L([T('At least one tool helped a student settle or refocus.','Al menos una herramienta ayudó a un estudiante a calmarse o reenfocarse.')])]},
        {title:T('Growth, goals &amp; home–school','Crecimiento, metas y hogar–escuela'), fields:[
          L([T('The One-student-over-time tab made a student’s growth across windows and years easy to read.','La pestaña Un estudiante con el tiempo facilitó leer el crecimiento de un estudiante entre periodos y años.'),T('Seeing a student’s school and home check-ins on one chart (the Both view) was valuable.','Ver los registros de escuela y hogar de un estudiante en un gráfico (la vista Ambos) fue valioso.'),T('The Goal Builder turned a check-in into a usable, relationship-centered IEP goal.','El Generador de metas convirtió un registro en una meta IEP útil y centrada en la relación.'),T('Monitoring progress on the same screen would save me time.','Monitorear el progreso en la misma pantalla me ahorraría tiempo.'),T('The “What helps me” picker on the results screen felt worthwhile for students.','El selector “Lo que me ayuda” en la pantalla de resultados fue valioso para los estudiantes.')])]},
        {title:T('Overall — did it help?','En general, ¿ayudó?'), fields:[
          {type:'radio', id:'again', label:T('Would you use this again?','¿Lo usarías de nuevo?'), opts:YMN},
          {type:'nps', id:'nps', label:T('How likely are you to recommend it to a colleague?','¿Qué tan probable es que se lo recomiendes a un colega?'), left:npsL, right:npsR},
          L([T('It led to a real next step — a lesson, a conversation, or a plan.','Llevó a un siguiente paso real: una lección, una conversación o un plan.')])]},
        {title:T('In your own words','En tus palabras'), fields:[
          {type:'textarea', id:'broke', label:T('One thing that confused a student or broke:','Una cosa que confundió a un estudiante o falló:')},
          {type:'textarea', id:'safety', label:T('Any wellbeing or safety concern we should know about? (For anything urgent about a specific student, follow your school’s safeguarding protocol first.)','¿Alguna preocupación de bienestar o seguridad que debamos saber? (Para algo urgente sobre un estudiante específico, sigue primero el protocolo de protección de tu escuela.)')}
        ]}
      ]},

    specialist:{ title:T('Specialist &amp; Support Staff Feedback','Comentarios de especialistas y personal de apoyo'),
      intro:T('Thank you for piloting the self-reflection with the students you support. About 4 minutes. Your read on fit, accessibility, and follow-through is especially valuable.','Gracias por probar la autorreflexión con los estudiantes que apoyas. Unos 4 minutos. Tu opinión sobre el ajuste, la accesibilidad y el seguimiento es especialmente valiosa.'),
      sections:[
        {title:T('About you','Sobre ti'), fields:[
          {type:'text', id:'name', label:T('Name (optional)','Nombre (opcional)')},
          {type:'radio', id:'role', label:T('Your role','Tu rol'), opts:[T('School Counselor','Consejero escolar'),T('School Psychologist','Psicólogo escolar'),T('Social Worker','Trabajador social'),T('SLP','Fonoaudiólogo'),T('OT','Terapeuta ocupacional'),T('PT','Fisioterapeuta'),T('Behavior Specialist','Especialista en conducta'),T('Special Educator','Educador especial'),T('Administrator','Administrador'),T('Other','Otro')]},
          {type:'radio', id:'grade', label:T('Grade band piloted','Nivel de grado del piloto'), opts:GRADES6},
          {type:'radio', id:'device', label:T('Device','Dispositivo'), opts:[T('Laptop','Portátil'),T('Tablet','Tableta'),T('Phone','Teléfono'),T('Board','Pizarra')]}
        ]},
        {title:T('First impressions &amp; framework','Primeras impresiones y el marco'), fields:[
          L([T('The opening page made the purpose clear within a few seconds.','La página de inicio dejó claro el propósito en pocos segundos.'),T('It’s polished enough that I’d comfortably show it to a colleague or parent.','Está lo bastante pulida como para mostrarla con confianza a un colega o a una familia.'),T('The four pillars (Identity, Self-Compassion, Forgiveness, Grace) were easy to understand.','Los cuatro pilares (Identidad, Autocompasión, Perdón, Gracia) fueron fáciles de entender.'),T('The “How one answer becomes growth” walkthrough made the closed-loop system clear.','El recorrido “Cómo una respuesta se convierte en crecimiento” dejó claro el sistema de ciclo cerrado.')])]},
        {title:T('The self-reflection','La autorreflexión'), fields:[
          L([T('The questions were age-appropriate for the students I support.','Las preguntas eran apropiadas para la edad de los estudiantes que apoyo.'),T('The length felt right (Quick vs Thorough modes).','La duración se sintió adecuada (los modos Rápido y Completo).'),T('The results read as kind and supportive, not as a scorecard.','Los resultados se leían amables y de apoyo, no como una calificación.')])]},
        {title:T('Calm &amp; Regulation Tools','Herramientas de calma y regulación'), fields:[
          {type:'checks', id:'tools', label:T('Which tools were tried?','¿Qué herramientas se probaron?'), opts:[T('Paced Breathing','Respiración guiada'),T('Take 5','Take 5'),T('Tap Pad','Tablero táctil'),T('Calm-Down Jar','Frasco de la calma'),T('Weather Self-reflection','Autorreflexión del clima'),T('Emotion/Feelings Wheel','Rueda de emociones'),T('Grounding (5-4-3-2-1)','Anclaje (5-4-3-2-1)'),T('PECS / Show-to-Teacher','PECS / Mostrar al docente')]},
          L([T('At least one tool helped a student settle or refocus.','Al menos una herramienta ayudó a un estudiante a calmarse o reenfocarse.')])]},
        {title:T('Goals, growth &amp; home–school','Metas, crecimiento y hogar–escuela'), fields:[
          L([T('The Goal Builder produced a goal and objectives I could actually put in an IEP.','El Generador de metas produjo una meta y objetivos que realmente podría poner en un IEP.'),T('Objectives by quarter, trimester, or semester matched how we write goals.','Los objetivos por trimestre, cuatrimestre o semestre coincidieron con cómo escribimos metas.'),T('The progress monitor (movement toward the target band) is something I’d use.','El monitor de progreso (movimiento hacia la banda meta) es algo que usaría.'),T('The Both view (school + home together) added a fuller picture for a meeting.','La vista Ambos (escuela + hogar juntos) aportó un panorama más completo para una reunión.'),T('Linking a school code to a home member as the same child was clear.','Vincular un código escolar con un miembro del hogar como el mismo niño fue claro.')])]},
        {title:T('Overall — did it help?','En general, ¿ayudó?'), fields:[
          {type:'radio', id:'again', label:T('Would you use this again?','¿Lo usarías de nuevo?'), opts:YMN},
          {type:'nps', id:'nps', label:T('How likely are you to recommend it to a colleague?','¿Qué tan probable es que se lo recomiendes a un colega?'), left:npsL, right:npsR},
          L([T('It led to a real next step — a lesson, conversation, or plan.','Llevó a un siguiente paso real: una lección, conversación o plan.')])]},
        {title:T('In your own words','En tus palabras'), fields:[
          {type:'textarea', id:'broke', label:T('One thing that confused a student or broke:','Una cosa que confundió a un estudiante o falló:')},
          {type:'textarea', id:'change', label:T('One thing you would add or change (especially for accessibility or MTSS fit):','Una cosa que agregarías o cambiarías (especialmente para accesibilidad o ajuste con MTSS):')},
          {type:'textarea', id:'safety', label:T('Any wellbeing or safety concern we should know about?','¿Alguna preocupación de bienestar o seguridad que debamos saber?')}]}
      ]},

    parent:{ title:T('Parent &amp; Caregiver Feedback','Comentarios de familias y cuidadores'),
      intro:T('Your child used the self-reflection (on their own or together with you). About 4 minutes. Be candid — what confused your child or broke is the most useful thing you can tell us.','Tu hijo usó la autorreflexión (solo o contigo). Unos 4 minutos. Sé sincero: lo que confundió a tu hijo o falló es lo más útil que puedes contarnos.'),
      sections:[
        {title:T('About you','Sobre ti'), fields:[
          {type:'text', id:'name', label:T('Name (optional)','Nombre (opcional)')},
          {type:'radio', id:'grade', label:T('Your child’s grade band','Nivel de grado de tu hijo'), opts:GRADES5},
          {type:'radio', id:'how', label:T('How was it done?','¿Cómo se hizo?'), opts:[T('Child alone','Solo el niño'),T('Together','Juntos'),T('Mostly me reading','Sobre todo yo leyendo')]},
          {type:'radio', id:'device', label:T('Device','Dispositivo'), opts:[T('Laptop','Portátil'),T('Tablet','Tableta'),T('Phone','Teléfono')]}]},
        {title:T('First impressions &amp; framework','Primeras impresiones y el marco'), fields:[
          L([T('The opening page made the purpose clear within a few seconds.','La página de inicio dejó claro el propósito en pocos segundos.'),T('It looked polished and safe to hand to my child.','Se veía pulida y segura para dársela a mi hijo.'),T('The four pillars (Identity, Self-Compassion, Forgiveness, Grace) were easy to understand.','Los cuatro pilares (Identidad, Autocompasión, Perdón, Gracia) fueron fáciles de entender.')])]},
        {title:T('The self-reflection','La autorreflexión'), fields:[
          L([T('My child understood the questions.','Mi hijo entendió las preguntas.'),T('The length felt right for my child.','La duración se sintió adecuada para mi hijo.'),T('The results read as kind, not as a scorecard.','Los resultados se leían amables, no como una calificación.')])]},
        {title:T('Calm &amp; Regulation Tools','Herramientas de calma y regulación'), fields:[
          {type:'checks', id:'tools', label:T('Which tools were tried?','¿Qué herramientas se probaron?'), opts:[T('Paced Breathing','Respiración guiada'),T('Take 5','Take 5'),T('Tap Pad','Tablero táctil'),T('Calm-Down Jar','Frasco de la calma'),T('Weather Self-reflection','Autorreflexión del clima'),T('Emotion/Feelings Wheel','Rueda de emociones'),T('Grounding (5-4-3-2-1)','Anclaje (5-4-3-2-1)')]},
          L([T('A tool helped my child settle or refocus.','Una herramienta ayudó a mi hijo a calmarse o reenfocarse.')])]},
        {title:T('Seeing growth &amp; home–school','Ver el crecimiento y hogar–escuela'), fields:[
          L([T('Family Mode let me see my child’s growth over time clearly.','El Modo Familia me dejó ver el crecimiento de mi hijo con el tiempo de forma clara.'),T('Seeing my child’s home and school check-ins on one chart would help me.','Ver los registros de hogar y escuela de mi hijo en un gráfico me ayudaría.'),T('The “What helps me” picker (saving what calms my child) felt valuable.','El selector “Lo que me ayuda” (guardar lo que calma a mi hijo) fue valioso.'),T('I’d feel comfortable sharing the growth view in a conference with the school.','Me sentiría cómodo compartiendo la vista de crecimiento en una reunión con la escuela.')])]},
        {title:T('Overall — did it help?','En general, ¿ayudó?'), fields:[
          {type:'radio', id:'again', label:T('Would you use this again?','¿Lo usarías de nuevo?'), opts:YMN},
          {type:'nps', id:'nps', label:T('How likely are you to recommend it to another parent?','¿Qué tan probable es que se lo recomiendes a otra familia?'), left:npsL, right:npsR},
          L([T('It opened a helpful conversation at home.','Abrió una conversación útil en casa.')])]},
        {title:T('In your own words','En tus palabras'), fields:[
          {type:'textarea', id:'broke', label:T('One thing that confused your child or broke:','Una cosa que confundió a tu hijo o falló:')},
          {type:'textarea', id:'safety', label:T('Any wellbeing or safety concern we should know about? (For anything urgent, please contact your child’s school or a professional first.)','¿Alguna preocupación de bienestar o seguridad que debamos saber? (Para algo urgente, contacta primero a la escuela de tu hijo o a un profesional.)')}]}
      ]},

    adult:{ title:T('Adult Self-Use Feedback','Comentarios de uso personal (adultos)'),
      intro:T('You used the self-reflection for yourself. About 3 minutes. Be candid; this is to improve the tool, not to evaluate you.','Usaste la autorreflexión para ti. Unos 3 minutos. Sé sincero; esto es para mejorar la herramienta, no para evaluarte.'),
      sections:[
        {title:T('About you','Sobre ti'), fields:[
          {type:'text', id:'name', label:T('Name (optional)','Nombre (opcional)')},
          {type:'radio', id:'mainly', label:T('This is mainly','Esto es principalmente'), opts:[T('Just for me','Solo para mí'),T('As an educator','Como educador'),T('As a caregiver','Como cuidador'),T('As a professional','Como profesional')]},
          {type:'radio', id:'device', label:T('Device','Dispositivo'), opts:[T('Laptop','Portátil'),T('Tablet','Tableta'),T('Phone','Teléfono')]}]},
        {title:T('First impressions &amp; framework','Primeras impresiones y el marco'), fields:[
          L([T('The opening page made the purpose clear within a few seconds.','La página de inicio dejó claro el propósito en pocos segundos.'),T('It felt calm and trustworthy, and it felt like it was for someone like me.','Se sintió tranquila y confiable, y como si fuera para alguien como mí.'),T('The framework (Identity, Self-Compassion, Forgiveness, Grace) was easy to understand.','El marco (Identidad, Autocompasión, Perdón, Gracia) fue fácil de entender.')])]},
        {title:T('The self-reflection','La autorreflexión'), fields:[
          L([T('The questions felt relevant to my real life.','Las preguntas se sintieron relevantes para mi vida real.'),T('The length felt right.','La duración se sintió adecuada.'),T('The results felt accurate to me.','Los resultados me parecieron precisos.'),T('The results felt kind, not judgmental.','Los resultados se sintieron amables, no críticos.')])]},
        {title:T('Calm &amp; Regulation Tools','Herramientas de calma y regulación'), fields:[
          {type:'checks', id:'tools', label:T('Which tools were tried?','¿Qué herramientas se probaron?'), opts:[T('Paced Breathing','Respiración guiada'),T('Take 5','Take 5'),T('Tap Pad','Tablero táctil'),T('Calm-Down Jar','Frasco de la calma'),T('Weather Self-reflection','Autorreflexión del clima'),T('Emotion/Feelings Wheel','Rueda de emociones'),T('Grounding (5-4-3-2-1)','Anclaje (5-4-3-2-1)'),T('Other','Otra')]},
          L([T('At least one tool helped me settle or refocus.','Al menos una herramienta me ayudó a calmarme o reenfocarme.')])]},
        {title:T('Tracking &amp; anchors','Seguimiento y anclas'), fields:[
          L([T('Seeing my own trajectory across check-ins over time was meaningful.','Ver mi propia trayectoria a través de los registros con el tiempo fue significativo.'),T('The “What helps me” anchor (saving what steadies me) was worthwhile.','El ancla “Lo que me ayuda” (guardar lo que me estabiliza) valió la pena.'),T('The results “path from here” pointed me to a useful next step.','El “camino desde aquí” en los resultados me señaló un siguiente paso útil.')])]},
        {title:T('Overall — did it help?','En general, ¿ayudó?'), fields:[
          {type:'radio', id:'again', label:T('Would you use this again?','¿Lo usarías de nuevo?'), opts:YMN},
          {type:'nps', id:'nps', label:T('How likely are you to recommend it to someone you know?','¿Qué tan probable es que se lo recomiendes a alguien que conoces?'), left:npsL, right:npsR},
          L([T('This helped me understand myself a little better.','Esto me ayudó a entenderme un poco mejor.')])]},
        {title:T('In your own words','En tus palabras'), fields:[
          {type:'textarea', id:'change', label:T('One thing you would add or change:','Una cosa que agregarías o cambiarías:')}]}
      ]},

    child:{ title:T('How Was It For You?','¿Cómo te fue?'), subKey:'kids',
      intro:T('Thanks for trying this! Tell us what you thought. There are no wrong answers — just be honest.','¡Gracias por probarlo! Cuéntanos qué pensaste. No hay respuestas incorrectas: solo sé sincero.'),
      sections:[
        {title:T('About you','Sobre ti'), fields:[
          {type:'text', id:'grade', label:T('My grade','Mi grado')},
          {type:'radio', id:'where', label:T('I did this','Hice esto'), opts:[T('at school','en la escuela'),T('at home','en casa')]}]},
        {title:T('How did it make you feel?','¿Cómo te hizo sentir?'), fields:[
          {type:'face', id:'feel', label:T('Pick the face that fits best:','Elige la carita que mejor te quede:'), opts:[{em:'🙂',t:T('Good','Bien')},{em:'😐',t:T('Okay','Más o menos')},{em:'🙁',t:T('Not great','No muy bien')}]}]},
        {title:T('A few quick questions','Unas preguntas rápidas'), fields:[
          {type:'likert', scale:S3, rows:[T('Was it easy to use?','¿Fue fácil de usar?'),T('Did a calm tool help you feel better?','¿Una herramienta de calma te ayudó a sentirte mejor?'),T('Would you want to use it again?','¿Te gustaría usarlo de nuevo?')]}]},
        {title:T('Which tool did you like best?','¿Qué herramienta te gustó más?'), fields:[
          {type:'radio', id:'tool', label:T('Pick one:','Elige una:'), opts:[T('Breathing circle','Círculo de respiración'),T('Trace your hand (Take 5)','Traza tu mano (Take 5)'),T('Tap pad','Tablero táctil'),T('Calm-down jar','Frasco de la calma'),T('Weather self-reflection','Autorreflexión del clima'),T('Feelings wheel','Rueda de emociones')]}]},
        {title:T('Tell us more','Cuéntanos más'), fields:[
          {type:'textarea', id:'liked', label:T('One thing you liked:','Una cosa que te gustó:')}]}
      ]},

    leader:{ title:T('Leadership Feedback','Comentarios de liderazgo'),
      intro:T('Thank you for taking a leadership look at the pilot. About 3 minutes. Your read on reporting, privacy, and rollout is what moves this from promising to adopted.','Gracias por dar una mirada de liderazgo al piloto. Unos 3 minutos. Tu opinión sobre informes, privacidad e implementación es lo que lleva esto de prometedor a adoptado.'),
      sections:[
        {title:T('About you','Sobre ti'), fields:[
          {type:'text', id:'name', label:T('Name (optional)','Nombre (opcional)')},
          {type:'radio', id:'role', label:T('Your role','Tu rol'), opts:[T('Principal / AP','Director / Subdirector'),T('Curriculum Director','Director de currículo'),T('SEL Director','Director de SEL'),T('MTSS Coordinator','Coordinador de MTSS'),T('Superintendent / Cabinet','Superintendente / Gabinete'),T('Other','Otro')]},
          {type:'radio', id:'size', label:T('Approx. size','Tamaño aproximado'), opts:[T('1 school','1 escuela'),T('2–5 schools','2–5 escuelas'),T('District-wide','Todo el distrito')]}]},
        {title:T('Reporting, privacy &amp; rollout','Informes, privacidad e implementación'), fields:[
          L([T('I could see how one answer becomes a next step (flag → the right lesson).','Pude ver cómo una respuesta se convierte en un siguiente paso (señal → la lección adecuada).'),T('The MTSS Report (Individual / Class / School-wide) fits how we tier.','El Informe MTSS (Individual / Clase / Toda la escuela) encaja con cómo organizamos los niveles.'),T('Leadership seeing only aggregate trends — never individual responses — is the right call.','Que el liderazgo vea solo tendencias agregadas, nunca respuestas individuales, es la decisión correcta.'),T('On-device-by-default privacy is clear and reassuring.','La privacidad en el dispositivo por defecto es clara y tranquilizadora.'),T('The no-code link / QR distribution looks feasible for our staff.','La distribución por enlace / QR sin código parece viable para nuestro personal.')])]},
        {title:T('Growth, goals &amp; the closed loop','Crecimiento, metas y el ciclo cerrado'), fields:[
          L([T('The multi-year Trajectory shows growth in a way our teams would act on.','La Trayectoria plurianual muestra el crecimiento de una forma sobre la que nuestros equipos actuarían.'),T('The Goal Builder (relationship-centered IEP goals + progress monitoring) fits our process.','El Generador de metas (metas IEP centradas en la relación + monitoreo) encaja con nuestro proceso.'),T('The home–school Both view supports real family partnership.','La vista Ambos hogar–escuela apoya una verdadera alianza con la familia.'),T('Connecting our OWN Google Sheet, with a clear Connected confirmation, addresses our data-ownership needs.','Conectar NUESTRA propia Hoja de Google, con una confirmación clara de Conectado, atiende nuestras necesidades de propiedad de los datos.')])]},
        {title:T('Overall','En general'), fields:[
          {type:'radio', id:'again', label:T('Would you move toward a pilot?','¿Avanzarías hacia un piloto?'), opts:[T('Yes','Sí'),T('Maybe','Quizás'),T('Not yet','Aún no')]},
          {type:'nps', id:'nps', label:T('How likely are you to recommend exploring this to a peer leader?','¿Qué tan probable es que recomiendes explorar esto a otro líder?'), left:npsL, right:npsR}]},
        {title:T('In your own words','En tus palabras'), fields:[
          {type:'textarea', id:'concern', label:T('Biggest question or concern before adopting:','¿Tu mayor duda o preocupación antes de adoptarlo?')},
          {type:'textarea', id:'need', label:T('What would you need to see to say yes?','¿Qué necesitarías ver para decir que sí?')}]}
      ]},

    outside:{ title:T('Outside &amp; Community Provider Feedback','Comentarios de proveedores externos y comunitarios'),
      intro:T('Thank you for using the self-reflection in your practice. About 3–4 minutes. Your read on consent, privacy, and fit alongside your own tools is especially valuable.','Gracias por usar la autorreflexión en tu práctica. Unos 3–4 minutos. Tu opinión sobre el consentimiento, la privacidad y el ajuste junto a tus propias herramientas es especialmente valiosa.'),
      sections:[
        {title:T('About you','Sobre ti'), fields:[
          {type:'text', id:'name', label:T('Name (optional)','Nombre (opcional)')},
          {type:'radio', id:'role', label:T('Your setting','Tu contexto'), opts:[T('Private-practice therapist','Terapeuta en consulta privada'),T('Outside OT / PT','OT / PT externo'),T('Outside SLP','Fonoaudiólogo externo'),T('Community clinic','Clínica comunitaria'),T('Tutoring / learning center','Centro de tutoría / aprendizaje'),T('Other','Otro')]}]},
        {title:T('Consent, privacy &amp; fit','Consentimiento, privacidad y ajuste'), fields:[
          L([T('Getting consent first, before any data, matched how I have to work outside a school.','Obtener el consentimiento primero, antes de cualquier dato, coincidió con cómo debo trabajar fuera de una escuela.'),T('On-device-by-default privacy fit my confidentiality obligations.','La privacidad en el dispositivo por defecto se ajustó a mis obligaciones de confidencialidad.'),T('The Specialist workspace (sessions, scored screeners, safety flags) was useful alongside my own tools.','El espacio de especialista (sesiones, tamizajes puntuados, señales de riesgo) fue útil junto a mis propias herramientas.'),T('I could hand off progress to a family or school cleanly, sharing only what I chose.','Pude entregar el progreso a una familia o escuela con claridad, compartiendo solo lo que elegí.')])]},
        {title:T('Overall','En general'), fields:[
          {type:'radio', id:'again', label:T('Would you use this again in your practice?','¿Lo usarías de nuevo en tu práctica?'), opts:YMN},
          {type:'nps', id:'nps', label:T('How likely are you to recommend it to a colleague?','¿Qué tan probable es que se lo recomiendes a un colega?'), left:npsL, right:npsR},
          {type:'textarea', id:'change', label:T('One thing you would add or change for outside providers:','Una cosa que agregarías o cambiarías para proveedores externos:')}]}
      ]},

    faith:{ title:T('Faith-Based &amp; Ministry Feedback','Comentarios de organizaciones de fe y ministerios'),
      intro:T('Thank you for trying the self-reflection in your community. About 3 minutes. We especially want to know whether the universal core and the optional Faith Companion felt respectful and useful.','Gracias por probar la autorreflexión en tu comunidad. Unos 3 minutos. Queremos saber sobre todo si el núcleo universal y el Acompañante de fe opcional se sintieron respetuosos y útiles.'),
      sections:[
        {title:T('About you','Sobre ti'), fields:[
          {type:'text', id:'name', label:T('Name (optional)','Nombre (opcional)')},
          {type:'radio', id:'role', label:T('Your community','Tu comunidad'), opts:[T('Church / congregation','Iglesia / congregación'),T('Ministry','Ministerio'),T('Faith-based school','Escuela religiosa'),T('Youth group','Grupo juvenil'),T('Other','Otro')]}]},
        {title:T('The universal core &amp; optional faith layer','El núcleo universal y la capa de fe opcional'), fields:[
          L([T('The universal core worked well for everyone in our community.','El núcleo universal funcionó bien para toda nuestra comunidad.'),T('It was clear that the Faith Companion is optional and off until we turn it on.','Quedó claro que el Acompañante de fe es opcional y está apagado hasta que lo activemos.'),T('The pillar-to-values mapping (Identity, Self-Compassion, Forgiveness, Grace) felt respectful and authentic.','La relación de pilares con valores (Identidad, Autocompasión, Perdón, Gracia) se sintió respetuosa y auténtica.'),T('The printable companion handout was something we would actually use.','El material imprimible del acompañante es algo que de verdad usaríamos.')])]},
        {title:T('Overall','En general'), fields:[
          {type:'radio', id:'again', label:T('Would you use this again in your community?','¿Lo usarías de nuevo en tu comunidad?'), opts:YMN},
          {type:'textarea', id:'change', label:T('One thing you would add or change for faith communities:','Una cosa que agregarías o cambiarías para comunidades de fe:')}]}
      ]}
  };

  /* ---------- helpers ---------- */
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function deTag(s){ return String(s).replace(/&mdash;/g,'—').replace(/&amp;/g,'&').replace(/&rarr;/g,'→').replace(/&[a-z]+;/g,' ').replace(/<[^>]+>/g,''); }
  var $ov = function(){ return document.getElementById('ppmOverlay'); };
  window.__ppOpen = null;

  /* ---------- build cards ---------- */
  function buildCards(){
    var html = CARDS.map(function(c){
      var qsBtns = (c.qs || QS[c.key]) ? (
        '<div class="pp-asset"><div class="pp-asset-lab">'+tx(UI.quickstart)+'</div><div class="pp-btns">'+
          '<button type="button" class="pp-b pp-b-ghost" onclick="aogPilotPreview(\''+c.key+'\')">'+
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> '+tx(UI.preview)+'</button>'+
          (c.qs ? '<a class="pp-b pp-b-navy" href="'+PDIR+c.qs+'" target="_blank" rel="noopener">'+
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg> '+tx(UI.pdf)+'</a>' : '')+
        '</div></div>') : '';
      var fbBtns = '<div class="pp-asset"><div class="pp-asset-lab">'+tx(UI.feedback)+'</div><div class="pp-btns">'+
          '<button type="button" class="pp-b pp-b-gold" onclick="aogPilotForm(\''+c.form+'\')">'+
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg> '+tx(UI.fill)+'</button>'+
          (c.fb ? '<a class="pp-b pp-b-ghost" href="'+PDIR+c.fb+'" target="_blank" rel="noopener">'+
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg> '+tx(UI.printpdf)+'</a>' : '')+
        '</div></div>';
      var note = c.note ? '<p class="pp-note">'+tx(c.note)+'</p>' : '';
      return '<div class="pp-card">'+
        '<div class="pp-card-top"><span class="pp-ic">'+(IC[c.key]||'')+'</span><h3>'+tx(c.title)+'</h3></div>'+
        '<p class="pp-who">'+tx(c.who)+'</p>'+ qsBtns + fbBtns + note +
      '</div>';
    }).join('');
    var g=document.getElementById('ppGrid'); if(g) g.innerHTML=html;
    // Start Here: Quick-Start-only cards. Direct PDF links (no modal) so they work off the Pilot screen.
    var gs=document.getElementById('ppGridStart');
    if(gs){
      /* Start Here leads with the four school roles, in this order. The rest are
         hidden behind AOG_STARTHERE_EXTRAS_ENABLED (see the switch block below);
         the Pilot screen's own grid above still renders every role. */
      var SH_ORDER  = ['leader','teacher','parent','specialist'];
      var SH_EXTRAS = ['outside','adult','child','faith'];
      var shKeys = SH_ORDER.concat(window.AOG_STARTHERE_EXTRAS_ENABLED ? SH_EXTRAS : []);
      var shCards = shKeys.map(function(k){
        for (var i=0;i<CARDS.length;i++){ if(CARDS[i].key===k) return CARDS[i]; }
        return null;
      }).filter(function(c){ return c && c.qs; });
      gs.innerHTML = shCards.map(function(c){
        return '<div class="pp-card">'+
          '<div class="pp-card-top"><span class="pp-ic">'+(IC[c.key]||'')+'</span><h3>'+tx(c.title)+'</h3></div>'+
          '<p class="pp-who">'+tx(SHWHO[c.key]||c.who)+'</p>'+
          '<div class="pp-asset"><div class="pp-btns">'+
            '<a class="pp-b pp-b-navy" href="'+PDIR+((window.lang==='es'&&SHQS[c.key])?SHQS[c.key].replace('.pdf','-ES.pdf'):(SHQS[c.key]||c.qs))+'" target="_blank" rel="noopener">'+
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg> '+tx(UI.dlQs)+'</a>'+
          '</div></div>'+
        '</div>';
      }).join('');
    }
  }

  /* ---------- modal ---------- */
  var lastFocus=null;
  function openModal(sub, title){
    var ov=$ov(); if(!ov) return;
    document.getElementById('ppmSub').textContent=sub;
    document.getElementById('ppmTitle').innerHTML=title;
    lastFocus=document.activeElement; ov.classList.add('open'); document.body.style.overflow='hidden'; ov.scrollTop=0;
  }
  window.aogPilotCloseModal=function(){
    var ov=$ov(); if(!ov) return;
    ov.classList.remove('open'); document.body.style.overflow=''; document.getElementById('ppmBody').innerHTML='';
    window.__ppOpen=null;
    if(lastFocus&&lastFocus.focus){ try{lastFocus.focus();}catch(e){} }
  };
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ var ov=$ov(); if(ov&&ov.classList.contains('open')) window.aogPilotCloseModal(); } });
  document.addEventListener('click',function(e){ var ov=$ov(); if(ov&&ov.classList.contains('open')&&e.target===ov) window.aogPilotCloseModal(); });

  /* ---------- quick-start preview ---------- */
  window.aogPilotPreview=function(key){
    var c=null,i; for(i=0;i<CARDS.length;i++){ if(CARDS[i].key===key) c=CARDS[i]; }
    var q=QS[key]; if(!q||!c) return;
    window.__ppOpen={type:'preview', key:key};
    var steps=q.steps.map(function(s){ return '<li><b>'+tx(s[0])+'</b><br>'+tx(s[1])+'</li>'; }).join('');
    var tools=(
      '<div style="margin:16px 0 4px;padding:13px 16px;background:rgba(10,30,51,.05);border-left:3.5px solid var(--gold);border-radius:8px;">'+
        '<div style="font-weight:700;color:var(--navy);font-size:13.5px;margin-bottom:4px;">'+tx(T('Pair it with the Calm &amp; Regulation Tools','Combínalo con las Herramientas de calma y regulación'))+'</div>'+
        '<div style="font-size:13px;color:var(--ink-soft,#46506E);line-height:1.5;">'+tx(T(
          'Under <b>Explore → Calm &amp; Regulation Tools</b> you’ll find short, guided resets — breathing, Take 5, 5-4-3-2-1 grounding, movement, and more. They’re the bridge between noticing and doing: <b>Right Now</b> opens straight into the matching tool for the moment, and when the <b>Self-Reflection</b> shows a domain running low, these are the one- or two-minute resets that help someone settle before getting back to learning.',
          'En <b>Explorar → Herramientas de calma y regulación</b> encontrarás pausas breves y guiadas: respiración, Take 5, anclaje 5-4-3-2-1, movimiento y más. Son el puente entre notar y actuar: <b>Ahora mismo</b> abre directo la herramienta adecuada para el momento, y cuando el <b>Autorreflexión</b> muestra un dominio bajo, son las pausas de uno o dos minutos que ayudan a calmarse antes de volver a aprender.'
        ))+'</div></div>'
    );
    var privacy=(key==='parent') ? (
      '<div style="margin:16px 0 4px;padding:13px 16px;background:rgba(10,30,51,.05);border-left:3.5px solid var(--navy);border-radius:8px;">'+
        '<div style="font-weight:700;color:var(--navy);font-size:13.5px;margin-bottom:4px;">'+tx(T('Your family’s privacy','La privacidad de tu familia'))+'</div>'+
        '<div style="font-size:13px;color:var(--ink-soft,#46506E);line-height:1.5;">'+tx(T(
          'Everything stays on your device. Your child’s answers, written reflections, and results are saved only in this browser, on this device — <b>no account, no login, no tracking.</b> Nothing is sent to us or anyone else. The optional Google Sheet sync is a school-only feature and is <b>never used in Family Mode.</b> You can clear everything at any time.',
          'Todo se queda en tu dispositivo. Las respuestas de tu hijo, las reflexiones escritas y los resultados se guardan solo en este navegador, en este dispositivo: <b>sin cuenta, sin inicio de sesión, sin seguimiento.</b> No se envía nada a nosotros ni a nadie más. La sincronización opcional con Google Sheets es solo para escuelas y <b>nunca se usa en el Modo Familia.</b> Puedes borrar todo en cualquier momento.'
        ))+'</div></div>'
    ) : '';
    var html='<div class="ppm-prev">'+
      '<p class="lede">'+tx(q.lede)+'</p><ol>'+steps+'</ol>'+
      '<p class="lede" style="font-size:13.5px;color:var(--ink-soft,#46506E);">'+tx(q.close)+'</p>'+
      tools+
      privacy+
      '<div class="ppm-prevfoot">'+
        (c.qs ? '<a class="pp-b pp-b-navy" href="'+PDIR+c.qs+'" target="_blank" rel="noopener">'+tx(UI.dlQs)+'</a>' : '')+
        (key==='faith' ? '<button type="button" class="pp-b pp-b-navy" onclick="aogPilotCloseModal(); if(window.aogFaithOpen)window.aogFaithOpen();">'+tx(T('Open the Faith Companion','Abrir el Acompañante de fe'))+'</button>' : '')+
        (key==='outside' ? '<button type="button" class="pp-b pp-b-navy" onclick="aogPilotCloseModal(); try{if(typeof openAdmin===\'function\')openAdmin();}catch(e){} try{if(typeof aogSetDashRole===\'function\')aogSetDashRole(\'specialist\');}catch(e){}">'+tx(T('Open the Specialist workspace','Abrir el espacio de especialista'))+'</button>' : '')+
        '<button type="button" class="pp-b pp-b-gold" onclick="aogPilotForm(\''+c.form+'\')">'+tx(UI.goForm)+'</button>'+
      '</div></div>';
    openModal(tx(UI.subQs)+' · '+deTag(tx(c.title)), tx(c.title));
    document.getElementById('ppmBody').innerHTML=html;
  };

  /* ---------- render form ---------- */
  function fid(formKey,f,idx,sec){ return 'pp_'+formKey+'_'+(f.id||('f'+sec.title.en.replace(/\W/g,'')+idx)); }
  function fieldHTML(formKey,f,nm){
    if(f.type==='likert'){
      var scale=f.scale;
      var hasNA=(f.na!==false)&&scale.length>=5;
      var naTh=hasNA?'<th class="na"><span class="lk-full">'+tx(NA)+'</span><span class="lk-ab" aria-hidden="true">'+tx(NA)+'</span></th>':'';
      var head='<tr><th class="s"></th>'+scale.map(function(s){var full=tx(s);var ab=full.replace(/[^0-9A-Za-z\u00C0-\u024F ]/g,'').trim().split(/\s+/).map(function(w){return w.charAt(0);}).join('').toUpperCase();return '<th><span class="lk-full">'+full.replace(/ /g,'<br>')+'</span><span class="lk-ab" aria-hidden="true">'+ab+'</span></th>';}).join('')+naTh+'</tr>';
      var body=f.rows.map(function(rt,ri){
        var rnm=nm+'_r'+ri;
        var cells=scale.map(function(s){ return '<td><input type="radio" name="'+rnm+'" value="'+esc(tx(s))+'" aria-label="'+esc(tx(rt))+' — '+esc(tx(s))+'"></td>'; }).join('');
        var naTd=hasNA?'<td class="na"><input type="radio" name="'+rnm+'" value="N/A" aria-label="'+esc(tx(rt))+' — '+esc(tx(NA))+'"></td>':'';
        return '<tr><td class="s">'+tx(rt)+'</td>'+cells+naTd+'</tr>';
      }).join('');
      var keyTxt=tx(scale[0])+' → '+tx(scale[scale.length-1])+(hasNA?'  ·  '+tx(NA)+' = '+tx(NA_HINT):'');
      return '<div class="ppf-field"><div class="ppf-likert-wrap"><table class="ppf-likert'+(scale.length>=5?' lk5':'')+(hasNA?' has-na':'')+'"><thead>'+head+'</thead><tbody>'+body+'</tbody></table></div>'+(scale.length>=5?'<div class="ppf-likert-key" aria-hidden="true">'+keyTxt+'</div>':'')+'</div>';
    }
    if(f.type==='checks'){
      var ch=f.opts.map(function(o){ return '<label class="ppf-chip"><input type="checkbox" name="'+nm+'" value="'+esc(tx(o))+'" onchange="this.closest(\'.ppf-chip\').classList.toggle(\'on\',this.checked)">'+tx(o)+'</label>'; }).join('');
      return '<div class="ppf-field"><label class="ppf-q" id="'+nm+'_lbl">'+tx(f.label)+'</label><div class="ppf-opts" role="group" aria-labelledby="'+nm+'_lbl">'+ch+'</div></div>';
    }
    if(f.type==='radio'){
      var rd=f.opts.map(function(o){ return '<label class="ppf-chip"><input type="radio" name="'+nm+'" value="'+esc(tx(o))+'" onchange="var p=this.closest(\'.ppf-opts\'); if(p){var l=p.querySelectorAll(\'.ppf-chip\'); for(var k=0;k<l.length;k++)l[k].classList.remove(\'on\');} this.closest(\'.ppf-chip\').classList.add(\'on\')">'+tx(o)+'</label>'; }).join('');
      return '<div class="ppf-field"><label class="ppf-q" id="'+nm+'_lbl">'+tx(f.label)+'</label><div class="ppf-opts" role="radiogroup" aria-labelledby="'+nm+'_lbl">'+rd+'</div></div>';
    }
    if(f.type==='nps'){
      var cells=''; for(var n=0;n<=10;n++){ cells+='<label><input type="radio" name="'+nm+'" value="'+n+'" aria-label="'+n+'"><span class="n">'+n+'</span></label>'; }
      return '<div class="ppf-field"><label class="ppf-q" id="'+nm+'_lbl">'+tx(f.label)+'</label><div class="ppf-nps" role="radiogroup" aria-labelledby="'+nm+'_lbl"><span class="ends">'+tx(f.left)+'</span>'+cells+'<span class="ends">'+tx(f.right)+'</span></div></div>';
    }
    if(f.type==='face'){
      var fc=f.opts.map(function(o){ return '<label><input type="radio" name="'+nm+'" value="'+esc(tx(o.t))+'" aria-label="'+esc(tx(o.t))+'"><span class="f"><span class="em" aria-hidden="true">'+o.em+'</span>'+tx(o.t)+'</span></label>'; }).join('');
      return '<div class="ppf-field"><label class="ppf-q" id="'+nm+'_lbl">'+tx(f.label)+'</label><div class="ppf-face" role="radiogroup" aria-labelledby="'+nm+'_lbl">'+fc+'</div></div>';
    }
    if(f.type==='textarea'){
      return '<div class="ppf-field"><label class="ppf-q" for="'+nm+'">'+tx(f.label)+'</label><textarea id="'+nm+'" name="'+nm+'" rows="2"></textarea></div>';
    }
    var t=f.type==='date'?'date':(f.type==='number'?'number':'text');
    return '<div class="ppf-field"><label class="ppf-q" for="'+nm+'">'+tx(f.label)+'</label><input type="'+t+'" id="'+nm+'" name="'+nm+'"></div>';
  }

  window.aogPilotForm=function(formKey){
    var F=FORMS[formKey]; if(!F) return;
    window.__ppOpen={type:'form', key:formKey};
    var secs=F.sections.map(function(sec,si){
      var fields=sec.fields.map(function(f,i){ return fieldHTML(formKey,f,fid(formKey,f,i,sec)); }).join('');
      var collapsed = si>0 ? ' collapsed' : '';
      var head='<button type="button" class="ppf-sec-head" aria-expanded="'+(si>0?'false':'true')+'" onclick="aogPilotToggleSec(this)">'+
        '<span class="ppf-sec-h">'+tx(sec.title)+'</span>'+
        '<span class="ppf-sec-meta"><span class="ppf-sec-count" id="ppfcnt_'+si+'"></span>'+
          '<svg class="ppf-chev2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span></button>';
      var bodyInner=(sec.desc?'<div class="ppf-sec-d">'+tx(sec.desc)+'</div>':'')+fields;
      return '<div class="ppf-sec'+collapsed+'">'+head+'<div class="ppf-sec-body">'+bodyInner+'</div></div>';
    }).join('');
    var prog='<div class="ppf-prog"><div class="ppf-prog-row"><span class="ppf-prog-lab">'+tx(UI.progLab)+'</span><span class="ppf-prog-pct" id="ppfPct">0%</span></div><div class="ppf-prog-track"><div class="ppf-prog-fill" id="ppfFill"></div></div></div>';
    var html='<form id="ppfForm" onsubmit="return aogPilotSubmit(event,\''+formKey+'\')">'+
      prog+'<p class="ppf-intro">'+tx(F.intro)+'</p>'+secs+
      '<div class="ppf-actions"><span class="ppf-priv-mini">'+tx(UI.privMini)+'</span>'+
      '<button type="submit" class="pp-b pp-b-gold" id="ppfSend" style="font-size:14px;padding:12px 20px;">'+tx(UI.send)+'</button></div></form>';
    openModal(tx(UI.subFb), tx(F.title));
    document.getElementById('ppmBody').innerHTML=html;
    var form=document.getElementById('ppfForm');
    if(form){ var upd=function(){ window.aogPilotProgress(formKey); }; form.addEventListener('input',upd); form.addEventListener('change',upd); }
    window.aogPilotProgress(formKey);
    $ov().scrollTop=0; var pb=document.getElementById('ppmBody'); if(pb) pb.scrollTop=0;
  };

  window.aogPilotToggleSec=function(btn){
    var sec=btn.closest('.ppf-sec'); if(!sec) return;
    var c=sec.classList.toggle('collapsed');
    btn.setAttribute('aria-expanded', c?'false':'true');
  };

  function secCounts(formKey,sec,root){
    var total=0, ans=0;
    sec.fields.forEach(function(f,i){
      var nm=fid(formKey,f,i,sec);
      if(f.type==='likert'){ f.rows.forEach(function(rt,ri){ total++; if(root.querySelector('input[name="'+nm+'_r'+ri+'"]:checked')) ans++; }); }
      else if(f.type==='radio'||f.type==='nps'||f.type==='face'){ total++; if(root.querySelector('input[name="'+nm+'"]:checked')) ans++; }
      else if(f.type==='checks'){ total++; if(root.querySelector('input[name="'+nm+'"]:checked')) ans++; }
    });
    return {total:total, ans:ans};
  }
  window.aogPilotProgress=function(formKey){
    var F=FORMS[formKey], root=document.getElementById('ppfForm'); if(!F||!root) return;
    var T=0,A=0;
    F.sections.forEach(function(sec,si){
      var c=secCounts(formKey,sec,root); T+=c.total; A+=c.ans;
      var pill=document.getElementById('ppfcnt_'+si);
      if(pill){ if(c.total===0){ pill.style.display='none'; } else { pill.style.display=''; pill.textContent=c.ans+'/'+c.total; pill.classList.toggle('done', c.ans===c.total && c.total>0); } }
    });
    var pct=T?Math.round(A/T*100):0;
    var fill=document.getElementById('ppfFill'), pe=document.getElementById('ppfPct');
    if(fill) fill.style.width=pct+'%'; if(pe) pe.textContent=pct+'%';
  };

  /* ---------- collect + submit ---------- */
  function collect(formKey){
    var F=FORMS[formKey], root=document.getElementById('ppfForm'); if(!F||!root) return '';
    var out=[];
    F.sections.forEach(function(sec){
      var lines=[];
      sec.fields.forEach(function(f,i){
        var nm=fid(formKey,f,i,sec);
        if(f.type==='likert'){
          f.rows.forEach(function(rt,ri){ var sel=root.querySelector('input[name="'+nm+'_r'+ri+'"]:checked'); lines.push('  - '+deTag(tx(rt))+' : '+(sel?sel.value:tx(UI.noAns))); });
        } else if(f.type==='checks'){
          var picked=[]; root.querySelectorAll('input[name="'+nm+'"]:checked').forEach(function(x){picked.push(x.value);});
          lines.push('  '+deTag(tx(f.label))+' '+(picked.length?picked.join(', '):tx(UI.none)));
        } else if(f.type==='radio'||f.type==='nps'||f.type==='face'){
          var s=root.querySelector('input[name="'+nm+'"]:checked'); lines.push('  '+deTag(tx(f.label))+' '+(s?s.value:tx(UI.noAns)));
        } else {
          var el=root.querySelector('[name="'+nm+'"]'); var v=el?el.value.trim():''; lines.push('  '+deTag(tx(f.label))+' '+(v||tx(UI.blank)));
        }
      });
      out.push('== '+deTag(tx(sec.title))+' ==\n'+lines.join('\n'));
    });
    return out.join('\n\n');
  }

  window.__ppLastBody=''; window.__ppLastSubject='';
  window.aogPilotSubmit=function(ev,formKey){
    if(ev&&ev.preventDefault) ev.preventDefault();
    var btn=document.getElementById('ppfSend');
    if(btn){ btn.disabled=true; btn.style.opacity='.85'; btn.innerHTML='<span class="ppf-spin"></span> '+tx(UI.preparing); }
    setTimeout(function(){ try{ window.aogPilotDoSubmit(formKey); }catch(e){} }, 480);
    return false;
  };
  window.aogPilotDoSubmit=function(formKey){
    var F=FORMS[formKey];
    var subject=tx(UI.subj)+' — '+deTag(tx(F.title));
    var body=tx(UI.mailHdr)+'\n'+tx(UI.mailForm)+': '+deTag(tx(F.title))+'\n'+tx(UI.mailDate)+': '+new Date().toLocaleString()+'\n\n'+collect(formKey)+'\n\n'+tx(UI.mailFoot);
    window.__ppLastBody=body; window.__ppLastSubject=subject;
    var mailto='mailto:'+PILOT_EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    // Note: we deliberately do NOT auto-navigate to the mailto here. On phones that
    // jumps straight into the mail app, so the person never sees this confirmation and
    // returns to a reset app. Instead they tap "Open email app" below when ready.
    var b=document.getElementById('ppmBody');
    b.innerHTML='<div class="ppf-done">'+
      '<div class="ck"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>'+
      '<h4>'+tx(UI.doneH)+'</h4><p>'+tx(UI.doneP)+'</p>'+
      '<div class="ppf-actions" style="justify-content:center;border-top:0;position:static;background:none;">'+
        '<a class="pp-b pp-b-gold" style="font-size:15px;padding:14px 26px;" href="'+mailto.replace(/"/g,'&quot;')+'">'+tx(UI.openEmail)+'</a>'+
        '<button type="button" class="pp-b pp-b-navy" style="font-size:14px;padding:13px 20px;" onclick="aogPilotCopy(this)">'+tx(UI.copy)+'</button>'+
        '<button type="button" class="pp-b pp-b-ghost" onclick="aogPilotCloseModal()">'+tx(UI.done)+'</button>'+
      '</div><div class="ppf-resend">'+tx(UI.resend)+'</div></div>';
    window.__ppOpen=null; var pb=document.getElementById('ppmBody'); if(pb) pb.scrollTop=0;
    return false;
  };
  window.aogPilotCopy=function(btn){
    var txt='To: '+PILOT_EMAIL+'\nSubject: '+window.__ppLastSubject+'\n\n'+window.__ppLastBody;
    function done(){ if(btn){ btn.textContent=tx(UI.copied); setTimeout(function(){btn.textContent=tx(UI.copy);},1800);} }
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(done,fallback); } else { fallback(); }
    function fallback(){ var ta=document.createElement('textarea'); ta.value=txt; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy');}catch(e){} document.body.removeChild(ta); done(); }
  };

  /* ---------- relang: rebuild dynamic content on EN/ES switch ---------- */
  window.aogPilotRelang=function(){
    try{ buildCards(); }catch(e){}
    var o=window.__ppOpen, ov=$ov();
    if(o && ov && ov.classList.contains('open')){
      if(o.type==='preview') window.aogPilotPreview(o.key);
      else if(o.type==='form') window.aogPilotForm(o.key);
    }
  };

  /* register static-chrome Spanish into the site's dictionary */
  try{ if(window.I18N_UI){ for(var k in PILOT_I18N){ window.I18N_UI[k]=PILOT_I18N[k]; } } }catch(e){}

  /* hook the site's language switch so dynamic content re-renders too */
  try{
    var _origSetLang=window.setLang;
    if(typeof _origSetLang==='function'){
      window.setLang=function(){ var r=_origSetLang.apply(this,arguments); try{ if(typeof applyLang==='function') applyLang(); }catch(e){} try{ window.aogPilotRelang(); }catch(e){} return r; };
    }
  }catch(e){}

  /* entry point + nav */
  window.aogGoPilot=function(){ if(typeof showScreen==='function') showScreen('screen-pilot'); try{ if(typeof aogCloseExplore==='function') aogCloseExplore(); }catch(e){} try{ if(typeof aogSetHash==='function') aogSetHash('pilot'); }catch(e){} };

  function init(){ buildCards(); try{ if(window.lang==='es' && typeof applyLang==='function') applyLang(); }catch(e){} }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',init); } else { init(); }
  try{ window.addEventListener('load', function(){ try{ buildCards(); }catch(e){} }); }catch(e){}
})();
