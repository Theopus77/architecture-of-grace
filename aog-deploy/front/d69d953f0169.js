
/* ═══════════════════════════════════════════════════════════════════════
   .30hi — THE DAILY LOG GETS ITS ONE JOB BACK

   Jimmy: "I want a place where ALL MATERIAL that is pulled is in one place.
   The daily log place does a mediocre job at doing that. It confuses me
   A LOT."

   ⚠ HE WAS READING TWO UNRELATED JOBS STACKED IN ONE TAB. The Daily Log is
   a WRITING surface — one adult logging periods, private, on this device.
   Three READING panels pulled from the Sheet had been bolted onto the
   bottom of it over three separate builds (Print a practice record,
   Growth over time, Practice), each mounting straight into #panel-daily.
   Nothing on the screen said where the writing ended and the Sheet began.

   They move to Student view (#panel-home), which is where pulled rows were
   always documented to land — see [[aog-pull-reports]], "rows land in the
   Student view tab". One container, appended once, so the three keep the
   order they already had: print, then chart, then card.

   ⚠ THE HOST IS RESOLVED THROUGH THIS HELPER AND FALLS BACK TO
   #panel-daily. If this script is ever cut, the cards return to where they
   were instead of vanishing — a card that disappears silently is the fault
   this product has paid for more than once. */
