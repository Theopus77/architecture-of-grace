# -*- coding: utf-8 -*-
"""AOG-BEATLAB-GUIDE-V1 (2026-10-05), V2 (2026-10-19) — beat-lab-guide.html: Make a hit on the Drum Machine, in pictures.

Jimmy: "May instructions be made for the beat pad on how to make killer songs!" The piano's picture guide is the model
(make_piano_guide.py, whose helpers and styles this reuses): few words, real pictures, prints on letter, English and
Spanish (each picture has a Spanish twin, bl-*-es.png). The pictures are parts of the real Drum Machine (music-pads.html),
taken inside the Studio at phone width by music-handoff/tools/guides/beat_lab_shots.js (run it first when the
Drum Machine changes). The song steps use the Mixing Desk's own words (Starts at bar, Plays … times).

  python3 _work/music/make_beat_lab_guide.py        (from aog-deploy/)
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
from make_piano_guide import esc, sp, img, part, EXTRA_CSS, LANG_JS  # noqa: E402

CSS = EXTRA_CSS + """
/* AOG-BEATLAB-GUIDE-V1 */
.how { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.15fr); gap:1rem; align-items:start; background:var(--card);
  border:1px solid var(--line); border-radius:12px; padding:.9rem; break-inside:avoid; page-break-inside:avoid; }
