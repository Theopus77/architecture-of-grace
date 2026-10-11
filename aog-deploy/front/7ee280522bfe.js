
/* ═══════════════════════════════════════════════════════════════════════
   .30i0 — EVERY TAB GETS ITS OWN PULL

   Jimmy, standing on the Practice tab: "EVERY PAGE SHOULD HAVE ITS OWN
   PULL! its annoying that you have to go somewhere else to have this
   different pop up."

   ⚠⚠ THE COPY WAS ALREADY PROMISING THIS AND LYING. The Practice card's
   empty state reads "press Pull from sheet above to bring it here" — there
   was no pull above it, or anywhere on that tab. Five lens pulls exist,
   each behind its own card on its own tab, plus Pull-everything on Set up.
   A teacher on Practice, Team, IEP Progress, Goal Builder, Student view,
   Growth or Reflection had to LEAVE the page, press a button on a
   different one, and come back to read the rows.

   ⚠ THE BAR PULLS WHAT THIS TAB READS, AND NAMES IT. Not five pulls on
   every page — that is the Set up button, and it is still one press away
   as "or pull everything". One tab, one job. [[aog-one-product-language]]

   ⚠⚠ NEVER TWO DOORS TO ONE PLACE — the rule that took the Inbox button
   back out of the Team card in .30hl. A panel that already carries a
   control for a lens does not get a second one: the bar subtracts every
   lens an in-panel button already covers (#ciPullBtn, #xvPull, #hctPull,
   #riPullBtn, #mtssPullBtn, #aogPullAllRow) and mounts only what is left,
   or nothing at all. That is why Exit slips and Home check-ins look
   untouched, and why IEP Progress gains a check-ins pull while keeping its
   own team-evidence button.

   ⚠ PANELS REBUILD THEMSELVES WITH innerHTML. The Team view assigns
   host.innerHTML on every render and the practice cards re-render on every
   pull, so an inserted node is wiped without warning. The bar re-mounts
   from a debounced MutationObserver on #screen-admin with a re-entry
   guard, and the STATUS IT LAST PRINTED IS HELD IN A VARIABLE, not in the
   node — press pull, let refreshAdmin rebuild the panel underneath you,
   and the sentence telling you what happened is still there. A card that
   vanishes silently is the fault this product has paid for more than once.

   ⚠ NOT CONNECTED, NO BAR. The same rule the Pull-everything row follows:
   a device with no Sheet URL has nothing to pull from and does not get a
   button that can only fail.

   ⚠ "Last pulled" IS TRUE FROM ANY DOOR. The five window-level pull
   functions are wrapped once to stamp a timestamp per lens, so the bar
   reports the last real pull even when it happened on Set up or from a
   card the bar does not own. A "Last pulled" that only knew about its own
   presses would be worse than printing none.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  var LKEY = "aog.pull.last.v1";
  var busy = false, tid = 0;
  var STATE = {};   /* panelId -> {html, ok} — survives a panel re-render */

  /* ⚠⚠ .30i3 — THE BAR CHECKS THE SHEET BY ITSELF ON ARRIVAL. Jimmy: "I
     dislike pulling from the sheets everytime I leave and reentry the page."
     Pulled rows have always persisted in localStorage, so nothing was ever
     lost by not pressing it — what he was doing was pressing a button to
     find out whether anything NEW had arrived, on every visit, forever.
     ⚠ THROTTLED BY LENS, NOT BY PAGE, and the timestamp store built for
     "Last pulled" is what makes it honest: a lens pulled inside FRESH_MS —
     from this bar, from Set up, from any card — is not pulled again, so
     touring five tabs does not fire five requests at one Apps Script.
     ⚠ ONCE PER LENS PER PAGE LOAD (`tried`), so a lens that FAILS does not
     retry on every tab switch and turn a bad passcode into a hammer.
     ⚠ NEVER WHILE DISCONNECTED, and never silently: it prints into the same
     status line a pressed pull uses, says it checked on its own, and the
     button stays exactly where it was for when you want it NOW. Answers are
     never sent — this is the same read the button has always run. */
  var FRESH_MS = 5 * 60 * 1000;
  var tried = {};

  function T(en, es) {
    try { if (typeof dashLang !== "undefined" && dashLang === "es") return es; } catch (e) {}
    try { if ((document.documentElement.lang || "") === "es") return es; } catch (e2) {}
    return en;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function stamp(k) {
    try {
      var o = JSON.parse(localStorage.getItem(LKEY) || "{}");
      o[k] = Date.now();
      localStorage.setItem(LKEY, JSON.stringify(o));
    } catch (e) {}
  }
  function lastOf(keys) {
    var best = 0;
    try {
      var o = JSON.parse(localStorage.getItem(LKEY) || "{}");
      keys.forEach(function (k) { if (o[k] && o[k] > best) best = o[k]; });
    } catch (e) {}
    return best;
  }
  function timeLabel(ts) {
    try {
      var d = new Date(ts), now = new Date();
      var t = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      if (d.toDateString() === now.toDateString()) return t;
      return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + t;
    } catch (e) { return ""; }
  }
  function whyText(why) {
    if (why === "nokey") return T("this computer cannot read the sheet yet — put your ADMIN_PULL_KEY in the Passcode box under Set up.",
                                  "esta computadora aún no puede leer la hoja — pon tu ADMIN_PULL_KEY en el campo de contraseña en Configurar.");
    if (why === "nodest") return T("no sheet is connected yet.", "todavía no hay una hoja conectada.");
    if (why === "rejected") return T("the sheet answered but its script does not know this section yet — re-paste the Apps Script and publish a new version.",
                                     "la hoja respondió pero su script no conoce esta sección — vuelve a pegar el Apps Script y publica una nueva versión.");
    return T("could not reach the sheet.", "no se pudo conectar con la hoja.");
  }

  /* ── THE FIVE LENSES, each in the words aogPullEverything already uses so
        one outcome does not get two different sentences. */
  var LENS = {
    reflect: {
      label: function () { return T("Self-reflections", "Autorreflexiones"); },
      noun: function () { return T("self-reflections", "autorreflexiones"); },
      run: function () {
        if (typeof window.pullFromSheet !== "function") return Promise.resolve({ ok: false, why: "rejected" });
        return Promise.resolve(window.pullFromSheet()).then(function () {
          var m = "";
          try { m = (document.getElementById("riPullStatus") || {}).textContent || ""; } catch (e) {}
          return { ok: true, msg: m || T("done.", "listo.") };
        }, function () { return { ok: false }; });
      }
    },
    checkins: {
      label: function () { return T("Check-ins", "Registros"); },
      noun: function () { return T("check-ins", "los registros"); },
      run: function () { return lens("aogPullCheckins", function (r) {
        return "✓ " + (r.count || 0) + " " + T("rows", "filas") + " · " + (r.practice || 0) + " " + T("practice rows.", "filas de práctica.");
      }); }
    },
    exit: {
      label: function () { return T("Exit slips", "Salidas"); },
      noun: function () { return T("exit slips", "las salidas"); },
      run: function () { return lens("aogPullExitSlips", function (r) {
        return "✓ " + (r.count || 0) + " " + T("rows,", "filas,") + " " + (r.added || 0) + " " + T("new.", "nuevas.");
      }); }
    },
    homeobs: {
      label: function () { return T("Home observations", "Observaciones del hogar"); },
      noun: function () { return T("home observations", "las observaciones del hogar"); },
      run: function () { return lens("aogPullHome", function (r) {
        return "✓ " + (r.total || 0) + " " + T("rows,", "filas,") + " " + (r.added || 0) + " " + T("new.", "nuevas.");
      }); }
    },
    homeci: {
      label: function () { return T("Home check-ins", "Registros del hogar"); },
      noun: function () { return T("home check-ins", "los registros del hogar"); },
      run: function () { return lens("aogPullHomeCheckins", function (r) {
        return "✓ " + (r.rows || 0) + " " + T("rows,", "filas,") + " " + (r.added || 0) + " " + T("new.", "nuevas.");
      }); }
    }
  };
  function lens(fnName, fmt) {
    var fn = window[fnName];
    if (typeof fn !== "function") return Promise.resolve({ ok: false, why: "rejected" });
    return Promise.resolve().then(fn).then(function (r) {
      if (r && r.ok) return { ok: true, msg: fmt(r) };
      var msg = (r && r.error) || "";
      if (!msg || /failed to fetch|networkerror|typeerror/i.test(msg)) msg = whyText(r && r.why);
      return { ok: false, msg: msg };
    }, function () { return { ok: false }; });
  }

  /* ── WHICH TAB READS WHICH ROWS. A tab that reads nothing pulled — the
        handouts on Distribute, the roster on My classes, Alignment — is not
        in this table and gets no bar, because a pull there would refresh
        nothing a teacher is looking at. */
  var PANELS = {
    "panel-overview":   ["checkins", "reflect"],
    "panel-students":   ["checkins", "reflect"],
    "panel-home":       ["checkins", "reflect"],
    "panel-growth":     ["checkins", "reflect"],
    "panel-trajectory": ["checkins", "reflect"],
    "panel-goals":      ["checkins", "reflect"],
    "panel-support":    ["checkins"],
    "panel-iep":        ["checkins"],
    "panel-practice":   ["checkins"],
    "panel-daily":      ["checkins"],
    "panel-exitslip":   ["exit"],
    "panel-reflect":    ["reflect"],
    "panel-family":     ["homeobs", "homeci"],
    "panel-homeci":     ["homeci"],
    "panel-export":     ["reflect", "checkins", "exit", "homeobs", "homeci"]
  };
  /* ⚠ THE PRACTICE ROWS RIDE THE CHECK-INS PULL — same request, same sheet
     answer — but "Pull check-ins" on the Practice tab reads like the wrong
     button. Name the rows the teacher came for. */
  var NOUN = {
    "panel-practice": function () { return T("practice rows", "las filas de práctica"); },
    "panel-support":  function () { return T("team check-ins", "los registros del equipo"); },
    "panel-iep":      function () { return T("check-in evidence", "la evidencia de registros"); },
    "panel-export":   function () { return T("everything", "todo"); }
  };
  /* ⚠ ONE DOOR PER LENS PER PANEL. Selector present inside the panel means
     that lens already has a button there; "*" means the panel has the
     everything button and needs nothing from us. */
  var COVER = {
    "#ciPullBtn": "checkins",
    "#xvPull": "exit",
    "#hctPull": "homeci",
    "#riPullBtn": "reflect",
    "#mtssPullBtn": "reflect",
    "#aogPullAllRow": "*"
  };

  function connected() {
    try { if (localStorage.getItem("aog.sync.url")) return true; } catch (e) {}
    try { if (window.AOG_SYNC_DEFAULTS && window.AOG_SYNC_DEFAULTS.url) return true; } catch (e) {}
    try { if (typeof SCHOOL_SYNC_URL === "string" && SCHOOL_SYNC_URL) return true; } catch (e) {}
    return false;
  }

  function phrase(panelId, keys) {
    if (NOUN[panelId]) return NOUN[panelId]();
    var names = keys.map(function (k) { return LENS[k].noun(); });
    if (names.length === 1) return names[0];
    if (names.length === 2) return names[0] + T(" and ", " y ") + names[1];
    return names.slice(0, -1).join(", ") + T(" and ", " y ") + names[names.length - 1];
  }

  function build(panelId, keys, sig) {
    var box = document.createElement("div");
    box.setAttribute("data-aog-pullbar", "1");
    box.setAttribute("data-sig", sig);
    box.style.cssText = "display:flex;align-items:center;gap:12px;flex-wrap:wrap;" +
      "margin:0 0 16px;padding:11px 14px;border:1px solid var(--rule,rgba(10,30,51,.12));" +
      "border-left:4px solid var(--navy,#1B3A5F);border-radius:12px;background:var(--card,#fff)";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("data-aog-pullbtn", "1");
    btn.style.cssText = "background:var(--navy,#1B3A5F);color:#fff;border:0;border-radius:9px;" +
      "padding:9px 15px;font:800 .88rem system-ui,-apple-system,Segoe UI,Roboto,sans-serif;cursor:pointer;min-height:40px";
    btn.textContent = "↻ " + T("Pull " + phrase(panelId, keys) + " from the sheet",
                                    "Traer " + phrase(panelId, keys) + " de la hoja");
    box.appendChild(btn);

    var all = document.createElement("button");
    all.type = "button";
    all.setAttribute("data-aog-pullall", "1");
    all.style.cssText = "background:none;border:0;padding:6px 2px;color:var(--gold-deep,#9a6f24);" +
      "font:700 .82rem system-ui,-apple-system,Segoe UI,Roboto,sans-serif;cursor:pointer;text-decoration:underline";
    all.textContent = T("or pull everything", "o traer todo");
    box.appendChild(all);

    var when = document.createElement("span");
    when.setAttribute("data-aog-pullwhen", "1");
    when.style.cssText = "font:600 .8rem system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--ink-faint,#8b95a3)";
    box.appendChild(when);

    var st = document.createElement("p");
    st.setAttribute("data-aog-pullstatus", "1");
    st.style.cssText = "flex:1 0 100%;margin:2px 0 0;font:600 .84rem system-ui,-apple-system,Segoe UI,Roboto,sans-serif;" +
      "line-height:1.65;white-space:pre-line;color:var(--ink-soft,#5b6675)";
    box.appendChild(st);

    var heldEl = document.createElement("div");
    heldEl.setAttribute("data-aog-heldback", "1");
    heldEl.style.cssText = "flex:1 0 100%;display:none;";
    box.appendChild(heldEl);

    var held = STATE[panelId];
    if (held) { setText(st, held.msg); st.style.color = held.ok ? "var(--green,#2E6B3A)" : "var(--ink-soft,#5b6675)"; }

    btn.addEventListener("click", function () { run(panelId, keys, box); });
    all.addEventListener("click", function () { runAll(panelId, box); });
    paintWhen(box, keys);
    paintHeld(panelId, box);
    return box;
  }

  /* ⚠⚠ .30i3 — WRITE ONLY WHEN THE TEXT ACTUALLY CHANGES, AND THIS IS NOT A
     MICRO-OPTIMISATION. Assigning textContent replaces the text node even
     when the string is identical, which is a childList mutation, which wakes
     this module's own MutationObserver, which re-runs mount(), which repaints
     this label — a self-feeding loop firing every ~80ms for as long as the
     tab is open.
     ⚠⚠ IT ONLY STARTS AFTER A SUCCESSFUL PULL, which is why it survived the
     first round of testing: before one, `ts` is 0 and the label is set to ""
     on an element that is already empty — assigning "" to a childless node
     removes nothing and mutates nothing. The moment a timestamp exists the
     loop begins.
     ⚠⚠ AND IT DOES NOT ONLY COST BATTERY. The declutter layer debounces its
     own scan 90ms behind the last mutation, so a mutation every 80ms
     STARVES IT FOREVER: cards stop getting their Close buttons, closed cards
     stop getting their open buttons, and folding quietly dies across the
     whole dashboard. Measured, not guessed — the practice cards and the
     Overview cards both lost their controls and never recovered.
     ⚠ `.30i0` IS LIVE WITH THIS FAULT. Anyone reading this after a report of
     "the dashboard stopped responding to clicks after I pulled": this is it. */
  function setText(el, v) { if (el && el.textContent !== v) el.textContent = v; }

  function paintWhen(box, keys) {
    var w = box.querySelector("[data-aog-pullwhen]");
    if (!w) return;
    var ts = lastOf(keys);
    setText(w, ts ? T("Last pulled ", "Última vez ") + timeLabel(ts) : "");
  }

  function setStatus(panelId, box, msg, ok) {
    STATE[panelId] = { msg: msg, ok: !!ok };
    var st = box && box.querySelector("[data-aog-pullstatus]");
    if (st) { setText(st, msg); st.style.color = ok ? "var(--green,#2E6B3A)" : "var(--ink-soft,#5b6675)"; }
  }

  /* ══ .30j8 — THE NUMBER HAS TO RECONCILE ══════════════════════════════
     Jimmy: "why is it pulling three but only 2 are coming though?"

     ⚠⚠ BECAUSE ONE OF THE THREE WAS ON THE TOMBSTONE LIST AND WAS DISCARDED
     ON ARRIVAL, SILENTLY. `aog.practice.removed.v1` held
     "JIM BOB THE CREATOR|dd-social-studies-g8-s1|2026-09-07|1" — he removed
     that row earlier, then did the same activity again the same day, and
     [[aog-removal-durability]] did exactly what .30hj built it to do: a
     delete a refresh can undo is not a delete. Nothing was broken.

     ⚠⚠ BUT THE BAR REPORTED THE SHEET'S COUNT AND THE CARD SHOWED THE
     SURVIVORS, AND NOTHING RECONCILED THEM. Two true numbers that disagree,
     with no third sentence, is how a teacher decides the sync is unreliable.

     ⚠ THE TOMBSTONE KEY IS `STUDENT|activityId|DATE|setNo` — DATE-GRAINED.
     Re-doing the same activity on the same day after deleting it is
     therefore invisible by construction. That is the edge this panel exists
     to name; do NOT "fix" it by loosening the key, which would hand back the
     bug .30hj paid for.

     ⚠ THE WAY BACK IS THE EXISTING `restore()`, which takes ROW OBJECTS and
     is the only thing that lifts a tombstone. No second removal engine, no
     second store. */
  function heldRows() {
    try {
      var d = window.aogPracticeDel;
      if (!d || !d.removed || !d.keyOf) return [];
      var raw = JSON.parse(localStorage.getItem("aog.practice.remote") || "[]");
      if (!raw || !raw.length) return [];
      var dead = {};
      (d.removed() || []).forEach(function (k) { dead[String(k)] = 1; });
      return raw.filter(function (r) { return dead[d.keyOf(r)]; });
    } catch (e) { return []; }
  }

  function paintHeld(panelId, box) {
    var el = box && box.querySelector("[data-aog-heldback]");
    if (!el) return;
    var held = (panelId === "panel-practice") ? heldRows() : [];
    var sig = held.map(function (r) { try { return window.aogPracticeDel.keyOf(r); } catch (e) { return ""; } }).join(",");
    if (el.getAttribute("data-sig") === sig) return;   /* never write what is already there */
    el.setAttribute("data-sig", sig);
    if (!held.length) { el.style.display = "none"; el.innerHTML = ""; return; }

    var raw = 0;
    try { raw = (JSON.parse(localStorage.getItem("aog.practice.remote") || "[]") || []).length; } catch (e) {}
    var kept = raw - held.length;
    var lines = held.slice(0, 6).map(function (r) {
      return String(r.studentId || "") + " · " + String(r.activityName || r.activityId || "")
           + " · " + String(r.date || r.timestamp || "").slice(0, 10);
    });
    el.style.display = "";
    el.innerHTML =
      '<div style="margin-top:10px;padding:11px 13px;border:1px solid var(--rule,rgba(10,30,51,.12));'
      + 'border-left:4px solid var(--gold-deep,#9a6f24);border-radius:10px;background:var(--paper,#FCF8F0)">'
      + '<p style="margin:0 0 6px;font:800 .84rem system-ui;color:var(--ink,#0A1E33)">'
      + esc(raw + T(" arrived · ", " llegaron · ") + kept + T(" on this page · ", " en esta página · ")
            + held.length + T(" held back", " retenida(s)")) + '</p>'
      + '<p style="margin:0 0 8px;font:600 .82rem system-ui;line-height:1.6;color:var(--ink-soft,#5b6675)">'
      + esc(T("You removed these here before, and removing is meant to stick — including on the next pull. They stay out until you bring them back.",
              "Las quitaste aquí antes, y quitar debe durar — incluso en la siguiente traída. Se quedan fuera hasta que las traigas de vuelta.")) + '</p>'
      + '<ul style="margin:0 0 9px;padding-left:18px;font:600 .82rem system-ui;line-height:1.65;color:var(--ink,#0A1E33)">'
      + lines.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("")
      + (held.length > lines.length ? "<li>" + esc("+" + (held.length - lines.length) + T(" more", " más")) + "</li>" : "")
      + '</ul>'
      + '<button type="button" data-aog-unremove="1" style="background:var(--navy,#1B3A5F);color:#fff;border:0;'
      + 'border-radius:9px;padding:9px 15px;font:800 .84rem system-ui;cursor:pointer;min-height:40px">'
      + esc(held.length === 1 ? T("Bring back this row", "Recuperar esta fila")
                              : T("Bring back these " + held.length + " rows", "Recuperar estas " + held.length + " filas"))
      + '</button></div>';
    var btn = el.querySelector("[data-aog-unremove]");
    if (btn) btn.addEventListener("click", function () {
      try { window.aogPracticeDel.restore(held); } catch (e) {}
      el.setAttribute("data-sig", "__");   /* force the next paint to redraw */
      paintHeld(panelId, box);
      repaintHost();
    });
  }

  function repaintHost() {
    ["refreshAdmin", "renderSyncStatus", "aogRenderPracticePrintBar", "aogRenderPracticeChart", "aogRenderPractice"]
      .forEach(function (fn) { try { if (typeof window[fn] === "function") window[fn](); } catch (e) {} });
  }

  async function run(panelId, keys, box, auto) {
    var btn = box.querySelector("[data-aog-pullbtn]");
    var label = btn ? btn.textContent : "";
    if (btn) { btn.disabled = true; btn.style.opacity = ".6"; btn.textContent = T("Pulling…", "Trayendo…"); }
    /* ⚠ AN AUTOMATIC CHECK SAYS SO. A status line that appears without being
       asked for, worded exactly like one that was, is the kind of small lie
       that makes a teacher distrust the number next to it. */
    var head = auto ? T("Checked the sheet on arrival.", "Consultó la hoja al llegar.") : "";
    setStatus(panelId, box, auto ? head : T("Pulling…", "Trayendo…"), false);
    var lines = auto ? [head] : [], ok = true;
    for (var i = 0; i < keys.length; i++) {
      var d = LENS[keys[i]];
      var r;
      try { r = await d.run(); } catch (e) { r = { ok: false }; }
      if (r && r.ok) { stamp(keys[i]); lines.push(d.label() + ": " + r.msg); }
      else { ok = false; lines.push(d.label() + ": ⚠ " + ((r && r.msg) || whyText(r && r.why))); }
      setStatus(panelId, box, lines.join("\n"), false);
    }
    setStatus(panelId, box, lines.join("\n"), ok);
    if (btn) { btn.disabled = false; btn.style.opacity = ""; btn.textContent = label; }
    paintWhen(box, keys);
    paintHeld(panelId, box);
    repaintHost();
    schedule();
  }

  /* ⚠ CALLS THE SET-UP BUTTON'S OWN FUNCTION and mirrors its sentences back
     here. Re-implementing the five-in-order sequence would be a second
     copy of the ordering rule, the tombstones and the 1899 time fix. */
  async function runAll(panelId, box) {
    var all = box.querySelector("[data-aog-pullall]");
    if (typeof window.aogPullEverything !== "function") {
      setStatus(panelId, box, T("The everything pull is not available on this build.",
                                "La opción de traer todo no está disponible en esta versión."), false);
      return;
    }
    if (all) { all.disabled = true; all.style.opacity = ".6"; }
    setStatus(panelId, box, T("Pulling everything…", "Trayendo todo…"), false);
    try { await window.aogPullEverything(); } catch (e) {}
    var mirrored = "";
    try { mirrored = (document.getElementById("aogPullAllStatus") || {}).textContent || ""; } catch (e2) {}
    var good = /✓/.test(mirrored) && !/⚠/.test(mirrored);
    Object.keys(LENS).forEach(function (k) { if (good) stamp(k); });
    setStatus(panelId, box, mirrored || T("Done.", "Listo."), good);
    if (all) { all.disabled = false; all.style.opacity = ""; }
    repaintHost();
    schedule();
  }

  function mount() {
    if (busy) return;
    var screen = document.getElementById("screen-admin");
    if (!screen) return;
    var panel = screen.querySelector(".tab-panel.active");
    if (!panel) return;
    var want = PANELS[panel.id];
    var existing = panel.querySelector("[data-aog-pullbar]");
    if (!want || !connected()) { if (existing) existing.remove(); return; }

    var covered = {};
    Object.keys(COVER).forEach(function (sel) {
      if (!panel.querySelector(sel)) return;
      if (COVER[sel] === "*") Object.keys(LENS).forEach(function (k) { covered[k] = 1; });
      else covered[COVER[sel]] = 1;
    });
    var keys = want.filter(function (k) { return !covered[k]; });
    if (!keys.length) { if (existing) existing.remove(); return; }

    var sig = panel.id + "|" + keys.join(",") + "|" + T("en", "es");
    if (existing && existing.getAttribute("data-sig") === sig && panel.firstElementChild === existing) {
      paintWhen(existing, keys);
      paintHeld(panel.id, existing);
      autoPull(panel.id, keys, existing);
      return;
    }
    busy = true;
    var made = null;
    try {
      if (existing) existing.remove();
      made = build(panel.id, keys, sig);
      panel.insertBefore(made, panel.firstChild);
    } catch (e) {} finally { setTimeout(function () { busy = false; }, 0); }
    if (made) autoPull(panel.id, keys, made);
  }

  /* ⚠ THE THROTTLE IS READ FRESH EVERY TIME, never cached: another door may
     have pulled this lens a minute ago and `aog.pull.last.v1` is where that
     is recorded. `tried` is only the per-load failure guard. */
  function autoPull(panelId, keys, box) {
    /* ⚠ 2026-09-09: auto-pull stands down (aog-autopull-switch). Mounting a
       panel no longer refreshes a stale lens by itself — the pull bar still
       shows what is held and when it was last pulled, and its BUTTON still
       pulls. */
    if (window.AOG_AUTOPULL_ENABLED === false) return;
    if (!connected() || busy) return;
    if (STATE[panelId]) return;          /* this tab has already reported something */
    var cut = Date.now() - FRESH_MS;
    var due = keys.filter(function (k) { return !tried[k] && lastOf([k]) < cut; });
    if (!due.length) return;
    keys.forEach(function (k) { tried[k] = 1; });
    try { run(panelId, keys, box, true); } catch (e) {}
  }
  function schedule() { clearTimeout(tid); tid = setTimeout(mount, 80); }

  /* ── "Last pulled" from any door: stamp on every window-level pull. */
  function wrapOne(name, key) {
    var f = window[name];
    if (typeof f !== "function" || f.__aogPbWrapped) return;
    var w = function () {
      var r = f.apply(this, arguments);
      try {
        if (r && typeof r.then === "function") {
          return r.then(function (v) { if (!v || v.ok !== false) stamp(key); return v; });
        }
        stamp(key);
      } catch (e) {}
      return r;
    };
    /* ⚠ CARRY THE FLAGS ACROSS. aog-needs-device-key re-runs its own wrap at
       800ms and 2200ms and skips only when it sees __aogNeedsDeviceKey on
       window.pullFromSheet — drop that property here and it wraps a second
       time. */
    try { Object.keys(f).forEach(function (p) { w[p] = f[p]; }); } catch (e) {}
    w.__aogPbWrapped = 1;
    try { window[name] = w; } catch (e) {}
  }
  function wrapAll() {
    wrapOne("pullFromSheet", "reflect");
    wrapOne("aogPullCheckins", "checkins");
    wrapOne("aogPullExitSlips", "exit");
    wrapOne("aogPullHome", "homeobs");
    wrapOne("aogPullHomeCheckins", "homeci");
  }

  function init() {
    wrapAll();
    mount();
    var screen = document.getElementById("screen-admin");
    if (screen) {
      try {
        new MutationObserver(function () { if (!busy) schedule(); })
          .observe(screen, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
      } catch (e) {}
    }
    try {
      new MutationObserver(function () { schedule(); })
        .observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    } catch (e) {}
    document.addEventListener("click", function (e) {
      if (e.target && e.target.closest && e.target.closest(".tab[data-tab]")) setTimeout(mount, 140);
    });
    /* the late-injected panels — practice, inbox, home check-ins — and the
       sync config, which is read from localStorage after first paint */
    [600, 1400, 3000, 6000].forEach(function (ms) { setTimeout(function () { wrapAll(); mount(); }, ms); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 220); });
  else setTimeout(init, 220);

  window.AOGPullBar = { mount: mount, panels: PANELS, lenses: LENS, last: function () { try { return JSON.parse(localStorage.getItem(LKEY) || "{}"); } catch (e) { return {}; } } };
})();
