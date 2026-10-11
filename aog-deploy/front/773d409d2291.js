
  window.aogClearMyData = function(){
    var es = (typeof lang!=="undefined" && lang==="es");
    var msg = es
      ? "¿Borrar todos los datos guardados en este dispositivo? (registros de herramientas, modo familia y preferencias de este sitio). Esto no se puede deshacer."
      : "Clear all saved data on this device? (tool logs, Family Mode entries, and this site’s saved settings). This can’t be undone.";
    if (!window.confirm(msg)) return;
    try{
      /* The school's Sheet connection is NOT one of "this site's saved settings".
         A teacher who taps this after a demo must not silently lose the read
         passcode. Only Disconnect and the red Delete-everything button, which
         both name the connection in their own confirm text, may remove it. */
      var KEEP_SYNC = { "aog.sync.url": 1, "aog.sync.key": 1, "aog.sync.writekey": 1, "aog.studio.locker.v1": 1 };   /* the Studio's locker too: only its own Disconnect removes it */
      var rm = [];
      for (var i=0; i<localStorage.length; i++){ var k = localStorage.key(i); if (k && !KEEP_SYNC[k]){ var kl = k.toLowerCase(); if (kl.indexOf("aog")===0 || kl.indexOf("grace")===0) rm.push(k); } }
      rm.forEach(function(k){ try{ localStorage.removeItem(k); }catch(e){} });
    }catch(e){}
    window.alert(es ? "Listo. Tus datos de este dispositivo se han borrado." : "Done. Your data on this device has been cleared.");
  };
  /* auto-expand the "how to read this dashboard" help on a teacher's first visit only */
  (function(){
    try{
      var d=document.getElementById("qsDomainHelp"); if(!d) return;
      var KEY="aog.qs.domainhelp.seen";
      if(!localStorage.getItem(KEY)){ d.setAttribute("open",""); localStorage.setItem(KEY,"1"); }
    }catch(e){}
  })();
  /* Overview-tab onboarding card: dismissible, remembered per device */
  window.aogDismissOvOnboard = function(){
    try{ localStorage.setItem("aog.ov.onboard.dismissed","1"); }catch(e){}
    var el=document.getElementById("ovOnboard"); if(el) el.style.display="none";
  };
  (function(){
    try{ if(localStorage.getItem("aog.ov.onboard.dismissed")){ var el=document.getElementById("ovOnboard"); if(el) el.style.display="none"; } }catch(e){}
  })();