.how img { display:block; width:100%; max-width:390px; height:auto; border-radius:8px; margin:0 auto; }
.how ol { margin:0; padding-left:1.25rem; }
.how li { margin:0 0 .45rem; }
.try { margin:.7rem 0 0; padding:.55rem .75rem; border-left:4px solid var(--play); background:var(--chip); border-radius:0 8px 8px 0;
  font-size:.93rem; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.try b { color:var(--ink); }
@media (max-width:700px){ .how { grid-template-columns:1fr; } }
.secrets { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(auto-fit,minmax(14rem,1fr)); gap:.6rem; }
.secrets li { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:.75rem .85rem; break-inside:avoid; page-break-inside:avoid; }
.secrets b { display:block; font-size:1rem; margin-bottom:.15rem; }
.secrets span { color:var(--muted); font-size:.92rem; }
.shape { display:grid; grid-template-columns:repeat(auto-fit,minmax(6.5rem,1fr)); gap:.4rem; margin:.6rem 0 0; }
.shape div { border-radius:8px; padding:.45rem .5rem; text-align:center; font-weight:700; font-size:.9rem; color:#1a232c;
  -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.shape small { display:block; font-weight:600; font-size:.78rem; color:#3c4650; }
.s-in { background:#d9e6ee; } .s-ve { background:#f1dfb8; } .s-ch { background:#f4c7b4; }
@media print { .how img { max-width:260px; } }
"""


def how(n, title, sub, pic, alt, items, tip=None):
    lis = "\n".join("      <li>%s</li>" % sp(*x) for x in items)
    t = ('\n    <p class="try"><b>%s</b> %s</p>' % (sp("Try this:", "Prueba esto:"), sp(*tip))) if tip else ""
    return ('<section>\n  <h2><span class="n">%s</span>%s</h2>\n  <p class="sub">%s</p>\n  <div class="how">\n    %s\n    <div>\n    <ol>\n%s\n    </ol>%s\n    </div>\n  </div>\n</section>'
            % (n, sp(*title), sp(*sub), img(pic, alt[0], alt[1]), lis, t))


BODY = []
BODY.append("""<div class="wrap">

<header>
  <a class="brand" href="/">Architecture of Grace</a>
  <div class="tools">
    <a class="btn" href="/drum-machine">%s</a>
    <button class="btn go" type="button" onclick="window.print()">%s</button>
  </div>
</header>

<h1>%s</h1>
<p class="lede">%s</p>""" % (sp("← The Drum Machine", "← La caja de ritmos"), sp("Print this", "Imprimir"),
                              sp("Make a hit on the Drum Machine", "Haz un éxito en la caja de ritmos"),
                              sp("Eight steps, from a beat to a whole song. Every picture is the real Drum Machine, as it looks in the Studio.",
                                 "Ocho pasos, de un ritmo a una canción entera. Cada imagen es la caja de ritmos de verdad, como se ve en el Estudio.")))

# ★ the machine
BODY.append("""<section>
  <h2><span class="n">&#9733;</span>%s</h2>
  <p class="sub">%s</p>
  <figure class="whole">%s<figcaption>%s</figcaption></figure>
  <div class="parts">
%s
  </div>
</section>""" % (
    sp("Start here · the Drum Machine", "Empieza aquí · la caja de ritmos"),
    sp("Four banks of 24 pads. Each bank has one job.", "Cuatro bancos de 24 pads. Cada banco tiene un trabajo."),
    img("bl-whole", "The whole Drum Machine on a phone: the 24 pads, the bank, the kits, tempo, loop length, Play, Record the loop, and the beat.",
        "Toda la caja de ritmos en un teléfono: los 24 pads, el banco, las baterías, el tempo, el largo del bucle, Tocar, Grabar el bucle y el ritmo.", "max-width:330px"),
    sp("The whole Drum Machine on a phone.", "Toda la caja de ritmos en un teléfono."),
    "\n".join([
        part("", "bl-bank", ("The Bank menu.", "El menú Banco."), ("Bank", "Banco"),
             ("A drums · B chords · C notes · D chops of a record.", "A batería · B acordes · C notas · D cortes de un disco.")),
        part("", "bl-pads", ("The 24 pads.", "Los 24 pads."), ("The pads", "Los pads"),
             ("Tap one. Near the middle plays louder.", "Toca uno. Cerca del centro suena más fuerte.")),
        part("", "bl-play", ("Play, Record the loop, Undo and Clear the loop.", "Tocar, Grabar el bucle, Deshacer y Borrar el bucle."),
             ("Play and record", "Tocar y grabar"),
             ("Record the loop keeps what you tap. Undo takes it back.", "Grabar el bucle guarda lo que tocas. Deshacer lo quita.")),
        part("", "bl-tempo", ("Tempo and Loop length.", "Tempo y Largo del bucle."),
             ("The feel", "La sensación"), ("How fast, and how many bars.", "Qué tan rápido y cuántos compases.")),
        part("", "bl-repeat", ("More, Timing and repeat: Line up taps to, Swing, Repeat, Repeat speed, Click and Every hit full.",
                               "Más, Ritmo y repetición: Alinear los toques a, Swing, Repetir, Velocidad de repetición, Clic y Todo a tope."),
             ("Helpers", "Ayudas"), ("In More, under Timing and repeat: swing, Repeat and Click.", "En Más, en Ritmo y repetición: swing, Repetir y Clic.")),
        part("", "bl-file", ("Make the loop into a file, with Save as .wav, Send to the Mixing Desk and Send to the turntables.",
                             "Convertir el bucle en un archivo, con Guardar como .wav, Enviar a la mesa de mezclas y Enviar a los tocadiscos."),
             ("Keep it", "Guárdalo"), ("Your loop as one file, with no gap.", "Tu bucle en un archivo, sin pausa.")),
    ])))

BODY.append(how(1, ("Pick a beat", "Elige un ritmo"),
    ("Bank A. 198 beats in 24 styles.", "Banco A. 198 ritmos en 24 estilos."),
    "bl-start", ("Beat: ◀, the Style menu (Famous styles), ▶, the Beat menu (Boom bap, 90s hip-hop), and the line that says what is playing.",
                 "Ritmo: ◀, el menú Estilo (Estilos famosos), ▶, el menú Ritmo (Boom bap, hip-hop de los 90) y la línea que dice qué suena."),
    [("Under Beat, pick a style. Then pick a beat.", "En Ritmo, elige un estilo. Luego elige un ritmo."),
     ("Press ▶ Play.", "Pulsa ▶ Tocar."),
     ("Tap ◀ or ▶ to hear the next beat. It keeps playing.", "Toca ◀ o ▶ para oír el siguiente ritmo. Sigue sonando."),
     ("Each beat brings its own drums and tempo. Most are 4 bars, with a fill at the end.", "Cada ritmo trae su batería y su tempo. Casi todos son de 4 compases, con un redoble al final."),
     ("Does your head nod? Keep it. If not, try another.", "¿Mueves la cabeza? Quédatelo. Si no, prueba otro.")],
    ("Famous styles → Boom bap (90s hip-hop). Or Trap, drill and phonk → Ice-cold trap.",
     "Estilos famosos → Boom bap (hip-hop de los 90). O Trap, drill y phonk → Trap helado.")))

BODY.append(how(2, ("Make the beat yours", "Haz tuyo el ritmo"),
    ("Change one or two hits. Not more.", "Cambia uno o dos golpes. No más."),
    "bl-steps", ("The steps for pad 1, the kick: every bar of the loop, each beat in four steps.",
                 "Los pasos del pad 1, el bombo: cada compás del bucle, cada tiempo en cuatro pasos."),
    [("Tap a pad to pick it. Its steps show below the beat.", "Toca un pad para elegirlo. Sus pasos salen bajo el ritmo."),
     ("Tap a step to add a hit. Tap it again to take it away.", "Toca un paso para poner un golpe. Tócalo otra vez para quitarlo."),
     ("Listen. Keep what makes it better.", "Escucha. Quédate con lo que lo mejora.")],
    ("Turn on Record the loop. Tap the snare near its edge, just before beat 2. A soft “ghost” hit makes it groove.",
     "Activa Grabar el bucle. Toca la caja cerca del borde, justo antes del tiempo 2. Un golpe suave “fantasma” le da groove.")))

BODY.append(how(3, ("Set the feel", "Ajusta la sensación"),
    ("Tempo, length and swing.", "Tempo, largo y swing."),
    "bl-tempo", ("Tempo 90 beats a minute, Loop length 4 bars.", "Tempo 90 pulsos por minuto, Largo del bucle 4 compases."),
    [("Tempo: 85 to 95 for hip-hop. 120 to 128 for dance.", "Tempo: 85 a 95 para hip-hop. 120 a 128 para baile."),
     ("Loop length: the beat sets it. Pick 8 or 16 bars for a longer part.", "Largo del bucle: el ritmo lo pone. Elige 8 o 16 compases para una parte más larga."),
     ("Swing is in More → Timing and repeat. Each beat brings its own. 54 to 58 % makes it bounce.",
      "El swing está en Más → Ritmo y repetición. Cada ritmo trae el suyo. 54 a 58 % lo hace rebotar.")]))

BODY.append(how(4, ("Add chords", "Agrega acordes"),
    ("Bank B. Four chords, one a bar.", "Banco B. Cuatro acordes, uno por compás."),
    "bl-chords", ("Bank B, Chords: the electric piano in C major. Pad 1 is C, 5 is G, 6 is Am, 4 is F. Pads 9 to 24 are richer chords.",
                  "Banco B, Acordes: el piano eléctrico en Do mayor. El pad 1 es Do, el 5 es Sol, el 6 es La m, el 4 es Fa. Los pads 9 a 24 son acordes más ricos."),
    [("Pick Bank B. Pick an instrument and a key.", "Elige el Banco B. Elige un instrumento y un tono."),
     ("Turn on Record the loop.", "Activa Grabar el bucle."),
     ("On the first beat of each bar, tap pads 1, 5, 6, 4.", "En el primer tiempo de cada compás, toca los pads 1, 5, 6, 4."),
     ("Hold each pad for the whole bar.", "Sostén cada pad todo el compás.")],
    ("Those are the chords of a thousand hit songs. For a sad song, pick Minor. For a smooth sound, try pads 9 to 24.",
     "Son los acordes de mil canciones famosas. Para una canción triste, elige Menor. Para un sonido suave, prueba los pads 9 a 24.")))

BODY.append(how(5, ("Add the bass", "Agrega el bajo"),
    ("Bank C. Same key as the chords.", "Banco C. El mismo tono que los acordes."),
    "bl-notes", ("Bank C, Notes: the electric bass in a key, 24 notes from low to high.", "Banco C, Notas: el bajo eléctrico en un tono, 24 notas de grave a agudo."),
    [("Pick Bank C. Set Key and Scale the same as bank B (C, Major).", "Elige el Banco C. Pon Tono y Escala igual que el banco B (Do, Mayor)."),
     ("Now pads 1, 5, 6, 4 are the chords' own low notes.", "Ahora los pads 1, 5, 6, 4 son las notas graves de los acordes."),
     ("Record them with the kick: same bars, same pads as the chords.", "Grábalas con el bombo: los mismos compases y pads que los acordes.")],
    ("Kick and bass together hit hardest. Let the bass rest when the kick rests.",
     "El bombo y el bajo juntos golpean más fuerte. Deja descansar el bajo cuando descansa el bombo.")))

BODY.append(how(6, ("Sprinkle chops", "Espolvorea cortes"),
    ("Bank D. A record, cut into 24 chops.", "Banco D. Un disco, cortado en 24 cortes."),
    "bl-chops", ("Bank D, Chops of a record: Paper Kites at 90, starting at bar 1, each pad plays 2 beats.",
                 "Banco D, Cortes de un disco: Cometas de papel a 90, desde el compás 1, cada pad toca 2 tiempos."),
    [("Pick Bank D. Pick a record. Press Use its tempo.", "Elige el Banco D. Elige un disco. Pulsa Usar su tempo."),
     ("Tap the chops to find a sound you like.", "Toca los cortes para encontrar un sonido que te guste."),
     ("Record one in the gaps, near the end of bar 2 and bar 4.", "Graba uno en los huecos, cerca del final del compás 2 y del 4.")],
    ("A little goes a long way. One chop every two bars is plenty.",
     "Un poco rinde mucho. Un corte cada dos compases basta.")))

BODY.append(how(7, ("Mix it", "Mézclalo"),
    ("Each pad has its own volume, pitch and place.", "Cada pad tiene su volumen, tono y lugar."),
    "bl-padset", ("A pad's settings, under its steps: Volume, Pitch, Left and right, Reset this pad and Clear this pad's hits.",
                  "Los ajustes de un pad, bajo sus pasos: Volumen, Tono, Izquierda y derecha, Restablecer este pad y Borrar los golpes de este pad."),
    [("Open the pad's settings under its steps.", "Abre los ajustes del pad bajo sus pasos."),
     ("Kick and snare loudest. Hi-hats softer, about 70 %.", "Bombo y caja más fuertes. Charles más suave, unos 70 %."),
     ("Move the hi-hats a little left, the chops a little right.", "Mueve el charles un poco a la izquierda y los cortes un poco a la derecha."),
     ("Pitch a chop down 3 to 5 steps for a deep, dark sound.", "Baja un corte 3 a 5 semitonos para un sonido grave y oscuro.")],
    ("Add an effect adds echo, reverb and more to the whole loop. One is often enough.",
     "Agregar un efecto pone eco, reverberación y más a todo el bucle. Muchas veces basta con uno.")))

BODY.append("""<section>
  <h2><span class="n">8</span>%s</h2>
  <p class="sub">%s</p>
  <div class="how">
    %s
    <div>
    <ol>
%s
    </ol>
    <div class="shape">
      <div class="s-in">%s<small>%s</small></div>
      <div class="s-ve">%s<small>%s</small></div>
      <div class="s-ch">%s<small>%s</small></div>
      <div class="s-ve">%s<small>%s</small></div>
      <div class="s-ch">%s<small>%s</small></div>
      <div class="s-in">%s<small>%s</small></div>
    </div>
    </div>
  </div>
</section>""" % (
    sp("Build the song", "Arma la canción"),
    sp("A song is your loop in parts: quiet, fuller, then everything.", "Una canción es tu bucle en partes: suave, más lleno, y luego todo."),
    img("bl-file", "Make the loop into a file: your loop is ready, with Save as .wav, Send to the Mixing Desk and Send to the turntables.",
        "Convertir el bucle en un archivo: tu bucle está listo, con Guardar como .wav, Enviar a la mesa de mezclas y Enviar a los tocadiscos."),
    "\n".join("      <li>%s</li>" % sp(*x) for x in [
        ("Chorus: with everything playing, press Make the loop into a file, then Send to the Mixing Desk.",
         "Coro: con todo sonando, pulsa Convertir el bucle en un archivo y luego Enviar a la mesa de mezclas."),
        ("Verse: on bank D, Clear this pad's hits on the chops. Make a file and send it.",
         "Estrofa: en el banco D, Borrar los golpes de este pad en los cortes. Haz un archivo y envíalo."),
        ("Intro: clear the drums and the bass too, so only chords play. Make a file and send it.",
         "Intro: borra también la batería y el bajo, así solo suenan los acordes. Haz un archivo y envíalo."),
        ("Undo brings every part back.", "Deshacer recupera cada parte."),
        ("Open the Mixing Desk, the last room in the Studio. Put each part on its own track. Set where it Starts at bar and how many times it Plays.",
         "Abre la mesa de mezclas, la última sala del Estudio. Pon cada parte en su pista. Elige en qué compás Empieza y cuántas veces Suena."),
    ]),
    sp("Intro", "Intro"), sp("4 bars", "4 compases"), sp("Verse", "Estrofa"), sp("8 bars", "8 compases"),
    sp("Chorus", "Coro"), sp("8 bars", "8 compases"), sp("Verse", "Estrofa"), sp("8 bars", "8 compases"),
    sp("Chorus", "Coro"), sp("8 bars", "8 compases"), sp("Ending", "Final"), sp("4 bars", "4 compases")))

BODY.append("""<section>
  <h2><span class="n">&#9889;</span>%s</h2>
  <ul class="secrets">
%s
  </ul>
</section>""" % (sp("Five secrets of hit songs", "Cinco secretos de las canciones de éxito"), "\n".join(
    "    <li><b>%s</b><span>%s</span></li>" % (sp(*a), sp(*b)) for a, b in [
        (("Leave space.", "Deja espacio."), ("The quiet gaps are part of the groove.", "Los silencios son parte del groove.")),
        (("Kick and bass together.", "Bombo y bajo juntos."), ("They hit as one, so the song feels strong.", "Golpean como uno, así la canción se siente fuerte.")),
        (("Soft and loud.", "Suave y fuerte."), ("Soft hits between loud ones make it move. Tap away from the middle.", "Golpes suaves entre los fuertes le dan movimiento. Toca lejos del centro.")),
        (("Change something every 4 or 8 bars.", "Cambia algo cada 4 u 8 compases."), ("Add a sound, take one away, or add a fill. The beats already fill bar 4.", "Agrega un sonido, quita uno o pon un redoble. Los ritmos ya redoblan en el compás 4.")),
        (("Stop before the chorus.", "Para antes del coro."), ("One beat of silence, then everything at once.", "Un tiempo de silencio y luego todo a la vez.")),
    ])))

BODY.append("""<section>
  <h2><span class="n">?</span>%s</h2>
  <ul class="fix">
%s
  </ul>
</section>
<footer>
  %s
</footer>

</div>""" % (sp("Nothing is happening?", "¿No pasa nada?"), "\n".join(
    '    <li><span class="q">?</span><div><b>%s</b><span>%s</span></div></li>' % (sp(*a), sp(*b)) for a, b in [
        (("No sound", "No hay sonido"), ("Tap a pad once. A phone wakes its sound on the first tap. Turn the phone's volume up.",
                                        "Toca un pad una vez. El teléfono despierta su sonido con el primer toque. Sube el volumen del teléfono.")),
        (("The pads look grey", "Los pads se ven grises"), ("The sounds are on their way. Wait for “Ready”.", "Los sonidos están en camino. Espera a que diga “Listo”.")),
        (("The drums changed", "La batería cambió"), ("Each beat brings its own kit. Pick another kit under Pads 1 to 8.", "Cada ritmo trae su batería. Elige otra en Pads 1 a 8.")),
        (("The chords and bass clash", "Los acordes y el bajo chocan"), ("Bank C needs the same Key and Scale as bank B.", "El banco C necesita el mismo Tono y Escala que el banco B.")),
        (("I played, but it did not stay", "Toqué, pero no se quedó"), ("Turn on Record the loop first. It turns red.", "Primero activa Grabar el bucle. Se pone rojo.")),
        (("My beat is gone", "Mi ritmo desapareció"), ("Press Undo. Press it again to go back further.", "Pulsa Deshacer. Púlsalo otra vez para volver más atrás.")),
        (("The pads feel late", "Los pads se sienten tarde"), ("Bluetooth headphones add a delay. Use the phone's speaker or wired headphones.",
                                                               "Los audífonos Bluetooth agregan retraso. Usa el altavoz del teléfono o audífonos con cable.")),
    ]), sp("The Drum Machine · Architecture of Grace · your loops stay on this device",
           "La caja de ritmos · Architecture of Grace · tus bucles se quedan en este dispositivo")))


def build():
    src = open(os.path.join(ROOT, "drums-guide.html"), encoding="utf-8").read()
    head = src.split("</head>", 1)[0]
    rep = [("<title>The Drum Machine &mdash; Picture Guide</title>", "<title>Make a Hit on the Drum Machine</title>"),
           ('<meta name="description" content="The drum machine in pictures. Almost no reading. Print it and keep it next to the machine.">',
            '<meta name="description" content="Make a hit on the Drum Machine, in eight steps with pictures: a beat, chords, bass, chops, the mix and the song.">')]
    for a, b in rep:
        assert head.count(a) == 1, a
        head = head.replace(a, b)
    head = re.sub(r"<!-- AOG-DRUMPIC-V1 .*?-->",
                  "<!-- AOG-BEATLAB-GUIDE-V1 (2026-10-05) — Jimmy: \"May instructions be made for the beat pad on how to make killer\n"
                  "     songs!\" Eight steps in pictures, from a beat to a whole song, in English and Spanish, pictures included.\n"
                  "     AOG-BEATLAB-GUIDE-V2 (2026-10-19) — Jimmy: \"update the lesson pages and HOW TO MAKE A KILLER SONG … change the\n"
                  "     name of it as well\": now Make a hit on the Drum Machine; the Drum Machine as it is in the Studio (198 beats,\n"
                  "     24 pads, More). Pictures: music-handoff/tools/guides/beat_lab_shots.js. Built by _work/music/make_beat_lab_guide.py. -->", head, count=1, flags=re.S)
    i = head.rfind("</style>")
    head = head[:i] + CSS + head[i:]
    page = head + "</head>\n<body>\n<script src=\"/aog-grace.js\" defer></script>\n" + "\n".join(BODY) + "\n" + LANG_JS + "\n<script src=\"/aog-topbar.js\"></script>\n</body>\n</html>\n"
    open(os.path.join(ROOT, "beat-lab-guide.html"), "w", encoding="utf-8").write(page)
    print("beat-lab-guide.html written")


if __name__ == "__main__":
    build()
