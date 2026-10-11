
      window.aogToggleMoreTabs = function(e){ if(e){e.preventDefault();e.stopPropagation();} var m=document.getElementById('tabMoreMenu'),b=document.getElementById('tabMoreBtn'); if(!m||!b)return; if(m.hasAttribute('hidden')){m.removeAttribute('hidden');b.setAttribute('aria-expanded','true');}else{m.setAttribute('hidden','');b.setAttribute('aria-expanded','false');} };
      window.aogCloseMoreTabs = function(){ var m=document.getElementById('tabMoreMenu'),b=document.getElementById('tabMoreBtn'); if(m)m.setAttribute('hidden',''); if(b)b.setAttribute('aria-expanded','false'); };
      document.addEventListener('click', function(e){ var m=document.getElementById('tabMoreMenu'); if(!m||m.hasAttribute('hidden'))return; if(e.target.closest&&(e.target.closest('#tabMoreMenu')||e.target.closest('#tabMoreBtn')))return; window.aogCloseMoreTabs(); });
      document.addEventListener('click', function(e){ var t=e.target.closest&&e.target.closest('.tab[data-tab]'); if(!t)return; var menu=document.getElementById('tabMoreMenu'),b=document.getElementById('tabMoreBtn'); if(b)b.classList.toggle('on', !!(menu&&menu.contains(t)));
        // Scroll to the very top on every tab switch. We do it three times:
        // immediately, on the next frame, and after a short beat. The repeats
        // matter for roles whose panel re-renders heavy content after the click
        // (Teacher calm card, Specialist Specialist workspace) — that late layout
        // shift + the browser's scroll-anchoring would otherwise leave the page
        // parked mid-scroll, so a single synchronous scroll "goes nowhere".
        var toTop=function(){ try{ window.scrollTo({top:0,behavior:'instant'}); }catch(_e){ try{window.scrollTo(0,0);}catch(__e){} } };
        toTop();
        try{ requestAnimationFrame(toTop); }catch(_r){}
        setTimeout(toTop,70);
      });
    