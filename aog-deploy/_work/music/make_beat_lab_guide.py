# -*- coding: utf-8 -*-
"""AOG-BEATLAB-GUIDE-V1 (2026-10-05) — beat-lab-guide.html: how to make a killer song on the Beat Lab, in pictures.

Jimmy: "May instructions be made for the beat pad on how to make killer songs!" The piano's picture guide is the model
(make_piano_guide.py, whose helpers and styles this reuses): few words, real pictures, prints on letter, English and
Spanish (each picture has a Spanish twin, bl-*-es.png). The pictures are parts of the real Beat Lab (music-pads.html),
taken in a browser at phone width. The song steps use the Mixing Desk's own words (Starts at bar, Plays … times).

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
    <a class="btn" href="/beat-lab">%s</a>
    <button class="btn go" type="button" onclick="window.print()">%s</button>
  </div>
</header>

<h1>%s</h1>
<p class="lede">%s</p>""" % (sp("← The Beat Lab", "← El laboratorio de ritmos"), sp("Print this", "Imprimir"),
                              sp("Make a killer song on the Beat Lab", "Haz una canción increíble en el laboratorio de ritmos"),
                              sp("Eight steps, from a beat to a whole song. Every picture is the real Beat Lab.",
                                 "Ocho pasos, de un ritmo a una canción entera. Cada imagen es el laboratorio de ritmos de verdad.")))

# ★ the machine
BODY.append("""<section>
  <h2><span class="n">&#9733;</span>%s</h2>
  <p class="sub">%s</p>
  <figure class="whole">%s<figcaption>%s</figcaption></figure>
  <div class="parts">
%s
  </div>
</section>""" % (
    sp("Start here · the Beat Lab", "Empieza aquí · el laboratorio de ritmos"),
    sp("Four banks of sixteen pads. Each bank has one job.", "Cuatro bancos de dieciséis pads. Cada banco tiene un trabajo."),
    img("bl-whole", "The whole Beat Lab: the bank, the sixteen pads, Play, Record the loop, tempo, swing, and the steps.",
        "Todo el laboratorio de ritmos: el banco, los dieciséis pads, Tocar, Grabar el bucle, tempo, swing y los pasos.", "max-width:330px"),
    sp("The whole Beat Lab on a phone.", "Todo el laboratorio de ritmos en un teléfono."),
    "\n".join([
        part("", "bl-bank", ("The Bank menu.", "El menú Banco."), ("Bank", "Banco"),
             ("A drums · B chords · C notes · D chops of a record.", "A batería · B acordes · C notas · D cortes de un disco.")),
        part("", "bl-pads", ("The sixteen pads.", "Los dieciséis pads."), ("The pads", "Los pads"),
             ("Tap one. The middle is loud, the edge is soft.", "Toca uno. El centro suena fuerte, el borde suave.")),
        part("", "bl-play", ("Play, Record the loop, Undo and Clear the loop.", "Tocar, Grabar el bucle, Deshacer y Borrar el bucle."),
             ("Play and record", "Tocar y grabar"),
             ("Record the loop keeps what you tap. Undo takes it back.", "Grabar el bucle guarda lo que tocas. Deshacer lo quita.")),
        part("", "bl-tempo", ("Tempo, Loop length, Line up taps to, and Swing.", "Tempo, Largo del bucle, Alinear los toques a y Swing."),
             ("The feel", "La sensación"), ("How fast, how long, and how much it bounces.", "Qué tan rápido, qué tan largo y cuánto rebota.")),
        part("", "bl-repeat", ("Repeat, Repeat speed, Click and Every hit full.", "Repetir, Velocidad de repetición, Clic y Todo a tope."),
             ("Helpers", "Ayudas"), ("Repeat plays a held pad in time. Click counts the beats.", "Repetir toca un pad sostenido a tiempo. Clic cuenta los tiempos.")),
        part("", "bl-file", ("Make the loop into a file, with Save, Send to the Mixing Desk and Send to the turntables.",
                             "Convertir el bucle en un archivo, con Guardar, Enviar a la mesa de mezclas y Enviar a los tocadiscos."),
             ("Keep it", "Guárdalo"), ("Your loop as one file, with no gap.", "Tu bucle en un archivo, sin pausa.")),
    ])))

BODY.append(how(1, ("Pick a beat", "Elige un ritmo"),
    ("Bank A. There are 105 beats to start from.", "Banco A. Hay 105 ritmos para empezar."),
    "bl-start", ("The Start from a beat menu.", "El menú Empieza con un ritmo."),
    [("Open Start from a beat. Pick one.", "Abre Empieza con un ritmo. Elige uno."),
     ("Press ▶ Play.", "Pulsa ▶ Tocar."),
     ("Does your head nod? Keep it. If not, pick another.", "¿Mueves la cabeza? Quédatelo. Si no, elige otro.")],
    ("Boom bap · 90 and Lo-fi study beat are great first beats.", "Boom bap · 90 y Lo-fi para estudiar son buenos primeros ritmos.")))

