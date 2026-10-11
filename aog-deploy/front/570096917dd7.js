(function(){
 try{
  var b=document.getElementById('aogEsBanner'); if(!b) return;
  var nav=(navigator.language||navigator.userLanguage||'').toLowerCase();
  var dismissed=false; try{dismissed=localStorage.getItem('aog.esbanner')==='off';}catch(e){}
  var already=false; try{already=(sessionStorage.getItem('aogScreener.v2.lang')==='es');}catch(e){}
  var param=false; try{param=!!new URLSearchParams(location.search).get('lang');}catch(e){}
  if(nav.indexOf('es')===0 && !dismissed && !already && !param){ b.style.display='flex'; }
  var yes=document.getElementById('aogEsYes'), no=document.getElementById('aogEsNo');
  if(yes) yes.addEventListener('click',function(){
    b.style.display='none';
    if(typeof window.setLang==='function'){ try{ setLang('es'); }catch(e){ location.href='?lang=es'; } }
    else{ location.href='?lang=es'; }
  });
  if(no) no.addEventListener('click',function(){ b.style.display='none'; try{localStorage.setItem('aog.esbanner','off');}catch(e){} });
 }catch(e){}
})();