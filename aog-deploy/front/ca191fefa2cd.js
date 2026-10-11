
/* AOG-WEEKLY-V1 — the weekly check-in links, built with this teacher's Sheet on them (dest=) */
(function(){
  function T(en,es){ try{ return (typeof DT==="function")?DT(en,es):en; }catch(e){ return en; } }
  function link(w){ var d=""; try{ d=window.aogDestParam_?window.aogDestParam_():""; }catch(e){}
    return location.origin+"/weekly?w="+w+(d?"&dest="+encodeURIComponent(d):""); }
  function paint(card){
    var rows=[["mon",T("Monday · How was your weekend?","Lunes · ¿Cómo estuvo tu fin de semana?")],["mid",T("Midweek · How is your week going?","Mitad de semana · ¿Cómo va tu semana?")],["fri",T("Friday · The week, and weekend plans","Viernes · La semana y los planes")]];
    card.innerHTML='<p style="margin:0 0 12px">'+T("One link for the whole class. Post it on the day, or show it on the board. Every question can be tapped, and every question has a box to write more.","Un enlace para toda la clase. Publícalo ese día o muéstralo en la pizarra. Cada pregunta se puede tocar y cada una tiene un espacio para escribir más.")+'</p>'+
      rows.map(function(r){ var u=link(r[0]); return '<div style="margin:0 0 14px"><div style="font-weight:800;margin:0 0 6px">'+r[1]+'</div><div style="display:flex;gap:8px;flex-wrap:wrap"><input readonly value="'+u.replace(/"/g,"&quot;")+'" style="flex:1 1 260px;min-height:44px"><button type="button" class="btn" data-wkcopy="'+u.replace(/"/g,"&quot;")+'">'+T("Copy link","Copiar enlace")+'</button><a class="btn btn-secondary" target="_blank" rel="noopener" href="'+u.replace(/"/g,"&quot;")+'">'+T("Open","Abrir")+'</a></div></div>'; }).join("")+
      (link("mon").indexOf("dest=")<0?'<p style="margin:0;color:#E7C46A">'+T("Connect your Sheet under Connect & sync first, or answers stay on the student's device.","Conecta tu Hoja en Conectar y sincronizar primero, o las respuestas se quedan en el dispositivo del estudiante.")+'</p>':"");
  }
  function mount(){
    var panel=document.getElementById("panel-distribute"); if(!panel) return;
    var card=document.getElementById("aogWkLgCard");
    if(!card){
      var head=document.createElement("div"); head.className="section-head"; head.innerHTML='<h2>'+T("Weekly check-ins","Registros semanales")+'</h2>';
      var wrap=document.createElement("div"); wrap.className="table-card"; wrap.style.padding="18px";
      card=document.createElement("div"); card.id="aogWkLgCard"; wrap.appendChild(card);
      var panes=document.getElementById("aogDistPanes");
      panel.appendChild(head); panel.appendChild(wrap);
      if(window.__aogDistRebuild) window.__aogDistRebuild();
    }
    paint(card);
  }
  document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-wkcopy]"); if(!b) return;
    var u=b.getAttribute("data-wkcopy"); try{ navigator.clipboard.writeText(u); b.textContent=T("Copied","Copiado"); }catch(x){} });
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){ setTimeout(mount,1200); }); else setTimeout(mount,1200);
  setTimeout(mount,3200);
})();
