# -*- coding: utf-8 -*-
"""AOG-MASTERING-PIANO-V1 (2026-10-03) — mastering-piano.html, the piano's manual.

The same course shape as mastering-drums.html (Jimmy's Mastering course): short lessons done in order with the
instrument open, each with Try it, Listen for and Check yourself, pictures of the real instrument at the lesson
that teaches them, a practice plan and a fix-it list. Written in English and Spanish; the words swap with the
site's EN/ES switch (aog-topbar.js) and each picture swaps with its Spanish twin.

  python3 _work/music/make_mastering_piano.py        (from aog-deploy/)
"""
import html, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))


def esc(t):
    return html.escape(t, quote=True)


def bl(tag, en, es, attrs=""):
    """a block in both languages; the text may hold <b>"""
    return '<%s%s data-en="%s" data-es="%s">%s</%s>' % (tag, attrs, esc(en), esc(es), en, tag)


def fig(name, en, es):
    return ('<figure class="mg-fig"><img src="/%s.png" data-en-src="/%s.png" data-es-src="/%s-es.png" alt="%s" data-en-alt="%s" data-es-alt="%s" loading="lazy">'
            '<figcaption data-en="%s" data-es="%s">%s</figcaption></figure>' % (name, name, name, esc(en), esc(en), esc(es), esc(en), esc(es), en))


def lst(tag, items):
    return "<%s>%s</%s>" % (tag, "".join(bl("li", a, b) for a, b in items), tag)


LESSONS = []


def lesson(n, slug, title, intro, figure, tryit, listen, check, extra=None):
    LESSONS.append(dict(n=n, slug=slug, title=title, intro=intro, figure=figure, tryit=tryit, listen=listen, check=check, extra=extra or []))


lesson(1, "find-your-way-around", ("Find your way around", "Conoce el piano"),
  [("The piano has four parts, from top to bottom: <b>Instrument</b>, <b>Chords</b>, <b>Keys</b>, and the <b>Sound</b> dial.",
    "El piano tiene cuatro partes, de arriba abajo: <b>Instrumento</b>, <b>Acordes</b>, <b>Teclas</b> y el dial de <b>Sonido</b>.")],
  ("pp-whole", "The whole piano: Instrument, Chords with six pads, Keys, the Sound dial and Send to the turntables.", "Todo el piano: Instrumento, Acordes con seis pads, Teclas, el dial de Sonido y Enviar a los platos."),
  [("Open <b>Instrument</b> and pick <b>Grand piano</b>. Wait until the line under it says <b>Ready</b>.", "Abre <b>Instrumento</b> y elige <b>Piano de cola</b>. Espera a que la línea de abajo diga <b>Listo</b>."),
   ("Tap pad 1, then pad 4, then pad 5, then pad 1 again.", "Toca el pad 1, luego el 4, luego el 5 y otra vez el 1."),
   ("Tap three keys on the keyboard: one low, one in the middle, one high.", "Toca tres teclas del teclado: una grave, una en el medio y una aguda.")],
  ("A pad plays three or more notes at once: a chord. A key plays one note.", "Un pad toca tres o más notas a la vez: un acorde. Una tecla toca una nota."),
  [("I can point to the Instrument menu, the pads, the pattern menu, Play, the keys and the Sound dial.", "Puedo señalar el menú Instrumento, los pads, el menú de patrones, Tocar, las teclas y el dial de Sonido."),
   ("I heard the difference between a chord and one note.", "Oí la diferencia entre un acorde y una nota.")])

lesson(2, "a-song-in-two-taps", ("A song in two taps", "Una canción en dos toques"),
  [("A <b>chord pattern</b> is a short list of chords that repeats. Each chord lasts one <b>bar</b>: four beats.",
    "Un <b>patrón de acordes</b> es una lista corta de acordes que se repite. Cada acorde dura un <b>compás</b>: cuatro pulsos.")],
  ("pp-pattern", "Start from a chord pattern, set to Pop · 1 5 6 4, and How the chords play, set to Pulse.", "Empieza con un patrón de acordes, en Pop · 1 5 6 4, y Cómo suenan los acordes, en Pulso."),
  [("Under <b>Start from a chord pattern</b>, pick <b>Pop · 1 5 6 4</b>.", "En <b>Empieza con un patrón de acordes</b>, elige <b>Pop · 1 5 6 4</b>."),
   ("Press <b>Play the chords</b>. Count 1 2 3 4 out loud.", "Pulsa <b>Tocar los acordes</b>. Cuenta 1 2 3 4 en voz alta."),
   ("Slide <b>Tempo</b> left, then right.", "Desliza el <b>Tempo</b> a la izquierda y luego a la derecha."),
   ("Press <b>Stop</b>.", "Pulsa <b>Parar</b>.")],
  ("A new chord starts on every 1. The chord playing now lights up in your pattern, on the pads and on the keys.", "Un acorde nuevo empieza en cada 1. El acorde que suena ahora se ilumina en tu patrón, en los pads y en las teclas."),
  [("I can start and stop a pattern.", "Puedo empezar y parar un patrón."), ("I can make it faster and slower.", "Puedo hacerlo más rápido y más lento."),
   ("I counted four beats for each chord.", "Conté cuatro pulsos por cada acorde.")])

lesson(3, "the-keys-names-and-octaves", ("The keys: names and octaves", "Las teclas: nombres y octavas"),
  [("The white keys are named <b>C D E F G A B</b>, then the names start again. Each <b>C</b> sits just left of a group of two black keys.",
    "Las teclas blancas se llaman <b>Do Re Mi Fa Sol La Si</b>, y luego los nombres empiezan otra vez. Cada <b>Do</b> está justo a la izquierda de un grupo de dos teclas negras."),
   ("From one C to the next is an <b>octave</b>. The small number on each C says which one: <b>C4</b> is middle C. One octave up, the string shakes twice as fast: A4 is 440 times a second, A5 is 880.",
    "De un Do al siguiente hay una <b>octava</b>. El número pequeño en cada Do dice cuál es: <b>Do4</b> es el Do central. Una octava arriba, la cuerda vibra el doble de rápido: La4 son 440 veces por segundo, La5 son 880.")],
  ("pp-kbd", "The keys, one octave on a phone: C4 to C5.", "Las teclas, una octava en un teléfono: Do4 a Do5."),
  [("Find every C you can see.", "Busca cada Do que veas."),
   ("Play C D E F G A B C going up, then come back down. That is the C major scale.", "Toca Do Re Mi Fa Sol La Si Do subiendo, y luego bajando. Esa es la escala de Do mayor."),
   ("Press <b>Higher ▶</b> and play C again. Then press <b>◀ Lower</b> twice and play it once more.", "Pulsa <b>Más agudo ▶</b> y toca Do otra vez. Luego pulsa <b>◀ Más grave</b> dos veces y tócalo una vez más.")],
  ("Notes an octave apart sound like the same note, higher or lower. That is why they share a name.", "Las notas separadas por una octava suenan como la misma nota, más aguda o más grave. Por eso comparten el nombre."),
  [("I can find C without reading the names.", "Puedo encontrar Do sin leer los nombres."), ("I can play the C major scale up and down.", "Puedo tocar la escala de Do mayor subiendo y bajando."),
   ("I can move the keyboard up and down an octave.", "Puedo subir y bajar el teclado una octava.")])

