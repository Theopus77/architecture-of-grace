
(function () {
  function deviceKey() {
    try { return (localStorage.getItem("aog.sync.key") || "").trim(); } catch (e) { return ""; }
  }
  function isEs() { try { return typeof dashLang !== "undefined" && dashLang === "es"; } catch (e) { return false; } }
  function statusEls() {
    var out = [];
    var a = document.getElementById("riPullStatus"); if (a) out.push(a);
    var b = document.querySelector(".tab-panel.active .aog-pull-status") || document.querySelector(".aog-pull-status");
    if (b && out.indexOf(b) < 0) out.push(b);
    return out;
  }
  function openSetup() {
    try {
      var key = document.getElementById("aogSyncKey");
      if (!key || key.offsetParent === null) {
        var tab = Array.from(document.querySelectorAll("button,a")).filter(function (b) {
          return /^\s*set\s*up\s*$/i.test((b.textContent || "").trim()) && b.offsetParent !== null;
        })[0];
        if (tab) tab.click();
      }
      setTimeout(function () {
        var k = document.getElementById("aogSyncKey");
        if (k) { try { k.scrollIntoView({ block: "center" }); } catch (e) {} try { k.focus(); } catch (e) {} }
      }, 120);
    } catch (e) {}
  }
  try { window.aogOpenSyncSetup = openSetup; } catch (e) {}

  function showReconnect() {
    var es = isEs();
    var msg = es
      ? "Este equipo no está conectado para leer la hoja. Introduce tu contraseña de lectura en Configuración ▸ Sincronización."
      : "This computer isn’t connected for reading yet. Enter your read passcode under Set up ▸ Syncing & distribution, then pull again.";
    statusEls().forEach(function (el) {
      el.textContent = "";
      var line = document.createElement("div");
      line.textContent = msg;
      line.style.cssText = "color:var(--ink-soft);margin-bottom:8px;";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-sm";
      btn.textContent = es ? "Conectar la hoja →" : "Connect your Sheet →";
      btn.onclick = openSetup;
      el.appendChild(line);
      el.appendChild(btn);
      el.style.color = "";
    });
  }

  function clarifyUnauthorized() {
    var es = isEs();
    statusEls().forEach(function (el) {
      var t = (el.textContent || "");
      if (t.indexOf("cannot read the sheet") < 0 && t.indexOf("no puede leer") < 0) return;
      el.textContent = es
        /* ⚠ This string used to name the read key's LENGTH and its first ten
           characters. It ships to every visitor, and the Apps Script has no rate
           limit, so it turned a 23-character secret into a 13-character one.
           Say which property to look in; never say what it looks like. */
        ? "Esa contraseña no puede leer la hoja. Necesitas la contraseña de LECTURA (ADMIN_PULL_KEY) de las propiedades del script, no la de escritura. Corrígela en Configurar ▸ Sincronización."
        : "That passcode can’t read the sheet. It needs to be your READ passcode (ADMIN_PULL_KEY) from the Apps Script’s Script Properties — not the write key. Fix it under Set up ▸ Syncing & distribution.";
      el.style.color = "var(--red)";
    });
  }

  function wrap() {
    if (typeof window.pullFromSheet !== "function" || window.pullFromSheet.__aogNeedsDeviceKey) return;
    var real = window.pullFromSheet;
    var wrapped = async function () {
      if (!deviceKey()) { showReconnect(); return; }
      var r = await real.apply(this, arguments);
      try { clarifyUnauthorized(); } catch (e) {}
      return r;
    };
    wrapped.__aogNeedsDeviceKey = true;
    window.pullFromSheet = wrapped;
  }

  function boot() { wrap(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  setTimeout(boot, 800);
  setTimeout(boot, 2200);
})();