BODY.append(how(2, ("Make the beat yours", "Haz tuyo el ritmo"),
    ("Change one or two hits. Not more.", "Cambia uno o dos golpes. No más."),
    "bl-steps", ("The steps for pad 2, the snare: a hit on every second beat.", "Los pasos del pad 2, la caja: un golpe cada dos tiempos."),
    [("Tap a pad to pick it. Its steps show below.", "Toca un pad para elegirlo. Sus pasos salen abajo."),
     ("Tap a step to add a hit. Tap it again to take it away.", "Toca un paso para poner un golpe. Tócalo otra vez para quitarlo."),
     ("Listen. Keep what makes it better.", "Escucha. Quédate con lo que lo mejora.")],
    ("Turn on Record the loop. Tap the snare near its edge, just before beat 2. A soft “ghost” hit makes it groove.",
     "Activa Grabar el bucle. Toca la caja cerca del borde, justo antes del tiempo 2. Un golpe suave “fantasma” le da groove.")))

BODY.append(how(3, ("Set the feel", "Ajusta la sensación"),
    ("Tempo, length and swing.", "Tempo, largo y swing."),
    "bl-tempo", ("Tempo 90, Loop length 2 bars, Line up taps to 16th notes, Swing 58 %.",
                 "Tempo 90, Largo del bucle 2 compases, Alinear a semicorcheas, Swing 58 %."),
    [("Tempo: 85 to 95 for hip-hop. 120 to 128 for dance.", "Tempo: 85 a 95 para hip-hop. 120 a 128 para baile."),
     ("Loop length: 4 bars. That gives room for chords.", "Largo del bucle: 4 compases. Así caben los acordes."),
     ("Swing: 54 to 58 % makes it bounce.", "Swing: 54 a 58 % lo hace rebotar.")]))

BODY.append(how(4, ("Add chords", "Agrega acordes"),
    ("Bank B. Four chords, one a bar.", "Banco B. Cuatro acordes, uno por compás."),
    "bl-chords", ("Bank B, Chords: the electric piano in C major. Pad 1 is C, 5 is G, 6 is Am, 4 is F.",
                  "Banco B, Acordes: el piano eléctrico en Do mayor. El pad 1 es Do, el 5 es Sol, el 6 es La m, el 4 es Fa."),
    [("Pick Bank B. Pick an instrument and a key.", "Elige el Banco B. Elige un instrumento y un tono."),
     ("Turn on Record the loop.", "Activa Grabar el bucle."),
     ("On the first beat of each bar, tap pads 1, 5, 6, 4.", "En el primer tiempo de cada compás, toca los pads 1, 5, 6, 4."),
     ("Hold each pad for the whole bar.", "Sostén cada pad todo el compás.")],
    ("Those are the chords of a thousand hit songs. For a sad song, pick Minor.",
     "Son los acordes de mil canciones famosas. Para una canción triste, elige Menor.")))

BODY.append(how(5, ("Add the bass", "Agrega el bajo"),
    ("Bank C. Same key as the chords.", "Banco C. El mismo tono que los acordes."),
    "bl-notes", ("Bank C, Notes: a bass in a key, sixteen notes from low to high.", "Banco C, Notas: un bajo en un tono, dieciséis notas de grave a agudo."),
    [("Pick Bank C. Set Key and Scale the same as bank B (C, Major).", "Elige el Banco C. Pon Tono y Escala igual que el banco B (Do, Mayor)."),
     ("Now pads 1, 5, 6, 4 are the chords' own low notes.", "Ahora los pads 1, 5, 6, 4 son las notas graves de los acordes."),
     ("Record them with the kick: same bars, same pads as the chords.", "Grábalas con el bombo: los mismos compases y pads que los acordes.")],
    ("Kick and bass together hit hardest. Let the bass rest when the kick rests.",
     "El bombo y el bajo juntos golpean más fuerte. Deja descansar el bajo cuando descansa el bombo.")))

BODY.append(how(6, ("Sprinkle chops", "Espolvorea cortes"),
    ("Bank D. A record, cut in sixteen.", "Banco D. Un disco, cortado en dieciséis."),
    "bl-chops", ("Bank D, Chops of a record: Paper Kites, starting at bar 1.", "Banco D, Cortes de un disco: Cometas de papel, desde el compás 1."),
    [("Pick Bank D. Pick a record.", "Elige el Banco D. Elige un disco."),
     ("Tap the chops to find a sound you like.", "Toca los cortes para encontrar un sonido que te guste."),
     ("Record one in the gaps, near the end of bar 2 and bar 4.", "Graba uno en los huecos, cerca del final del compás 2 y del 4.")],
    ("A little goes a long way. One chop every two bars is plenty.",
     "Un poco rinde mucho. Un corte cada dos compases basta.")))

