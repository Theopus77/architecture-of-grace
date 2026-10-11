
/* ===================================================================
   RIGHT NOW — in-the-moment rescue read.
   Measures STATE (this moment), not trait (lately). Four taps route to
   one matched, practical micro-intervention. Built on the same tank
   classes + the grace-breathe orb. Child/Teen/Adult, EN/ES.
   Centerpiece teaching: a feeling is a wave (~90s); the Critic is the
   story that re-lights the fuse.
   =================================================================== */
(function () {
  var ROOT = "rightNow";
  var picks = {};

  /* ---- question + option copy, by audience + language ---- */
  var RN_TIER = { k2: "child", "35": "child", "68": "teen", "912": "teen", adult: "adult" };
  var RN_COPY = {
    adult: {
      en: {
        sub: "Something hard happening right now? Get one practical thing to do this minute.",
        ey: "An in-the-moment read", h: "What’s happening right now?",
        intro: "Something just got hard? This isn’t about your week — it’s about right now. Four quick taps, and you’ll get one practical thing to do this minute. Private, instant, saved nowhere.",
        q1: "Right now, my body feels…", q2: "The voice in my head right now is…", q3: "My thinking right now is…", q4: "And right now it feels…",
        opts: { "1": { hyper: "Revved / tight", window: "Pretty settled", hypo: "Heavy / numb" },
                "2": { quiet: "Quiet / kind", nag: "Nagging", loud: "Loud", rail: "Won’t stop — railing me" },
                "3": { clear: "Clear", scattered: "Scattered", loop: "Stuck on a loop", fog: "Foggy / blank" },
                "4": { small: "Pretty small", wave: "Like a wave", big: "Big", over: "Taking over" } },
        btn: "Show me one thing"
      },
      es: {
        sub: "¿Algo difícil ahora mismo? Recibe una cosa práctica para hacer en este minuto.",
        ey: "Una lectura del momento", h: "¿Qué está pasando ahora mismo?",
        intro: "¿Algo se acaba de poner difícil? Esto no es sobre tu semana — es sobre ahora mismo. Cuatro toques rápidos y recibirás una cosa práctica para hacer en este minuto. Privado, instantáneo, no se guarda nada.",
        q1: "Ahora mismo, mi cuerpo se siente…", q2: "La voz en mi cabeza ahora mismo está…", q3: "Mi pensamiento ahora mismo está…", q4: "Y ahora mismo se siente…",
        opts: { "1": { hyper: "Acelerado / tenso", window: "Bastante tranquilo", hypo: "Pesado / adormecido" },
                "2": { quiet: "Tranquila / amable", nag: "Insistente", loud: "Fuerte", rail: "No para — me ataca" },
                "3": { clear: "Claro", scattered: "Disperso", loop: "Atascado en un bucle", fog: "Nublado / en blanco" },
                "4": { small: "Bastante pequeño", wave: "Como una ola", big: "Grande", over: "Me domina" } },
        btn: "Muéstrame una cosa"
      }
    },
    teen: {
      en: {
        sub: "Something just hit? Get one thing to actually do this minute.",
        ey: "An in-the-moment read", h: "What’s happening right now?",
        intro: "Something just hit? This isn’t about your whole week — just right now. Four quick taps and you get one thing to actually do this minute. Private, instant, nothing saved.",
        q1: "Right now, my body feels…", q2: "The voice in my head right now is…", q3: "My head right now is…", q4: "And right now it feels…",
        opts: { "1": { hyper: "Revved / tight", window: "Pretty chill", hypo: "Heavy / numb" },
                "2": { quiet: "Quiet / kind", nag: "Nagging", loud: "Loud", rail: "Won’t shut up — going off on me" },
                "3": { clear: "Clear", scattered: "All over the place", loop: "Stuck on one thing", fog: "Foggy / blank" },
                "4": { small: "Pretty small", wave: "Like a wave", big: "Big", over: "Taking over" } },
        btn: "Show me one thing"
      },
      es: {
        sub: "¿Algo te acaba de golpear? Recibe una cosa para hacer en este minuto.",
        ey: "Una lectura del momento", h: "¿Qué está pasando ahora mismo?",
        intro: "¿Algo te acaba de golpear? Esto no es sobre toda tu semana — solo ahora mismo. Cuatro toques rápidos y recibes una cosa para hacer en este minuto. Privado, instantáneo, no se guarda nada.",
        q1: "Ahora mismo, mi cuerpo se siente…", q2: "La voz en mi cabeza ahora mismo está…", q3: "Mi cabeza ahora mismo está…", q4: "Y ahora mismo se siente…",
        opts: { "1": { hyper: "Acelerado / tenso", window: "Bastante tranquilo", hypo: "Pesado / adormecido" },
                "2": { quiet: "Tranquila / amable", nag: "Insistente", loud: "Fuerte", rail: "No se calla — me ataca" },
                "3": { clear: "Claro", scattered: "Por todos lados", loop: "Atascado en una cosa", fog: "Nublado / en blanco" },
                "4": { small: "Bastante pequeño", wave: "Como una ola", big: "Grande", over: "Me domina" } },
        btn: "Muéstrame una cosa"
      }
    },
    child: {
      en: {
        sub: "Is something hard right now? Let’s do one thing that helps.",
        ey: "A right-now check", h: "What’s happening right now?",
        intro: "Is something hard right now? Tap what feels true. Then we’ll do one thing to help — right now.",
        q1: "Right now, my body feels…", q2: "The voice in my head is…", q3: "My brain right now is…", q4: "And my feeling is…",
        opts: { "1": { hyper: "Fast / jumpy", window: "Calm", hypo: "Heavy / tired" },
                "2": { quiet: "Kind / quiet", nag: "A little grumpy", loud: "Loud and mean", rail: "Yelling at me" },
                "3": { clear: "Clear", scattered: "All mixed up", loop: "Stuck on one thing", fog: "Foggy / far away" },
                "4": { small: "Little", wave: "Medium", big: "Big", over: "Really, really big" } },
        btn: "Show me what helps"
      },
      es: {
        sub: "¿Algo es difícil ahora mismo? Hagamos una cosa que ayude.",
        ey: "Una autorreflexión de ahora", h: "¿Qué pasa ahora mismo?",
        intro: "¿Algo es difícil ahora mismo? Toca lo que sientas verdadero. Luego haremos una cosa para ayudar — ahora mismo.",
        q1: "Ahora mismo, mi cuerpo se siente…", q2: "La voz en mi cabeza está…", q3: "Mi cerebro ahora mismo está…", q4: "Y mi sentimiento es…",
        opts: { "1": { hyper: "Rápido / inquieto", window: "Tranquilo", hypo: "Pesado / cansado" },
                "2": { quiet: "Amable / tranquila", nag: "Un poco gruñona", loud: "Fuerte y mala", rail: "Me grita" },
                "3": { clear: "Claro", scattered: "Todo revuelto", loop: "Atascado en una cosa", fog: "Nublado / lejos" },
                "4": { small: "Pequeño", wave: "Mediano", big: "Grande", over: "Muy, muy grande" } },
        btn: "Muéstrame qué ayuda"
      }
    }
  };

  /* ---- matched advice, by route + audience + language ---- */
  var RN_ADVICE = {
    critic: {
      adult: {
        en: { title: "That’s the Critic — not the verdict.", lead: "What you’re feeling is a wave. The hard part crests and clears faster than it feels — often in about 90 seconds. What stretches it out is the voice, not the truth. Three moves:",
              steps: ["One long breath out — longer than the breath in. Do it twice.", "Name it: “that’s the Critic talking,” not the facts. You can even give it a name.", "Say to yourself what you’d say to a friend this voice was hammering. That’s your Coach."] },
        es: { title: "Esa es la Crítica — no el veredicto.", lead: "Lo que sientes es una ola. Lo más duro sube y se va más rápido de lo que parece — a menudo en unos 90 segundos. Lo que lo alarga es la voz, no la verdad. Tres pasos:",
              steps: ["Una exhalación larga — más larga que la inhalación. Hazlo dos veces.", "Nombra: “es la Crítica hablando,” no los hechos. Hasta puedes ponerle un nombre.", "Dite lo que le dirías a un amigo al que esa voz estuviera atacando. Esa es tu Guía."] }
      },
      teen: {
        en: { title: "That’s the Critic, not the truth.", lead: "This is a wave — the worst of it usually passes in about 90 seconds. What keeps it going is the voice in your head, not what’s actually true. Try this:",
              steps: ["Breathe out slow, longer than you breathe in. Twice.", "Call it out: that’s the Critic, not facts.", "Say to yourself what you’d say to a friend it was going off on."] },
        es: { title: "Esa es la Crítica, no la verdad.", lead: "Esto es una ola — lo peor suele pasar en unos 90 segundos. Lo que lo mantiene es la voz en tu cabeza, no lo que de verdad es cierto. Prueba esto:",
              steps: ["Exhala despacio, más tiempo del que inhalas. Dos veces.", "Dilo: esa es la Crítica, no los hechos.", "Dite lo que le dirías a un amigo al que estuviera atacando."] }
      },
      child: {
        en: { title: "That’s the grumpy voice — not the real you.", lead: "Big feelings come like waves. They get really big… and then they get smaller. Let’s help it get smaller:",
              steps: ["Take a slow breath out, like blowing out a candle. Two times.", "Tell the grumpy voice: “you’re not the boss of me.”", "Say something kind to yourself, like you would to a friend."] },
        es: { title: "Esa es la voz gruñona — no el verdadero tú.", lead: "Los sentimientos grandes vienen como olas. Se hacen muy grandes… y luego se hacen más pequeños. Ayudémoslo a hacerse pequeño:",
              steps: ["Sopla despacio, como apagando una vela. Dos veces.", "Dile a la voz gruñona: “no mandas en mí.”", "Dite algo amable, como se lo dirías a un amigo."] }
      }
    },
    storm: {
      adult: {
        en: { title: "Your system is revved — let’s bring it down.", lead: "This is a surge of energy, and it will pass. Right now your job isn’t to think clearly — it’s to come down a notch. Three moves:",
              steps: ["Make your exhale longer than your inhale — that’s the brake. A few rounds.", "Both feet on the floor. Name five things you can see.", "Move the energy: push against a wall, shake out your hands, take a short walk."] },
        es: { title: "Tu sistema está acelerado — vamos a bajarlo.", lead: "Esto es una oleada de energía, y va a pasar. Ahora mismo tu trabajo no es pensar claro — es bajar un nivel. Tres pasos:",
              steps: ["Haz tu exhalación más larga que la inhalación — ese es el freno. Varias veces.", "Los dos pies en el piso. Nombra cinco cosas que puedas ver.", "Mueve la energía: empuja una pared, sacude las manos, camina un poco."] }
      },
      teen: {
        en: { title: "Fired up? Let’s cool the engine.", lead: "That’s a surge, and surges pass. You don’t have to fix anything yet — just come down a level:",
              steps: ["Long breath out, longer than in. A few times.", "Feet on the floor. Name five things you can see.", "Burn it off — push a wall, shake your hands, walk it out."] },
        es: { title: "¿Encendido? Enfriemos el motor.", lead: "Eso es una oleada, y las oleadas pasan. No tienes que arreglar nada todavía — solo baja un nivel:",
              steps: ["Exhala largo, más que al inhalar. Varias veces.", "Pies en el piso. Nombra cinco cosas que puedas ver.", "Suéltala — empuja una pared, sacude las manos, camina."] }
      },
      child: {
        en: { title: "Your body is going really fast — let’s slow it down.", lead: "Your body has a lot of zoom right now. Let’s help it slow down:",
              steps: ["Blow out slow, like blowing bubbles. A few times.", "Press your feet into the floor and find five things you can see.", "Wiggle it out — push the wall or shake your hands."] },
        es: { title: "Tu cuerpo va muy rápido — vamos a frenarlo.", lead: "Tu cuerpo tiene mucha energía ahora. Ayudémoslo a ir despacio:",
              steps: ["Sopla despacio, como haciendo burbujas. Varias veces.", "Aprieta los pies en el piso y busca cinco cosas que puedas ver.", "Suéltalo — empuja la pared o sacude las manos."] }
      }
    },
    fog: {
      adult: {
        en: { title: "Quiet and far away? Let’s gently come back.", lead: "Numb and foggy is the body pulling back. You don’t need big energy — just one small signal that you’re here:",
              steps: ["Stand up and feel your feet. Take a sip of water.", "Name five sounds you can hear right now.", "Move something small — stretch, step outside, feel sun or cool air on your skin."] },
        es: { title: "¿Callado y lejos? Volvamos con calma.", lead: "El adormecimiento y la niebla son el cuerpo replegándose. No necesitas mucha energía — solo una señal pequeña de que estás aquí:",
              steps: ["Ponte de pie y siente tus pies. Toma un sorbo de agua.", "Nombra cinco sonidos que puedas escuchar ahora.", "Mueve algo pequeño — estírate, sal afuera, siente el sol o el aire fresco."] }
      },
      teen: {
        en: { title: "Feeling numb or blank? Let’s reconnect.", lead: "Going numb is the body checking out for a bit. Small signals bring you back — no big energy needed:",
              steps: ["Stand up, feel your feet, drink some water.", "Name five sounds around you.", "Small move — stretch, step outside, splash some water on your face."] },
        es: { title: "¿Adormecido o en blanco? Reconectemos.", lead: "El adormecimiento es el cuerpo desconectándose un rato. Las señales pequeñas te traen de vuelta:",
              steps: ["Ponte de pie, siente tus pies, toma agua.", "Nombra cinco sonidos a tu alrededor.", "Movimiento pequeño — estírate, sal afuera, mójate la cara."] }
      },
      child: {
        en: { title: "Feeling far away or sleepy inside? Let’s wake your body up gently.", lead: "Sometimes our body gets quiet and far away. Let’s help it come back:",
              steps: ["Stand up and wiggle your toes. Take a sip of water.", "Find five sounds you can hear.", "Stretch up tall like a tree, then shake your hands."] },
        es: { title: "¿Lejos o con sueño por dentro? Despertemos tu cuerpo con calma.", lead: "A veces nuestro cuerpo se pone callado y lejano. Ayudémoslo a volver:",
              steps: ["Ponte de pie y mueve los dedos de los pies. Toma un sorbo de agua.", "Busca cinco sonidos que puedas escuchar.", "Estírate alto como un árbol, luego sacude las manos."] }
      }
    },
    loop: {
      adult: {
        en: { title: "Stuck on a loop? Let’s loosen it.", lead: "Replaying the same thought won’t solve it — it just deepens the groove. The move is to change your state, not win the argument:",
              steps: ["Say it as “I’m having the thought that…” — that little gap is freedom.", "Give it a time: “I’ll think about this at 5pm,” then set it down.", "Change the channel physically — a different room, cold water, one song."] },
        es: { title: "¿Atascado en un bucle? Vamos a aflojarlo.", lead: "Repetir el mismo pensamiento no lo resuelve — solo profundiza el surco. El paso es cambiar tu estado, no ganar la discusión:",
              steps: ["Dilo como “estoy teniendo el pensamiento de que…” — ese pequeño espacio es libertad.", "Ponle hora: “lo pensaré a las 5,” y suéltalo.", "Cambia el canal físicamente — otro cuarto, agua fría, una canción."] }
      },
      teen: {
        en: { title: "Caught in a loop? Let’s break it.", lead: "Looping the same thought just digs the groove deeper. Don’t win the argument — change your state:",
              steps: ["Reword it: “I’m having the thought that…”", "Park it — “I’ll deal with this later,” pick a time.", "Change something — new room, cold water, a song."] },
        es: { title: "¿Atrapado en un bucle? Vamos a romperlo.", lead: "Repetir el mismo pensamiento solo cava más hondo. No ganes la discusión — cambia tu estado:",
              steps: ["Reformúlalo: “estoy teniendo el pensamiento de que…”", "Apárcalo — “lo veré más tarde,” elige una hora.", "Cambia algo — otro cuarto, agua fría, una canción."] }
      },
      child: {
        en: { title: "Is your brain stuck on the same thing? Let’s change it.", lead: "Sometimes a thought gets stuck and goes round and round. Let’s help it move:",
              steps: ["Tell your brain: “not right now.”", "Do something different — draw, jump, get a drink of water.", "Find one thing that makes you smile."] },
        es: { title: "¿Tu cerebro está atascado en lo mismo? Vamos a cambiarlo.", lead: "A veces un pensamiento se atasca y da vueltas y vueltas. Ayudémoslo a moverse:",
              steps: ["Dile a tu cerebro: “ahora no.”", "Haz algo diferente — dibuja, salta, toma agua.", "Busca una cosa que te haga sonreír."] }
      }
    },
    steady: {
      adult: {
        en: { title: "A steady moment — worth noticing.", lead: "Good — notice it. Steady is a skill, and noticing it makes it easier to find your way back next time.",
              steps: ["Name one thing keeping you steady right now.", "Take one slow breath and let yourself feel okay for a second.", "If someone near you is struggling, this is a good moment to offer a little steadiness."] },
        es: { title: "Un momento estable — vale la pena notarlo.", lead: "Bien — nótalo. La estabilidad es una habilidad, y notarla hace más fácil volver a encontrarla la próxima vez.",
              steps: ["Nombra una cosa que te mantiene estable ahora mismo.", "Toma una respiración lenta y permítete sentirte bien por un momento.", "Si alguien cerca de ti la está pasando mal, es un buen momento para ofrecer un poco de calma."] }
      },
      teen: {
        en: { title: "A pretty good moment right now.", lead: "Nice — worth noticing. Catching the steady moments makes them easier to find again.",
              steps: ["Notice one thing that’s helping right now.", "Take a slow breath and just let it be okay.", "Maybe check in on someone who isn’t having as good a day."] },
        es: { title: "Un buen momento ahora mismo.", lead: "Bien — vale la pena notarlo. Captar los momentos estables hace más fácil volver a encontrarlos.",
              steps: ["Nota una cosa que te está ayudando ahora.", "Toma una respiración lenta y deja que esté bien.", "Tal vez pregunta cómo está alguien que no tiene un día tan bueno."] }
      },
      child: {
        en: { title: "A good moment right now!", lead: "That’s great — let’s notice the good feeling so it’s easier to find again.",
              steps: ["Notice one thing that feels nice right now.", "Take a slow, happy breath.", "Maybe share a smile with someone."] },
        es: { title: "¡Un buen momento ahora mismo!", lead: "¡Qué bien! — notemos el sentimiento bueno para que sea más fácil encontrarlo otra vez.",
              steps: ["Nota una cosa que se siente bien ahora.", "Toma una respiración lenta y feliz.", "Tal vez comparte una sonrisa con alguien."] }
      }
    }
  };

  /* privacy + nav labels (audience-agnostic) */
  var RN_PRIV = { en: "Private · not tracked · nothing you tap is saved.", es: "Privado · sin seguimiento · nada de lo que tocas se guarda." };
  var RN_NAV  = { en: "Quiet Space", es: "Espacio tranquilo" };

  /* per-route: a raw affirmation, an in-app calming tool, and a doorway into the curriculum */
  var RN_EXTRA = {
    critic: {
      toolKey: "innercoach", altKey: "emotion", deeperAction: "library", query: "inner critic",
      toolLabel: { en: "Try: 4-7-8 Breathing", es: "Prueba: Respiración 4-7-8" },
      deeper: { en: "Meet your Inner Coach — open the lessons", es: "Conoce a tu Guía Interior — abre las lecciones" },
      affirm: {
        adult: { en: "It sounds like that inner voice is being loud and hard on you right now. Loud doesn’t make it true — you don’t have to believe everything it says.", es: "Parece que esa voz interior está fuerte y dura contigo ahora mismo. Que sea fuerte no la hace verdad — no tienes que creer todo lo que dice." },
        teen:  { en: "It sounds like that voice in your head is being really loud right now. Loud isn’t the same as true — you can let it talk without taking it as fact.", es: "Parece que esa voz en tu cabeza está muy fuerte ahora mismo. Fuerte no es lo mismo que verdad — puedes dejarla hablar sin tomarla como un hecho." },
        child: { en: "It sounds like a grumpy voice is being loud right now. Loud feelings get smaller, and this one can get smaller too.", es: "Parece que una voz gruñona está fuerte ahora mismo. Los sentimientos fuertes se hacen más pequeños, y este también puede hacerse más pequeño." }
      }
    },
    storm: {
      toolKey: "coldwater", altKey: "movement", deeperAction: "library", query: "window of tolerance",
      toolLabel: { en: "Try: 4-7-8 Breathing", es: "Prueba: Respiración 4-7-8" },
      deeper: { en: "Learn the Window of Tolerance", es: "Aprende la Ventana de Tolerancia" },
      affirm: {
        adult: { en: "It sounds like a lot may be moving through you very fast right now. Nothing has to be solved this second — the one small thing that matters now is coming down a notch.", es: "Parece que mucho puede estar moviéndose muy rápido dentro de ti ahora mismo. No hay que resolver nada en este segundo — lo único que importa ahora es bajar un nivel." },
        teen:  { en: "It sounds like everything may be moving really fast right now. You don’t have to fix anything yet — the only thing for right now is letting yourself land.", es: "Parece que todo puede estar moviéndose muy rápido ahora mismo. No tienes que arreglar nada todavía — lo único para este momento es dejarte aterrizar." },
        child: { en: "It sounds like your body may be going really fast right now. We can help it slow down together, one breath at a time.", es: "Parece que tu cuerpo puede estar yendo muy rápido ahora mismo. Podemos ayudarlo a ir más despacio juntos, una respiración a la vez." }
      }
    },
    fog: {
      toolKey: "grounding", altKey: "movement", deeperAction: "library", query: "window of tolerance",
      toolLabel: { en: "Try: 5-4-3-2-1 Grounding", es: "Prueba: Anclaje 5-4-3-2-1" },
      deeper: { en: "Learn the Window of Tolerance", es: "Aprende la Ventana de Tolerancia" },
      affirm: {
        adult: { en: "It sounds like things may feel far away or hard to reach right now. That’s your body easing off — coming back slowly, at your own pace, is okay.", es: "Parece que las cosas pueden sentirse lejanas o difíciles de alcanzar ahora mismo. Es tu cuerpo bajando el ritmo — volver despacio, a tu propio paso, está bien." },
        teen:  { en: "It sounds like everything may feel kind of blank or far away right now. That doesn’t mean something’s wrong — coming back slowly is okay, no rush.", es: "Parece que todo puede sentirse en blanco o lejano ahora mismo. Eso no significa que algo esté mal — volver despacio está bien, sin prisa." },
        child: { en: "It sounds like you may feel a little far away right now. That’s okay — your body knows how to come back, and you can take your time.", es: "Parece que podrías sentirte un poco lejos ahora mismo. Está bien — tu cuerpo sabe cómo volver, y puedes tomarte tu tiempo." }
      }
    },
    loop: {
      toolKey: "movement", altKey: "emotion", deeperAction: "library", query: "rumination",
      toolLabel: { en: "Try: a Movement Break", es: "Prueba: una pausa de movimiento" },
      deeper: { en: "The Letting-Go practice — open the lessons", es: "La práctica de Soltar — abre las lecciones" },
      affirm: {
        adult: { en: "It sounds like your mind may be circling the same thing over and over. Thinking about it more isn’t the same as solving it — setting it down for now is okay.", es: "Parece que tu mente puede estar dando vueltas a lo mismo una y otra vez. Pensarlo más no es lo mismo que resolverlo — soltarlo por ahora está bien." },
        teen:  { en: "It sounds like your brain may be replaying the same thing on a loop. Replaying it isn’t fixing it — putting it down for a bit is okay.", es: "Parece que tu cerebro puede estar repitiendo lo mismo en bucle. Repetirlo no lo arregla — soltarlo por un rato está bien." },
        child: { en: "It sounds like your brain may be stuck on one thing right now. You don’t have to think about it this minute — let’s give your brain a little break.", es: "Parece que tu cerebro puede estar atascado en una sola cosa ahora mismo. No tienes que pensar en eso este minuto — démosle un pequeño descanso a tu cerebro." }
      }
    },
    steady: {
      toolKey: null, deeperAction: "mytools",
      toolLabel: { en: "", es: "" },
      deeper: { en: "Explore your calm & regulation tools", es: "Explora tus herramientas de calma" },
      affirm: {
        adult: { en: "It sounds like things may feel steady right now. Notice what’s helping in this moment — that’s worth carrying forward.", es: "Parece que las cosas pueden sentirse estables ahora mismo. Nota qué te está ayudando en este momento — eso vale la pena llevarlo contigo." },
        teen:  { en: "It sounds like you may be in a pretty good moment right now. Notice what’s helping — that’s how you find your way back to it.", es: "Parece que puedes estar en un buen momento ahora mismo. Nota qué te está ayudando — así encuentras el camino de regreso a él." },
        child: { en: "It sounds like you may be feeling calm right now. Notice what feels good — you can remember it for next time.", es: "Parece que puedes estar sintiéndote en calma ahora mismo. Nota qué se siente bien — puedes recordarlo para la próxima vez." }
      }
    }
  };

  /* generic in-app tool labels (for the "try a different one" follow-up) */
  var RN_TOOL_LABEL = {
    breathing: { en: "Try: 4-7-8 Breathing", es: "Prueba: Respiración 4-7-8" },
    grounding: { en: "Try: 5-4-3-2-1 Grounding", es: "Prueba: Anclaje 5-4-3-2-1" },
    movement:  { en: "Try: a Movement Break", es: "Prueba: una pausa de movimiento" },
    emotion:   { en: "Try: Name it to tame it", es: "Prueba: Nómbralo para calmarlo" },
    bilateral: { en: "Try: a Butterfly Hug", es: "Prueba: un Abrazo mariposa" },
    coldwater: { en: "Try: Cold Water", es: "Prueba: Agua fría" },
    innercoach:{ en: "Try: Your Inner Coach", es: "Prueba: Tu Guía Interior" },
    makeitright:{ en: "Try: Make It Right", es: "Prueba: Reparar" }
  };

  /* "Did that help?" check-back copy, by audience + language */
  var RN_FB = {
    yesLabel: { en: "Yes, a little", es: "Sí, un poco" },
    noLabel:  { en: "Not yet", es: "Todavía no" },
    prompt: {
      adult: { en: "You’ve tried something — where’s it at right now?", es: "Probaste algo — ¿en qué punto estás ahora?" },
      teen:  { en: "Okay — where’s it at right now?", es: "Bien — ¿en qué punto estás ahora?" },
      child: { en: "Where’s your feeling now?", es: "¿Dónde está tu sentimiento ahora?" }
    },
    again: {
      adult: { en: "Give it a try, then check back:", es: "Inténtalo y vuelve a revisar:" },
      teen:  { en: "Try it, then check back:", es: "Pruébalo y vuelve a revisar:" },
      child: { en: "Try it, then tell me:", es: "Pruébalo y luego dime:" }
    },
    yes: {
      adult: { en: "That’s the skill working — and you did that. The wave moved through because you rode it, not because it wasn’t real. You can come back here any time.", es: "Esa es la habilidad funcionando — y lo hiciste tú. La ola pasó porque la surfeaste, no porque no fuera real. Puedes volver aquí cuando quieras." },
      teen:  { en: "Nice — that’s you doing the thing. The wave passed because you rode it out. This is always here when you need it.", es: "Bien — eso lo hiciste tú. La ola pasó porque la aguantaste. Esto está aquí siempre que lo necesites." },
      child: { en: "Yay! You helped your big feeling get smaller. You can come back any time you need to.", es: "¡Bien! Ayudaste a que tu sentimiento grande se hiciera más pequeño. Puedes volver cuando lo necesites." }
    },
    no1: {
      adult: { en: "Still up there — that’s okay, and not you failing. You don’t have to start over; let’s just add one more thing on top of what you did:", es: "Aún alto — está bien, y no es un fracaso tuyo. No tienes que empezar de nuevo; solo agreguemos una cosa más a lo que ya hiciste:" },
      teen:  { en: "Still up there — that’s okay, and not on you. No need to start over — let’s stack one more on top:", es: "Aún alto — está bien, y no es tu culpa. No hay que empezar de nuevo — agreguemos una más encima:" },
      child: { en: "Still big — that’s okay! We don’t start over. Let’s just add one more thing:", es: "Aún grande — ¡está bien! No empezamos de nuevo. Solo agreguemos una cosa más:" }
    },
    no2: {
      adult: { en: "You’ve tried, and it’s still heavy — thank you for staying with it. This is the kind of thing that gets lighter with another person, not alone. Reach out to someone you trust. If it’s a lot, in the U.S. you can call or text <strong>988</strong> any time.", es: "Lo intentaste, y aún pesa — gracias por quedarte con ello. Esto se aligera con otra persona, no en soledad. Habla con alguien de confianza. Si es mucho, en EE. UU. puedes llamar o enviar un mensaje al <strong>988</strong> a cualquier hora." },
      teen:  { en: "You really tried, and it’s still heavy — that takes guts. When a feeling stays this big, the bravest move is to tell someone you trust. If it’s a lot, in the U.S. you can call or text <strong>988</strong> any time, day or night.", es: "Lo intentaste de verdad, y aún pesa — eso toma valor. Cuando un sentimiento sigue así de grande, lo más valiente es contárselo a alguien de confianza. Si es mucho, en EE. UU. puedes llamar o enviar un mensaje al <strong>988</strong> a cualquier hora." },
      child: { en: "You’re being so brave. When a feeling stays big even after we try, the best next step is a grown-up you trust — your teacher counts. Please tell them how you feel.", es: "Estás siendo muy valiente. Cuando un sentimiento sigue grande aunque lo intentemos, el mejor paso es una persona adulta de confianza — tu maestro cuenta. Por favor, cuéntale cómo te sientes." }
    },
    cameIn:  { en: "You came in at", es: "Llegaste en" },
    nowLbl:  { en: "now", es: "ahora" },
    readyLabel: { en: "I’m ready to go back", es: "Estoy listo/a para volver" },
    stayLabel:  { en: "Stay a minute", es: "Quédate un minuto" },
    freshLabel: { en: "Start fresh for the next person →", es: "Empezar de nuevo para la siguiente persona →" },
    postOk: {
      adult: { en: "That’s a steady place to be. Nice work settling yourself.", es: "Ese es un lugar estable. Buen trabajo calmándote." },
      teen:  { en: "That’s a solid place to land. Nice work settling.", es: "Ese es un buen lugar para aterrizar. Bien hecho." },
      child: { en: "That’s a good, calm spot. Great job!", es: "Ese es un lugar bueno y tranquilo. ¡Muy bien!" }
    },
    sendoff: {
      adult: { en: "Go easy heading back — you did the work. This is here any time you need it.", es: "Ve con calma al volver — hiciste el trabajo. Esto está aquí cuando lo necesites." },
      teen:  { en: "Head back when you’re ready — you handled that. This is here whenever you need it.", es: "Vuelve cuando estés listo/a — manejaste eso. Esto está aquí cuando lo necesites." },
      child: { en: "Great job! You can walk back to your seat now. Come back any time you need to.", es: "¡Muy bien! Ya puedes volver a tu asiento. Vuelve cuando lo necesites." }
    },
    stayMsg: {
      adult: { en: "Take all the time you need. Try one more, then check again:", es: "Tómate el tiempo que necesites. Prueba una más y vuelve a revisar:" },
      teen:  { en: "Take the time you need. Try one more, then check again:", es: "Tómate el tiempo que necesites. Prueba una más y vuelve a revisar:" },
      child: { en: "Take your time. Let’s try one more:", es: "Tómate tu tiempo. Probemos una más:" }
    }
  };
  var RN_TEACHER = {
    en: { sum: "For teachers — using this as a calm-down station",
          body: "Make it a reset, never a punishment. Try saying: “Go do a Right Now at the computer. Be honest, try what it suggests, and come back when you’re ready.” Nothing is saved; it’s private. The goal is a calmer student coming back on their own, not a report." },
    es: { sum: "Para docentes — usar esto como una estación de calma",
          body: "Que sea un reinicio, nunca un castigo. Prueba: “Ve a hacer un Ahora mismo en la computadora, sé honesto/a, prueba lo que sugiere, luego revisa cómo estás y vuelve cuando estés listo/a.” No se guarda nada — es privado del estudiante. Buscas a un niño/a más tranquilo/a que regresa por su cuenta, no un reporte." }
  };
  /* ---- The Station Guide (.30dd) — the "For teachers" drawer, grown up. ----
     One distilled staff playbook shared by the Quiet Space drawer and the
     dashboard teacher card, built FROM the material behind the doors (the
     Co-Regulation Reminder, Find the Function, Make It Right, the adult band
     of Inner Coach, Circle Time) so a teacher gets the minute version here and
     the door stays the deep version. Printable from a dedicated always-light
     window and copyable as plain text, so the guide can go out on its own —
     a sub folder, a para, the teacher next door. Every string is EN/ES and the
     Spanish reuses the door tools' own published wording wherever one exists. */
  function tcgData(es) {
    function T(en, esx) { return es ? esx : en; }
    return {
      coregH: T("Before you walk over — 10 seconds", "Antes de acercarte — 10 segundos"),
      coregLead: T("Before you regulate the student, regulate yourself.", "Antes de regular al estudiante, regúlate tú."),
      coreg: [
        [T("Check your breath.", "Revisa tu respiración."), T("Take one slow breath right now, before you say anything.", "Toma una respiración lenta ahora, antes de decir nada.")],
        [T("Relax your jaw.", "Relaja la mandíbula."), T("Most people don’t notice they’ve been clenching. Drop it.", "La mayoría no nota que la aprieta. Suéltala.")],
        [T("Lower your shoulders.", "Baja los hombros."), T("They’ve crept up. Let them fall.", "Se subieron. Déjalos caer.")],
        [T("Soften your voice.", "Suaviza la voz."), T("One full tone quieter than you think you need.", "Un tono más bajo de lo que crees necesitar.")],
        [T("Check your face.", "Revisa tu cara."), T("A calm, warm face helps an upset student feel safe.", "Una cara tranquila y cálida ayuda a un estudiante alterado a sentirse seguro.")]
      ],
      coregClose: T("Your calm is the intervention. Everything else is secondary.", "Tu calma es la intervención. Todo lo demás es secundario."),
      fnH: T("While they’re at the station — read the behavior", "Mientras están en la estación — lee la conducta"),
      fnLead: T("Behavior is a message. While they reset, ask yourself: what was it trying to get, or to avoid?", "El comportamiento es un mensaje. Mientras se calma, pregúntate: ¿qué intentaba conseguir o evitar?"),
      fns: [
        [T("Escape / avoid", "Escapar / evitar"), T("the demand goes away.", "la demanda desaparece."), T("Chunk the task, do the first step together, pre-warn transitions — and teach a break-or-help card.", "Divide la tarea, hagan el primer paso juntos, avisa las transiciones — y enseña una tarjeta de pausa o ayuda.")],
        [T("Control / autonomy", "Control / autonomía"), T("being told what to do feels like losing self.", "recibir órdenes se siente como perderse a sí mismo."), T("Hand back real choice in how and what order: “pick two of these four.”", "Devuelve opciones reales de cómo y en qué orden: “elige dos de estas cuatro”.")],
        [T("Sensory", "Sensorial"), T("seeking input, or escaping too much of it.", "busca input, o escapa del exceso."), T("A movement or heavy-work break; meet the same need with a tool that doesn’t disrupt.", "Una pausa de movimiento o trabajo pesado; satisface la misma necesidad con una herramienta que no interrumpa.")],
        [T("Connection / attention", "Conexión / atención"), T("even a correction is contact.", "hasta una corrección es contacto."), T("Connect before you correct; teach an appropriate way to ask for you.", "Conecta antes de corregir; enseña una forma apropiada de pedir tu atención.")],
        [T("Not-yet-skill", "Falta de habilidad"), T("looks like “won’t” — is “can’t (yet).”", "parece “no quiere” — es “no puede (todavía)”."), T("Stop incentivizing, start teaching: model, scaffold the first step, then fade.", "Deja de incentivar y empieza a enseñar: modela, apoya el primer paso, luego retira el apoyo.")]
      ],
      fnFine: T("A flag, not a diagnosis — never a substitute for your team’s FBA/BIP.", "Una señal, no un diagnóstico — nunca sustituye el FBA/BIP de tu equipo."),
      backH: T("When they come back — re-entry in 60 seconds", "Cuando vuelven — reingreso en 60 segundos"),
      back: [
        [T("Welcome, no spotlight.", "Bienvenida sin reflectores."), T("“Glad you’re back.” Don’t debrief in front of the class.", "“Qué bueno que volviste.” No lo proceses frente a la clase.")],
        [T("Name it without shame.", "Nómbralo sin vergüenza."), T("“You’re not in trouble — your brain hit overwhelm. What’s the one part you’re stuck on?”", "“No estás en problemas — tu cerebro se saturó. ¿En qué parte estás atascado?”")],
        [T("Shrink the task to one step.", "Reduce la tarea a un paso."), T("“This part’s tricky. Let’s just do the first step together.”", "“Esta parte es difícil. Hagamos solo el primer paso juntos.”")]
      ],
      repairLead: T("If someone was hurt, go through the four repair steps once everyone is calm. Repair is a skill, not a punishment:", "Si alguien salió lastimado, recorran los cuatro pasos de reparación cuando todos estén tranquilos. Reparar es una habilidad, no un castigo:"),
      repair: [
        [T("Own it", "Reconócelo"), T("“I’m sorry I ___.”", "“Perdón por ___.”")],
        [T("Name the impact", "Nombra el impacto"), T("“That probably made you feel ___.”", "“Eso probablemente te hizo sentir ___.”")],
        [T("Make it right", "Repáralo"), T("“To make it better, I could ___.”", "“Para mejorarlo, podría ___.”")],
        [T("Reset", "Reinicia"), T("“Next time, I’ll ___” — then let it go.", "“La próxima vez, voy a ___” — y déjalo ir.")]
      ],
      circleLine: T("If the whole room needs it, run a two-minute Reset Together or a Community Circle.", "Si toda la clase lo necesita, hagan un Reinicio Juntos de dos minutos o un Círculo comunitario."),
      coachH: T("For you, at the end of it — your own inner coach", "Para ti, al final — tu propia guía interior"),
      coachLead: T("The station holds students. This part holds you.", "La estación sostiene a los estudiantes. Esta parte te sostiene a ti."),
      coach: [
        [T("“I’m failing at all of this.”", "“Estoy fallando en todo esto.”"), T("All of it? Name one thing you handled today. The critic exaggerates.", "¿En todo? Nombra una cosa que manejaste hoy. El crítico exagera.")],
        [T("“I should be handling this better.”", "“Debería manejar esto mejor.”"), T("You’re carrying a lot. What would you say to a friend in your shoes?", "Cargas con mucho. ¿Qué le dirías a un amigo en tu lugar?")],
        [T("“I have nothing left to give.”", "“No me queda nada que dar.”"), T("That’s depletion talking. What’s one small way to refill, even a little?", "Eso es el agotamiento hablando. ¿Una forma pequeña de recargar, aunque sea poco?")]
      ],
      sayH: T("What to say instead", "Qué decir en su lugar"),
      sayLead: T("Five small language shifts — connection, not compliance.", "Cinco pequeños cambios de lenguaje — conexión, no obediencia."),
      say: [
        [T("Overwhelmed", "Abrumado"), T("“Calm down.”", "“Cálmate.”"), T("“Tell me what feels hardest right now.”", "“Dime qué se siente más difícil ahora mismo.”")],
        [T("Frustrated", "Frustrado"), T("“You’re fine.”", "“Estás bien.”"), T("“Something feels off. Tell me about it.”", "“Algo no anda bien. Cuéntame.”")],
        [T("Dysregulated", "Desregulado"), T("“Go sit down.”", "“Ve a sentarte.”"), T("“Take a reset and come back when you’re ready.”", "“Tómate un reinicio y vuelve cuando estés listo.”")],
        [T("Made a mistake", "Cometió un error"), T("“You know better.”", "“Sabes que eso no se hace.”"), T("“What happened, and what would help make it right?”", "“¿Qué pasó, y qué ayudaría a repararlo?”")],
        [T("Shuts down", "Se cierra"), T("“Use your words.”", "“Usa tus palabras.”"), T("“We can start small. What’s one thing I should know?”", "“Podemos empezar de a poco. ¿Qué es una cosa que debería saber?”")]
      ],
      normsH: T("Station norms", "Normas de la estación"),
      norms: [
        T("A reset, never a consequence — never earned, never lost.", "Un reinicio, nunca un castigo — no se gana ni se pierde."),
        T("Private: nothing a student taps at the station is saved or reported.", "Privado: nada de lo que el estudiante toca en la estación se guarda ni se reporta."),
        T("Success is a calmer kid returning on their own — not a report.", "El éxito es un niño más tranquilo que vuelve por su cuenta — no un reporte.")
      ],
      sendH: T("The send", "El envío"),
      sendBody: T("Keep it a reset, never a consequence. Try: “Go take a Right Now at the computer, be honest with it, try what it suggests, then check where you’re at and come back when you’re ready.”", "Que sea un reinicio, nunca un castigo. Prueba: “Ve a hacer un Ahora Mismo en la computadora, sé honesto, prueba lo que sugiere, revisa cómo estás y vuelve cuando estés listo.”"),
      discH: T("If a student discloses", "Si un estudiante revela algo"),
      discSent: T("“I can see something is happening for you right now. You don’t have to explain it.”", "“Puedo ver que algo te está pasando ahora mismo. No tienes que explicarlo.”"),
      discTail: T("Have that sentence automatic, then run your school’s 6-step protocol — the full walkthrough is on the site under “If a student discloses.” Do not promise confidentiality; mandatory reporting applies.", "Ten esa frase automática, y luego sigue el protocolo de 6 pasos de tu escuela — la guía completa está en el sitio en “Si un estudiante revela algo”. No prometas confidencialidad; aplica el reporte obligatorio."),
      printB: T("🖨️ Print the station guide", "🖨️ Imprimir la guía de la estación"),
      copyB: T("📋 Copy as text", "📋 Copiar como texto"),
      copied: T("Copied!", "¡Copiado!"),
      actsCap: T("One page — for a sub folder, a para, or the teacher next door.", "Una página — para la carpeta del suplente, un asistente o el docente de al lado."),
      title: T("Calm-Down Station — Staff Quick Guide", "Rincón de calma — Guía rápida para el personal"),
      foot: T("Relationship-centered · A reset, never a consequence · architectureofgrace.com", "Centrado en la relación · Un reinicio, nunca un castigo · architectureofgrace.com")
    };
  }
  function tcgCss() {
    if (document.getElementById("aog-tcg-css")) return;
    var st = document.createElement("style"); st.id = "aog-tcg-css";
    st.textContent =
      '.aog-tcg{margin-top:14px;display:grid;gap:8px;}' +
      '.aog-tcg-sec{border:1px solid var(--rule,#E4DAC5);border-radius:12px;background:rgba(255,255,255,.55);}' +
      ':root[data-theme="dark"] .aog-tcg-sec{background:rgba(255,255,255,.04);border-color:#2c4d6b;}' +
      '.aog-tcg-sec>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:9px;padding:10px 13px;font-family:var(--font-sans);font-size:13px;font-weight:800;color:var(--navy,#0A1E33);}' +
      ':root[data-theme="dark"] .aog-tcg-sec>summary{color:var(--cream,#F4EEE2);}' +
      '.aog-tcg-sec>summary::-webkit-details-marker{display:none;}' +
      '.aog-tcg-sec>summary::after{content:"\\25BE";margin-left:auto;color:var(--gold-deep,#9a6f24);transition:transform .15s;}' +
      '.aog-tcg-sec[open]>summary::after{transform:rotate(180deg);}' +
      '.aog-tcg-b{padding:2px 14px 12px;font-family:var(--font-sans);font-size:13px;line-height:1.6;color:var(--ink,#1d2733);text-align:left;}' +
      ':root[data-theme="dark"] .aog-tcg-b{color:#C9D2E0;}' +
      '.aog-tcg-b ol,.aog-tcg-b ul{margin:6px 0 8px;padding-left:19px;}' +
      '.aog-tcg-b li{margin-bottom:6px;}' +
      '.aog-tcg-say{font-family:var(--font-serif,"Cormorant Garamond",serif);font-style:italic;color:var(--navy,#0A1E33);}' +
      ':root[data-theme="dark"] .aog-tcg-say{color:var(--gold,#D9A33B);}' +
      '.aog-tcg-note{font-family:var(--font-serif,"Cormorant Garamond",serif);font-style:italic;color:var(--gold-deep,#9a6f24);margin:8px 0 0;}' +
      '.aog-tcg-fine{font-size:11.5px;color:var(--ink-faint,#646E86);margin:8px 0 0;}' +
      ':root[data-theme="dark"] .aog-tcg-fine{color:#8FA3BC;}' +
      '.aog-tcg-acts{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px;}' +
      '.aog-tcg-acts button{font-family:var(--font-sans);font-size:12.5px;font-weight:800;color:var(--navy,#0A1E33);background:#fff;border:1.5px solid var(--navy,#0A1E33);border-radius:999px;padding:8px 14px;cursor:pointer;}' +
      ':root[data-theme="dark"] .aog-tcg-acts button{background:transparent;color:var(--cream,#F4EEE2);border-color:#4b6c8c;}' +
      '.aog-tcg-cap{font-size:11.5px;color:var(--ink-faint,#646E86);}' +
      ':root[data-theme="dark"] .aog-tcg-cap{color:#8FA3BC;}';
    document.head.appendChild(st);
  }
  window.aogCalmGuideCoreHtml = function (es, opts) {
    opts = opts || {};
    tcgCss();
    var d = tcgData(es);
    function sec(ico, h, inner) { return '<details class="aog-tcg-sec"><summary><span aria-hidden="true">' + ico + '</span><span>' + h + '</span></summary><div class="aog-tcg-b">' + inner + '</div></details>'; }
    var out = '<div class="aog-tcg">';
    if (opts.safety) {
      out += '<button type="button" onclick="if(window.toolOpen)window.toolOpen(\'disclosure\')" style="display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:11px 14px;border:1.5px solid #B5503F;border-radius:12px;background:rgba(181,80,63,.05);color:#B5503F;font:inherit;font-weight:800;font-size:13.5px;cursor:pointer;"><span aria-hidden="true" style="font-size:17px;">🛡️</span><span>' + (es ? 'Si un estudiante revela algo — el protocolo de 6 pasos →' : 'If a student discloses — the 6-step protocol →') + '</span></button>';
    }
    out += sec('🧡', d.coregH,
      '<p class="aog-tcg-say" style="margin:6px 0 4px;">' + d.coregLead + '</p><ol>' +
      d.coreg.map(function (r) { return '<li><b>' + r[0] + '</b> ' + r[1] + '</li>'; }).join('') +
      '</ol><p class="aog-tcg-note">' + d.coregClose + '</p>');
    out += sec('🔎', d.fnH,
      '<p style="margin:6px 0 4px;">' + d.fnLead + '</p><ul>' +
      d.fns.map(function (r) { return '<li><b>' + r[0] + '</b> — ' + r[1] + ' <span aria-hidden="true">→</span> ' + r[2] + '</li>'; }).join('') +
      '</ul><p class="aog-tcg-fine">' + d.fnFine + '</p>');
    out += sec('🤝', d.backH,
      '<ul>' + d.back.map(function (r) { return '<li><b>' + r[0] + '</b> <span class="aog-tcg-say">' + r[1] + '</span></li>'; }).join('') + '</ul>' +
      '<p style="margin:8px 0 4px;">' + d.repairLead + '</p><ol>' +
      d.repair.map(function (r) { return '<li><b>' + r[0] + '.</b> <span class="aog-tcg-say">' + r[1] + '</span></li>'; }).join('') +
      '</ol><p class="aog-tcg-fine">' + d.circleLine + '</p>');
    if (opts.say) {
      out += sec('🗣️', d.sayH,
        '<p style="margin:6px 0 4px;">' + d.sayLead + '</p><ul>' +
        d.say.map(function (r) { return '<li><b>' + r[0] + ':</b> ' + (es ? 'en lugar de' : 'instead of') + ' <s>' + r[1] + '</s> — <span class="aog-tcg-say">' + r[2] + '</span></li>'; }).join('') + '</ul>');
    }
    out += sec('🧭', d.coachH,
      '<p style="margin:6px 0 4px;">' + d.coachLead + '</p><ul>' +
      d.coach.map(function (r) { return '<li><span class="aog-tcg-say">' + r[0] + '</span> <span aria-hidden="true">→</span> ' + r[1] + '</li>'; }).join('') + '</ul>');
    out += '<div class="aog-tcg-acts"><button type="button" onclick="if(window.aogCalmGuidePrint)aogCalmGuidePrint()">' + d.printB + '</button><button type="button" onclick="if(window.aogCalmGuideCopy)aogCalmGuideCopy(this)">' + d.copyB + '</button><span class="aog-tcg-cap">' + d.actsCap + '</span></div>';
    out += '</div>';
    return out;
  };
  window.aogCalmGuidePrint = function () {
    var es = (typeof lang !== "undefined" && lang === "es");
    var d = tcgData(es);
    function h2(t) { return '<h2>' + t + '</h2>'; }
    var doc = '<!doctype html><html><head><meta charset="utf-8"><title>' + d.title + '</title><style>' +
      '*{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box;}' +
      'body{font-family:-apple-system,Segoe UI,Inter,system-ui,sans-serif;color:#0A1E33;margin:36px;max-width:720px;font-size:12.5px;line-height:1.55;}' +
      '.bh{display:flex;align-items:center;gap:12px;border-bottom:3px solid #D9A33B;padding-bottom:12px;margin:0 0 14px;}' +
      '.mk{width:40px;height:40px;border-radius:8px;background:#D9A33B;color:#0A1E33;font-family:Georgia,serif;font-weight:700;font-size:24px;display:flex;align-items:center;justify-content:center;}' +
      '.wm{font-family:Georgia,serif;font-size:18px;font-weight:700;}.sb{font-size:12px;color:#46506E;}' +
      'h2{font-family:Georgia,serif;font-size:14.5px;margin:16px 0 5px;color:#0A1E33;border-bottom:1px solid #E4DAC5;padding-bottom:3px;}' +
      'ol,ul{margin:4px 0 6px;padding-left:20px;}li{margin-bottom:3px;}' +
      '.say{font-family:Georgia,serif;font-style:italic;}' +
      '.note{font-family:Georgia,serif;font-style:italic;color:#9a6f24;margin:5px 0 0;}' +
      '.fine{font-size:10.5px;color:#646E86;margin:4px 0 0;}' +
      '.disc{border:1.5px solid #B5503F;border-radius:10px;background:#FBF1EF;padding:10px 13px;margin-top:14px;}' +
      '.disc b{color:#B5503F;}' +
      '.ft{margin-top:16px;border-top:1px solid #E4DAC5;padding-top:8px;font-size:10.5px;color:#8A92A6;}' +
      '@media print{body{margin:.5in;}.np{display:none;}}</style></head><body>' +
      '<div class="bh"><span class="mk">A</span><div><div class="wm">Architecture of Grace</div><div class="sb">' + d.title + '</div></div></div>' +
      h2(d.sendH) + '<p>' + d.sendBody + '</p>' +
      h2(d.normsH) + '<ul>' + d.norms.map(function (n) { return '<li>' + n + '</li>'; }).join('') + '</ul>' +
      h2('🧡 ' + d.coregH) + '<p class="say">' + d.coregLead + '</p><ol>' + d.coreg.map(function (r) { return '<li><b>' + r[0] + '</b> ' + r[1] + '</li>'; }).join('') + '</ol><p class="note">' + d.coregClose + '</p>' +
      h2('🔎 ' + d.fnH) + '<p>' + d.fnLead + '</p><ul>' + d.fns.map(function (r) { return '<li><b>' + r[0] + '</b> — ' + r[1] + ' → ' + r[2] + '</li>'; }).join('') + '</ul><p class="fine">' + d.fnFine + '</p>' +
      h2('🗣️ ' + d.sayH) + '<ul>' + d.say.map(function (r) { return '<li><b>' + r[0] + ':</b> ' + (es ? 'en lugar de' : 'instead of') + ' ' + r[1] + ' — <span class="say">' + r[2] + '</span></li>'; }).join('') + '</ul>' +
      h2('🤝 ' + d.backH) + '<ul>' + d.back.map(function (r) { return '<li><b>' + r[0] + '</b> <span class="say">' + r[1] + '</span></li>'; }).join('') + '</ul><p>' + d.repairLead + '</p><ol>' + d.repair.map(function (r) { return '<li><b>' + r[0] + '.</b> <span class="say">' + r[1] + '</span></li>'; }).join('') + '</ol><p class="fine">' + d.circleLine + '</p>' +
      h2('🧭 ' + d.coachH) + '<ul>' + d.coach.map(function (r) { return '<li><span class="say">' + r[0] + '</span> → ' + r[1] + '</li>'; }).join('') + '</ul>' +
      '<div class="disc"><b>🛡️ ' + d.discH + '</b><br><span class="say">' + d.discSent + '</span><br>' + d.discTail + '</div>' +
      '<div class="ft">' + d.foot + '</div>' +
      '<p class="np" style="margin-top:14px;"><button onclick="window.print()" style="font:inherit;font-weight:700;background:#0A1E33;color:#fff;border:0;border-radius:8px;padding:9px 18px;cursor:pointer;">' + (es ? 'Imprimir' : 'Print') + '</button></p></body></html>';
    var w = window.open("", "_blank");
    if (!w) { alert(es ? "Permite las ventanas emergentes para imprimir." : "Please allow pop-ups to print."); return; }
    w.document.open(); w.document.write(doc); w.document.close(); w.focus();
    try { w.print(); } catch (e) {}
  };
  window.aogCalmGuideCopy = function (btn) {
    var es = (typeof lang !== "undefined" && lang === "es");
    var d = tcgData(es);
    var nl = "\n";
    var tx = d.title + nl + "Architecture of Grace · architectureofgrace.com" + nl + nl +
      d.sendH.toUpperCase() + nl + d.sendBody + nl + nl +
      d.normsH.toUpperCase() + nl + d.norms.map(function (n) { return "• " + n; }).join(nl) + nl + nl +
      d.coregH.toUpperCase() + nl + d.coregLead + nl + d.coreg.map(function (r, i) { return (i + 1) + ". " + r[0] + " " + r[1]; }).join(nl) + nl + d.coregClose + nl + nl +
      d.fnH.toUpperCase() + nl + d.fnLead + nl + d.fns.map(function (r) { return "• " + r[0] + " — " + r[1] + " -> " + r[2]; }).join(nl) + nl + d.fnFine + nl + nl +
      d.sayH.toUpperCase() + nl + d.say.map(function (r) { return "• " + r[0] + ": " + (es ? "en lugar de" : "instead of") + " " + r[1] + " — " + r[2]; }).join(nl) + nl + nl +
      d.backH.toUpperCase() + nl + d.back.map(function (r) { return "• " + r[0] + " " + r[1]; }).join(nl) + nl + d.repairLead + nl + d.repair.map(function (r, i) { return (i + 1) + ". " + r[0] + ". " + r[1]; }).join(nl) + nl + d.circleLine + nl + nl +
      d.coachH.toUpperCase() + nl + d.coach.map(function (r) { return "• " + r[0] + " -> " + r[1]; }).join(nl) + nl + nl +
      d.discH.toUpperCase() + nl + d.discSent + nl + d.discTail + nl;
    function done() {
      if (!btn) return;
      var o = btn.textContent; btn.textContent = d.copied;
      setTimeout(function () { btn.textContent = o; }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(tx).then(done, function () { window.prompt("Copy:", tx); }); }
    else { window.prompt("Copy:", tx); }
  };

  var rnLastRoute = null, rnLastAud = null, rnNoRounds = 0, rnFirstSize = null;

  window.openRightNow = function () {
    /* The in-the-moment check now lives in Quiet Space — send every legacy
       "Right Now" entry point there instead of the (now hidden) home copy. */
    if (typeof window.showStationMode === "function") { try { window.showStationMode(); return; } catch (e) {} }
    if (typeof window.aogRnReset === "function") { try { window.aogRnReset(false); } catch (e) {} }
    if (typeof startChoose === "function") { startChoose(); }
    else if (typeof showScreen === "function") { showScreen("screen-choose"); }
    setTimeout(function () {
      var el = document.getElementById("rightNowWrap") || document.getElementById("rightNow");
      if (!el) return;
      // Offset by the live sticky-topbar height (it wraps taller on phones), so
      // the top of the survey clears the header instead of hiding beneath it.
      var off = 0;
      try {
        var bars = document.querySelectorAll(".topbar");
        for (var i = 0; i < bars.length; i++) { if (bars[i].offsetParent !== null) { off = bars[i].getBoundingClientRect().height; break; } }
      } catch (e) {}
      var y = el.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0) - off - 10;
      y = Math.max(0, y);
      try { window.scrollTo({ top: y, behavior: "smooth" }); }
      catch (e) { try { window.scrollTo(0, y); } catch (e2) { el.scrollIntoView(); } }
    }, 90);
  };

  function setPick(q, state, el) {
    document.querySelectorAll("#" + ROOT + " .tk-pill[data-q=\"" + q + "\"]").forEach(function (p) {
      p.classList.remove("on"); p.setAttribute("aria-checked", "false");
    });
    el.classList.add("on"); el.setAttribute("aria-checked", "true");
    picks[q] = state;
  }

  function routeOf(p) {
    if (p["2"] === "loud" || p["2"] === "rail") return "critic";
    if (p["1"] === "hyper" || p["4"] === "over" || p["4"] === "big") return "storm";
    if (p["1"] === "hypo" || p["3"] === "fog") return "fog";
    if (p["3"] === "loop") return "loop";
    return "steady";
  }

  function breatheBlock(es) {
    var heart = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 21s-7-4.35-9-8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 3.65-9 8-9 8z\"/></svg>";
    return "<div class=\"grace-step\">" +
        "<div class=\"grace-step-h\">" + heart + "<span>" + (es ? "Respira conmigo (3 rondas)" : "Breathe with me (3 rounds)") + "</span></div>" +
        "<button type=\"button\" class=\"grace-step-btn\" onclick=\"aogGraceBreathe(this)\">" + (es ? "Empezar" : "Start") + "</button>" +
        "<div class=\"grace-breath\" hidden><div class=\"grace-orb\"></div><div class=\"grace-cue\" aria-live=\"polite\"></div></div>" +
      "</div>";
  }

  /* ---- Grace Response Engine ("A grace note") ----
     Three canonical lines for the archetype combinations (body · voice · brain),
     with a gentle fallback for every other combination. The live pills use a
     richer vocabulary, so we map them onto the engine's vocab first. */
  var GRACE_RESPONSES = [
    { body: "fast",  voice: "mean",    brain: "stuck",
      en: "Your mind may be working very hard right now. Let’s focus on one small thing you can do next.",
      es: "Tu mente puede estar trabajando muy duro ahora mismo. Concentrémonos en una pequeña cosa que puedas hacer a continuación." },
    { body: "tired", voice: "yelling", brain: "foggy",
      en: "It sounds like today may feel heavier than usual. You do not have to carry everything at once.",
      es: "Parece que hoy puede sentirse más pesado de lo normal. No tienes que cargarlo todo a la vez." },
    { body: "calm",  voice: "kind",    brain: "clear",
      en: "You seem grounded right now. Notice what’s helping and carry it forward.",
      es: "Pareces estar con los pies en la tierra ahora mismo. Nota qué te está ayudando y llévalo contigo." }
  ];
  function gnMapBody(v)  { return v === "hyper" ? "fast" : v === "hypo" ? "tired" : v === "window" ? "calm" : ""; }
  function gnMapVoice(v) { return v === "quiet" ? "kind" : v === "rail" ? "yelling" : (v === "loud" || v === "nag") ? "mean" : ""; }
  function gnMapBrain(v) { return v === "clear" ? "clear" : v === "fog" ? "foggy" : (v === "loop" || v === "scattered") ? "stuck" : ""; }
  function getGraceResponse(body, voice, brain, L) {
    var m = GRACE_RESPONSES.find(function (it) { return it.body === body && it.voice === voice && it.brain === brain; });
    if (m) return L === "es" ? m.es : m.en;
    return L === "es"
      ? "Gracias por registrarte. Concentrémonos en un siguiente paso útil."
      : "Thank you for checking in. Let’s focus on one helpful next step.";
  }

  function show() {
    var es = (typeof lang !== "undefined" && lang === "es");
    var L = es ? "es" : "en";
    var aud = (typeof RN_TIER !== "undefined" && RN_TIER[window.aogRightNowAudience]) || "adult";
    if (!RN_ADVICE.steady[aud]) aud = "adult";
    var box = document.getElementById(ROOT + "Result");
    if (!box) return;
    box.hidden = false;

    var keys = ["1", "2", "3", "4"], answered = 0;
    keys.forEach(function (k) { if (picks[k] != null) answered++; });
    if (answered < 4) {
      box.className = "wp-tank-result warn";
      box.innerHTML = "<p>" + (es ? "Toca una opción en cada una de las cuatro líneas." : "Tap one option for each of the four lines.") + "</p>";
      return;
    }

    var route = routeOf(picks);
    var severe = (picks["4"] === "over");
    var band = (route === "steady") ? "ok"
             : ((route === "critic" || route === "storm") && severe) ? "empty"
             : "low";

    var a = (RN_ADVICE[route][aud] || RN_ADVICE[route].adult)[L];
    var eyebrow = es ? "EN ESTE MOMENTO" : "RIGHT NOW";
    var stepsHtml = "<ol class=\"rn-steps\">";
    a.steps.forEach(function (s) { stepsHtml += "<li>" + s + "</li>"; });
    stepsHtml += "</ol>";

    var breathe = (route === "critic" || route === "storm") ? breatheBlock(es) : "";

    /* affirmation (raw, validating) + tools row (in-app tool + curriculum doorway) */
    var ex = RN_EXTRA[route] || RN_EXTRA.steady;
    var affirmHtml = "<div class=\"rn-affirm\">" + ((ex.affirm[aud] || ex.affirm.adult)[L]) + "</div>";
    /* "A grace note" — short, non-diagnostic line from the Grace Response Engine */
    var graceText = getGraceResponse(gnMapBody(picks["1"]), gnMapVoice(picks["2"]), gnMapBrain(picks["3"]), L);
    var graceNoteHtml = "<div class=\"rn-grace-note\"><div class=\"rn-grace-note-ey\">" + (es ? "UNA NOTA DE GRACIA" : "A GRACE NOTE") + "</div><p>" + graceText + "</p></div>";
    var myt = "if(window.aogRenderMyTools){window.aogRenderMyTools();}else if(typeof showScreen==='function'){showScreen('screen-aog-mytools');}if(typeof aogSetHash==='function'){aogSetHash('mytools');}";
    var lib = ex.query
      ? "if(window.aogGoConstruct){aogGoConstruct('" + ex.query + "','" + aud + "');}else if(window.aogGoLibrary){aogGoLibrary();}"
      : "if(window.aogGoLibrary){aogGoLibrary();}else if(typeof showScreen==='function'){showScreen('screen-library');}";
    /* Are we inside the Quiet Space kiosk right now? */
    var _stEl = document.getElementById("aog-station");
    var _inStation = !!(_stEl && _stEl.classList.contains("open"));
    var deeperOnclick = (ex.deeperAction === "mytools") ? myt : lib;
    /* Deeper links navigate the app behind the kiosk overlay — close the kiosk
       first so the lessons/library actually become visible. */
    if (_inStation) deeperOnclick = "if(window.closeStationMode){closeStationMode();}" + deeperOnclick;
    var toolBtn = ex.toolKey
      ? "<button type=\"button\" class=\"rn-tool-btn\" onclick=\"if(window.toolOpen){window.toolOpen('" + ex.toolKey + "');}\">" + ((RN_TOOL_LABEL[ex.toolKey] && RN_TOOL_LABEL[ex.toolKey][L]) || (ex.toolLabel && ex.toolLabel[L]) || "") + "</button>"
      : "";
    var deeperBtn = "<button type=\"button\" class=\"rn-deeper-btn\" onclick=\"" + deeperOnclick + "\">" + ex.deeper[L] + " →</button>";
    var toolsHtml = "<div class=\"rn-tools\">" + toolBtn + deeperBtn + "</div>";

    /* Sets of tools, shown one round at a time (not all at once):
       Set 1 = the quick resets, in the result card right away (when a domain
       is running low). Set 2 = "more ways to settle", which only appears AFTER
       the person re-rates how they're doing (revealed by aogRnPost). */
    function _rnCell(t) {
      return "<button type=\"button\" onclick=\"if(window.toolOpen){window.toolOpen('" + t.key + "');}\">" +
        "<span class=\"ic\" aria-hidden=\"true\">" + t.ic + "</span><span>" + (es ? t.es : t.en) + "</span></button>";
    }
    var sensoryHtml = "", moreToolsHtml = "";
    if (band !== "ok") {
      var SENSORY = [
        { key:"breathing", ic:"🫁", en:"Breathing",  es:"Respiración" },
        { key:"grounding", ic:"🌿", en:"5-4-3-2-1",  es:"5-4-3-2-1" },
        { key:"movement",  ic:"🏃", en:"Move & Shake", es:"Muévete" },
        { key:"take5",     ic:"🖐️", en:"Take 5",     es:"Toma 5" },
        { key:"calmjar",   ic:"🫙", en:"Calm Jar",    es:"Frasco de calma" },
        { key:"tappad",    ic:"👆", en:"Tap Pad",     es:"Toca el ritmo" }
      ];
      sensoryHtml =
        "<div class=\"rn-sensory\">" +
          "<div class=\"rn-sensory-h\"><span aria-hidden=\"true\">🧠</span><span>" +
            (es ? "Reinicios rápidos del cuerpo" : "Quick sensory + regulation resets") + "</span></div>" +
          "<p class=\"rn-sensory-sub\">" + (es ? "Elige lo que tu cuerpo necesita ahora" : "Choose what your body needs right now") + "</p>" +
          "<div class=\"rn-sensory-grid\">" + SENSORY.map(_rnCell).join("") + "</div>" +
        "</div>";
      /* Set 2 — only in Quiet Space, and only revealed after the re-rate */
      if (_inStation) {
        var MORE = [
          { key:"rainbow",   ic:"🌈", en:"Rainbow Breath", es:"Respiración arcoíris" },
          { key:"animalyoga",ic:"🦁", en:"Animal Yoga",    es:"Yoga animal" },
          { key:"bilateral", ic:"🦋", en:"Butterfly Hug",  es:"Abrazo mariposa" },
          { key:"safeplace", ic:"🌱", en:"Safe Place",     es:"Lugar seguro" },
          { key:"feelwheel", ic:"🎡", en:"Feelings Wheel", es:"Rueda de emociones" },
          { key:"emotion",   ic:"🟡", en:"Name It",        es:"Nómbralo" }
        ];
        moreToolsHtml =
          "<div class=\"rn-sensory rn-alltools\">" +
            "<div class=\"rn-sensory-h\"><span aria-hidden=\"true\">✨</span><span>" +
              (es ? "Más maneras de calmarte" : "More ways to settle") + "</span></div>" +
            "<p class=\"rn-sensory-sub\">" + (es ? "Cuando estés listo/a, prueba otra" : "When you're ready, try another") + "</p>" +
            "<div class=\"rn-sensory-grid\">" + MORE.map(_rnCell).join("") + "</div>" +
          "</div>";
      }
    }

    /* post-test ("where's it at now?") — remember context + the first intensity */
    rnLastRoute = route; rnLastAud = aud; rnNoRounds = 0; rnFirstSize = picks["4"];
    var _sizeLabels = (RN_COPY[aud] && RN_COPY[aud][L] && RN_COPY[aud][L].opts["4"]) || RN_COPY.adult.en.opts["4"];
    var _postPills = ["small", "wave", "big", "over"].map(function (k) {
      return "<button type=\"button\" class=\"rn-deeper-btn\" onclick=\"aogRnPost('" + k + "')\">" + _sizeLabels[k] + "</button>";
    }).join("");
    var followupHtml =
      "<div class=\"rn-followup\" id=\"rnFollowup\">" +
        "<div class=\"rn-fb-q\">" + ((RN_FB.prompt[aud] || RN_FB.prompt.adult)[L]) + "</div>" +
        "<div class=\"rn-fb-btns\">" + _postPills + "</div>" +
      "</div>";

    /* safeguarding door — adults/teens get 988; children get a trusted-adult line */
    var support = "";
    var showSupport = (route === "critic" || route === "storm" || severe);
    if (aud === "child") {
      support = "<div class=\"rn-grownup\"><strong>" + (es ? "Para un adulto cercano:" : "For a grown-up nearby:") + "</strong> " +
        (es ? "Acércate, baja la voz y respira con el niño. Eres la calma que toma prestada." : "Sit close, lower your voice, and breathe with the child. You are the calm they borrow.") + "</div>";
      if (showSupport) {
        support += "<p class=\"rn-support\">" + (es ? "Si esto se siente demasiado grande, cuéntale a una persona adulta de confianza cómo te sientes." : "If this feels too big, tell a grown-up you trust how you’re feeling.") + "</p>";
      }
    } else if (showSupport) {
      support = "<p class=\"rn-support\">" + (es
        ? "Si la voz se convierte en pensamientos de hacerte daño, no tienes que pasarlo solo/a — en EE. UU. llama o envía un mensaje al <strong>988</strong> a cualquier hora."
        : "If the voice turns into thoughts of harming yourself, you don’t have to ride it out alone — in the U.S. call or text <strong>988</strong> any time.") + "</p>";
    }

    var flag = es ? "Una señal, no un diagnóstico · nada de esto se guardó." : "A flag, not a diagnosis · nothing here was saved.";

    /* "Stuck" helper — when the body reads as shut down (hypo), the path that often
       turns into "I can't, and it's your fault". Separate "this is hard" from "I'm bad",
       and turn the shutdown into one nameable next step. */
    var stuckHtml = "";
    if (picks["1"] === "hypo") {
      var stuckH = es ? "Cuando te sientes atascado/a" : "When you feel stuck";
      var stuckLead, stuckReframe;
      if (aud === "child") {
        stuckLead = es ? "Atascarte no significa que seas malo/a en esto. Primero, una respiración lenta." : "Being stuck doesn't mean you're bad at this. First, one slow breath.";
        stuckReframe = es ? "Pedir ayuda no es fallar — decir esa parte en voz alta es el primer paso." : "Asking for help isn't failing — saying that part out loud is the first step.";
      } else {
        stuckLead = es ? "Atascarte es tu cerebro abrumado, no una falla tuya. Primero, una respiración lenta." : "Being stuck is your brain overwhelmed, not a flaw. First, one slow breath.";
        stuckReframe = es ? "Pedir ayuda no es fallar. Nombrar la única parte donde te atascas convierte el bloqueo en una pregunta." : "Asking for help isn't failing. Naming the one part you're stuck on turns a shutdown into a question.";
      }
      var stuckStem = es ? "“La parte en la que estoy atascado/a es ___.”" : "“The part I'm stuck on is ___.”";
      stuckHtml =
        "<div class=\"rn-stuck\" style=\"margin:14px 0 0;padding:13px 15px;background:var(--cream,#FBF3DF);border-left:3px solid var(--gold,#B8893A);border-radius:10px;\">" +
          "<div style=\"font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--gold-deep,#7a5a12);margin-bottom:6px;\"><span aria-hidden=\"true\" style=\"margin-right:6px;\">🧩</span>" + stuckH + "</div>" +
          "<p style=\"margin:0 0 8px;font-size:14.5px;line-height:1.5;color:var(--ink);\">" + stuckLead + "</p>" +
          "<p style=\"margin:0 0 8px;font-family:var(--font-serif);font-size:16px;line-height:1.45;color:var(--navy);\">" + stuckStem + "</p>" +
          "<p style=\"margin:0;font-size:13.5px;line-height:1.5;color:var(--ink-soft);\">" + stuckReframe + "</p>" +
        "</div>";
    }

    box.className = "wp-tank-result " + band;
    box.innerHTML =
      "<div class=\"tk-instant-top\"><span class=\"tk-instant-badge\">" + eyebrow + "</span></div>" +
      graceNoteHtml +
      affirmHtml +
      "<div class=\"band\">" + a.title + "</div>" +
      "<p class=\"rn-lead\">" + a.lead + "</p>" +
      (window.aogQuietPathCard ? window.aogQuietPathCard(band, route, L) : "") +
      stepsHtml +
      stuckHtml +
      breathe +
      toolsHtml +
      sensoryHtml +
      moreToolsHtml +
      followupHtml +
      support +
      "<p class=\"flag\">" + flag + "</p>";

    try { box.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) {}
  }

  function rnPickFb(o, aud, L) { return (o[aud] || o.adult)[L]; }
  function rnFade(box) { if (!box) return; try { box.classList.remove("rn-soft"); void box.offsetWidth; box.classList.add("rn-soft"); } catch (e) {} }
  function rnPostPills(aud, L) {
    var lab = (RN_COPY[aud] && RN_COPY[aud][L] && RN_COPY[aud][L].opts["4"]) || RN_COPY.adult.en.opts["4"];
    return ["small", "wave", "big", "over"].map(function (k) {
      return "<button type=\"button\" class=\"rn-deeper-btn\" onclick=\"aogRnPost('" + k + "')\">" + lab[k] + "</button>";
    }).join("");
  }
  function rnReturnButtons(L) {
    return "<div class=\"rn-fb-btns\" style=\"margin-top:10px;\">" +
      "<button type=\"button\" class=\"rn-tool-btn\" onclick=\"aogRnReturn()\">" + RN_FB.readyLabel[L] + "</button>" +
      "<button type=\"button\" class=\"rn-deeper-btn\" onclick=\"aogRnStay()\">" + RN_FB.stayLabel[L] + "</button>" +
      "</div>";
  }

  /* the post-test: compare "where's it at now?" to the first read, show the shift */
  window.aogRnPost = function (now) {
    var es = (typeof lang !== "undefined" && lang === "es"); var L = es ? "es" : "en";
    var aud = rnLastAud || window.aogRightNowAudience || "adult";
    var box = document.getElementById("rnFollowup"); if (!box) return;
    /* They've re-rated how they're doing — now reveal the next set of tools
       ("More ways to settle") inside Quiet Space. */
    if (typeof window.aogStationRevealOptions === "function") { try { window.aogStationRevealOptions(); } catch (e) {} }
    var order = { small: 0, wave: 1, big: 2, over: 3 };
    var lab = (RN_COPY[aud] && RN_COPY[aud][L] && RN_COPY[aud][L].opts["4"]) || RN_COPY.adult.en.opts["4"];
    var before = rnFirstSize || "over"; var bi = order[before], ni = order[now];
    var improved = ni < bi, lowNow = ni <= 1;
    var arrow = improved ? " ↓" : (ni > bi ? " ↑" : "");
    var shift = "<div class=\"rn-shift\">" + RN_FB.cameIn[L] + " <b>" + lab[before] + "</b> &nbsp;→&nbsp; " + RN_FB.nowLbl[L] + " <b>" + lab[now] + "</b>" + arrow + "</div>";
    if (improved || lowNow) {
      box.innerHTML = shift + "<div class=\"rn-fb-resp\">" + rnPickFb(improved ? RN_FB.yes : RN_FB.postOk, aud, L) + "</div>" + rnReturnButtons(L);
    } else {
      rnNoRounds++;
      if (rnNoRounds >= 2) {
        box.innerHTML = shift + "<div class=\"rn-fb-resp\">" + rnPickFb(RN_FB.no2, aud, L) + "</div>";
      } else {
        var alt = (RN_EXTRA[rnLastRoute] && RN_EXTRA[rnLastRoute].altKey) || "grounding";
        box.innerHTML = shift +
          "<div class=\"rn-fb-resp\">" + rnPickFb(RN_FB.no1, aud, L) + "</div>" +
          "<div class=\"rn-tools\"><button type=\"button\" class=\"rn-tool-btn\" onclick=\"if(window.toolOpen){window.toolOpen('" + alt + "');}\">" + RN_TOOL_LABEL[alt][L] + "</button></div>" +
          "<div class=\"rn-fb-q\">" + rnPickFb(RN_FB.again, aud, L) + "</div>" +
          "<div class=\"rn-fb-btns\">" + rnPostPills(aud, L) + "</div>";
      }
    }
    rnFade(box);
    try { box.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) {}
  };

  window.aogRnReturn = function () {
    var es = (typeof lang !== "undefined" && lang === "es"); var L = es ? "es" : "en";
    var aud = rnLastAud || "adult";
    var box = document.getElementById("rnFollowup"); if (!box) return;
    box.innerHTML = "<div class=\"rn-fb-resp\">" + rnPickFb(RN_FB.sendoff, aud, L) + "</div>" +
      "<div class=\"rn-fb-btns\"><button type=\"button\" class=\"rn-deeper-btn\" onclick=\"aogRnReset(true)\">" + RN_FB.freshLabel[L] + "</button></div>";
    rnFade(box);
  };

  window.aogRnStay = function () {
    var es = (typeof lang !== "undefined" && lang === "es"); var L = es ? "es" : "en";
    var aud = rnLastAud || "adult";
    var box = document.getElementById("rnFollowup"); if (!box) return;
    var routeTool = (RN_EXTRA[rnLastRoute] && RN_EXTRA[rnLastRoute].toolKey) || "breathing";
    var alt = (RN_EXTRA[rnLastRoute] && RN_EXTRA[rnLastRoute].altKey) || (routeTool === "grounding" ? "breathing" : "grounding");
    box.innerHTML = "<div class=\"rn-fb-resp\">" + rnPickFb(RN_FB.stayMsg, aud, L) + "</div>" +
      "<div class=\"rn-tools\">" +
        "<button type=\"button\" class=\"rn-tool-btn\" onclick=\"if(window.toolOpen){window.toolOpen('" + routeTool + "');}\">" + RN_TOOL_LABEL[routeTool][L] + "</button>" +
        "<button type=\"button\" class=\"rn-tool-btn\" onclick=\"if(window.toolOpen){window.toolOpen('" + alt + "');}\">" + RN_TOOL_LABEL[alt][L] + "</button>" +
      "</div>" +
      "<div class=\"rn-fb-q\">" + rnPickFb(RN_FB.again, aud, L) + "</div>" +
      "<div class=\"rn-fb-btns\">" + rnPostPills(aud, L) + "</div>";
    rnFade(box);
  };

  /* auto-reset so the next student starts fresh and private */
  window.aogRnReset = function (doScroll) {
    picks = {}; rnNoRounds = 0; rnFirstSize = null; rnLastRoute = null;
    document.querySelectorAll("#" + ROOT + " .tk-pill.on").forEach(function (p) { p.classList.remove("on"); p.setAttribute("aria-checked", "false"); });
    var box = document.getElementById(ROOT + "Result"); if (box) { box.hidden = true; box.innerHTML = ""; }
    if (doScroll) { var root = document.getElementById(ROOT); if (root) { try { root.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) {} } }
  };

  window.aogRenderRightNow = function () {
    var root = document.getElementById(ROOT);
    if (!root) return;
    var band = window.aogRightNowAudience || "35";
    var aud = (typeof RN_TIER !== "undefined" && RN_TIER[band]) || "adult";
    if (!RN_COPY[aud]) aud = "adult";
    var L = (typeof lang !== "undefined" && lang === "es") ? "es" : "en";
    var c = RN_COPY[aud][L];
    var sub = document.querySelector("#rightNowWrap .hero-tank-sub"); if (sub) sub.textContent = c.sub;
    var ey = root.querySelector(".ey"); if (ey) ey.textContent = c.ey;
    var h = root.querySelector(".wp-tank-head h2"); if (h) h.textContent = c.h;
    var intro = root.querySelector(".rn-intro"); if (intro) intro.textContent = c.intro;
    ["q1", "q2", "q3", "q4"].forEach(function (qid) {
      var el = root.querySelector(".tk-q[data-qid=\"" + qid + "\"]"); if (el) el.textContent = c[qid];
    });
    root.querySelectorAll(".tk-pill").forEach(function (pill) {
      var q = pill.dataset.q, st = pill.dataset.state;
      if (c.opts[q] && c.opts[q][st] != null) pill.textContent = c.opts[q][st];
    });
    var btn = document.querySelector("#rightNowBtn span:first-child"); if (btn) btn.textContent = c.btn;
    document.querySelectorAll("#rnAgesToggle .ages-btn").forEach(function (b) {
      var on = b.getAttribute("data-raud") === band;
      b.classList.toggle("active", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var pv = document.querySelector("#rightNowWrap .rn-privacy span"); if (pv) pv.textContent = RN_PRIV[L];
    var nav = document.getElementById("rnNavLabel"); if (nav) nav.textContent = RN_NAV[L];
    var tSum = document.querySelector("#rnTeacher .rn-teacher-sum"); if (tSum) tSum.textContent = RN_TEACHER[L].sum;
    var tBody = document.querySelector("#rnTeacher .rn-teacher-body"); if (tBody) tBody.textContent = RN_TEACHER[L].body;
    var tt = document.getElementById("rnTeacherTools");
    if (tt) {
      var _e = (L === "es");
      function _tb(key, label) { return "<button type=\"button\" onclick=\"if(window.toolOpen){window.toolOpen('" + key + "');}\">" + label + "</button>"; }
      tt.innerHTML =
        _tb("scenarios", _e ? "Cuando un estudiante…" : "When a student…") +
        _tb("findfunction", _e ? "Encuentra la función" : "Find the function") +
        _tb("classreset", (aud === "child") ? (_e ? "Momento en círculo" : "Circle Time") : (_e ? "Círculo comunitario" : "Community Circle")) +
        _tb("coreg", _e ? "Co-regulación" : "Co-regulation script") +
        _tb("innercoach", _e ? "Guía interior" : "Inner Coach") +
        _tb("makeitright", _e ? "Reparar" : "Make it right");
    }
    /* The Station Guide (.30dd) — the minute version of what's behind those
       doors, right in the drawer. The safety button rides here because the
       Quiet Space copy never had one; "say instead" is omitted because the
       full What To Say Instead panel sits directly below in this drawer. */
    var tg = document.getElementById("rnTeacherGuide");
    if (tg && typeof window.aogCalmGuideCoreHtml === "function") tg.innerHTML = window.aogCalmGuideCoreHtml(L === "es", { safety: true });
  };

  window.aogSetRightNowAudience = function (a) {
    if (typeof RN_TIER !== "undefined" && !RN_TIER[a]) a = "35";
    window.aogRightNowAudience = a;
    try { localStorage.setItem("aog.rightnow.audience", a); } catch (e) {}
    window.aogRenderRightNow();
  };

  function init() {
    if (!document.getElementById(ROOT)) return;
    try { window.aogRightNowAudience = localStorage.getItem("aog.rightnow.audience") || "35"; }
    catch (e) { window.aogRightNowAudience = "35"; }
    var _rm = { child: "35", teen: "68" }; if (_rm[window.aogRightNowAudience]) window.aogRightNowAudience = _rm[window.aogRightNowAudience];
    if (typeof RN_TIER === "undefined" || !RN_TIER[window.aogRightNowAudience]) window.aogRightNowAudience = "35";
    document.querySelectorAll("#" + ROOT + " .tk-pill").forEach(function (pill) {
      var q = pill.dataset.q, st = pill.dataset.state;
      pill.addEventListener("click", function () { setPick(q, st, pill); });
      pill.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); setPick(q, st, pill); }
      });
    });
    var btn = document.getElementById(ROOT + "Btn");
    if (btn) btn.addEventListener("click", show);
    window.aogRenderRightNow();
  }

  if (document.readyState !== "loading") { init(); }
  else { window.addEventListener("load", init); }
})();