lesson(4, "soft-loud-and-the-pedal", ("Touch: soft, loud and the pedal", "El toque: suave, fuerte y el pedal"),
  [("Where your finger lands sets how hard the note is played. Near the <b>bottom</b> of a key is loud. Near the <b>top</b> is soft. On a computer, click high or low on a key; the letter keys always play medium. A MIDI keyboard sends how hard you press.",
    "Donde cae tu dedo decide qué tan fuerte suena la nota. Cerca de la parte de <b>abajo</b> de una tecla es fuerte. Cerca de <b>arriba</b> es suave. En la computadora, haz clic arriba o abajo en una tecla; las teclas de letras siempre tocan a medio volumen. Un teclado MIDI envía qué tan fuerte presionas."),
   ("<b>Hold notes (pedal)</b> works like the right pedal of a real piano: notes keep ringing after you let go. On a computer, hold <b>Shift</b>.",
    "<b>Mantener notas (pedal)</b> funciona como el pedal derecho de un piano real: las notas siguen sonando cuando sueltas. En la computadora, mantén <b>Shift</b>.")],
  ("pp-keyrow", "Lower, Higher and Hold notes (pedal).", "Más grave, Más agudo y Mantener notas (pedal)."),
  [("On the Grand piano, play one key four times, from the top edge to the bottom edge.", "Con el Piano de cola, toca una tecla cuatro veces, del borde de arriba al de abajo."),
   ("Press <b>Hold notes (pedal)</b>. Play C, E, G, C going up. Let go of every key.", "Pulsa <b>Mantener notas (pedal)</b>. Toca Do, Mi, Sol, Do subiendo. Suelta todas las teclas."),
   ("Press <b>Hold notes</b> again to lift the pedal.", "Pulsa <b>Mantener notas</b> otra vez para soltar el pedal.")],
  ("The grand piano gets louder and brighter when you play hard. With the pedal on, the notes ring together until you lift it.", "El piano de cola suena más fuerte y más brillante cuando tocas fuerte. Con el pedal activo, las notas suenan juntas hasta que lo sueltas."),
  [("I can play soft and loud on purpose.", "Puedo tocar suave y fuerte a propósito."), ("I can turn the pedal on and off.", "Puedo activar y desactivar el pedal.")])

lesson(5, "chords-by-hand", ("Chords by hand: major and minor", "Acordes con la mano: mayor y menor"),
  [("A chord is three or more notes played together. Play one key, skip one, play one, skip one, play one.",
    "Un acorde son tres o más notas tocadas juntas. Toca una tecla, salta una, toca una, salta una, toca una."),
   ("<b>C E G</b> is C major: bright. Move the middle note down one key to <b>E♭</b> and you get C minor: moody.",
    "<b>Do Mi Sol</b> es Do mayor: brillante. Baja la nota del medio una tecla hasta <b>Mi♭</b> y tienes Do menor: melancólico.")],
  None,
  [("Hold C, E and G with your thumb, middle finger and little finger. On a computer, hold A, D and G.", "Mantén Do, Mi y Sol con el pulgar, el dedo medio y el meñique. En la computadora, mantén A, D y G."),
   ("Slide your middle finger to E♭, the black key just left of E.", "Desliza el dedo medio a Mi♭, la tecla negra justo a la izquierda de Mi."),
   ("Move the same hand shape up: F A C, then G B D.", "Mueve la misma forma de la mano hacia arriba: Fa La Do, luego Sol Si Re.")],
  ("Major sounds bright and settled. Minor sounds moody. Only one note changed.", "Mayor suena brillante y tranquilo. Menor suena melancólico. Solo cambió una nota."),
  [("I can play C major and C minor by hand.", "Puedo tocar Do mayor y Do menor con la mano."), ("I can play F major and G major by hand.", "Puedo tocar Fa mayor y Sol mayor con la mano.")])

lesson(6, "the-six-pads", ("The six pads", "Los seis pads"),
  [("In every key, a handful of chords fit together. The six pads show them, numbered by the step of the scale they start on. Pad 1 is home.",
    "En cada tono, unos cuantos acordes encajan entre sí. Los seis pads los muestran, numerados por el paso de la escala donde empiezan. El pad 1 es la casa."),
   ("In <b>Major</b>, pads 1, 4 and 5 are major and pads 2, 3 and 6 are minor. In the key of C they are C, Dm, Em, F, G and Am. In <b>Minor</b> the pads become 1, 3, 4, 5, 6 and 7.",
    "En <b>Mayor</b>, los pads 1, 4 y 5 son mayores y los pads 2, 3 y 6 son menores. En el tono de Do son Do, Re m, Mi m, Fa, Sol y La m. En <b>Menor</b> los pads son 1, 3, 4, 5, 6 y 7.")],
  None,
  [("Set <b>Key</b> to C and <b>Mood</b> to Major. Tap the pads from 1 to 6.", "Pon el <b>Tono</b> en Do y el <b>Ánimo</b> en Mayor. Toca los pads del 1 al 6."),
   ("Tap 5, then 1.", "Toca el 5 y luego el 1."),
   ("On the <b>Chord wheel</b>, press <b>Turn to G ▶</b>. The six light chords move one step. Tap them: G, Am, Bm, C, D, Em.", "En la <b>Rueda de acordes</b>, pulsa <b>Girar a Sol ▶</b>. Los seis acordes claros se mueven un paso. Tócalos: Sol, La m, Si m, Do, Re, Mi m."),
   ("Press <b>Minor · moody</b> and tap them once more.", "Pulsa <b>Menor · melancólico</b> y tócalos una vez más.")],
  ("5 then 1 sounds like coming home. Every key has the same pull.", "5 y luego 1 suena como volver a casa. Cada tono tiene la misma atracción."),
  [("I can name the six pads in the key of C.", "Puedo nombrar los seis pads en el tono de Do."), ("I can hear 5 going home to 1.", "Puedo oír el 5 volviendo a casa en el 1."),
   ("I can find the six pads of any key on the chord wheel.", "Puedo encontrar los seis pads de cualquier tono en la rueda de acordes.")],
  extra=[fig("pp-pads", "The six pads in the key of C: C, Dm, Em, F, G, Am.", "Los seis pads en el tono de Do: Do, Re m, Mi m, Fa, Sol, La m."),
         bl("p", "The <b>Chord wheel</b> puts all 24 major and minor chords in a circle. The majors go round the outside, each one's minor just inside it. In any key the six pads sit side by side: three on each ring. One step clockwise adds a sharp.",
                 "La <b>Rueda de acordes</b> pone los 24 acordes mayores y menores en un círculo. Los mayores van por fuera y cada menor justo dentro de su mayor. En cualquier tono, los seis pads quedan juntos: tres en cada anillo. Un paso en el sentido del reloj añade un sostenido."),
         fig("pp-wheel", "The chord wheel in C: the six pads, lit, with their numbers. C has the gold ring.", "La rueda de acordes en Do: los seis pads, iluminados, con sus números. Do tiene el aro dorado.")])

