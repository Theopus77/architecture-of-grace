
(function(){
  if (!window.AOGIdentity) return;
  // Optional Option A (Google SSO). A district sets this (e.g. via a small
  // inline config or a separate build) to switch on email-based sign-in.
  var sso = window.AOG_SSO_CONFIG || { enabled:false, clientId:"" };
  function go(){
    try{
      AOGIdentity.init({
        syncUrl: (typeof SCHOOL_SYNC_URL !== "undefined" ? SCHOOL_SYNC_URL : ""),
        schoolId: (sessionStorage.getItem("aog.launch.schoolId") || ""),
        studentInput: "#studentId",
        ssoMount: "#aogSsoMount",
        sso: !!sso.enabled,
        googleClientId: sso.clientId || "",
        lang: (window.lang || "en")
      });
    }catch(e){ /* identity is best-effort; the app works without it */ }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
})();
