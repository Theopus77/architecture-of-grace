
(function(){
  window.aogTeacherCalmCardHtml=function(es){
    var body = es
      ? "Mantenlo como un reinicio, nunca como un castigo. Prueba: «Ve a hacer un Ahora Mismo en la computadora, sé honesto, prueba lo que sugiere, y vuelve cuando estés listo.» Nada se guarda — es privado del estudiante. Buscas a un niño más tranquilo que regresa por su cuenta, no un reporte."
      : "Make it a reset, never a punishment. Try saying: “Go do a Right Now at the computer. Be honest, try what it suggests, and come back when you’re ready.” Nothing is saved; it’s private. The goal is a calmer student coming back on their own, not a report.";
    var _tcChips=[['scenarios',es?'Cuando un estudiante…':'When a student…'],['findfunction',es?'Encuentra la función':'Find the function'],['classreset',es?'Momento en círculo':'Circle Time'],['coreg',es?'Co-regulación':'Co-regulation script'],['innercoach',es?'Guía interior':'Inner Coach'],['makeitright',es?'Reparar':'Make it right'],['reflection',es?'📓 Reflexión docente':'📓 Teacher Reflection'],['glossary',es?'📖 Glosario':'📖 Glossary']];
    var _tcChipsHtml='<div class="rn-teacher-tools" style="margin-top:12px;">'+_tcChips.map(function(c){ return '<button type="button" onclick="if(window.toolOpen){window.toolOpen(\''+c[0]+'\');}">'+c[1]+'</button>'; }).join('')+'</div>';
    var _tcSafety='<button type="button" onclick="if(window.toolOpen){window.toolOpen(\'disclosure\');}" style="display:flex;align-items:center;gap:10px;width:100%;text-align:left;margin:0 0 14px;padding:11px 14px;border:1.5px solid #B5503F;border-radius:12px;background:rgba(181,80,63,.05);color:#B5503F;font:inherit;font-weight:800;font-size:14px;cursor:pointer;"><span aria-hidden="true" style="font-size:18px;">🛡️</span><span>'+(es?'Si un estudiante revela algo — el protocolo de 6 pasos →':'If a student discloses — the 6-step protocol →')+'</span></button>';
    /* The Station Guide (.30dd) — same distilled playbook the Quiet Space
       drawer carries, so the dashboard card and the station never diverge.
       say:true because this surface has no What To Say Instead panel of its
       own; no safety flag because the card's own red button is right above. */
    var _tcGuide=(typeof window.aogCalmGuideCoreHtml==='function')?window.aogCalmGuideCoreHtml(es,{say:true}):'';
    return '<div class="gc-card" style="margin:0 0 16px;"><div class="gc-head" onclick="if(window.gcToggle)gcToggle(this)"><span class="gt">'+
      (es?"Para docentes — usar esto como rincón de calma":"For teachers — using this as a calm-down station")+
      '</span><span class="gchev">▾</span></div><div class="gc-body">'+_tcSafety+'<div class="gc-intro">'+body+'</div>'+_tcGuide+_tcChipsHtml+'</div></div>';
  };
  window.aogSpecialistPanelHtml=function(es){
    var recs=(typeof getAllRecords==="function"?getAllRecords():[])||[];
    var unsafe=0, notrust=0;
    recs.forEach(function(r){ if(r&&r.unsafeFlag) unsafe++; if(r&&r.trustedAdultFlag) notrust++; });
    var S=window.AOG_SESSIONS||[];
    var sess=S.map(function(s){
      return '<div class="spx-sess"><span class="spx-n">'+s.n+'</span><div><div class="spx-t">'+s.title+(s.risk?' <span class="spx-risk">'+(es?"riesgo":"risk")+'</span>':'')+'</div><div class="spx-p">'+s.phase+'</div></div></div>';
    }).join("");
    return '<div class="spx"><div class="spx-h">'+(es?"Vista clínica — Edición para Profesionales":"Clinical view — Practitioner Edition")+'</div>'+
      '<div class="spx-flags"><div class="spx-flag"><div class="spx-flag-n">'+unsafe+'</div><div class="spx-flag-l">'+(es?"señales de seguridad":"safety flags raised")+'</div></div>'+
        '<div class="spx-flag"><div class="spx-flag-n">'+notrust+'</div><div class="spx-flag-l">'+(es?"sin adulto de confianza":"no trusted adult named")+'</div></div></div>'+
      '<div class="spx-sub">'+(es?"Las 12 sesiones de la Edición para Profesionales (terapia de grupo · trauma y recuperación). Las marcadas incluyen un tamizaje de riesgo (PHQ-9 / GAD-7).":"The 12 Practitioner Edition sessions (group therapy · trauma & recovery). Flagged sessions include a risk screen (PHQ-9 / GAD-7).")+'</div>'+
      '<div class="spx-list">'+sess+'</div></div>';
  };
  function sjBandCol(n){ return n<50?"#B5503F":(n<75?"#C98A2E":"#2E8B6B"); }
  function sjLineSvg(mine,es){
    var n=mine.length; if(n<2) return "";
    var W=600,H=90,pad=14;
    var pts=mine.map(function(r,i){ var x=pad+i*(W-2*pad)/(n-1); var v=Math.max(0,Math.min(100,r.normComposite)); var y=H-pad-(v/100)*(H-2*pad); return [x,y]; });
    var line=pts.map(function(p){return p[0].toFixed(1)+","+p[1].toFixed(1);}).join(" ");
    var dots=pts.map(function(p){return '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="4.5" fill="#0A1E33"/>';}).join("");
    return '<svg class="sj-spark" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+(es?"crecimiento en el tiempo":"growth over time")+'"><polyline points="'+line+'" fill="none" stroke="#9a6f24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'+dots+'</svg>';
  }
  function sjGrowthBars(mine,es){
    var n=mine.length; if(n<1) return "";
    var W=600,H=90,pad=14;
    var bw=Math.max(8,Math.min(46,(W-2*pad)/n-8)); var gap=((W-2*pad)-bw*n)/(n+1);
    var bars=mine.map(function(r,i){ var v=Math.max(0,Math.min(100,Math.round(r.normComposite))); var h=(v/100)*(H-2*pad-12); var x=pad+gap+i*(bw+gap); var y=H-pad-h; var col=sjBandCol(v);
      return '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="3" fill="'+col+'"/><text x="'+(x+bw/2).toFixed(1)+'" y="'+(y-3).toFixed(1)+'" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#46506E">'+v+'</text>';
    }).join("");
    return '<svg class="sj-spark" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+(es?"crecimiento por registro":"growth per check-in")+'">'+bars+'</svg>';
  }
  function sjGrowthChart(mine,es){
    var lab=(es?"Tu crecimiento":"Your growth");
    if(!mine||mine.length<2){ return '<div class="sj-spark-wrap"><div class="sj-spark-lab">'+lab+'</div><div class="sj-hint">'+(es?"La línea de tendencia aparece después del segundo registro.":"The trend line appears after the second check-in.")+'</div></div>'; }
    var view=(window.__aogSjView==="bars")?"bars":"line";
    var seg='<span class="sj-seg" role="group" aria-label="'+(es?"Tipo de gráfico":"Chart type")+'"><button type="button" class="'+(view==="line"?"on":"")+'" onclick="aogSjView(\'line\')">'+(es?"Línea":"Line")+'</button><button type="button" class="'+(view==="bars"?"on":"")+'" onclick="aogSjView(\'bars\')">'+(es?"Barras":"Bars")+'</button></span>';
    var body=(view==="bars")?sjGrowthBars(mine,es):sjLineSvg(mine,es);
    return '<div class="sj-spark-wrap"><div class="sj-spark-head"><div class="sj-spark-lab">'+lab+'</div>'+seg+'</div>'+body+'</div>';
  }
  window.aogSjView=function(v){ window.__aogSjView=(v==="bars")?"bars":"line"; if(typeof window.aogRenderStudentJourney==="function") window.aogRenderStudentJourney(window.__aogSjTarget||"dashStudentJourney"); };
  function sjSpark(mine,es){
    if(mine.length<2) return "";
    return '<div class="sj-spark-wrap"><div class="sj-spark-lab">'+(es?"Tu crecimiento":"Your growth")+'</div>'+sjLineSvg(mine,es)+'</div>';
  }
  function sjBars(r,es){
    var doms=[[es?"Regulación":"Regulation",r.normA],[es?"Autocompasión":"Self-compassion",r.normB],[es?"Relación y reparación":"Social & repair",r.normC]];
    var rows=doms.map(function(d){ if(d[1]==null) return ""; var n=Math.round(d[1]); var col=sjBandCol(n); return '<div class="sj-bar"><div class="sj-bar-top"><span>'+d[0]+'</span><span style="color:'+col+'">'+n+'</span></div><div class="sj-bar-track"><div class="sj-bar-fill" style="width:'+n+'%;background:'+col+'"></div></div></div>'; }).join("");
    return rows?('<div class="sj-bars"><div class="sj-spark-lab">'+(es?"Tus áreas":"Your areas")+'</div>'+rows+'</div>'):"";
  }
  /* Sparkline needs 2+ points; with a single check-in, show a calm hint
     instead of a blank gap (so it doesn't read as broken). */
  function sjSparkOrHint(mine,es){ return (mine&&mine.length>=2) ? sjSpark(mine,es) : ('<div class="sj-hint">'+(es?"La línea de tendencia aparece después del segundo registro.":"The trend line appears after the second check-in.")+'</div>'); }
  var SJ_AFF=[["You showed up — that counts.","Te presentaste — eso cuenta."],["Noticing how you feel is a strength.","Notar cómo te sientes es una fortaleza."],["Growth isn’t a straight line, and that’s okay.","Crecer no es una línea recta, y está bien."],["Be as kind to yourself as you’d be to a friend.","Sé tan amable contigo como con un amigo."],["Small steps still move you forward.","Los pasos pequeños también te hacen avanzar."]];
  function sjAff(mine,es){ var a=SJ_AFF[mine.length % SJ_AFF.length]; return '<div class="sj-aff">“'+(es?a[1]:a[0])+'”</div>'; }
  /* "Today" hero — the welcome-back card that answers "what do I do?" first. */
  function aogAgo(ts,es){
    var d=Math.floor((Date.now()-new Date(ts))/86400000);
    if(isNaN(d)||d<=0) return es?"hoy":"today";
    if(d===1) return es?"ayer":"yesterday";
    if(d<7) return es?("hace "+d+" días"):(d+" days ago");
    var w=Math.floor(d/7); if(w<5) return es?("hace "+w+(w===1?" semana":" semanas")):(w+(w===1?" week":" weeks")+" ago");
    var m=Math.floor(d/30); return es?("hace "+m+(m===1?" mes":" meses")):(m+(m===1?" month":" months")+" ago");
  }
  function qaT(s){ return String(s==null?"":s).replace(/\\/g,"\\\\").replace(/'/g,"\\'"); }
  function escT(t){ return String(t==null?"":t).replace(/[<>&]/g,function(c){return {"<":"&lt;",">":"&gt;","&":"&amp;"}[c];}); }
  function nickGet(){ try{ return (localStorage.getItem("aog.nickname")||"").trim(); }catch(e){ return ""; } }
  window.aogTodayNick=function(){
    var es=(typeof lang!=="undefined"&&lang==="es");
    var v=window.prompt(es?"Tu nombre o apodo (solo en este dispositivo, nunca se sincroniza):":"Your name or nickname (this device only — never synced):", nickGet());
    if(v===null) return; v=String(v).trim().slice(0,40);
    try{ if(v) localStorage.setItem("aog.nickname",v); else localStorage.removeItem("aog.nickname"); }catch(e){}
    if(window.__aogDashRepaint) window.__aogDashRepaint();
  };
  window.aogTodayCard=function(es){
    var scr=document.getElementById("screen-admin"); var role=(scr&&scr.getAttribute("data-role"))||"teacher";
    var h=new Date().getHours();
    var greet=h<12?(es?"Buenos días":"Good morning"):(h<18?(es?"Buenas tardes":"Good afternoon"):(es?"Buenas noches":"Good evening"));
    var recs=(typeof getAllRecords==="function"?getAllRecords():[])||[];
    recs=recs.filter(function(r){return r&&r.normComposite!=null;}).sort(function(a,b){return new Date(b.timestamp)-new Date(a.timestamp);});
    var sub, label, act;
    if(role==="student"){
      /* Was: recs[0], i.e. the most recent SELF-REFLECTION, described as a
         "check-in" and paired with a button that opened the reflection. Both
         halves now mean the daily check-in. */
      var last=null;
      try{ var lc=(typeof window.aogLastStudentCheckin==="function")?window.aogLastStudentCheckin():null; if(lc) last={timestamp:lc}; }catch(eLC){}
      sub = last ? ((es?"Tu último registro fue ":"Your last check-in was ")+aogAgo(last.timestamp,es)+".") : (es?"Aún no has hecho un registro — este es un buen momento.":"You haven’t checked in yet — now’s a good time.");
      label=es?"Hacer el registro de hoy":"Start today’s check-in"; act="if(window.aogOpenDailyCheckin)aogOpenDailyCheckin(); else if(window.startCheckin)startCheckin()";
    } else if(role==="parent"){
      var sel=(typeof _familySel!=="undefined")?_familySel:null;
      if(!sel){ sub=es?"Agrega a un miembro de la familia para empezar.":"Add a family member to begin."; label=es?"Añadir miembro":"Add family member"; act="if(window.familyAddChild)familyAddChild()"; }
      else {
        var fr=(typeof familyRecordsFor==="function")?familyRecordsFor(sel):[]; var lf=fr&&fr.length?fr[fr.length-1]:null;
        sub = lf ? (escT(sel)+(es?": último registro hace ":"’s last check-in was ")+aogAgo(lf.timestamp,es)+".") : (escT(sel)+(es?" aún no tiene registros — empieza cuando estén listos.":" hasn’t checked in yet — start when you’re both ready."));
        var pg=(typeof familyAllChildren==="function")?((familyAllChildren().find(function(c){return c.id===sel;})||{}).grade||""):"";
        label=es?"Nuevo registro":"New check-in"; act="if(window.familyNewCheckin)familyNewCheckin('"+qaT(sel)+"','"+qaT(pg)+"')";
      }
    } else if(role==="leadership"){
      sub=(recs.length===1 ? (es?"1 autorreflexión en esta ventana":"1 self-reflection this window") : recs.length+(es?" autorreflexiones en esta ventana":" self-reflections this window"))+(es?" · solo tendencias agregadas.":" · aggregate trends only.");
      label=es?"Abrir vista del distrito":"Open district rollup"; act="location.href='/aog-district-admin-view-demo'";
    } else {
      /* These are self-reflections, not daily check-ins. Calling them
         "check-ins" put "No check-ins yet — share a link to begin" directly
         above "92 check-ins today" on the same card. 2026-08-27 */
      sub = recs.length ? (recs.length === 1 ? (es?"1 autorreflexión hasta ahora.":"1 self-reflection so far.") : (recs.length+(es?" autorreflexiones hasta ahora.":" self-reflections so far."))) : (es?"Aún no hay autorreflexiones — comparte un enlace para empezar.":"No self-reflections yet — share a link to begin.");
      label=""; act="";
    }
    var nick=nickGet();
    return '<div class="dash-today"><div class="dt-greet">'+greet+(nick?(", "+escT(nick)):"")+'. <button type="button" class="dt-nick" onclick="aogTodayNick()">'+(nick?(es?"editar":"edit"):(es?"+ tu nombre":"+ add your name"))+'</button></div><div class="dt-sub">'+sub+'</div>'+(act?('<button type="button" class="dt-btn" onclick="'+act+'">'+label+' →</button>'):'')+'</div>';
  };
  /* AOG-STUDENT-HOME-V1 (2026-09-25) — Jimmy: "There is nothing on Student area
     in the DASHBOARD. The student / individual should be able to access their
     material in here as well." Under the check-in: their own stained-glass
     Blueprint (turn-ins.html?solo=1, built from what THIS device sent) and the
     doors back into their work. */
  window.aogPickBuilder=function(n){
    var es=false; try{ es=(typeof dashLang!=="undefined"&&dashLang==="es"); }catch(e){}
    if(n===null){ n=window.prompt(es?"Tu nombre, exactamente como lo escribes en las actividades:":"Your name, exactly as you type it on activities:",""); if(n===null) return; n=String(n).replace(/\s+/g," ").trim().slice(0,40); if(!n) return;
      try{ var b=JSON.parse(localStorage.getItem("aog.builders")||"[]"); if(b.indexOf(n)<0){ b.push(n); localStorage.setItem("aog.builders",JSON.stringify(b)); } }catch(e){} }
    try{ if(n) localStorage.setItem("aog.builder",n); else localStorage.removeItem("aog.builder"); }catch(e){}
    if(window.__aogDashRepaint) window.__aogDashRepaint(); else location.reload();
  };
  window.aogToggleTest=function(){
    try{ if(localStorage.getItem("aog.testmode")==="1") localStorage.removeItem("aog.testmode"); else localStorage.setItem("aog.testmode","1"); }catch(e){}
    try{ var bd=document.getElementById("aogTestBadge"); if(bd) bd.remove(); if(window.aogTestBadge) window.aogTestBadge(); }catch(e){}
    if(window.__aogDashRepaint) window.__aogDashRepaint(); else location.reload();
  };
  (function(){
    var base=window.aogTodayCard;
    window.aogTodayCard=function(es){
      var h=base.apply(this,arguments);
      var scr=document.getElementById("screen-admin"); var role=(scr&&scr.getAttribute("data-role"))||"teacher";
      /* AOG-TESTRUN-V1 retired (2026-09-26) — Jimmy: "Get rid of the test run
         nonsense." No switch on the dashboard, and the flag is cleared so no
         send is ever marked "(test)" again. */
      try{ localStorage.removeItem("aog.testmode"); }catch(e){}
      if(role!=="student") return h;
      /* AOG-WHO-V1 — never guess who is building. Pick from the names this
         device knows, or add a new one. */
      var nick=""; try{ nick=localStorage.getItem("aog.builder")||""; }catch(e){}
      var known={}; try{ JSON.parse(localStorage.getItem("aog.practice.mine")||"[]").forEach(function(r){ if(r&&r.studentId&&!/\(test\)$/.test(r.studentId)) known[String(r.studentId).replace(/\s+/g," ").trim()]=1; }); JSON.parse(localStorage.getItem("aog.builders")||"[]").forEach(function(n){ known[n]=1; }); }catch(e){}
      var names=Object.keys(known).sort();
      if(!nick || !known[nick]){
        return h+'<div class="aog-stu-home" style="margin-top:16px"><div style="font:800 12px/1 var(--sans,system-ui);letter-spacing:.16em;text-transform:uppercase;color:var(--gold,#F2C964);margin:0 0 10px">'+(es?"¿Quién construye hoy?":"Who’s building today?")+'</div>'
          +'<div style="display:flex;flex-wrap:wrap;gap:10px">'
          +names.map(function(n){ return '<button type="button" onclick="aogPickBuilder(this.getAttribute(\'data-n\'))" data-n="'+n.replace(/"/g,"&quot;").replace(/</g,"&lt;")+'" style="min-height:44px;padding:0 18px;border-radius:999px;border:1.5px solid var(--gold,#F2C964);background:transparent;color:inherit;font-weight:700;cursor:pointer">'+n.replace(/</g,"&lt;")+'</button>'; }).join("")
          +'<button type="button" onclick="aogPickBuilder(null)" style="min-height:44px;padding:0 18px;border-radius:999px;border:1.5px dashed var(--gold,#F2C964);background:transparent;color:inherit;font-weight:700;cursor:pointer">+ '+(es?"Soy nuevo":"I’m new")+'</button>'
          +'</div></div>';
      }
      function L(href,en,esT){ return '<a href="'+href+'" style="display:inline-flex;align-items:center;min-height:42px;padding:0 16px;border-radius:999px;border:1.5px solid var(--gold,#F2C964);font-weight:700;text-decoration:none;color:inherit">'+(es?esT:en)+'</a>'; }
      return h
        +'<div class="aog-stu-home" style="margin-top:16px">'
        +'<div style="font:800 12px/1 var(--sans,system-ui);letter-spacing:.16em;text-transform:uppercase;color:var(--gold,#F2C964);margin:0 0 8px">'+(es?"Sigue construyendo":"Keep building")+'</div>'
        +'<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px">'
        +L("daily-drops.html","Daily Drafts","Borradores diarios")
        +L("/#library","Worksheets & practice","Hojas y práctica")
        +L("turn-ins.html?solo=1&blueprint="+encodeURIComponent(nick),"Open My Blueprint full size","Abrir Mi Plano completo")
        +'</div>'
        +'<div style="font-size:13px;margin:-4px 0 10px;opacity:.85">'+(es?"Construyendo como ":"Building as ")+'<b>'+nick.replace(/</g,"&lt;")+'</b> · <a href="#" onclick="aogPickBuilder(\'\');return false" style="color:inherit">'+(es?"¿No eres tú? Cambiar":"Not you? Switch")+'</a></div>'
        +'<iframe title="'+(es?"Mi Plano":"My Blueprint")+'" src="turn-ins.html?solo=1&blueprint='+encodeURIComponent(nick)+'" style="display:block;width:100%;min-height:520px;border:0;border-radius:14px;background:transparent"></iframe>'
        +'</div>';
    };
  })();
  /* Reusable growth hero (sparkline + domain bars) for Parent/Family views. */
  window.aogGrowthHero=function(records, es){
    var mine=(records||[]).filter(function(r){return r&&r.normComposite!=null;}).slice().sort(function(a,b){return new Date(a.timestamp)-new Date(b.timestamp);});
    if(!mine.length) return "";
    var cur=mine[mine.length-1]; var c=Math.round(cur.normComposite);
    var col=sjBandCol(c);
    return '<div class="sj" style="margin:0 0 14px;"><div class="sj-h">'+(es?"Crecimiento":"Growth")+'</div>'+
      '<div class="sj-row"><div class="sj-stat"><div class="sj-n">'+mine.length+'</div><div class="sj-l">'+(es?"registros":"check-ins")+'</div></div>'+
        '<div class="sj-stat"><div class="sj-n" style="color:'+col+'">'+c+'</div><div class="sj-l">'+(es?"último puntaje":"latest score")+'</div></div></div>'+
      sjSparkOrHint(mine,es)+ sjBars(cur,es)+'</div>';
  };
  window.aogRenderStudentJourney=function(targetId){
    var host=document.getElementById(targetId||'aogStudentJourney'); if(!host) return;
    var es=(typeof lang!=="undefined"&&lang==="es");
    var recs=(typeof getAllRecords==="function"?getAllRecords():[])||[];
    recs=recs.filter(function(r){return r&&r.normComposite!=null;});
    window.__aogSjTarget=targetId||'aogStudentJourney';
    // Distinct students present in the records (so we can view ONE at a time
    // instead of pooling everyone into a single, meaningless chart).
    var seen={}, students=[];
    recs.forEach(function(r){ var id=(r.studentId==null?"":String(r.studentId)).trim(); if(!id) return; if(!seen[id]){ seen[id]={id:id,grade:(r.grade!=null?String(r.grade):"")}; students.push(seen[id]); } });
    var last=window._lastResult||window._pendingRecord||null;
    var bound=last&&last.studentId?String(last.studentId).trim():null;
    // Selected student: explicit pick → the one who just reflected → first available.
    var sid=window.__aogSjStudent; if(!sid||!seen[sid]) sid=(bound&&seen[bound])?bound:(students.length?students[0].id:null);
    window.__aogSjStudent=sid;
    var mine=sid?recs.filter(function(r){return String(r.studentId||"").trim()===sid;}):recs;
    mine=mine.slice().sort(function(a,b){return new Date(a.timestamp)-new Date(b.timestamp);});
    // Picker chips appear only when there's more than one student (a real
    // student's own device shows just theirs — no picker, stays first-person).
    var pick="";
    if(students.length>1){
      pick='<div class="sj-pick"><span class="sj-pick-lab">'+(es?"Estudiante":"Student")+'</span>'+
        students.map(function(s){ return '<button type="button" class="sj-pickchip'+(s.id===sid?" active":"")+'" onclick="aogSjSelect(\''+qaT(s.id)+'\')">'+escT(s.id)+(s.grade?(' <span class="sj-pick-g">'+escT((es?"Gr ":"Gr ")+s.grade)+'</span>'):'')+'</button>'; }).join("")+'</div>';
    }
    if(!mine.length){
      host.innerHTML='<div class="sj"><div class="sj-h">'+(es?"Tu camino empieza aquí":"Your journey starts here")+'</div>'+
        '<p class="sj-p">'+(es?"Aquí vivirán tus registros — un espejo privado de cómo te va con el tiempo. Nada se califica.":"This is where your check-ins will live — a private mirror of how you’re doing over time. Nothing is graded.")+'</p>'+
        '<div class="sj-foot"><button type="button" class="sj-btn" onclick="if(window.aogOpenDailyCheckin)aogOpenDailyCheckin(); else if(window.startCheckin)startCheckin()">'+(es?"Hacer un registro →":"Take a check-in →")+'</button></div></div>';
      return;
    }
    function band(n){ return n<50?{t:es?"necesita apoyo":"needs support",col:"#B5503F"}:(n<75?{t:es?"vale una reflexión":"worth a reflection",col:"#C98A2E"}:{t:es?"va bien":"doing well",col:"#2E8B6B"}); }
    var cur=mine[mine.length-1], prev=mine.length>1?mine[mine.length-2]:null;
    var c=Math.round(cur.normComposite); var bd=band(c);
    var trend="";
    if(prev){ var d=c-Math.round(prev.normComposite); trend = d>1?(es?"subiendo":"trending up"):(d<-1?(es?"un poco más bajo":"a little lower"):(es?"estable":"steady")); }
    host.innerHTML=pick+'<div class="sj"><div class="sj-h">'+(es?"Tu camino hasta ahora":"Your journey so far")+'</div>'+
      '<div class="sj-row"><div class="sj-stat"><div class="sj-n">'+mine.length+'</div><div class="sj-l">'+(es?(mine.length===1?"registro":"registros"):(mine.length===1?"check-in":"check-ins"))+'</div></div>'+
        '<div class="sj-stat"><div class="sj-n" style="color:'+bd.col+'">'+c+'</div><div class="sj-l">'+(es?"último puntaje":"latest score")+'</div></div>'+
        (trend?'<div class="sj-stat"><div class="sj-n" style="font-size:18px;line-height:1.4;">'+trend+'</div><div class="sj-l">'+(es?"tendencia":"trend")+'</div></div>':'')+'</div>'+
      sjGrowthChart(mine,es)+ sjBars(cur,es)+
      '<p class="sj-p">'+(es?("Esto es un espejo, no una nota. Ahora mismo estás en “"+bd.t+"”. Sigue notando qué te ayuda."):("This is a mirror, not a grade. Right now you’re “"+bd.t+"”. Keep noticing what helps."))+'</p>'+
      sjAff(mine,es)+
      (typeof window.aogFamRepairHtml==="function"?('<div class="sj-repair">'+window.aogFamRepairHtml(sid,es,!!window.__aogSjRepairOpen)+'</div>'):"")+
      '<div class="sj-foot"><button type="button" class="sj-btn" onclick="if(window.startCheckin)startCheckin()">'+(es?"Nuevo registro →":"New check-in →")+'</button>'+
        '<button type="button" class="sj-btn ghost" onclick="if(window.showStationMode){showStationMode();}else if(typeof showScreen===\'function\'){showScreen(\'screen-tank\');}">'+(es?"Espacio tranquilo →":"Quiet Space →")+'</button>'+
        '<button type="button" class="sj-btn ghost" onclick="if(typeof showScreen===\'function\'){showScreen(\'screen-teacher-tools\');}">'+(es?"Herramientas de calma →":"Calm & Regulation Tools →")+'</button></div></div>';
  };
  window.aogSjSelect=function(id){ window.__aogSjStudent=id; if(typeof window.aogRenderStudentJourney==="function") window.aogRenderStudentJourney(window.__aogSjTarget||'aogStudentJourney'); };
  function boot(){ try{ if(window.__aogDashRepaint) window.__aogDashRepaint(); }catch(e){} try{ window.aogRenderStudentJourney(); }catch(e){} }
  if(document.readyState!=='loading') boot(); else document.addEventListener('DOMContentLoaded',boot);
})();
