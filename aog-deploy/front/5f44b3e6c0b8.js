
(function () {
  var EN = {
    synced: "Your answers have been saved. A trusted adult will review them to make sure you have the support you need.",
    local:  "Your answers are saved on this device — they have not been sent anywhere. If you want an adult to see them, you can show them right now.",
    show:   "Show these to a teacher →"
  };
  var ES = {
    synced: "Tus respuestas se han guardado. Un adulto de confianza las revisará para asegurarse de que tengas el apoyo que necesitas.",
    local:  "Tus respuestas se guardaron en este dispositivo — no se han enviado a ningún lado. Si quieres que un adulto las vea, puedes mostrárselas ahora.",
    show:   "Mostrar esto a un docente →"
  };
  function es() {
    try { return (document.documentElement.getAttribute("lang") || "en").slice(0,2) === "es"; }
    catch (e) { return false; }
  }
  function willAnAdultSeeIt() {
    try {
      if (typeof syncDestinationConfigured === "function" && syncDestinationConfigured()) return true;
    } catch (e) {}
    /* Deliberately nothing else. A launch link sets aog.launch.classId and
       aog.launch.sync from the URL on ANY device, configured or not — trusting
       those alone told a student "a trusted adult will review them" when this
       browser had no sync destination and nothing was ever sent. When in doubt
       the honest answer is the local one, which also offers the student the
       "Show this to a teacher" button. */
    return false;
  }
  function paint() {
    try {
      var lede = document.getElementById("thanksLede");
      if (!lede) return;
      var T = es() ? ES : EN;
      var synced = willAnAdultSeeIt();
      /* Drop the i18n key so the translation layer cannot put the old
         promise back on a language switch. */
      lede.removeAttribute("data-i18n");
      lede.textContent = synced ? T.synced : T.local;

      var btn = document.getElementById("aogShowTeacher");
      if (!synced) {
        if (!btn) {
          btn = document.createElement("button");
          btn.id = "aogShowTeacher";
          btn.className = "btn btn-secondary";
          btn.style.cssText = "margin-top:14px;";
          btn.addEventListener("click", function () {
            try {
              if (typeof openAdmin === "function") openAdmin();
              setTimeout(function () {
                var t = document.querySelector('#screen-admin .tab[data-tab="students"], #tabMoreMenu .tab[data-tab="students"]');
                if (t) t.click();
              }, 260);
            } catch (e) {}
          });
          lede.parentNode.insertBefore(btn, lede.nextSibling);
        }
        btn.textContent = T.show;
        btn.style.display = "";
      } else if (btn) { btn.style.display = "none"; }
    } catch (e) {}
  }
  function hook() {
    try {
      var real = window.showScreen;
      if (typeof real !== "function" || real.__whoSees) return;
      var wrapped = function (id) {
        var r = real.apply(this, arguments);
        if (id === "screen-thanks") setTimeout(paint, 40);
        return r;
      };
      wrapped.__whoSees = true;
      window.showScreen = wrapped;
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hook);
  else hook();
  setTimeout(hook, 600);
  try {
    document.addEventListener("click", function (ev) {
      if (ev.target && ev.target.closest && ev.target.closest(".lang-toggle")) setTimeout(paint, 80);
    }, true);
  } catch (e) {}
})();
