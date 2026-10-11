
(function(){
  function es(){ return (typeof lang !== "undefined" && lang === "es"); }
  function L(en, esTxt){ return es() ? esTxt : en; }

  var DISC_STEPS = [
    { ic:"1", t:{en:"Pause and move toward", es:"Haz una pausa y acércate"},
      d:{en:"Stop the lesson. Walk calmly toward the student. Don’t draw attention if you can avoid it. Give the class independent work:", es:"Detén la lección. Camina con calma hacia el estudiante. No llames la atención si puedes evitarlo. Dale trabajo independiente a la clase:"},
      say:{en:"Keep working in your journal — I’ll be right back.", es:"Sigan trabajando en su diario — vuelvo enseguida."} },
    { ic:"2", t:{en:"Acknowledge without probing", es:"Reconoce sin indagar"},
      d:{en:"Don’t ask “what’s wrong?” — that makes the student explain while still activated. Just name it:", es:"No preguntes “¿qué te pasa?” — eso obliga al estudiante a explicar mientras todavía está alterado/a. Solo nómbralo:"},
      say:{en:"I can see something is happening for you right now. You don’t have to explain it.", es:"Veo que algo está pasando contigo en este momento. No tienes que explicarlo."} },
    { ic:"3", t:{en:"Offer a choice", es:"Ofrece una opción"},
      d:{en:"Give the student agency. Both choices are valid.", es:"Deja que el estudiante elija. Ambas opciones son válidas."},
      say:{en:"Would you like to step into the hall with me for a minute, or stay here and just breathe?", es:"¿Quieres salir al pasillo conmigo un momento, o prefieres quedarte aquí y solo respirar?"} },
    { ic:"4", t:{en:"Listen and assess", es:"Escucha y evalúa"},
      d:{en:"If the student speaks, listen without judgment. Assess: is this a Type 1–3 personal share (emotional but contained), or a Type 4 active safety concern? If Type 4, go to Step 5 now.", es:"Si el estudiante habla, escucha sin juzgar. Evalúa: ¿es una confidencia personal Tipo 1–3 (emocional pero contenida) o una preocupación activa de seguridad Tipo 4? Si es Tipo 4, ve al Paso 5 ahora."},
      say:null },
    { ic:"5", t:{en:"Connect to the counselor (Type 4)", es:"Conecta con el consejero (Tipo 4)"}, t4:true,
      d:{en:"Do not promise confidentiality. Do not delay. Walk them over yourself:", es:"No prometas confidencialidad. No te demores. Acompáñalo tú mismo/a:"},
      say:{en:"Thank you for trusting me with this. I want to make sure you have the right support — I’m going to walk you to [counselor] right now.", es:"Gracias por confiarme esto. Quiero asegurarme de que tengas el apoyo adecuado — voy a acompañarte con [consejero] ahora mismo."} },
    { ic:"6", t:{en:"Document, then debrief yourself", es:"Documenta y haz tu propio debrief"},
      d:{en:"After class: document what happened in your Teacher Reflection space. Debrief with the counselor or a trusted colleague. You carried something real — put it down before your next class.", es:"Después de clase: documenta lo que pasó en tu espacio de Reflexión Docente. Habla con el consejero o un colega de confianza. Cargaste algo real — suéltalo antes de tu próxima clase."},
      say:null }
  ];

  var DISC_PRACTICE = [
    { q:{en:"“I froze.”", es:"“Me congelé.”"},
      a:{en:"Normal. Step 1 is all you need: stop and move toward the student. Everything else follows from presence.", es:"Normal. El Paso 1 es todo lo que necesitas: detente y acércate. Todo lo demás surge de tu presencia."} },
    { q:{en:"“I wasn’t sure if it was Type 3 or Type 4.”", es:"“No estaba seguro si era Tipo 3 o Tipo 4.”"},
      a:{en:"When uncertain, treat it as Type 4 and let the counselor assess. You are not required to assess accurately under pressure — you are required to act.", es:"Cuando dudes, trátalo como Tipo 4 y deja que el consejero evalúe. No se te exige evaluar con precisión bajo presión — se te exige actuar."} },
    { q:{en:"“The student said ‘I’m fine’ but I wasn’t sure.”", es:"“El estudiante dijo ‘estoy bien’ pero no estaba seguro.”"},
      a:{en:"“I’m fine” after a real disclosure is almost always protective. Follow up privately after class, and brief the counselor.", es:"“Estoy bien” después de una revelación real casi siempre es una forma de protegerse. Da seguimiento en privado después de clase e informa al consejero."} },
    { q:{en:"“Nothing came up for me.”", es:"“No surgió nada conmigo.”"},
      a:{en:"Also valid. Some classrooms generate less activation. Unit 3’s harder content will change the frequency — keep this protocol ready.", es:"También es válido. Algunas aulas generan menos activación. El contenido más difícil de la Unidad 3 cambiará la frecuencia — ten este protocolo listo."} }
  ];

  function stepHtml(s){
    var t4 = s.t4 ? 1 : 0;
    var accent = t4 ? "#B5503F" : "var(--navy)";
    var sayBlock = s.say
      ? '<div style="margin-top:8px;padding:9px 12px;border-left:3px solid var(--gold);background:var(--paper);border-radius:0 8px 8px 0;font-family:var(--font-serif);font-style:italic;font-size:15px;color:var(--ink);">“'+ (es()?s.say.es:s.say.en) +'”</div>'
      : "";
    return '<div style="display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-top:1px solid var(--rule);">'+
      '<div style="flex:0 0 auto;width:30px;height:30px;border-radius:50%;background:'+accent+';color:#fff;font-family:var(--font-sans);font-weight:800;font-size:15px;display:flex;align-items:center;justify-content:center;">'+s.ic+'</div>'+
      '<div style="flex:1 1 auto;text-align:left;">'+
        '<div style="font-family:var(--font-sans);font-weight:800;font-size:15px;color:'+accent+';">'+ (es()?s.t.es:s.t.en) + (t4?' <span style="font-size:11px;letter-spacing:.08em;background:#B5503F;color:#fff;padding:1px 7px;border-radius:10px;vertical-align:middle;">'+L("SAFETY","SEGURIDAD")+'</span>':'') +'</div>'+
        '<div style="font-size:14px;line-height:1.6;color:var(--ink-soft);margin-top:3px;">'+ (es()?s.d.es:s.d.en) +'</div>'+ sayBlock +
      '</div></div>';
  }

  function practiceHtml(){
    var cards = DISC_PRACTICE.map(function(p,i){
      return '<div style="border:1px solid var(--rule);border-radius:12px;padding:13px 15px;margin-bottom:10px;text-align:left;background:#fff;">'+
        '<div style="font-family:var(--font-serif);font-size:16px;color:var(--navy);">'+ (es()?p.q.es:p.q.en) +'</div>'+
        '<button type="button" onclick="window.aogDiscReveal('+i+')" id="discRevBtn'+i+'" style="margin-top:8px;font:inherit;font-size:13px;font-weight:700;background:none;border:1px solid var(--rule);border-radius:8px;padding:6px 12px;color:var(--navy);cursor:pointer;">'+L("Show the steady answer","Ver la respuesta serena")+'</button>'+
        '<div id="discRev'+i+'" style="display:none;margin-top:9px;padding:10px 12px;background:var(--paper);border-radius:8px;font-size:14px;line-height:1.6;color:var(--ink);">'+ (es()?p.a.es:p.a.en) +'</div>'+
      '</div>';
    }).join("");
    return '<div id="discPractice" style="display:none;margin-top:10px;">'+
      '<div style="font-family:var(--font-sans);font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-deep,#9a6f24);margin:4px 0 10px;">'+L("Rehearse — what teachers often say","Ensaya — lo que suelen decir los docentes")+'</div>'+
      cards +'</div>';
  }

  window.aogDiscReveal = function(i){
    var el = document.getElementById("discRev"+i); var btn = document.getElementById("discRevBtn"+i);
    if(!el) return;
    var open = el.style.display !== "none";
    el.style.display = open ? "none" : "block";
    if(btn) btn.textContent = open ? L("Show the steady answer","Ver la respuesta serena") : L("Hide","Ocultar");
  };
  window.aogDiscMode = function(m){
    var pr = document.getElementById("discPractice"); var steps = document.getElementById("discSteps");
    var bs = document.getElementById("discTabSteps"); var bp = document.getElementById("discTabPractice");
    if(!pr||!steps) return;
    var practice = (m === "practice");
    pr.style.display = practice ? "block" : "none";
    steps.style.display = practice ? "none" : "block";
    if(bs&&bp){
      bs.style.background = practice ? "transparent" : "var(--navy)"; bs.style.color = practice ? "var(--navy)" : "#fff";
      bp.style.background = practice ? "var(--navy)" : "transparent"; bp.style.color = practice ? "#fff" : "var(--navy)";
    }
  };

  function buildDisclosure(){
    var oneLine = es() ? DISC_STEPS[1].say.es : DISC_STEPS[1].say.en;
    var steps = DISC_STEPS.map(stepHtml).join("");
    var t4 =
      '<div style="margin-top:14px;border:1.5px solid #B5503F;border-radius:14px;padding:14px 16px;background:rgba(181,80,63,.05);text-align:left;">'+
        '<div style="font-family:var(--font-sans);font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#B5503F;">'+L("Type 4 — active safety concern","Tipo 4 — preocupación activa de seguridad")+'</div>'+
        '<div style="font-size:14px;line-height:1.6;color:var(--ink);margin-top:6px;"><strong>'+L("What it looks like:","Cómo se ve:")+'</strong> '+L("current harm, self-harm, suicidal ideation, or a threat to others.","daño actual, autolesión, ideación suicida o una amenaza a otros.")+'</div>'+
        '<div style="font-size:14px;line-height:1.6;color:var(--ink);margin-top:6px;"><strong>'+L("Response:","Respuesta:")+'</strong> '+L("STOP. Run the 6 steps. Mandatory reporting applies. Do not leave the student alone. When you can’t tell Type 3 from Type 4, treat it as Type 4 and let the counselor assess.","DETENTE. Aplica los 6 pasos. Aplica el reporte obligatorio. No dejes al estudiante solo/a. Cuando no distingas Tipo 3 de Tipo 4, trátalo como Tipo 4 y deja que el consejero evalúe.")+'</div>'+
      '</div>';
    return '<div class="tool-modal-icon" aria-hidden="true">🛡️</div>'+
      '<div class="tool-modal-title">'+L("If a student discloses","Si un estudiante revela algo")+'</div>'+
      '<div class="tool-modal-sub">'+L("The 6-step in-the-moment protocol. You don’t have to be perfect — you have to be present.","El protocolo de 6 pasos en el momento. No tienes que ser perfecto — tienes que estar presente.")+'</div>'+
      '<div style="max-width:560px;margin:14px auto 0;text-align:left;">'+
        '<div style="background:var(--navy);color:#fff;border-radius:14px;padding:13px 16px;">'+
          '<div style="font-family:var(--font-sans);font-weight:800;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold-soft,#F2C964);">'+L("The one sentence to have automatic","La frase que debe salirte sin pensar")+'</div>'+
          '<div style="font-family:var(--font-serif);font-style:italic;font-size:18px;line-height:1.5;margin-top:6px;">“'+oneLine+'”</div>'+
        '</div>'+
        '<div style="display:flex;gap:8px;margin:14px 0 4px;">'+
          '<button type="button" id="discTabSteps" onclick="window.aogDiscMode(\'steps\')" style="flex:1;font:inherit;font-size:13px;font-weight:800;background:var(--navy);color:#fff;border:1px solid var(--navy);border-radius:9px;padding:8px 10px;cursor:pointer;">'+L("The 6 steps","Los 6 pasos")+'</button>'+
          '<button type="button" id="discTabPractice" onclick="window.aogDiscMode(\'practice\')" style="flex:1;font:inherit;font-size:13px;font-weight:800;background:transparent;color:var(--navy);border:1px solid var(--navy);border-radius:9px;padding:8px 10px;cursor:pointer;">'+L("Practice","Practicar")+'</button>'+
        '</div>'+
        '<div id="discSteps">'+ steps + t4 +'</div>'+
        practiceHtml()+
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;">'+
          '<button type="button" onclick="window.aogDiscPrint()" style="font:inherit;font-size:13px;font-weight:700;background:var(--gold);color:var(--navy);border:0;border-radius:9px;padding:9px 16px;cursor:pointer;">'+L("Print a wallet card","Imprimir tarjeta de bolsillo")+'</button>'+
        '</div>'+
        '<div style="margin-top:14px;font-size:11.5px;line-height:1.5;color:var(--ink-faint);border-top:1px solid var(--rule);padding-top:10px;">'+L("Architecture of Grace · Books 4–5, Section 4.4 — the 6-Step In-the-Moment Disclosure Protocol. This is an in-the-moment aid, not a substitute for your school’s mandatory-reporting policy. If anything suggests abuse, neglect, or imminent self-harm, follow your reporting protocol.","Architecture of Grace · Libros 4–5, Sección 4.4 — el Protocolo de Revelación de 6 Pasos en el momento. Es una ayuda en el momento, no un sustituto de la política de reporte obligatorio de tu escuela. Si algo sugiere abuso, negligencia o riesgo inminente de autolesión, sigue tu protocolo de reporte.")+'</div>'+
      '</div>';
  }
  function initDisclosure(){ try{ window.aogDiscMode("steps"); }catch(e){} }

  window.aogDiscPrint = function(){
    var E = es();
    var rows = DISC_STEPS.map(function(s){
      var say = s.say ? '<div class="say">“'+(E?s.say.es:s.say.en)+'”</div>' : "";
      return '<tr><td class="n'+(s.t4?' t4':'')+'">'+s.ic+'</td><td><b>'+(E?s.t.es:s.t.en)+'</b><div class="d">'+(E?s.d.es:s.d.en)+'</div>'+say+'</td></tr>';
    }).join("");
    var w = window.open("", "_blank");
    if(!w) return;
    var doc = '<!doctype html><html lang="'+(E?"es":"en")+'"><head><meta charset="utf-8"><title>'+(E?"Protocolo de Revelación · Architecture of Grace":"Disclosure Protocol · Architecture of Grace")+'</title>'+
      '<style>*{box-sizing:border-box}body{font-family:Georgia,serif;color:#0A1E33;max-width:640px;margin:24px auto;padding:0 20px;line-height:1.5}'+
      'h1{font-size:21px;margin:0 0 2px}.sub{color:#46506E;font-size:13px;margin:0 0 14px}'+
      '.one{background:#0A1E33;color:#fff;border-radius:10px;padding:11px 14px;margin:0 0 14px}.one .lab{font-family:Arial,sans-serif;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#F2C964}.one .q{font-style:italic;font-size:16px;margin-top:4px}'+
      'table{width:100%;border-collapse:collapse}td{vertical-align:top;padding:9px 6px;border-top:1px solid #E4DAC5}td.n{width:28px;font-family:Arial,sans-serif;font-weight:800;color:#fff;background:#0A1E33;text-align:center;border-radius:50%;height:26px;line-height:26px;padding:0}td.n.t4{background:#B5503F}.d{color:#46506E;font-size:13px;margin-top:2px}.say{border-left:3px solid #D9A33B;background:#FCF8F0;padding:6px 10px;margin-top:5px;font-style:italic;font-size:13px;border-radius:0 6px 6px 0}'+
      '.t4box{border:1.5px solid #B5503F;background:rgba(181,80,63,.05);border-radius:10px;padding:11px 13px;margin-top:14px;font-size:13px}.t4box .h{font-family:Arial,sans-serif;font-weight:800;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#B5503F}'+
      '.foot{color:#646E86;font-size:10.5px;margin-top:16px;border-top:1px solid #E4DAC5;padding-top:8px}'+
      '@media print{body{margin:0}}</style></head><body>'+
      '<h1>'+(E?"Si un estudiante revela algo":"If a student discloses")+'</h1>'+
      '<p class="sub">'+(E?"Protocolo de 6 pasos en el momento · Architecture of Grace":"The 6-step in-the-moment protocol · Architecture of Grace")+'</p>'+
      '<div class="one"><div class="lab">'+(E?"La frase que sale sin pensar":"The automatic sentence")+'</div><div class="q">“'+(E?DISC_STEPS[1].say.es:DISC_STEPS[1].say.en)+'”</div></div>'+
      '<table>'+rows+'</table>'+
      '<div class="t4box"><div class="h">'+(E?"Tipo 4 — preocupación activa de seguridad":"Type 4 — active safety concern")+'</div>'+
        '<div>'+(E?"Daño actual, autolesión, ideación suicida o amenaza a otros. DETENTE, aplica los 6 pasos, aplica el reporte obligatorio y no dejes al estudiante solo/a. Si dudas entre Tipo 3 y Tipo 4, trátalo como Tipo 4.":"Current harm, self-harm, suicidal ideation, or a threat to others. STOP, run the 6 steps, mandatory reporting applies, and do not leave the student alone. When uncertain between Type 3 and Type 4, treat it as Type 4.")+'</div></div>'+
      '<p class="foot">'+(E?"Architecture of Grace · Libros 4–5, Sección 4.4. Ayuda en el momento, no sustituye la política de reporte obligatorio de tu escuela.":"Architecture of Grace · Books 4–5, Section 4.4. An in-the-moment aid — not a substitute for your school’s mandatory-reporting policy.")+'</p>'+
      '</body></html>';
    w.document.open(); w.document.write(doc); w.document.close(); w.focus(); try{ w.print(); }catch(e){}
  };

  window.aogDisclosureLeadershipCard = function(){
    return '<div class="gc-card" style="margin:0 0 16px;border-top:3px solid #B5503F;">'+
      '<div class="gc-head" onclick="if(window.gcToggle)gcToggle(this)">'+
        '<span class="gt">'+L("Disclosure & Distress Protocol — facilitation & safety","Protocolo de Revelación y Angustia — facilitación y seguridad")+'</span>'+
        '<span class="gchev">▾</span></div>'+
      '<div class="gc-body"><div class="gc-intro">'+
        L("This is the PD Block 3 artifact — the safety-critical protocol every delivering teacher rehearses before Lesson 1. Open it to run the practice in your half-day module, or to confirm the in-the-moment steps your staff carry into the room.","Este es el material del Bloque 3 del PD — el protocolo crítico de seguridad que cada docente ensaya antes de la Lección 1. Ábrelo para dirigir la práctica en tu módulo de medio día, o para confirmar los pasos en el momento que tu personal lleva al aula.")+
      '</div><div class="rn-teacher-tools" style="margin-top:12px;">'+
        '<button type="button" onclick="if(window.toolOpen){window.toolOpen(\'disclosure\');}">'+L("⚠ Open the protocol","⚠ Abrir el protocolo")+'</button>'+
      '</div></div></div>';
  };

  function reg(){ if(window.TOOLS){ window.TOOLS.disclosure = { builder: buildDisclosure, init: initDisclosure }; } }
  if(window.TOOLS){ reg(); } else { window.addEventListener("load", reg); }
})();
