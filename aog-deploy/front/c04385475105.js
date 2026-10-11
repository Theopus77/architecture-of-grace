
/* survey/reflection: save progress, confirm, then exit to home with resume bar */
window.surveyExit = function(){
  var es = false; try{ es = (typeof lang !== "undefined" && lang === "es"); }catch(e){}
  try{ if (typeof saveDraft === "function") saveDraft( (document.getElementById("screen-reflection") && document.getElementById("screen-reflection").classList.contains("active")) ? "reflection" : "survey" ); }catch(e){}
  var hasDraft = false; try{ hasDraft = (typeof getDraft === "function") && !!getDraft(); }catch(e){}
  var msg = hasDraft
    ? (es ? "Tu progreso se ha guardado en este dispositivo. Puedes continuar más tarde desde la pantalla de inicio, con el botón “Continuar”. ¿Salir ahora?"
          : "Your progress is saved on this device. You can pick up right where you left off from the home screen — just tap “Resume”. Exit now?")
    : (es ? "¿Salir de la autorreflexión?" : "Leave the self-reflection?");
  if (!confirm(msg)) return;
  if (typeof resetToStart === "function"){ try{ resetToStart(); }catch(e){} }
};

/* privacy accordion: tap a section header to open it (one open at a time) */
window.pvToggle = function(id){
  var el = document.getElementById(id);
  if (!el) return;
  var isOpen = el.classList.contains("open");
  document.querySelectorAll("#screen-privacy .pv-acc").forEach(function(x){
    x.classList.remove("open");
    var h = x.querySelector(".pv-acc-head"); if (h) h.setAttribute("aria-expanded","false");
  });
  if (!isOpen){
    el.classList.add("open");
    var h = el.querySelector(".pv-acc-head"); if (h) h.setAttribute("aria-expanded","true");
    /* open in place — no scrollIntoView (was mis-landing at the bottom on iOS) */
  }
};

(function(){
  try{
    if (typeof I18N_UI !== "undefined"){
      I18N_UI.s_save_exit = {en:"Save & exit", es:"Guardar y salir"};
      I18N_UI.lobby_privacy_t = {en:"Your privacy & data", es:"Tu privacidad y tus datos"};
      I18N_UI.lobby_privacy_s = {en:"No account, no tracking, no selling. Your self-reflections stay on your device — see exactly what’s kept, and control it yourself.", es:"Sin cuenta, sin rastreo, sin venta de datos. Tus autorreflexiones se quedan en tu dispositivo — mira exactamente qué se guarda y contrólalo tú."};
      I18N_UI.pv_lede = {en:"No account. No tracking. Private by default: your self-reflections stay on the device you took them on, and travel only when your school sets up a connected link. Tap any section below to read more.", es:"Sin cuenta. Sin rastreo. Privado de forma predeterminada: tus autorreflexiones se quedan en el dispositivo donde las hiciste y solo viajan cuando tu escuela configura un enlace conectado. Toca cualquier sección abajo para leer más."};
    }
  }catch(e){}
})();