(function () {
  /* ⚠⚠ .30hm — THE THREE FROM-THE-SHEET CARDS GET THEIR OWN TAB. Jimmy, on
     the Print-a-practice-record card: "Include a tab for practice sheets."
     They landed on Student view in .30hi because that is where pulled rows
     were documented to go; one tab later that is the same accretion the
     Daily Log suffered — Student view is the student's REPORTS, and printing
     probe sheets is a different job. One tab, one job.
     ⚠ THE PANEL IS BUILT HERE, not in markup, because this helper is what
     every one of the three cards calls to find its home — build the room in
     the same place that hands out the address, or a card renders into a
     panel that does not exist yet.
     ⚠ FALLS BACK to #panel-home and then #panel-daily. A card that vanishes
     silently is the fault this product has paid for more than once. */
  function practicePanel() {
    var p = document.getElementById("panel-practice");
    if (p) return p;
    var any = document.querySelector("#screen-admin .tab-panel");
    if (!any || !any.parentNode) return null;
    p = document.createElement("div");
    p.className = "tab-panel";
    p.id = "panel-practice";
    any.parentNode.appendChild(p);
    return p;
  }
  /* ⚠⚠ .30i2 — THE THREE CARDS ARE PANEL CHILDREN NOW, NOT ONE LUMP.
     Jimmy: "Everything opens or closes together." They used to be appended
     into a #aogSheetCards wrapper, and the declutter layer folds a panel's
     CHILDREN — so it folded the WRAPPER as a single card, cropped all three
     to 84px, and took the strip's title from the first heading inside it. On
     screen that is one closed card called "Print a practice record" with
     Growth over time and the rows table nowhere at all, which reads as data
     loss. Returning the panel itself is the whole fix: each card becomes a
     child, so each gets its own strip, its own name and its own open state.
     ⚠ NOTHING ELSE HAD TO CHANGE. All three mount()s already order
     themselves against each other with insertBefore against the NEXT card,
     so print → chart → rows survives the move, and the pull bar stays the
     panel's first child because it inserts at firstChild.
     ⚠ THE OLD WRAPPER IS DRAINED, NOT ABANDONED. A tab that has been open
     since before this build has three cards inside it; move them out in
     order first or they disappear at the next render. The fold layer's own
     buttons are dropped rather than moved — they belong to a host that is
     about to stop existing. */
  window.aogSheetHost = function () {
    var p = practicePanel() || document.getElementById("panel-home");
    if (!p) return document.getElementById("panel-daily");
    var old = document.getElementById("aogSheetCards");
    if (old) {
      while (old.firstChild) {
        var n = old.firstChild;
        var cls = (n.nodeType === 1 && typeof n.className === "string") ? n.className : "";
        if (/aogfold-[ox]/.test(cls)) { old.removeChild(n); continue; }
        p.appendChild(n);
      }
      if (old.parentNode) old.parentNode.removeChild(old);
    }
    return p;
  };
  /* ⚠ THIS TAB HAS A PANEL, so unlike the Inbox it needs a real click
     handler — and because it is injected AFTER the generic one has bound, it
     must wire its own. Same pattern installTab() uses for Home. */
  function practiceTab() {
    var row = document.querySelector("#screen-admin .tabs");
    if (!row || document.querySelector('#screen-admin .tab[data-tab="practice"]')) return;
    var panel = practicePanel();
    if (!panel) return;
    var isEs = false;
    try { isEs = (typeof dashLang !== "undefined" && dashLang === "es"); } catch (e) {}
    var b = document.createElement("button");
    b.className = "tab";
    b.setAttribute("data-tab", "practice");
    b.setAttribute("data-dl", "dl_t_practice");
    b.textContent = isEs ? "Práctica" : "Practice";
    var more = row.querySelector(".tab-more-wrap");
    if (more) row.insertBefore(b, more); else row.appendChild(b);
    b.addEventListener("click", function () {
      document.querySelectorAll("#screen-admin .tab").forEach(function (x) { x.classList.remove("active"); });
      document.querySelectorAll("#screen-admin .tab-panel").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      panel.classList.add("active");
      try { if (typeof setTabHint === "function") setTabHint("practice"); } catch (e) {}
      try { if (typeof setTabHelp === "function") setTabHelp("practice"); } catch (e) {}
      /* repaint the three, so a tab opened before a pull has current rows */
      ["aogRenderPracticePrintBar", "aogRenderPracticeChart", "aogRenderPractice"].forEach(function (fn) {
        try { if (typeof window[fn] === "function") window[fn](); } catch (e) {}
      });
      try { if (typeof refreshAdmin === "function") refreshAdmin(); } catch (e) {}
    });
    try { if (window.__aogDashModes && window.__aogDashModes.apply) window.__aogDashModes.apply(false); } catch (e) {}
  }
  /* ══ .30hk — THE DAILY LOG RETIRES, AND TEAM BECOMES THE WRITING DOOR ══
     ⚠⚠ RETIRING A TAB WITHOUT MOVING ITS JOB STRANDS THE PERSON. The Daily
     Log was the only visible place to WRITE an observation; the Adult team
     check-in form does the same job and lands in the same store, but it is
     reached from Distribute, which is not where anyone looks mid-lesson. So
     the Team tab gains the door: Log what you saw.
     ⚠ Test a retirement by COMPUTED STYLE, never by a source grep — a dead
     rule is silent and the markup still reads fine. [[aog-retired-switch]] */
  function css() {
    if (document.getElementById("aog-daily-retired-css")) return;
    var st = document.createElement("style");
    st.id = "aog-daily-retired-css";
    st.textContent = '#screen-admin .tab[data-tab="daily"]{display:none !important}';
    (document.head || document.documentElement).appendChild(st);
  }
  /* ⚠ EVERY CALLER THAT ASKED FOR THE DAILY LOG NOW GETS TEAM. Wrapping the
     one function catches them all — the check-in picker's "Log what I saw",
     the Quick tour step, any deep link — instead of hunting call sites and
     missing one. */
  function alias() {
    if (!window.aogQsTab || window.aogQsTab.__dailyRetired) return;
    var orig = window.aogQsTab;
    window.aogQsTab = function (name) {
      return orig.call(this, name === "daily" ? "support" : name);
    };
    window.aogQsTab.__dailyRetired = true;
  }
  /* ⚠ A SAVED ACTIVE TAB OF "daily" WOULD LAND ON A HIDDEN PANEL — the one
     way a returning teacher sees a blank dashboard. Move them to Team. */
  function migrate() {
    try {
      var a = document.querySelector('#screen-admin .tab.active');
      if (a && a.getAttribute("data-tab") === "daily") {
        var t = document.querySelector('#screen-admin .tab[data-tab="support"]');
        if (t) t.click();
      }
    } catch (e) {}
  }
  function door() {
    var host = document.getElementById("panel-support");
    if (!host || document.getElementById("aogDlInboxDoor")) return;
    var T = function (en, es) { try { return (typeof dashLang !== "undefined" && dashLang === "es") ? es : en; } catch (e) { return en; } };
    var box = document.createElement("div");
    box.id = "aogDlInboxDoor";
    box.style.cssText = "margin:0 0 18px;padding:14px 16px;border:1px solid var(--rule,rgba(10,30,51,.12));border-left:4px solid var(--navy,#1B3A5F);border-radius:12px;background:var(--card,#fff)";
    box.innerHTML =
      '<div style="font:800 .68rem system-ui;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft,#5b6675)">'
      + T("Log what you saw", "Registra lo que viste") + "</div>"
      + '<p style="margin:6px 0 10px">' + T(
          "Write what you saw in the adult team check-in. Yours and every colleague’s notes are signed and go into the same record as the trends and the CSV.",
          "Escribe lo que viste en el registro del equipo de adultos. Tus notas y las de cada colega se firman y van al mismo registro que las tendencias y el CSV.") + "</p>"
      + '<a href="#support-checkin" id="aogDlLogBtn" style="display:inline-block;background:var(--navy,#1B3A5F);color:#fff;border-radius:9px;padding:9px 15px;font:800 .88rem system-ui;text-decoration:none;margin-right:8px">'
      + T("Log what you saw", "Registra lo que viste") + " \u2192</a>"
      ;   /* ⚠ .30hl — the Open-the-Inbox button is GONE from here: the Inbox
             is a tab in the bar now, and two doors to one place is the
             clutter [[aog-one-product-language]] rules against. */
    host.insertBefore(box, host.firstChild);
  }
  /* ⚠⚠ THE TEAM VIEW REBUILDS ITS PANEL WHOLESALE — it assigns host.innerHTML
     on every render, so a node inserted once is wiped the first time the tab
     paints. Re-assert on mutation, the same shape the modes layer uses, with
     the same `busy` guard so our own insert cannot loop us. */
  var busy = false;
  function watch() {
    var host = document.getElementById("panel-support");
    if (!host || !window.MutationObserver) return;
    try {
      new MutationObserver(function () {
        if (busy) return;
        if (document.getElementById("aogDlInboxDoor")) return;
        busy = true;
        try { door(); } catch (e) {}
        setTimeout(function () { busy = false; }, 0);
      }).observe(host, { childList: true });
    } catch (e) {}
  }
  /* ══ .30hl — THE INBOX TAB ══
     ⚠ INJECTED LATE ON PURPOSE. The generic handler binds over every .tab at
     init; an element added afterwards never receives it, so this anchor just
     navigates. Do NOT give it a click handler and do NOT create a
     #panel-inbox — the absence of both is what keeps it honest. */
  function inboxTab() {
    var row = document.querySelector("#screen-admin .tabs");
    if (!row || document.querySelector('#screen-admin .tab[data-tab="inbox"]')) return;
    var isEs = false;
    try { isEs = (typeof dashLang !== "undefined" && dashLang === "es"); } catch (e) {}
    var a = document.createElement("a");
    a.className = "tab";
    a.setAttribute("data-tab", "inbox");
    a.setAttribute("data-dl", "dl_t_inbox");
    a.setAttribute("href", "/turnins");
    a.textContent = isEs ? "Bandeja" : "Inbox";
    a.style.textDecoration = "none";
    var more = row.querySelector(".tab-more-wrap");
    if (more) row.insertBefore(a, more); else row.appendChild(a);
    /* AOG-INBOX-EMBED-V1 (2026-09-25) — Jimmy: "Connect the inbox to this tool
       bar so it matches everything else." The tab now opens the Inbox INSIDE the
       dashboard, under the same bar, like Practice. The page itself is the same
       file (turn-ins.html?embed=1), so there is still one Inbox, not two. The
       href stays, so a long-press or new-tab still opens it on its own. */
    a.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      var any = document.querySelector("#screen-admin .tab-panel"); if (!any) return;
      var p = document.getElementById("panel-inboxframe");
      if (!p) {
        p = document.createElement("div"); p.className = "tab-panel"; p.id = "panel-inboxframe";
        p.innerHTML = '<iframe id="aogInboxFrame" title="Inbox" src="turn-ins.html?embed=1" style="display:block;width:100%;min-height:70vh;border:0;border-radius:12px;background:transparent"></iframe>';
        any.parentNode.appendChild(p);
      } else {
        try { var f = document.getElementById("aogInboxFrame"); f.contentWindow.location.reload(); } catch (eR) {}
      }
      document.querySelectorAll("#screen-admin .tab").forEach(function (x) { x.classList.remove("active"); });
      document.querySelectorAll("#screen-admin .tab-panel").forEach(function (x) { x.classList.remove("active"); });
      a.classList.add("active"); p.classList.add("active");
    });
    /* the modes layer positions and shows it from MODES.student; nudge it so
       the first paint does not wait for a mode switch */
    try { if (window.__aogDashModes && window.__aogDashModes.apply) window.__aogDashModes.apply(false); } catch (e) {}
  }
  function boot() { css(); alias(); migrate(); practiceTab(); inboxTab(); door(); watch(); }
  /* frames that report their height (the Inbox, My Blueprint) grow to fit */
  window.addEventListener("message", function (e) {
    if (e.origin !== location.origin || !e.data || !e.data.aogFrameH) return;
    document.querySelectorAll("iframe").forEach(function (f) {
      try { if (f.contentWindow === e.source) f.style.height = (e.data.aogFrameH + 8) + "px"; } catch (x) {}
    });
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 200); });
  else setTimeout(boot, 200);
})();
