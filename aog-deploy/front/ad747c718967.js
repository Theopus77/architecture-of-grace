
(function(){
  "use strict";
  var KEY="aog.rhythms.v1", OPENKEY="aog.rhythms.open";
  var MOUNTS=["aogRhythmsDash","aogRhythmsFam"];
  function L(){ return (document.documentElement.getAttribute("lang")||"en").slice(0,2)==="es"?"es":"en"; }
  function RT(en,es){ return L()==="es"?es:en; }
  function esc(str){ return String(str==null?"":str).replace(/[&<>"]/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"})[c];}); }
  function load(){ try{ var a=JSON.parse(localStorage.getItem(KEY)||"[]"); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
  function save(a){ try{ localStorage.setItem(KEY,JSON.stringify(a)); }catch(e){} }
  function todayISO(d){ d=d||new Date(); var m=d.getMonth()+1,da=d.getDate(); return d.getFullYear()+"-"+(m<10?"0"+m:m)+"-"+(da<10?"0"+da:da); }
  function hhmm(d){ d=d||new Date(); var h=d.getHours(),m=d.getMinutes(); return (h<10?"0"+h:h)+":"+(m<10?"0"+m:m); }
  var KINDS={
    checkin:{en:"Check-in",es:"Registro"},
    tool:{en:"Calming tool reset",es:"Reinicio con herramienta de calma"},
    daily:{en:"Daily Log — log this period",es:"Registro diario — anota este periodo"}
  };
  var DAY_N={en:["Su","M","Tu","W","Th","F","Sa"],es:["Do","L","Ma","Mi","J","V","Sá"]};

  /* ---------- pure scheduler predicate (exported for the test harness) ---------- */
  function rhythmDue(r,nowHHMM,dow,todayIso){
    if(!r||r.enabled===false) return false;
    if(!r.days||r.days.indexOf(dow)<0) return false;
    if(String(r.time)!==String(nowHHMM)) return false;
    if(r.lastFired===todayIso) return false;
    return true;
  }
  window.__aogRhythmDue=rhythmDue;

  /* ---------- soft two-note chime (~0.4s, low volume, never throws) ---------- */
  function chime(){
    try{
      if(document.hidden) return;
      var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
      var ac=new AC();
      function note(f,t0,dur){
        var o=ac.createOscillator(),g=ac.createGain();
        o.type="sine"; o.frequency.value=f; o.connect(g); g.connect(ac.destination);
        g.gain.setValueAtTime(0.0001,ac.currentTime+t0);
        g.gain.exponentialRampToValueAtTime(0.055,ac.currentTime+t0+0.03);
        g.gain.exponentialRampToValueAtTime(0.0001,ac.currentTime+t0+dur);
        o.start(ac.currentTime+t0); o.stop(ac.currentTime+t0+dur+0.05);
      }
      note(659.25,0,0.18); note(880,0.2,0.2);
      setTimeout(function(){ try{ ac.close(); }catch(e){} },900);
    }catch(e){}
  }

  /* ---------- toast ---------- */
  var toastTimer=null;
  function closeToast(){ var t=document.getElementById("aogRyToast"); if(t&&t.parentNode) t.parentNode.removeChild(t); if(toastTimer){ clearTimeout(toastTimer); toastTimer=null; } }
  function act(r){
    try{
      if(r.kind==="checkin"){ if(typeof startCheckin==="function") startCheckin(); }
      else if(r.kind==="tool"){ if(typeof showScreen==="function") showScreen("screen-teacher-tools"); }
      else if(r.kind==="daily"){ if(typeof openAdmin==="function") openAdmin(); setTimeout(function(){ if(typeof aogQsTab==="function") aogQsTab("daily"); },300); }
    }catch(e){}
    closeToast();
  }
  function fire(r,isSnooze){
    closeToast();
    var kindLbl=KINDS[r.kind]?RT(KINDS[r.kind].en,KINDS[r.kind].es):"";
    var actLbl=r.kind==="checkin"?RT("Start check-in","Comenzar el registro"):r.kind==="tool"?RT("Open calm tools","Abrir herramientas de calma"):RT("Open Daily Log","Abrir registro diario");
    var main=(r.label&&r.label!==KINDS[r.kind].en)?r.label:kindLbl;
    var d=document.createElement("div"); d.id="aogRyToast"; d.setAttribute("role","status"); d.setAttribute("aria-live","polite");
    d.innerHTML='<span style="font-size:16px;" aria-hidden="true">🔔</span>'
      +'<span style="flex:1;min-width:150px;"><strong>'+esc(main)+'</strong><br><span style="font-size:11px;color:#C9D2DE;">'+RT("Gentle Rhythms","Ritmos suaves")+' · '+esc(r.time)+'</span></span>'
      +'<button type="button" class="ry-act">'+esc(actLbl)+'</button>'
      +(isSnooze?'':'<button type="button" class="ry-snz">'+RT("Snooze 10 min","Posponer 10 min")+'</button>')
      +'<button type="button" class="ry-x" aria-label="'+RT("Dismiss","Cerrar")+'">×</button>';
    d.querySelector(".ry-act").addEventListener("click",function(){ act(r); });
    var sz=d.querySelector(".ry-snz");
    if(sz) sz.addEventListener("click",function(){ closeToast(); setTimeout(function(){ fire(r,true); },10*60*1000); });
    d.querySelector(".ry-x").addEventListener("click",closeToast);
    document.body.appendChild(d);
    toastTimer=setTimeout(closeToast,60000);
    chime();
  }
  window.__aogRhythmFire=fire;

  /* ---------- scheduler: every 30s ---------- */
  function tick(nowOpt){
    var now=nowOpt||new Date();
    var t=hhmm(now), dow=now.getDay(), iso=todayISO(now);
    var list=load(), changed=false;
    list.forEach(function(r){ if(rhythmDue(r,t,dow,iso)){ r.lastFired=iso; changed=true; fire(r,false); } });
    if(changed){ save(list); renderAll(); }
  }
  window.__aogRhythmTick=tick;
  setInterval(function(){ tick(); },30000);

  /* ---------- .ics download (recurring weekly VEVENT) ---------- */
  window.aogRyIcs=function(id){
    var r=load().filter(function(x){ return x.id===id; })[0]; if(!r) return;
    try{
      var BY=["SU","MO","TU","WE","TH","FR","SA"];
      var days=(r.days&&r.days.length?r.days:[1,2,3,4,5]).slice().sort();
      var byday=days.map(function(d){ return BY[d]; }).join(",");
      var hm=String(r.time||"08:00").split(":");
      var now=new Date();
      var st=new Date(now.getFullYear(),now.getMonth(),now.getDate(),parseInt(hm[0],10)||8,parseInt(hm[1],10)||0,0,0);
      var guard=0;
      while((days.indexOf(st.getDay())<0 || st<=now) && guard<9){ st=new Date(st.getTime()+86400000); st.setHours(parseInt(hm[0],10)||8,parseInt(hm[1],10)||0,0,0); guard++; }
      function p2(n){ return n<10?"0"+n:""+n; }
      function fmt(d){ return d.getFullYear()+p2(d.getMonth()+1)+p2(d.getDate())+"T"+p2(d.getHours())+p2(d.getMinutes())+"00"; }
      var en=new Date(st.getTime()+10*60000);
      var kindLbl=KINDS[r.kind]?RT(KINDS[r.kind].en,KINDS[r.kind].es):RT("Reminder","Recordatorio");
      var sum=((r.label&&r.label!==((KINDS[r.kind]||{}).en))?r.label:kindLbl).replace(/[\r\n]+/g," ").replace(/([,;\\])/g,"\\$1");
      var ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Architecture of Grace//Gentle Rhythms//EN","CALSCALE:GREGORIAN","BEGIN:VEVENT",
        "UID:aog-rhythm-"+esc(r.id)+"@architecture-of-grace",
        "DTSTAMP:"+fmt(new Date()),
        "DTSTART:"+fmt(st),
        "DTEND:"+fmt(en),
        "RRULE:FREQ=WEEKLY;BYDAY="+byday,
        "SUMMARY:"+sum,
        "DESCRIPTION:"+RT("Gentle Rhythms reminder · Architecture of Grace","Recordatorio de Ritmos suaves · Architecture of Grace"),
        "BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:"+sum,"TRIGGER:PT0M","END:VALARM",
        "END:VEVENT","END:VCALENDAR"].join("\r\n");
      var blob=new Blob([ics],{type:"text/calendar;charset=utf-8"});
      var a=document.createElement("a");
      a.href=URL.createObjectURL(blob);
      a.download="aog-rhythm-"+String(r.time||"").replace(":","")+".ics";
      document.body.appendChild(a); a.click();
      setTimeout(function(){ try{ URL.revokeObjectURL(a.href); if(a.parentNode) a.parentNode.removeChild(a); }catch(e){} },400);
    }catch(e){}
  };

  /* ---------- list actions ---------- */
  window.aogRyToggle=function(id){ var list=load(); list.forEach(function(r){ if(r.id===id) r.enabled=(r.enabled===false); }); save(list); renderAll(); };
  window.aogRyDel=function(id){ var list=load().filter(function(r){ return r.id!==id; }); save(list); renderAll(); };
  window.aogRyOpen=function(open){ try{ localStorage.setItem(OPENKEY,open?"1":"0"); }catch(e){} };

  /* ---------- add-form state (shared across both mounts) ---------- */
  var ADD={time:"08:00",days:[1,2,3,4,5],mode:"mf",kind:"checkin"};
  window.aogRyTimeIn=function(v){ if(/^\d{2}:\d{2}$/.test(v)) ADD.time=v; };
  window.aogRyKindIn=function(v){ if(KINDS[v]) ADD.kind=v; };
  window.aogRyMode=function(m){
    ADD.mode=m;
    if(m==="mf") ADD.days=[1,2,3,4,5];
    else if(m==="daily") ADD.days=[0,1,2,3,4,5,6];
    renderAll();
  };
  window.aogRyDay=function(d){
    var i=ADD.days.indexOf(d);
    if(i>=0) ADD.days.splice(i,1); else ADD.days.push(d);
    renderAll();
  };
  window.aogRyAdd=function(){
    if(!ADD.days.length){ try{ alert(RT("Pick at least one day.","Elige al menos un día.")); }catch(e){} return; }
    var list=load();
    list.push({ id:"ry"+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36),
      time:ADD.time, days:ADD.days.slice().sort(), kind:ADD.kind,
      label:(KINDS[ADD.kind]||{}).en||"", enabled:true, lastFired:"" });
    save(list); renderAll();
  };

  /* ---------- render ---------- */
  function daysLabel(days){
    days=days||[];
    if(days.length===7) return RT("Daily","Diario");
    var mf=[1,2,3,4,5];
    if(days.length===5 && mf.every(function(d){ return days.indexOf(d)>=0; })) return RT("M–F","L–V");
    var names=DAY_N[L()];
    return days.slice().sort().map(function(d){ return names[d]; }).join(" ");
  }
  function isOpen(){ try{ return localStorage.getItem(OPENKEY)==="1"; }catch(e){ return false; } }
  function cardHTML(){
    var list=load();
    var items=list.map(function(r){
      var kindLbl=KINDS[r.kind]?RT(KINDS[r.kind].en,KINDS[r.kind].es):"";
      return '<div class="aog-ry-item'+(r.enabled===false?' off':'')+'">'
        +'<span class="aog-ry-time">'+esc(r.time)+'</span>'
        +'<span class="aog-ry-days">'+esc(daysLabel(r.days))+'</span>'
        +'<span class="aog-ry-kind">'+esc(kindLbl)+'</span>'
        +'<span class="aog-ry-acts">'
        +'<button type="button" onclick="aogRyToggle(\''+esc(r.id)+'\')">'+(r.enabled===false?RT("Resume","Reanudar"):RT("Pause","Pausar"))+'</button>'
        +'<button type="button" onclick="aogRyIcs(\''+esc(r.id)+'\')">📅 '+RT("Add to my calendar (.ics)","Añadir a mi calendario (.ics)")+'</button>'
        +'<button type="button" aria-label="'+RT("Delete reminder","Eliminar recordatorio")+'" onclick="aogRyDel(\''+esc(r.id)+'\')">✕</button>'
        +'</span></div>';
    }).join("");
    if(!items) items='<div class="aog-ry-empty">'+RT("No reminders yet — add a gentle one below.","Aún no hay recordatorios — agrega uno suave abajo.")+'</div>';
    var chips='';
    [["mf",RT("M–F","L–V")],["daily",RT("Daily","Diario")],["custom",RT("Custom","Personalizado")]].forEach(function(c){
      chips+='<button type="button" class="aog-ry-chip'+(ADD.mode===c[0]?' on':'')+'" onclick="aogRyMode(\''+c[0]+'\')">'+c[1]+'</button>';
    });
    var dayChips='';
    if(ADD.mode==="custom"){
      var names=DAY_N[L()];
      for(var d=0;d<7;d++){ dayChips+='<button type="button" class="aog-ry-chip'+(ADD.days.indexOf(d)>=0?' on':'')+'" onclick="aogRyDay('+d+')">'+names[d]+'</button>'; }
    }
    var kindOpts='';
    [["checkin"],["tool"],["daily"]].forEach(function(k){
      kindOpts+='<option value="'+k[0]+'"'+(ADD.kind===k[0]?' selected':'')+'>'+esc(RT(KINDS[k[0]].en,KINDS[k[0]].es))+'</option>';
    });
    return '<details class="aog-ry-card"'+(isOpen()?' open':'')+' ontoggle="aogRyOpen(this.open)">'
      +'<summary><span aria-hidden="true">🌿</span> '+RT("Gentle Rhythms","Ritmos suaves")
      +' <span class="aog-ry-count">'+(list.length?list.length:'')+'</span><span class="aog-ry-caret" aria-hidden="true">▾</span></summary>'
      +'<div class="aog-ry-body">'
      +items
      +'<div class="aog-ry-form">'
      +'<input type="time" value="'+esc(ADD.time)+'" aria-label="'+RT("Reminder time","Hora del recordatorio")+'" onchange="aogRyTimeIn(this.value)">'
      +chips+dayChips
      +'<select aria-label="'+RT("Reminder type","Tipo de recordatorio")+'" onchange="aogRyKindIn(this.value)">'+kindOpts+'</select>'
      +'<button type="button" class="aog-ry-add" onclick="aogRyAdd()">'+RT("Add","Agregar")+'</button>'
      +'</div>'
      +'<div class="aog-ry-note">'+RT("Reminders stay on this device and only pop up while the app is open. Tap the calendar button to add one to your own calendar.","Los recordatorios se quedan en este dispositivo y solo aparecen con la aplicación abierta. Toca el botón de calendario para agregar uno a tu propio calendario.")+'</div>'
      +'</div></details>';
  }
  function renderAll(){
    var html=null;
    MOUNTS.forEach(function(id){
      /* The dashboard mount is retired unless AOG_RHYTHMS_DASH is turned back
         on; Family Mode keeps the card. 2026-08-27 */
      if(id==="aogRhythmsDash" && window.AOG_RHYTHMS_DASH !== true) return;
      var m=document.getElementById(id); if(!m) return;
      if(html==null) html=cardHTML();
      m.innerHTML=html;
    });
  }
  window.aogRyRender=renderAll;

  function init(){ renderAll(); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
  try{ new MutationObserver(function(){ renderAll(); }).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]}); }catch(e){}
})();
