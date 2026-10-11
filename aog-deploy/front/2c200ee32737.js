
(function(){
  var OPTS=[["Not at all","Para nada"],["Several days","Varios días"],["More than half the days","Más de la mitad de los días"],["Nearly every day","Casi todos los días"]];
  var PHQ9={ key:"phq9", name:"PHQ-9", max:27, bands:[[4,"minimal"],[9,"mild"],[14,"moderate"],[19,"moderately severe"],[27,"severe"]],
    items:["Little interest or pleasure in doing things","Feeling down, depressed, or hopeless","Trouble falling or staying asleep, or sleeping too much","Feeling tired or having little energy","Poor appetite or overeating","Feeling bad about yourself — or that you are a failure or have let yourself or your family down","Trouble concentrating on things, such as reading or watching television","Moving or speaking so slowly that others could have noticed — or the opposite, being so fidgety or restless that you move around much more than usual","Thoughts that you would be better off dead, or of hurting yourself in some way"],
    itemsEs:["Poco interés o placer en hacer cosas","Sentirse desanimado/a, deprimido/a o sin esperanza","Problemas para dormir o dormir demasiado","Sentirse cansado/a o con poca energía","Poco apetito o comer en exceso","Sentirse mal consigo mismo/a — o sentir que es un fracaso o que ha fallado a sí mismo/a o a su familia","Dificultad para concentrarse, como leer o ver televisión","Moverse o hablar tan lento que otros podrían notarlo — o lo contrario, estar tan inquieto/a que se mueve mucho más de lo habitual","Pensamientos de que estaría mejor muerto/a o de hacerse daño de alguna manera"] };
  var GAD7={ key:"gad7", name:"GAD-7", max:21, bands:[[4,"minimal"],[9,"mild"],[14,"moderate"],[21,"severe"]],
    items:["Feeling nervous, anxious, or on edge","Not being able to stop or control worrying","Worrying too much about different things","Trouble relaxing","Being so restless that it is hard to sit still","Becoming easily annoyed or irritable","Feeling afraid as if something awful might happen"],
    itemsEs:["Sentirse nervioso/a, ansioso/a o con los nervios de punta","No poder dejar de preocuparse o controlar la preocupación","Preocuparse demasiado por diferentes cosas","Dificultad para relajarse","Estar tan inquieto/a que es difícil quedarse sentado/a","Irritarse o enojarse con facilidad","Sentir miedo como si algo terrible fuera a pasar"] };
  function defOf(t){ return t==="gad7"?GAD7:PHQ9; }
  function severity(tool,score){ var b=defOf(tool).bands; for(var i=0;i<b.length;i++){ if(score<=b[i][0]) return b[i][1]; } return b[b.length-1][1]; }
  function sevLabel(k,es){ var M={minimal:["minimal","mínimo"],mild:["mild","leve"],moderate:["moderate","moderado"],"moderately severe":["moderately severe","moderadamente severo"],severe:["severe","severo"]}; var m=M[k]||[k,k]; return es?m[1]:m[0]; }
  function sevColor(tool,score){ var sv=severity(tool,score); return sv==="minimal"?"#7FBE8C":(sv==="mild"?"#EFC06A":"#E08A6B"); }
  function escClin(t){ return String(t==null?"":t).replace(/[<>&]/g,function(c){return {"<":"&lt;",">":"&gt;","&":"&amp;"}[c];}); }
  function qA(s){ return String(s==null?"":s).replace(/\\/g,"\\\\").replace(/'/g,"\\'"); }
  function store(){ try{ var o=JSON.parse(localStorage.getItem("aog.clinical.v1")||"{}"); if(!o.clients) o.clients={}; return o; }catch(e){ return {clients:{}}; } }
  function save(o){ try{ localStorage.setItem("aog.clinical.v1", JSON.stringify(o)); }catch(e){} }
  function ES(){ return (typeof lang!=="undefined"&&lang==="es"); }

  /* Book 6 (Adult Edition) concept bridge — names the group-therapy facilitator
     manual's throughlines so a specialist feels continuity with the K–12 language.
     Reference only; NOT client data and NOT staff PD. */
  var AOG_B6_ANCHORS=[
    ["Living Amend","La enmienda viva",
     "Repair as ongoing changed behavior, not a single apology — the adult form of “Make It Right.”",
     "La reparación como una conducta cambiada y sostenida, no una sola disculpa — la forma adulta de “Repararlo.”",
     "Social & repair (Domain C)","Relación y reparación (Dominio C)"],
    ["Grief vs. Resentment","Duelo vs. resentimiento",
     "Naming a loss so it can move through, instead of letting it harden into resentment.",
     "Nombrar una pérdida para que pueda transitar, en lugar de dejar que se endurezca en resentimiento.",
     "Self-compassion (Domain B)","Autocompasión (Dominio B)"],
    ["Compassionate Witness","Testigo compasivo",
     "Staying present to another’s pain without rushing to fix it — the adult co-regulation stance.",
     "Acompañar el dolor del otro sin apresurarse a arreglarlo — la postura adulta de co-regulación.",
     "Co-regulation · trusted adult","Co-regulación · adulto de confianza"],
    ["Moral Injury","Daño moral",
     "The wound of having acted against one’s own values, or of being failed by someone trusted.",
     "La herida de haber actuado contra los propios valores, o de ser defraudado por alguien de confianza.",
     "Self-compassion (Domain B)","Autocompasión (Dominio B)"],
    ["The Group Compact","El pacto del grupo",
     "The shared agreement that makes a group safe enough to do this work — the adult of the class compact.",
     "El acuerdo compartido que hace al grupo lo bastante seguro para este trabajo — el equivalente adulto del pacto del aula.",
     "Community agreements","Acuerdos de comunidad"]
  ];
  function b6BridgeHtml(es){
    var open=!!window.__aogB6Open;
    var rows=AOG_B6_ANCHORS.map(function(a,i){
      return '<div class="cln-b6'+(i===0?" first":"")+'"><div class="cln-b6-t">'+escClin(es?a[1]:a[0])+'</div>'+
        '<div class="cln-b6-d">'+escClin(es?a[3]:a[2])+'</div>'+
        '<div class="cln-b6-link">'+(es?"Continúa: ":"Continues: ")+escClin(es?a[5]:a[4])+'</div></div>';
    }).join("");
    return '<div class="cln-sec cln-b6sec">'+
      '<button type="button" class="cln-b6-head" aria-expanded="'+(open?"true":"false")+'" onclick="aogB6Toggle()">'+
        '<span>📘 '+(es?"Anclas de la Edición para Adultos (Libro 6)":"Adult Edition anchors (Book 6)")+'</span>'+
        '<span class="cln-b6-chev">'+(open?"▾":"▸")+'</span></button>'+
      (open?('<div class="cln-b6-intro">'+(es?"Throughlines del manual de facilitación de terapia de grupo del Libro 6, en continuidad con el lenguaje de Referencia conceptual — no son datos de cliente ni formación docente.":"Throughlines from the Book 6 group-therapy facilitator manual, in continuity with the K–12 language. A conceptual reference — not client data and not staff PD.")+'</div>'+rows):'')+
      '</div>';
  }
  window.aogB6Toggle=function(){ window.__aogB6Open=!window.__aogB6Open; if(typeof window.aogClinicalRender==="function") aogClinicalRender(); };

  function screenForm(es){
    var d=defOf(window.__aogScreenForm); var items=es?d.itemsEs:d.items;
    var head=es?"Durante las últimas 2 semanas, ¿con qué frecuencia te ha molestado…":"Over the last 2 weeks, how often have you been bothered by…";
    var q=items.map(function(it,i){
      var opts=OPTS.map(function(o,v){ return '<label class="cln-opt"><input type="radio" name="cq'+i+'" value="'+v+'"> '+(es?o[1]:o[0])+'</label>'; }).join("");
      return '<div class="cln-q"><div class="cln-qt">'+(i+1)+". "+escClin(it)+'</div><div class="cln-opts">'+opts+'</div></div>';
    }).join("");
    return '<div class="cln-form-h">'+d.name+'</div><div class="cln-form-sub">'+head+'</div>'+q+
      '<div class="cln-form-foot"><button type="button" class="cln-btn" onclick="aogClinicScreenSubmit()">'+(es?"Guardar y puntuar":"Save & score")+'</button>'+
      '<button type="button" class="cln-btn ghost" onclick="aogClinicCancelScreen()">'+(es?"Cancelar":"Cancel")+'</button></div>';
  }
  function clnSpark(screens, tool){
    var rows=(screens||[]).filter(function(x){return x.tool===tool;}).slice().reverse();
    if(rows.length<2) return "";
    var max=defOf(tool).max, W=240,H=54,pad=8;
    var pts=rows.map(function(r,i){ var x=pad+i*(W-2*pad)/(rows.length-1); var y=pad+(r.score/max)*(H-2*pad); return [x,y]; });
    var line=pts.map(function(p){return p[0].toFixed(1)+","+p[1].toFixed(1);}).join(" ");
    var dots=pts.map(function(p){return '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="3" fill="#EAF1F9"/>';}).join("");
    return '<div class="cln-spark"><div class="cln-spark-lab">'+(tool==="gad7"?"GAD-7":"PHQ-9")+' · '+rows[rows.length-1].score+'/'+max+'</div><svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid meet"><polyline points="'+line+'" fill="none" stroke="#D9A33B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'+dots+'</svg></div>';
  }
  function clientPanel(c, es){
    var phq=(c.screens||[]).filter(function(x){return x.tool==="phq9";})[0];
    var gad=(c.screens||[]).filter(function(x){return x.tool==="gad7";})[0];
    var sup="";
    if(phq && phq.flag) sup+='<div class="cln-sup">'+(es?"⚠ El ítem 9 (ideación de autolesión) fue endorsado en el último PHQ-9. Sigue tu protocolo de seguridad/supervisión y evalúa directamente.":"⚠ Item 9 (self-harm ideation) was endorsed on the latest PHQ-9. Follow your safety/supervision protocol and assess directly.")+'</div>';
    if((phq&&phq.score>=20)||(gad&&gad.score>=15)) sup+='<div class="cln-sup amber">'+(es?"Puntaje en rango severo — considera una revisión de supervisión.":"Score in the severe range — consider a supervision review.")+'</div>';
    var S=window.AOG_SESSIONS||[];
    var done=Object.keys(c.sessions||{}).filter(function(k){return c.sessions[k]&&c.sessions[k].done;}).length;
    var pills=S.map(function(x){ var on=c.sessions&&c.sessions[x.n]&&c.sessions[x.n].done; return '<button type="button" class="cln-sess'+(on?" on":"")+'" title="'+escClin(x.title)+'" onclick="aogClinicToggleSession(\''+qA(c.code)+'\','+x.n+')">'+x.n+'</button>'; }).join("");
    var hist=(c.screens||[]).map(function(sc,i){ var dt=new Date(sc.date),ds=isNaN(dt)?"":dt.toLocaleDateString(); return '<div class="cln-hist"><span class="cln-hist-d">'+ds+'</span><span class="cln-hist-t">'+(sc.tool==="gad7"?"GAD-7":"PHQ-9")+'</span><span class="cln-hist-s" style="color:'+sevColor(sc.tool,sc.score)+'">'+sc.score+"/"+sc.max+" · "+sevLabel(sc.severity,es)+(sc.flag?' <b>'+(es?"señal":"flag")+'</b>':"")+'</span><button class="cln-hist-x" onclick="aogClinicDelScreen(\''+qA(c.code)+'\','+i+')" aria-label="Delete">×</button></div>'; }).join("") || ('<div class="cln-empty2">'+(es?"Aún no hay tamizajes.":"No screeners yet.")+'</div>');
    var screenArea = window.__aogScreenForm ? screenForm(es) : ('<div class="cln-screen-btns"><button type="button" class="cln-btn" onclick="aogClinicNewScreen(\'phq9\')">+ PHQ-9</button><button type="button" class="cln-btn" onclick="aogClinicNewScreen(\'gad7\')">+ GAD-7</button></div>');
    var trends=clnSpark(c.screens,"phq9")+clnSpark(c.screens,"gad7");
    return sup+
      '<div class="cln-sec"><div class="cln-sec-h">'+(es?"Sesiones · Edición para Profesionales":"Sessions · Practitioner Edition")+' <span class="cln-prog">'+done+'/12</span></div><div class="cln-sess-row">'+pills+'</div></div>'+
      '<div class="cln-sec"><div class="cln-sec-h">'+(es?"Tamizajes":"Screeners")+'</div>'+screenArea+(trends?'<div class="cln-sec-h" style="margin-top:8px;">'+(es?"Tendencia":"Trend")+'</div><div class="cln-trends">'+trends+'</div>':'')+'<div class="cln-hist-list">'+hist+'</div></div>';
  }
  window.aogClinicalRender=function(){
    var host=document.getElementById("aogClinical"); if(!host) return;
    var es=ES(); var s=store(); var codes=Object.keys(s.clients||{});
    var sel=window.__aogClient; if(!sel||!s.clients[sel]) sel=codes[0]||null; window.__aogClient=sel;
    var recs=(typeof getAllRecords==="function"?getAllRecords():[])||[]; var unsafe=0,notrust=0; recs.forEach(function(r){ if(r&&r.unsafeFlag)unsafe++; if(r&&r.trustedAdultFlag)notrust++; });
    var roster=codes.map(function(cd){ return '<button type="button" class="cln-chip'+(cd===sel?" active":"")+'" onclick="aogClinicSelect(\''+qA(cd)+'\')">'+escClin(cd)+'</button>'; }).join("");
    var body = !sel
      ? '<div class="cln-empty">'+(es?"Agrega tu primer cliente (un código anónimo) para registrar sesiones y tamizajes. Todo se guarda solo en este dispositivo.":"Add your first client (an anonymized code) to start tracking sessions and screeners. Everything is saved on this device only.")+'</div>'
      : clientPanel(s.clients[sel], es)+'<div class="cln-danger"><button type="button" class="cln-del" onclick="aogClinicDelClient(\''+qA(sel)+'\')">'+(es?"Eliminar cliente":"Delete client")+'</button></div>';
    host.innerHTML='<div class="cln"><div class="cln-top"><div class="cln-title">'+(es?"Espacio clínico — Edición para Profesionales":"Clinical workspace — Practitioner Edition")+'</div>'+
      '<div class="cln-note">'+(es?"Privado en este dispositivo · usa códigos anónimos, nunca nombres · PHQ-9 y GAD-7 son tamizajes validados, no diagnósticos.":"Private to this device · use anonymized codes, never names · PHQ-9 and GAD-7 are validated screeners, not diagnoses.")+'</div>'+
      '<div style="margin-top:10px;"><button type="button" class="cln-btn ghost" onclick="if(typeof showScreen===\'function\'){showScreen(\'screen-teacher-tools\');}">🧰 '+(es?"Herramientas de calma y regulación":"Calm & Regulation Tools")+'</button></div></div>'+
      '<div class="cln-flags"><span>'+unsafe+" "+(es?"señales de seguridad":"safety flags")+'</span><span>'+notrust+" "+(es?"sin adulto de confianza":"no trusted adult")+'</span></div>'+
      '<div class="cln-roster">'+roster+'<button type="button" class="cln-chip add" onclick="aogClinicAddClient()">+ '+(es?"Cliente":"Client")+'</button></div>'+
      body+b6BridgeHtml(es)+'</div>';
  };
  window.aogClinicSelect=function(cd){ window.__aogClient=cd; window.__aogScreenForm=null; aogClinicalRender(); };
  window.aogClinicAddClient=function(){ var es=ES(); var code=window.prompt(es?"Código del cliente (anónimo, no un nombre):":"Client code (anonymized — not a name):"); if(!code) return; code=String(code).trim().slice(0,40); if(!code) return; var s=store(); if(!s.clients[code]) s.clients[code]={code:code,created:new Date().toISOString(),sessions:{},screens:[]}; save(s); window.__aogClient=code; window.__aogScreenForm=null; aogClinicalRender(); };
  window.aogClinicDelClient=function(cd){ var es=ES(); if(!window.confirm(es?"¿Eliminar este cliente y todos sus datos de este dispositivo?":"Delete this client and all their data from this device?")) return; var s=store(); delete s.clients[cd]; save(s); window.__aogClient=null; aogClinicalRender(); };
  window.aogClinicToggleSession=function(cd,n){ var s=store(); var c=s.clients[cd]; if(!c) return; c.sessions=c.sessions||{}; if(c.sessions[n]&&c.sessions[n].done) delete c.sessions[n]; else c.sessions[n]={done:true,date:new Date().toISOString()}; save(s); aogClinicalRender(); };
  window.aogClinicNewScreen=function(tool){ window.__aogScreenForm=(tool==="gad7"?"gad7":"phq9"); aogClinicalRender(); };
  window.aogClinicCancelScreen=function(){ window.__aogScreenForm=null; aogClinicalRender(); };
  window.aogClinicScreenSubmit=function(){
    var es=ES(); var tool=window.__aogScreenForm; var d=defOf(tool); var n=d.items.length; var ans=[];
    for(var i=0;i<n;i++){ var el=document.querySelector('input[name="cq'+i+'"]:checked'); if(!el){ window.alert(es?"Por favor responde todas las preguntas.":"Please answer every item."); return; } ans.push(parseInt(el.value,10)); }
    var score=ans.reduce(function(a,b){return a+b;},0);
    var s=store(); var c=s.clients[window.__aogClient]; if(!c) return;
    c.screens.unshift({ date:new Date().toISOString(), tool:tool, score:score, max:d.max, severity:severity(tool,score), item9:(tool==="phq9"?ans[8]:null), flag:(tool==="phq9"&&ans[8]>0) });
    save(s); window.__aogScreenForm=null; aogClinicalRender();
  };
  window.aogClinicDelScreen=function(cd,idx){ var s=store(); var c=s.clients[cd]; if(c&&c.screens){ c.screens.splice(idx,1); save(s); } aogClinicalRender(); };
})();