lesson(7, "patterns-and-four-ways-to-play", ("Forty-four patterns, sixteen ways to play", "Cuarenta y cuatro patrones, dieciséis maneras de tocar"),
  [("The pattern menu holds forty-four chord patterns that songs use again and again, in five groups. Here they are in the key of C (the minor ones in A minor):",
    "El menú de patrones tiene cuarenta y cuatro patrones de acordes que las canciones usan una y otra vez, en cinco grupos. Aquí están en el tono de Do (los menores, en La menor):")],
  ("pp-pattern", "The pattern menu and the How the chords play menu.", "El menú de patrones y el menú Cómo suenan los acordes."),
  [("Try three patterns. Let each one go round twice.", "Prueba tres patrones. Deja que cada uno dé dos vueltas."),
   ("While one plays, change <b>How the chords play</b>. Start with Hold, Pulse, Broken and Off-beat, then try the others.", "Mientras uno suena, cambia <b>Cómo suenan los acordes</b>. Empieza con Mantener, Pulso, Arpegio y Contratiempo, y luego prueba las demás."),
   ("Pick the pattern and the way of playing you like best.", "Elige el patrón y la manera de tocar que más te gusten.")],
  ("Hold is calm. Pulse is steady. Broken flows, one note at a time (an arpeggio). Off-beat bounces between the counts, like reggae and ska.", "Mantener es tranquilo. Pulso es firme. Arpegio fluye, una nota a la vez. Contratiempo rebota entre los conteos, como el reggae y el ska."),
  [("I tried at least three patterns.", "Probé por lo menos tres patrones."), ("I can name four ways the chords can play.", "Puedo nombrar cuatro maneras en que pueden sonar los acordes.")],
  extra=[bl("p", "<b>Pop, rock and folk</b>", "<b>Pop, rock y folk</b>"),
         lst("ul", [("<b>Pop · 1 5 6 4</b>: C, G, Am, F", "<b>Pop · 1 5 6 4</b>: Do, Sol, La m, Fa"),
                    ("<b>Fifties · 1 6 4 5</b>: C, Am, F, G", "<b>Años 50 · 1 6 4 5</b>: Do, La m, Fa, Sol"),
                    ("<b>Sad pop · 6 4 1 5</b>: Am, F, C, G", "<b>Pop triste · 6 4 1 5</b>: La m, Fa, Do, Sol"),
                    ("<b>Anime and J-pop · 4 5 3 6</b>: F, G, Em, Am", "<b>Anime y J-pop · 4 5 3 6</b>: Fa, Sol, Mi m, La m"),
                    ("<b>Canon · 8 chords</b>: C, G, Am, Em, F, C, F, G", "<b>Canon · 8 acordes</b>: Do, Sol, La m, Mi m, Fa, Do, Fa, Sol"),
                    ("<b>Three chords · 1 4 5 1</b>: C, F, G, C. Folk, country and rock are full of it.", "<b>Tres acordes · 1 4 5 1</b>: Do, Fa, Sol, Do. El folk, el country y el rock están llenos de él."),
                    ("<b>Fiesta · 1 4 5 4</b>: C, F, G, F. The loop of “La Bamba” and early rock and roll.", "<b>Fiesta · 1 4 5 4</b>: Do, Fa, Sol, Fa. El ciclo de “La Bamba” y del primer rock and roll."),
                    ("<b>Rock · 1 ♭7 4 1</b>: C, B♭, F, C. B♭ is not one of the six pads: it comes from outside the key. Find it on the chord wheel.", "<b>Rock · 1 ♭7 4 1</b>: Do, Si♭, Fa, Do. Si♭ no es uno de los seis pads: viene de fuera del tono. Búscalo en la rueda de acordes."),
                    ("<b>Hymn and gospel · 1 4 1 5</b>: C, F, C, G. Try it on the church organ.", "<b>Himno y góspel · 1 4 1 5</b>: Do, Fa, Do, Sol. Pruébalo con el órgano de iglesia."),
                    ("<b>Around the wheel · 3 6 2 5 1</b>: E7, A7, D7, G7, C. Each chord is one step round the chord wheel, back home to C.", "<b>Por la rueda · 3 6 2 5 1</b>: Mi7, La7, Re7, Sol7, Do. Cada acorde está a un paso en la rueda de acordes, de vuelta a casa en Do."),
                    ("<b>Rock anthem · 1 4 6 5</b>: C, F, Am, G", "<b>Himno de rock · 1 4 6 5</b>: Do, Fa, La m, Sol"),
                    ("<b>Uplifting pop · 1 3 6 4</b>: C, Em, Am, F", "<b>Pop alegre · 1 3 6 4</b>: Do, Mi m, La m, Fa"),
                    ("<b>Folk rock · 1 5 2</b>: C, G, Dm, Dm", "<b>Folk rock · 1 5 2</b>: Do, Sol, Re m, Re m"),
                    ("<b>Dreamy · 1 3 4 4m</b>: C, E, F, Fm. The E and the F minor come from outside the key: find them on the chord wheel.", "<b>De ensueño · 1 3 4 4m</b>: Do, Mi, Fa, Fa m. Mi y Fa menor vienen de fuera del tono: búscalos en la rueda de acordes."),
                    ("<b>Country · 8 bars</b>: C, C, F, F, G, G, C, C", "<b>Country · 8 compases</b>: Do, Do, Fa, Fa, Sol, Sol, Do, Do")]),
         bl("p", "<b>Rock and metal</b>", "<b>Rock y metal</b>"),
         lst("ul", [
                    ("<b>Arena rock · 1 5 4 4</b>: C, G, F, F", "<b>Rock de estadio · 1 5 4 4</b>: Do, Sol, Fa, Fa"),
                    ("<b>Two-chord rock · 1 ♭7</b>: C, B♭, C, B♭", "<b>Rock de dos acordes · 1 ♭7</b>: Do, Si♭, Do, Si♭"),
                    ("<b>Grunge · 1 4 ♭3 ♭6</b>: C, F, E♭, A♭", "<b>Grunge · 1 4 ♭3 ♭6</b>: Do, Fa, Mi♭, La♭"),
                    ("<b>Walk round the wheel · ♭6 ♭3 ♭7 4 1</b>: A♭, E♭, B♭, F, C. Each chord is a fifth from the next, walking round the wheel to C.", "<b>Vuelta por la rueda · ♭6 ♭3 ♭7 4 1</b>: La♭, Mi♭, Si♭, Fa, Do. Cada acorde está a una quinta del siguiente, caminando por la rueda hasta Do."),
                    ("<b>Metal march</b> (A minor): Am, F, G, Am", "<b>Marcha metalera</b> (La menor): La m, Fa, Sol, La m"),
                    ("<b>Dark and heavy</b> (A minor): Am, B♭, Am, B♭. Two chords a half step apart, heavy and dark.", "<b>Oscuro y pesado</b> (La menor): La m, Si♭, La m, Si♭. Dos acordes a medio tono, pesados y oscuros."),
                    ("<b>Doom</b> (A minor): Am, E♭, Dm, Am. The E♭ sits halfway between one A and the next: a dark, heavy sound.", "<b>Doom</b> (La menor): La m, Mi♭, Re m, La m. Mi♭ está justo en medio entre un La y el siguiente: un sonido oscuro y pesado.")]),
         bl("p", "<b>Soul, funk and dance</b>", "<b>Soul, funk y baile</b>"),
         lst("ul", [
                    ("<b>Soul · 1 3 4 5</b>: C, Em, F, G", "<b>Soul · 1 3 4 5</b>: Do, Mi m, Fa, Sol"),
                    ("<b>Funk · 1 4 with sevenths</b>: C7, C7, F7, C7", "<b>Funk · 1 4 con séptimas</b>: Do7, Do7, Fa7, Do7"),
                    ("<b>Two-chord groove · 1 4</b>: C, F, C, F", "<b>Ritmo de dos acordes · 1 4</b>: Do, Fa, Do, Fa"),
                    ("<b>Dance · 6 5 4 5</b>: Am, G, F, G", "<b>Baile · 6 5 4 5</b>: La m, Sol, Fa, Sol"),
                    ("<b>Lo-fi · 4 3 2 1</b>: Fmaj7, Em7, Dm7, Cmaj7. Soft seventh chords, stepping down.", "<b>Lo-fi · 4 3 2 1</b>: Fa maj7, Mi m7, Re m7, Do maj7. Acordes de séptima suaves, bajando paso a paso."),
                    ("<b>Neo-soul · 2 5 1 6</b>: Dm7, G7, Cmaj7, Am7", "<b>Neo-soul · 2 5 1 6</b>: Re m7, Sol7, Do maj7, La m7")]),
         bl("p", "<b>Blues and jazz</b>", "<b>Blues y jazz</b>"),
         lst("ul", [("<b>Blues · 12 bars</b>: C7 four times, F7 twice, C7 twice, G7, F7, C7, G7", "<b>Blues · 12 compases</b>: Do7 cuatro veces, Fa7 dos veces, Do7 dos veces, Sol7, Fa7, Do7, Sol7"),
                    ("<b>Jazz · 2 5 1</b>: Dm7, G7, Cmaj7, Cmaj7", "<b>Jazz · 2 5 1</b>: Re m7, Sol7, Do maj7, Do maj7"),
                    ("<b>Jazz turnaround · 1 6 2 5</b>: Cmaj7, Am7, Dm7, G7", "<b>Vuelta de jazz · 1 6 2 5</b>: Do maj7, La m7, Re m7, Sol7"),
                    ("<b>Minor blues · 12 bars</b> (A minor): Am7 four times, Dm7 twice, Am7 twice, E7, Dm7, Am7, E7", "<b>Blues menor · 12 compases</b> (La menor): La m7 cuatro veces, Re m7 dos veces, La m7 dos veces, Mi7, Re m7, La m7, Mi7"),
                    ("<b>Blues · 8 bars</b>: C7, G7, F7, F7, C7, G7, C7, G7", "<b>Blues · 8 compases</b>: Do7, Sol7, Fa7, Fa7, Do7, Sol7, Do7, Sol7"),
                    ("<b>Quick-change blues · 12 bars</b>: C7, F7, C7, C7, F7, F7, C7, C7, G7, F7, C7, G7", "<b>Blues de cambio rápido · 12 compases</b>: Do7, Fa7, Do7, Do7, Fa7, Fa7, Do7, Do7, Sol7, Fa7, Do7, Sol7"),
                    ("<b>Jazz blues · 12 bars</b>: C7, F7, C7, C7, F7, F7, C7, A7, Dm7, G7, C7, G7", "<b>Blues de jazz · 12 compases</b>: Do7, Fa7, Do7, Do7, Fa7, Fa7, Do7, La7, Re m7, Sol7, Do7, Sol7"),
                    ("<b>Bossa nova · 1 2 5 1</b>: Cmaj7, Dm7, G7, Cmaj7. The gentle sound of Brazil.", "<b>Bossa nova · 1 2 5 1</b>: Do maj7, Re m7, Sol7, Do maj7. El sonido suave de Brasil."),
                    ("<b>Circle · 6 2 5 1</b>: Am7, Dm7, G7, Cmaj7", "<b>Círculo · 6 2 5 1</b>: La m7, Re m7, Sol7, Do maj7")]),
         bl("p", "<b>Minor and moody</b> (A minor)", "<b>Menor y melancólico</b> (La menor)"),
         lst("ul", [("<b>Minor groove</b>: Am, F, C, G", "<b>Ritmo menor</b>: La m, Fa, Do, Sol"),
                    ("<b>Flamenco</b>: Am, G, F, E", "<b>Flamenco</b>: La m, Sol, Fa, Mi"),
                    ("<b>Minor folk</b>: Am, Dm, E, Am", "<b>Folk menor</b>: La m, Re m, Mi, La m"),
                    ("<b>Epic</b>: Am, G, F, G. A big film-score sound.", "<b>Épico</b>: La m, Sol, Fa, Sol. Un sonido grande, de película."),
                    ("<b>Minor ballad</b>: Am, Dm, G, C", "<b>Balada menor</b>: La m, Re m, Sol, Do"),
                    ("<b>Heroic</b>: Am, C, G, D", "<b>Heroico</b>: La m, Do, Sol, Re"),
                    ("<b>Latin rock</b>: Am7, D7, Am7, D7", "<b>Rock latino</b>: La m7, Re7, La m7, Re7")]),
         # AOG-PIANO-WAYS-V2/V3 (2026-10-03): the sixteen ways to play, in the menu's four groups
         bl("p", "<b>The sixteen ways to play</b>", "<b>Las dieciséis maneras de tocar</b>"),
         lst("ul", [("<b>Steady</b>: <b>Hold</b>, one long chord. <b>Pulse</b>, the chord on each beat. <b>Eight a bar</b>, the chord on every half beat, for pop and rock. <b>Triplets</b>, three chords to each beat, like a 1950s ballad.",
                     "<b>Firmes</b>: <b>Mantener</b>, un acorde largo. <b>Pulso</b>, el acorde en cada tiempo. <b>Ocho por compás</b>, el acorde en cada medio tiempo, para pop y rock. <b>Tresillos</b>, tres acordes en cada tiempo, como una balada de los 50."),
                    ("<b>Flowing</b>: <b>Broken</b>, one note at a time (an arpeggio). <b>Ballad</b>, from the low notes up through the chord and back down. <b>Sweep</b>, every note from low to high, quick as a harp.",
                     "<b>Fluidos</b>: <b>Arpegio</b>, una nota a la vez. <b>Balada</b>, desde las notas graves hasta arriba del acorde y de vuelta. <b>Barrido</b>, todas las notas de grave a agudo, rápido como un arpa."),
                    ("<b>Dance</b>: <b>Oom-pah</b>, a low note, then the chord, like a march. <b>Waltz</b>, oom-pah-pah, three beats to a bar. <b>Charleston</b>, on 1 and just before 3, from 1920s jazz. <b>Boogie-woogie</b>, the low notes walk up and down, like blues piano. <b>Disco</b>, low notes bouncing between two octaves.",
                     "<b>Para bailar</b>: <b>Um-pa</b>, una nota grave y luego el acorde, como una marcha. <b>Vals</b>, um-pa-pa, tres tiempos por compás. <b>Charleston</b>, en el 1 y justo antes del 3, del jazz de los años 20. <b>Boogie-woogie</b>, las notas graves suben y bajan, como el piano de blues. <b>Disco</b>, notas graves que rebotan entre dos octavas."),
                    ("<b>Grooves from around the world</b>: <b>Off-beat</b>, between the counts, like reggae and ska. <b>Three-three-two</b>, count 1 2 3, 1 2 3, 1 2, as in Latin music and reggaeton. <b>Bossa nova</b>, the gentle rhythm of Brazil. <b>Funk</b>, short chords that jump around the beat.",
                     "<b>Ritmos del mundo</b>: <b>Contratiempo</b>, entre los conteos, como el reggae y el ska. <b>Tres-tres-dos</b>, cuenta 1 2 3, 1 2 3, 1 2, como en la música latina y el reguetón. <b>Bossa nova</b>, el ritmo suave de Brasil. <b>Funk</b>, acordes cortos que saltan alrededor del pulso.")])])

