
    (function(){
      function byId(id){ return document.getElementById(id); }
      function closeMenus(){ ['aogDemoMenu','dashRoleCompactMenu'].forEach(function(id){ var m=byId(id); if(m) m.hidden=true; }); ['aogDemoBtn','dashRoleCompactBtn'].forEach(function(id){ var b=byId(id); if(b) b.setAttribute('aria-expanded','false'); }); }
      window.aogToggleDemoMenu=function(e){ e.stopPropagation(); var m=byId('aogDemoMenu'),b=byId('aogDemoBtn'); var open=m&&m.hidden; closeMenus(); if(m&&open){ m.hidden=false; if(b)b.setAttribute('aria-expanded','true'); } };
      window.aogToggleRoleMenu=function(e){ e.stopPropagation(); var m=byId('dashRoleCompactMenu'),b=byId('dashRoleCompactBtn'); var open=m&&m.hidden; closeMenus(); if(m&&open){ m.hidden=false; if(b)b.setAttribute('aria-expanded','true'); } };
      document.addEventListener('click',closeMenus);
      function demoDot(){ var on=false; try{ var v=localStorage.getItem('aogScreener.demoActive'); on=(v==='1'||v==='true'); }catch(e){} var d=byId('aogDemoDot'),t=byId('aogDemoBtnTx'); if(d) d.hidden=!on; var es=(document.documentElement.getAttribute('lang')||'en').slice(0,2)==='es'; if(t) t.textContent=on?(es?'Demo activo':'Demo on'):'Demo'; }
      var expanded=false;
      function applyCompact(){ var h=byId('dashHero'); if(!h) return; var seen=false; try{ seen=!!localStorage.getItem('aog.dash.seen'); }catch(e){} h.classList.toggle('dash-compact', seen && !expanded); h.classList.toggle('dash-seen', !!seen); var ex=byId('dashHeroExpand'); if(ex) ex.setAttribute('aria-expanded', expanded?'true':'false'); }
      window.aogDashHeroExpand=function(){ expanded=!expanded; applyCompact(); };
      function markSeen(){ try{ localStorage.setItem('aog.dash.seen','1'); }catch(e){} }
      var CORE={ teacher:['overview','distribute','students','inbox','practice','iep','goals'],
                 specialist:['overview','home','inbox','practice','iep','goals'],
                 leadership:['overview','students','growth','trajectory','align'],
                 parent:['overview','home','growth','family'],
                 student:['overview','home','growth'] };
      var HIDE2={ leadership:{home:1,daily:1,goals:1,distribute:1,family:1,iep:1}, specialist:{students:1,distribute:1,align:1}, teacher:{}, parent:{}, student:{} };
      /* ⚠⚠ .30hk — A TAB RETIREMENT IS TWO TABLES. 'daily' left MODES.student AND
   this role layer's CORE above, because CORE re-asserts its role tabs ~40ms
   after every mode switch and would have put the Daily Log back on screen.
   ORDER below only SORTS, so a retired name here is harmless — it is left in
   place so the panel keeps its position if the tab is ever restored. */
      var ORDER=['export','family','align','trajectory','iep','daily','goals','distribute','growth','practice','home','inbox','students','overview'];
      function layoutTabs(role){
        var row=document.querySelector('#screen-admin .tabs'); if(!row) return;
        var moreWrap=row.querySelector('.tab-more-wrap'), menu=byId('tabMoreMenu'); if(!moreWrap||!menu) return;
        var core=CORE[role]||CORE.teacher, hide=HIDE2[role]||{};
        var all={};
        document.querySelectorAll('#screen-admin .tabs .tab[data-tab], #tabMoreMenu .tab[data-tab]').forEach(function(b){ all[b.getAttribute('data-tab')]=b; });
        /* ORDER is reversed so insertBefore(moreWrap) / insertBefore(menu.firstChild) yields correct final order */
        ORDER.forEach(function(name){
          var b=all[name]; if(!b || name==='crosswalk') return;
          if(hide[name]){ b.style.display='none'; return; }
          b.style.display='';
          if(core.indexOf(name)>=0){ row.insertBefore(b, row.querySelector('.tab[data-tab]:not([style*="none"])')||moreWrap); if(b.parentNode!==row){} }
          else{ menu.insertBefore(b, menu.firstChild); }
        });
        /* second pass to fix core order precisely */
        core.slice().reverse().forEach(function(name){ var b=all[name]; if(b && !hide[name]) row.insertBefore(b, row.firstElementChild); });
        row.appendChild(moreWrap);
        var act=document.querySelector('#screen-admin .tabs .tab.active, #tabMoreMenu .tab.active');
        var moreBtn=byId('tabMoreBtn');
        if(moreBtn) moreBtn.classList.toggle('hasactive', !!(act && menu.contains(act)));
        var tx=byId('dashRoleCompactTx');
        if(tx){ var es=(document.documentElement.getAttribute('lang')||'en').slice(0,2)==='es';
          var names={student:['Student','Estudiante'],parent:['Parent','Familia'],teacher:['Teacher','Docente'],specialist:['Specialist','Especialista'],leadership:['Leadership','Direcci\u00f3n']};
          var n=names[role]||names.teacher; tx.textContent=(es?'Viendo como: ':'Viewing as: ')+(es?n[1]:n[0]); }
        var cm=byId('dashRoleCompactMenu'); if(cm){ cm.querySelectorAll('.drole').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-role')===role); }); }
      }
      function currentRole(){ var s=byId('screen-admin'); var r=s&&s.getAttribute('data-role'); if(r) return r; try{ r=localStorage.getItem('aog.dash.role'); }catch(e){} return r||'teacher'; }
      function refit(){ layoutTabs(currentRole()); demoDot(); applyCompact(); }
      function wrap(){ if(!window.aogSetDashRole || window.aogSetDashRole.__declutter) return;
        var orig=window.aogSetDashRole;
        window.aogSetDashRole=function(role){ var r=orig.apply(this,arguments); try{ layoutTabs(role); closeMenus(); }catch(e){} return r; };
        window.aogSetDashRole.__declutter=true; }
      function init(){ wrap(); refit(); markSeen(); }
      if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(init,80); });
      else setTimeout(init,80);
      try{ new MutationObserver(function(){ refit(); }).observe(document.documentElement,{attributes:true,attributeFilter:['lang']}); }catch(e){}
      document.addEventListener('click',function(e){ if(e.target.closest && e.target.closest('#screen-admin .tabs .tab, #tabMoreMenu .tab')){ setTimeout(function(){ layoutTabs(currentRole()); },40); } });
      window.__aogDeclutterLayout=layoutTabs;
      window.__aogDeclutterCore=CORE;
    })();
    