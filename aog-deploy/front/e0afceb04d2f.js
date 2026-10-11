
(function () {
  function ensure() {
    var pr = document.getElementById("printReport");
    if (!pr || !pr.innerHTML) return;                 /* nothing is printing */
    /* ⚠⚠ AOG-PRINTMARK-V2 — THE MARK RIDES THE CONTENT, NOT THE VIEWPORT.
       The old `.aog-printwm` here was position:fixed. Blink repeats a fixed
       layer on every printed page; WebKit does NOT — it resolves the box once
       against the whole document and the container's own overflow:hidden then
       clips the bands away. Jimmy printed a sheet from his iPhone and got no
       mark at all. Hanging a clipped layer inside blocks that already exist in
       the record sheet's flow takes the engine out of the question. */
    var HOSTS = ".rs-sheet,.pp-sheet,.rs-box,.pp-act,.pp-tbl,.rs-over,.rs-sign,.pp-sign";
    var hosts = pr.querySelectorAll(HOSTS), i, h, kid, mark;
    for (i = 0; i < hosts.length; i++) {
      h = hosts[i];
      for (kid = h.firstElementChild; kid; kid = kid.nextElementSibling)
        if (kid.className === "aog-cwm") { h = null; break; }
      if (!h) continue;
      h.setAttribute("data-aogcwm", "1");
      mark = document.createElement("div");
      mark.className = "aog-cwm" + (h.getBoundingClientRect().height < 150 ? " sm" : "");
      mark.setAttribute("aria-hidden", "true");
      mark.innerHTML = "<b></b>";
      mark.firstChild.textContent = "ARCHITECTURE OF GRACE";
      h.appendChild(mark);
    }
    if (pr.querySelector(".aog-printbrand")) return;  /* brand already carried */
    var bd = document.createElement("div");
    bd.className = "aog-printbrand"; bd.setAttribute("aria-hidden", "true");
    bd.innerHTML = '<span class="mk">A</span>ARCHITECTURE OF GRACE &middot; architectureofgrace.com';
    pr.appendChild(bd);
  }
  /* every print path sets #printReport, then calls window.print() synchronously,
     so beforeprint fires with the sheets already in place */
  try { window.addEventListener("beforeprint", ensure); } catch (e) {}
  try {
    var mq = window.matchMedia("print");              /* Safari's route */
    if (mq.addEventListener) mq.addEventListener("change", function (e) { if (e.matches) ensure(); });
    else if (mq.addListener) mq.addListener(function (e) { if (e.matches) ensure(); });
  } catch (e2) {}
  window.aogDdPrintWm = ensure;                        /* testable */
})();