lesson(8, "make-your-own-pattern", ("Make your own pattern", "Haz tu propio patrón"),
  [("Press <b>Make my own</b> and tap the pads in the order you want, up to eight. Each tap adds one bar to <b>Your chord pattern</b>.",
    "Pulsa <b>Hacer el mío</b> y toca los pads en el orden que quieras, hasta ocho. Cada toque agrega un compás a <b>Tu patrón de acordes</b>.")],
  ("pp-prog", "Your chord pattern, with Play the chords, Make my own and Clear.", "Tu patrón de acordes, con Tocar los acordes, Hacer el mío y Borrar."),
  [("Press <b>Clear</b>, then <b>Make my own</b>.", "Pulsa <b>Borrar</b> y luego <b>Hacer el mío</b>."),
   ("Tap four pads. End on pad 1.", "Toca cuatro pads. Termina en el pad 1."),
   ("Press <b>Make my own</b> again to stop adding, then press <b>Play the chords</b>.", "Pulsa <b>Hacer el mío</b> otra vez para dejar de agregar, y luego pulsa <b>Tocar los acordes</b>."),
   ("Change the Key while it plays. Your pattern moves with it.", "Cambia el Tono mientras suena. Tu patrón se mueve con él.")],
  ("Ending on 1 sounds finished. Ending on 5 sounds like it wants to go on. Starting on 6 sounds more serious.", "Terminar en 1 suena terminado. Terminar en 5 suena como si quisiera seguir. Empezar en 6 suena más serio."),
  [("I made a pattern of my own and played it.", "Hice un patrón propio y lo toqué."), ("I can explain why I ended where I did.", "Puedo explicar por qué terminé donde terminé.")])

