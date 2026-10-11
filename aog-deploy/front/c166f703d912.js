(function(){
  function open(url, title){
    var v=document.getElementById('aogPdfView'); if(!v) return;
    document.getElementById('aogPdfFrame').src=url;
    document.getElementById('aogPdfTitle').textContent=title||'';
    document.getElementById('aogPdfNewtab').href=url;
    document.getElementById('aogPdfDl').href=url;
    v.classList.add('open'); try{ document.body.style.overflow='hidden'; }catch(e){}
  }
  window.aogOpenPdf=open;
  window.aogClosePdf=function(){ var v=document.getElementById('aogPdfView'); if(!v)return; v.classList.remove('open'); try{ document.getElementById('aogPdfFrame').src='about:blank'; }catch(e){} try{ document.body.style.overflow=''; }catch(e){} };
  document.addEventListener('click', function(e){
    var a=e.target.closest?e.target.closest('a[href]'):null; if(!a) return;
    if(e.defaultPrevented) return;
    if(a.closest('#aogPdfView')) return;            // the viewer's own links open normally
    if(a.hasAttribute('data-no-viewer')) return;
    var href=a.getAttribute('href')||'';
    if(/^https?:/i.test(href) || /^data:/i.test(href)) return; // only local docs
    var inapp=a.hasAttribute('data-inapp');
    if(!/\.pdf(\?|#|$)/i.test(href) && !inapp) return;
    e.preventDefault();
    var url=href;
    if(inapp && !/[?&]embed=/.test(url)){ url += (url.indexOf('?')>=0?'&':'?')+'embed=1'; } // ask the embedded page to hide its own header
    // Mobile (esp. iOS): PDFs don't scroll inside an iframe — Safari shows only the cover and locks it.
    // Open in the same tab so the native viewer scrolls and the browser Back button returns here.
    var _touch = window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if(_touch && /\.pdf(\?|#|$)/i.test(href)){ window.location.href = url; return; }
    var t=(a.textContent||'').trim().replace(/\s+/g,' ').replace(/\s*(→|→|·).*$/,'') || 'Document';
    open(url, t);
  });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ var v=document.getElementById('aogPdfView'); if(v&&v.classList.contains('open')) window.aogClosePdf(); } });
})();