
    /* AOG-AUDIENCE-V3 (2026-10-03) — the handoff "front-door facelift": the role filter now filters, and the Lab Bench is on
       every path. Teacher sees six doors (The Courses added at Jimmy's word), Family four, Student four; "More doors" shows the rest, never hides the house.
       Show everything lays the whole table out in three labelled groups. The choice is kept for this visit (sessionStorage).
       Replaces AOG-AUDIENCE-V1, which only reordered the doors (V2 removed the gold links under the switch). */
    (function(){
      /* AOG-AUDIENCE-START-V1 (Jimmy, 2026-10-10: "I don't like how the main page starts on show everything … it overwhelms
         me. I believe it should start on STUDENT. Student should not have the check-in link and the teacher should have the
         dashboard, the two curriculums plus daily drafts … The parent should have the most"). The page opens on Student
         (the Studio, the Lab Bench, Quiet Space);
         Show everything is still one tap away. Teacher leads with the Dashboard, then the two curricula (The Courses and
         SEL), then Daily Drafts. Parent holds the most doors. */
      var SETS = {
        teacher: ["dashboard","courses","sel","drafts","today","studio","bench","crosswalk"],
        family:  ["today","drafts","talk","checkin","families","sel","courses","studio","bench","faith","quiet","privacy"],
        student: ["studio","bench","cube","quiet"]   /* Jimmy, 2026-10-10: Daily Drafts off Student ("I don't think they would want to do that for enjoyment"); the Cube on Student ("I want it on the student page") */
      };
      var GROUPS = [
        ["This week","Esta semana",["today","drafts","studio","bench","cube","checkin","talk"]],
        ["The house","La casa",["courses","sel","faith","families"]],
        ["For the building","Para la escuela",["dashboard","crosswalk","pd","privacy","contact"]]
      ];
      var KEY = "aog.home.audience", cur = "all", more = false, base = null;
      function es(){ return (document.documentElement.lang||"").slice(0,2)==="es"; }
      function apply(k){
        var grid = document.getElementById("aogdnGrid"), panel = document.getElementById("aogdnPanel"); if(!grid) return;
        if(!SETS[k]) k = "all"; cur = k;
        if(typeof aogDoorClose === "function" && grid.querySelector('.aogdn-door[aria-expanded="true"]')) aogDoorClose();
        if(!base) base = [].map.call(grid.querySelectorAll(":scope > .aogdn-door"), function(d){ return d.getAttribute("data-door"); });
        [].forEach.call(grid.querySelectorAll(":scope > .aogdn-grp"), function(g){ g.remove(); });
        var D = function(n){ return grid.querySelector(':scope > .aogdn-door[data-door="'+n+'"]'); }, placed = {};
        base.forEach(function(n){ var d = D(n); if(d){ d.classList.remove("aogau-pick","aogau-lead"); } });
        if(k === "all"){
          GROUPS.forEach(function(g){
            var h = document.createElement("h2"); h.className = "aogdn-grp"; h.setAttribute("data-en", g[0]); h.setAttribute("data-es", g[1]); h.textContent = es() ? g[1] : g[0]; grid.appendChild(h);
            g[2].forEach(function(n){ var d = D(n); if(d){ d.hidden = false; grid.appendChild(d); placed[n] = 1; } });
          });
          /* Quiet Space has its own button in the top bar on every page, so the full table leaves it out */
          base.forEach(function(n){ if(!placed[n]){ var d = D(n); if(d){ d.hidden = (n === "quiet"); grid.appendChild(d); } } });
        } else {
          SETS[k].forEach(function(n, i){ var d = D(n); if(d){ d.hidden = false; grid.appendChild(d); d.classList.add("aogau-pick"); if(i === 0) d.classList.add("aogau-lead"); placed[n] = 1; } });
          base.forEach(function(n){ if(!placed[n]){ var d = D(n); if(d){ d.hidden = !more; grid.appendChild(d); } } });
        }
        /* five doors under Today would leave one alone on a computer's row of four; they go three across instead */
        var shown = [].filter.call(grid.querySelectorAll(":scope > .aogdn-door"), function(d){ return !d.hidden && d.getAttribute("data-door") !== "today"; }).length;
        grid.classList.toggle("aogau-three", k !== "all" && shown === 5);
        grid.classList.toggle("aogau-flat", k === "all" || more || shown > 7);   /* AOG-HOME-FLAT-V1: a long table lies flat, so its far rows stay on the screen */
        if(panel) grid.appendChild(panel);
        document.querySelectorAll("#aogAudRow button").forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-aud") === k ? "true" : "false"); });
        document.querySelectorAll("#aogAud .aogau-tip").forEach(function(t){ t.hidden = t.getAttribute("data-aud") !== k; });
        try{ heroPaint(k); }catch(e){}
        var mb = document.getElementById("aogMoreBtn");
        if(mb){ mb.parentNode.hidden = (k === "all"); mb.setAttribute("aria-expanded", more ? "true" : "false");
          mb.textContent = more ? (es() ? "Menos puertas" : "Fewer doors") : (es() ? "Más puertas" : "More doors"); }
      }
      /* AOG-HERO-AUDIENCE-V1 (Jimmy, 2026-10-10: "the words underneath the hero for the student page should be shortened.
         Realistically, each one should be catered to its specific audience. Students, parents / adults and teachers").
         The lines under the title change with the choice; Show everything keeps the full words. null hides a line. The
         privacy line always says the same promise: no accounts, nothing tracked. */
      var HERO = {
        student: { premise:["Make music. Explore. Take a calm break when you need one.","Haz música. Explora. Toma un descanso tranquilo cuando lo necesites."],
                   priv:["No sign-in. Nothing about you is tracked.","Sin iniciar sesión. No se rastrea nada sobre ti."], moves:null, ask:false },
        family:  { premise:["For parents, families and every grown-up.","Para padres, familias y todos los adultos."],
                   moves:["Words for feelings and making things right. Questions for the dinner table. Calm tools. SEL for adults too.","Palabras para los sentimientos y para reparar. Preguntas para la mesa. Herramientas de calma. SEL también para adultos."], ask:true },
        teacher: { moves:["Courses with pictures first. SEL lessons. Daily practice. A dashboard for your class.","Cursos con imágenes primero. Lecciones de SEL. Práctica diaria. Un panel para tu clase."], ask:true }
      };
      var HERO0 = null;
      function heroPaint(k){
        var els = { premise:document.querySelector(".ofh-premise"), priv:document.querySelector(".ofh-private"), moves:document.querySelector(".ofh-moves") },
            ask = document.querySelector(".aog-of-head .ofh-lede"), L = es() ? 1 : 0;
        if(!els.premise) return;
        if(!HERO0){ HERO0 = {}; Object.keys(els).forEach(function(n){ var e = els[n]; if(e) HERO0[n] = [e.getAttribute("data-en"), e.getAttribute("data-es")]; }); }
        var h = HERO[k] || {};
        Object.keys(els).forEach(function(n){ var e = els[n]; if(!e) return;
          var v = (n in h) ? h[n] : HERO0[n];
          if(!v){ e.style.display = "none"; return; }
          e.style.display = ""; e.setAttribute("data-en", v[0]); e.setAttribute("data-es", v[1]); if(e.textContent !== v[L]) e.textContent = v[L]; });
        if(ask) ask.style.display = (h.ask === false) ? "none" : "";
      }
      window.aogAudPick = function(k){ more = false; try{ sessionStorage.setItem(KEY, k); }catch(e){} apply(k); };
      window.aogAudMore = function(){ more = !more; apply(cur); };
      /* opening a door the filter has put away first brings the rest of the table back */
      window.aogAudDoor = function(name){ var d = document.querySelector('#aogdnGrid .aogdn-door[data-door="'+name+'"]'); if(!d) return;
        if(d.hidden){ more = true; apply(cur); }
        if(d.getAttribute("aria-expanded") !== "true") d.click(); try{ d.scrollIntoView({block:"start", behavior:"instant"}); }catch(e){} };
      var k = "student"; try{ k = sessionStorage.getItem(KEY) || "student"; }catch(e){}
      apply(k);
      /* the group labels and the More button follow the language switch */
      try{ new MutationObserver(function(){ apply(cur); }).observe(document.documentElement, { attributes:true, attributeFilter:["lang"] }); }catch(e){}
      /* AOG-DD-ROOM-RETURN-V1 (2026-10-02) — Jimmy: "once you press Send it should take you back to the home page
         with the drafts laid out." /drops sends the student to /?room=drafts; the room opens on arrival. */
      /* AOG-HOME-APPS-V1 (2026-10-10): any door opens the same way, so a Home Screen icon can land on it (/?room=sel, /?room=courses) */
      try{ var rm=/[?&]room=([a-z]+)(&|$)/.exec(location.search); if(rm && document.querySelector('#aogdnGrid .aogdn-door[data-door="'+rm[1]+'"]')){ setTimeout(function(){ if(typeof aogAudDoor==="function") aogAudDoor(rm[1]); }, 120); } }catch(e){}
    })();
    