BODY.append(how(7, ("Mix it", "Mézclalo"),
    ("Each pad has its own volume, pitch and place.", "Cada pad tiene su volumen, tono y lugar."),
    "bl-padset", ("The pad settings: Volume, Pitch, Left and right, and Clear this pad's hits.",
                  "Los ajustes del pad: Volumen, Tono, Izquierda y derecha, y Borrar los golpes de este pad."),
    [("Kick and snare loudest. Hi-hats softer, about 70 %.", "Bombo y caja más fuertes. Charles más suave, unos 70 %."),
     ("Move the hi-hats a little left, the chops a little right.", "Mueve el charles un poco a la izquierda y los cortes un poco a la derecha."),
     ("Pitch a chop down 3 to 5 steps for a deep, dark sound.", "Baja un corte 3 a 5 semitonos para un sonido grave y oscuro.")]))

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
        ("On the Mixing Desk, put each part on its own track. Set where it Starts at bar and how many times it Plays.",
         "En la mesa de mezclas, pon cada parte en su pista. Elige en qué compás Empieza y cuántas veces Suena."),
    ]),
    sp("Intro", "Intro"), sp("4 bars", "4 compases"), sp("Verse", "Estrofa"), sp("8 bars", "8 compases"),
    sp("Chorus", "Coro"), sp("8 bars", "8 compases"), sp("Verse", "Estrofa"), sp("8 bars", "8 compases"),
    sp("Chorus", "Coro"), sp("8 bars", "8 compases"), sp("Ending", "Final"), sp("4 bars", "4 compases")))

BODY.append("""<section>
  <h2><span class="n">&#9889;</span>%s</h2>
  <ul class="secrets">
%s
  </ul>
</section>""" % (sp("Five secrets of killer songs", "Cinco secretos de las canciones increíbles"), "\n".join(
    "    <li><b>%s</b><span>%s</span></li>" % (sp(*a), sp(*b)) for a, b in [
        (("Leave space.", "Deja espacio."), ("The quiet gaps are part of the groove.", "Los silencios son parte del groove.")),
        (("Kick and bass together.", "Bombo y bajo juntos."), ("They hit as one, so the song feels strong.", "Golpean como uno, así la canción se siente fuerte.")),
        (("Soft and loud.", "Suave y fuerte."), ("Soft hits between loud ones make it move. Tap near the edge.", "Golpes suaves entre los fuertes le dan movimiento. Toca cerca del borde.")),
        (("Change something every 4 or 8 bars.", "Cambia algo cada 4 u 8 compases."), ("Add a sound, take one away, or add a fill.", "Agrega un sonido, quita uno o pon un relleno.")),
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
        (("The chords and bass clash", "Los acordes y el bajo chocan"), ("Bank C needs the same Key and Scale as bank B.", "El banco C necesita el mismo Tono y Escala que el banco B.")),
        (("I played, but it did not stay", "Toqué, pero no se quedó"), ("Turn on Record the loop first. It turns red.", "Primero activa Grabar el bucle. Se pone rojo.")),
        (("My beat is gone", "Mi ritmo desapareció"), ("Press Undo. Press it again to go back further.", "Pulsa Deshacer. Púlsalo otra vez para volver más atrás.")),
        (("The pads feel late", "Los pads se sienten tarde"), ("Bluetooth headphones add a delay. Use the phone's speaker or wired headphones.",
                                                               "Los audífonos Bluetooth agregan retraso. Usa el altavoz del teléfono o audífonos con cable.")),
    ]), sp("The Beat Lab · Architecture of Grace · your loops stay on this device",
           "El laboratorio de ritmos · Architecture of Grace · tus bucles se quedan en este dispositivo")))


def build():
    src = open(os.path.join(ROOT, "drums-guide.html"), encoding="utf-8").read()
    head = src.split("</head>", 1)[0]
    rep = [("<title>The Drum Machine &mdash; Picture Guide</title>", "<title>The Beat Lab &mdash; Make a Song</title>"),
           ('<meta name="description" content="The drum machine in pictures. Almost no reading. Print it and keep it next to the machine.">',
            '<meta name="description" content="How to make a killer song on the Beat Lab, in eight steps with pictures: a beat, chords, bass, chops, the mix and the song.">')]
    for a, b in rep:
        assert head.count(a) == 1, a
        head = head.replace(a, b)
    head = re.sub(r"<!-- AOG-DRUMPIC-V1 .*?-->",
                  "<!-- AOG-BEATLAB-GUIDE-V1 (2026-10-05) — Jimmy: \"May instructions be made for the beat pad on how to make killer\n"
                  "     songs!\" Eight steps in pictures, from a beat to a whole song, in English and Spanish, pictures included.\n"
                  "     Built by _work/music/make_beat_lab_guide.py. -->", head, count=1, flags=re.S)
    i = head.rfind("</style>")
    head = head[:i] + CSS + head[i:]
    page = head + "</head>\n<body>\n<script src=\"/aog-grace.js\" defer></script>\n" + "\n".join(BODY) + "\n" + LANG_JS + "\n<script src=\"/aog-topbar.js\"></script>\n</body>\n</html>\n"
    open(os.path.join(ROOT, "beat-lab-guide.html"), "w", encoding="utf-8").write(page)
    print("beat-lab-guide.html written")


if __name__ == "__main__":
    build()