# AOG-PIANO-SOUNDS-V2 (2026-10-04): 34 sounds in eight groups (the slug stays, so links to it still land)
lesson(9, "eight-sounds", ("34 sounds in eight groups", "34 sonidos en ocho grupos"),
  [("Same keys, different color. That color is called <b>timbre</b>. The Instrument menu holds 34 sounds in eight groups. Here is how each group makes its sound:",
    "Las mismas teclas, otro color. Ese color se llama <b>timbre</b>. El menú Instrumento tiene 34 sonidos en ocho grupos. Así hace su sonido cada grupo:")],
  ("pp-sound", "The Instrument menu, set to Grand piano.", "El menú Instrumento, en Piano de cola."),
  [("Hold C, E and G on the Grand piano. Listen to it fade.", "Mantén Do, Mi y Sol con el Piano de cola. Escucha cómo se apaga."),
   ("Do the same on the Rock and jazz organ.", "Haz lo mismo con el Órgano de rock y jazz."),
   ("Play one pattern on three different sounds. Open <b>Meet the sounds</b> in the Go to menu to hear them all.", "Toca un patrón con tres sonidos distintos. Abre <b>Conoce los sonidos</b> en el menú Ir a para oírlos todos.")],
  ("A piano note fades, because the string slowly stops shaking. An organ note stays as long as you hold it.", "Una nota de piano se apaga, porque la cuerda deja de vibrar poco a poco. Una nota de órgano dura mientras la mantengas."),
  [("I can name a sound from each group.", "Puedo nombrar un sonido de cada grupo."), ("I can say how a piano and an organ make sound.", "Puedo decir cómo hacen sonido un piano y un órgano.")],
  extra=[lst("ul", [("<b>Pianos</b>: felt hammers hit strings. The grand, upright, honky-tonk, bright and soft felt pianos are real recordings. The toy piano's hammers hit metal rods.",
                     "<b>Pianos</b>: martillos de fieltro golpean cuerdas. El de cola, el vertical, el honky-tonk, el brillante y el suave de fieltro son grabaciones reales. Los martillos del piano de juguete golpean varillas de metal."),
                    ("<b>Electric pianos</b>: hammers hit metal tines (warm) or reeds (bright); a computer chip does the math (FM) for the '80s one; on the clavinet, a rubber tip hits a string.",
                     "<b>Pianos eléctricos</b>: martillos golpean varillas (cálido) o lengüetas de metal (brillante); un chip de computadora hace las cuentas (FM) en el de los 80; en el clavinet, una punta de goma golpea una cuerda."),
                    ("<b>Organs and accordion</b>: metal wheels spin past magnets (rock and jazz, gospel, '70s rock); air blows through pipes (church, cinema); air pushes through metal reeds (accordion).",
                     "<b>Órganos y acordeón</b>: ruedas de metal giran junto a imanes (rock y jazz, góspel, rock de los 70); el aire sopla por tubos (iglesia, cine); el aire empuja lengüetas de metal (acordeón)."),
                    ("<b>Mallets and bells</b>: a mallet or a hammer hits metal bars (celesta, glockenspiel, vibraphone), wooden bars (marimba, a real recording), a steel drum, or long metal tubes (bells).",
                     "<b>Láminas y campanas</b>: un mazo o un martillo golpea barras de metal (celesta, glockenspiel, vibráfono), barras de madera (marimba, una grabación real), un tambor de acero o tubos largos de metal (campanas)."),
                    ("<b>Plucked</b>: a small pick plucks a string (harpsichord); fingers pluck strings (harp, a real recording); thumbs or pins pluck metal tongues (kalimba, music box).",
                     "<b>Pulsados</b>: una púa pequeña pulsa una cuerda (clavecín); los dedos pulsan cuerdas (arpa, una grabación real); pulgares o alfileres pulsan lengüetas de metal (kalimba, caja de música)."),
                    ("<b>Strings and voices</b>: bows on violins, violas and cellos (soft strings, a real recording); many voices singing “ah” (choir).",
                     "<b>Cuerdas y voces</b>: arcos sobre violines, violas y violonchelos (cuerdas suaves, una grabación real); muchas voces que cantan “a” (coro)."),
                    ("<b>Tape keyboards</b>: each key starts a short tape of strings or of a flute, as on the keyboards of 1970s prog rock.",
                     "<b>Teclados de cinta</b>: cada tecla pone en marcha una cinta corta de cuerdas o de flauta, como en los teclados del rock progresivo de los 70."),
                    ("<b>Synths</b>: electronic waves, shaped and softened: the '70s string synth, the warm synth, the '80s synth brass and the synth lead.",
                     "<b>Sintetizadores</b>: ondas electrónicas, moldeadas y suavizadas: el sintetizador de cuerdas de los 70, el sintetizador cálido, los metales de los 80 y el sintetizador solista.")])])

