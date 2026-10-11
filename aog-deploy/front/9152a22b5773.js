
(function(){
  window.__aogFamHub = 0;
  window.__aogFamHubTheme = window.__aogFamHubTheme || "mix";
  var DOMS = { A:{c:"#C45A3B",en:"feelings & calming down",es:"sentimientos y calmarse"},
               B:{c:"#2E6B3A",en:"being kind to yourself",es:"ser amable contigo"},
               C:{c:"#2B4D7A",en:"friends, family & repair",es:"amigos, familia y reparación"} };
  function bandForGrade(g){
    var s=String(g==null?"":g).trim().toUpperCase();
    if(s==="ADULT") return "adult";
    if(s==="K"||s==="PK"||s==="TK"||s.indexOf("KIND")===0) return "k2";
    var n=parseInt(s,10);
    if(isNaN(n)) return "35";
    if(n<=2) return "k2"; if(n<=5) return "35"; if(n<=8) return "68"; return "912";
  }
  function hashStr(s){ s=String(s||""); var h=0; for(var i=0;i<s.length;i++){ h=(h*31+s.charCodeAt(i))>>>0; } return h; }
  function latest(records){
    if(!records||!records.length) return null;
    return records.slice().filter(function(x){return x&&x.normComposite!=null;})
      .sort(function(a,b){return new Date(b.timestamp)-new Date(a.timestamp);})[0]||null;
  }
  function seasonIdx(records){
    var r=latest(records), w=(r&&r.window)||"";
    var map={Fall:0,"Otoño":0,Winter:1,Invierno:1,Spring:2,Primavera:2,Summer:3,Verano:3};
    if(map[w]!=null) return map[w];
    var m=new Date().getMonth(); return m>=8&&m<=10?0:((m>=11||m<=1)?1:(m>=2&&m<=4?2:3));
  }
  function val(r,n){ return r["norm"+n]!=null?r["norm"+n]:(r["domain"+n]!=null?r["domain"+n]:null); }
  function lowestDomain(records){
    var r=latest(records); if(!r) return null;
    var vals=[["A",val(r,"A")],["B",val(r,"B")],["C",val(r,"C")]].filter(function(p){return p[1]!=null;});
    if(vals.length<3) return null;
    vals.sort(function(a,b){return a[1]-b[1];});
    return vals[0][0];
  }
  window.aogFamilyHubHtml=function(name,grade,records,es){
    var D=window.AOG_CS_DATA; if(!D) return "";
    var bank=D[bandForGrade(grade)]||D["35"]; if(!bank) return "";
    var theme = window.__aogFamHubTheme || "mix";
    var low=lowestDomain(records);
    var seed=(hashStr(name)+seasonIdx(records)*7+(window.__aogFamHub||0))>>>0;
    var used={ __n:0 };
    function pickLi(dom, parity){
      var arr=bank[dom]||[]; if(!arr.length) return "";
      var cand=[], x;
      for(x=0;x<arr.length;x++){ if(parity==="even"&&x%2!==0) continue; if(parity==="odd"&&x%2!==1) continue; if(used[dom+"|"+x]) continue; cand.push(x); }
      if(!cand.length){ for(x=0;x<arr.length;x++){ if(!used[dom+"|"+x]) cand.push(x); } }
      if(!cand.length){ cand=[0]; }
      used.__n++;
      var k=cand[(seed+used.__n*5)%cand.length];
      used[dom+"|"+k]=1;
      var p=arr[k];
      return '<li style="border-left-color:'+DOMS[dom].c+'">'+ (es?p.es:p.en) +'</li>';
    }
    var items;
    if(theme==="A"||theme==="B"||theme==="C"){
      items=[pickLi(theme,"any"),pickLi(theme,"any"),pickLi(theme,"any")].join("");
    } else if(theme==="laughs"){
      items=[pickLi("A","even"),pickLi("B","even"),pickLi("C","even")].join("");
    } else if(theme==="real"){
      items=[pickLi("A","odd"),pickLi("B","odd"),pickLi("C","odd")].join("");
    } else {
      var ord = low ? (function(){ var o=["A","B","C"].filter(function(d){return d!==low;}); return [low,low,o[seed%2]]; })() : ["A","B","C"];
      items=ord.map(function(dom){ return pickLi(dom,"any"); }).join("");
    }
    var THEMES=[{k:"mix",en:"Surprise me",es:"Sorpr\u00e9ndeme"},{k:"laughs",en:"Laughs",es:"Risas"},{k:"real",en:"Real talk",es:"En serio"},{k:"A",en:"Feelings",es:"Sentimientos"},{k:"B",en:"Kindness",es:"Amabilidad"},{k:"C",en:"Our people",es:"Nuestra gente"}];
    var chipsHtml=THEMES.map(function(th){ return '<button type="button" class="fam-hub-chip'+(theme===th.k?" active":"")+'" onclick="aogFamilyHubTheme(\''+th.k+'\')">'+(es?th.es:th.en)+'</button>'; }).join("");
    var t=es?"Tres para la mesa esta noche":"Three for the table tonight";
    var sub;
    if(low){ var dl=es?DOMS[low].es:DOMS[low].en;
      sub = es ? ("Puertas suaves — no un examen — inclinadas hacia "+dl+" esta temporada. Abre una cuando el momento se sienta bien.")
               : ("Gentle doors — not a test — leaning toward "+dl+" this season. Open one when the moment feels right.");
    } else {
      sub = es ? "Puertas suaves para empezar a hablar. No hace falta hacerlas todas." : "Gentle doors to get talking — no need to do them all.";
    }
    return '<div class="fam-hub"><div class="fam-hub-h"><span class="fam-hub-t">'+t+'</span>'+
      '<button class="fam-hub-shuffle" type="button" onclick="aogFamilyHubShuffle()">↻ '+(es?"Otras":"Shuffle")+'</button></div>'+
      '<div class="fam-hub-sub">'+sub+'</div>'+
      '<div class="fam-hub-themes">'+chipsHtml+'</div>'+
      '<ul class="fam-hub-list">'+items+'</ul>'+
      '<div class="fam-hub-foot">'+
        '<button type="button" onclick="var el=document.getElementById(\'famCsSection\'); if(el)el.scrollIntoView({behavior:\'smooth\',block:\'start\'});">'+(es?"Ver todas por edad ↓":"See all by age ↓")+'</button>'+
        '<button type="button" onclick="if(window.aogPrintConvo)aogPrintConvo()">'+(es?"Imprimir / guardar →":"Print / save →")+'</button>'+
      '</div></div>';
  };
  window.aogFamilyHubShuffle=function(){ window.__aogFamHub=(window.__aogFamHub||0)+1; if(typeof renderFamily==="function") renderFamily(); };
  window.aogFamilyHubTheme=function(th){ window.__aogFamHubTheme=th; window.__aogFamHub=(window.__aogFamHub||0)+1; if(typeof renderFamily==="function") renderFamily(); };

  /* Full age-banded starters, rendered INLINE on the Family page (no modal). */
  var CS_DOMS=[
    {k:"A",c:"#C45A3B",en:"Feelings & calming down",es:"Sentimientos y calmarse"},
    {k:"B",c:"#2E6B3A",en:"Being kind to yourself",es:"Ser amable contigo"},
    {k:"C",c:"#2B4D7A",en:"Friends, family & repair",es:"Amigos, familia y reparación"}
  ];
  var CS_BANDS=[["k2","K-2"],["35","3-5"],["68","6-8"],["912","9-12"],["adult","Adult"]];
  window.__aogFamCsBand=null;
  function famCsListInner(band,es){
    var D=window.AOG_CS_DATA; if(!D) return ""; var bank=D[band]||D["35"];
    return CS_DOMS.map(function(d,di){
      var items=bank[d.k]||[];
      return '<div class="famcs-dom">'+
        '<button type="button" class="famcs-dom-h" aria-expanded="false" onclick="aogFamCsToggle(this)">'+
          '<span class="famcs-dot" style="background:'+d.c+'"></span>'+
          '<span class="famcs-dom-t">'+(es?d.es:d.en)+'</span>'+
          '<span class="famcs-dom-n">'+items.length+'</span>'+
          '<span class="famcs-chev" aria-hidden="true">▾</span>'+
        '</button>'+
        '<div class="famcs-dom-body">'+
          items.map(function(o){ return '<div class="famcs-item" style="border-left-color:'+d.c+'">'+(es?o.es:o.en)+'</div>'; }).join("")+
        '</div>'+
      '</div>';
    }).join("");
  }
  window.aogFamCsToggle=function(btn){ var dom=btn&&btn.closest?btn.closest(".famcs-dom"):null; if(!dom) return; var open=dom.classList.toggle("open"); btn.setAttribute("aria-expanded", open?"true":"false"); };
  window.aogFamCsBand=function(b){
    if(!window.AOG_CS_DATA||!window.AOG_CS_DATA[b]) return;
    window.__aogFamCsBand=b;
    var es=(typeof lang!=="undefined"&&lang==="es");
    var l=document.getElementById("famCsList"); if(l) l.innerHTML=famCsListInner(b,es);
    var chips=document.querySelectorAll("#famCsChips .famcs-chip");
    for(var i=0;i<chips.length;i++){ chips[i].classList.toggle("active", chips[i].getAttribute("data-b")===b); }
  };
  window.aogFamCsHtml=function(grade,es){
    var D=window.AOG_CS_DATA; if(!D) return "";
    var def=window.__aogFamCsBand||bandForGrade(grade); if(!D[def]) def="35"; window.__aogFamCsBand=def;
    var chips=CS_BANDS.map(function(b){
      var label=(b[0]==="adult"?(es?"Adultos":"Adult"):b[1]);
      return '<button type="button" class="famcs-chip'+(b[0]===def?" active":"")+'" data-b="'+b[0]+'" onclick="aogFamCsBand(\''+b[0]+'\')">'+label+'</button>';
    }).join("");
    return '<div class="famcs" id="famCsSection">'+
      '<div class="famcs-head"><span class="famcs-t">'+(es?"Iniciadores de conversación por edad":"Conversation starters by age")+'</span>'+
        '<button type="button" class="famcs-print" onclick="if(window.aogPrintConvo)aogPrintConvo()">'+(es?"Imprimir / guardar (PDF)":"Print / save (PDF)")+'</button></div>'+
      '<div class="famcs-sub">'+(es?"Elige una edad. No son un examen — son puertas. Abre una cuando el momento se sienta bien.":"Pick an age. These aren’t a test — they’re doors. Open one when the moment feels right.")+'</div>'+
      '<div class="famcs-chips" id="famCsChips">'+chips+'</div>'+
      '<div id="famCsList">'+famCsListInner(def,es)+'</div>'+
    '</div>';
  };

  /* ---- Family Mode enrichment: print report · repair journal · cadence ---- */
  function escRep(t){ return String(t==null?"":t).replace(/[<>&]/g,function(c){return {"<":"&lt;",">":"&gt;","&":"&amp;"}[c];}); }
  function qAttr(s){ return String(s==null?"":s).replace(/\\/g,"\\\\").replace(/'/g,"\\'"); }
  window.aogFamTabStrip=function(es){
    var cur=window.__aogFamTab||"progress";
    var tabs=[["talk",es?"Conversar":"Talk"],["repair",es?"Reparación":"Repair"],["progress",es?"Mirando atrás":"Looking back"]];
    return '<div class="fam-tab-strip">'+tabs.map(function(t){ return '<button type="button" class="fam-tab'+(t[0]===cur?" active":"")+'" data-ft="'+t[0]+'" onclick="aogFamTab(\''+t[0]+'\')">'+t[1]+'</button>'; }).join("")+'</div>';
  };
  window.aogFamTab=function(name){
    window.__aogFamTab=name;
    var ps=document.querySelectorAll(".fam-tabpanel");
    for(var i=0;i<ps.length;i++){ ps[i].hidden = (ps[i].getAttribute("data-famtab")!==name); }
    var bs=document.querySelectorAll(".fam-tab");
    for(var j=0;j<bs.length;j++){ bs[j].classList.toggle("active", bs[j].getAttribute("data-ft")===name); }
  };
  window.aogFamilyExtrasTop=function(name, records, es){
    var out="";
    if(records&&records.length){
      var latest=records.slice().sort(function(a,b){return new Date(b.timestamp)-new Date(a.timestamp);})[0];
      var days=Math.floor((Date.now()-new Date(latest.timestamp))/86400000);
      if(days>=100){
        out+='<div class="fam-nudge">'+(es?("Han pasado unos "+days+" días desde el último registro de "+escRep(name)+". Un momento tranquilo juntos podría venir bien."):("It’s been about "+days+" days since "+escRep(name)+"’s last check-in. A quiet moment together might be nice."))+'</div>';
      }
    }
    return out;
  };
  function repairAll(){ try{ return JSON.parse(localStorage.getItem("aog.repair.v1")||"{}"); }catch(e){ return {}; } }
  function repairSave(o){ try{ localStorage.setItem("aog.repair.v1", JSON.stringify(o)); }catch(e){} }
  function aogRepairRepaint(){
    try{ var scr=document.getElementById("screen-admin"); var role=scr&&scr.getAttribute("data-role");
      if(role==="student" && typeof window.aogRenderStudentJourney==="function"){ window.aogRenderStudentJourney(window.__aogSjTarget||"dashStudentJourney"); return; }
    }catch(e){}
    try{ if(typeof renderFamily==="function") renderFamily(); }catch(e){}
  }
  window.aogRepairAdd=function(childId){
    var ta=document.getElementById("repairNote"); if(!ta) return; var v=(ta.value||"").trim(); if(!v) return;
    var all=repairAll(); (all[childId]=all[childId]||[]).unshift({ d:new Date().toISOString(), n:v.slice(0,500) }); repairSave(all);
    ta.value=""; window.__aogRepairOpen=true; window.__aogSjRepairOpen=true; aogRepairRepaint();
  };
  window.aogRepairDel=function(childId, idx){
    var all=repairAll(); if(all[childId]){ all[childId].splice(idx,1); repairSave(all); } aogRepairRepaint();
  };
  window.aogRepairToggle=function(btn){ var c=btn&&btn.closest?btn.closest(".rep"):null; if(!c) return; var open=c.classList.toggle("open"); window.__aogRepairOpen=open; window.__aogSjRepairOpen=open; btn.setAttribute("aria-expanded", open?"true":"false"); };
  window.aogFamRepairHtml=function(childId, es, isOpen){
    var list=repairAll()[childId]||[];
    var open = ((isOpen===undefined? window.__aogRepairOpen : isOpen) ? " open" : "");
    var items=list.map(function(e,i){
      var dt=new Date(e.d), ds=isNaN(dt)?"":dt.toLocaleDateString();
      return '<div class="rep-item"><div class="rep-meta"><span>'+ds+'</span><button type="button" class="rep-del" onclick="aogRepairDel(\''+qAttr(childId)+'\','+i+')" aria-label="Delete">×</button></div><div class="rep-note">'+escRep(e.n)+'</div></div>';
    }).join("");
    return '<div class="rep'+open+'"><button type="button" class="rep-toggle" aria-expanded="'+(open?"true":"false")+'" onclick="aogRepairToggle(this)"><span class="rep-h">'+(es?"Momentos de reparación":"Repair moments")+'</span>'+(list.length?'<span class="rep-count">'+list.length+'</span>':'')+'<span class="famcs-chev">▾</span></button>'+
      '<div class="rep-body">'+
        '<div class="rep-sub">'+(es?"Un registro privado de roces y reparaciones — el corazón del marco. Solo en este dispositivo.":"A private log of ruptures and repairs — the heart of the framework. On this device only.")+'</div>'+
        '<textarea id="repairNote" class="rep-ta" rows="2" placeholder="'+(es?"¿Qué pasó, y cómo lo repararon juntos?":"What happened, and how did you repair it together?")+'"></textarea>'+
        '<div class="rep-row"><button type="button" class="rep-add" onclick="aogRepairAdd(\''+qAttr(childId)+'\')">'+(es?"Guardar momento":"Save moment")+'</button></div>'+
        (items?'<div class="rep-list">'+items+'</div>':'')+
      '</div></div>';
  };
  window.aogFamilyPrint=function(name){
    var es=(typeof lang!=="undefined"&&lang==="es");
    var recs=(typeof familyRecordsFor==="function"?familyRecordsFor(name):[])||[];
    var sorted=recs.slice().sort(function(a,b){return new Date(b.timestamp)-new Date(a.timestamp);});
    var chart=(typeof familyChart==="function"&&recs.length)?familyChart(recs):"";
    var rows=sorted.map(function(r){
      var w=(typeof winLabel==="function"&&r.window)?winLabel(r.window):(r.window||"");
      var c=r.normComposite!=null?Math.round(r.normComposite):"—";
      var dt=new Date(r.timestamp), ds=isNaN(dt)?"":dt.toLocaleDateString();
      return "<tr><td>"+ds+"</td><td>"+escRep(w)+"</td><td>"+c+"</td><td>"+escRep(r.tier||"")+"</td></tr>";
    }).join("");
    var latest=sorted[0]||null;
    var compass=(latest&&typeof aogGraceCompass==="function")?aogGraceCompass(latest):"";
    var rep=repairAll()[name]||[];
    var repHtml=rep.length?('<h3>'+(es?"Momentos de reparación":"Repair moments")+'</h3>'+rep.map(function(e){ var dt=new Date(e.d),ds=isNaN(dt)?"":dt.toLocaleDateString(); return '<p style="margin:4px 0;font-size:13px;"><b>'+ds+'</b> — '+escRep(e.n)+'</p>'; }).join("")):"";
    var title=(es?"Progreso de ":"Progress for ")+escRep(name);
    var w=window.open("","_blank"); if(!w) return;
    var doc='<!doctype html><html><head><meta charset="utf-8"><title>'+title+'</title><style>body{font-family:-apple-system,Segoe UI,Inter,sans-serif;color:#0A1E33;margin:34px;max-width:760px;}h1{font-family:Georgia,serif;font-size:22px;border-bottom:3px solid #D9A33B;padding-bottom:8px;}h3{font-family:Georgia,serif;font-size:15px;margin:18px 0 6px;}table{width:100%;border-collapse:collapse;font-size:13px;margin:14px 0;}th,td{text-align:left;padding:7px 8px;border-bottom:1px solid #E4DAC5;}th{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#46506E;}.ft{margin-top:18px;border-top:1px solid #E4DAC5;padding-top:8px;font-size:10.5px;color:#8A92A6;}@media print{.np{display:none;}}</style></head><body>'+
      '<h1>'+title+'</h1>'+
      (chart?'<div>'+chart+'</div>':'')+
      '<table><thead><tr><th>'+(es?"Fecha":"Date")+'</th><th>'+(es?"Período":"Window")+'</th><th>'+(es?"Puntaje":"Score")+'</th><th>'+(es?"Nivel":"Tier")+'</th></tr></thead><tbody>'+rows+'</tbody></table>'+
      repHtml+
      (compass?'<h3>'+(es?"Próximo paso":"Next step")+'</h3><div>'+compass+'</div>':'')+
      '<div class="ft">'+(es?"Centrado en la relación · Una guía para el crecimiento, no un diagnóstico.":"Relationship-centered · A guide for growth, not a diagnosis.")+'</div>'+
      '<p class="np"><button onclick="window.print()" style="font:inherit;font-weight:700;background:#0A1E33;color:#fff;border:0;border-radius:8px;padding:9px 18px;cursor:pointer;">'+(es?"Imprimir":"Print")+'</button></p></body></html>';
    w.document.write(doc); w.document.close();
  };
})();
