
/* ===================================================================
   ITEM 5 · AGES & STAGES — switch the interpretive copy by audience.
   The backend payload is identical; only the frontend copy mapping
   changes. Band is derived from the same score/tier used everywhere.
   =================================================================== */
var AOG_AGES_COPY = {
  child: {
    green: { en: "You\u2019re doing really well right now. You shared lots of good, steady feelings. Keep doing the things that help you feel safe and happy \u2014 and tell a grown-up about the good stuff too.",
             es: "Lo est\u00e1s haciendo muy bien ahora mismo. Compartiste muchos sentimientos buenos y tranquilos. Sigue haciendo las cosas que te ayudan a sentirte seguro/a y feliz \u2014 y cu\u00e9ntale lo bueno a una persona mayor." },
    amber: { en: "Some parts feel good and some feel a little hard right now \u2014 and that\u2019s okay. Everybody has bumpy days. Talking with a grown-up you trust can help things feel lighter.",
             es: "Algunas cosas se sienten bien y otras un poco dif\u00edciles ahora mismo \u2014 y eso est\u00e1 bien. Todos tenemos d\u00edas dif\u00edciles. Hablar con una persona mayor de confianza puede ayudarte a sentirte mejor." },
    red:   { en: "It sounds like things feel really heavy right now. That\u2019s not your fault, and you don\u2019t have to carry it by yourself. Please tell a grown-up you trust how you\u2019re feeling \u2014 they want to help you.",
             es: "Parece que las cosas se sienten muy pesadas ahora mismo. No es tu culpa, y no tienes que cargarlo solo/a. Por favor, cu\u00e9ntale a una persona mayor de confianza c\u00f3mo te sientes \u2014 quieren ayudarte." }
  },
  teen: {
    green: { en: "Your self-reflection looks solid right now. Whatever you\u2019re doing to take care of yourself is working \u2014 it\u2019s worth noticing what those things are so you can keep them going.",
             es: "Tu autorreflexión se ve s\u00f3lido ahora mismo. Lo que sea que est\u00e9s haciendo para cuidarte est\u00e1 funcionando \u2014 vale la pena notar qu\u00e9 es para poder mantenerlo." },
    amber: { en: "This is a mixed read \u2014 some things feel steady, some are weighing on you. That\u2019s normal. It\u2019s a good moment to talk it through with someone you trust before it builds up.",
             es: "Esta es una lectura mixta \u2014 algunas cosas se sienten estables y otras te pesan. Es normal. Es un buen momento para hablarlo con alguien de confianza antes de que se acumule." },
    red:   { en: "This points to a lot of strain right now. That\u2019s real, and it\u2019s worth taking seriously. Reaching out to a trusted adult or counselor isn\u2019t a big deal \u2014 it\u2019s just smart. You don\u2019t have to sort this out alone.",
             es: "Esto apunta a mucha tensi\u00f3n ahora mismo. Es real y vale la pena tomarlo en serio. Acudir a un adulto de confianza o a un consejero no es para tanto \u2014 es lo inteligente. No tienes que resolver esto solo/a." }
  },
  adult: {
    green: { en: "Overall composite sits in the \u201cdoing well\u201d band, with indicators stable across domains. Maintain current supports and use the lowest domain below as a light-touch growth focus at the next window.",
             es: "El compuesto general est\u00e1 en la banda de \u201cva bien\u201d, con indicadores estables en los dominios. Mant\u00e9n los apoyos actuales y usa el dominio m\u00e1s bajo de abajo como un foco de crecimiento ligero en el pr\u00f3ximo per\u00edodo." },
    amber: { en: "Composite falls in the \u201cworth a self-reflection\u201d band \u2014 a mixed profile rather than acute risk. A brief supportive conversation now and monitoring at the next window are appropriate; see the domain detail below for where to focus.",
             es: "El compuesto cae en la banda de \u201cvale una autorreflexión\u201d \u2014 un perfil mixto m\u00e1s que un riesgo agudo. Una conversaci\u00f3n breve de apoyo ahora y seguimiento en el pr\u00f3ximo per\u00edodo son apropiados; revisa el detalle por dominio para enfocar." },
    red:   { en: "Composite is in the \u201cneeds support\u201d band. Recommend a timely, structured self-reflection conversation and, where relevant, a referral pathway. Prioritize the lowest domains below and confirm a trusted-adult connection.",
             es: "El compuesto est\u00e1 en la banda de \u201cnecesita apoyo\u201d. Se recomienda una conversaci\u00f3n de autorreflexión oportuna y estructurada y, cuando corresponda, una v\u00eda de derivaci\u00f3n. Prioriza los dominios m\u00e1s bajos de abajo y confirma una conexi\u00f3n con un adulto de confianza." }
  }
};
window.aogResultsAudience = (function () {
  try { return localStorage.getItem("aog.results.audience") || "adult"; } catch (e) { return "adult"; }
})();
function aogAudienceFromRecord(rec) {
  if (!rec) return "adult";
  if (rec.population === "adult" || rec.grade === "Adult") return "adult";
  var g = rec.grade;
  var sgr = String(g == null ? "" : g).trim().toUpperCase();
  if (sgr === "K" || sgr === "PK" || sgr === "TK" || sgr.indexOf("KIND") === 0) return "child";
  var n = parseInt(sgr, 10);
  if (!isNaN(n)) return n <= 5 ? "child" : "teen";
  if (typeof aogGradeToBand === "function") {
    var b = aogGradeToBand(g);
    if (b === "K–2" || b === "3–5") return "child";
    if (b) return "teen";
  }
  return "adult";
}
window.aogSetAudience = function (a) {
  window._aogAudUserChose = true;
  window.aogResultsAudience = a;
  try { localStorage.setItem("aog.results.audience", a); } catch (e) {}
  var btns = document.querySelectorAll("#agesToggle .ages-btn");
  for (var i = 0; i < btns.length; i++) {
    var on = btns[i].getAttribute("data-aud") === a;
    btns[i].classList.toggle("active", on);
    btns[i].setAttribute("aria-pressed", on ? "true" : "false");
  }
  if (typeof aogRenderAgesPanel === "function") aogRenderAgesPanel();
};
window.aogRenderAgesPanel = function () {
  var panel = document.getElementById("aogAgesPanel");
  var wrap = document.getElementById("agesToggleWrap");
  if (!panel) return;
  var rec = window._lastResult || window._pendingRecord;
  if (!rec) { panel.innerHTML = ""; panel.style.display = "none"; if (wrap) wrap.style.display = "none"; return; }
  if (wrap) wrap.style.display = "";
  var es = (typeof lang !== "undefined" && lang === "es");
  var nc = (rec.normComposite != null) ? rec.normComposite : null;
  var tier = rec.tier || (typeof tierFromNormComposite === "function" && nc != null ? tierFromNormComposite(nc) : "Some Risk");
  var band = tier === "Low Risk" ? "green" : (tier === "High Risk" ? "red" : "amber");
  if (!window._aogAudUserChose && typeof aogAudienceFromRecord === "function") { window.aogResultsAudience = aogAudienceFromRecord(rec); }
  var aud = window.aogResultsAudience || "adult";
  /* reflect the active button (covers first render + language switches) */
  var btns = document.querySelectorAll("#agesToggle .ages-btn");
  for (var i = 0; i < btns.length; i++) {
    var on = btns[i].getAttribute("data-aud") === aud;
    btns[i].classList.toggle("active", on);
    btns[i].setAttribute("aria-pressed", on ? "true" : "false");
  }
  var entry = AOG_AGES_COPY[aud] && AOG_AGES_COPY[aud][band];
  var copy = entry ? (entry[es ? "es" : "en"]) : "";
  var head = es ? "Qu\u00e9 significa esto" : "What this means";
  panel.style.display = "";
  panel.className = "ages-panel band-" + band;
  panel.innerHTML = "<div class=\"ages-panel-h\">" + head + "</div><p class=\"ages-panel-p\">" + copy + "</p>";
};
