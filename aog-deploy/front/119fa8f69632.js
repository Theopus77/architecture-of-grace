
/* Quiet Space Path — calm -> reflect, stress -> yoga (son's idea). ES5, defensive. */
(function () {
  function isES() {
    try { if (typeof lang !== "undefined" && lang === "es") return true; } catch (e) {}
    try { if (typeof GLANG !== "undefined" && GLANG === "es") return true; } catch (e) {}
    return document.documentElement.getAttribute("lang") === "es";
  }
  function tx(en, es) { return isES() ? es : en; }

  /* ---- the fork card shown inside the check-in result ---- */
  window.aogQuietPathCard = function (band, route, L) {
    var es = (L === "es") || isES();
    var calm = (band === "ok");
    var ey = es ? "TU SIGUIENTE PASO" : "YOUR NEXT STEP";
    var title, body, primTxt, primFn, altTxt, altFn;
    if (calm) {
      title  = es ? "Tu mente se siente serena" : "Your mind feels steady";
      body   = es ? "Una mente en calma piensa con más claridad y amabilidad. Es un buen momento para reflexionar." : "A calm mind thinks more clearly and kindly. This is a good moment to reflect.";
      primTxt= es ? "Reflexiona con unas preguntas" : "Reflect with a few questions";
      primFn = "aogQuietPath.reflect()";
      altTxt = es ? "¿Te sientes tenso/a? Prueba movimiento suave" : "Feeling tense instead? Try gentle movement";
      altFn  = "aogQuietPath.yoga()";
    } else {
      title  = es ? "Calmemos el cuerpo primero" : "Let’s settle your body first";
      body   = es ? "Cuando el cuerpo está alterado, pensar con claridad cuesta más. Unos minutos de movimiento suave y respiración primero — y luego la reflexión llega mejor." : "When your body is stirred up, clear thinking is harder. A few minutes of gentle movement and breathing first — then reflection lands better.";
      primTxt= es ? "Empieza yoga y respiración suave" : "Start gentle yoga & breathing";
      primFn = "aogQuietPath.yoga()";
      altTxt = es ? "Prefiero reflexionar ahora" : "I’d rather reflect now";
      altFn  = "aogQuietPath.reflect()";
    }
    return "<div class=\"aogqp-fork " + (calm ? "is-calm" : "is-stress") + "\">" +
        "<div class=\"aogqp-fork-ey\">" + ey + "</div>" +
        "<div class=\"aogqp-fork-t\">" + title + "</div>" +
        "<p class=\"aogqp-fork-b\">" + body + "</p>" +
        "<button type=\"button\" class=\"aogqp-fork-go\" onclick=\"" + primFn + "\">" + primTxt + " <span aria-hidden=\"true\">→</span></button>" +
        "<button type=\"button\" class=\"aogqp-fork-alt\" onclick=\"" + altFn + "\">" + altTxt + "</button>" +
      "</div>";
  };

  /* ---- modal shell ---- */
  function shell(inner) {
    var o = document.getElementById("aogqp-overlay");
    if (!o) {
      o = document.createElement("div");
      o.id = "aogqp-overlay"; o.className = "aogqp-overlay";
      o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true");
      document.body.appendChild(o);
      o.addEventListener("click", function (e) { if (e.target === o) close(); });
      document.addEventListener("keydown", function (e) {
        var ov = document.getElementById("aogqp-overlay");
        if ((e.key === "Escape" || e.keyCode === 27) && ov && ov.classList.contains("open")) close();
      });
    }
    o.innerHTML = "<div class=\"aogqp-modal\">" + inner + "</div>";
    o.classList.add("open");
    document.documentElement.classList.add("aogqp-lock");
    var f = o.querySelector(".aogqp-x"); if (f) { try { f.focus(); } catch (e) {} }
    return o;
  }
  function close() {
    var o = document.getElementById("aogqp-overlay");
    if (o) { o.classList.remove("open"); o.innerHTML = ""; }
    document.documentElement.classList.remove("aogqp-lock");
  }
  function head(t) {
    return "<div class=\"aogqp-head\"><div class=\"aogqp-head-t\">" + t + "</div>" +
      "<button type=\"button\" class=\"aogqp-x\" aria-label=\"" + tx("Close", "Cerrar") + "\" onclick=\"aogQuietPath.close()\">×</button></div>";
  }
  function dots(i, n) { var s = ""; for (var k = 0; k < n; k++) s += "<i class=\"" + (k <= i ? "on" : "") + "\"></i>"; return s; }

  /* ---- guided yoga + breathing (stress path) ---- */
  var YOGA = [
    { ic:"🌳", n:{en:"Ground",es:"Echa raíces"}, breath:false,
      cue:{en:"Sit or stand tall. Feel your feet flat on the floor, and let your shoulders melt down away from your ears.", es:"Siéntate o párate derecho/a. Siente los pies en el suelo y deja caer los hombros lejos de las orejas."} },
    { ic:"🙆", n:{en:"Reach to the sky",es:"Alcanza el cielo"}, breath:true,
      cue:{en:"Breathe in slowly through your nose and float both arms up overhead. Reach a little taller.", es:"Inhala despacio por la nariz y sube los dos brazos por encima de la cabeza. Estírate un poco más."} },
    { ic:"🌊", n:{en:"Soft fold",es:"Suéltate"}, breath:true,
      cue:{en:"Breathe out and let your arms drift down. Let your head and neck go loose, like a rag doll.", es:"Exhala y deja que los brazos bajen. Suelta la cabeza y el cuello, como un muñeco de trapo."} },
    { ic:"🌀", n:{en:"Gentle twist",es:"Giro suave"}, breath:false,
      cue:{en:"Sit tall. Rest one hand on the opposite knee and slowly turn to look behind you. Breathe — then switch sides.", es:"Siéntate derecho/a. Apoya una mano en la rodilla opuesta y gira despacio para mirar atrás. Respira — luego cambia de lado."} },
    { ic:"🍃", n:{en:"Rest forward",es:"Descansa"}, breath:false,
      cue:{en:"Fold gently forward over your lap, or simply rest your hands there. Let everything feel heavy and quiet.", es:"Inclínate suavemente sobre tu regazo, o solo apoya las manos ahí. Deja que todo se sienta pesado y tranquilo."} },
    { ic:"🫧", n:{en:"Calm breath",es:"Respira con calma"}, breath:true,
      cue:{en:"Follow the circle: breathe in as it grows, breathe out as it shrinks. In… and out… three slow times.", es:"Sigue el círculo: inhala cuando crece, exhala cuando se encoge. Adentro… y afuera… tres veces despacio."} }
  ];
  var yi = 0;
  function renderYoga() {
    var e = isES(), s = YOGA[yi], n = YOGA.length, last = (yi === n - 1);
    shell(
      head(tx("Yoga & breathing", "Yoga y respiración")) +
      "<div class=\"aogqp-body\">" +
        "<div class=\"aogqp-dots\">" + dots(yi, n) + "</div>" +
        "<div class=\"aogqp-circle " + (s.breath ? "breathe" : "") + "\" aria-hidden=\"true\">" + s.ic + "</div>" +
        "<div class=\"aogqp-step-n\">" + (e ? s.n.es : s.n.en) + "</div>" +
        "<p class=\"aogqp-step-cue\">" + (e ? s.cue.es : s.cue.en) + "</p>" +
        "<div class=\"aogqp-nav\">" +
          (yi > 0 ? "<button type=\"button\" class=\"aogqp-ghost\" onclick=\"aogQuietPath._yogaPrev()\">" + tx("Back","Atrás") + "</button>" : "") +
          "<button type=\"button\" class=\"aogqp-go\" onclick=\"aogQuietPath._yogaNext()\">" + (last ? tx("I’m done","Terminé") : tx("Next","Siguiente")) + " <span aria-hidden=\"true\">→</span></button>" +
        "</div>" +
      "</div>"
    );
  }
  function renderYogaDone() {
    shell(
      head(tx("Nicely done", "Bien hecho")) +
      "<div class=\"aogqp-body\">" +
        "<div class=\"aogqp-circle\" aria-hidden=\"true\">🌤️</div>" +
        "<div class=\"aogqp-step-n\">" + tx("Notice how you feel now", "Nota cómo te sientes ahora") + "</div>" +
        "<p class=\"aogqp-lead\">" + tx("Your body is a little steadier — and a steadier body makes room for clearer, kinder thinking. Want to carry that into a few reflection questions?", "Tu cuerpo está un poco más en calma — y un cuerpo más calmado deja espacio para pensar con más claridad y amabilidad. ¿Quieres llevarlo a unas preguntas de reflexión?") + "</p>" +
        "<div class=\"aogqp-nav\">" +
          "<button type=\"button\" class=\"aogqp-go\" onclick=\"aogQuietPath._toReflect()\">" + tx("Reflect now","Reflexiona ahora") + " <span aria-hidden=\"true\">→</span></button>" +
          "<button type=\"button\" class=\"aogqp-ghost\" onclick=\"aogQuietPath.close()\">" + tx("I’m finished","He terminado") + "</button>" +
        "</div>" +
      "</div>"
    );
  }

  /* ---- reflection questions (calm path) ---- */
  var QS = [
    {en:"What’s one thing on your mind right now?", es:"¿Qué es una cosa que tienes en la mente ahora mismo?"},
    {en:"What do you actually need in this moment?", es:"¿Qué necesitas de verdad en este momento?"},
    {en:"What’s something you handled today — even something small?", es:"¿Qué manejaste hoy — aunque sea algo pequeño?"},
    {en:"If a friend felt the way you do, what would you say to them?", es:"Si un amigo se sintiera como tú, ¿qué le dirías?"},
    {en:"What’s one kind thing you can do for yourself next?", es:"¿Qué es una cosa amable que puedes hacer por ti a continuación?"}
  ];
  /* Word banks, one per question — Jimmy's call, 2026-08-29: a dysregulated
     child or young adult should not face a blank box that demands writing.
     Tap a word and it lands in the answer; tap again and it leaves. Writing
     stays possible underneath and is never required. Same privacy contract:
     nothing is saved. */
  var WB = [
    [ {en:"School",es:"La escuela"}, {en:"Friends",es:"Los amigos"}, {en:"Family",es:"La familia"}, {en:"Home",es:"La casa"}, {en:"A test or grades",es:"Un examen o las notas"}, {en:"Something that happened",es:"Algo que pasó"}, {en:"How I feel",es:"Cómo me siento"}, {en:"Too many things",es:"Demasiadas cosas"} ],
    [ {en:"Quiet",es:"Silencio"}, {en:"Rest",es:"Descansar"}, {en:"A break",es:"Una pausa"}, {en:"Someone to listen",es:"Alguien que me escuche"}, {en:"Help with something",es:"Ayuda con algo"}, {en:"To move my body",es:"Mover mi cuerpo"}, {en:"Water or food",es:"Agua o comida"}, {en:"Space",es:"Espacio"} ],
    [ {en:"I showed up",es:"Me presenté"}, {en:"I kept trying",es:"Seguí intentando"}, {en:"I asked for help",es:"Pedí ayuda"}, {en:"I stayed calm",es:"Mantuve la calma"}, {en:"I finished something",es:"Terminé algo"}, {en:"I was kind to someone",es:"Fui amable con alguien"}, {en:"I got through a hard moment",es:"Superé un momento difícil"} ],
    [ {en:"You're not alone",es:"No estás solo"}, {en:"I'm here for you",es:"Estoy aquí para ti"}, {en:"It's okay to feel this",es:"Está bien sentir esto"}, {en:"You did your best",es:"Hiciste lo mejor que pudiste"}, {en:"This won't last forever",es:"Esto no durará para siempre"}, {en:"Take a breath",es:"Respira"} ],
    [ {en:"Take a slow breath",es:"Respirar despacio"}, {en:"Drink some water",es:"Tomar agua"}, {en:"Move or stretch",es:"Moverme o estirarme"}, {en:"Rest for a minute",es:"Descansar un minuto"}, {en:"Talk to someone",es:"Hablar con alguien"}, {en:"Listen to music",es:"Escuchar música"}, {en:"Go outside",es:"Salir afuera"}, {en:"Let it go for now",es:"Soltarlo por ahora"} ]
  ];
  function wbWord(w, e) { return e ? w.es : w.en; }
  function wbHas(val, word) { return String(val || "").indexOf(word) !== -1; }
  /* toggle a word in the answer string: add with a comma, remove with its
     separator. The textarea stays the single source of truth, so Edit, the
     responder and the not-saved guarantee all work unchanged. */
  function wbToggle(val, word) {
    val = String(val || "");
    if (wbHas(val, word)) {
      val = val.replace(", " + word, "").replace(word + ", ", "").replace(word, "");
      return val.replace(/^\s+|\s+$/g, "");
    }
    return val.replace(/\s+$/, "") ? (val.replace(/\s+$/, "") + ", " + word) : word;
  }
  var qi = 0, answers = [], refStage = "ask", respTick = 0;
  function saveTA() { var ta = document.getElementById("aogqp-ta"); if (ta) answers[qi] = ta.value; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* ---- on-device gentle responder (private — nothing leaves the page) ----
     Notices feeling words and replies with a warm, validating line. Crisis
     language routes to a caring safety message. No advice-dumping, no scoring. */
  var KW = {
    crisis:      ["kill myself","want to die","wanna die","end it all","end my life","hurt myself","harm myself","cut myself","suicide","suicidal","don't want to be here","dont want to be here","no reason to live","better off without me",
                  "quiero morir","matarme","hacerme daño","lastimarme","suicid","no quiero estar aquí","no quiero vivir","acabar con todo"],
    sad:         ["sad","feeling down","feel down","so down","let down","cry","crying","unhappy","depress","miserable","hopeless","heartbroken","grief","grieving","feeling blue","feel blue",
                  "triste","llor","deprim","desanim","infeliz","sin esperanza","duelo"],
    anger:       ["angry","mad","furious","frustrat","annoyed","irritat","rage","i hate","so mad",
                  "enojad","enfadad","furi","frustrad","molest","rabia","odio","ira"],
    anxious:     ["anxious","anxiety","scared","afraid","fear","worried","worry","worrying","nervous","panic","terrified",
                  "ansios","ansiedad","miedo","asustad","preocup","nervios","pánico","panico","aterr"],
    overwhelmed: ["overwhelm","too much","can't keep up","cant keep up","so much going","drowning","everything at once","under pressure","so stressed","stressed out",
                  "abrumad","demasiado","no puedo con","mucha presión","mucha presion","tanto a la vez"],
    tired:       ["tired","exhaust","sleepy","drained","no energy","worn out","burnt out","burned out","fatigue","so sleepy",
                  "cansad","agotad","sueño","sueno","sin energía","sin energia","fatig"],
    lonely:      ["lonely","alone","no friends","left out","nobody","isolated","by myself","no one likes",
                  "solo","sola","soled","sin amigos","nadie","exclu","aislad"],
    confused:    ["confus","don't know","dont know","unsure","feel lost","mixed up","i'm stuck","im stuck","no idea","can't decide",
                  "confund","no sé","no se que","perdid","atascad","no estoy segur"],
    conflict:    ["fight","argu","bully","bullied","mean to me","made fun","yelled at me","picked on","teased","they said",
                  "pele","discut","acos","burl","gritó","grito","molestaron","se metió","se metio"],
    happy:       ["happy","feel good","feeling good","great","grateful","thankful","excited","proud","calm","peaceful","content","better now","feel better","i love","relieved",
                  "feliz","content","me siento bien","grat","agradec","emocion","orgullos","tranquil","en paz","mejor ahora","me siento mejor","alivi"]
  };
  var RESP = {
    crisis: { cls:"care", ic:"💛", msgs:[
      {en:"What you wrote sounds really heavy, and you don't have to carry it alone. Please tell a grown-up you trust how you're feeling. If it's a lot, in the U.S. you can call or text 988 any time, day or night.",
       es:"Lo que escribiste suena muy pesado, y no tienes que cargarlo solo/a. Por favor, cuéntale a una persona adulta de confianza cómo te sientes. Si es mucho, en EE. UU. puedes llamar o enviar un mensaje al 988 a cualquier hora."} ] },
    sad: { cls:"warm", ic:"🌧️", msgs:[
      {en:"That sounds hard, and it makes sense that it weighs on you. Feelings like this are real — and they move through, they don't stay forever.",
       es:"Eso suena difícil, y tiene sentido que te pese. Sentimientos así son reales — y también pasan, no se quedan para siempre."},
      {en:"Thank you for naming something sad. You don't have to fix it right now; noticing it is already a kindness to yourself.",
       es:"Gracias por nombrar algo triste. No tienes que arreglarlo ahora; notarlo ya es ser amable contigo."} ] },
    anger: { cls:"warm", ic:"🔥", msgs:[
      {en:"Anger usually means something mattered to you. It makes sense — and you can feel it fully without having to act on it right now.",
       es:"El enojo suele significar que algo te importó. Tiene sentido — y puedes sentirlo del todo sin tener que actuar ahora mismo."},
      {en:"That sounds frustrating. Your feelings are allowed; you get to feel them and still choose your next move.",
       es:"Eso suena frustrante. Tus sentimientos están permitidos; puedes sentirlos y aun así elegir tu siguiente paso."} ] },
    anxious: { cls:"warm", ic:"🌬️", msgs:[
      {en:"Worry can feel loud. You're safe in this moment, and you don't have to solve everything at once.",
       es:"La preocupación puede sentirse fuerte. Estás a salvo en este momento, y no tienes que resolverlo todo a la vez."},
      {en:"That sounds scary. Naming the fear is a real step — it often shrinks a little once it's said out loud.",
       es:"Eso suena aterrador. Nombrar el miedo es un paso real — suele encogerse un poco al decirlo en voz alta."} ] },
    overwhelmed: { cls:"warm", ic:"🌊", msgs:[
      {en:"That's a lot to hold at once. You don't have to carry all of it this minute — just the next small thing.",
       es:"Es mucho para sostener a la vez. No tienes que cargarlo todo en este minuto — solo lo siguiente pequeño."} ] },
    tired: { cls:"warm", ic:"🌙", msgs:[
      {en:"Being this tired is your body asking for care, not a flaw in you. Rest counts as doing something.",
       es:"Estar tan cansado/a es tu cuerpo pidiendo cuidado, no una falla tuya. Descansar también es hacer algo."} ] },
    lonely: { cls:"warm", ic:"🌱", msgs:[
      {en:"Feeling alone is painful, and it doesn't mean you're unlovable. Reaching toward one person can be enough.",
       es:"Sentirse solo/a duele, y no significa que no merezcas cariño. Acercarte a una sola persona puede bastar."} ] },
    confused: { cls:"warm", ic:"🧭", msgs:[
      {en:"Not knowing is okay — it's where every answer starts. You don't have to be sure to keep going.",
       es:"No saber está bien — es donde empieza toda respuesta. No tienes que estar seguro/a para seguir."} ] },
    conflict: { cls:"warm", ic:"🤝", msgs:[
      {en:"That sounds like it hurt. How other people act says more about them than about you — your worth isn't theirs to decide.",
       es:"Eso suena a que dolió. Cómo actúan los demás habla más de ellos que de ti — tu valor no lo deciden ellos."} ] },
    happy: { cls:"warm", ic:"🌟", msgs:[
      {en:"That's lovely to notice. Let yourself feel it fully — good moments are worth holding onto.",
       es:"Qué lindo notarlo. Permítete sentirlo del todo — los buenos momentos valen la pena."},
      {en:"Wonderful. Naming what's going well helps it grow.",
       es:"Maravilloso. Nombrar lo que va bien ayuda a que crezca."} ] },
    blank: { cls:"warm", ic:"🌿", msgs:[
      {en:"That's okay — some things don't have words yet. Sitting with the question is enough.",
       es:"Está bien — algunas cosas todavía no tienen palabras. Quedarte con la pregunta ya es suficiente."} ] },
    generic: { cls:"warm", ic:"💫", msgs:[
      {en:"Thank you for putting that into words. Naming what's true is a quiet kind of brave.",
       es:"Gracias por ponerlo en palabras. Nombrar lo que es verdad es una forma callada de valentía."},
      {en:"That's worth noticing. Whatever you're holding, you took a moment to look at it honestly.",
       es:"Eso vale la pena notarlo. Sea lo que sea, te tomaste un momento para mirarlo con honestidad."},
      {en:"Heard. You don't have to have it all figured out — showing up to the question already counts.",
       es:"Te leo. No tienes que tenerlo todo resuelto — presentarte a la pregunta ya cuenta."} ] }
  };
  function qpRespond(text, e) {
    var raw = String(text || "").trim();
    var t = " " + raw.toLowerCase() + " ";
    function has(arr) { for (var i = 0; i < arr.length; i++) { if (t.indexOf(arr[i]) >= 0) return true; } return false; }
    var cat = "generic";
    if (!raw) cat = "blank";
    else {
      var order = ["crisis","sad","anger","anxious","overwhelmed","tired","lonely","confused","conflict","happy"];
      for (var i = 0; i < order.length; i++) { if (has(KW[order[i]])) { cat = order[i]; break; } }
    }
    var bank = RESP[cat] || RESP.generic;
    var m = bank.msgs[respTick % bank.msgs.length]; respTick++;
    return { cls: bank.cls, ic: bank.ic, msg: e ? m.es : m.en };
  }

  function renderReflect() {
    var e = isES(), s = QS[qi], n = QS.length, last = (qi === n - 1), inner;
    if (refStage === "responded") {
      var ans = answers[qi] || "", r = qpRespond(ans, e);
      inner =
        "<div class=\"aogqp-dots\">" + dots(qi, n) + "</div>" +
        "<p class=\"aogqp-q\">" + (e ? s.es : s.en) + "</p>" +
        (ans.replace(/\s/g, "") ? "<div class=\"aogqp-you\">" + esc(ans) + "</div>" : "") +
        "<div class=\"aogqp-resp " + r.cls + "\"><div class=\"aogqp-resp-ic\" aria-hidden=\"true\">" + r.ic + "</div><p>" + r.msg + "</p></div>" +
        "<div class=\"aogqp-nav\">" +
          "<button type=\"button\" class=\"aogqp-ghost\" onclick=\"aogQuietPath._refEdit()\">" + tx("Edit","Editar") + "</button>" +
          "<button type=\"button\" class=\"aogqp-go\" onclick=\"aogQuietPath._refNext()\">" + (last ? tx("Finish","Terminar") : tx("Next","Siguiente")) + " <span aria-hidden=\"true\">→</span></button>" +
        "</div>";
    } else {
      var bank = WB[qi] || [], chips = "";
      for (var wi = 0; wi < bank.length; wi++) {
        var word = wbWord(bank[wi], e), on = wbHas(answers[qi], word);
        chips += "<button type=\"button\" class=\"aogqp-w\" aria-pressed=\"" + (on ? "true" : "false") + "\" onclick=\"aogQuietPath._refWord(" + wi + ")\">" + esc(word) + "</button>";
      }
      inner =
        "<div class=\"aogqp-dots\">" + dots(qi, n) + "</div>" +
        "<p class=\"aogqp-q\">" + (e ? s.es : s.en) + "</p>" +
        (chips ? "<div class=\"aogqp-wb-hint\">" + tx("Tap any words that fit — or write below. Nothing is saved.", "Toca las palabras que encajen — o escribe abajo. Nada se guarda.") + "</div><div class=\"aogqp-wb\">" + chips + "</div>" : "") +
        "<textarea class=\"aogqp-ta\" id=\"aogqp-ta\" placeholder=\"" + tx("Or write if you like… (not saved)", "O escribe si quieres… (no se guarda)") + "\">" + (answers[qi] ? esc(answers[qi]) : "") + "</textarea>" +
        "<div class=\"aogqp-nav\">" +
          (qi > 0 ? "<button type=\"button\" class=\"aogqp-ghost\" onclick=\"aogQuietPath._refPrev()\">" + tx("Back","Atrás") + "</button>" : "") +
          "<button type=\"button\" class=\"aogqp-go\" onclick=\"aogQuietPath._refShare()\">" + tx("Done","Listo") + " <span aria-hidden=\"true\">→</span></button>" +
        "</div>";
    }
    shell(head(tx("A quiet reflection", "Una reflexión tranquila")) + "<div class=\"aogqp-body\">" + inner + "</div>");
  }
  function renderReflectDone() {
    shell(
      head(tx("Thank you", "Gracias")) +
      "<div class=\"aogqp-body\">" +
        "<div class=\"aogqp-circle\" aria-hidden=\"true\">🕊️</div>" +
        "<div class=\"aogqp-step-n\">" + tx("Thank you for taking a quiet moment", "Gracias por tomarte un momento de calma") + "</div>" +
        "<p class=\"aogqp-lead\">" + tx("However today is going, you showed up for yourself. That matters.", "Pase lo que pase hoy, te acompañaste a ti mismo/a. Eso importa.") + "</p>" +
        "<p class=\"aogqp-priv\">" + tx("Nothing here was saved — these thoughts are yours.", "Nada de esto se guardó — estas ideas son tuyas.") + "</p>" +
        "<div class=\"aogqp-nav\">" +
          "<button type=\"button\" class=\"aogqp-go\" onclick=\"aogQuietPath.close()\">" + tx("Done","Listo") + "</button>" +
          "<button type=\"button\" class=\"aogqp-ghost\" onclick=\"aogQuietPath._full()\">" + tx("Take the full Self-Reflection","Hacer la autorreflexión completa") + " <span aria-hidden=\"true\">→</span></button>" +
        "</div>" +
      "</div>"
    );
  }

  window.aogQuietPath = {
    yoga: function () { yi = 0; renderYoga(); },
    reflect: function () { qi = 0; answers = []; refStage = "ask"; renderReflect(); },
    close: close,
    _yogaNext: function () { if (yi >= YOGA.length - 1) renderYogaDone(); else { yi++; renderYoga(); } },
    _yogaPrev: function () { if (yi > 0) { yi--; renderYoga(); } },
    _toReflect: function () { qi = 0; answers = []; refStage = "ask"; renderReflect(); },
    _refShare: function () { saveTA(); refStage = "responded"; renderReflect(); },
    _refWord: function (wi) {
      var e = isES(), bank = WB[qi] || [], w = bank[wi];
      if (!w) return;
      saveTA();
      answers[qi] = wbToggle(answers[qi], wbWord(w, e));
      renderReflect();
    },
    _refEdit: function () { refStage = "ask"; renderReflect(); },
    _refNext: function () { refStage = "ask"; if (qi >= QS.length - 1) renderReflectDone(); else { qi++; renderReflect(); } },
    _refPrev: function () { saveTA(); if (qi > 0) { qi--; refStage = "ask"; renderReflect(); } },
    _full: function () {
      close();
      try { if (typeof startChoose === "function") { startChoose(); return; } } catch (e) {}
      try { if (typeof showScreen === "function") showScreen("screen-choose"); } catch (e) {}
    }
  };
})();
