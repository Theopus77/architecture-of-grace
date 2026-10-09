/* ══ AOG-SOUNDPICK-V1 (2026-10-09) — Jimmy: "Can the instrument choice also sit right above or below the instruments
   itself, what ever looks better and makes more sense. (Perhaps two drop down menus work as well)".
   The long instrument menu becomes two short ones beside the instrument: first the kind (the menu's own groups: Pianos,
   Organs…; Acoustic, Metal…; Brass, Woodwinds…), then the sound in that kind. The Piano's sit under its keys, as in
   Jimmy's drawing; the Guitar's and the Bass's under the neck; the Band's above its keys, as in his drawing ("Pick a
   section, then play the tune"). The page's own menu (#soundSel) stays in the page, out of sight, and still decides the
   sound: the two menus only set it, and follow it when anything else does (a lesson, a reload, the other language).
   A page loads it with <script src="/aog-soundpick.js" defer></script>. ══ */
(function () {
  "use strict";
  var D = document;
  var WORDS = {
    piano: { kind: ["Kind", "Tipo"], sound: ["Sound", "Sonido"] },
    guitar: { kind: ["Style", "Estilo"], sound: ["Sound", "Sonido"] },
    bass: { kind: ["Style", "Estilo"], sound: ["Sound", "Sonido"] },
    band: { kind: ["Section", "Sección"], sound: ["Instrument", "Instrumento"] }
  };
  function es() { return (D.documentElement.getAttribute("lang") || "en").indexOf("es") === 0; }
  function room() {
    var f = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
    if (/piano|keys/.test(f)) return "piano";
    if (/guitar/.test(f)) return "guitar";
    if (/bass/.test(f)) return "bass";
    if (/band/.test(f)) return "band";
    return "";
  }
  function start() {
    var src = D.getElementById("soundSel"), id = room();
    if (!src || !id || D.getElementById("spRow")) return;
    var oldBlk = src.closest(".blk"), line = D.getElementById("loadLine");
    /* where the two menus go */
    var at, before = false;
    if (id === "piano") at = D.getElementById("kbd");
    else if (id === "band") { var kb = D.getElementById("kbd"); at = kb && kb.closest(".blk") && kb.closest(".blk").querySelector("h2"); }
    else at = D.getElementById("neckBox");
    if (!at || !at.parentNode) return;
    var row = D.createElement("div");
    row.id = "spRow"; row.className = "row sp-row";
    row.innerHTML = '<label class="field"><span class="plab" id="spKindLab"></span><select id="spKind"></select></label>' +
      '<label class="field"><span class="plab" id="spSoundLab"></span><select id="spSound"></select></label>';
    var wrap = D.createElement("div"); wrap.className = "sp-wrap"; wrap.appendChild(row);
    if (line) wrap.appendChild(line);
    /* the page's own menu stays, out of sight: it still makes the sound, and anything that sets it still works */
    var keep = D.createElement("div"); keep.className = "sp-keep"; keep.setAttribute("aria-hidden", "true");
    keep.appendChild(src); src.tabIndex = -1; wrap.appendChild(keep);
    if (before) at.parentNode.insertBefore(wrap, at); else at.parentNode.insertBefore(wrap, at.nextSibling);
    if (oldBlk && !oldBlk.querySelector("input,select,button,.line:not(:empty)")) oldBlk.hidden = true;
    var kind = D.getElementById("spKind"), sound = D.getElementById("spSound");
    function groups() { return [].filter.call(src.children, function (c) { return c.tagName === "OPTGROUP"; }); }
    function groupOf(v) { var g = groups(); for (var i = 0; i < g.length; i++) for (var j = 0; j < g[i].children.length; j++) if (g[i].children[j].value === v) return i; return -1; }
    var sig = "";
    function paint() {
      var g = groups(), gi = Math.max(0, groupOf(src.value)), e = es() ? 1 : 0, w = WORDS[id];
      var s = [e, src.value, g.length, g.map(function (x) { return x.label; }).join("|")].join("·");
      if (s === sig) return; sig = s;
      D.getElementById("spKindLab").textContent = w.kind[e]; D.getElementById("spSoundLab").textContent = w.sound[e];
      kind.innerHTML = g.map(function (x, i) { var o = D.createElement("option"); o.value = String(i); o.textContent = x.label; return o.outerHTML; }).join("");
      kind.value = String(gi);
      sound.innerHTML = g[gi] ? [].map.call(g[gi].children, function (o) { return o.outerHTML; }).join("") : "";
      sound.value = src.value;
      kind.setAttribute("aria-label", w.kind[e]); sound.setAttribute("aria-label", w.sound[e]);
    }
    function pick(v) { if (!v || src.value === v) return; src.value = v; src.dispatchEvent(new Event("change", { bubbles: true })); paint(); }
    kind.addEventListener("change", function () { var g = groups()[+kind.value]; if (g && g.children[0]) pick(g.children[0].value); });
    sound.addEventListener("change", function () { pick(sound.value); });
    src.addEventListener("change", function () { setTimeout(paint, 0); });
    try { new MutationObserver(function () { setTimeout(paint, 0); }).observe(src, { childList: true, subtree: true }); } catch (e) {}
    try { new MutationObserver(function () { sig = ""; paint(); }).observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
    setInterval(function () { if (!D.hidden) paint(); }, 600);   /* a sound set by the page itself, with no event */
    var st = D.createElement("style");
    st.textContent = ".sp-wrap{margin:.7rem 0 .2rem}.sp-row{display:flex;flex-wrap:wrap;gap:.6rem .8rem}.sp-row .field{flex:1 1 12rem;min-width:0}" +
      ".sp-row select{width:100%}.sp-wrap .line{margin-top:.35rem}" +
      ".sp-keep{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}" +
      ".sp-keep select{font-size:16px}";
    (D.head || D.documentElement).appendChild(st);
    paint();
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", start); else start();
})();
