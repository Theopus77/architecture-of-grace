/* ══ AOG-EF-SLIPS-V1 (2026-10-14) — THINKING SKILLS · THE EXECUTIVE FUNCTION CHECKLISTS ══════════════════════
   Jimmy: "I would like executive function checklist to use for students … shared digitally or printed like the
   other slips are created … some of the best executive functioning checklist, etc."

   ONE source for every executive-function checklist. slip.html loads this file and adds each one to its SLIPS,
   so a checklist is a slip like any other: /slip.html?s=<id>, the same tick-a-step cards and growing pencil
   drawing, the same name buttons, Send to my teacher (checkinType "slip-<id>") and Print this slip. The
   teacher's page /ef reads the same file for its list, its share links and its printed packet.

   Built on the skills the field names (Dawson & Guare's eleven, Barkley's self-regulation model, Diamond's three
   core functions): getting started, planning, organizing, time, focus, flexible thinking, checking my work,
   feelings, remembering, switching, studying, and a weekly look at all of them. The words are for students:
   short steps, "I" sentences, what helps, never what is wrong. Each list is short on purpose — a few steps a
   student can hold, not a lecture. Skipped steps are fine; they show the adult where a hand would help.
   ═══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var NOTE = function (id, en, es) { return { id: id, kind: "note", q: [en, es] }; };
  var CK = function (id, en, es, o) { return { id: id, kind: "check", q: [en, es], o: o }; };
  var TAP = ["Tap each step when you do it. Skipped steps are fine — they show where a hand would help.",
             "Toca cada paso cuando lo hagas. Está bien saltar pasos: muestran dónde te pueden ayudar."];

  /* order = the order on /ef and in the menus. skill/area/why/see/when are for the teacher's page. */
  var EF = [
    { id: "efstart", art: "school", skill: ["Getting started", "Empezar"], area: ["Task initiation", "Iniciar tareas"],
      why: ["Turns a blank page into one small first step.", "Convierte una página en blanco en un primer paso pequeño."],
      see: ["Sits and waits to begin", "Se queda esperando para empezar"],
      when: ["At the start of any task, or when a student sits and waits.", "Al empezar cualquier tarea, o cuando un estudiante se queda esperando."],
      k: ["Thinking skills · Getting started", "Habilidades para pensar · Empezar"], h: ["Getting started", "Para empezar"],
      lead: TAP,
      qs: [CK("ready", "Get ready", "Prepararme", [["Read the directions, or ask to hear them", "Leer las instrucciones, o pedir que me las lean"], ["Say the job in my own words", "Decir la tarea con mis palabras"], ["Get out what I need", "Sacar lo que necesito"]]),
           CK("go", "Go", "Arrancar", [["Pick the very first small step", "Elegir el primer paso pequeño"], ["Start it within two minutes", "Empezarlo en menos de dos minutos"], ["Do the first part, even if it is not perfect", "Hacer la primera parte, aunque no quede perfecta"], ["If I am still stuck, ask for a start", "Si sigo trabado, pedir ayuda para arrancar"]]),
           NOTE("first", "My first small step was… (optional)", "Mi primer paso pequeño fue… (opcional)")] },

    { id: "efplan", art: "school", skill: ["Planning a big assignment", "Planear un trabajo grande"], area: ["Planning and priorities", "Planear y priorizar"],
      why: ["Breaks a project into steps with dates, so it does not pile up at the end.", "Divide un proyecto en pasos con fechas, para que no se acumule al final."],
      see: ["Big projects pile up at the end", "Los proyectos grandes se juntan al final"],
      when: ["The day a project, essay or long assignment is given.", "El día que se asigna un proyecto, ensayo o trabajo largo."],
      k: ["Thinking skills · Planning", "Habilidades para pensar · Planear"], h: ["Planning a big assignment", "Planear un trabajo grande"],
      lead: ["Plan it once, then do one piece at a time. Tap each step when it is done.", "Plánealo una vez y haz una parte a la vez. Toca cada paso cuando lo termines."],
      qs: [CK("see", "See the whole job", "Ver todo el trabajo", [["Write the due date in my planner", "Anotar la fecha de entrega en mi agenda"], ["Read what a finished one looks like (rubric or example)", "Ver cómo se ve terminado (rúbrica o ejemplo)"], ["List the parts of the job", "Hacer una lista de las partes"]]),
           CK("steps", "Make the steps", "Hacer los pasos", [["Put the parts in order", "Poner las partes en orden"], ["Give each part a day to do it", "Darle un día a cada parte"], ["Finish a day early, just in case", "Terminar un día antes, por si acaso"], ["Show my plan to an adult", "Mostrar mi plan a un adulto"]]),
           NOTE("next", "My next step, and when I will do it", "Mi siguiente paso y cuándo lo haré")] },

    { id: "eforg", art: "school", skill: ["Organizing my things", "Organizar mis cosas"], area: ["Organization", "Organización"],
      why: ["A weekly clean-out so papers, folders and tools are where they belong.", "Una limpieza semanal para que papeles, carpetas y útiles estén en su lugar."],
      see: ["Papers and things go missing", "Se pierden papeles y cosas"],
      when: ["Once a week (Friday works well), or after a messy stretch.", "Una vez por semana (el viernes funciona bien), o después de días desordenados."],
      k: ["Thinking skills · Organizing", "Habilidades para pensar · Organizar"], h: ["Backpack and folder clean-out", "Limpieza de mochila y carpetas"],
      lead: ["Ten minutes, once a week. Tap each step when it is done.", "Diez minutos, una vez por semana. Toca cada paso cuando lo termines."],
      qs: [CK("empty", "Empty and sort", "Vaciar y ordenar", [["Take everything out of my backpack", "Sacar todo de mi mochila"], ["Make three piles: keep, file at home, throw away", "Hacer tres montones: guardar, archivar en casa, tirar"], ["Find any homework I have not turned in", "Buscar tarea que no he entregado"]]),
           CK("back", "Put it back", "Volver a guardar", [["Each paper in its subject folder", "Cada papel en la carpeta de su materia"], ["Pencils, eraser and charger in their pocket", "Lápices, borrador y cargador en su bolsillo"], ["Planner on top, where I can see it", "La agenda arriba, donde la vea"], ["Throw out trash and old snacks", "Tirar la basura y la comida vieja"]]),
           NOTE("need", "Supplies I need (optional)", "Útiles que necesito (opcional)")] },

    { id: "eftime", art: "school", skill: ["Managing my time", "Manejar mi tiempo"], area: ["Time management", "Manejo del tiempo"],
      why: ["Makes time visible: guess, time it, check, and learn from the difference.", "Hace visible el tiempo: adivinar, medir, revisar y aprender de la diferencia."],
      see: ["Runs out of time", "Se le acaba el tiempo"],
      when: ["Homework time, work time in class, or any task with a deadline today.", "Al hacer la tarea, en el tiempo de trabajo en clase, o con una entrega hoy."],
      k: ["Thinking skills · Time", "Habilidades para pensar · El tiempo"], h: ["Managing my time", "Manejar mi tiempo"],
      lead: TAP,
      qs: [CK("before", "Before I start", "Antes de empezar", [["Look at everything due today", "Ver todo lo que hay que entregar hoy"], ["Do the most important thing first", "Hacer primero lo más importante"], ["Guess how long it will take", "Adivinar cuánto tiempo tomará"], ["Set a timer", "Poner un temporizador"]]),
           CK("during", "While I work", "Mientras trabajo", [["Check the clock halfway", "Mirar el reloj a la mitad"], ["Take a short break when the timer rings", "Tomar un descanso corto cuando suene"], ["Come back to the same spot", "Volver al mismo lugar"]]),
           { id: "guess", kind: "one", q: ["My guess was…", "Mi cálculo fue…"], o: [["Too short", "Muy corto"], ["About right", "Más o menos bien"], ["Too long", "Muy largo"]] }] },

    { id: "effocus", art: "school", skill: ["Staying focused", "Mantener la atención"], area: ["Sustained attention", "Atención sostenida"],
      why: ["Sets up a space and a plan for coming back when the mind wanders — which every mind does.", "Prepara un espacio y un plan para volver cuando la mente se distrae, como le pasa a todos."],
      see: ["Drifts off during work", "Se distrae durante el trabajo"],
      when: ["Before independent work, reading or homework.", "Antes del trabajo independiente, la lectura o la tarea."],
      k: ["Thinking skills · Focus", "Habilidades para pensar · Atención"], h: ["Staying focused", "Mantener la atención"],
      lead: TAP,
      qs: [CK("space", "Set up my space", "Preparar mi espacio", [["Only today's work on my desk", "Solo el trabajo de hoy en mi escritorio"], ["Phone and games put away", "El teléfono y los juegos guardados"], ["Water, and a fidget or headphones if they help me", "Agua, y algo para las manos o audífonos si me ayudan"]]),
           CK("work", "While I work", "Mientras trabajo", [["Work in a short burst, then a short break", "Trabajar un rato corto y luego descansar un poco"], ["When my mind wanders, notice it and come back", "Cuando mi mente se va, notarlo y volver"], ["Move my body if I need to reset", "Mover mi cuerpo si necesito reiniciar"]]),
           { id: "helped", kind: "pick", max: 3, q: ["What helped me focus?", "¿Qué me ayudó a concentrarme?"], hint: ["Pick up to three.", "Elige hasta tres."], o: [["A quiet spot", "Un lugar tranquilo"], ["A timer", "Un temporizador"], ["Breaks", "Descansos"], ["Music or headphones", "Música o audífonos"], ["Moving my body", "Mover mi cuerpo"], ["Working near someone", "Trabajar cerca de alguien"]] }] },

    { id: "efstuck", art: "school", skill: ["When I'm stuck", "Cuando me trabo"], area: ["Flexible thinking and problem-solving", "Pensamiento flexible y resolver problemas"],
      why: ["A ladder of things to try, from on my own to asking, so stuck turns into a next move.", "Una escalera de cosas para intentar, de solo a pedir ayuda, para que trabarse se vuelva un siguiente paso."],
      see: ["Stops at \"I don't get it\"", "Se detiene en \"no entiendo\""],
      when: ["Any time a student says \"I don't get it\" or stops working.", "Cuando un estudiante dice \"no entiendo\" o deja de trabajar."],
      k: ["Thinking skills · When I'm stuck", "Habilidades para pensar · Cuando me trabo"], h: ["When I'm stuck", "Cuando me trabo"],
      lead: ["Try the steps in order. Being stuck is part of learning. Tap each one you try.", "Intenta los pasos en orden. Trabarse es parte de aprender. Toca cada uno que intentes."],
      qs: [CK("self", "On my own", "Por mi cuenta", [["Take a breath — stuck is okay", "Respirar: está bien trabarse"], ["Read the question again, slowly", "Leer la pregunta otra vez, despacio"], ["Look at an example or my notes", "Mirar un ejemplo o mis apuntes"], ["Try a different way: draw it, act it out, use smaller numbers", "Probar otra forma: dibujarlo, actuarlo, usar números más pequeños"]]),
           CK("ask", "With help", "Con ayuda", [["Skip it and come back later", "Saltarlo y volver después"], ["Ask a classmate", "Preguntar a un compañero"], ["Ask my teacher, and say what I tried", "Preguntar a mi maestro y decir lo que intenté"]]),
           NOTE("where", "Where I got stuck (optional)", "Dónde me trabé (opcional)")] },

    { id: "efcheck", art: "school", skill: ["Checking my work", "Revisar mi trabajo"], area: ["Self-monitoring", "Autorrevisión"],
      why: ["A last look before it goes in, so a student catches their own small slips.", "Una última mirada antes de entregar, para que el estudiante encuentre sus propios errores pequeños."],
      see: ["Hands work in with small mistakes", "Entrega con errores pequeños"],
      when: ["Before turning in classwork, homework, a test or a draft.", "Antes de entregar trabajo de clase, tarea, un examen o un borrador."],
      k: ["Thinking skills · Checking my work", "Habilidades para pensar · Revisar mi trabajo"], h: ["Check before I turn it in", "Revisar antes de entregar"],
      lead: TAP,
      qs: [CK("all", "Is it all there?", "¿Está todo?", [["My name and the date", "Mi nombre y la fecha"], ["Every question answered", "Todas las preguntas contestadas"], ["I did what the directions asked", "Hice lo que pedían las instrucciones"]]),
           CK("right", "Is it my best?", "¿Es lo mejor que puedo?", [["Read it again, start to end", "Leerlo otra vez, de principio a fin"], ["Fix one thing I find", "Arreglar algo que encuentre"], ["Neat enough for someone else to read", "Lo bastante claro para que otro lo lea"], ["Turn it in where it goes", "Entregarlo donde va"]]),
           { id: "sure", kind: "scale", q: ["How sure am I about this work?", "¿Qué tan seguro estoy de este trabajo?"], o: [["Not sure", "No estoy seguro"], ["A little", "Un poco"], ["Mostly", "Casi"], ["Sure", "Seguro"], ["Very sure", "Muy seguro"]] }] },

    { id: "efcalm", art: "house", skill: ["Big feeling, back to work", "Sentimiento grande, de vuelta al trabajo"], area: ["Emotional control", "Manejo de las emociones"],
      why: ["Notice, name, calm, and plan the way back — the feeling is information, not a problem.", "Notar, nombrar, calmarse y planear el regreso: el sentimiento es información, no un problema."],
      see: ["Upset feelings stop the work", "Los sentimientos fuertes detienen el trabajo"],
      when: ["When frustration, worry or upset gets in the way of the work.", "Cuando la frustración, la preocupación o el enojo se interponen con el trabajo."],
      k: ["Thinking skills · Big feelings", "Habilidades para pensar · Sentimientos grandes"], h: ["Big feeling, back to work", "Sentimiento grande, de vuelta al trabajo"],
      lead: ["No one is in trouble. Go one step at a time, and tap each step you do.", "Nadie está en problemas. Ve paso a paso y toca cada paso que hagas."],
      qs: [CK("notice", "Notice it", "Notarlo", [["Notice where I feel it in my body", "Notar dónde lo siento en mi cuerpo"], ["Name the feeling", "Ponerle nombre al sentimiento"], ["Remind myself: feelings pass", "Recordarme: los sentimientos pasan"]]),
           CK("calm", "Calm my body", "Calmar mi cuerpo", [["Three slow breaths", "Tres respiraciones lentas"], ["Use a calm tool, or ask for a short break", "Usar una herramienta para calmarme, o pedir un descanso corto"], ["Get a drink of water", "Tomar agua"]]),
           CK("back", "Come back", "Regresar", [["Pick one small step to do next", "Elegir un paso pequeño para seguir"], ["Ask for help if I need it", "Pedir ayuda si la necesito"]]),
           { id: "now", kind: "scale", q: ["How do I feel now?", "¿Cómo me siento ahora?"], o: [["Still upset", "Todavía molesto"], ["A bit better", "Un poco mejor"], ["Okay", "Bien"], ["Calm", "Tranquilo"], ["Ready to work", "Listo para trabajar"]] }] },

    { id: "efremember", art: "school", skill: ["Remembering what I need", "Recordar lo que necesito"], area: ["Working memory", "Memoria de trabajo"],
      why: ["Moves what to remember out of the head and onto paper, where it stays put.", "Saca de la cabeza lo que hay que recordar y lo pone en papel, donde se queda."],
      see: ["Forgets steps or things", "Olvida pasos o cosas"],
      when: ["When directions have several steps, and at the end of the day.", "Cuando las instrucciones tienen varios pasos, y al final del día."],
      k: ["Thinking skills · Remembering", "Habilidades para pensar · Recordar"], h: ["Remembering what I need", "Recordar lo que necesito"],
      lead: TAP,
      qs: [CK("hear", "When I hear directions", "Cuando escucho instrucciones", [["Look at the speaker and listen to the end", "Mirar a quien habla y escuchar hasta el final"], ["Say the steps back, or ask to hear them again", "Repetir los pasos, o pedir que los repitan"], ["Write the steps down, or check the board", "Anotar los pasos, o mirar la pizarra"]]),
           CK("day", "Before the day ends", "Antes de que termine el día", [["Write homework and dates in my planner", "Anotar la tarea y las fechas en mi agenda"], ["Check my list before I leave", "Revisar mi lista antes de irme"], ["Set a reminder for anything tomorrow", "Poner un recordatorio para lo de mañana"]]),
           NOTE("list", "What I need to remember (optional)", "Lo que necesito recordar (opcional)")] },

    { id: "efswitch", art: "school", skill: ["Switching to something new", "Cambiar a algo nuevo"], area: ["Shifting and transitions", "Transiciones y cambios"],
      why: ["Closes one task cleanly and opens the next, so changes feel smaller.", "Cierra una tarea con calma y abre la siguiente, para que los cambios se sientan más pequeños."],
      see: ["Hard to change activities", "Le cuesta cambiar de actividad"],
      when: ["Between subjects or classes, after recess, or when plans change.", "Entre materias o clases, después del recreo, o cuando cambian los planes."],
      k: ["Thinking skills · Switching", "Habilidades para pensar · Cambiar de actividad"], h: ["Switching to something new", "Cambiar a algo nuevo"],
      lead: TAP,
      qs: [CK("close", "Finish this", "Terminar esto", [["Stop at a good place, or mark where I left off", "Parar en un buen lugar, o marcar dónde me quedé"], ["Put this work away where it goes", "Guardar este trabajo donde va"]]),
           CK("open", "Start the next", "Empezar lo siguiente", [["Check the plan or schedule", "Mirar el plan o el horario"], ["Get out what I need next", "Sacar lo que necesito ahora"], ["One slow breath, then begin", "Una respiración lenta y empezar"]]),
           CK("change", "If plans change", "Si cambian los planes", [["Say it out loud: the plan changed, and I can handle it", "Decirlo: el plan cambió y puedo con esto"], ["Ask what happens now", "Preguntar qué pasa ahora"]])] },

    { id: "efstudy", art: "school", skill: ["My study plan", "Mi plan de estudio"], area: ["Planning and goal-directed persistence", "Planear y perseverar hacia una meta"],
      why: ["Spreads study over several short days and uses practice, not just rereading.", "Reparte el estudio en varios días cortos y usa la práctica, no solo releer."],
      see: ["A test is coming", "Se acerca un examen"],
      when: ["When a test or quiz is announced, a week ahead if possible.", "Cuando se anuncia un examen o prueba, idealmente una semana antes."],
      k: ["Thinking skills · Studying", "Habilidades para pensar · Estudiar"], h: ["My study plan", "Mi plan de estudio"],
      lead: ["Short study on several days beats one long night. Tap each step when it is done.", "Estudiar poco en varios días es mejor que una noche larga. Toca cada paso cuando lo termines."],
      qs: [CK("plan", "Plan it", "Planearlo", [["Write the test date in my planner", "Anotar la fecha del examen en mi agenda"], ["List what the test covers", "Hacer una lista de lo que entra"], ["Pick three or more short study times", "Elegir tres o más ratos cortos para estudiar"]]),
           CK("do", "Study by practicing", "Estudiar practicando", [["Quiz myself or use flashcards", "Hacerme preguntas o usar tarjetas"], ["Explain it to someone, or out loud", "Explicarlo a alguien, o en voz alta"], ["Do practice problems", "Hacer problemas de práctica"], ["Mark what I still miss, and ask about it", "Marcar lo que todavía fallo y preguntar"]]),
           NOTE("hard", "The part I need to practice most (optional)", "La parte que más necesito practicar (opcional)")] },

    { id: "efmorning", art: "house", skill: ["Morning launch", "Salida de la mañana"], area: ["Routines at home", "Rutinas en casa"],
      why: ["The same few steps every morning, so the day starts calm and nothing is left behind.", "Los mismos pasos cada mañana, para empezar el día con calma y sin olvidar nada."],
      see: ["Rushed or late mornings", "Mañanas con prisa o tarde"],
      when: ["Every school morning, at home. Pairs with the bedtime checklist.", "Cada mañana de escuela, en casa. Va con la lista para dormir."],
      k: ["Thinking skills · Morning launch", "Habilidades para pensar · Salida de la mañana"], h: ["Morning launch", "Salida de la mañana"],
      lead: ["Tap each step as you go. A grown-up can do it with you. Your teacher sees it at school.", "Toca cada paso mientras lo haces. Un adulto puede hacerlo contigo. Tu maestro lo verá en la escuela."],
      qs: [CK("me", "Get me ready", "Prepararme", [["Get dressed", "Vestirme"], ["Eat breakfast", "Desayunar"], ["Brush my teeth and hair", "Cepillarme los dientes y el pelo"]]),
           CK("bag", "Get my things ready", "Preparar mis cosas", [["Homework in my folder", "La tarea en mi carpeta"], ["Lunch or lunch money, and water", "El almuerzo o el dinero, y agua"], ["Anything special today (gym clothes, a note, a library book)", "Algo especial de hoy (ropa de gimnasia, una nota, un libro de la biblioteca)"]]),
           CK("go", "Out the door", "Salir", [["Look at the clock: on time", "Mirar el reloj: a tiempo"], ["Coat and shoes for the weather", "Abrigo y zapatos según el clima"], ["One kind word on the way out", "Una palabra amable al salir"]])] },

    /* ── AOG-EF-RULES-V1 (2026-10-15) — Jimmy: "Arbitrary rules cause rebellion. Make executive functioning material
       related to helping stop this." A rule with no reason a student can see takes away choice, and people push back
       to win it back (Brehm's reactance; Deci & Ryan: autonomy, competence, belonging). Three lists answer it: one for
       the moment a rule feels unfair (pause, find the reason, speak up the strong way), one for an adult and a student
       to talk a rule through at a calm time (after Greene's Collaborative & Proactive Solutions: the student's concern
       first, then the adult's, then a plan that works for both), and one for writing a rule that makes sense. The
       adults' side, the reason test and words that invite a yes, is AOG_EF_RULES below. ── */
    { id: "efrule", art: "school", talk: true, skill: ["When a rule feels unfair", "Cuando una regla parece injusta"], area: ["Flexible thinking and speaking up", "Pensamiento flexible y hablar por mí"],
      why: ["Turns \"that's not fair\" into a question and a better idea, instead of a fight.", "Convierte \"no es justo\" en una pregunta y una idea mejor, en vez de una pelea."],
      see: ["Pushes back: \"That's not fair!\"", "Se opone: \"¡No es justo!\""],
      when: ["When a rule or direction feels pointless or unfair. Practice it on a calm day first.", "Cuando una regla o instrucción parece sin sentido o injusta. Practíquenla primero en un día tranquilo."],
      k: ["Thinking skills · When a rule feels unfair", "Habilidades para pensar · Cuando una regla parece injusta"], h: ["When a rule doesn't make sense to me", "Cuando una regla no tiene sentido para mí"],
      lead: ["It is okay to feel a rule is unfair. These steps help you get answers and be heard. Tap each one you try.", "Está bien sentir que una regla es injusta. Estos pasos te ayudan a tener respuestas y a ser escuchado. Toca cada uno que intentes."],
      qs: [CK("pause", "First, pause", "Primero, una pausa", [["Notice the thought: \"This feels unfair\"", "Notar el pensamiento: \"Esto se siente injusto\""], ["Take one slow breath before I answer", "Respirar lento una vez antes de responder"], ["Follow it for now. That does not mean I agree.", "Seguirla por ahora. Eso no quiere decir que estoy de acuerdo."]]),
           CK("why", "Find the reason", "Buscar la razón", [["Guess what it is for: safety, learning, fairness or kindness", "Adivinar para qué es: seguridad, aprendizaje, justicia o amabilidad"], ["Ask: \"Can you help me understand why?\"", "Preguntar: \"¿Me ayuda a entender por qué?\""], ["Listen to the whole answer", "Escuchar toda la respuesta"]]),
           CK("speak", "Speak up the strong way", "Hablar de la forma fuerte", [["Pick a calm time, not in front of everyone", "Elegir un momento tranquilo, no frente a todos"], ["Say what worries me about the rule", "Decir lo que me preocupa de la regla"], ["Offer another way that still keeps the reason", "Proponer otra forma que cumpla la misma razón"]]),
           { id: "sense", kind: "scale", q: ["How much sense does the rule make to me now?", "¿Cuánto sentido tiene la regla para mí ahora?"], o: [["None yet", "Ninguno todavía"], ["A little", "Un poco"], ["Some", "Algo"], ["Most of it", "Casi todo"], ["It makes sense", "Tiene sentido"]] },
           NOTE("idea", "The rule, and my idea for a better way (optional)", "La regla y mi idea para una forma mejor (opcional)")] },

    { id: "eftalk", art: "house", together: true, skill: ["Talking a rule through, together", "Hablar de una regla, juntos"], area: ["Solving problems together", "Resolver problemas juntos"],
      why: ["An adult and a student work out a rule problem at a calm time, so both sides count and the plan is shared.", "Un adulto y un estudiante resuelven un problema con una regla en un momento tranquilo, para que cuenten los dos lados y el plan sea de ambos."],
      see: ["The same rule fight keeps coming back", "La misma pelea por una regla se repite"],
      when: ["At a calm time, never in the moment. About ten minutes, side by side.", "En un momento tranquilo, nunca en el momento del problema. Unos diez minutos, lado a lado."],
      k: ["Thinking skills · Talk it through", "Habilidades para pensar · Hablarlo juntos"], h: ["Let's talk about a rule", "Hablemos de una regla"],
      lead: ["Do this together, when everyone is calm. The student goes first. There are no wrong answers.", "Háganlo juntos, cuando todos estén tranquilos. El estudiante va primero. No hay respuestas incorrectas."],
      qs: [NOTE("rule", "The rule we are talking about", "La regla de la que hablamos"),
           CK("hear", "1 · The student's side", "1 · El lado del estudiante", [["The student says what is hard about the rule", "El estudiante dice qué es difícil de la regla"], ["The adult listens and asks, \"What else?\"", "El adulto escucha y pregunta: \"¿Qué más?\""], ["The adult says it back until the student says, \"Yes, that's it\"", "El adulto lo repite hasta que el estudiante dice: \"Sí, eso es\""]]),
           CK("adult", "2 · The adult's side", "2 · El lado del adulto", [["The adult gives the reason in one sentence", "El adulto da la razón en una frase"], ["The reason is safety, learning, fairness or kindness", "La razón es seguridad, aprendizaje, justicia o amabilidad"]]),
           CK("solve", "3 · Solve it together", "3 · Resolverlo juntos", [["The student offers an idea first", "El estudiante propone una idea primero"], ["We pick a plan that works for both of us", "Elegimos un plan que funcione para los dos"], ["We set a day to check how it is going", "Fijamos un día para ver cómo va"]]),
           { id: "rule2", kind: "one", q: ["What happened to the rule?", "¿Qué pasó con la regla?"], o: [["We kept it, and now it makes sense", "La mantuvimos y ahora tiene sentido"], ["We changed how it works", "Cambiamos cómo funciona"], ["We let it go", "La quitamos"], ["We need more time", "Necesitamos más tiempo"]] },
           NOTE("plan", "Our plan, and the day we check in", "Nuestro plan y el día para revisar")] },

    { id: "efmyrule", art: "school", skill: ["Making a rule that makes sense", "Hacer una regla que tenga sentido"], area: ["Planning and seeing other sides", "Planear y ver otros puntos de vista"],
      why: ["Students write a rule with its reason and test it, so the class owns its rules. Rules students help make are the rules they keep.", "Los estudiantes escriben una regla con su razón y la prueban, para que las reglas sean de la clase. Las reglas que ayudan a hacer son las que cumplen."],
      see: ["The class needs rules, or one keeps getting broken", "La clase necesita reglas, o una se rompe seguido"],
      when: ["At the start of the year, a new term or a class meeting.", "Al inicio del año, de un periodo o en una reunión de clase."],
      k: ["Thinking skills · A rule that makes sense", "Habilidades para pensar · Una regla con sentido"], h: ["A rule that makes sense", "Una regla que tiene sentido"],
      lead: ["A good rule has a reason everyone can say. Write one, then check it.", "Una buena regla tiene una razón que todos pueden decir. Escribe una y luego revísala."],
      qs: [NOTE("rule", "The rule, said as what to do", "La regla, dicha como lo que hay que hacer"),
           NOTE("reason", "What it is for (the reason)", "Para qué sirve (la razón)"),
           CK("test", "Check my rule", "Revisar mi regla", [["It says what to do, not only what not to do", "Dice qué hacer, no solo qué no hacer"], ["Its reason is safety, learning, fairness or kindness", "Su razón es seguridad, aprendizaje, justicia o amabilidad"], ["It is fair to everyone, adults too when it fits", "Es justa para todos, también para los adultos cuando aplica"], ["Someone could keep it even on a hard day", "Alguien podría cumplirla aun en un día difícil"], ["It is short enough to remember", "Es lo bastante corta para recordarla"]]),
           NOTE("fix", "If someone forgets it, how do we help them get back on track?", "Si alguien la olvida, ¿cómo le ayudamos a retomar el camino?")] },

    /* ── AOG-EF-JH-V1 (2026-10-15) — Jimmy: "A lot of behavioral issues in junior high are caused by this." At 11 to 14
       the need for a say and for respect climbs just as school gives less of both (Eccles and Midgley, stage-environment
       fit), and being corrected in front of friends is felt as a public loss (Yeager, Dahl and Dweck). Two lists for
       grades 6-8: keeping your cool when called out in front of people, and turning pushback into a pitch. ── */
    { id: "efpublic", art: "school", talk: true, skill: ["When I'm corrected in front of others", "Cuando me corrigen frente a otros"], area: ["Staying calm when others are watching", "Mantener la calma cuando otros miran"],
      why: ["Being called out in front of friends stings, and teens push back to win back respect. This keeps both the respect and the moment.", "Que te llamen la atención frente a tus amigos duele, y los adolescentes se defienden para recuperar el respeto. Esto cuida el respeto y el momento."],
      see: ["Reacts big when corrected in front of the class", "Reacciona fuerte cuando lo corrigen frente a la clase"],
      when: ["Grades 6 to 8 most of all. Practice it on a calm day. Adults agree to correct in private when they can.", "Sobre todo en los grados 6 a 8. Practíquenla en un día tranquilo. Los adultos acuerdan corregir en privado cuando puedan."],
      k: ["Thinking skills · In front of others", "Habilidades para pensar · Frente a otros"], h: ["When I get called out in front of people", "Cuando me llaman la atención frente a otros"],
      lead: ["Getting corrected in front of people stings. You can keep your respect and stay out of trouble. Tap each step you use.", "Que te corrijan frente a otros duele. Puedes cuidar tu respeto y no meterte en problemas. Toca cada paso que uses."],
      qs: [CK("now", "In the moment", "En el momento", [["Keep my face and voice calm, even if I'm mad inside", "Mantener la cara y la voz tranquilas, aunque por dentro esté enojado"], ["Say something short: \"Okay\" or \"Got it\"", "Decir algo corto: \"Está bien\" o \"Entendido\""], ["Do it now. Save the argument for later.", "Hacerlo ahora. Dejar la discusión para después."]]),
           CK("later", "Later, in private", "Después, en privado", [["Ask: \"Can we talk after class?\"", "Preguntar: \"¿Podemos hablar después de clase?\""], ["Tell what happened from my side", "Contar lo que pasó desde mi lado"], ["Say what felt unfair or embarrassing", "Decir lo que se sintió injusto o vergonzoso"], ["Ask for what would help next time", "Pedir lo que ayudaría la próxima vez"]]),
           { id: "signal", kind: "one", q: ["A quiet signal that would work for me", "Una señal discreta que me funcionaría"], o: [["A tap on the desk", "Un toque en el escritorio"], ["A sticky note", "Una nota adhesiva"], ["A quiet word up close", "Unas palabras en voz baja, de cerca"], ["A look and a nod", "Una mirada y un gesto"], ["Something else", "Otra cosa"]] },
           { id: "kept", kind: "scale", q: ["How well did I keep my cool?", "¿Qué tan bien mantuve la calma?"], o: [["Not this time", "Esta vez no"], ["A little", "Un poco"], ["Partly", "En parte"], ["Mostly", "En gran parte"], ["All the way", "Por completo"]] }] },

    { id: "efpitch", art: "school", skill: ["Pitching a rule change", "Proponer un cambio a una regla"], area: ["Planning, seeing other sides and speaking up", "Planear, ver otros lados y hablar por mí"],
      why: ["Turns pushback into a proposal: the rule, what it protects, a better way and a trial. Students get a real say; adults get a plan they can say yes to.", "Convierte la resistencia en una propuesta: la regla, lo que protege, una forma mejor y una prueba. Los estudiantes tienen voz de verdad; los adultos, un plan al que pueden decir que sí."],
      see: ["Has strong opinions about how things should run", "Tiene ideas firmes sobre cómo deberían ser las cosas"],
      when: ["Grades 6 to 12. Any time a student says a rule is pointless. Set a time to hear the pitch.", "Grados 6 a 12. Cada vez que un estudiante dice que una regla no tiene sentido. Fijen un momento para escuchar la propuesta."],
      k: ["Thinking skills · My pitch", "Habilidades para pensar · Mi propuesta"], h: ["My pitch: change a rule", "Mi propuesta: cambiar una regla"],
      lead: ["A strong pitch shows you understand why the rule exists, then offers something better. Fill it in, then ask for a time to present it.", "Una buena propuesta muestra que entiendes por qué existe la regla y luego ofrece algo mejor. Llénala y pide un momento para presentarla."],
      qs: [NOTE("rule", "The rule I want to change", "La regla que quiero cambiar"),
           NOTE("problem", "The problem it causes, for me or for others", "El problema que causa, para mí o para otros"),
           NOTE("protects", "What the rule is trying to protect", "Lo que la regla intenta proteger"),
           NOTE("idea", "My idea, and how it still protects that", "Mi idea, y cómo sigue protegiendo eso"),
           CK("ready", "Before I pitch it", "Antes de presentarla", [["I can say the adult's side fairly", "Puedo decir el lado del adulto de forma justa"], ["My idea works for the whole class, not only me", "Mi idea funciona para toda la clase, no solo para mí"], ["I suggest a trial: try it for two weeks", "Propongo una prueba: intentarlo dos semanas"], ["I say how we will know if it works", "Digo cómo sabremos si funciona"], ["I ask for a calm time to present it", "Pido un momento tranquilo para presentarla"]])] },

    { id: "efself", self: true, skill: ["My thinking skills this week", "Mis habilidades para pensar esta semana"], area: ["All eleven, as the student sees them", "Las once, como las ve el estudiante"],
      why: ["The student rates each skill, picks one to grow, and picks a checklist to help. It charts on the dashboard.", "El estudiante califica cada habilidad, elige una para crecer y una lista que le ayude. Se grafica en el tablero."],
      see: ["You want the student's own view", "Quieres la mirada del propio estudiante"],
      when: ["Once a week, or at the start and end of a grading period.", "Una vez por semana, o al inicio y al final de un periodo."],
      k: ["Thinking skills · My week", "Habilidades para pensar · Mi semana"], h: ["My thinking skills this week", "Mis habilidades para pensar esta semana"],
      lead: ["Everyone's brain has strong spots and growing spots. Tap how each one went this week. There are no wrong answers.", "Todos los cerebros tienen partes fuertes y partes que crecen. Toca cómo te fue con cada una esta semana. No hay respuestas incorrectas."],
      qs: [] }
  ];

  /* the weekly self-check: one five-step scale per skill, then one to grow and a checklist to try */
  var HOW = [["Hard this week", "Difícil esta semana"], ["Sometimes", "A veces"], ["Getting there", "Casi"], ["Usually", "Casi siempre"], ["A strong spot", "Una parte fuerte"]];
  var SK = [["start", "Getting started on work", "Empezar el trabajo"], ["plan", "Planning big work", "Planear trabajos grandes"], ["org", "Keeping my things organized", "Mantener mis cosas en orden"],
            ["time", "Using my time well", "Usar bien mi tiempo"], ["focus", "Staying focused", "Mantener la atención"], ["flex", "Trying another way when stuck", "Probar otra forma cuando me trabo"],
            ["check", "Checking my work", "Revisar mi trabajo"], ["calm", "Handling big feelings", "Manejar los sentimientos grandes"], ["mem", "Remembering what I need", "Recordar lo que necesito"],
            ["shift", "Switching between things", "Cambiar de una cosa a otra"], ["stick", "Sticking with hard things", "Seguir con las cosas difíciles"]];
  var self = EF[EF.length - 1];
  SK.forEach(function (s) { self.qs.push({ id: s[0], kind: "scale", q: [s[1], s[2]], o: HOW }); });
  self.qs.push({ id: "grow", kind: "one", q: ["The one I want to grow next week", "La que quiero hacer crecer la próxima semana"], o: SK.map(function (s) { return [s[1], s[2]]; }) });
  self.qs.push({ id: "tool", kind: "one", q: ["A checklist that could help", "Una lista que me podría ayudar"],
                 o: EF.slice(0, EF.length - 1).map(function (e) { return [e.skill[0], e.skill[1]]; }) });
  self.qs.push(NOTE("words", "Anything you want your teacher to know? (optional)", "¿Algo que quieras que sepa tu maestro? (opcional)"));

  /* ══ AOG-EF-STRONG-V1 (2026-10-15) — STRENGTH AND CHARACTER FOR BOYS ════════════════════════════════════════════
     Jimmy: "Biblical masculinity." He chose a character tool for boys, then: "Make it secular but with biblical
     undertones. Just make one without biblical references." So no verse, name or prayer appears, and any school can use
     it; the picture of a man underneath is the old one: strength under control, listening before speaking, owning a
     wrong and making it right, courage that protects the one left out, feelings said out loud, leading by serving,
     keeping your word when it costs, growing in mind, body, heart and with people. Never "real men don't…": every step
     says what a strong man does. Written for boys and young men; the steps work for anyone. */
  var SA = function (en, es) { return ["Strength and character · " + en, "Fuerza y carácter · " + es]; };
  var STRONG = [
    { id: "efcontrol", art: "school", skill: ["Strength under control", "Fuerza bajo control"], area: ["Self-control", "Dominio propio"],
      why: ["The strongest person in the room is the one in charge of himself. These steps turn that into what to do when anger rises.", "La persona más fuerte del lugar es la que se domina a sí misma. Estos pasos lo convierten en qué hacer cuando sube el enojo."],
      see: ["Anger turns into shoving, yelling or fists", "El enojo se vuelve empujones, gritos o golpes"],
      when: ["Teach it on a calm day. Use it after a close call, and practice it before the next one.", "Enséñela en un día tranquilo. Úsela después de un momento difícil y practíquela antes del próximo."],
      k: SA("Self-control", "Dominio propio"), h: ["Strength under control", "Fuerza bajo control"],
      lead: ["Strong is not loud. Strong is in charge of himself. Tap each step you use.", "Ser fuerte no es gritar. Ser fuerte es dominarse a uno mismo. Toca cada paso que uses."],
      qs: [CK("notice", "When anger rises", "Cuando sube el enojo", [["Notice it in my body: hot face, tight fists", "Notarlo en mi cuerpo: cara caliente, puños apretados"], ["Hands still, voice low", "Manos quietas, voz baja"], ["Listen first, talk second, get angry last", "Escuchar primero, hablar después, enojarme al último"]]),
           CK("choose", "Choose what a strong man does", "Elegir lo que hace un hombre fuerte", [["Walk away when I need to. That takes strength.", "Alejarme cuando lo necesito. Eso requiere fuerza."], ["Use my strength to help, never to hurt", "Usar mi fuerza para ayudar, nunca para lastimar"], ["Come back calm and talk it out", "Volver tranquilo y hablarlo"]]),
           { id: "control", kind: "scale", q: ["How well did I stay in control?", "¿Qué tan bien me controlé?"], o: [["Not this time", "Esta vez no"], ["A little", "Un poco"], ["Partly", "En parte"], ["Mostly", "En gran parte"], ["All the way", "Por completo"]] }] },

    { id: "efown", art: "school", skill: ["Owning my mistakes", "Hacerme cargo de mis errores"], area: ["Honesty and making it right", "Honestidad y reparación"],
      why: ["Saying \"I did it\" with no excuse, then making it right, is one of the hardest and strongest things a person does. It is how a young man grows.", "Decir \"lo hice\" sin excusas y luego arreglarlo es de lo más difícil y fuerte que hace una persona. Así crece un joven."],
      see: ["Blames others or hides what happened", "Culpa a otros o esconde lo que pasó"],
      when: ["After a mistake, once the heat is gone. Pairs with \"After a hard moment\".", "Después de un error, cuando ya pasó el enojo. Va con \"Después de un momento difícil\"."],
      k: SA("Owning it", "Hacerme cargo"), h: ["Owning my mistakes", "Hacerme cargo de mis errores"],
      lead: ["Everyone gets it wrong sometimes. A strong man owns it and makes it right. Tap each step you do.", "Todos nos equivocamos a veces. Un hombre fuerte se hace cargo y lo arregla. Toca cada paso que hagas."],
      qs: [CK("own", "Own it", "Hacerme cargo", [["Say \"I did it\" with no excuses", "Decir \"lo hice\" sin excusas"], ["Say sorry to the person I hurt, face to face", "Pedir perdón a la persona que lastimé, cara a cara"]]),
           CK("fix", "Make it right", "Arreglarlo", [["Fix it, replace it or pay it back, and then some", "Arreglarlo, reponerlo o devolverlo, y un poco más"], ["Decide what I will do next time", "Decidir qué haré la próxima vez"], ["Start fresh. Yesterday does not decide today.", "Empezar de nuevo. Lo de ayer no decide lo de hoy."]]),
           NOTE("plan", "What I will do next time (optional)", "Lo que haré la próxima vez (opcional)")] },

    { id: "efcourage", art: "school", talk: true, skill: ["Courage to do right", "Valor para hacer lo correcto"], area: ["Courage", "Valor"],
      why: ["Most courage is quiet: saying no when friends say yes, asking respectfully for a fair chance, standing next to the one being picked on. Brave and kind together.", "Casi todo el valor es callado: decir que no cuando los amigos dicen que sí, pedir con respeto una oportunidad justa, ponerse al lado de quien molestan. Valiente y amable a la vez."],
      see: ["Goes along with the group, or stands by when someone is picked on", "Sigue al grupo, o se queda mirando cuando molestan a alguien"],
      when: ["Before a hard week, a new group or a trip. Grades 4 and up.", "Antes de una semana difícil, un grupo nuevo o un viaje. Del grado 4 en adelante."],
      k: SA("Courage", "Valor"), h: ["Courage to do right", "Valor para hacer lo correcto"],
      lead: ["Be strong and brave. Brave can be quiet. Tap each step you take.", "Sé fuerte y valiente. Ser valiente puede ser en silencio. Toca cada paso que des."],
      qs: [CK("no", "Stand firm", "Mantenerme firme", [["Say no, even when my friends say yes", "Decir que no, aunque mis amigos digan que sí"], ["Ask respectfully and offer a fair test", "Pedir con respeto y ofrecer una prueba justa"]]),
           CK("protect", "Protect others", "Proteger a otros", [["Stand with someone who is left out or picked on", "Ponerme al lado de alguien excluido o molestado"], ["Stop and help, even a stranger", "Detenerme y ayudar, aunque sea a un desconocido"], ["Tell a trusted adult when someone could get hurt", "Avisar a un adulto de confianza cuando alguien podría salir lastimado"]]),
           NOTE("brave", "A brave thing I did or want to do (optional)", "Algo valiente que hice o quiero hacer (opcional)")] },

    { id: "effeel", art: "house", talk: true, skill: ["Strong enough to feel", "Lo bastante fuerte para sentir"], area: ["Feelings", "Sentimientos"],
      why: ["Strong men grieve, worry and cry, and say so. Holding it all in does not make a man stronger; saying it out loud to the right person does.", "Los hombres fuertes sienten dolor, preocupación y lloran, y lo dicen. Guardarlo todo no hace a un hombre más fuerte; decirlo a la persona adecuada, sí."],
      see: ["Keeps it all inside, then it comes out sideways", "Se guarda todo y luego le sale de otra forma"],
      when: ["Any time. Good after a loss, a change at home or a hard week.", "En cualquier momento. Bueno después de una pérdida, un cambio en casa o una semana difícil."],
      k: SA("Feelings", "Sentimientos"), h: ["Strong enough to feel", "Lo bastante fuerte para sentir"],
      lead: ["Feelings are not weakness. Strong men feel deeply. Tap each step you try.", "Los sentimientos no son debilidad. Los hombres fuertes sienten mucho. Toca cada paso que intentes."],
      qs: [CK("name", "Name it", "Ponerle nombre", [["Name what I feel: sad, mad, scared, ashamed, lonely", "Decir lo que siento: triste, enojado, con miedo, con vergüenza, solo"], ["It is okay to cry. Strong men do.", "Está bien llorar. Los hombres fuertes lloran."]]),
           CK("share", "Let it out the right way", "Sacarlo de buena manera", [["Write it down, or say it in a quiet moment", "Escribirlo, o decirlo en un momento tranquilo"], ["Talk to a friend I trust", "Hablar con un amigo de confianza"], ["Talk to a man I look up to", "Hablar con un hombre al que admiro"]]),
           { id: "feel", kind: "pick", max: 3, q: ["What I'm feeling most", "Lo que más siento"], o: [["Sad", "Triste"], ["Mad", "Enojado"], ["Scared", "Con miedo"], ["Ashamed", "Con vergüenza"], ["Lonely", "Solo"], ["Okay", "Bien"], ["Glad", "Contento"]] }] },

    { id: "efserve", art: "house", skill: ["Leading by serving", "Liderar sirviendo"], area: ["Service and integrity", "Servicio e integridad"],
      why: ["The greatest leader is the one who serves. A leader keeps his word and works hard when no one is watching.", "El mejor líder es el que sirve. Un líder cumple su palabra y trabaja duro aunque nadie lo vea."],
      see: ["Wants to lead; ready to learn how", "Quiere liderar; listo para aprender cómo"],
      when: ["Once a week, or with a new job in class, on a team or at home.", "Una vez por semana, o con una tarea nueva en clase, en un equipo o en casa."],
      k: SA("Leading", "Liderar"), h: ["Leading by serving", "Liderar sirviendo"],
      lead: ["The greatest leader is the one who serves. Tap each one you did this week.", "El mejor líder es el que sirve. Toca cada una que hiciste esta semana."],
      qs: [CK("serve", "Serve", "Servir", [["Do the job no one wants, without being asked", "Hacer el trabajo que nadie quiere, sin que me lo pidan"], ["Help without needing credit", "Ayudar sin necesitar reconocimiento"], ["Treat girls and women with honor, as I would my own family", "Tratar a las muchachas y mujeres con honra, como a mi propia familia"]]),
           CK("lead", "Lead", "Liderar", [["Keep my word, even when it costs me", "Cumplir mi palabra, aunque me cueste"], ["Work hard at what is in front of me", "Trabajar duro en lo que tengo enfrente"], ["Be an example, even though I am young", "Ser un ejemplo, aunque sea joven"]]),
           NOTE("did", "One way I served this week (optional)", "Una forma en que serví esta semana (opcional)")] },

    { id: "efgrow", self: true, skill: ["Growing strong in four ways", "Crecer fuerte de cuatro formas"], area: ["A weekly look", "Una mirada semanal"],
      why: ["A young man grows in four ways: in mind, in body, in heart and with people. One look a week. It charts on the Dashboard.", "Un joven crece de cuatro formas: en la mente, en el cuerpo, en el corazón y con la gente. Una mirada por semana. Se grafica en el tablero."],
      see: ["You want his own view of how he is growing", "Quiere la mirada del propio joven sobre cómo está creciendo"],
      when: ["Once a week, at home, in a group or with a mentor.", "Una vez por semana, en casa, en un grupo o con un mentor."],
      k: SA("My week", "Mi semana"), h: ["Growing strong this week", "Crecer fuerte esta semana"],
      lead: ["Tap how each one went this week. There are no wrong answers.", "Toca cómo te fue en cada una esta semana. No hay respuestas incorrectas."],
      qs: [] }
  ];
  var GROW = [["mind", "In mind: learning and good choices", "En la mente: aprender y elegir bien"],
              ["body", "In body: sleep, food, moving, self-control", "En el cuerpo: dormir, comer, moverme, dominio propio"],
              ["heart", "In heart: quiet time, thankfulness, what I stand for", "En el corazón: momentos de calma, gratitud, lo que defiendo"],
              ["people", "With people: kindness, respect, friends, family", "Con la gente: amabilidad, respeto, amigos, familia"]];
  var grow = STRONG[STRONG.length - 1];
  GROW.forEach(function (g) { grow.qs.push({ id: g[0], kind: "scale", q: [g[1], g[2]], o: HOW }); });
  grow.qs.push({ id: "next", kind: "one", q: ["The one I want to grow next week", "La que quiero hacer crecer la próxima semana"], o: GROW.map(function (g) { return [g[1].split(":")[0], g[2].split(":")[0]]; }) });
  grow.qs.push(NOTE("step", "One small step I will take (optional)", "Un pequeño paso que daré (opcional)"));
  window.AOG_EF_STRONG = STRONG;
  window.AOG_EF_GROW = GROW;   /* the four parts of the weekly look, for the dashboard's charts */


  /* AOG-EF-RULES-V1 — the adults' side, shown and printed on /ef#rules. The reason test before a rule; words that
     invite a yes (a reason with every rule, a choice inside it, when-then, a calm time to talk). After PBIS (a few rules,
     said as what to do, taught with their reasons), Reeve's autonomy-supportive teaching and Greene's CPS. */
  window.AOG_EF_RULES = {
    test: [["I can say its reason in one sentence.", "Puedo decir su razón en una frase."],
           ["The reason is safety, learning, fairness or kindness, not \"because I said so.\"", "La razón es seguridad, aprendizaje, justicia o amabilidad, no \"porque lo digo yo\"."],
           ["It says what to do.", "Dice qué hacer."],
           ["Students helped make it, or can ask about it.", "Los estudiantes ayudaron a hacerla, o pueden preguntar por ella."],
           ["I keep it the same way, every day, for everyone.", "La aplico igual, cada día, para todos."],
           ["When it is broken, there is a way to fix it, not only a consequence.", "Cuando se rompe, hay una forma de arreglarlo, no solo una consecuencia."],
           ["The class has five rules or fewer.", "La clase tiene cinco reglas o menos."]],
    say: [[["Because I said so.", "Porque lo digo yo."], ["The reason is ___. Want to talk about it at lunch?", "La razón es ___. ¿Quieres que lo hablemos en el almuerzo?"]],
          [["You have to do this now.", "Tienes que hacerlo ahora."], ["This needs to be done. Which part do you want to start with?", "Esto hay que hacerlo. ¿Con qué parte quieres empezar?"]],
          [["If you don't finish, no recess.", "Si no terminas, no hay recreo."], ["When this part is done, then it's recess.", "Cuando termines esta parte, sigue el recreo."]],
          [["Stop arguing.", "Deja de discutir."], ["I hear you. Let's find a calm time to talk it through.", "Te escucho. Busquemos un momento tranquilo para hablarlo."]],
          [["Rules are rules.", "Las reglas son las reglas."], ["If this rule isn't working, let's look at it together.", "Si esta regla no funciona, revisémosla juntos."]]],
    /* AOG-EF-JH-V1 — junior high (grades 6-8), shown at /ef#jh. Eccles and Midgley (stage-environment fit); Yeager, Dahl
       and Dweck (status and respect); Okonofua, Paunesku and Walton, PNAS 2016 (empathic discipline halved suspensions
       in middle school). */
    jh: {
      why: [["At 11 to 14, the need for a say and for respect grows fast. Junior high often gives less of both: more rules, less choice. That mismatch drives much of the pushback.", "Entre los 11 y los 14 años, la necesidad de tener voz y respeto crece rápido. La secundaria suele dar menos de ambas: más reglas, menos opciones. Ese desajuste causa mucha de la resistencia."],
            ["Being seen matters most at this age. A correction in front of friends feels like a public loss, and many students fight to win it back.", "Lo que piensan los demás importa mucho a esta edad. Una corrección frente a los amigos se siente como una derrota pública, y muchos luchan por recuperarse."],
            ["Teens test rules to find out if they are fair. A rule that holds up to the question earns respect.", "Los adolescentes ponen a prueba las reglas para saber si son justas. Una regla que resiste la pregunta gana respeto."],
            ["Respect works. In one middle-school study, teachers who saw students' views as worth hearing cut suspensions in half.", "El respeto funciona. En un estudio en secundaria, los maestros que vieron las opiniones de los estudiantes como dignas de escuchar redujeron las suspensiones a la mitad."]],
      do: [["Correct in private: walk over, speak low, walk away.", "Corrige en privado: acércate, habla bajo, aléjate."],
           ["Give the reason with the rule, every time.", "Da la razón con la regla, siempre."],
           ["Offer a real choice inside the rule.", "Ofrece una opción real dentro de la regla."],
           ["Let students pitch changes, and say yes when you can.", "Deja que propongan cambios y di que sí cuando puedas."],
           ["Repair after a clash: \"I was sharp earlier. Let's reset.\"", "Repara después de un choque: \"Fui brusco antes. Empecemos de nuevo.\""]],
      say: [[["Put that phone away, now! (in front of the class)", "¡Guarda ese teléfono ya! (frente a la clase)"], ["(Up close, quietly) Phone in the bin for work time. You'll have it at the bell.", "(De cerca, en voz baja) El teléfono va a la caja durante el trabajo. Lo tendrás al sonar el timbre."]],
            [["Don't talk back to me.", "No me contestes."], ["You disagree. Tell me after class and I'll listen.", "No estás de acuerdo. Dímelo después de clase y te escucharé."]],
            [["You're being disrespectful.", "Me estás faltando al respeto."], ["That came out sharp. Want to try it again?", "Eso sonó brusco. ¿Quieres intentarlo otra vez?"]],
            [["I don't care whose fault it was.", "No me importa de quién fue la culpa."], ["Tell me what happened from your side first.", "Cuéntame primero lo que pasó desde tu lado."]]]
    }
  };

  window.AOG_EF = EF;
  window.AOG_EF_SELF = SK;   /* the skills on the weekly self-check, for the dashboard's charts */
})();