lesson(10, "play-along", ("Play along: the lit keys and the black keys", "Toca encima: las teclas iluminadas y las negras"),
  [("While the chords play, every key that fits the chord turns pale, in every octave, and a key turns orange while its note sounds. Any lit key fits. Play them in your own order and you are making up a melody.",
    "Mientras suenan los acordes, cada tecla que encaja con el acorde se pone clara, en todas las octavas, y una tecla se pone naranja mientras suena su nota. Cualquier tecla iluminada encaja. Tócalas en tu propio orden y estás inventando una melodía."),
   ("The five black keys make a <b>pentatonic scale</b>, used in folk music from China to West Africa to the Andes. In the key of F♯, every black key fits.",
    "Las cinco teclas negras forman una <b>escala pentatónica</b>, que se usa en la música tradicional de China, de África occidental y de los Andes. En el tono de Fa♯, cada tecla negra encaja.")],
  ("pp-kbd-lit", "The C chord playing: orange keys are sounding, the pale key fits it.", "Suena el acorde de Do: las teclas naranjas suenan, la clara encaja."),
  [("Pick a pattern, choose <b>Hold</b>, slow the Tempo down and press Play.", "Elige un patrón, escoge <b>Mantener</b>, baja el Tempo y pulsa Tocar."),
   ("Play the lit keys, one at a time. Follow them when the chord changes.", "Toca las teclas iluminadas, una a la vez. Síguelas cuando cambie el acorde."),
   ("Set Key to F♯. Make your own pattern: pads 1, 4, 5, 1. Play only black keys over it.", "Pon el Tono en Fa♯. Haz tu propio patrón: pads 1, 4, 5, 1. Toca solo teclas negras encima.")],
  ("Lit keys always fit the chord under them. Black keys over F♯ never clash.", "Las teclas iluminadas siempre encajan con el acorde de abajo. Las negras sobre Fa♯ nunca chocan."),
  [("I made up a melody on the lit keys.", "Inventé una melodía con las teclas iluminadas."), ("I played a black-key tune over the F♯ pattern.", "Toqué una melodía con teclas negras sobre el patrón en Fa♯.")])

lesson(11, "with-the-drum-machine-and-turntables", ("With the drum machine and the turntables", "Con la caja de ritmos y los platos"),
  [("The three music tools share one shelf. A beat from the drum machine shows up on the piano, and a recording from the piano shows up on the turntables.",
    "Las tres herramientas de música comparten un estante. Un ritmo de la caja de ritmos aparece en el piano, y una grabación del piano aparece en los platos.")],
  ("pp-s-drum", "Play with my drum beat, with the name of the beat from the drum machine.", "Tocar con mi ritmo de batería, con el nombre del ritmo de la caja de ritmos."),
  [("On the drum machine, make a beat and press <b>Send to the turntables</b>.", "En la caja de ritmos, haz un ritmo y pulsa <b>Enviar a los platos</b>."),
   ("Back on the piano, press <b>Play with my drum beat</b>. The beat now sets the tempo and the swing.", "De vuelta en el piano, pulsa <b>Tocar con mi ritmo de batería</b>. Ahora el ritmo pone el tempo y el swing."),
   ("Pick a pattern and press Play. Try Pulse and Off-beat with the drums.", "Elige un patrón y pulsa Tocar. Prueba Pulso y Contratiempo con la batería."),
   ("Press <b>Send to the turntables</b>. On the turntables, load it from <b>From the piano</b>.", "Pulsa <b>Enviar a los platos</b>. En los platos, cárgalo desde <b>Del piano</b>.")],
  ("The chords land exactly with the drums, round after round.", "Los acordes caen justo con la batería, vuelta tras vuelta."),
  [("I played my chords with my own beat.", "Toqué mis acordes con mi propio ritmo."), ("I sent a recording to the turntables and played it there.", "Mandé una grabación a los platos y la toqué ahí.")])

lesson(12, "the-1987-2026-dial", ("The Sound dial: 1987 or 2026", "El dial de Sonido: 1987 o 2026"),
  [("A computer keeps sound as a long list of numbers. The 1987 samplers kept 26,040 numbers a second, each with 4,096 steps of loudness (12 bits). That rough copy is the crunch. A CD keeps 44,100 a second with 65,536 steps.",
    "Una computadora guarda el sonido como una lista larga de números. Los samplers de 1987 guardaban 26 040 números por segundo, cada uno con 4096 escalones de volumen (12 bits). Esa copia áspera es el crujido. Un CD guarda 44 100 por segundo con 65 536 escalones.")],
  ("pp-dial", "The Sound dial from 1987 to 2026, Volume, and Send to the turntables.", "El dial de Sonido de 1987 a 2026, Volumen y Enviar a los platos."),
  [("Pick the Grand piano. Turn the Sound dial all the way to <b>1987</b>.", "Elige el Piano de cola. Gira el dial de Sonido del todo a <b>1987</b>."),
   ("Press <b>Higher ▶</b> until you reach the top, and play the highest keys.", "Pulsa <b>Más agudo ▶</b> hasta llegar arriba y toca las teclas más agudas."),
   ("Turn the dial to <b>2026</b> and play them again. Then find your spot in the middle.", "Gira el dial a <b>2026</b> y tócalas otra vez. Luego busca tu punto en el medio.")],
  ("On 1987 the high notes fizz and the tone gets darker. On 2026 it is clean.", "En 1987 las notas agudas chisporrotean y el tono se oscurece. En 2026 es limpio."),
  [("I heard the crunch on the high notes.", "Oí el crujido en las notas agudas."), ("I can explain the crunch with numbers.", "Puedo explicar el crujido con números.")])


