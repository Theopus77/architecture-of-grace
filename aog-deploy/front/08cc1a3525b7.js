
(function(){
  function es(){ return (typeof lang !== "undefined" && lang === "es"); }
  function L(en, esTxt){ return es() ? esTxt : en; }
  function esc(s){ return String(s==null?"":s).replace(/[<>&]/g,function(c){return {"<":"&lt;",">":"&gt;","&":"&amp;"}[c];}); }
  function hl(raw,q){ var t=String(raw==null?"":raw); if(!q) return esc(t); var lo=t.toLowerCase(), ql=String(q).toLowerCase(), out="", i=0, idx; while((idx=lo.indexOf(ql,i))>=0){ out+=esc(t.slice(i,idx))+'<mark style="background:var(--gold-soft,#F2C964);color:var(--navy);border-radius:3px;padding:0 1px;">'+esc(t.slice(idx,idx+ql.length))+'</mark>'; i=idx+ql.length; } out+=esc(t.slice(i)); return out; }
  var PIL = { identity:{c:"#1C5499",en:"Identity",es:"Identidad"}, selfcomp:{c:"#356B25",en:"Self-Compassion",es:"Autocompasión"}, forgive:{c:"#9a6f24",en:"Forgiveness",es:"Perdón"}, grace:{c:"#523C9E",en:"Grace",es:"Grace"} };
  var TERMS = [
   {ten:"Anchor Chart",tes:"Tabla de anclaje",ess:1,den:"A persistent visual reference, drawn before class and posted all year. Anchors a key concept in the room itself.",des:"Una referencia visual permanente, dibujada antes de la clase y exhibida todo el año. Ancla un concepto clave en el aula misma."},
   {ten:"Authentic Self",tes:"El yo auténtico",pil:"identity",ess:1,den:"The self as it actually is — internal, unfiltered, contextual. Not opposed to the curated self; in conversation with it.",des:"El yo tal como realmente es — interno, sin filtros, contextual. No se opone al yo curado; está en conversación con él."},
   {ten:"Backpack",tes:"La mochila",pil:"selfcomp",ess:1,den:"The cumulative weight of internalized labels, wounds, and self-narratives a student carries. The Backpack Audit asks: what am I still carrying, and what am I choosing to put down?",des:"El peso acumulado de etiquetas internalizadas, heridas y narrativas sobre uno mismo que carga un estudiante. La Auditoría de la Mochila pregunta: ¿qué sigo cargando y qué elijo soltar?"},
   {ten:"CASEL",tes:"CASEL",den:"Collaborative for Academic, Social, and Emotional Learning. The framework Architecture of Grace is aligned to.",des:"Colaborativa para el Aprendizaje Académico, Social y Emocional. El marco con el que se alinea Architecture of Grace."},
   {ten:"Class Legacy",tes:"Legado de la clase",pil:"grace",den:"The collective artifact of the Book 4 Unit 4 capstone — what this specific class chose to leave for the cohort behind them.",des:"El artefacto colectivo del proyecto final de la Unidad 4 del Libro 4 — lo que esta clase específica eligió dejar para la generación que viene detrás."},
   {ten:"Compass of Integrity",tes:"Brújula de la integridad",den:"The Book 5 Unit 1 capstone artifact. Names the student's Moral North Star, values-behavior gap, examined values, and emerging values.",des:"El artefacto final de la Unidad 1 del Libro 5. Nombra la Estrella Polar moral del estudiante, la brecha entre valores y conducta, los valores examinados y los valores emergentes."},
   {ten:"Compassionate Witness",tes:"Testigo compasivo",pil:"selfcomp",ess:1,den:"The internal voice that observes interior states with accuracy and without judgment. Counterpart and corrective to the Internal Critic.",des:"La voz interna que observa los estados internos con precisión y sin juicio. Contraparte y corrección del Crítico Interno."},
   {ten:"Curated Self",tes:"El yo curado",pil:"identity",ess:1,den:"The self as presented for an audience — filtered, selected, performance-aware. Not synonymous with dishonesty; performance is human.",des:"El yo presentado para un público — filtrado, seleccionado, consciente del desempeño. No es sinónimo de deshonestidad; el desempeño es humano."},
   {ten:"Disclosure",tes:"Revelación",ess:1,den:"Any moment in which a student names personal experience that exceeds ordinary classroom share. The curriculum explicitly anticipates disclosure and provides a 6-Step Protocol.",des:"Cualquier momento en que un estudiante nombra una experiencia personal que excede el compartir habitual del aula. El currículo anticipa explícitamente la revelación y ofrece un Protocolo de 6 Pasos."},
   {ten:"Equity Alert",tes:"Alerta de equidad",den:"A flagged content moment in which equity-specific framing is required. Not optional. Delivered as written, not as footnote.",des:"Un momento de contenido señalado en el que se requiere un encuadre específico de equidad. No es opcional. Se imparte tal como está escrito, no como nota al pie."},
   {ten:"Forgiveness · Reconciliation",tes:"Perdón · Reconciliación",pil:"forgive",ess:1,den:"Two separate processes. Forgiveness is internal — a release of resentment that requires only the forgiver's choice. Reconciliation is relational — restoration of trust that requires the other party's participation. Either is available without the other.",des:"Dos procesos distintos. El perdón es interno — soltar el resentimiento, que solo requiere la decisión de quien perdona. La reconciliación es relacional — restaurar la confianza, que requiere la participación de la otra parte. Cualquiera está disponible sin la otra."},
   {ten:"Grace",tes:"Grace",pil:"grace",ess:1,den:"A chosen, practiced, deliberate act — not a sentiment, not a disposition. The willingness to extend more than is owed.",des:"Un acto elegido, practicado y deliberado — no un sentimiento ni una disposición. La voluntad de ofrecer más de lo que se debe."},
   {ten:"Grace Gap",tes:"Brecha de grace",pil:"grace",den:"The space between what a person needs and what is being offered them. Generosity is grace gap-aware: it offers what is missing rather than what has already been provided.",des:"El espacio entre lo que una persona necesita y lo que se le ofrece. La generosidad es consciente de la brecha: ofrece lo que falta, no lo que ya se ha dado."},
   {ten:"Graduation of the Heart",tes:"La graduación del corazón",pil:"forgive",den:"The highest-risk lesson in the K–12 curriculum (Book 5 Unit 3 Lesson 7). Transcendent forgiveness — the forgiveness offered when the weight of carrying it is destroying something in the carrier.",des:"La lección de mayor riesgo del currículo K–12 (Libro 5, Unidad 3, Lección 7). Perdón trascendente — el perdón que se ofrece cuando el peso de cargarlo está destruyendo algo en quien lo carga."},
   {ten:"Identity Shield",tes:"Escudo de identidad",pil:"identity",den:"The Book 4 Unit 1 capstone artifact. Four-quadrant exercise: core values, authentic strengths, non-negotiables, and the adult I am becoming.",des:"El artefacto final de la Unidad 1 del Libro 4. Ejercicio de cuatro cuadrantes: valores centrales, fortalezas auténticas, innegociables y el adulto en que me estoy convirtiendo."},
   {ten:"In-Lesson Scan",tes:"Observación durante la lección",den:"A behavioral observation prompt embedded inline at the activity it monitors. Teacher notes privately. Does not intervene publicly.",des:"Una indicación de observación conductual integrada en la actividad que monitorea. El docente anota en privado. No interviene públicamente."},
   {ten:"Internal Critic",tes:"El crítico interno",pil:"selfcomp",ess:1,den:"The internalized self-judging voice. Distinct from genuine accountability. The Compassionate Witness is its corrective.",des:"La voz interna que se juzga a sí misma. Distinta de la responsabilidad genuina. El Testigo Compasivo es su corrección."},
   {ten:"Living Amend",tes:"Enmienda viva",pil:"forgive",ess:1,den:"An ongoing changed pattern of behavior that constitutes the actual repair after harm — distinct from an apology, which is verbal.",des:"Un patrón de conducta cambiado y sostenido que constituye la reparación real tras un daño — distinto de una disculpa, que es verbal."},
   {ten:"PPRA",tes:"PPRA",ess:1,den:"Protection of Pupil Rights Amendment. Federal statute requiring parental notification before any psychological self-examination activity. Eight Architecture of Grace lessons in this book are PPRA-designated.",des:"Enmienda de Protección de los Derechos del Alumno (Protection of Pupil Rights Amendment). Estatuto federal que exige notificación a los padres antes de cualquier actividad de autoexamen psicológico. Ocho lecciones de Architecture of Grace en este libro son designadas PPRA."},
   {ten:"Reflection Pass",tes:"Pase de reflexión",ess:1,den:"A small physical card available to every student, every lesson. Allows the student to opt out of a specific activity without explanation, without penalty.",des:"Una pequeña tarjeta física disponible para cada estudiante, en cada lección. Permite al estudiante optar por no participar en una actividad específica, sin explicación y sin penalización."},
   {ten:"Scenario Card",tes:"Tarjeta de escenario",den:"A short, structured fictional scenario followed by discussion questions and a closing concept. Two cards per lesson. Cards never require students to share personal content.",des:"Un escenario ficticio breve y estructurado seguido de preguntas de discusión y un concepto de cierre. Dos tarjetas por lección. Las tarjetas nunca exigen que los estudiantes compartan contenido personal."},
   {ten:"Worksheet",tes:"Hoja de trabajo",den:"A reproducible student artifact, embedded at the end of distributing lessons. Never collected unless student chooses.",des:"Un material reproducible del estudiante, integrado al final de las lecciones que lo distribuyen. Nunca se recoge a menos que el estudiante lo elija."}
  ];
  var GLOS = { scope:"all" };

  function listHtml(){
    var l=es()?"es":"en", q=((document.getElementById("glosQ")||{}).value||"").trim().toLowerCase();
    var rows=TERMS.filter(function(t){
      if(GLOS.scope==="ess" && !t.ess) return false;
      if(!q) return true;
      return ((es()?t.tes:t.ten)+" "+(es()?t.des:t.den)).toLowerCase().indexOf(q)>=0;
    }).sort(function(a,b){ return (es()?a.tes:a.ten).localeCompare(es()?b.tes:b.ten,l); });
    var html=rows.map(function(t){
      var p=t.pil?PIL[t.pil]:null, border=p?p.c:"var(--rule)", tags="";
      if(t.ess) tags+='<span style="font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;background:var(--gold);color:var(--navy);padding:2px 8px;border-radius:20px;">★ '+L("Essential","Esencial")+'</span>';
      if(p) tags+='<span style="font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;background:'+p.c+';color:#fff;padding:2px 8px;border-radius:20px;">'+(es()?p.es:p.en)+'</span>';
      return '<div style="border:1px solid var(--rule);border-left:4px solid '+border+';border-radius:12px;background:#fff;padding:12px 15px;margin-bottom:10px;text-align:left;">'+
        '<div style="font-family:var(--font-serif);font-size:18px;font-weight:600;color:var(--navy);display:flex;flex-wrap:wrap;align-items:center;gap:8px;">'+hl(es()?t.tes:t.ten,q)+tags+'</div>'+
        '<div style="font-size:14px;line-height:1.6;color:var(--ink);margin-top:5px;">'+hl(es()?t.des:t.den,q)+'</div></div>';
    }).join("");
    if(!html) html='<div style="color:var(--ink-faint);font-style:italic;padding:16px 2px;">'+L("No terms match your search.","Ningún término coincide con tu búsqueda.")+'</div>';
    return html;
  }
  window.aogGlosRender=function(){
    var lst=document.getElementById("glosList"); if(lst) lst.innerHTML=listHtml();
    var c=document.getElementById("glosCount");
    if(c){ var q=((document.getElementById("glosQ")||{}).value||"").trim().toLowerCase();
      var n=TERMS.filter(function(t){ if(GLOS.scope==="ess"&&!t.ess) return false; if(!q) return true; return ((es()?t.tes:t.ten)+" "+(es()?t.des:t.den)).toLowerCase().indexOf(q)>=0; }).length;
      c.textContent = es()?(n+" de "+TERMS.length+" términos"):(n+" of "+TERMS.length+" terms");
    }
  };
  window.aogGlosScope=function(s){
    GLOS.scope=s;
    var a=document.getElementById("glosAll"), e=document.getElementById("glosEss");
    if(a&&e){ a.style.background=s==="all"?"var(--navy)":"transparent"; a.style.color=s==="all"?"#fff":"var(--navy)"; e.style.background=s==="ess"?"var(--navy)":"transparent"; e.style.color=s==="ess"?"#fff":"var(--navy)"; }
    window.aogGlosRender();
  };

  function buildGlossary(){
    GLOS.scope="all";
    return '<div class="tool-modal-icon" aria-hidden="true">📖</div>'+
      '<div class="tool-modal-title">'+L("Curriculum Glossary","Glosario del currículo")+'</div>'+
      '<div class="tool-modal-sub">'+L("Shared vocabulary is the infrastructure of this curriculum — every adult, the same words.","El vocabulario compartido es la infraestructura de este currículo — cada adulto, las mismas palabras.")+'</div>'+
      '<div style="max-width:560px;margin:14px auto 0;text-align:left;">'+
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">'+
          '<label style="flex:1 1 200px;display:flex;align-items:center;gap:8px;border:1px solid var(--rule);background:#fff;border-radius:11px;padding:8px 12px;"><span aria-hidden="true">🔎</span><input id="glosQ" type="search" oninput="window.aogGlosRender()" placeholder="'+L("Search terms…","Buscar términos…")+'" aria-label="'+L("Search glossary","Buscar en el glosario")+'" style="border:0;outline:0;font:inherit;font-size:14.5px;width:100%;background:transparent;color:var(--ink);"></label>'+
          '<span style="display:inline-flex;border:1px solid var(--rule);border-radius:11px;overflow:hidden;background:#fff;">'+
            '<button type="button" id="glosAll" onclick="window.aogGlosScope(\'all\')" style="font:inherit;font-size:12.5px;font-weight:800;border:0;background:var(--navy);color:#fff;padding:9px 13px;cursor:pointer;">'+L("All 22","Los 22")+'</button>'+
            '<button type="button" id="glosEss" onclick="window.aogGlosScope(\'ess\')" style="font:inherit;font-size:12.5px;font-weight:800;border:0;background:transparent;color:var(--navy);padding:9px 13px;cursor:pointer;">'+L("Essential 12","Esenciales 12")+'</button>'+
          '</span>'+
        '</div>'+
        '<div id="glosCount" style="font-size:12px;color:var(--ink-faint);margin:11px 2px 12px;"></div>'+
        '<div id="glosList">'+listHtml()+'</div>'+
        '<div style="margin-top:12px;font-size:11px;line-height:1.5;color:var(--ink-faint);border-top:1px solid var(--rule);padding-top:9px;">'+L("Architecture of Grace · Section 4.8, Curriculum Vocabulary Glossary (Books 4–5). Spanish is a provisional translation; English is canonical.","Architecture of Grace · Sección 4.8, Glosario de Vocabulario del Currículo (Libros 4–5). El español es una traducción provisional; el inglés es la versión canónica.")+'</div>'+
      '</div>';
  }
  function initGlossary(){ try{ window.aogGlosRender(); }catch(e){} }

  window.aogGlossaryLeadershipCard = function(){
    return '<div class="gc-card" style="margin:0 0 16px;border-top:3px solid var(--gold);">'+
      '<div class="gc-head" onclick="if(window.gcToggle)gcToggle(this)">'+
        '<span class="gt">'+L("Curriculum Glossary — shared language (PD Block 6)","Glosario del currículo — lenguaje compartido (Bloque 6 del PD)")+'</span>'+
        '<span class="gchev">▾</span></div>'+
      '<div class="gc-body"><div class="gc-intro">'+
        L("Shared vocabulary is the infrastructure of this curriculum. Open the glossary to orient staff in Block 6, or as a quick reference any time the language comes up.","El vocabulario compartido es la infraestructura de este currículo. Abre el glosario para orientar al personal en el Bloque 6, o como referencia rápida cuando surja el lenguaje.")+
      '</div><div class="rn-teacher-tools" style="margin-top:12px;">'+
        '<button type="button" onclick="if(window.toolOpen){window.toolOpen(\'glossary\');}">'+L("📖 Open the glossary","📖 Abrir el glosario")+'</button>'+
      '</div></div></div>';
  };

  function reg(){ if(window.TOOLS){ window.TOOLS.glossary = { builder: buildGlossary, init: initGlossary }; } }
  if(window.TOOLS){ reg(); } else { window.addEventListener("load", reg); }
})();
