
(function(){
  "use strict";
  /* id -> icon, English / Spanish title, short desc, and the domains it supports.
     Domains: A = Emotional Regulation & Well-Being, B = Self-Compassion & Growth Mindset,
     C = Social Competency & Repair. (coldwater is intentionally excluded from auto-match.) */
  var META = {
    breathing:  { ic:"🫁", en:"4-7-8 Breathing",      es:"Respiración 4-7-8",   den:"Slow guided breaths",            des:"Respiración lenta guiada",      d:["A"] },
    boxbreath:  { ic:"🟦", en:"Paced Breathing",       es:"Respiración pausada",  den:"Box 4·4·4·4",                    des:"Caja 4·4·4·4",                  d:["A"] },
    rainbow:    { ic:"🌈", en:"Rainbow Breathing",     es:"Respiración arcoíris", den:"Breathe in every color",         des:"Respira cada color",            d:["A"] },
    take5:      { ic:"🖐️", en:"Take 5",                es:"Toma 5",               den:"Trace your hand, breath by breath", des:"Traza tu mano, respiro a respiro", d:["A"] },
    grounding:  { ic:"🌿", en:"5-4-3-2-1 Grounding",   es:"Anclaje 5-4-3-2-1",    den:"Sensory anchor for big feelings", des:"Ancla sensorial para emociones grandes", d:["A"] },
    pmr:        { ic:"🧘", en:"Body Scan",             es:"Escaneo corporal",     den:"Release tension head to toe",    des:"Suelta la tensión de pies a cabeza", d:["A"] },
    movement:   { ic:"🏃", en:"Movement Break",        es:"Pausa de movimiento",  den:"Shake it out",                   des:"Sacúdelo",                      d:["A"] },
    calmjar:    { ic:"🫙", en:"Calm Down Jar",         es:"Frasco de la calma",   den:"Shake and watch it settle",      des:"Agita y míralo asentarse",      d:["A"] },
    tappad:     { ic:"👆", en:"Tap Pad",               es:"Almohadilla de toques",den:"Tap a steady rhythm",            des:"Marca un ritmo constante",      d:["A"] },
    bodycheck:  { ic:"🧭", en:"Body Check",            es:"Autorreflexión del cuerpo",   den:"How does your body feel?",       des:"¿Cómo siente tu cuerpo?",       d:["A"] },
    bilateral:  { ic:"🦋", en:"Butterfly Hug",         es:"Abrazo mariposa",      den:"Gentle bilateral tapping",       des:"Toques bilaterales suaves",     d:["A","B"] },
    safeplace:  { ic:"🌱", en:"Safe Place",            es:"Lugar seguro",         den:"Guided calm visualization",      des:"Visualización de calma guiada", d:["B"] },
    fidget:     { ic:"🌀", en:"Visual Fidget",         es:"Fidget visual",        den:"Quiet sensory play",             des:"Juego sensorial tranquilo",     d:["B"] },
    emotion:    { ic:"🟡", en:"Emotion Wheel",         es:"Rueda de emociones",   den:"Name it to tame it",             des:"Nómbralo para calmarlo",        d:["B","C"] },
    feelwheel:  { ic:"🎡", en:"Feelings Wheel",        es:"Rueda de sentimientos",den:"Tap a feeling, hear it named",   des:"Toca un sentimiento y escúchalo",d:["B","C"] },
    coreg:      { ic:"🧡", en:"Co-Regulation",         es:"Co-regulación",        den:"Calm together, side by side",    des:"Cálmense juntos, lado a lado",  d:["C","B"] },
    animalyoga: { ic:"🦁", en:"Animal Yoga",           es:"Yoga animal",          den:"Fun calming poses",              des:"Posturas divertidas y calmantes",d:["A"] }
  };
  /* curated, focused picks per low domain (kept short on purpose) */
  var DOMAIN_TOOLS = {
    A: ["breathing","grounding","take5","calmjar","movement"],
    B: ["safeplace","emotion","coreg"],
    C: ["coreg","feelwheel","emotion","bodycheck"]
  };
  var ORDER = ["breathing","boxbreath","rainbow","take5","grounding","pmr","movement","calmjar","tappad","bodycheck","bilateral","safeplace","fidget","emotion","feelwheel","coreg","animalyoga"];
  var LOW = 75; /* below this on a 0–100 domain = worth supporting (matches the "doing well" band) */
  /* the three domains, with framework names (teacher-facing) and warm labels (child-facing) */
  var GROUPS = {
    A: { fw_en:"Emotional Regulation", fw_es:"Regulación emocional", kid_en:"Calm your body",       kid_es:"Calma tu cuerpo" },
    B: { fw_en:"Self-Compassion",      fw_es:"Autocompasión",        kid_en:"Be kind to yourself",   kid_es:"Sé amable contigo" },
    C: { fw_en:"Social Competency",    fw_es:"Competencia social",   kid_en:"Connect with others",   kid_es:"Conecta con otros" }
  };
  var GORDER = ["A","B","C"];
  function primaryDom(id){ return (META[id] && META[id].d && META[id].d[0]) || "A"; }

  function isEs(){ try{ return (typeof dashLang!=="undefined" && dashLang==="es") || (typeof lang!=="undefined" && lang==="es"); }catch(e){ return false; } }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }

  /* score-based match: each low domain (lowest first) contributes its curated tools;
     if every domain is doing well, return a short keep-it-up set so it's never empty. */
  function aogMatchTools(rec){
    if (!rec) return [];
    var doms = [{k:"A",s:rec.normA},{k:"B",s:rec.normB},{k:"C",s:rec.normC}]
      .filter(function(d){ return d.s!=null && d.s < LOW; })
      .sort(function(a,b){ return a.s - b.s; });
    var picks = [];
    doms.forEach(function(d){ (DOMAIN_TOOLS[d.k]||[]).forEach(function(id){ if (META[id] && picks.indexOf(id)<0) picks.push(id); }); });
    if (!picks.length) picks = ["breathing","safeplace","emotion"];
    return picks.slice(0,6);
  }
  window.aogMatchTools = aogMatchTools;

  /* live "why these tools" sentence from a set of ids */
  function toolWhyText(ids, es){
    ids = ids || [];
    if (!ids.length) return es ? "Aún no hay herramientas seleccionadas." : "No tools selected yet.";
    var counts = {A:0,B:0,C:0};
    ids.forEach(function(id){ var dk = primaryDom(id); if (counts[dk]!=null) counts[dk]++; });
    var parts = GORDER.filter(function(dk){ return counts[dk]; }).map(function(dk){
      return (es?GROUPS[dk].kid_es:GROUPS[dk].kid_en) + " (" + counts[dk] + ")";
    });
    return (es ? ("Estas " + ids.length + " herramientas ayudan a: ") : ("These " + ids.length + " tools help: ")) + parts.join("  ·  ");
  }
  window.aogUpdateToolWhy = function(panel){
    if (!panel) return;
    var ids = Array.prototype.slice.call(panel.querySelectorAll(".aog-tm-chk:checked")).map(function(c){ return c.value; });
    var el = panel.querySelector(".aog-tm-why");
    if (el) el.textContent = toolWhyText(ids, isEs());
  };
  /* auto-check exactly the suggested (matched) set */
  window.aogUseSuggested = function(btn){
    var panel = btn.closest(".aog-tm"); if (!panel) return;
    var sug = (panel.getAttribute("data-suggested")||"").split(",").filter(Boolean);
    Array.prototype.forEach.call(panel.querySelectorAll(".aog-tm-chk"), function(c){
      var on = sug.indexOf(c.value) >= 0;
      var wasOff = !c.checked;
      c.checked = on;
      var item = c.closest(".aog-tm-item");
      if (item){
        item.classList.toggle("sel", on);
        if (on && wasOff){ item.classList.add("just-set"); setTimeout(function(){ item.classList.remove("just-set"); }, 900); }
      }
    });
    aogUpdateToolWhy(panel);
  };
  /* collapse / expand a domain group of tools */
  window.aogToggleToolGroup = function(head){
    var dk = head.getAttribute("data-dom");
    var panel = head.closest(".aog-tm"); if (!panel) return;
    var next = head.getAttribute("aria-expanded") === "false";
    head.setAttribute("aria-expanded", next ? "true" : "false");
    Array.prototype.forEach.call(panel.querySelectorAll(".aog-tm-item[data-dom=\"" + dk + "\"]"), function(el){ el.style.display = next ? "" : "none"; });
  };
  window.aogToolsSetAll = function(panel, expand){
    if (!panel) return;
    Array.prototype.forEach.call(panel.querySelectorAll(".aog-tm-ghead"), function(head){
      head.setAttribute("aria-expanded", expand ? "true" : "false");
      var dk = head.getAttribute("data-dom");
      Array.prototype.forEach.call(panel.querySelectorAll(".aog-tm-item[data-dom=\"" + dk + "\"]"), function(el){ el.style.display = expand ? "" : "none"; });
    });
  };
  window.aogToolsExpandAll = function(btn){ aogToolsSetAll(btn.closest(".aog-tm"), true); };
  window.aogToolsCollapseAll = function(btn){ aogToolsSetAll(btn.closest(".aog-tm"), false); };

  /* the curate panel shown under a student's report on the dashboard */
  window.aogToolMatchPanel = function(rec, key){
    if (!rec) return "";
    var es = isEs();
    var matched = aogMatchTools(rec);
    var domNames = es
      ? {A:"Regulación", B:"Autocompasión", C:"Social"}
      : {A:"Regulation", B:"Self-Compassion", C:"Social"};
    var lowList = [{k:"A",s:rec.normA},{k:"B",s:rec.normB},{k:"C",s:rec.normC}]
      .filter(function(d){ return d.s!=null && d.s<LOW; }).sort(function(a,b){return a.s-b.s;})
      .map(function(d){ return domNames[d.k]+" ("+Math.round(d.s)+")"; });
    var why = lowList.length
      ? (es ? "Sugeridas para apoyar: " : "Suggested to support: ") + esc(lowList.join(", "))
      : (es ? "Seguir observando en las tres áreas — aquí van algunas favoritas para mantener la calma." : "Keep noticing across all three areas — here are a few favorites to keep the calm going.");
    function itemHtml(id){
      var m = META[id];
      var on = matched.indexOf(id) >= 0;
      var second = (m.d||[]).slice(1).map(function(x){ return domNames[x]; }).join(" · ");
      return "<label class=\"aog-tm-item" + (on?" sel":"") + "\" data-dom=\"" + primaryDom(id) + "\">" +
        "<input type=\"checkbox\" class=\"aog-tm-chk\" value=\"" + id + "\"" + (on?" checked":"") + " onchange=\"this.closest('.aog-tm-item').classList.toggle('sel',this.checked); if(typeof aogUpdateToolWhy==='function') aogUpdateToolWhy(this.closest('.aog-tm'));\">" +
        "<span class=\"aog-tm-ic\">" + m.ic + "</span>" +
        "<span class=\"aog-tm-tx\"><span class=\"aog-tm-tt\">" + esc(es?m.es:m.en) + "</span>" +
        "<span class=\"aog-tm-ds\">" + esc(es?m.des:m.den) + "</span>" +
        (second ? "<span class=\"aog-tm-dm\">" + (es?"también ":"also ") + esc(second) + "</span>" : "") + "</span>" +
        "<button type=\"button\" class=\"aog-tm-prev\" onclick=\"event.preventDefault();if(typeof toolOpen==='function')toolOpen('" + id + "');\">" + (es?"Probar":"Preview") + "</button>" +
        "</label>";
    }
    /* grouped by each tool's primary domain, under the framework name */
    var items = GORDER.map(function(dk){
      var gids = ORDER.filter(function(id){ return META[id] && primaryDom(id) === dk; });
      if (!gids.length) return "";
      return "<button type=\"button\" class=\"aog-tm-ghead\" data-dom=\"" + dk + "\" aria-expanded=\"true\" onclick=\"aogToggleToolGroup(this)\"><span class=\"aog-tm-gchev\" aria-hidden=\"true\">▾</span> " + esc(es?GROUPS[dk].fw_es:GROUPS[dk].fw_en) + " <span class=\"aog-tm-gcount\">(" + gids.length + ")</span></button>" + gids.map(itemHtml).join("");
    }).join("");
    return "<div class=\"aog-tm\" data-key=\"" + esc(key) + "\" data-suggested=\"" + esc(matched.join(",")) + "\">" +
      "<h4>" + (es?"Herramientas de regulación sugeridas para ":"Suggested regulation tools for ") + esc(rec.studentId||"") + "</h4>" +
      "<p class=\"aog-tm-sub\">" + why + ". " + (es?"Marca o desmarca, luego crea un enlace o QR para enviarle solo estas herramientas.":"Check or uncheck, then create a link or QR to send just these tools.") + "</p>" +
      "<div class=\"aog-tm-history\">" + renderHistoryLine(rec.studentId||"", es) + "</div>" +
      "<div class=\"aog-tm-tools\"><button type=\"button\" class=\"aog-tm-allbtn\" onclick=\"aogToolsExpandAll(this)\">" + (es?"Abrir todo":"Expand all") + "</button><button type=\"button\" class=\"aog-tm-allbtn\" onclick=\"aogToolsCollapseAll(this)\">" + (es?"Cerrar todo":"Collapse all") + "</button></div>" +
      "<div class=\"aog-tm-grid\">" + items + "</div>" +
      "<div class=\"aog-tm-why\">" + esc(toolWhyText(matched, es)) + "</div>" +
      "<div class=\"aog-tm-actions\">" +
        "<button type=\"button\" class=\"btn btn-secondary btn-sm\" onclick=\"aogUseSuggested(this)\">" + (es?"Usar sugeridas":"Use suggested tools") + "</button>" +
        "<button type=\"button\" class=\"btn btn-sm\" onclick=\"aogBuildToolLink(this)\">" + (es?"Crear enlace y QR":"Create link & QR") + "</button>" +
        "<label class=\"aog-tm-name\"><input type=\"checkbox\" class=\"aog-tm-incname\"> " + (es?"Incluir el nombre":"Include first name") + "</label>" +
      "</div>" +
      "<div class=\"aog-tm-out\" hidden>" +
        "<div class=\"aog-tm-helper\"></div>" +
        "<div class=\"aog-tm-linkrow\"><input type=\"text\" class=\"aog-tm-url\" readonly onclick=\"this.select()\"><button type=\"button\" class=\"btn btn-secondary btn-sm aog-tm-copy\" onclick=\"aogCopyToolLink(this)\">" + (es?"Copiar":"Copy") + "</button>" + ((typeof navigator!=="undefined" && navigator.share) ? "<button type=\"button\" class=\"btn btn-sm\" onclick=\"aogShareToolLink(this)\">" + (es?"Compartir":"Share") + "</button>" : "") + "</div>" +
        "<div class=\"aog-tm-qr\"></div>" +
      "</div>" +
      "</div>";
  };

  function shareBase(){
    try{ if (typeof pageBaseUrl==="function"){ var b=pageBaseUrl(); if (b) return b; } }catch(e){}
    return location.href.split("#")[0].split("?")[0];
  }

  window.aogBuildToolLink = function(btn){
    var panel = btn.closest(".aog-tm");
    if (!panel) return;
    var es = isEs();
    var ids = Array.prototype.slice.call(panel.querySelectorAll(".aog-tm-chk:checked")).map(function(c){ return c.value; });
    var out = panel.querySelector(".aog-tm-out");
    var qr = panel.querySelector(".aog-tm-qr");
    var old = panel.querySelector(".aog-tm-empty");
    if (old) old.remove();
    if (!ids.length){
      var w = document.createElement("div");
      w.className = "aog-tm-empty";
      w.textContent = es ? "Elige al menos una herramienta." : "Pick at least one tool.";
      panel.querySelector(".aog-tm-actions").appendChild(w);
      if (out) out.hidden = true;
      return;
    }
    var params = new URLSearchParams();
    params.set("tools", ids.join(","));
    var incName = panel.querySelector(".aog-tm-incname");
    if (incName && incName.checked){
      var nm = (panel.getAttribute("data-key")||"");
      try{ var rec = (typeof dashFindRecordByKey==="function") ? dashFindRecordByKey(panel.getAttribute("data-key")) : null; if (rec && rec.studentId) nm = rec.studentId; }catch(e){}
      if (nm) params.set("for", String(nm).split(/\s+/)[0]);
    }
    var url = shareBase() + "?" + params.toString() + "#mytools";
    panel.querySelector(".aog-tm-url").value = url;
    /* log on THIS device that a tools link went out for this student (feedback loop) */
    try{
      var sRec = (typeof dashFindRecordByKey==="function") ? dashFindRecordByKey(panel.getAttribute("data-key")) : null;
      logToolsSent(sRec && sRec.studentId ? sRec.studentId : "", ids);
      var hist = panel.querySelector(".aog-tm-history");
      if (hist) hist.innerHTML = renderHistoryLine(sRec && sRec.studentId ? sRec.studentId : "", es);
    }catch(e){}
    if (out) out.hidden = false;
    var helper = panel.querySelector(".aog-tm-helper");
    if (helper){
      var firstNm = (incName && incName.checked && typeof nm!=="undefined" && nm) ? String(nm).split(/\s+/)[0] : "";
      helper.textContent = firstNm
        ? (es ? "Este enlace abre una página tranquila y privada solo para " + firstNm + "." : "This link opens a calm, private page just for " + firstNm + ".")
        : (es ? "Este enlace abre una página tranquila y privada solo para este estudiante." : "This link opens a calm, private page just for this student.");
    }
    if (qr){
      qr.innerHTML = "";
      var draw = function(){ try{ new QRCode(qr, { text:url, width:148, height:148, correctLevel:QRCode.CorrectLevel.M }); }catch(e){} };
      if (window.QRCode){ draw(); }
      else if (typeof ensureQrLib==="function"){ ensureQrLib().then(function(ok){ if (ok && window.QRCode) draw(); }); }
    }
  };

  window.aogShareToolLink = function(btn){
    var panel = btn.closest(".aog-tm"); if (!panel) return;
    var inp = panel.querySelector(".aog-tm-url"); var url = inp ? inp.value : "";
    if (!url) return;
    var es = isEs();
    if (navigator.share){ navigator.share({ title: es?"Herramientas de calma":"Calm & regulation tools", url: url }).catch(function(){}); }
    else { aogCopyToolLink(btn); }
  };
  window.aogCopyToolLink = function(btn){
    var panel = btn.closest(".aog-tm");
    var inp = panel && panel.querySelector(".aog-tm-url");
    if (!inp || !inp.value) return;
    var es = isEs();
    var done = function(){ var t=btn.textContent; btn.textContent = es?"¡Copiado!":"Copied!"; setTimeout(function(){ btn.textContent=t; }, 1500); };
    try{
      if (navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(inp.value).then(done, function(){ inp.select(); document.execCommand("copy"); done(); }); }
      else { inp.select(); document.execCommand("copy"); done(); }
    }catch(e){ inp.select(); }
  };

  /* the focused, child-facing page opened by the shared link (#mytools + ?tools=) */
  window.aogRenderMyTools = function(){
    var grid = document.getElementById("myToolsGrid");
    if (!grid) return;
    if (typeof showScreen==="function") showScreen("screen-aog-mytools");
    var es = isEs();
    var p; try{ p = new URLSearchParams(location.search); }catch(e){ p = { get:function(){return null;} }; }
    var ids = String(p.get("tools")||"").split(",").map(function(s){ return s.trim(); })
      .filter(function(id){ return META[id]; });
    if (!ids.length) ids = ["breathing","grounding","safeplace"];
    var who = String(p.get("for")||"").trim().slice(0,40);
    var title = document.getElementById("myToolsTitle");
    var eyebrow = document.getElementById("myToolsEyebrow");
    if (eyebrow) eyebrow.textContent = who ? (es ? "SOLO PARA TI" : "JUST FOR YOU") : (es ? "TÓMATE UN MOMENTO" : "TAKE A MOMENT");
    if (title) title.textContent = who
      ? (es ? "Para ti, " + who : "For you, " + who)
      : (es ? "Tus herramientas de calma y regulación" : "Your calm & regulation tools");
    var lede = document.getElementById("myToolsLede");
    if (lede) lede.textContent = who
      ? (es ? "Cuando las cosas se sientan mucho, estas están aquí para ti. Toca cualquiera — no hay una incorrecta."
            : "Whenever things feel like a lot, these are here for you. Tap any one — there’s no wrong choice.")
      : (es ? "Toca una herramienta para empezar. Cada una dura como un minuto. No hay una incorrecta — elige la que sientas bien."
            : "Tap a tool to begin. Each one takes about a minute. There’s no wrong one — pick what feels right.");
    /* personalized cue + warm banner placed right under the title (only when a name is present) */
    var screenEl = document.getElementById("screen-aog-mytools");
    if (screenEl) screenEl.classList.toggle("is-personalized", !!who);
    var oldWarm = document.getElementById("myToolsWarm");
    if (oldWarm) oldWarm.remove();
    if (lede){
      var wm = document.createElement("p");
      wm.id = "myToolsWarm";
      wm.className = "myt-warm";
      wm.textContent = who
        ? (es ? "Sea como sea tu día, no tienes que cargarlo solo. 💛"
              : "No matter what kind of day it’s been, you don’t have to carry it alone. 💛")
        : (es ? "Tómate un momento para ti. Empieza por donde se sienta bien."
              : "Take a moment for yourself. Start wherever feels right.");
      lede.parentNode.insertBefore(wm, lede);
    }
    var seeAll = document.getElementById("myToolsSeeAll");
    if (seeAll) seeAll.textContent = (es ? "Ver todas las herramientas de calma" : "See all calming tools") + " →";
    /* read-aloud control for striving / younger readers */
    var ctrls = document.getElementById("myToolsControls");
    if (ctrls){
      ctrls.innerHTML = ("speechSynthesis" in window)
        ? "<button class=\"btn btn-secondary btn-sm\" type=\"button\" onclick=\"aogReadMyTools(this)\">🔊 " + (es?"Léemelo":"Read to me") + "</button>"
        : "";
    }
    function cardHtml(id){
      var m = META[id];
      return "<div class=\"tool-card\" data-tool=\"" + id + "\" data-dom=\"" + primaryDom(id) + "\" onclick=\"aogToolTap(this,'" + id + "')\">" +
        "<span class=\"tool-icon\">" + m.ic + "</span>" +
        "<div class=\"tool-title\">" + esc(es?m.es:m.en) + "</div>" +
        "<p class=\"tool-desc\">" + esc(es?m.des:m.den) + "</p>" +
        "<button class=\"btn btn-secondary\" style=\"width:100%\">" + (es?"Empezar":"Start") + "</button>" +
        "<div class=\"myt-fb\" hidden onclick=\"event.stopPropagation()\">" +
          "<span>" + (es?"¿Te ayudó?":"Did this help?") + "</span>" +
          "<button type=\"button\" aria-label=\"yes\" onclick=\"aogToolFeedback(this,'" + id + "',1)\">👍</button>" +
          "<button type=\"button\" aria-label=\"so-so\" onclick=\"aogToolFeedback(this,'" + id + "',0)\">😐</button>" +
          "<button type=\"button\" aria-label=\"no\" onclick=\"aogToolFeedback(this,'" + id + "',-1)\">👎</button>" +
        "</div>" +
        "</div>";
    }
    /* grouped under warm, kid-friendly labels; a group header only shows if it has tools.
       headers span the full row, so cards stay in the existing tools-grid flow. */
    var present = GORDER.filter(function(dk){ return ids.some(function(id){ return primaryDom(id)===dk; }); });
    if (present.length <= 1){
      grid.innerHTML = ids.map(cardHtml).join(""); /* one cluster — skip the lone header */
    } else {
      grid.innerHTML = GORDER.map(function(dk){
        var gids = ids.filter(function(id){ return primaryDom(id)===dk; });
        if (!gids.length) return "";
        return "<div class=\"tools-row-header\">" + esc(es?GROUPS[dk].kid_es:GROUPS[dk].kid_en) + "</div>" + gids.map(cardHtml).join("");
      }).join("");
    }
  };

  /* a tappable "tools picked for you" block to embed in a person's OWN report
     (buildHomeReport with isSelf) — matched to their lowest domains */
  window.aogStudentToolsBlock = function(rec, es){
    if (!rec) return "";
    var ids = aogMatchTools(rec);
    if (!ids.length) return "";
    function card(id){
      var m = META[id]; if (!m) return "";
      return "<div class=\"tool-card aog-srt-card\" data-dom=\"" + primaryDom(id) + "\" onclick=\"if(typeof toolOpen==='function')toolOpen('" + id + "')\">" +
        "<span class=\"tool-icon\">" + m.ic + "</span>" +
        "<div class=\"tool-title\">" + esc(es?m.es:m.en) + "</div>" +
        "<p class=\"tool-desc\">" + esc(es?m.des:m.den) + "</p>" +
        "<button class=\"btn btn-secondary\" style=\"width:100%\">" + (es?"Empezar":"Start") + "</button></div>";
    }
    var present = GORDER.filter(function(dk){ return ids.some(function(id){ return primaryDom(id)===dk; }); });
    var grid;
    if (present.length <= 1){
      grid = ids.map(card).join("");
    } else {
      grid = GORDER.map(function(dk){
        var gids = ids.filter(function(id){ return primaryDom(id)===dk; });
        if (!gids.length) return "";
        return "<div class=\"tools-row-header\" style=\"margin:14px 0 8px;\">" + esc(es?GROUPS[dk].kid_es:GROUPS[dk].kid_en) + "</div>" + gids.map(card).join("");
      }).join("");
    }
    return "<div class=\"aog-srt\"><div class=\"aog-srt-h\">" + (es?"Herramientas de calma elegidas para ti":"Calm & regulation tools picked for you") + "</div>" +
      "<p class=\"aog-srt-sub\">" + (es?"Según lo que compartiste. Toca una para probarla — cada una dura como un minuto. No hay una incorrecta.":"Based on what you shared. Tap one to try it — each takes about a minute. There’s no wrong one.") + "</p>" +
      "<div class=\"tools-grid aog-srt-grid\">" + grid + "</div></div>";
  };

  /* route the shared link: #mytools (or any URL carrying ?tools=) opens the focused page */
  function routeMyTools(){
    try{
      var hash = (location.hash||"").replace(/^#/,"").trim().toLowerCase();
      var hasTools = false;
      try{ hasTools = !!new URLSearchParams(location.search).get("tools"); }catch(e){}
      /* ⚠ BARE #tools BELONGS TO THE TOOLS DESTINATION (build .30cd). This
         router used to claim it as an alias, which meant /tools — and any
         reload of #tools — opened the personalized page instead of the hub.
         The alias survives only when the URL actually carries ?tools=, which
         is what every shared link has always been built with (#mytools +
         ?tools=…, see shareBase() above). */
      if (hash === "mytools" || (hasTools && (!hash || hash === "mytools" || hash === "tools"))){
        aogRenderMyTools();
      }
    }catch(e){}
  }
  window.addEventListener("hashchange", routeMyTools);
  window.addEventListener("load", function(){ setTimeout(routeMyTools, 0); });
  if (document.readyState !== "loading") setTimeout(routeMyTools, 0);

  /* ===== feedback loop: local logs (per device) ===== */
  var SENT_KEY = "aog.tools.sent.v1", FB_KEY = "aog.tools.fb.v1";
  function readLog(k){ try{ var v=JSON.parse(localStorage.getItem(k)||"[]"); return Array.isArray(v)?v:[]; }catch(e){ return []; } }
  function writeLog(k, a){ try{ localStorage.setItem(k, JSON.stringify(a.slice(-400))); }catch(e){} }
  function firstName(s){ return String(s||"").trim().split(/\s+/)[0]; }
  function toolNames(ids, es){ return (ids||[]).map(function(id){ var m=META[id]; return m?(es?m.es:m.en):id; }).join(", "); }
  function fmtDate(ts, es){ try{ return new Date(ts).toLocaleDateString(es?"es":"en",{month:"short",day:"numeric"}); }catch(e){ return ""; } }
  function logToolsSent(student, ids){ var a=readLog(SENT_KEY); a.push({student:student||"", tools:(ids||[]).slice(), ts:Date.now()}); writeLog(SENT_KEY,a); }
  function getSentFor(student){ return readLog(SENT_KEY).filter(function(s){ return s.student===student; }).sort(function(x,y){ return y.ts-x.ts; }); }
  function logToolFeedback(id, rating, forName){ var a=readLog(FB_KEY); a.push({tool:id, rating:rating, ts:Date.now(), "for":forName||""}); writeLog(FB_KEY,a); }
  function feedbackForName(name){ name=String(name||"").toLowerCase(); return readLog(FB_KEY).filter(function(f){ return String(f["for"]||"").toLowerCase()===name; }); }
  function currentForName(){ try{ return new URLSearchParams(location.search).get("for")||""; }catch(e){ return ""; } }

  /* one-line history shown in the curate panel: last time tools were sent + any feedback (same device) */
  function renderHistoryLine(studentId, es){
    var parts = [];
    var sent = getSentFor(studentId);
    if (sent.length){
      parts.push("<span class=\"aog-tm-sent\">" + (es?"Enviado por última vez: ":"Last sent: ") + esc(toolNames(sent[0].tools, es)) + " · " + fmtDate(sent[0].ts, es) + (sent.length>1 ? " ("+sent.length+"×)" : "") + "</span>");
    }
    var fb = feedbackForName(firstName(studentId));
    if (fb.length){
      var up=0, mid=0, dn=0;
      fb.forEach(function(f){ if(f.rating>0)up++; else if(f.rating<0)dn++; else mid++; });
      parts.push("<span class=\"aog-tm-fbsum\">" + (es?"Respuesta del estudiante: ":"Student feedback: ") + "👍 "+up+" · 😐 "+mid+" · 👎 "+dn + "</span>");
    }
    return parts.join(" &nbsp;·&nbsp; ");
  };

  /* child page: tap a tool -> open it AND reveal its quick feedback row */
  window.aogToolTap = function(card, id){
    try{ if (typeof toolOpen==="function") toolOpen(id); }catch(e){}
    try{ var fb = card.querySelector(".myt-fb"); if (fb) fb.hidden = false; }catch(e2){}
  };
  window.aogToolFeedback = function(btn, id, rating){
    try{ logToolFeedback(id, rating, firstName(currentForName())); }catch(e){}
    var row = btn.closest(".myt-fb");
    if (row) row.innerHTML = "<span>" + (isEs()?"¡Gracias! 💛":"Thanks! 💛") + "</span>";
  };

  /* read-aloud for the child tools page */
  window.aogReadMyTools = function(btn){
    if (!("speechSynthesis" in window)) return;
    var es = isEs();
    var grid = document.getElementById("myToolsGrid");
    if (!grid) return;
    if (speechSynthesis.speaking){ try{ speechSynthesis.cancel(); }catch(e){} if(btn) btn.textContent = "🔊 " + (es?"Léemelo":"Read to me"); return; }
    var parts = [];
    var title = document.getElementById("myToolsTitle"); if (title) parts.push(title.textContent);
    Array.prototype.forEach.call(grid.querySelectorAll(".tool-card"), function(c){
      var t = c.querySelector(".tool-title"), d = c.querySelector(".tool-desc");
      if (t) parts.push(t.textContent + (d ? ". " + d.textContent : ""));
    });
    var u = new SpeechSynthesisUtterance(parts.join(". "));
    u.lang = es ? "es-ES" : "en-US";
    u.onend = function(){ if (btn) btn.textContent = "🔊 " + (es?"Léemelo":"Read to me"); };
    try{ speechSynthesis.cancel(); speechSynthesis.speak(u); if (btn) btn.textContent = "⏹ " + (es?"Detener":"Stop"); }catch(e){}
  };

  /* ===== per-child sustain view: self-reflections across windows, with deltas + tools-sent ===== */
  window.aogSustainPanel = function(rec){
    if (!rec || typeof getAllRecords !== "function") return "";
    var es = isEs();
    var sid = rec.studentId;
    var all = getAllRecords().filter(function(r){ return r.studentId === sid; });
    var order = ["Fall","Winter","Spring","Summer"];
    var byWin = {};
    all.forEach(function(r){ var w = r.window || "—"; if (!byWin[w] || new Date(r.timestamp) > new Date(byWin[w].timestamp)) byWin[w] = r; });
    var rows = order.filter(function(w){ return byWin[w]; }).map(function(w){ return byWin[w]; });
    var head = "<h4>" + (es?"Ladrillo a ladrillo":"Brick by brick") + "</h4>";
    if (rows.length <= 1){
      return "<div class=\"aog-sustain\">" + head + "<p class=\"aog-sus-note\">" + (es
        ? "Una autorreflexión hasta ahora. Vuelve a hacer la autorreflexión el próximo período para ver el movimiento — sobre todo después de enviar herramientas."
        : "One self-reflection so far. Re-check next window to see movement — especially after sending tools.") + "</p></div>";
    }
    function cell(cur, prev){
      var v = (cur==null) ? "—" : Math.round(cur);
      if (prev==null || cur==null) return "" + v;
      var d = Math.round(cur - prev);
      if (d > 0) return v + " <span class=\"sus-up\">▲&nbsp;+" + d + "</span>";
      if (d < 0) return v + " <span class=\"sus-dn\">▼&nbsp;-" + Math.abs(d) + "</span>";
      return v + " <span class=\"sus-fl\">→&nbsp;0</span>";
    }
    var prev = null;
    var trs = rows.map(function(r){
      var tr = "<tr><td>" + esc((typeof winLabel==="function" && r.window) ? winLabel(r.window) : (r.window||"—")) + "</td>" +
        "<td>" + cell(r.normComposite, prev && prev.normComposite) + "</td>" +
        "<td>" + cell(r.normA, prev && prev.normA) + "</td>" +
        "<td>" + cell(r.normB, prev && prev.normB) + "</td>" +
        "<td>" + cell(r.normC, prev && prev.normC) + "</td></tr>";
      prev = r; return tr;
    }).join("");
    var sent = getSentFor(sid);
    var sentHtml = sent.length
      ? "<div class=\"aog-sus-sent\">" + (es?"Herramientas enviadas: ":"Tools sent: ") + sent.slice(0,4).map(function(s){ return esc(toolNames(s.tools, es)) + " · " + fmtDate(s.ts, es); }).join("<br>") + "</div>"
      : "";
    return "<div class=\"aog-sustain\">" + head +
      "<div class=\"aog-sus-wrap\"><table class=\"aog-sus-tbl\"><thead><tr><th>" + (es?"Período":"Window") + "</th><th>" + (es?"Total":"Overall") + "</th><th>" + (es?"Reg.":"Reg.") + "</th><th>" + (es?"Auto.":"Self") + "</th><th>" + (es?"Social":"Social") + "</th></tr></thead><tbody>" + trs + "</tbody></table></div>" +
      "<p class=\"aog-sus-key\">" + (es?"Reg. = Regulación · Auto. = Autocompasión · Social = Competencia social. ▲/▼ = cambio desde el período anterior.":"Reg. = Regulation · Self = Self-Compassion · Social = Social Competency. ▲/▼ = change from the prior window.") + "</p>" +
      sentHtml + "</div>";
  };

  /* ===== fidelity: a calm 60-second script for introducing the self-reflection to a class ===== */
  function introScriptHtml(es){
    if (es){
      return "<div class=\"aog-isc\"><div class=\"aog-isc-h\">Para presentarlo a tu clase (≈60 segundos)</div>" +
        "<p>“Hoy vamos a hacer un <strong>autorreflexión</strong> tranquilo. No es un examen y no hay respuestas correctas o incorrectas — es solo una forma de notar cómo te sientes por dentro.”</p>" +
        "<p>“Tus respuestas me llegan para que pueda <strong>entenderte y apoyarte</strong> — nunca para calificarte. Veo cómo va toda la clase, y también puedo leer tu autorreflexión.”</p>" +
        "<p>“Sé honesto contigo mismo. Tómate tu tiempo. Si una pregunta te cuesta, está bien.”</p>" +
        "<p>“Al terminar, quizás te comparta algunas <strong>herramientas de calma</strong> para probar — son para ti, no una tarea.”</p>" +
        "<div class=\"aog-isc-tip\">Consejo: hazlo tú también alguna vez. Cuando los adultos modelan la autorreflexión, baja la presión para todos.</div></div>";
    }
    return "<div class=\"aog-isc\"><div class=\"aog-isc-h\">To introduce this to your class (≈60 seconds)</div>" +
      "<p>“Today we’re going to do a quiet <strong>self-reflection</strong>. It’s not a test, and there are no right or wrong answers — it’s just a way to notice how you’re doing on the inside.”</p>" +
      "<p>“Your answers come to me so I can <strong>understand and support you</strong> — never to grade you. I look at how the whole class is doing, and I can read your self-reflection too.”</p>" +
      "<p>“Be honest with yourself. Take your time. If a question feels hard, that’s okay.”</p>" +
      "<p>“Afterward, I might share a few <strong>calming tools</strong> for you to try — they’re for you, not homework.”</p>" +
      "<div class=\"aog-isc-tip\">Tip: do a self-reflection yourself sometime too. When adults model it, it lowers the pressure for everyone.</div></div>";
  }
  window.aogToggleIntroScript = function(btn){
    var box = document.getElementById("aogIntroScript");
    if (!box) return;
    var es = isEs();
    if (box.hidden){
      box.innerHTML = introScriptHtml(es);
      box.hidden = false;
      if (btn) btn.textContent = es ? "Ocultar el guión" : "Hide the script";
      try{ box.scrollIntoView({behavior:"smooth", block:"nearest"}); }catch(e){}
    } else {
      box.hidden = true;
      box.innerHTML = "";
      if (btn) btn.textContent = es ? "Cómo presentarlo (60 s)" : "How to introduce this (60 sec)";
    }
  };
})();
