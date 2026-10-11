
/* ============================================================================
   THE GOAL BUILDER → IEP PROGRESS HANDOFF, MADE VISIBLE — 2026-08-25.

   Jimmy: "Could the IEP Progress be enhanced and maybe merged with the Grace
   goal builder (i think it does not make sense)."

   ⚠ THE BRIDGE ALREADY EXISTED. #aoggTrackIep → window.aogIepFromGoalBuilder()
   carries the student, maps the competency to an IEP area, lifts the Annual
   goal line out of the generated text, opens the Progress Monitor's wizard
   pre-filled and switches to that tab. Nothing needed building. It was simply
   impossible to notice, for two reasons that are the same reason:

     1. It sits in the DOM BEFORE #aoggOut. You press "Generate goal &
        objectives", the goal renders BELOW, you scroll down to read it — and
        the one button that does the next thing is now off-screen behind you.
     2. Its own pre-fill reads window.__aoggText, which does not exist until
        you have generated. So at the only moment it is in view, it is also the
        moment it would do the least.

   The fix is placement, not code: the button MOVES to the end of the generated
   output, and only exists once there is something to track. Same move-the-node
   technique as everywhere else this session — it keeps its id, its handler and
   its bilingual relabel in aogIepRender.

   Do NOT "fix" this by writing a second Track button. There is one.
============================================================================ */
(function () {
  function el(id) { return document.getElementById(id); }
  function es() { try { return (document.documentElement.getAttribute("lang") || "en").slice(0,2) === "es"; } catch (e) { return false; } }
  function T(en, esx) { return es() ? esx : en; }

  function injectCss() {
    if (el("aogGoalHandoffCss")) return;
    var st = document.createElement("style");
    st.id = "aogGoalHandoffCss";
    st.textContent = [
      "#aogTrackWrap{margin:22px 0 0;padding:16px 18px;border-radius:12px;",
      "background:var(--cream,#FBF8F1);border:1px solid var(--rule,#E4DAC5);}",
      "#aogTrackWrap .th-t{font-size:13.5px;font-weight:700;color:var(--navy,#0A1E33);margin:0 0 4px;}",
      "#aogTrackWrap .th-s{font-size:12.5px;line-height:1.6;color:var(--ink-soft,#5b6675);margin:0 0 12px;max-width:66ch;}",
      "#aogTrackWrap #aoggTrackIep{margin-top:0 !important;}",
      "@media print{#aogTrackWrap{display:none;}}"
    ].join("");
    document.head.appendChild(st);
  }

  function paintCopy() {
    var w = el("aogTrackWrap"); if (!w) return;
    var t = w.querySelector(".th-t"), sub = w.querySelector(".th-s");
    if (t) t.textContent = T("Written. Now track it.", "Escrita. Ahora dale seguimiento.");
    if (sub) sub.textContent = T(
      "This carries the student, the competency and the goal statement straight into the IEP Progress Monitor, where you set a baseline and a target and start charting against the aimline. You write the goal once.",
      "Esto lleva al estudiante, la competencia y la meta directo al Monitor de Progreso IEP, donde defines una línea base y un objetivo y empiezas a graficar contra la línea objetivo. La meta se escribe una sola vez.");
  }

  /* The button belongs after the thing it acts on, and only once that exists. */
  function place() {
    var btn = el("aoggTrackIep"), out = el("aoggOut");
    if (!btn || !out) return;
    var ready = !out.hasAttribute("hidden") && (out.textContent || "").trim().length > 0;
    if (!ready) {
      /* Nothing generated: keep it out of the way rather than offering a
         handoff that would carry an empty goal. */
      btn.style.display = "none";
      var w0 = el("aogTrackWrap"); if (w0) w0.style.display = "none";
      return;
    }
    injectCss();
    var wrap = el("aogTrackWrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "aogTrackWrap";
      wrap.innerHTML = '<p class="th-t"></p><p class="th-s"></p>';
      paintCopy();
    }
    wrap.style.display = "";
    btn.style.display = "";
    if (btn.parentNode !== wrap) wrap.appendChild(btn);
    if (wrap.parentNode !== out.parentNode || wrap.previousElementSibling !== out) {
      out.parentNode.insertBefore(wrap, out.nextSibling);
    }
    paintCopy();
  }

  /* ------------------------------------------------------------ the signpost
     Jimmy: "If I am building a goal, shouldn't I have the option of reading,
     math, writing, behavioral, functional… like I can do in IEP Progress?"

     No — and the reason is worth saying on the page rather than leaving him to
     infer it. The Grace Goal Builder writes ONE kind of goal: relationship-
     centered SEL, aligned to the Illinois SEL Learning Standards. That is the
     whole point of it and why its competency list is The Pause, Repair and so
     on. The IEP Progress Monitor tracks ANY goal, which is why its wizard
     offers Academic (Math / Reading / Writing), Functional and Transition, each
     with its own starter bank.

     So for a reading goal you start in IEP Progress, not here. Nobody could
     have known that from the page, which is the actual defect. */
  function signpost() {
    var host = el("aoggOut");
    if (!host || !host.parentNode || el("aoggScope")) return;
    injectCss();
    var p = document.createElement("p");
    p.id = "aoggScope";
    p.style.cssText = "font-size:12.5px;line-height:1.6;color:var(--ink-soft,#5b6675);" +
      "margin:0 0 16px;padding:11px 14px;border-left:3px solid var(--gold,#D9A33B);" +
      "background:var(--rule-soft,#EFEADB);border-radius:0 10px 10px 0;max-width:74ch;";
    paintScope(p);
    host.parentNode.insertBefore(p, host);
  }
  function paintScope(node) {
    var p = node || el("aoggScope"); if (!p) return;
    p.innerHTML = es()
      ? "<b>Esto escribe metas socioemocionales.</b> Para una meta de lectura, matemáticas, escritura, funcional o de transición, empieza en <b>Progreso IEP</b> — su asistente tiene bancos de metas iniciales para cada una, y se registran y grafican igual."
      : "<b>This writes SEL goals</b> — relationship-centered, aligned to the Illinois SEL Learning Standards. For a <b>reading, math, writing, functional or transition</b> goal, start in <b>IEP Progress</b> instead: its wizard has a starter bank for each, and they chart the same way.";
  }

  function go() { try { place(); signpost(); paintScope(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
  setTimeout(go, 800); setTimeout(go, 2400);

  /* aogGoalGen() fills #aoggOut and clears its hidden attribute; watch for both. */
  try {
    var out = el("aoggOut");
    if (out) new MutationObserver(go).observe(out, { attributes: true, attributeFilter: ["hidden"], childList: true, subtree: true });
    new MutationObserver(function () { paintCopy(); go(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  } catch (e) {}

  window.AOGGoalHandoff = { place: place };
})();
