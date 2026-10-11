
/* ?lang= arrives before the later i18n dictionaries load; re-apply once everything is in. */
window.addEventListener('load',function(){
 try{ if(typeof lang!=='undefined' && lang==='es' && typeof setLang==='function'){ setLang('es'); } }catch(e){}
 try{ if(window.aogApplyDataEn) window.aogApplyDataEn(); }catch(e){}
});
