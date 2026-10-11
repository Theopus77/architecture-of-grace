
(function(){
  function patch(){
    var T = window.TOURS;
    if (!T || !T.welcome || T.welcome.__aogRefreshed) return;

    /* 1. The ecosystem star, without the track that is switched off. */
    if (T.welcome[4] && T.welcome[4].body){
      T.welcome[4].body.en = "Everything here speaks one shared language of grace. Want the map? "
        + "The Framework page holds the full ecosystem star \u2014 teachers, specialists, outside "
        + "providers, leadership, families, children, and adults.";
      T.welcome[4].body.es = "Todo aqu\u00ed habla un mismo lenguaje de gracia. \u00bfQuieres el mapa? "
        + "La p\u00e1gina del Marco tiene la estrella completa del ecosistema \u2014 docentes, "
        + "especialistas, proveedores externos, liderazgo, familias, ni\u00f1os y adultos.";
    }

    /* 2. Explore, describing the doors that are actually in the menu. */
    if (T.welcome[5] && T.welcome[5].body){
      T.welcome[5].body.en = "Open Explore for the Framework, the Library, the calm and "
        + "regulation tools, Family Mode, Words of Encouragement, and the school Dashboard \u2014 "
        + "all open to read and browse, no sign-up, no code.";
      T.welcome[5].body.es = "Abre \u201cExplorar\u201d para el Marco, la Biblioteca, las "
        + "herramientas de calma y regulaci\u00f3n, el Modo Familia, Palabras de Aliento y el Panel "
        + "escolar \u2014 todo abierto para leer y explorar, sin registro y sin c\u00f3digo.";
    }

    /* 3. Talk It Out, which the tour predates. Placed after the
          Self-Reflection step, where the whole-class tool belongs. */
    var hasTalk = T.welcome.some(function(s){ return s.title && /Talk It Out/.test(s.title.en || ""); });
    if (!hasTalk){
      T.welcome.splice(4, 0, {
        sel: null,
        title: { en: "Talk It Out", es: "Hablemos" },
        body: {
          en: "A board for the whole room. Four decks of discussion prompts for grades 6\u20138 \u2014 "
            + "with a push-the-why layer, a think timer, and a who\u2019s-up cycler so the same three "
            + "hands don\u2019t answer everything. Open it from Explore, or from your dashboard.",
          es: "Un tablero para toda el aula. Cuatro mazos de preguntas para 6.\u00ba a 8.\u00ba grado \u2014 "
            + "con una capa para profundizar, un temporizador y un selector de turnos para que no "
            + "respondan siempre los mismos. \u00c1brelo desde \u201cExplorar\u201d o desde tu panel."
        }
      });
    }

    /* 4. The dashboard opens on three modes now, not ten flat tabs. */
    if (T.dash && T.dash[1]){
      T.dash[1].sel = "#dashModes";
      T.dash[1].title = { en: "Six ways in", es: "Seis formas de entrar" };
      T.dash[1].body = {
        en: "The dashboard opens on six doors \u2014 Overview for what the group needs today, "
          + "Students for one child\u2019s report, Check-ins for hearing from students \u2014 "
          + "the daily check-in, the exit slip and the deeper reflection, one door, three "
          + "moments \u2014 IEP for goals, data and meeting paperwork, Trends for what is "
          + "changing, and Set up for handing it out, exporting and connecting. The tabs "
          + "underneath hold the rest.",
        es: "El panel abre en seis puertas \u2014 Panorama para lo que el grupo necesita hoy, "
          + "Estudiantes para el informe de un ni\u00f1o, Registros para escuchar a los "
          + "estudiantes \u2014 el registro diario, la salida del d\u00eda y la autorreflexi\u00f3n "
          + "m\u00e1s profunda, una puerta, tres momentos \u2014 IEP para metas, datos y "
          + "documentaci\u00f3n, Tendencias para lo que est\u00e1 cambiando, y Configurar para "
          + "repartirlo, exportar y conectar. Las pesta\u00f1as de abajo tienen lo dem\u00e1s."
      };
    }

    T.welcome.__aogRefreshed = true;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", patch);
  else patch();
  setTimeout(patch, 900);
  setTimeout(patch, 2500);
})();
