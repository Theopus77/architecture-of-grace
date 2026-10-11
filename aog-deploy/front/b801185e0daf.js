
/* ============================================================
   PHASE 2 — Connect your school's Sheet (school-owned sync config)
   The school pastes its OWN Apps Script Web App URL + passcode here.
   Stored in this browser only; drives SCHOOL_SYNC_URL / SCHOOL_SYNC_KEY.
   Nothing is sent to Architecture of Grace.
   ============================================================ */
function aogSyncCfgStatus(msg, color) {
  var e = document.getElementById("aogSyncCfgStatus");
  if (e) { e.textContent = msg || ""; e.style.color = color || "var(--ink-soft)"; }
}
function aogSyncHostLabel(u) {
  try { var h = (u.match(/^https?:\/\/([^\/]+)/) || [])[1] || ""; return h ? (h + " &middot; …/exec") : ""; } catch (e) { return ""; }
}
function aogSyncRenderState(connected, u) {
  var b = document.getElementById("aogSyncConnected"), f = document.getElementById("aogSyncForm"),
      hp = document.getElementById("aogSyncConnectedHost"), card = document.getElementById("aogSyncCard");
  /* .30eh: the Pull-everything row lives and dies with the connected banner. */
  try {
    var prAll = document.getElementById("aogPullAllRow");
    if (prAll) {
      prAll.style.display = connected ? "" : "none";
      var pbAll = document.getElementById("aogPullAllBtn"), pblAll = document.getElementById("aogPullAllBlurb");
      if (pbAll) pbAll.innerHTML = "&#10227; " + DT("Pull everything from the sheet", "Traer todo de la hoja");
      if (pblAll) pblAll.textContent = DT("Self-reflections \u00b7 daily check-ins \u00b7 practice \u00b7 exit slips \u00b7 home",
                                          "Autorreflexiones \u00b7 registros diarios \u00b7 pr\u00e1ctica \u00b7 salidas \u00b7 hogar");
    }
  } catch (ePrAll) {}
  if (connected) {
    if (b) b.style.display = "flex";
    try { var kr = document.getElementById("aogConnKeepRow"); if (kr) kr.style.display = "flex"; } catch (eKr) {}
    if (f) f.style.display = "none";
    if (hp) hp.innerHTML = aogSyncHostLabel(u || "");
    if (card) card.style.borderColor = "var(--green,#2E6B3A)";
    try { var d = document.querySelector(".aogcfg-help"); if (d) d.open = false; } catch (e) {}
  } else {
    if (b) b.style.display = "none";
    if (f) f.style.display = "";
    try { var kr2 = document.getElementById("aogConnKeepRow"); if (kr2) kr2.style.display = "none"; } catch (eKr2) {}
    if (card) card.style.borderColor = "";
  }
}
/* ⚠ .30eh — A PULL FOR EVERYTHING, in one press. Five pull paths already exist
   and each lives behind its own card: self-reflections (pullFromSheet, which
   MTSS also rides), daily check-ins + practice rows + sent This Is Me pages
   (aogPullCheckins), exit slips (aogPullExitSlips), home observations
   (aogPullHome) and evening home check-ins (aogPullHomeCheckins). They run in
   ORDER, not in parallel — one Apps Script answers all five, and five
   simultaneous POSTs at the same /exec is how a pull starts timing out. Each
   lens reports by name; one that fails says so in its own words WITHOUT
   stopping the rest. Every store-side rule (tombstones, a practice row is
   never a check-in, the 1899 time fix) lives inside the five functions
   themselves, so this button cannot bypass any of them. */
