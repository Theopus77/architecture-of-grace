
/* Relocate the Parent family sub-nav (member chips + Progress/Talk/Repair strip)
   into the navy hero slot (#dashHeroNav), so it lives inside the blue box.
   Tab switching keeps working because aogFamTab uses document-wide selectors.
   CSS-safe + reversible; the content panels stay in place below the hero. */
(function(){
  function nav(){ return document.getElementById('dashHeroNav'); }
  function role(){ var s=document.getElementById('screen-admin'); return s ? s.getAttribute('data-role') : ''; }
  function relocate(){
    var h=nav(); if(!h) return;
    var r=role();
    if(r==='parent'){
      var root=document.getElementById('dashFamilyRoot'); if(!root) return;
      var sw=root.querySelector('.fam-switch');
      var strip=root.querySelector('.fam-tab-strip');
      if(!sw && !strip) return;          // nothing fresh to move (already relocated)
      h.innerHTML='';
      if(sw) h.appendChild(sw);
      if(strip) h.appendChild(strip);
    } else if(r==='student'){
      var sroot=document.getElementById('dashStudentJourney'); if(!sroot) return;
      var pick=sroot.querySelector('.sj-pick');
      var foot=sroot.querySelector('.sj-foot');
      if(!pick && !foot) return;
      h.innerHTML='';
      if(pick) h.appendChild(pick);
      if(foot) h.appendChild(foot);
    } else {
      if(h.firstChild) h.innerHTML='';   // not parent/student → empty the slot
    }
  }
  var scheduled=false;
  function schedule(){ if(scheduled) return; scheduled=true; setTimeout(function(){ scheduled=false; try{ relocate(); }catch(e){} }, 30); }
  function watch(){
    var ex=document.getElementById('dashRoleExtra');
    if(!ex){ setTimeout(watch,300); return; }
    try{ new MutationObserver(schedule).observe(ex,{ childList:true, subtree:true }); }catch(e){}
    schedule();
  }
  if(document.readyState!=='loading') watch(); else document.addEventListener('DOMContentLoaded', watch);
  // also re-run right after a role switch
  document.addEventListener('click', function(e){ if(e.target && e.target.closest && e.target.closest('.drole')) setTimeout(schedule, 60); });
})();