HOW = [bl("p", "There are 12 short lessons. Do them in order, with the piano open next to this page.", "Hay 12 lecciones cortas. Hazlas en orden, con el piano abierto junto a esta página."),
       bl("p", "Every lesson works the same way:", "Cada lección funciona igual:"),
       "<ol>" + "".join(bl("li", a, b) for a, b in [
           ("<b>Read</b> the short part at the top. It says what the controls do.", "<b>Lee</b> la parte corta de arriba. Dice qué hacen los controles."),
           ("<b>Try it:</b> do the numbered steps, one at a time, on the real piano.", "<b>Pruébalo:</b> haz los pasos numerados, uno a la vez, en el piano de verdad."),
           ("<b>Listen for:</b> what you should hear if it worked.", "<b>Escucha:</b> lo que deberías oír si funcionó."),
           ("<b>Check yourself:</b> if you can't tick a box yet, do the steps again.", "<b>Revisa:</b> si todavía no puedes marcar una casilla, haz los pasos otra vez.")]) + "</ol>",
       bl("p", "<b>Before you start</b>", "<b>Antes de empezar</b>"),
       lst("ul", [("Use <b>headphones or real speakers</b>. Small laptop speakers lose the low notes.", "Usa <b>audífonos o bocinas de verdad</b>. Las bocinas pequeñas de una laptop pierden las notas graves."),
                  ("The piano has its own 38 lessons too. Pick one in the <b>Lesson</b> menu and its steps tick themselves.", "El piano también tiene sus propias 38 lecciones. Elige una en el menú <b>Lección</b> y sus pasos se marcan solos.")]),
       bl("p", "<b>Words you'll see</b>", "<b>Palabras que vas a ver</b>"),
       lst("ul", [("<b>Key</b>: two meanings. A key you press, and the key of a song: its home note. The <b>Key</b> menu is the second one.", "<b>Tecla</b> y <b>tono</b>: una tecla es lo que presionas; el tono de una canción es su nota casa. El menú <b>Tono</b> es el segundo."),
                  ("<b>Chord</b>: three or more notes played together.", "<b>Acorde</b>: tres o más notas tocadas juntas."),
                  ("<b>Pad</b>: one of the six big buttons. Each plays a chord.", "<b>Pad</b>: uno de los seis botones grandes. Cada uno toca un acorde."),
                  ("<b>Bar</b>: four beats. Each chord in a pattern lasts one bar.", "<b>Compás</b>: cuatro pulsos. Cada acorde de un patrón dura un compás."),
                  ("<b>Octave</b>: from one note to the next note with the same name.", "<b>Octava</b>: de una nota a la siguiente con el mismo nombre."),
                  ("<b>Tempo</b>: how many beats in a minute.", "<b>Tempo</b>: cuántos pulsos hay en un minuto."),
                  ("<b>Major / Minor</b>: bright / moody.", "<b>Mayor / Menor</b>: brillante / melancólico.")])]

PLAN = [bl("p", "Twenty minutes a day for three weeks.", "Veinte minutos al día durante tres semanas."),
        lst("ul", [("<b>Week 1:</b> one lesson a day, Lessons 1 to 5.", "<b>Semana 1:</b> una lección al día, de la 1 a la 5."),
                   ("<b>Week 2:</b> Lessons 6 to 9. Then play one of the piano's songs a day (the Lesson menu, songs 1 to 17).", "<b>Semana 2:</b> lecciones 6 a 9. Luego toca una de las canciones del piano al día (el menú Lección, canciones 1 a 17)."),
                   ("<b>Week 3:</b> Lessons 10 to 12. Then make a track of your own and send it to the turntables.", "<b>Semana 3:</b> lecciones 10 a 12. Luego haz una pista propia y mándala a los platos.")]),
        bl("p", "<b>You've mastered it when you can:</b>", "<b>Lo dominas cuando puedes:</b>"),
        lst("ul", [("Find any note without reading the names", "Encontrar cualquier nota sin leer los nombres"),
                   ("Play a major and a minor chord by hand", "Tocar un acorde mayor y uno menor con la mano"),
                   ("Name the six pads in the key of C", "Nombrar los seis pads en el tono de Do"),
                   ("Make a pattern of your own that ends at home", "Hacer un patrón propio que termine en casa"),
                   ("Make up a melody on the lit keys", "Inventar una melodía con las teclas iluminadas"),
                   ("Play your chords with your own drum beat", "Tocar tus acordes con tu propio ritmo de batería"),
                   ("Send a track to the turntables and play it there", "Mandar una pista a los platos y tocarla ahí")])]

FIX = lst("ul", [
    ("<b>No sound at all.</b> Turn Volume up and tap a key once: a phone wakes its sound on the first tap. An iPhone plays even with the silent switch on.", "<b>No hay sonido.</b> Sube el Volumen y toca una tecla una vez: un teléfono despierta su sonido con el primer toque. Un iPhone suena aunque esté en silencio."),
    ("<b>It says “Getting the grand piano ready…”.</b> The recordings are on their way. Until then you hear the electric piano.", "<b>Dice “Preparando el piano de cola…”.</b> Las grabaciones vienen en camino. Mientras tanto suena el piano eléctrico."),
    ("<b>Play does nothing.</b> Pick a chord pattern first, or press Make my own and tap some pads.", "<b>Tocar no hace nada.</b> Primero elige un patrón de acordes, o pulsa Hacer el mío y toca algunos pads."),
    ("<b>The tempo will not move.</b> Play with my drum beat is on, so the drum beat sets the tempo. Press it again to turn it off.", "<b>El tempo no se mueve.</b> Tocar con mi ritmo de batería está activo, así que el ritmo pone el tempo. Púlsalo otra vez para apagarlo."),
    ("<b>Notes keep ringing.</b> Hold notes (pedal) is on. Press it again.", "<b>Las notas siguen sonando.</b> Mantener notas (pedal) está activo. Púlsalo otra vez."),
    ("<b>A phone shows only one octave.</b> Use ◀ Lower and Higher ▶, or turn the phone sideways for more keys.", "<b>Un teléfono muestra solo una octava.</b> Usa ◀ Más grave y Más agudo ▶, o gira el teléfono de lado para ver más teclas."),
    ("<b>A lesson step does not tick.</b> Check that the right lesson is picked. A song's steps tick only while that song is picked.", "<b>Un paso de la lección no se marca.</b> Revisa que esté elegida la lección correcta. Los pasos de una canción solo se marcan mientras esa canción está elegida."),
    ("<b>No MIDI keyboard yet.</b> Press Use a MIDI keyboard and plug it in. The line under the buttons says when it is ready. No button? This browser cannot use MIDI. On a computer, try Chrome or Edge.", "<b>Todavía no hay un teclado MIDI.</b> Pulsa Usar un teclado MIDI y conéctalo. La línea bajo los botones dice cuándo está listo. ¿No ves el botón? Este navegador no puede usar MIDI. En una computadora, prueba Chrome o Edge.")])

IMG_JS = """<script>
/* AOG-MASTERING-PIANO-V1 — each picture has a Spanish twin; it follows the page language (the EN/ES switch in the top bar) */
(function(){
  function swap(){
    var es=(document.documentElement.getAttribute("lang")||"").indexOf("es")===0;
    document.querySelectorAll("img[data-es-src]").forEach(function(im){
      var src=im.getAttribute(es?"data-es-src":"data-en-src"), alt=im.getAttribute(es?"data-es-alt":"data-en-alt");
      if(src && im.getAttribute("src")!==src) im.setAttribute("src", src);
      if(alt) im.setAttribute("alt", alt);
    });
  }
  try{ new MutationObserver(swap).observe(document.documentElement, {attributes:true, attributeFilter:["lang"]}); }catch(e){}
  swap();
})();
</script>"""


