
      (function(){
        function init(){
          var grid=document.querySelector('#screen-teacher-tools .tools-grid'); if(!grid) return;
          var cur='__pinned__';
          Array.prototype.forEach.call(grid.children, function(el){
            if(el.tagName==='STYLE' || el.id==='toolFilters') return;
            if(el.classList.contains('tools-row-header')){ cur = el.getAttribute('data-cat') || el.textContent.trim().toLowerCase(); }
            el.setAttribute('data-tcat', cur);
          });
          window.aogToolFilter=function(cat, btn){
            Array.prototype.forEach.call(grid.children, function(el){
              if(el.tagName==='STYLE' || el.id==='toolFilters') return;
              var c=el.getAttribute('data-tcat');
              if(c==='__pinned__'){ el.style.display=''; return; }
              el.style.display = (cat==='all' || c===cat) ? '' : 'none';
            });
            var chips=document.querySelectorAll('#toolFilters .tool-chip');
            Array.prototype.forEach.call(chips, function(b){ var on=(b===btn); b.classList.toggle('active', on); b.setAttribute('aria-pressed', on?'true':'false'); });
            /* Scroll the filter bar (and the category's tools beneath it) into view, past the
               pinned cards, clearing the fixed top bar — so the tools are visible right away
               on desktop and iPhone.
               ⚠ SCROLL THE SCREEN, NOT THE WINDOW (build .30cg). This screen is its own
               scroll container (position:fixed + overflow-y:auto), so window.scrollTo has
               been a silent no-op here the whole time — the mechanism under Jimmy's
               "nothing opens": the catalog really did filter, invisibly, two screens
               down. scrollIntoView works whatever the container is; the follow-up nudge
               clears the fixed top bar. */
            try {
              var bar=document.getElementById('toolFilters');
              if(bar){
                bar.scrollIntoView({ block:'start', behavior:'smooth' });
                setTimeout(function(){
                  try{
                    var tb=document.querySelector('.topbar');
                    var nav=tb ? tb.offsetHeight : (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--aog-topbar-h'))||68);
                    var r=bar.getBoundingClientRect();
                    if(r.top < nav){
                      var sc=grid.closest('.screen') || document.scrollingElement;
                      sc.scrollTop = Math.max(0, sc.scrollTop - (nav + 10 - r.top));
                    }
                  }catch(e){}
                }, 420);
              }
            } catch(e){}
          };
        }
        if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init); } else { init(); }
      })();
    