async function aogPullEverything() {
  var btnAll = document.getElementById("aogPullAllBtn");
  var stAll = document.getElementById("aogPullAllStatus");
  var lines = [];
  function paintAll() { if (stAll) stAll.textContent = lines.join("\n"); }
  function ln(label, text) { lines.push(label + ": " + text); paintAll(); }
  function whyText(why) {
    if (why === "nokey") return DT("this computer cannot read the sheet yet \u2014 put your ADMIN_PULL_KEY in the Passcode box.",
                                   "esta computadora a\u00fan no puede leer la hoja \u2014 pon tu ADMIN_PULL_KEY en el campo de contrase\u00f1a.");
    if (why === "nodest") return DT("no sheet is connected yet.", "todav\u00eda no hay una hoja conectada.");
    if (why === "rejected") return DT("the sheet answered but its script does not know this lens yet \u2014 re-paste the Apps Script and publish a new version.",
                                      "la hoja respondi\u00f3 pero su script no conoce esta secci\u00f3n \u2014 vuelve a pegar el Apps Script y publica una nueva versi\u00f3n.");
    return DT("could not reach the sheet.", "no se pudo conectar con la hoja.");
  }
  if (btnAll) btnAll.disabled = true;
  if (stAll) { stAll.style.color = "var(--ink-soft)"; }
  lines = [DT("Pulling everything\u2026", "Trayendo todo\u2026")]; paintAll();
  var okAll = true;
  /* 1 · self-reflections. pullFromSheet reports into #riPullStatus (the
     "See results from other devices" card below on this same tab); mirror
     its sentence here so the outcome reads in ONE place. */
  var refLabel = DT("Self-reflections", "Autorreflexiones");
  try {
    if (typeof pullFromSheet === "function") {
      await pullFromSheet();
      var mirrored = "";
      try { mirrored = (document.getElementById("riPullStatus") || {}).textContent || ""; } catch (eM) {}
      ln(refLabel, mirrored || DT("done.", "listo."));
    } else { okAll = false; ln(refLabel, "\u26A0 " + whyText("")); }
  } catch (eRef) { okAll = false; ln(refLabel, "\u26A0 " + whyText("")); }
  /* 2\u20135 · the four lens pulls, each already promise-shaped. */
  async function step(label, fnName, fmt) {
    var fn = window[fnName];
    if (typeof fn !== "function") { okAll = false; ln(label, "\u26A0 " + whyText("rejected")); return; }
    var r; try { r = await fn(); } catch (eS) { r = null; }
    if (r && r.ok) ln(label, fmt(r));
    else {
      okAll = false;
      /* aogPullHome's catch hands back the raw fetch error ("Failed to fetch"),
         which is browser-speak, not teacher-speak. Keep a script's own sentence;
         translate the network noise. */
      var msg = (r && r.error) || "";
      if (!msg || /failed to fetch|networkerror|typeerror/i.test(msg)) msg = whyText(r && r.why);
      ln(label, "\u26A0 " + msg);
    }
  }
  await step(DT("Daily check-ins", "Registros diarios"), "aogPullCheckins", function (r) {
    return DT("\u2713 " + r.count + " rows \u00b7 " + (r.practice || 0) + " practice rows.",
              "\u2713 " + r.count + " filas \u00b7 " + (r.practice || 0) + " filas de pr\u00e1ctica.");
  });
  await step(DT("Exit slips", "Salidas"), "aogPullExitSlips", function (r) {
    return DT("\u2713 " + r.count + " rows, " + r.added + " new.", "\u2713 " + r.count + " filas, " + r.added + " nuevas.");
  });
  await step(DT("Home observations", "Observaciones del hogar"), "aogPullHome", function (r) {
    return DT("\u2713 " + (r.total || 0) + " rows, " + (r.added || 0) + " new.", "\u2713 " + (r.total || 0) + " filas, " + (r.added || 0) + " nuevas.");
  });
  await step(DT("Home check-ins", "Registros del hogar"), "aogPullHomeCheckins", function (r) {
    return DT("\u2713 " + r.rows + " rows, " + r.added + " new.", "\u2713 " + r.rows + " filas, " + r.added + " nuevas.");
  });
  try { if (typeof refreshAdmin === "function") refreshAdmin(); } catch (eA) {}
  try { if (typeof renderSyncStatus === "function") renderSyncStatus(); } catch (eB) {}
  lines.shift(); /* drop the "Pulling…" opener; the five lines stand on their own */
  lines.push(okAll ? DT("\u2713 Everything pulled.", "\u2713 Todo tra\u00eddo.")
                   : DT("Done \u2014 the \u26A0 lines above say what to fix.", "Terminado \u2014 las l\u00edneas \u26A0 dicen qu\u00e9 arreglar."));
  paintAll();
  if (stAll) stAll.style.color = okAll ? "var(--green,#2E6B3A)" : "var(--ink-soft)";
  if (btnAll) btnAll.disabled = false;
}
try { window.aogPullEverything = aogPullEverything; } catch (ePw) {}
function aogSyncEdit() { aogSyncRenderState(false, ""); var iu = document.getElementById("aogSyncUrl"); if (iu) iu.focus(); }
function aogLoadSyncConfig() {
  try {
    var u = localStorage.getItem("aog.sync.url") || "";
    var k = localStorage.getItem("aog.sync.key") || "";
    var w = localStorage.getItem("aog.sync.writekey") || "";
    var iu = document.getElementById("aogSyncUrl"), ik = document.getElementById("aogSyncKey"),
        iw = document.getElementById("aogSyncWriteKey");
    if (iu && !iu.value) iu.value = u;
    if (ik && !ik.value) ik.value = k;
    if (iw && !iw.value) iw.value = w;
    if (u) { aogSyncCfgStatus("", "var(--green)"); aogSyncRenderState(true, u); } else { aogSyncRenderState(false, ""); }
  } catch (e) {}
}
function aogSaveSyncConfig() {
  var u = ((document.getElementById("aogSyncUrl") || {}).value || "").trim();
  var k = ((document.getElementById("aogSyncKey") || {}).value || "").trim();
  var w = ((document.getElementById("aogSyncWriteKey") || {}).value || "").trim();
  if (u && !/^https:\/\/script\.google\.com\/.*\/exec$/.test(u)) {
    aogSyncCfgStatus("That doesn’t look like an Apps Script Web App link — it should start with https://script.google.com/ and end in /exec.", "var(--red)");
    return;
  }
  try {
    if (u) localStorage.setItem("aog.sync.url", u); else localStorage.removeItem("aog.sync.url");
    if (k) localStorage.setItem("aog.sync.key", k); else localStorage.removeItem("aog.sync.key");
    if (w) localStorage.setItem("aog.sync.writekey", w); else localStorage.removeItem("aog.sync.writekey");
  } catch (e) {}
  SCHOOL_SYNC_URL = u; SCHOOL_SYNC_KEY = k;
  try { if (typeof deviceSyncSet === "function" && u) deviceSyncSet(true); } catch (e) {}
  try { if (typeof renderSyncStatus === "function") renderSyncStatus(); } catch (e) {}
  /* Two different true sentences. A teacher who typed a write key has just
     changed what every link they hand out DOES, and must be told so here
     rather than discover it on a student's phone. */
  aogSyncCfgStatus(
    u ? (w ? "Saved. This device syncs to your Sheet, and the links you hand out now carry that destination with them."
           : "Saved. This device now syncs to your Sheet. Links you hand out will not — add your write key for that.")
      : "Cleared. This device is local-only.", "var(--green)");
  aogSyncRenderState(!!u, u);
}
function aogClearSyncConfig() {
  try { localStorage.removeItem("aog.sync.url"); localStorage.removeItem("aog.sync.key");
        localStorage.removeItem("aog.sync.writekey"); } catch (e) {}
  SCHOOL_SYNC_URL = ""; SCHOOL_SYNC_KEY = "";
  var iu = document.getElementById("aogSyncUrl"), ik = document.getElementById("aogSyncKey"),
      iw = document.getElementById("aogSyncWriteKey");
  if (iu) iu.value = ""; if (ik) ik.value = ""; if (iw) iw.value = "";
  try { if (typeof deviceSyncSet === "function") deviceSyncSet(false); if (typeof renderSyncStatus === "function") renderSyncStatus(); } catch (e) {}
  aogSyncCfgStatus("Disconnected. This device is local-only.", "var(--ink-soft)");
  aogSyncRenderState(false, "");
}
async function aogTestSyncConfig() {
  var u = ((document.getElementById("aogSyncUrl") || {}).value || "").trim();
  var k = ((document.getElementById("aogSyncKey") || {}).value || "").trim();
  if (!u) { aogSyncCfgStatus("Enter your Web App URL first.", "var(--red)"); return; }
  aogSyncCfgStatus("Sending a test ping…", "var(--ink-soft)");
  try {
    await fetch(u, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ passcode: k, ping: true, timestamp: new Date().toISOString() }) });
    aogSyncCfgStatus("Test ping sent. Because the script runs cross-origin, open your Sheet and look for a row marked “(connection test)”. If it’s there, you’re connected.", "var(--green)");
  } catch (e) {
    aogSyncCfgStatus("Couldn’t reach that URL. Confirm the Web App is deployed to “Anyone” and the link ends in /exec.", "var(--red)");
  }
}
try { if (document.readyState !== "loading") aogLoadSyncConfig(); else document.addEventListener("DOMContentLoaded", aogLoadSyncConfig); } catch (e) {}
