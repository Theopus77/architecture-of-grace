
    (function(){
      var ROLES={student:1,parent:1,teacher:1,specialist:1,leadership:1};
      function dEs(){ try{ if(typeof dashLang!=="undefined") return dashLang==="es"; return (typeof lang!=="undefined" && lang==="es"); }catch(e){ return false; } }
      function L(en,es){ return dEs()?es:en; }
      function banner(role){
        if(role==='leadership') return L("Leadership view — building & district trends only, never individual scores.","Vista de liderazgo — tendencias de edificio y distrito, nunca puntajes individuales.")+
          ' <a href="/aog-district-admin-view-demo" class="drole-link">'+L("Open district rollup →","Abrir vista del distrito →")+'</a>';
        if(role==='specialist') return L("Specialist & support-staff view — for paraprofessionals and teacher aides, in-house OTs, PTs, SLPs (speech), social workers, counselors, and psychologists, and outside/community providers too. Individual progress and goals, plus the Practitioner Edition (sessions, PHQ-9/GAD-7 screeners, safety flags).","Vista de especialistas y personal de apoyo — para paraprofesionales y auxiliares docentes, terapeutas ocupacionales, fisioterapeutas, fonoaudiólogos, trabajadores sociales, consejeros y psicólogos del centro, y también proveedores externos/comunitarios. Progreso y metas individuales, más la Edición para Profesionales (sesiones, tamizajes, señales de riesgo).");
        if(role==='parent') return L("Family view — your family’s check-ins, conversation starters, and repair moments, private to this device.","Vista de familia — los registros, iniciadores de conversación y momentos de reparación de tu familia, privados en este dispositivo.");
        if(role==='student') return L("Student view — your own journey: how you’re doing and what helps.","Vista de estudiante — tu propio camino: cómo estás y qué te ayuda.");
        return L("Teacher view — your class, up close: trends and one clear next step per student.","Vista del docente — tu clase de cerca: tendencias y un próximo paso claro por estudiante.")+
          ' <a href="#" class="drole-link" onclick="event.preventDefault(); if(typeof showScreen===\'function\')showScreen(\'screen-teacher-tools\');">'+L("Calm-down station tips →","Consejos del rincón de calma →")+'</a>';
      }
      var HIDE={ leadership:{home:1,daily:1,goals:1,distribute:1,family:1,iep:1}, specialist:{students:1,distribute:1,align:1}, teacher:{} };
      function paint(role){
        var scr=document.getElementById('screen-admin'); if(scr) scr.setAttribute('data-role',role);
        var segs=document.querySelectorAll('#dashRoles .drole');
        for(var i=0;i<segs.length;i++){ segs[i].classList.toggle('active', segs[i].getAttribute('data-role')===role); }
        var b=document.getElementById('dashRoleBanner'); if(b) b.innerHTML=banner(role);
        try{ var td=document.getElementById('dashToday'); if(td && window.aogTodayCard) td.innerHTML=window.aogTodayCard(dEs()); }catch(_etd){}
        var ex=document.getElementById('dashRoleExtra');
        if(ex){
          if(role==='teacher' && typeof window.aogTeacherCalmCardHtml==='function') ex.innerHTML=(typeof window.aogReflectNudgeHtml==='function'?window.aogReflectNudgeHtml(dEs()):'')+window.aogTeacherCalmCardHtml(dEs());
          else if(role==='specialist'){ ex.innerHTML=(typeof window.aogOutsideProviderCard==='function'?window.aogOutsideProviderCard(dEs()):'')+'<div id="aogClinical"></div>'; if(typeof window.aogClinicalRender==='function') window.aogClinicalRender(); }
          else if(role==='parent'){ window.__aogFamilyTarget='dashFamilyRoot'; ex.innerHTML='<div id="dashFamilyRoot"></div>'; if(typeof renderFamily==='function') renderFamily(); }
          else if(role==='student'){ ex.innerHTML='<div id="dashStudentJourney"></div>'; if(typeof window.aogRenderStudentJourney==='function') window.aogRenderStudentJourney('dashStudentJourney'); }
          else if(role==='leadership'){ var _lcx=(typeof window.aogDisclosureLeadershipCard==='function')?window.aogDisclosureLeadershipCard(dEs()):''; _lcx+=(typeof window.aogGlossaryLeadershipCard==='function')?window.aogGlossaryLeadershipCard(dEs()):''; _lcx+=(typeof window.aogReflectionLeadershipCard==='function')?window.aogReflectionLeadershipCard(dEs()):''; ex.innerHTML=_lcx; }
          else ex.innerHTML='';
          try{ ex.classList.remove('aog-fade'); void ex.offsetWidth; ex.classList.add('aog-fade'); }catch(e){}
        }
        try{ if(typeof window.aogRenderCurriculumStrip==='function') window.aogRenderCurriculumStrip(); }catch(_ecs){}
      }
      window.__aogDashRepaint=function(){ var r=document.getElementById('screen-admin'); paint((r&&r.getAttribute('data-role'))||'teacher'); };
      window.aogSetDashRole=function(role){
        if(!ROLES[role]) role='teacher';
        try{ localStorage.setItem('aog.dash.role',role); }catch(e){}
        paint(role);
        /* Only jump to top when actually scrolled down — the jump read as a "shake" when near the top. */
        try{ if(window.scrollY>120){ window.scrollTo({top:0,behavior:'instant'}); } }catch(e){}
        var act=document.querySelector('#screen-admin .tab.active'); var name=act?act.getAttribute('data-tab'):'';
        /* Coalesce the follow-up tab repaint into the next frame so the switch paints once, not twice. */
        if(HIDE[role] && HIDE[role][name] && typeof aogQsTab==='function'){ requestAnimationFrame(function(){ aogQsTab('overview'); }); }
      };
      function init(){ var role='teacher'; try{ var r=localStorage.getItem('aog.dash.role'); if(r&&ROLES[r]) role=r; }catch(e){} paint(role); }
      if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded',init);
      document.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('#langEn,#langEs,#dashLangEn,#dashLangEs')){ setTimeout(init,30); } });
    })();
    