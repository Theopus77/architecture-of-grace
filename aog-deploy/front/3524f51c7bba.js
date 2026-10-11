
(function(){
  function es(){ return (typeof lang !== "undefined" && lang === "es"); }
  function L(en, esTxt){ return es() ? esTxt : en; }
  function escT(t){ return String(t==null?"":t).replace(/[<>&]/g,function(c){return {"<":"&lt;",">":"&gt;","&":"&amp;"}[c];}); }
  var KEY = "aog.teacher.reflection.v1";

  var CORE = [
    {en:"What surfaced for me today?", es:"¿Qué surgió en mí hoy?"},
    {en:"What did I want to rush past — and why?", es:"¿Qué quise pasar por alto — y por qué?"},
    {en:"What do I want to carry forward?", es:"¿Qué quiero llevar conmigo?"}
  ];
  var DEEPER = [
    {en:"What has this curriculum surfaced in me that I’ve been carrying?", es:"¿Qué ha hecho surgir en mí este currículo que he estado cargando?"},
    {en:"What lesson hit closer to home than I expected?", es:"¿Qué lección me tocó más de cerca de lo que esperaba?"},
    {en:"What have I been putting down after class that I haven’t named to anyone?", es:"¿Qué he soltado después de clase que no le he nombrado a nadie?"},
    {en:"Who is on my support web right now — and have I actually used it?", es:"¿Quién está en mi red de apoyo ahora — y de verdad la he usado?"},
    {en:"What do I already know about myself that helps me deliver this? What do I not yet know?", es:"¿Qué ya sé de mí mismo/a que me ayuda a enseñar esto? ¿Qué aún no sé?"}
  ];
  var PILLARS = [
    {k:"identity",  c:"#1C5499", en:"Identity",        es:"Identidad"},
    {k:"selfcomp",  c:"#356B25", en:"Self-Compassion", es:"Autocompasión"},
    {k:"forgive",   c:"#9a6f24", en:"Forgiveness",     es:"Perdón"},
    {k:"grace",     c:"#523C9E", en:"Grace",           es:"Grace"}
  ];

  var REFL = { cur: CORE[0], pillar: "" };

  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||"[]")||[]; }catch(e){ return []; } }
  function save(list){ try{ localStorage.setItem(KEY, JSON.stringify(list)); }catch(e){} }

  function fmtDate(ts){
    try{ var d=new Date(ts); return d.toLocaleDateString(es()?"es":"en",{month:"short",day:"numeric",year:"numeric"})+" · "+d.toLocaleTimeString(es()?"es":"en",{hour:"numeric",minute:"2-digit"}); }
    catch(e){ return ""; }
  }

  function pillarById(k){ for(var i=0;i<PILLARS.length;i++){ if(PILLARS[i].k===k) return PILLARS[i]; } return null; }

  function entriesHtml(){
    var list = load().slice().sort(function(a,b){ return b.ts-a.ts; });
    if(!list.length){
      return '<div style="color:var(--ink-faint);font-size:13.5px;font-style:italic;padding:10px 0;">'+L("Your past reflections will appear here — on this device only.","Tus reflexiones anteriores aparecerán aquí — solo en este dispositivo.")+'</div>';
    }
    return list.map(function(e){
      var p = e.pillar ? pillarById(e.pillar) : null;
      var dot = p ? '<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:'+p.c+';margin-right:6px;vertical-align:middle;"></span><span style="font-size:11px;font-weight:700;color:'+p.c+';letter-spacing:.04em;">'+(es()?p.es:p.en).toUpperCase()+'</span>' : '';
      var prompt = es() ? (e.pes||e.pen||"") : (e.pen||e.pes||"");
      return '<div style="border:1px solid var(--rule);border-radius:12px;padding:12px 14px;margin-bottom:10px;background:#fff;text-align:left;">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">'+
          '<span style="font-size:11.5px;color:var(--ink-faint);">'+fmtDate(e.ts)+'</span>'+
          '<button type="button" onclick="window.aogReflDel('+e.ts+')" aria-label="'+L("Delete","Eliminar")+'" title="'+L("Delete","Eliminar")+'" style="background:none;border:0;color:var(--ink-faint);font-size:16px;line-height:1;cursor:pointer;padding:2px 4px;">×</button>'+
        '</div>'+
        (dot?'<div style="margin:4px 0 2px;">'+dot+'</div>':'')+
        '<div style="font-family:var(--font-serif);font-style:italic;font-size:14px;color:var(--navy);margin:4px 0 6px;">'+escT(prompt)+'</div>'+
        '<div style="font-size:14px;line-height:1.6;color:var(--ink);white-space:pre-wrap;">'+escT(e.text)+'</div>'+
      '</div>';
    }).join("");
  }

  function coreChips(){
    return CORE.map(function(p,i){
      var on = (REFL.cur===p);
      return '<button type="button" onclick="window.aogReflPick(\'core\','+i+')" id="reflChip'+i+'" style="font:inherit;font-size:12.5px;font-weight:700;text-align:left;border:1px solid '+(on?'var(--navy)':'var(--rule)')+';background:'+(on?'var(--navy)':'#fff')+';color:'+(on?'#fff':'var(--navy)')+';border-radius:10px;padding:8px 11px;cursor:pointer;flex:1 1 auto;">'+escT(es()?p.es:p.en)+'</button>';
    }).join("");
  }

  function pillarChips(){
    return PILLARS.map(function(p){
      return '<button type="button" onclick="window.aogReflTag(\''+p.k+'\')" id="reflPill_'+p.k+'" style="font:inherit;font-size:11.5px;font-weight:700;border:1.5px solid '+p.c+';background:#fff;color:'+p.c+';border-radius:20px;padding:4px 12px;cursor:pointer;">'+escT(es()?p.es:p.en)+'</button>';
    }).join("");
  }

  window.aogReflPick = function(pool,i){
    REFL.cur = (pool==="core") ? CORE[i] : DEEPER[i];
    var t=document.getElementById("reflPromptText"); if(t) t.textContent = "“"+(es()?REFL.cur.es:REFL.cur.en)+"”";
    for(var k=0;k<CORE.length;k++){
      var ch=document.getElementById("reflChip"+k); if(!ch) continue;
      var on=(REFL.cur===CORE[k]);
      ch.style.background=on?"var(--navy)":"#fff"; ch.style.color=on?"#fff":"var(--navy)"; ch.style.borderColor=on?"var(--navy)":"var(--rule)";
    }
  };
  window.aogReflShuffle = function(){
    var i=Math.floor(Math.random()*DEEPER.length);
    window.aogReflPick("deeper",i);
  };
  window.aogReflTag = function(k){
    REFL.pillar = (REFL.pillar===k) ? "" : k;
    PILLARS.forEach(function(p){
      var b=document.getElementById("reflPill_"+p.k); if(!b) return;
      var on=(REFL.pillar===p.k);
      b.style.background=on?p.c:"#fff"; b.style.color=on?"#fff":p.c;
    });
  };
  window.aogReflSave = function(){
    var ta=document.getElementById("reflText"); if(!ta) return;
    var txt=(ta.value||"").trim(); if(!txt){ ta.focus(); return; }
    var list=load();
    list.push({ ts:Date.now(), pen:REFL.cur.en, pes:REFL.cur.es, pillar:REFL.pillar, text:txt });
    save(list);
    ta.value="";
    var en=document.getElementById("reflEntries"); if(en) en.innerHTML=entriesHtml();
    var msg=document.getElementById("reflSaved");
    if(msg){ msg.textContent=L("Saved — for you, on this device. 💛","Guardado — para ti, en este dispositivo. 💛"); msg.style.opacity="1"; setTimeout(function(){ msg.style.opacity="0"; },2600); }
  };
  window.aogReflDel = function(ts){
    var list=load().filter(function(e){ return e.ts!==ts; });
    save(list);
    var en=document.getElementById("reflEntries"); if(en) en.innerHTML=entriesHtml();
  };
  window.aogReflToggleEntries = function(){
    var w=document.getElementById("reflEntriesWrap"); var chev=document.getElementById("reflEntriesChev");
    if(!w) return; var open=w.style.display!=="none"; w.style.display=open?"none":"block"; if(chev) chev.textContent=open?"▾":"▴";
  };

  function buildReflection(){
    REFL.cur = CORE[0]; REFL.pillar = "";
    var count = load().length;
    return '<div class="tool-modal-icon" aria-hidden="true">📓</div>'+
      '<div class="tool-modal-title">'+L("Teacher Reflection","Reflexión Docente")+'</div>'+
      '<div class="tool-modal-sub">'+L("Five minutes, just for you. This is the same habit you ask students to build — modeled, not just taught.","Cinco minutos, solo para ti. Es el mismo hábito que les pides a tus estudiantes — modelado, no solo enseñado.")+'</div>'+
      '<div style="max-width:560px;margin:14px auto 0;text-align:left;">'+
        '<div style="background:var(--paper);border:1px solid var(--rule);border-radius:12px;padding:10px 13px;font-size:12.5px;line-height:1.55;color:var(--ink-soft);">'+
          '🔒 '+L("Saved only on this device. Never collected, never reviewed, never scored. Not a form, not an accountability measure — a private processing tool, the way the curriculum intends it.","Se guarda solo en este dispositivo. Nunca se recopila, nunca se revisa, nunca se califica. No es un formulario ni una medida de rendición de cuentas — es una herramienta privada de procesamiento, como el currículo lo pretende.")+
        '</div>'+
        '<div style="font-family:var(--font-sans);font-weight:800;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-deep,#9a6f24);margin:16px 0 8px;">'+L("Choose a prompt","Elige una pregunta")+'</div>'+
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">'+coreChips()+'</div>'+
        '<button type="button" onclick="window.aogReflShuffle()" style="margin-top:8px;font:inherit;font-size:12.5px;font-weight:700;background:none;border:1px dashed var(--rule);border-radius:10px;padding:7px 12px;color:var(--ink-soft);cursor:pointer;">🔀 '+L("Try a deeper prompt","Prueba una pregunta más profunda")+'</button>'+
        '<div id="reflPromptText" style="font-family:var(--font-serif);font-style:italic;font-size:18px;line-height:1.5;color:var(--navy);margin:14px 0 8px;">“'+escT(es()?CORE[0].es:CORE[0].en)+'”</div>'+
        '<textarea id="reflText" rows="5" placeholder="'+L("Write freely. No one will read this but you.","Escribe libremente. Nadie leerá esto más que tú.")+'" style="width:100%;box-sizing:border-box;font:inherit;font-size:15px;line-height:1.6;color:var(--ink);border:1px solid var(--rule);border-radius:12px;padding:12px 14px;background:#fff;resize:vertical;"></textarea>'+
        '<div style="font-size:11.5px;color:var(--ink-faint);margin:10px 0 5px;">'+L("Optional — tag a pillar (for your own continuity):","Opcional — etiqueta un pilar (para tu propia continuidad):")+'</div>'+
        '<div style="display:flex;gap:7px;flex-wrap:wrap;">'+pillarChips()+'</div>'+
        '<div style="display:flex;align-items:center;gap:12px;margin-top:14px;">'+
          '<button type="button" onclick="window.aogReflSave()" style="font:inherit;font-size:14px;font-weight:800;background:var(--gold);color:var(--navy);border:0;border-radius:10px;padding:10px 20px;cursor:pointer;">'+L("Save reflection","Guardar reflexión")+'</button>'+
          '<span id="reflSaved" aria-live="polite" style="font-size:13px;color:var(--gold-deep,#9a6f24);opacity:0;transition:opacity .3s;"></span>'+
        '</div>'+
        '<div style="font-family:var(--font-serif);font-style:italic;font-size:16px;color:var(--ink-soft);text-align:center;margin:22px 0 4px;">'+L("You don’t have to be perfect. You have to be present.","No tienes que ser perfecto/a. Tienes que estar presente.")+'</div>'+
        '<div style="border-top:1px solid var(--rule);margin-top:14px;padding-top:8px;">'+
          '<button type="button" onclick="window.aogReflToggleEntries()" style="width:100%;display:flex;justify-content:space-between;align-items:center;background:none;border:0;font:inherit;font-weight:800;font-size:13px;color:var(--navy);cursor:pointer;padding:6px 0;">'+
            '<span>'+L("Past reflections","Reflexiones anteriores")+' ('+count+')</span><span id="reflEntriesChev">▾</span></button>'+
          '<div id="reflEntriesWrap" style="display:none;margin-top:8px;"><div id="reflEntries">'+entriesHtml()+'</div></div>'+
        '</div>'+
        '<div style="margin-top:12px;font-size:11px;line-height:1.5;color:var(--ink-faint);">'+L("Architecture of Grace · PD Block 5 — Teacher Reflection as Personal Practice. Five minutes after each lesson is professional infrastructure, not an afterthought.","Architecture of Grace · Bloque 5 del PD — La Reflexión Docente como práctica personal. Cinco minutos después de cada lección son infraestructura profesional, no algo secundario.")+'</div>'+
      '</div>';
  }
  function initReflection(){}

  window.aogReflectNudgeHtml = function(E){
    return '<div style="border:1px solid var(--rule);border-left:4px solid var(--gold);border-radius:14px;background:var(--paper);padding:13px 16px;margin:0 0 14px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;">'+
      '<div style="flex:1 1 240px;">'+
        /* --ink, not --navy: this line sits on the card, and the card's ground
           follows the theme while --navy does not. Measured 1.05:1 in dark. */
        '<div style="font-family:var(--font-serif);font-size:17px;color:var(--ink,#22303F);">'+(E?'Tómate cinco para ti':'Take five for yourself')+'</div>'+
        '<div style="font-size:13px;line-height:1.5;color:var(--ink-soft);margin-top:2px;">'+(E?'Una reflexión privada — primero, cuida a los adultos. Nada sale de este dispositivo.':'A private moment for you. Take care of the grown-ups too. Nothing leaves this device.')+'</div>'+
      '</div>'+
      '<button type="button" onclick="if(window.toolOpen){window.toolOpen(\'reflection\');}" style="font:inherit;font-weight:800;font-size:13.5px;background:var(--gold);color:var(--navy);border:0;border-radius:10px;padding:10px 18px;cursor:pointer;white-space:nowrap;">📓 '+(E?'Reflexionar ahora →':'Reflect now →')+'</button>'+
    '</div>';
  };
  window.aogReflectionLeadershipCard = function(){
    return '<div class="gc-card" style="margin:0 0 16px;border-top:3px solid #356B25;">'+
      '<div class="gc-head" onclick="if(window.gcToggle)gcToggle(this)"><span class="gt">'+L("Teacher Reflection — personal practice (PD Block 5)","Reflexión Docente — práctica personal (Bloque 5 del PD)")+'</span><span class="gchev">▾</span></div>'+
      '<div class="gc-body"><div class="gc-intro">'+L("The most important structural element for teacher sustainability. Open it to model the habit in Block 5 — five private minutes after each lesson, never collected.","El elemento estructural más importante para la sostenibilidad docente. Ábrelo para modelar el hábito en el Bloque 5 — cinco minutos privados después de cada lección, nunca recopilados.")+'</div>'+
      '<div class="rn-teacher-tools" style="margin-top:12px;"><button type="button" onclick="if(window.toolOpen){window.toolOpen(\'reflection\');}">'+L("📓 Open Teacher Reflection","📓 Abrir Reflexión Docente")+'</button></div></div></div>';
  };
  function reg(){ if(window.TOOLS){ window.TOOLS.reflection = { builder: buildReflection, init: initReflection }; } }
  if(window.TOOLS){ reg(); } else { window.addEventListener("load", reg); }
})();