def build():
    src = open(os.path.join(ROOT, "mastering-drums.html"), encoding="utf-8").read()
    head = src.split("</head>", 1)[0]
    rep = [("<title>Mastering the Drum Machine · Architecture of Grace</title>", "<title>Mastering the Piano · Architecture of Grace</title>"),
           ('content="Twelve lessons on the SP-1200: your first beat, swing, the sliders, nine kits, your own samples, the 1987-to-2026 Sound dial, and a whole song you can send to the turntables."',
            'content="Twelve lessons on the piano: the keys, chords by hand, the six pads, chord patterns, your own pattern, 34 sounds, playing along, the drum machine and the 1987-to-2026 Sound dial."'),
           ('href="https://architectureofgrace.org/mastering-drums"', 'href="https://architectureofgrace.org/mastering-piano"')]
    for a, b in rep:
        assert head.count(a) == 1, a
        head = head.replace(a, b)
    head = re.sub(r"<!-- AOG-MASTERING-V1 .*?-->",
                  "<!-- AOG-MASTERING-PIANO-V1 (2026-10-03) — the piano's manual, in the shape of Mastering the Drum Machine: twelve short\n"
                  "     lessons with Try it, Listen for and Check yourself, pictures of the real piano, a practice plan and a fix-it list.\n"
                  "     English and Spanish. Built by _work/music/make_mastering_piano.py. -->", head, count=1, flags=re.S)
    i = head.rfind("</style>")
    head = head[:i] + "\n.mg-fig img{max-width:460px;margin:0 auto}\n.mg-fig.wide img{max-width:none}\n" + head[i:]

    opts = ['<option value="how-to-use-this-course" data-en="How to use this course" data-es="Cómo usar este curso">How to use this course</option>']
    secs = []
    for L in LESSONS:
        sid = "lesson-%d-%s" % (L["n"], L["slug"])
        t_en = "Lesson %d — %s" % (L["n"], L["title"][0]); t_es = "Lección %d — %s" % (L["n"], L["title"][1])
        opts.append('<option value="%s" data-en="%s" data-es="%s">%s</option>' % (sid, esc(t_en), esc(t_es), esc(t_en)))
        parts = [bl("h2", t_en, t_es, ' id="%s"' % sid)]
        parts += [bl("p", a, b) for a, b in L["intro"]]
        parts += L["extra"]
        if L["figure"]:
            parts.append(fig(*L["figure"]))
        parts.append(bl("p", "<b>Try it:</b>", "<b>Pruébalo:</b>", ' class="step doit"'))
        parts.append("<ol>" + "".join(bl("li", a, b) for a, b in L["tryit"]) + "</ol>")
        parts.append(bl("p", "<b>Listen for:</b> " + L["listen"][0], "<b>Escucha:</b> " + L["listen"][1]))
        parts.append(bl("p", "<b>Check yourself:</b>", "<b>Revisa:</b>", ' class="step check"'))
        parts.append(lst("ul", L["check"]))
        secs.append("\n".join(parts))
    opts.append('<option value="practice-plan" data-en="Practice plan" data-es="Plan de práctica">Practice plan</option>')
    opts.append('<option value="when-something-goes-wrong" data-en="When something goes wrong" data-es="Cuando algo no funciona">When something goes wrong</option>')

    body = ('<body>\n<script src="/aog-topbar.js"></script>\n<main class="xw" style="--gl:#6A4C9C">\n<header class="xw-hero">\n'
            '  %s\n  %s\n  %s\n' % (bl("p", "Hands-on tools · The mastering course", "Herramientas prácticas · El curso para dominarlo", ' class="xw-ey"'),
                                     bl("h1", "Mastering the Piano", "Domina el piano"),
                                     bl("p", "Twelve lessons on the piano: the keys, chords by hand, the six pads, chord patterns, your own pattern, 34 sounds, playing along, the drum machine, and the 1987-to-2026 Sound dial.",
                                        "Doce lecciones de piano: las teclas, los acordes con la mano, los seis pads, los patrones de acordes, tu propio patrón, 34 sonidos, tocar encima, la caja de ritmos y el dial de Sonido de 1987 a 2026.", ' class="xw-lede"')) +
            '  <div class="xw-meta"><span class="xw-pill" data-en="Music" data-es="Música">Music</span><span class="xw-pill" data-en="12 lessons" data-es="12 lecciones">12 lessons</span><span class="xw-pill" data-en="With pictures" data-es="Con imágenes">With pictures</span></div>\n'
            '</header>\n<div class="xw-bar no-print">\n'
            '  <a class="xw-btn solid" href="/music-piano.html" data-en="Open the piano" data-es="Abrir el piano">Open the piano</a>\n'
            '  <a class="xw-btn" href="/piano-guide" data-en="Picture guide" data-es="Guía en imágenes">Picture guide</a>\n'
            '  <a class="xw-btn" href="/piano-lessons" data-en="Worksheets" data-es="Hojas de trabajo">Worksheets</a>\n'
            '  <button class="xw-btn" type="button" onclick="window.print()" data-en="Print this course" data-es="Imprimir este curso">Print this course</button>\n'
            '</div>\n'
            '<div class="mg-jump no-print"><label for="mgJump" data-en="Jump to a lesson" data-es="Ir a una lección">Jump to a lesson</label>\n'
            '<select id="mgJump" onchange="var e=document.getElementById(this.value);if(e)e.scrollIntoView({behavior:\'smooth\'});">%s</select></div>\n'
            '<section class="xw-sec">\n' % "".join(opts) +
            bl("h2", "How to use this course", "Cómo usar este curso", ' id="how-to-use-this-course"') + "\n" + "\n".join(HOW) + "\n" +
            "\n".join(secs) + "\n" +
            bl("h2", "Practice plan", "Plan de práctica", ' id="practice-plan"') + "\n" + "\n".join(PLAN) + "\n" +
            bl("h2", "When something goes wrong", "Cuando algo no funciona", ' id="when-something-goes-wrong"') + "\n" + FIX + "\n"
            '</section>\n<div data-aog-resources="music" data-topic="notation"></div>\n'
            '<footer class="xw-foot" data-en="Mastering the Piano · Architecture of Grace · everything stays on this computer." data-es="Domina el piano · Architecture of Grace · todo se queda en esta computadora.">Mastering the Piano · Architecture of Grace · everything stays on this computer.</footer>\n'
            '</main>\n<script src="/aog-grace.js" defer></script>\n<script src="/aog-resources.js" defer></script>\n' + IMG_JS + '\n</body>\n</html>\n')
    open(os.path.join(ROOT, "mastering-piano.html"), "w", encoding="utf-8").write(head + "</head>\n" + body)
    print("mastering-piano.html written (%d lessons)" % len(LESSONS))


if __name__ == "__main__":
    build()
