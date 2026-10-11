
      /* The menu opens from the top bar OR from the hero "Explore" button; when it is opened
         from anywhere but the top bar it is pinned under that button instead. */
      var aogExAnchor=null;
      function aogPlaceExplore(m, anchor){
        var r=anchor.getBoundingClientRect();
        if(r.bottom<0 || r.top>window.innerHeight){ aogCloseExplore(); return; }
        m.style.position='fixed'; m.style.top='0px';
        var maxH=Math.round(window.innerHeight*0.82);
        m.style.maxHeight=maxH+'px';
        if(window.matchMedia && window.matchMedia('(max-width:560px)').matches){ m.style.left='12px'; m.style.right='12px'; }
        else {
          var w=m.offsetWidth||320;
          var left=Math.round(r.left + r.width/2 - w/2);
          left=Math.max(12, Math.min(left, window.innerWidth - w - 12));
          m.style.left=left+'px'; m.style.right='auto';
        }
        /* Prefer just under the button; slide up when the button sits low in the window. */
        var h=Math.min(m.offsetHeight, maxH);
        var top=Math.round(r.bottom+10);
        if(top + h + 12 > window.innerHeight){ top=Math.max(12, Math.round(window.innerHeight - h - 12)); }
        m.style.top=top+'px';
      }
      function aogToggleExplore(e, anchor){ if(e){e.preventDefault();} var b=document.getElementById('exNavBtn'),m=document.getElementById('exNavMenu'); if(!m)return; anchor=anchor||b; if(!anchor)return; if(m.hasAttribute('hidden')){ aogExAnchor=anchor; m.removeAttribute('hidden'); anchor.setAttribute('aria-expanded','true'); /* .30hs -- PLACE IT IN JS FOR THE TOP BAR TOO. The CSS path was position:absolute;right:0 inside .exnav, which right-aligns the menu to the BUTTON, not to the window -- so a menu wider than the distance from the button's right edge to the left of the screen hangs off the LEFT. At three columns it did, at every desktop width (left -50px at 1440, -214px at 1024), and the 820px two-column menu already did so below ~1100. aogPlaceExplore has clamped left to [12, innerWidth-w-12] all along; the top-bar path simply never called it. */ aogPlaceExplore(m, anchor); var f=aogExVisible(m)[0]; if(f) f.focus(); } else { aogCloseExplore(); } }
      function aogCloseExplore(){ var m=document.getElementById('exNavMenu'); if(!m)return; m.setAttribute('hidden',''); m.style.top=''; m.style.left=''; m.style.right=''; m.style.position=''; m.style.maxHeight=''; aogExAnchor=null; ['exNavBtn','heroExploreBtn'].forEach(function(id){ var el=document.getElementById(id); if(el) el.setAttribute('aria-expanded','false'); }); }
      window.addEventListener('scroll', function(){ var m=document.getElementById('exNavMenu'); if(m && !m.hasAttribute('hidden') && aogExAnchor) aogPlaceExplore(m, aogExAnchor); /* .30hs: the top-bar button is placed in JS now too, so it must be repositioned like any other anchor */ }, {passive:true});
      window.addEventListener('resize', function(){ var m=document.getElementById('exNavMenu'); if(m && !m.hasAttribute('hidden') && aogExAnchor) aogPlaceExplore(m, aogExAnchor); /* .30hs: the top-bar button is placed in JS now too, so it must be repositioned like any other anchor */ });
      function aogToggleSubjects(e, btn){ if(e){e.preventDefault(); e.stopPropagation();}
        /* .30hs -- THERE ARE THREE FOLDS NOW, NOT ONE. This used to do
           document.querySelector('.exnav-fold-btn'), which is the FIRST button in the
           document -- with three doors that toggles door 1 whichever door you tap.
           The button is passed in and names its own panel through aria-controls. */
        var b = btn || (e && e.currentTarget) || (e && e.target && e.target.closest && e.target.closest('.exnav-fold-btn')) || document.querySelector('.exnav-fold-btn');
        if(!b) return;
        var f = document.getElementById(b.getAttribute('aria-controls') || 'exNavDoor1');
        if(!f) return;
        var open = f.hasAttribute('hidden');
        if(open){ f.removeAttribute('hidden'); b.setAttribute('aria-expanded','true'); }
        else { f.setAttribute('hidden',''); b.setAttribute('aria-expanded','false'); } }
      function aogExVisible(m){ return Array.prototype.filter.call(m.querySelectorAll('a[role=menuitem],button[role=menuitem]'), function(e){ return e.offsetParent!==null; }); }
      document.addEventListener('click', function(ev){ var m=document.getElementById('exNavMenu'); if(!m||m.hasAttribute('hidden'))return; if(ev.target.closest && ev.target.closest('.exnav-fold-btn')) return; if(ev.target.closest && ev.target.closest('.exnav-menu')){ aogCloseExplore(); return; } if(ev.target.closest && ev.target.closest('#exNavBtn,#heroExploreBtn'))return; aogCloseExplore(); });
      document.addEventListener('keydown', function(ev){
        var m=document.getElementById('exNavMenu');
        if(ev.key==='Escape'){ var back=aogExAnchor||document.getElementById('exNavBtn'); aogCloseExplore(); if(back) back.focus(); return; }
        if((ev.key===' '||ev.key==='Spacebar') && ev.target && (ev.target.id==='exNavBtn'||ev.target.id==='heroExploreBtn')){ ev.preventDefault(); aogToggleExplore(null, ev.target); return; }
        if(!m || m.hasAttribute('hidden')) return;
        if(ev.key==='ArrowDown' || ev.key==='ArrowUp'){
          ev.preventDefault();
          var items=aogExVisible(m); if(!items.length) return;
          var idx=items.indexOf(document.activeElement);
          idx = (ev.key==='ArrowDown') ? (idx+1)%items.length : (idx<=0 ? items.length-1 : idx-1);
          items[idx].focus();
        }
      });
    