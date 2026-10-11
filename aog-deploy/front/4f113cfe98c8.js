
/* AOG-OPENTOOL-V1 (2026-09-26) — a tool by link: /#opentool=disclosure opens that tool, so the new
   dashboard can put buried teacher tools one tap away. */
/* AOG-OPENMTSS-V1 — /#openmtss opens the MTSS Report straight from the new dashboard's Reports page. */
(function(){ function go(){ if(location.hash!=="#openmtss") return; if(!/[?&]classic=1/.test(location.search)){ location.replace("/dashboard#mtss"); return; } var n=0,t=setInterval(function(){ if(typeof window.aogOpenMTSS==="function"){ clearInterval(t); try{ history.replaceState(null,"","#dashboard"); }catch(e){} try{ if(typeof window.showScreen==="function") window.showScreen("screen-admin"); }catch(e){} setTimeout(function(){ window.aogOpenMTSS(); },150); } else if(++n>80) clearInterval(t); },100); }
  go(); window.addEventListener("hashchange",go); })();
(function(){ function go(){ var m=/^#opentool=([a-z0-9-]+)$/.exec(location.hash||""); if(!m) return;
  var n=0,t=setInterval(function(){ if(typeof window.toolOpen==="function"){ clearInterval(t); try{ history.replaceState(null,"","#tools"); }catch(e){} window.toolOpen(m[1]); } else if(++n>60) clearInterval(t); },100); }
  go(); window.addEventListener("hashchange",go); })();
