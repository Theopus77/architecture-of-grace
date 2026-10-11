
    (function(){
      "use strict";
      var DKEY="aog.daily.v1";
      function DTx(en,es){ return (typeof DT==="function")?DT(en,es):en; }
      function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"})[c];}); }
      function load(){ try{return JSON.parse(localStorage.getItem(DKEY)||"{}")||{};}catch(e){return {};} }
      function save(o){ try{localStorage.setItem(DKEY,JSON.stringify(o));}catch(e){} }
      function todayISO(){ var d=new Date(),m=d.getMonth()+1,da=d.getDate(); return d.getFullYear()+"-"+(m<10?"0"+m:m)+"-"+(da<10?"0"+da:da); }
      function shortD(iso){ var p=String(iso||"").split("-"); return p.length===3?(parseInt(p[1],10)+"/"+parseInt(p[2],10)):iso; }
      function color(p){ return p>=61?"var(--green,#2E6B3A)":p>=41?"var(--amber,#8A6D1F)":"var(--red,#8B2A2A)"; }
      function smiley(p){ return p>=61?"🙂":p>=41?"😐":"☹"; }
      var ST=(window.__aogDaily=window.__aogDaily||{s:"",date:"",period:"Morning",other:""});
      function el(id){ return document.getElementById(id); }

      /* ---- Optional PBIS lens: generic school-wide expectations shown as chips.
             Display-only — storage schema and scoring are untouched. ---- */
      var PBIS_KEY="aog.daily.pbis";
      function pbisOn(){ try{ return localStorage.getItem(PBIS_KEY)!=="0"; }catch(e){ return true; } }
      /* Optional PBIS lens: generic school-wide expectations as chips.
         Display-only - nothing is stored, scored or filtered from a chip.
         FOUR now, not three: plenty of buildings run "Be Ready" alongside
         Respectful, Responsible and Safe, and Ready is exactly what the new
         engagement domain names. The labels live on the domain table so
         there is one place to reword them. */
      function pbisChip(key){
        if(!pbisOn()) return "";
        var m=null;
        try{ (window.AOG_OBS?AOG_OBS.domains():[]).forEach(function(d){ if(d.key===key) m=d; }); }catch(e){}
        if(!m||!m.pbis_en) return "";
        return ' <span class="dl-pbis-chip" style="display:inline-block;font-size:10px;font-weight:700;letter-spacing:.03em;line-height:1.5;color:var(--gold-deep,#9a6f24);border:1px solid var(--gold,#D9A33B);border-radius:999px;padding:1px 8px;vertical-align:middle;white-space:nowrap;">'+esc(DTx(m.pbis_en,m.pbis_es))+'</span>';
      }
      window.aogDailyPbisToggle=function(on){
        try{ localStorage.setItem(PBIS_KEY,on?"1":"0"); }catch(e){}
        /* ⚠ THIS TOGGLE RE-RENDERS THE WHOLE CARD, so anything ticked and
           not carried across is silently lost. The ticks are read off their
           data attributes rather than a hard-coded id list, so a line added
           to AOG_OBS is carried without anyone remembering to come back. */
        var keep={};
        try{ Array.prototype.forEach.call(document.querySelectorAll("[data-dlobs],[data-dlflag]"),function(cb){
          keep[(cb.getAttribute("data-dlobs")||"")+"|"+(cb.getAttribute("data-dlflag")||"")]=cb.checked; }); }catch(e){}
        var gkeep={};
        try{ Array.prototype.forEach.call(document.querySelectorAll("[data-dlgoal]"),function(cb){ gkeep[cb.getAttribute("data-dlgoal")]=cb.checked; }); }catch(e1){}
        var note=el("dlPeriodNote"); var nv=note?note.value:null;
        if(window.aogRenderDaily) aogRenderDaily();
        try{ Array.prototype.forEach.call(document.querySelectorAll("[data-dlobs],[data-dlflag]"),function(cb){
          var k=(cb.getAttribute("data-dlobs")||"")+"|"+(cb.getAttribute("data-dlflag")||"");
          if(keep[k]) cb.checked=true; }); }catch(e2){}
        try{ Array.prototype.forEach.call(document.querySelectorAll("[data-dlgoal]"),function(cb){ var k=cb.getAttribute("data-dlgoal"); if(gkeep[k]) cb.checked=true; }); }catch(e3){}
        var n2=el("dlPeriodNote"); if(n2&&nv!=null) n2.value=nv;
      };

      /* One small stylesheet for the grouped ticks. Injected here rather
         than added to aog-styles.css because this block already owns .dl-*,
         and a second file to keep in step is exactly the bug this build is
         removing. */
      (function(){
        if(document.getElementById("aog-dl-obs-css")) return;
        var st=document.createElement("style"); st.id="aog-dl-obs-css";
        st.textContent=
          ".dl-obsgroup{margin:14px 0 4px;}"+
          ".dl-obshead{font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-soft,#46506E);"+
            "padding-bottom:5px;margin-bottom:8px;border-bottom:1px solid var(--rule,rgba(10,30,51,.14));}"+
          ".dl-flagchk{background:rgba(217,163,59,.07);border-radius:9px;}"+
          ".dl-logwho{font-size:12.5px;font-weight:700;color:var(--ink,#22303F);margin-top:3px;}"+
          ".dl-logrole{font-weight:500;color:var(--ink-soft,#46506E);}"+
          ".dl-logvia{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;"+
            "color:var(--gold-deep,#9a6f24);border:1px solid var(--gold,#D9A33B);border-radius:999px;padding:0 7px;margin-left:5px;vertical-align:middle;}";
        (document.head||document.documentElement).appendChild(st);
      })();

      /* ---- schema-tolerant scoring: legacy checks[], the three named
              booleans, and since .29al a fourth when the record has one ---- */
      function periodStats(p){
        if(p&&Object.prototype.hasOwnProperty.call(p,"checks")&&p.checks&&p.checks.length!=null){
          var t=p.checks.length,g=0; for(var i=0;i<p.checks.length;i++){ if(p.checks[i])g++; } return {g:g,t:t};
        }
        var got=0; if(p&&p.regulated)got++; if(p&&p.usedStrategy)got++; if(p&&p.connected)got++;
        /* An entry written before build .29al has no `engaged` field at all.
           Scoring it out of four would quietly turn every honest 3-of-3 in
           the history into 75% - the denominator has to belong to the record,
           not to whatever build happens to be reading it. */
        if(p&&Object.prototype.hasOwnProperty.call(p,"engaged")){ if(p.engaged)got++; return {g:got,t:4}; }
        return {g:got,t:3};
      }
      function periodPct(p){ var s=periodStats(p); return s.t?Math.round(s.g/s.t*100):0; }
      function dayPct(day){ var tot=0,got=0; ((day&&day.periods)||[]).forEach(function(p){ var s=periodStats(p); tot+=s.t; got+=s.g; }); return tot?Math.round(got/tot*100):0; }
      function hasEntry(day){ return !!(day&&day.periods&&day.periods.length); }

      /* ---- period options: canonical English value, bilingual label ----

         ⚠ THE SCHEDULE IS ELEVEN PERIODS, 0 THROUGH 10, AND 0 IS ADVISORY.
         The check-in layer was corrected to this on 2026-08-25; THIS list was
         missed and still stopped at Period 8 with no Advisory at all, so the
         same school day had two different shapes depending on which tool a
         teacher opened, and a Period 9 or 10 log simply could not be recorded.
         Corrected 2026-08-27.

         Period 0 stores the string "Advisory", NOT "Period 0" — that is the
         value the check-in layer already writes and the Sheet's period column
         already holds, and the two tools have to mean the same thing by it.

         Periods lead because this is a period-based day; the three times of
         day stay for elementary and self-contained rooms that do not run one.
         Adding a Period 11 later is one line here and one in PERIOD_DEFS. */
      function periodOpts(){
        var out = [{v:"Advisory", en:"Period 0 · Advisory", es:"Periodo 0 · Asesoría"}];
        for (var i = 1; i <= 10; i++) {
          out.push({v:"Period " + i, en:"Period " + i, es:"Periodo " + i});
        }
        out.push({v:"Morning", en:"Morning", es:"Mañana"});
        out.push({v:"Midday", en:"Midday", es:"Mediodía"});
        out.push({v:"Afternoon / End of Day", en:"Afternoon / End of Day", es:"Tarde / Fin del día"});
        out.push({v:"__other__", en:"Other (write below)", es:"Otro (escribe abajo)"});
        return out;
      }
      function periodLabel(v){ var o=periodOpts(); for(var i=0;i<o.length;i++){ if(o[i].v===v) return DTx(o[i].en,o[i].es); } return v; }
      /* Daily-log checks, worded per grade band and aligned to the Goal Builder's
         competency language (The Pause · Regulation, The Coach Voice · Self-Compassion,
         The Repair Move · Social & Repair). Storage keys stay regulated/usedStrategy/connected
         so older logs remain valid; only the visible wording changes by band. */
      /* ⚠ THE FRAMEWORK TERM LIVES HERE NOW, ON THE TOOLTIP — not in the
         sentence a teacher reads. Jimmy, 2026-08-29: a gen-ed teacher would
         not understand the old wording, and neither did he, and he wrote it.
         The Pause, the Coach Voice, the Repair Move and a charitable read are
         taught constructs from the books; a colleague logging a period between
         classes has not read the books. The alignment to the Goal Builder was
         deliberate and is KEPT — it just stopped being the visible question. */
      /* ============ ONE OBSERVATION TABLE, READ BY BOTH SCREENS ============
         Build 2026.08.29al.

         WHY IT MOVED. The Daily log and the adult team check-in each held
         their own copy of the same three sentences, and t106 existed only to
         catch them drifting apart. There is one table now, so the drift it
         tested for cannot happen; the suite asserts the single source instead.

         WHY THE QUESTIONS CHANGED. Three checks are the right three things to
         MEASURE and the wrong three things to ASK a colleague who saw one
         forty-minute period. Nothing in them named getting started, staying
         with hard work, asking for help, or joining in - the things a math or
         PE or Spanish teacher actually watches happen. The test is that six
         teachers of six subjects can answer it cold, without being taught a
         framework first.

         ⚠ THE THREE STORAGE KEYS DO NOT MOVE. regulated / usedStrategy /
         connected are what every chart, report, CSV and Sheet column in this
         product counts, and every log ever saved still reads. A FOURTH domain
         joins them - `engaged` - because persistence, asking for help and
         joining in are none of the three, and filing them under one of the
         three would be filing a real observation in the wrong place.

         ⚠ SCORED AGAINST THE DOMAINS THE RECORD CARRIES. See periodStats().

         ⚠ THE FOURTH GROUP IS NOT SCORED AND MUST NEVER BECOME SO. "Showed a
         strength", "something looked different", "the team should know" are a
         person passing a note, not an observation of a competency. They live
         in their own field, `flags`, and nothing that scores looks at it -
         the same ruling the IEP-goal ticks got: a checkbox on a period log is
         not a team deciding something is progress-monitoring data.

         ⚠ THE DOMAIN IS METADATA, NOT THE QUESTION. A group is how a teacher
         thinks; the domain underneath is how the product files it. One group
         can carry items from two domains and does. Keep the domain on the
         tooltip and the small tag, never in the sentence. .29ag's ruling. */
      window.AOG_OBS = (function(){
        var DOMAINS = [
          { key:"engaged",      en:"Engagement & Learning", es:"Compromiso y aprendizaje",
            s_en:"Engagement",  s_es:"Compromiso",
            pbis_en:"Ready",    pbis_es:"Listo/a",
            fw_en:"Engagement — not one of the three Goal Builder competencies",
            fw_es:"Compromiso — no es una de las tres competencias del Generador de metas" },
          { key:"regulated",    en:"Regulation", es:"Regulación",
            s_en:"Regulation",  s_es:"Regulación",
            pbis_en:"Safe",     pbis_es:"Seguro/a",
            fw_en:"Goal Builder: The Pause · Regulation",
            fw_es:"Generador de metas: La Pausa · Regulación" },
          { key:"usedStrategy", en:"Self-Compassion", es:"Autocompasión",
            s_en:"Self-compassion", s_es:"Autocompasión",
            pbis_en:"Responsible",  pbis_es:"Responsable",
            fw_en:"Goal Builder: The Coach Voice · Self-Compassion",
            fw_es:"Generador de metas: La Voz del Entrenador · Autocompasión" },
          { key:"connected",    en:"Social & Repair", es:"Relación y reparación",
            s_en:"Social & repair", s_es:"Relación y reparación",
            pbis_en:"Respectful",   pbis_es:"Respetuoso/a",
            fw_en:"Goal Builder: The Repair Move · Social & Repair",
            fw_es:"Generador de metas: El Acto de Reparación · Relación y reparación" }
        ];

        /* `y_en` / `y_es` are the youngest bands (K-2 and 3-5). Where a line
           has none, the one sentence works at every age and there is
           deliberately no second version of it to keep in step. */
        var GROUPS = [
          { key:"learn", en:"Engagement & learning", es:"Compromiso y aprendizaje", dom:"engaged",
            items:[
              { k:"e_stayed", dom:"engaged",
                en:"Stayed with it when the work got hard",
                es:"Siguió intentando cuando el trabajo se puso difícil",
                g35_en:"Stuck with it when the work got tricky",
                g35_es:"Siguió con el trabajo cuando se puso difícil",
                k2_en:"Kept trying when it was hard",
                k2_es:"Siguió intentando cuando fue difícil",
                s_en:"Stayed with it", s_es:"Persistió" },
              { k:"e_asked", dom:"engaged",
                en:"Asked for help, or asked a question, when they needed to",
                es:"Pidió ayuda o hizo una pregunta cuando la necesitaba",
                g35_en:"Asked for help instead of staying stuck",
                g35_es:"Pidió ayuda en vez de quedarse atascado/a",
                k2_en:"Asked a grown-up for help",
                k2_es:"Le pidió ayuda a una persona adulta",
                s_en:"Asked for help", s_es:"Pidió ayuda" },
              { k:"e_own", dom:"engaged",
                en:"Got started and kept working — on their own, or with a support",
                es:"Empezó y siguió trabajando — solo/a o con un apoyo",
                g35_en:"Got started without needing a reminder",
                g35_es:"Empezó sin que se lo recordaran",
                k2_en:"Started the work and stayed with it",
                k2_es:"Empezó el trabajo y se quedó en él",
                s_en:"Got started", s_es:"Empezó" },
              { k:"e_joined", dom:"engaged",
                en:"Joined in — answered, contributed, or shared an idea",
                es:"Participó — respondió, aportó o compartió una idea",
                g35_en:"Joined in — answered, shared, or volunteered",
                g35_es:"Participó — respondió, compartió o se ofreció",
                k2_en:"Joined in — shared or answered",
                k2_es:"Participó — compartió o respondió",
                s_en:"Joined in", s_es:"Participó" },
              { k:"e_kept", dom:"usedStrategy",
                en:"Kept going after a mistake instead of turning on themselves",
                es:"Siguió adelante tras un error en vez de castigarse",
                g35_en:"Kept going after a mistake",
                g35_es:"Siguió adelante después de un error",
                k2_en:"Was kind to themselves after a mistake",
                k2_es:"Se trató con amabilidad después de un error",
                s_en:"Kept going after a mistake", s_es:"Siguió tras un error" }
            ] },
          { key:"steady", en:"Well-being & regulation", es:"Bienestar y regulación", dom:"regulated",
            items:[
              { k:"r_back", dom:"regulated",
                en:"Got back on track after getting distracted, frustrated, or upset",
                es:"Volvió a encarrilarse tras distraerse, frustrarse o alterarse",
                g35_en:"Got back on track after getting upset or distracted",
                g35_es:"Volvió a encarrilarse después de alterarse o distraerse",
                k2_en:"Calmed down and came back to the group",
                k2_es:"Se calmó y volvió al grupo",
                s_en:"Back on track", s_es:"Volvió al ritmo" },
              { k:"r_change", dom:"regulated",
                en:"Took a change, a correction, or something unexpected in stride",
                es:"Aceptó un cambio, una corrección o algo inesperado sin perder el rumbo",
                g35_en:"Handled a change or a correction without it wrecking the rest",
                g35_es:"Aceptó un cambio o una corrección sin que le arruinara el resto",
                k2_en:"Was okay when the plan changed",
                k2_es:"Estuvo bien cuando el plan cambió",
                s_en:"Took a change in stride", s_es:"Aceptó un cambio" },
              { k:"r_tool", dom:"regulated",
                en:"Used a strategy, a break, or a support to get through a rough moment",
                es:"Usó una estrategia, un descanso o un apoyo para pasar un momento difícil",
                g35_en:"Used a strategy or a break to get through a hard moment",
                g35_es:"Usó una estrategia o un descanso para pasar un momento difícil",
                k2_en:"Used a tool or a break to feel better",
                k2_es:"Usó una herramienta o un descanso para sentirse mejor",
                s_en:"Used a support", s_es:"Usó un apoyo" },
              { k:"r_fair", dom:"usedStrategy",
                en:"Was fair to themselves when something did not go well",
                es:"Fue justo/a consigo mismo/a cuando algo no salió bien",
                g35_en:"Did not put themselves down when something went wrong",
                g35_es:"No se menospreció cuando algo salió mal",
                k2_en:"Was not too hard on themselves",
                k2_es:"No fue duro/a consigo mismo/a",
                s_en:"Fair to themselves", s_es:"Justo/a consigo" }
            ] },
          { key:"with", en:"Connection & community", es:"Relación y comunidad", dom:"connected",
            items:[
              { k:"c_worked", dom:"connected",
                en:"Worked well with a classmate or an adult",
                es:"Trabajó bien con un/a compañero/a o con un adulto",
                g35_en:"Worked well with a partner or a group",
                g35_es:"Trabajó bien con un/a compañero/a o en grupo",
                k2_en:"Played or worked well with someone",
                k2_es:"Jugó o trabajó bien con alguien",
                s_en:"Worked well with someone", s_es:"Trabajó bien" },
              { k:"c_kind", dom:"connected",
                en:"Was kind, patient, or considerate toward someone",
                es:"Fue amable, paciente o considerado/a con alguien",
                g35_en:"Was kind, patient, or included someone",
                g35_es:"Fue amable, paciente o incluyó a alguien",
                k2_en:"Was kind to someone",
                k2_es:"Fue amable con alguien",
                s_en:"Kind or considerate", s_es:"Amable" },
              { k:"c_built", dom:"connected",
                en:"Built on someone else’s idea, or made something right after a bump",
                es:"Retomó la idea de otra persona, o reparó algo después de un roce",
                g35_en:"Made something right after a bump, or listened to someone else’s idea",
                g35_es:"Reparó algo después de un roce, o escuchó la idea de otra persona",
                k2_en:"Made something right, or shared",
                k2_es:"Reparó algo, o compartió",
                s_en:"Built on / made right", s_es:"Retomó o reparó" }
            ] },
          /* ⚠ NOTHING IN THIS GROUP IS SCORED. `flag:true` keeps it out of
             every domain, every percentage and every trend. It is a note to
             the team, and it is placed beside the note box and the follow-up
             request on purpose, because that is what it is. */
          { key:"share", en:"Worth passing on", es:"Vale la pena compartirlo", flag:true,
            sub_en:"None of these is scored. They are a note to the student’s team.",
            sub_es:"Nada de esto se puntúa. Son una nota para el equipo del estudiante.",
            items:[
              { k:"f_strength", flag:true,
                en:"Showed a strength, an interest, or a success worth celebrating",
                es:"Mostró una fortaleza, un interés o un logro que vale la pena celebrar",
                k2_en:"Showed a strength, or something they love",
                k2_es:"Mostró una fortaleza, o algo que le encanta",
                s_en:"A strength worth sharing", s_es:"Una fortaleza" },
              { k:"f_different", flag:true,
                en:"Something looked different today",
                es:"Hoy algo se vio diferente",
                s_en:"Different today", s_es:"Algo diferente" },
              { k:"f_know", flag:true,
                en:"Something happened the team should know about",
                es:"Pasó algo que el equipo debería saber",
                s_en:"The team should know", s_es:"El equipo debería saber" }
            ] }
        ];

        /* ⚠ THREE BANDS, NOT A "YOUNG" VARIANT. .29al had K-2 and 3-5 share
           one simplified wording; a first grader's teacher and a fifth
           grader's teacher do not watch the same thing happen.

           9-10 and 11-12 read the 6-8 wording ON PURPOSE. It is written for an
           adolescent and holds up at fifteen; two more sets that nobody in
           this district could check would be decoration, and decoration in a
           table like this is how a screen ends up asking a question nobody
           meant. Add them when a high school actually uses this. */
        function pick(it, band, es){
          if(band==="k2")  return es ? (it.k2_es||it.es)  : (it.k2_en||it.en);
          if(band==="35")  return es ? (it.g35_es||it.es) : (it.g35_en||it.en);
          return es?it.es:it.en;
        }
        function domOf(k){ for(var i=0;i<GROUPS.length;i++){ var g=GROUPS[i].items; for(var j=0;j<g.length;j++){ if(g[j].k===k) return g[j].dom||""; } } return ""; }
        function fwOf(dom, es){ for(var i=0;i<DOMAINS.length;i++){ if(DOMAINS[i].key===dom) return es?DOMAINS[i].fw_es:DOMAINS[i].fw_en; } return ""; }
        function labOf(dom, es){ for(var i=0;i<DOMAINS.length;i++){ if(DOMAINS[i].key===dom) return es?DOMAINS[i].es:DOMAINS[i].en; } return ""; }

        return {
          version:"v2",
          domains:function(){ return DOMAINS.slice(); },
          domainKeys:function(){ return DOMAINS.map(function(d){ return d.key; }); },
          domainLabel:labOf,
          domainOf:domOf,
          /* Every group, resolved for one band and one language. The screens
             render from this and nothing else. */
          groups:function(band, es){
            return GROUPS.map(function(g){
              return { key:g.key, flag:!!g.flag,
                title: es?g.es:g.en,
                sub: (es?g.sub_es:g.sub_en)||"",
                items: g.items.map(function(it){
                  /* ⚠ THE TAG ONLY APPEARS WHERE IT TELLS YOU SOMETHING. A
                     group already says it is about engagement; repeating
                     "Engagement & Learning" under all four of its lines is
                     noise. The tag is for the line that files somewhere the
                     reader would not guess - "Kept going after a mistake"
                     sits in the engagement group and counts as
                     Self-Compassion, and that is worth saying. */
                  return { k:it.k, dom:it.dom||"", flag:!!it.flag,
                           q:pick(it,band,es),
                           short:(es?it.s_es:it.s_en)||"",
                           domLabel: (it.dom && it.dom!==g.dom)?labOf(it.dom,es):"",
                           fw: it.dom?fwOf(it.dom,es):"" };
                }) };
            });
          },
          /* Flat lists, for a caller that does not care about grouping. */
          items:function(band, es){
            var out=[]; this.groups(band,es).forEach(function(g){ if(!g.flag) out=out.concat(g.items); }); return out;
          },
          flags:function(band, es){
            var out=[]; this.groups(band,es).forEach(function(g){ if(g.flag) out=out.concat(g.items); }); return out;
          },
          shortOf:function(k, es){
            var s="";
            GROUPS.forEach(function(g){ g.items.forEach(function(it){ if(it.k===k) s=(es?it.s_es:it.s_en)||""; }); });
            return s;
          },
          /* A list of ticked item keys becomes the four domain booleans.
             A domain is TRUE when ANY of its items was ticked - one adult
             seeing one thing is one observation, not a fraction of one. */
          domainsFrom:function(keys){
            var out={engaged:false,regulated:false,usedStrategy:false,connected:false};
            (keys||[]).forEach(function(k){ var d=domOf(k); if(d && out.hasOwnProperty(d)) out[d]=true; });
            return out;
          }
        };
      })();

      var DL_BAND_LABEL={k2:"K–2","35":"3–5","68":"6–8","910":"9–10","1112":"11–12",adult:DTx("Adult","Adulto")};
      function dlGradeFor(id){ try{ var recs=(typeof getAllRecords==="function"?getAllRecords():[])||[]; for(var i=0;i<recs.length;i++){ if(recs[i]&&String(recs[i].studentId).trim()===id && recs[i].grade!=null) return String(recs[i].grade); } }catch(e){} return ""; }
      function dlBand(id){ var g=(dlGradeFor(id)||"").toString().trim().toLowerCase().replace(/grade|gr\.?/g,"").trim();
        if(g.indexOf("adult")>=0) return "adult";
        if(g==="k"||g==="kg"||g==="kinder") return "k2";
        var n=parseInt(g,10); if(!isNaN(n)){ if(n<=2)return "k2"; if(n<=5)return "35"; if(n<=8)return "68"; if(n<=10)return "910"; return "1112"; }
        return "68";
      }
      /* ═══════════════ THIS STUDENT'S IEP GOALS, WHEN THERE ARE ANY
         Jimmy, 2026-08-29: the daily log should be able to carry the student's
         IEP goals too, "as well as being respectful kind and safe", as part of
         the collaborative paperwork for the IEP team.

         ⚠ A TICK HERE IS NOT A MEASUREMENT. It is written to the daily log and
         nowhere else — never into aog.iep.v1, never onto the aimline, never
         into the progress signal. Exactly the ruling the colleague link keeps:
         a person decides what becomes progress-monitoring data, and a
         checkbox on a period log is not that person deciding.

         ⚠ AND IT CANNOT MOVE THE PERIOD PERCENTAGE. periodStats() counts the
         three named keys (or a legacy `checks` array) and never looks at
         `goals`, so every trend point ever drawn stays the number it was.

         ⚠ THE CHECKBOX SHOWS A SHORT LABEL, NOT THE LEGAL GOAL STATEMENT.
         The plain-language skill if the goal has been connected to home,
         otherwise the area. A goal paragraph inside a checkbox is unreadable,
         and it is the legal record besides — it is on the tooltip, on the
         teacher's own device, for whoever needs it. */
      function dlGoals(sid){
        try{
          if(!sid||!window.AOGIepRead||typeof AOGIepRead.goalsFor!=="function") return [];
          return (AOGIepRead.goalsFor(sid)||[]).filter(function(r){ return r&&r.g&&!r.g.archived; }).slice(0,8);
        }catch(e){ return []; }
      }
      /* ⚠ NEVER THE AREA. The first cut fell back to AOGIepRead.areaLabel, so
         an unconnected goal rendered as "Behavior · IEP goal". Two things
         wrong with that, and the second is the serious one:
           · it names no behavior a teacher could notice in a period — it is
             a filing category, not an observation;
           · THE AREA IS THE DISABILITY CATEGORY, the one field every link in
             this product is asserted not to carry. It does not belong on a
             logging screen either, in front of whoever is covering the room.
         Fall back instead to the plain word the home panel would already have
         suggested for that area — the same SKILLS table, exported as
         AOGHome.skills, so there is one source for the wording and not two. */
      function dlGoalLabel(r){
        try{ var c=(window.AOGHome&&AOGHome.cfg)?AOGHome.cfg(r.id):null; if(c&&c.skill) return String(c.skill); }catch(e){}
        try{
          var S=(window.AOGHome&&AOGHome.skills)?AOGHome.skills:null;
          if(S){
            var list=S[r.g.area]||S.other;
            if(list&&list[0]&&list[0][0]){
              var en=String(list[0][0]);
              /* ⚠ THE DAILY LOG'S OWN LANGUAGE, not documentElement.lang. */
              if(DTx("en","es")==="es"){
                try{ var ES=AOGHome.skillsEs||{}; if(ES[en]&&ES[en][0]) return String(ES[en][0]); }catch(e3){}
              }
              return en;
            }
          }
        }catch(e2){}
        return DTx("IEP goal","Meta del IEP");
      }
      function dlGoalsHtml(sid){
        var gs=dlGoals(sid);
        if(!gs.length) return "";
        var rows=gs.map(function(r){
          return '<label class="dl-chk dl-goalchk" title="'+esc(String(r.g.title||""))+'">'
            + '<input type="checkbox" data-dlgoal="'+esc(r.id)+'" data-dlgoallab="'+esc(dlGoalLabel(r))+'"> '
            + '<span>'+esc(dlGoalLabel(r))
            /* ⚠ --ink-soft, NOT --ink-faint. The three checks above set their
               tag in --ink-faint and copying that made this an ELEVENTH
               contrast violation on a panel that already had ten. 3.08:1
               against 7.7:1 for the same job. */
            + ' <span style="color:var(--ink-soft,#46506E);font-weight:600;font-size:.9em;">· '+esc(DTx("IEP goal","Meta del IEP"))+'</span></span></label>';
        }).join("");
        return '<div class="dl-goalwrap">'
          + '<div class="dl-formlbl" style="margin-top:12px;">'+esc(DTx("This student\u2019s IEP goals (optional)","Metas del IEP de este estudiante (opcional)"))+'</div>'
          + '<div class="dl-help" style="font-size:12px;color:var(--ink-soft,#5b6675);margin:-2px 0 8px;">'
          +   esc(DTx("Tick one if this period was a chance to work on it. This is context for the team, not a measurement \u2014 nothing here reaches the goal\u2019s chart.",
                      "Marca una si este periodo fue una oportunidad de trabajarla. Es contexto para el equipo, no una medici\u00f3n \u2014 nada de esto llega a la gr\u00e1fica de la meta."))+'</div>'
          + '<div class="dl-checks">'+rows+'</div></div>';
      }
      /* Kept as a name because several readers already call it, and one of
         them calls it with NO argument. It answers with the DOMAINS now, not
         with three sentences - the sentences moved into AOG_OBS where both
         screens read them. */
      function checkDefs(band){
        var es=(DTx("en","es")==="es");
        var D=(window.AOG_OBS?AOG_OBS.domains():[]);
        return D.map(function(d){
          return { key:d.key, q:(es?d.es:d.en), short:(es?d.s_es:d.s_en),
                   dom:(es?d.es:d.en), fw:(es?d.fw_es:d.fw_en) };
        });
      }
      /* The grouped ticks a teacher actually reads. `data-dlobs` carries the
         item key; `data-dlflag` carries a note-to-the-team key that nothing
         scores. Both are read straight off the DOM at save time, so adding a
         line to AOG_OBS needs no change here. */
      /* ⚠ WHO SAW THIS. The adult check-in REFUSES to save without a name -
         "a support timeline is only readable if it says who saw what" - and
         then this list threw the name away, so a colleague's entry and the
         teacher's own rendered identically. `respondentId`, `respondentRole`
         and `source` were in the store the whole time and none of them reached
         a screen. Jimmy found it, 2026-08-29.

         ⚠ AN ENTRY WITH NO NAME IS THE TEACHER'S OWN and gets no line at all -
         labeling it "you" would be a claim about who was holding the device,
         which nothing in the record actually knows. */
      function dlWhoLine(p){
        var who=String((p&&p.respondentId)||"").trim();
        if(!who) return "";
        var role="";
        try{ if(p.respondentRole && typeof window.aogRoleLabel==="function") role=window.aogRoleLabel(p.respondentRole); }catch(e){}
        return '<div class="dl-logwho">'+esc(who)
          +(role?' <span class="dl-logrole">· '+esc(role)+'</span>':'')
          +(p.source==="link"?' <span class="dl-logvia">'+esc(DTx("via link","por enlace"))+'</span>':'')
          +'</div>';
      }
      function dlObsHtml(band){
        if(!window.AOG_OBS) return "";
        var es=(DTx("en","es")==="es");
        return AOG_OBS.groups(band, es).map(function(g){
          var rows=g.items.map(function(it){
            var attr=it.flag?'data-dlflag="'+esc(it.k)+'"':'data-dlobs="'+esc(it.k)+'"';
            return '<label class="dl-chk'+(it.flag?' dl-flagchk':'')+'" title="'+esc(it.fw||"")+'">'
              + '<input type="checkbox" '+attr+'> <span>'+esc(it.q)
              + (it.domLabel?' <span style="color:var(--ink-soft,#46506E);font-weight:600;font-size:.9em;">· '+esc(it.domLabel)+'</span>':'')
              + (it.dom?pbisChip(it.dom):'')+'</span></label>';
          }).join("");
          return '<div class="dl-obsgroup">'
            + '<div class="dl-obshead">'+esc(g.title)+'</div>'
            + (g.sub?'<div class="dl-help" style="font-size:12px;color:var(--ink-soft,#5b6675);margin:-2px 0 6px;">'+esc(g.sub)+'</div>':'')
            + '<div class="dl-checks">'+rows+'</div></div>';
        }).join("");
      }

      /* ---- roster from screener records; mark anyone who already has daily logs ---- */
      function rosterStudents(){
        var ids={};
        try{ var recs=(typeof getAllRecords==="function"?getAllRecords():[])||[]; recs.forEach(function(r){ if(r&&r.studentId){ var id=String(r.studentId).trim(); if(id) ids[id]=1; } }); }catch(e){}
        return Object.keys(ids);
      }
      function idsWithLogs(){
        var out={}; var store=load(); var logs=store.logs||{};
        Object.keys(logs).forEach(function(id){ if(/^(Coach|Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Parent ·|Parent -)\s/i.test(id)) return; var days=logs[id]||{}; if(Object.keys(days).some(function(d){return hasEntry(days[d]);})) out[id]=1; });
        return out;
      }

      window.aogRenderDaily=function(){
        var host=el("aogDailyBody"); if(!host) return;
        if(!ST.date) ST.date=todayISO();
        if(!ST.period) ST.period="Morning";
        var roster=rosterStudents(); var marks=idsWithLogs();
        Object.keys(marks).forEach(function(id){ if(roster.indexOf(id)<0) roster.push(id); });
        /* .30fg — adults who checked in (team check-in, home) are not students to log a period for */
        roster=roster.filter(function(id){ return !/^(Coach|Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Parent ·|Parent -)\s/i.test(id); });
        roster.sort();
        if(ST.s && roster.indexOf(ST.s)<0) ST.s="";
        var stuOpts='<option value="">'+DTx("Select student…","Selecciona estudiante…")+'</option>'
          + roster.map(function(id){ return '<option value="'+esc(id)+'"'+(id===ST.s?' selected':'')+'>'+(marks[id]?'• ':'')+esc(id)+'</option>'; }).join("");
        var controls=''
          + '<div class="dl-controls">'
          + '<div class="dl-field"><label for="dlStudent">'+DTx("Student","Estudiante")+'</label><select id="dlStudent" onchange="dlLoadStudent()">'+stuOpts+'</select></div>'
          + '<div class="dl-field"><label for="dlDate">'+DTx("Date","Fecha")+'</label><input type="date" id="dlDate" value="'+esc(ST.date)+'" onchange="dlLoadStudent()"></div>'
          + '<div class="dl-field"><label>&nbsp;</label><button type="button" class="dl-setbtn" onclick="dlLoadToday()">'+DTx("Today","Hoy")+'</button></div>'
          + '</div>';
        if(!ST.s){
          host.innerHTML=controls+'<div class="dl-empty">'+DTx("Pick a student to add a note. The list shows anyone with a reflection or note on this computer; there’s no class list behind it. A • marks students who already have notes.","Elige un estudiante para agregar una nota. La lista muestra a quien tenga una reflexión o nota en esta computadora; no hay lista de clase detrás. Un • marca a los estudiantes que ya tienen notas.")+'</div>';
          return;
        }
        var pOpts=periodOpts().map(function(o){ return '<option value="'+esc(o.v)+'"'+(o.v===ST.period?' selected':'')+'>'+esc(DTx(o.en,o.es))+'</option>'; }).join("");
        var dlband=dlBand(ST.s);
        var checks=dlObsHtml(dlband);
        var formCard=''
          + '<div class="dl-card">'
          +   '<div class="dl-formlbl">'+DTx("Logging which period right now?","¿Qué periodo estás registrando ahora?")+'</div>'
          +   '<select id="dlPeriod" class="dl-periodsel" aria-label="'+esc(DTx("Logging which period right now?","¿Qué periodo estás registrando ahora?"))+'" onchange="dlPeriodChange(this.value)">'+pOpts+'</select>'
          +   (ST.period==="__other__"?'<input id="dlPeriodOther" class="dl-otherin" placeholder="'+DTx("Name this period","Nombra este periodo")+'" value="'+esc(ST.other||"")+'" oninput="dlOtherInput(this.value)">':'')
          +   '<div class="dl-formlbl">'+DTx("What did you notice?","¿Qué notaste?")+' <span style="display:inline-block;margin-left:6px;font-size:10.5px;font-weight:700;letter-spacing:.04em;color:var(--gold-deep,#9a6f24);background:rgba(217,163,59,.16);border-radius:999px;padding:2px 9px;vertical-align:middle;text-transform:none;">'+esc(DL_BAND_LABEL[dlband]||"")+'</span></div>'
          +   '<div class="dl-help" style="font-size:12px;color:var(--ink-soft,#5b6675);margin:-2px 0 8px;">'+DTx("Tick anything that stood out this period. You do not have to answer every group, and a blank is not a judgement — it only means it did not come up. Hover a line to see where it is filed.","Marca lo que te haya llamado la atención en este periodo. No tienes que responder cada grupo, y dejarlo en blanco no es un juicio — solo significa que no surgió. Pasa el cursor sobre una línea para ver dónde se archiva.")+'</div>'
          +   checks
          +   '<label class="dl-pbis-tgl" style="display:flex;align-items:center;gap:7px;font-size:11.5px;color:var(--ink-soft,#5b6675);margin:6px 0 2px;cursor:pointer;"><input type="checkbox"'+(pbisOn()?' checked':'')+' onchange="aogDailyPbisToggle(this.checked)"> <span>'+DTx("Show school expectations (Ready · Respectful · Responsible · Safe)","Mostrar expectativas escolares (Listo · Respetuoso · Responsable · Seguro)")+'</span></label>'
          +   dlGoalsHtml(ST.s)
          +   '<div class="dl-formlbl">'+DTx("Quick note for this period (optional)","Nota rápida de este periodo (opcional)")+'</div>'
          +   '<textarea id="dlPeriodNote" class="dl-notein" rows="2" placeholder="'+DTx("Anything worth remembering…","Algo que valga la pena recordar…")+'"></textarea>'
          +   '<div class="dl-savewrap"><button type="button" class="dl-btn" onclick="dlSavePeriod()">'+DTx("Save this period’s log","Guardar el registro de este periodo")+'</button><span id="dlStatus" class="dl-status"></span></div>'
          + '</div>';
        var histCard='<div class="dl-card"><div class="dl-h">'+DTx("Logged periods for this student","Periodos registrados de este estudiante")+' <span class="small" style="font-weight:400;color:var(--ink-faint);">· '+esc(shortD(ST.date))+'</span></div><div id="dlHistory" class="dl-loglist"></div></div>';
        var store=load();
        var actions='<div class="dl-actions"><button type="button" class="dl-btn" onclick="aogDailyExport()">'+DTx("Export CSV (opens in Sheets)","Exportar CSV (abre en Sheets)")+'</button>'
          + '<button type="button" class="dl-btn ghost" onclick="aogDailyClearDay()">'+DTx("Clear this day","Borrar este día")+'</button></div>'
          + '<div class="dl-note">'+DTx("Private to this device. These per-period logs feed the Daily-log zoom in Trajectory.","Privado en este dispositivo. Estos registros por periodo alimentan el acercamiento diario en Trayectoria.")+'</div>';
        host.innerHTML=controls+formCard+histCard+aogDailyTrend(store)+aogDailyHistory(store)+actions;
        renderHistory(ST.s,ST.date);
      };

      function utcIso(ms){ var d=new Date(ms); var m=d.getUTCMonth()+1,da=d.getUTCDate(); return d.getUTCFullYear()+"-"+(m<10?"0"+m:m)+"-"+(da<10?"0"+da:da); }
      function weekStartISO(iso){ var t=Date.parse(iso+"T00:00:00Z"); if(isNaN(t)) return iso; var dow=(new Date(t).getUTCDay()+6)%7; return utcIso(t-dow*86400000); }
      var EPOCH_MON=Date.parse("1970-01-05T00:00:00Z");
      function bucketFor(iso,gran){
        if(gran==="month"){ var p=iso.split("-"); return {k:p[0]+"-"+p[1],lab:p[1]+"/'"+p[0].slice(2)}; }
        var dayCfg={day:1,days3:3};
        if(dayCfg[gran]){ var span=dayCfg[gran]; if(span===1) return {k:iso,lab:shortD(iso)}; var idx=Math.floor(Date.parse(iso+"T00:00:00Z")/86400000); var start=idx-(((idx%span)+span)%span); var k=utcIso(start*86400000); return {k:k,lab:span+"d "+shortD(k)}; }
        var wkCfg={week:1,week2:2,week3:3}; var M=wkCfg[gran]||1; var ws=weekStartISO(iso); var wi=Math.round((Date.parse(ws+"T00:00:00Z")-EPOCH_MON)/(7*86400000)); var base=wi-(((wi%M)+M)%M); var k2=utcIso(EPOCH_MON+base*7*86400000); return {k:k2,lab:(M===1?("wk "+shortD(k2)):(M+"wk "+shortD(k2)))};
      }
      var GRAN_MAX={day:14,days3:14,week:12,week2:12,week3:12,month:12};
      function unitName(gran){ return ({day:DTx("day","día"),days3:DTx("3-day period","periodo de 3 días"),week:DTx("week","semana"),week2:DTx("2-week period","periodo de 2 semanas"),week3:DTx("3-week period","periodo de 3 semanas"),month:DTx("month","mes")})[gran]||DTx("week","semana"); }
      function granList(){ return [["day",DTx("Day","Día")],["days3",DTx("3 days","3 días")],["week",DTx("Week","Semana")],["week2",DTx("2 weeks","2 semanas")],["week3",DTx("3 weeks","3 semanas")],["month",DTx("Month","Mes")]]; }
      window.aogDailyTrendSVG=function(student,gran,store,view){
        store=store||load(); gran=gran||"week";
        var logs=(store.logs&&store.logs[student])||{};
        var dates=Object.keys(logs).sort().filter(function(d){return hasEntry(logs[d]);});
        if(!dates.length) return {has:false,svg:"",cap:""};
        var buckets={},order=[];
        dates.forEach(function(d){ var b=bucketFor(d,gran); if(!buckets[b.k]){buckets[b.k]={sum:0,n:0,lab:b.lab};order.push(b.k);} buckets[b.k].sum+=dayPct(logs[d]); buckets[b.k].n++; });
        order.sort();
        var keys=order.slice(-(GRAN_MAX[gran]||12));
        var pts=keys.map(function(k){ return {k:k,lab:buckets[k].lab,v:Math.round(buckets[k].sum/buckets[k].n)}; });
        var W=900,H=240,ml=34,mr=16,mt=14,mb=38,n=pts.length;
        var X=function(i){ return ml+(W-ml-mr)*(n<=1?0.5:i/(n-1)); };
        var Y=function(v){ return mt+(H-mt-mb)*(1-Math.max(0,Math.min(100,v))/100); };
        var s2="";
        [[60,100,"var(--green-bg,#E8F0E7)"],[40,60,"var(--amber-bg,#F5EAC8)"],[0,40,"var(--red-bg,#F3DFDC)"]].forEach(function(b){ s2+='<rect x="'+ml+'" y="'+Y(b[1])+'" width="'+(W-ml-mr)+'" height="'+(Y(b[0])-Y(b[1]))+'" fill="'+b[2]+'" opacity="0.6"/>'; });
        [0,25,50,75,100].forEach(function(t){ s2+='<line x1="'+ml+'" y1="'+Y(t)+'" x2="'+(W-mr)+'" y2="'+Y(t)+'" stroke="var(--rule)" stroke-width="1"/><text x="'+(ml-5)+'" y="'+(Y(t)+3)+'" text-anchor="end" font-size="10" fill="var(--ink-faint)">'+t+'</text>'; });
        pts.forEach(function(p,i){ s2+='<text x="'+X(i)+'" y="'+(H-mb+16)+'" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--ink-soft)">'+esc(p.lab)+'</text>'; });
        if(view==="bars"){
          var bw=Math.max(6,Math.min(46,(W-ml-mr)/Math.max(1,n)*0.6));
          pts.forEach(function(p,i){ var x=X(i),y=Y(p.v),y0=Y(0); s2+='<rect x="'+(x-bw/2).toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(0,y0-y).toFixed(1)+'" rx="3" fill="'+color(p.v)+'" opacity="0.85"/><text x="'+x.toFixed(1)+'" y="'+(y-6)+'" text-anchor="middle" font-size="10.5" font-weight="800" fill="'+color(p.v)+'">'+p.v+'</text>'; });
        } else {
          if(pts.length>1){ var dp=""; pts.forEach(function(p,i){ dp+=(i?"L":"M")+X(i).toFixed(1)+" "+Y(p.v).toFixed(1)+" "; }); s2+='<path d="'+dp+'" fill="none" stroke="var(--ink,#0A1E33)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'; }
          pts.forEach(function(p,i){ s2+='<circle cx="'+X(i).toFixed(1)+'" cy="'+Y(p.v).toFixed(1)+'" r="4.5" fill="var(--paper,#fff)" stroke="'+color(p.v)+'" stroke-width="2.6"/><text x="'+X(i).toFixed(1)+'" y="'+(Y(p.v)-10)+'" text-anchor="middle" font-size="10.5" font-weight="800" fill="'+color(p.v)+'">'+p.v+'</text>'; });
        }
        var svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Daily-log trend" style="width:100%;min-width:480px;display:block;">'+s2+'</svg>';
        var unit=unitName(gran), first=pts[0].v, last=pts[pts.length-1].v, delta=last-first;
        var cap=(pts.length>1)?(DTx("Change since first","Cambio desde el primero")+' '+unit+': '+(delta>0?"+":"")+delta+' '+DTx("points","puntos")):(DTx("One","Un")+' '+unit+' '+DTx("so far — more will draw the line.","hasta ahora — con más se traza la línea."));
        return {has:true,svg:svg,cap:cap,points:pts.length};
      };
      window.aogDailyGran=function(g){ ST.gran=g; aogRenderDaily(); };
      window.aogDailyTrend=function(store){
        var gran=ST.gran||"week";
        var r=aogDailyTrendSVG(ST.s,gran,store);
        if(!r.has) return "";
        var gbtn=function(g,lab){ return '<button type="button" class="dl-setbtn'+(gran===g?" on":"")+'" style="'+(gran===g?"background:var(--navy);color:#fff;border-color:var(--navy);":"")+'" onclick="aogDailyGran(\''+g+'\')">'+lab+'</button>'; };
        var toggle='<div class="dl-sets" style="margin:2px 0 12px;">'+granList().map(function(x){return gbtn(x[0],x[1]);}).join("")+'</div>';
        var grainNote=(gran==="day")?DTx("Each point is one day’s total.","Cada punto es el total de un día."):(DTx("Each point rolls one ","Cada punto resume un ")+unitName(gran)+DTx(" of daily logs into an average — the daily grain becoming a growth line."," de registros diarios en un promedio — el detalle diario convertido en una línea de crecimiento."));
        return '<div class="dl-card"><div class="dl-h">'+DTx("Growth trend","Tendencia de crecimiento")+'</div>'+toggle+'<div class="dl-note" style="margin:-4px 0 10px;">'+grainNote+'</div><div class="dl-gridwrap" style="padding:10px 8px;">'+r.svg+'</div><div class="dl-note">'+esc(r.cap)+'</div></div>';
      };

      window.aogDailyHistory=function(store){
        var s=ST.s; var logs=(store.logs&&store.logs[s])||{};
        var dates=Object.keys(logs).sort().filter(function(d){return hasEntry(logs[d]);});
        if(!dates.length) return "";
        var recent=dates.slice(-10);
        var days=recent.map(function(d){ var p=dayPct(logs[d]); return '<div class="dl-day"><div class="d">'+esc(shortD(d))+'</div><div class="p" style="color:'+color(p)+'">'+p+'%</div></div>'; }).join("");
        // weekly rollup: last 7 logged days, by domain
        var last7=dates.slice(-7);
        var defs=checkDefs(); var agg={}; defs.forEach(function(d){ agg[d.key]={t:0,g:0,short:d.short}; });
        /* ⚠ A DOMAIN IS ONLY COUNTED AGAINST A PERIOD THAT COULD HAVE CARRIED
           IT. Engagement did not exist before .29al; counting older periods as
           misses would invent a slump that never happened. A row with no
           periods behind it is not drawn at all rather than drawn at 0%. */
        last7.forEach(function(d){ ((logs[d]&&logs[d].periods)||[]).forEach(function(p){ defs.forEach(function(def){
          if(def.key==="engaged" && !Object.prototype.hasOwnProperty.call(p,"engaged")) return;
          agg[def.key].t++; if(p[def.key])agg[def.key].g++; }); }); });
        var rows=defs.filter(function(def){ return agg[def.key].t>0; }).map(function(def){ var a=agg[def.key]; var pct=a.t?Math.round(a.g/a.t*100):0; return '<div class="dl-srow"><div class="dl-sname">'+esc(a.short)+'</div><div class="dl-strack"><div class="dl-sfill" style="width:'+pct+'%;background:'+color(pct)+'"></div></div><div class="dl-pct" style="color:'+color(pct)+';min-width:42px;text-align:right;">'+pct+'%</div></div>'; }).join("");
        return '<div class="dl-card"><div class="dl-h">'+DTx("Recent days","Días recientes")+'</div><div class="dl-hist">'+days+'</div></div>'
          + '<div class="dl-card"><div class="dl-h">'+DTx("This week, by check (last 7 logged days)","Esta semana, por verificación (últimos 7 días)")+'</div>'+rows+'</div>';
      };

      function renderHistory(sid,dateStr){
        var c=el("dlHistory"); if(!c) return;
        var store=load(); var day=(store.logs&&store.logs[sid]&&store.logs[sid][dateStr])||{periods:[]};
        var periods=day.periods||[];
        if(!periods.length){ c.innerHTML='<div class="dl-mini" style="padding:6px 0;color:var(--ink-soft);">'+DTx("No periods logged yet for this date.","Aún no hay periodos registrados para esta fecha.")+'</div>'; return; }
        var defs=checkDefs();
        c.innerHTML=periods.map(function(p,i){
          /* Name what was seen. "2 of 4" tells the next adult nothing; WHICH
             two is the entire point. Entries written before .29al carry no
             item list, so they still read as their domain names. */
          var tags=[];
          if(p.obs&&p.obs.length&&window.AOG_OBS){
            var esl=(DTx("en","es")==="es");
            p.obs.forEach(function(k){ var s=AOG_OBS.shortOf(k,esl); if(s) tags.push(esc(s)); });
          } else { defs.forEach(function(d){ if(p[d.key]) tags.push(esc(d.short)); }); }
          if(!tags.length && p.checks){ for(var k=0;k<p.checks.length;k++){ if(p.checks[k]) tags.push(DTx("Check","Marca")+" "+(k+1)); } }
          var pct=periodPct(p);
          var t=p.timestamp?new Date(p.timestamp):null;
          var tl=(t&&!isNaN(t.getTime()))?(("0"+t.getHours()).slice(-2)+":"+("0"+t.getMinutes()).slice(-2)):"";
          return '<div class="dl-logitem"><div class="dl-logmain">'
            + '<div class="dl-logper">'+esc(periodLabel(p.period)||p.period||DTx("Period","Periodo"))+' <span class="dl-pct" style="color:'+color(pct)+';font-weight:800;">'+smiley(pct)+' '+pct+'%</span>'+(tl?' <span class="dl-mini" style="color:var(--ink-faint);font-weight:400;">· '+tl+'</span>':'')+'</div>'
            + dlWhoLine(p)
            + '<div class="dl-logchk">'+(tags.length?tags.join(" · "):DTx("No checks marked","Sin marcas"))+'</div>'
            + ((p.goals&&p.goals.length)?('<div class="dl-loggoals" style="font-size:12px;color:var(--ink-soft,#5b6675);margin-top:2px;">'
                + esc(DTx("IEP goal","Meta del IEP")+": "+p.goals.map(function(x){ return x&&x.lab?x.lab:""; }).filter(Boolean).join(" · "))+'</div>'):'')
            + (p.note?'<div class="dl-lognote">“'+esc(p.note)+'”</div>':'')
            + '</div><button type="button" class="dl-logdel" title="'+DTx("Remove","Quitar")+'" onclick="dlRemoveEntry('+i+')">×</button></div>';
        }).join("");
      }

      window.dlLoadStudent=function(){ var ss=el("dlStudent"),di=el("dlDate"); if(ss) ST.s=ss.value; if(di&&di.value) ST.date=di.value; aogRenderDaily(); };
      window.dlLoadToday=function(){ ST.date=todayISO(); var di=el("dlDate"); if(di) di.value=ST.date; aogRenderDaily(); };
      window.dlPeriodChange=function(v){ ST.period=v||"Morning"; if(v!=="__other__") ST.other=""; aogRenderDaily(); };
      window.dlOtherInput=function(v){ ST.other=v||""; };
      window.dlSavePeriod=function(){
        var ss=el("dlStudent"),di=el("dlDate"),status=el("dlStatus");
        var sid=ss?ss.value:ST.s, dateStr=di?di.value:ST.date;
        if(!sid||!dateStr){ if(status) status.textContent=DTx("Pick a student and date first.","Elige primero estudiante y fecha."); return; }
        var period=(ST.period==="__other__")?(((el("dlPeriodOther")&&el("dlPeriodOther").value)||"").trim()||DTx("Other","Otro")):ST.period;
        /* The ticked item keys ARE the record; the four domain booleans
           are DERIVED from them, so the columns every chart already counts
           stay exactly what they were and a reader that knows nothing about
           items still reads this entry correctly. `obs` says WHICH sentence
           was ticked, which is the whole point when the question is what
           shows up in one room and not in another.

           ⚠ `obsPicked`, not `picked` - the IEP-goal block below declares a
           `picked` of its own inside a try, and var is function-scoped. */
        var obsPicked=[];
        try{ Array.prototype.forEach.call(document.querySelectorAll("[data-dlobs]"),function(cb){ if(cb.checked) obsPicked.push(cb.getAttribute("data-dlobs")); }); }catch(e){}
        var obsFlags=[];
        try{ Array.prototype.forEach.call(document.querySelectorAll("[data-dlflag]"),function(cb){ if(cb.checked) obsFlags.push(cb.getAttribute("data-dlflag")); }); }catch(e){}
        var dom=(window.AOG_OBS?AOG_OBS.domainsFrom(obsPicked):{engaged:false,regulated:false,usedStrategy:false,connected:false});
        var entry={ period:period,
          engaged:!!dom.engaged,
          regulated:!!dom.regulated,
          usedStrategy:!!dom.usedStrategy,
          connected:!!dom.connected,
          obs:obsPicked,
          /* ⚠ NOT A MEASUREMENT AND NEVER SCORED. Nothing that computes a
             percentage, draws a trend or reaches a goal looks at `flags`. */
          flags:obsFlags,
          obsSchema:"v2",
          note:(((el("dlPeriodNote")&&el("dlPeriodNote").value)||"").trim()),
          term:(function(){ try{ return sessionStorage.getItem("aog.launch.term")||""; }catch(e){ return ""; } })(),
          year:(window.AOGYear?AOGYear(dateStr):""),
          timestamp:new Date().toISOString() };
        /* ⚠ ITS OWN FIELD, READ BY NOTHING THAT SCORES. The label is stored
           beside the id so the history still reads after a goal is archived
           or reworded — it records what the teacher was actually shown. */
        try{
          var picked=[];
          Array.prototype.forEach.call(document.querySelectorAll("[data-dlgoal]"),function(cb){
            if(cb.checked) picked.push({ id:cb.getAttribute("data-dlgoal"), lab:cb.getAttribute("data-dlgoallab")||"" });
          });
          if(picked.length) entry.goals=picked;
        }catch(e){}
        var store=load(); if(!store.logs) store.logs={}; if(!store.logs[sid]) store.logs[sid]={}; if(!store.logs[sid][dateStr]) store.logs[sid][dateStr]={periods:[]}; if(!store.logs[sid][dateStr].periods) store.logs[sid][dateStr].periods=[];
        store.logs[sid][dateStr].periods.push(entry); save(store);
        ST.s=sid; ST.date=dateStr; if(ST.period==="__other__") ST.other="";
        aogRenderDaily();
        var s2=el("dlStatus"); if(s2){ s2.textContent=DTx("Saved ✓","Guardado ✓"); setTimeout(function(){ var s3=el("dlStatus"); if(s3) s3.textContent=""; },1600); }
      };
      window.dlRemoveEntry=function(i){
        var store=load(); var day=store.logs&&store.logs[ST.s]&&store.logs[ST.s][ST.date]; if(!day||!day.periods) return;
        day.periods.splice(i,1); if(!day.periods.length){ try{delete store.logs[ST.s][ST.date];}catch(e){} }
        save(store); aogRenderDaily();
      };
      window.aogDailyClearDay=function(){
        if(!window.confirm(DTx("Remove all logged periods for this day?","¿Quitar todos los periodos registrados de este día?"))) return;
        var store=load(); if(store.logs&&store.logs[ST.s]){ try{delete store.logs[ST.s][ST.date];}catch(e){} save(store); }
        aogRenderDaily();
      };

      window.aogDailyExport=function(){
        var store=load(); var s=ST.s; var logs=(store.logs&&store.logs[s])||{};
        var dates=Object.keys(logs).sort().filter(function(d){return hasEntry(logs[d]);});
        var rows=[["Student","Date","Period","Time","Engaged","Regulated","Used strategy","Trusted-adult connection","What was noticed","Worth passing on","IEP goals worked on","Note","Period %"]];
        var csvEs=(DTx("en","es")==="es");
        function csvShorts(list){ return (list||[]).map(function(k){ return window.AOG_OBS?(AOG_OBS.shortOf(k,csvEs)||k):k; }).filter(Boolean).join(" | "); }
        dates.forEach(function(d){ ((logs[d]&&logs[d].periods)||[]).forEach(function(p){ var t=p.timestamp?new Date(p.timestamp):null; var tl=(t&&!isNaN(t.getTime()))?(("0"+t.getHours()).slice(-2)+":"+("0"+t.getMinutes()).slice(-2)):""; rows.push([s,d,p.period||"",tl,(Object.prototype.hasOwnProperty.call(p,"engaged")?(p.engaged?"Yes":"No"):""),p.regulated?"Yes":"No",p.usedStrategy?"Yes":"No",p.connected?"Yes":"No",csvShorts(p.obs),csvShorts(p.flags),((p.goals||[]).map(function(x){ return x&&x.lab?x.lab:""; }).filter(Boolean).join(" | ")),p.note||"",periodPct(p)+"%"]); }); });
        var csv=rows.map(function(r){ return r.map(function(c){ var v=String(c==null?"":c); return /[",\n]/.test(v)?('"'+v.replace(/"/g,'""')+'"'):v; }).join(","); }).join("\r\n");
        try{
          var a=document.createElement("a");
          a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
          a.download="AoG-DailyLog-"+(s||"student").replace(/[^A-Za-z0-9_-]+/g,"_")+".csv";
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
        }catch(e){}
      };
    })();
    