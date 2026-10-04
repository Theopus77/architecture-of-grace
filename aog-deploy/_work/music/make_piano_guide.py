# -*- coding: utf-8 -*-
"""AOG-PIANOPIC-V1 (2026-10-03) — piano-guide.html, the piano in pictures.

Jimmy asked for the same pages the drum machine has. The drum machine's picture guide is the model:
"for people who don't enjoy reading. Less words, more pictures", one block per figure, prints on letter.
This one is in English and Spanish: the words swap with the site's EN/ES switch (aog-topbar.js), and each
picture has a Spanish twin (pp-*-es.png) that swaps with them. The pictures are real parts of the real
piano, taken from music-piano.html.

  python3 _work/music/make_piano_guide.py        (from aog-deploy/)
"""
import html, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))


def esc(t):
    return html.escape(t, quote=True)


def sp(en, es):
    return '<span data-en="%s" data-es="%s">%s</span>' % (esc(en), esc(es), esc(en))


def img(name, alt_en, alt_es, style=""):
    return ('<img src="/%s.png" data-en-src="/%s.png" data-es-src="/%s-es.png" alt="%s" data-en-alt="%s" data-es-alt="%s" loading="lazy"%s>'
            % (name, name, name, esc(alt_en), esc(alt_en), esc(alt_es), (' style="%s"' % style) if style else ""))


def part(cls, name, alt, title, text):
    return '    <div class="part %s">\n      %s\n      <b>%s</b><span>%s</span>\n    </div>' % (cls, img(name, alt[0], alt[1]), sp(*title), sp(*text))


def step(n, pic, title, text):
    return '    <div class="step"><span class="num">%d</span>\n      %s\n      <b>%s</b><span>%s</span>\n    </div>' % (n, pic, sp(*title), sp(*text))


def svgtext(x, y, en, es, cls="", anchor="middle"):
    return '<text x="%s" y="%s" text-anchor="%s"%s data-en="%s" data-es="%s">%s</text>' % (x, y, anchor, (' class="%s"' % cls) if cls else "", esc(en), esc(es), esc(en))


WHITE_EN = ["C", "D", "E", "F", "G", "A", "B"]
WHITE_ES = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"]


def keyboard(n_white, marks=None, labels="none", groups=False, w=44, h=150):
    """a drawn keyboard from C. marks: {semitone: colour}. labels: none | c | all"""
    marks = marks or {}
    W = n_white * w + 2
    top = 34 if groups else 4
    out = ['<svg class="kb" viewBox="0 0 %d %d" role="img" aria-hidden="true">' % (W, top + h + 34)]
    white_semi = [0, 2, 4, 5, 7, 9, 11]
    for i in range(n_white):
        semi = 12 * (i // 7) + white_semi[i % 7]
        fill = marks.get(semi, "#fffdf7")
        out.append('<rect x="%d" y="%d" width="%d" height="%d" rx="4" fill="%s" stroke="#3b3f46" stroke-width="1.6"/>' % (1 + i * w, top, w, h, fill))
        name_en, name_es = WHITE_EN[i % 7], WHITE_ES[i % 7]
        if labels == "all" or (labels == "c" and i % 7 == 0):
            out.append(svgtext(1 + i * w + w / 2, top + h + 24, name_en, name_es, "kl"))
    after = {0: 1, 1: 3, 3: 6, 4: 8, 5: 10}
    for i in range(n_white - 1):
        if i % 7 in after:
            semi = 12 * (i // 7) + after[i % 7]
            fill = marks.get(semi, "#1f2227")
            out.append('<rect x="%d" y="%d" width="%d" height="%d" rx="3" fill="%s" stroke="#111" stroke-width="1.2"/>' % (1 + (i + 1) * w - 14, top, 28, int(h * 0.6), fill))
    if groups:
        for o in range(n_white // 7):
            x0 = 1 + o * 7 * w
            # the pair over C♯ D♯, the trio over F♯ G♯ A♯
            out.append('<path d="M%d %d v-8 h%d v8" fill="none" stroke="#2f5c6b" stroke-width="2"/>' % (x0 + w - 14, top - 4, w + 28))
            out.append('<text x="%d" y="%d" text-anchor="middle" class="kg">2</text>' % (x0 + w * 1.5, top - 16))
            out.append('<path d="M%d %d v-8 h%d v8" fill="none" stroke="#2f5c6b" stroke-width="2"/>' % (x0 + 4 * w - 14, top - 4, 2 * w + 28))
            out.append('<text x="%d" y="%d" text-anchor="middle" class="kg">3</text>' % (x0 + w * 5, top - 16))
    out.append("</svg>")
    return "".join(out)


GOLD = "#f2c76a"
BLUE = "#9cc8e8"

BODY = []
B = BODY.append
B('''<div class="wrap">

<header>
  <a class="brand" href="/">Architecture of Grace</a>
  <div class="tools">
    <a class="btn" href="/piano">%s</a>
    <button class="btn go" type="button" onclick="window.print()">%s</button>
  </div>
</header>

<h1>%s</h1>
<p class="lede">%s</p>
''' % (sp("← The piano", "← El piano"), sp("Print this", "Imprimir"), sp("The Piano, in pictures", "El piano, en imágenes"),
       sp("Almost no reading. Keep it next to the piano. Every picture is the real piano.", "Casi sin lectura. Tenla junto al piano. Cada imagen es el piano de verdad.")))

# ★ the whole piano
B('<section>\n  <h2><span class="n">&#9733;</span>%s</h2>\n  <p class="sub">%s</p>' % (sp("Start here · the whole piano", "Empieza aquí · todo el piano"),
  sp("Top to bottom: the sound, the chords, the chord wheel, the keys, and the dial.", "De arriba abajo: el sonido, los acordes, la rueda de acordes, las teclas y el dial.")))
B('  <figure class="whole">%s<figcaption>%s</figcaption></figure>' % (img("pp-whole", "The whole piano: Instrument, Chords with the six pads, the Chord wheel, Keys, the Sound dial and Send to the turntables.",
  "Todo el piano: Instrumento, Acordes con los seis pads, la Rueda de acordes, Teclas, el dial de Sonido y Enviar a los platos."),
  sp("The whole piano. Each part is below, close up.", "Todo el piano. Cada parte está abajo, de cerca.")))
B('  <div class="parts">')
B(part("wide", "pp-sound", ("The Instrument menu, set to Grand piano.", "El menú Instrumento, en Piano de cola."), ("Instrument", "Instrumento"),
       ("34 sounds in eight groups. Many are real recordings, from the grand piano to the church organ and the bells.", "34 sonidos en ocho grupos. Muchos son grabaciones de verdad, del piano de cola al órgano de iglesia y las campanas.")))
B(part("wide", "pp-key", ("Key and Mood: Major is bright, Minor is moody.", "Tono y Ánimo: Mayor es brillante, Menor es melancólico."), ("Key · Mood", "Tono · Ánimo"),
       ("Key moves every chord up or down. Major is bright. Minor is moody.", "El tono sube o baja todos los acordes. Mayor es brillante. Menor es melancólico.")))
B(part("wide", "pp-pads", ("The six chord pads, numbered 1 to 6.", "Los seis pads de acordes, del 1 al 6."), ("The six pads", "Los seis pads"),
       ("Tap one: a chord that fits the key. Pad 1 is home.", "Toca uno: un acorde que va con el tono. El pad 1 es la casa.")))
B(part("wide", "pp-pattern", ("The pattern menu and the How the chords play menu.", "El menú de patrones y el menú Cómo suenan los acordes."), ("Pattern · How the chords play", "Patrón · Cómo suenan los acordes"),
       ("Pick a chord pattern. Then pick how it plays: long, in beats, one note at a time, or off the beat.", "Elige un patrón de acordes. Luego elige cómo suena: largo, en pulsos, una nota a la vez o a contratiempo.")))
B(part("wide", "pp-prog", ("Your chord pattern, with Play the chords, Make my own and Clear.", "Tu patrón de acordes, con Tocar los acordes, Hacer el mío y Borrar."), ("Your pattern · Play · Make my own · Clear", "Tu patrón · Tocar · Hacer el mío · Borrar"),
       ("One chord for each bar. Orange plays and stops. Make my own: tap pads in order.", "Un acorde por compás. El naranja toca y para. Hacer el mío: toca los pads en orden.")))
B(part("wide", "pp-tempo", ("The Tempo slider at 90 beats a minute.", "El deslizador de Tempo en 90 pulsos por minuto."), ("Tempo", "Tempo"),
       ("Slower or faster.", "Más lento o más rápido.")))
B(part("wide", "pp-wheel", ("The chord wheel in C: the six pads lit, C with the gold ring.", "La rueda de acordes en Do: los seis pads iluminados, Do con el aro dorado."), ("Chord wheel", "Rueda de acordes"),
       ("Every chord in a circle. The six light ones are your pads. Tap one to hear it.", "Todos los acordes en un círculo. Los seis claros son tus pads. Toca uno para oírlo.")))
B(part("wide", "pp-keyrow", ("Lower, Higher and Hold notes (pedal).", "Más grave, Más agudo y Mantener notas (pedal)."), ("Lower · Higher · Hold notes", "Más grave · Más agudo · Mantener notas"),
       ("Move the keys down or up. Hold notes is the pedal.", "Baja o sube las teclas. Mantener notas es el pedal.")))
B(part("wide", "pp-kbd", ("The keys, two octaves from C3 to C5.", "Las teclas, dos octavas de Do3 a Do5."), ("The keys", "Las teclas"),
       ("Press near the bottom for a loud note, near the top for a soft one. Slide a finger to play many.", "Presiona cerca de abajo para una nota fuerte y cerca de arriba para una suave. Desliza un dedo para tocar muchas.")))
B(part("wide", "pp-dial", ("The Sound dial from 1987 to 2026, Volume, and Send to the turntables.", "El dial de Sonido de 1987 a 2026, Volumen y Enviar a los platos."), ("Sound · Volume · Send", "Sonido · Volumen · Enviar"),
       ("Left: 1987 crunch. Right: clean 2026. Send makes a recording for the turntables.", "Izquierda: crujido de 1987. Derecha: limpio 2026. Enviar hace una grabación para los platos.")))
B('  </div>\n</section>')

# 1 · a song in two taps
B('<section>\n  <h2><span class="n">1</span>%s</h2>\n  <p class="sub">%s</p>\n  <div class="steps">' % (sp("A song in two taps", "Una canción en dos toques"),
  sp("Pick a pattern. Press Play. That is a song.", "Elige un patrón. Pulsa Tocar. Eso es una canción.")))
B(step(1, img("pp-s-pattern", "Start from a chord pattern, set to Pop.", "Empieza con un patrón de acordes, en Pop."), ("Pick a pattern", "Elige un patrón"), ("Pop is a good first one.", "Pop es un buen primero.")))
B(step(2, img("pp-s-play", "Play the chords.", "Tocar los acordes."), ("Press Play", "Pulsa Tocar"), ("The orange button.", "El botón naranja.")))
B(step(3, img("pp-kbd-lit", "Orange keys are playing now; the pale key fits the chord.", "Las teclas naranjas suenan ahora; la clara encaja con el acorde."), ("Watch the keys", "Mira las teclas"), ("Orange keys are playing. Pale keys fit the chord.", "Las naranjas suenan. Las claras encajan con el acorde.")))
B(step(4, img("pp-pads-now", "The pad that is playing now has a red ring.", "El pad que suena ahora tiene un aro rojo."), ("Watch the pads", "Mira los pads"), ("The red ring shows the chord now.", "El aro rojo muestra el acorde de ahora.")))
B('  </div>\n</section>')

# 2 · find C
B('<section>\n  <h2><span class="n">2</span>%s</h2>\n  <p class="sub">%s</p>' % (sp("Find C", "Encuentra el Do"),
  sp("Black keys come in groups of two and three. C is just left of the two.", "Las teclas negras van en grupos de dos y de tres. Do está justo a la izquierda del dos.")))
B('  <figure class="draw">%s<figcaption>%s</figcaption></figure>' % (keyboard(14, {0: GOLD, 12: GOLD}, labels="c", groups=True).replace('<svg class="kb"', '<svg class="kb big"', 1),
  sp("Every C is gold here. The names go C D E F G A B, then start again.", "Aquí cada Do es dorado. Los nombres van Do Re Mi Fa Sol La Si, y luego empiezan otra vez.")))
B('</section>')

# 3 · soft and loud, and the pedal
B('<section>\n  <h2><span class="n">3</span>%s</h2>' % sp("Soft, loud, and the pedal", "Suave, fuerte y el pedal"))
B('  <div class="two">')
B('    <figure class="draw card">%s<figcaption>%s</figcaption></figure>' % (
  '<svg class="onekey" viewBox="0 0 220 200" role="img" aria-hidden="true"><rect x="70" y="6" width="80" height="188" rx="6" fill="#fffdf7" stroke="#3b3f46" stroke-width="2"/>'
  '<rect x="74" y="10" width="72" height="56" rx="4" fill="#dcefe0"/><rect x="74" y="130" width="72" height="60" rx="4" fill="#f9d9c8"/>'
  + svgtext(110, 44, "soft", "suave", "kz") + svgtext(110, 166, "loud", "fuerte", "kz") +
  '<path d="M160 38 h40 M160 160 h40" stroke="#5c6670" stroke-width="2"/>' + svgtext(204, 42, "p", "p", "kd", "start") + svgtext(204, 164, "f", "f", "kd", "start") + '</svg>',
  sp("Press near the top for soft (p), near the bottom for loud (f). The grand piano also gets brighter when it is loud.", "Presiona cerca de arriba para suave (p) y cerca de abajo para fuerte (f). El piano de cola también suena más brillante cuando es fuerte.")))
B('    <div class="part wide">%s<b>%s</b><span>%s</span></div>' % (img("pp-keyrow", "Hold notes (pedal), beside Lower and Higher.", "Mantener notas (pedal), junto a Más grave y Más agudo."),
  sp("Hold notes · the pedal", "Mantener notas · el pedal"), sp("On: notes keep ringing after you let go. Off: they stop. On a computer, hold Shift.", "Activo: las notas siguen sonando cuando sueltas. Apagado: paran. En la computadora, mantén Shift.")))
B('  </div>\n</section>')

# 4 · a chord by hand
B('<section>\n  <h2><span class="n">4</span>%s</h2>\n  <p class="sub">%s</p>' % (sp("A chord with your hand", "Un acorde con tu mano"),
  sp("Play one, skip one, play one, skip one, play one.", "Toca una, salta una, toca una, salta una, toca una.")))
B('  <div class="two">')
B('    <figure class="draw card">%s<figcaption><b>%s</b> %s</figcaption></figure>' % (keyboard(7, {0: GOLD, 4: GOLD, 7: GOLD}, labels="all", w=40, h=120),
  sp("C major:", "Do mayor:"), sp("C, E, G. Bright.", "Do, Mi, Sol. Brillante.")))
B('    <figure class="draw card">%s<figcaption><b>%s</b> %s</figcaption></figure>' % (keyboard(7, {0: BLUE, 3: BLUE, 7: BLUE}, labels="all", w=40, h=120),
  sp("C minor:", "Do menor:"), sp("C, E♭, G. The middle key moves down one. Moody.", "Do, Mi♭, Sol. La tecla del medio baja una. Melancólico.")))
B('  </div>\n</section>')

# 5 · the six pads
B('<section>\n  <h2><span class="n">5</span>%s</h2>\n  <p class="sub">%s</p>' % (sp("The six pads, in any key", "Los seis pads, en cualquier tono"),
  sp("The numbers are steps of the scale. They mean the same thing in every key.", "Los números son pasos de la escala. Significan lo mismo en cualquier tono.")))
B('  <ul class="padlist">')
for num, cls, en, es in [("1", "maj", "Home. Songs often start and end here.", "La casa. Las canciones suelen empezar y terminar aquí."),
                         ("2", "min", "Moody. Leads on to 5.", "Melancólico. Lleva al 5."),
                         ("3", "min", "Moody, soft.", "Melancólico, suave."),
                         ("4", "maj", "Bright. Away from home.", "Brillante. Lejos de casa."),
                         ("5", "maj", "Bright. Wants to go home: tap 5, then 1.", "Brillante. Quiere volver a casa: toca 5 y luego 1."),
                         ("6", "min", "Moody. The sad friend of 1.", "Melancólico. El amigo triste del 1.")]:
    B('    <li><span class="pn %s">%s</span><span>%s</span></li>' % (cls, num, sp(en, es)))
B('  </ul>\n  <p class="note">%s</p>\n</section>' % sp("In Minor the pads become 1, 3, 4, 5, 6 and 7, and the moody chords lead.", "En Menor los pads son 1, 3, 4, 5, 6 y 7, y mandan los acordes melancólicos."))

# 6 · the chord wheel (AOG-PIANO-WHEEL-V1)
B('<section>\n  <h2><span class="n">6</span>%s</h2>\n  <p class="sub">%s</p>\n  <div class="steps">' % (sp("The chord wheel", "La rueda de acordes"),
  sp("Every major chord goes round the outside, its minor just inside. Tap any chord to hear it.", "Cada acorde mayor va por fuera y su menor justo dentro. Toca cualquier acorde para oírlo.")))
B(step(1, img("pp-wheel", "The chord wheel in C: the six pads lit with their numbers, C with the gold ring.", "La rueda de acordes en Do: los seis pads iluminados con sus números, Do con el aro dorado."),
           ("Your six pads", "Tus seis pads"), ("They sit together, with their numbers. Gold ring: home.", "Están juntos, con sus números. Aro dorado: la casa.")))
B(step(2, img("pp-s-turn", "Turn to F and Turn to G.", "Girar a Fa y Girar a Sol."), ("Turn the wheel", "Gira la rueda"), ("One step changes the key. The pads follow.", "Un paso cambia el tono. Los pads lo siguen.")))
B(step(3, img("pp-wheel-now", "While the chords play, G is orange.", "Mientras suenan los acordes, Sol está naranja."), ("Watch it play", "Mírala sonar"), ("The chord playing now is orange.", "El acorde que suena ahora está naranja.")))
B('  </div>\n  <p class="note">%s</p>\n</section>' % sp("With Make my own on, a tap on the wheel adds that chord to your pattern. Any of the 24 can join.", "Con Hacer el mío activo, un toque en la rueda añade ese acorde a tu patrón. Cualquiera de los 24 puede entrar."))

# 7 · your own pattern
B('<section>\n  <h2><span class="n">7</span>%s</h2>\n  <div class="steps">' % sp("Make your own pattern", "Haz tu propio patrón"))
B(step(1, img("pp-s-own", "Make my own and Clear.", "Hacer el mío y Borrar."), ("Clear, then Make my own", "Borrar, luego Hacer el mío"), ("Clear empties the pattern.", "Borrar vacía el patrón.")))
B(step(2, img("pp-pads", "The six pads.", "Los seis pads."), ("Tap pads", "Toca pads"), ("In the order you like. Up to 8.", "En el orden que quieras. Hasta 8.")))
B(step(3, img("pp-s-pad1", "Pad 1.", "El pad 1.", "max-width:150px"), ("End on 1", "Termina en 1"), ("It sounds finished.", "Suena terminado.")))
B(step(4, img("pp-s-play", "Play the chords.", "Tocar los acordes."), ("Press Play", "Pulsa Tocar"), ("Your pattern goes round.", "Tu patrón da vueltas.")))
B('  </div>\n</section>')

# 8 · the sounds: AOG-PIANO-SOUNDS-V2 (2026-10-04), 34 of them in the menu's eight groups, one line each
B('<section>\n  <h2><span class="n">8</span>%s</h2>\n  <p class="sub">%s</p>\n  <div class="kits">' % (sp("34 sounds, eight groups", "34 sonidos, ocho grupos"),
  sp("Same keys, different color. That color is called timbre.", "Las mismas teclas, otro color. Ese color se llama timbre.")))
for letter, en, es, how_en, how_es in [
    ("1", "Pianos", "Pianos", "Hammers hit strings. Grand, upright, honky-tonk, bright, soft felt, toy.", "Martillos golpean cuerdas. De cola, vertical, honky-tonk, brillante, suave de fieltro, de juguete."),
    ("2", "Electric pianos", "Pianos eléctricos", "Metal tines, reeds or a computer chip. And the funky clavinet.", "Varillas, lengüetas o un chip de computadora. Y el clavinet del funk."),
    ("3", "Organs and accordion", "Órganos y acordeón", "Spinning wheels or air through pipes. Never fades.", "Ruedas que giran o aire por tubos. Nunca se apaga."),
    ("4", "Mallets and bells", "Láminas y campanas", "Celesta, glockenspiel, vibraphone, marimba, steel drums, bells.", "Celesta, glockenspiel, vibráfono, marimba, tambores de acero, campanas."),
    ("5", "Plucked", "Pulsados", "Harpsichord, harp, kalimba, music box.", "Clavecín, arpa, kalimba, caja de música."),
    ("6", "Strings and voices", "Cuerdas y voces", "Soft strings, recorded. A choir.", "Cuerdas suaves, grabadas. Un coro."),
    ("7", "Tape keyboards", "Teclados de cinta", "Strings and flute on tape, for prog rock.", "Cuerdas y flauta en cinta, para el rock progresivo."),
    ("8", "Synths", "Sintetizadores", "String synth, warm synth, synth brass, synth lead.", "Sintetizador de cuerdas, cálido, de metales y solista.")]:
    B('    <div class="bank"><div class="letter">%s</div><div><b>%s</b><span>%s</span></div></div>' % (letter, sp(en, es), sp(how_en, how_es)))
B('  </div>\n</section>')

# 9 · the drum machine and the turntables
B('<section>\n  <h2><span class="n">9</span>%s</h2>\n  <div class="steps">' % sp("With the drum machine and the turntables", "Con la caja de ritmos y los platos"))
B(step(1, '<svg class="ico" viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="14" width="52" height="38" rx="6" fill="#2b2f35"/><g fill="#f2c76a"><rect x="12" y="20" width="10" height="10" rx="2"/><rect x="27" y="20" width="10" height="10" rx="2"/><rect x="42" y="20" width="10" height="10" rx="2"/><rect x="12" y="35" width="10" height="10" rx="2"/><rect x="27" y="35" width="10" height="10" rx="2"/><rect x="42" y="35" width="10" height="10" rx="2"/></g></svg>',
       ("On the drum machine", "En la caja de ritmos"), ("Make a beat. Press Send to the turntables.", "Haz un ritmo. Pulsa Enviar a los platos.")))
B(step(2, img("pp-s-drum", "Play with my drum beat, and the name of the beat.", "Tocar con mi ritmo de batería, y el nombre del ritmo."), ("Back on the piano", "De vuelta en el piano"),
       ("Press Play with my drum beat, under Tempo.", "Pulsa Tocar con mi ritmo de batería, debajo del Tempo.")))
B(step(3, img("pp-s-play", "Play the chords.", "Tocar los acordes."), ("Press Play", "Pulsa Tocar"), ("Your chords play in time with the beat.", "Tus acordes suenan a tiempo con el ritmo.")))
B(step(4, img("pp-s-send", "Send to the turntables.", "Enviar a los platos."), ("Send", "Enviar"), ("On the turntables it is under From the piano.", "En los platos está en Del piano.")))
B('  </div>\n</section>')

# 10 · a computer
B('<section>\n  <h2><span class="n">10</span>%s</h2>\n  <p class="sub">%s</p>' % (sp("On a computer", "En una computadora"),
  sp("Each key shows its letter. The letters stay put when you move up or down.", "Cada tecla muestra su letra. Las letras no cambian al subir o bajar.")))
B('  <figure class="whole letters">%s<figcaption>%s</figcaption></figure>' % (img("pp-letters", "The keys with their computer letters: A S D F G H J K L ; and W E T Y U O P.", "Las teclas con sus letras de la computadora: A S D F G H J K L Ñ y W E T Y U O P."),
  sp("The middle row plays the white keys. The row above plays the black keys.", "La fila del medio toca las teclas blancas. La fila de arriba toca las negras.")))
B('  <ul class="keys">')
for k, en, es in [("A S D F G H J K", "White keys, C up to C", "Teclas blancas, de Do a Do"), ("W E T Y U O P", "Black keys", "Teclas negras"),
                  ("Shift", "Hold for the pedal", "Mantén para el pedal"), ("1 – 6", "The six pads", "Los seis pads"),
                  ("Z · X", "Lower · higher", "Más grave · más agudo"), ("Space", "Play and stop", "Tocar y parar")]:
    B('    <li><kbd>%s</kbd><span>%s</span></li>' % (esc(k) if k != "Space" else sp("Space", "Espacio"), sp(en, es)))
B('  </ul>\n</section>')

# 11 · the lessons
B('<section>\n  <h2><span class="n">11</span>%s</h2>\n  <p class="sub">%s</p>' % (sp("The lessons", "Las lecciones"),
  sp("Pick a lesson in the Lesson menu. Do the steps on the piano. They tick themselves.", "Elige una lección en el menú Lección. Haz los pasos en el piano. Se marcan solos.")))
B('  <figure class="whole lessons">%s<figcaption>%s</figcaption></figure>' % (img("pp-lessons", "The lesson card: three steps ticked, and the Worksheet button.", "La tarjeta de la lección: tres pasos marcados y el botón de la hoja de trabajo."),
  sp("Worksheet opens the sheet for that lesson. Type on it or print it.", "La hoja de trabajo abre la hoja de esa lección. Escribe en ella o imprímela.")))
B('</section>')

# nothing is happening
B('<section>\n  <h2><span class="n">?</span>%s</h2>\n  <ul class="fix">' % sp("Nothing is happening?", "¿No pasa nada?"))
for en_b, es_b, en_s, es_s in [
    ("No sound", "No hay sonido", "Turn Volume up and tap a key once. A phone wakes its sound on the first tap. An iPhone plays even with the silent switch on.",
     "Sube el Volumen y toca una tecla una vez. Un teléfono despierta su sonido con el primer toque. Un iPhone suena aunque esté en silencio."),
    ("“Getting the grand piano ready…”", "“Preparando el piano de cola…”", "The recordings are on their way. Until then you hear a sound made on this page.",
     "Las grabaciones vienen en camino. Mientras tanto suena un sonido hecho en esta página."),
    ("Play does nothing", "Tocar no hace nada", "Pick a chord pattern first, or press Make my own and tap some pads.",
     "Primero elige un patrón de acordes, o pulsa Hacer el mío y toca algunos pads."),
    ("The tempo will not move", "El tempo no se mueve", "Play with my drum beat is on. The drum beat sets the tempo. Press it again to turn it off.",
     "Tocar con mi ritmo de batería está activo. El ritmo pone el tempo. Púlsalo otra vez para apagarlo."),
    ("A MIDI keyboard", "Un teclado MIDI", "Press Use a MIDI keyboard and plug it in. The line under the buttons says when it is ready. No button? This browser cannot use MIDI. On a computer, try Chrome or Edge.",
     "Pulsa Usar un teclado MIDI y conéctalo. La línea bajo los botones dice cuándo está listo. ¿No ves el botón? Este navegador no puede usar MIDI. En una computadora, prueba Chrome o Edge.")]:
    B('    <li><span class="q">?</span><div><b>%s</b><span>%s</span></div></li>' % (sp(en_b, es_b), sp(en_s, es_s)))
B('  </ul>\n</section>')

B('''<footer>
  %s
</footer>

</div>''' % sp("The Piano · Architecture of Grace · grand piano: Salamander Grand Piano by Alexander Holm (CC BY 3.0); upright: Simon Dalzell, Ivy Audio, for Versilian Studios (CC0)",
               "El piano · Architecture of Grace · piano de cola: Salamander Grand Piano de Alexander Holm (CC BY 3.0); vertical: Simon Dalzell, Ivy Audio, para Versilian Studios (CC0)"))

EXTRA_CSS = """
/* AOG-PIANOPIC-V1 — the piano's own pieces */
.whole img { max-width:560px; }
.whole.letters img { max-width:720px; }
.whole.lessons img { max-width:440px; }
.part img { width:100%; max-width:460px; }
/* the step boxes hold real close-ups, so they get room: two across, one across on a phone */
.steps { grid-template-columns:repeat(2,1fr); }
@media (max-width:700px){ .steps { grid-template-columns:1fr; } }
.step img { max-width:100%; }
.draw { margin:0 0 .4rem; break-inside:avoid; page-break-inside:avoid; }
.draw.card { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:.8rem .9rem .9rem; }
.draw figcaption { color:var(--muted); font-size:.92rem; margin-top:.45rem; }
.draw figcaption b { color:var(--ink); }
svg.kb { display:block; width:100%; max-width:640px; height:auto; }
svg.kb .kl { font:700 15px var(--sans); fill:#1a232c; }
svg.kb .kg { font:800 16px var(--sans); fill:#2f5c6b; }
svg.kb.big .kl { font-size:26px; }
svg.kb.big .kg { font-size:28px; }
svg.onekey { display:block; width:100%; max-width:240px; height:auto; }
svg.onekey .kz { font:800 15px var(--sans); fill:#1a232c; }
svg.onekey .kd { font:italic 700 18px var(--display); fill:#1a232c; }
[data-theme="dark"] svg.kb .kl, .dark svg.kb .kl { fill:#edeae2; }
[data-theme="dark"] svg.kb .kg, .dark svg.kb .kg { fill:#7fb4c7; }
[data-theme="dark"] svg.onekey .kd, .dark svg.onekey .kd { fill:#edeae2; }
.padlist { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(3,1fr); gap:.55rem; }
@media (max-width:700px){ .padlist { grid-template-columns:1fr; } }
.padlist li { display:flex; gap:.7rem; align-items:center; background:var(--card); border:1px solid var(--line); border-radius:12px; padding:.55rem .7rem; break-inside:avoid; }
.pn { flex:0 0 auto; width:2.4rem; height:2.4rem; border-radius:10px; display:flex; align-items:center; justify-content:center; font:800 1.2rem/1 var(--display);
  -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.pn.maj { background:#f2d58f; color:#2a1a08; }
.pn.min { background:#bcd6e8; color:#10273a; }
.padlist li > span:last-child { font-size:.92rem; }
.keys { list-style:none; margin:.8rem 0 0; padding:0; display:grid; grid-template-columns:repeat(3,1fr); gap:.5rem .9rem; }
@media (max-width:700px){ .keys { grid-template-columns:1fr; } }
.keys li { display:flex; gap:.6rem; align-items:center; font-size:.95rem; }
.keys kbd { flex:0 0 auto; min-width:4.6rem; text-align:center; font:700 .85rem/1 var(--sans); padding:.4rem .5rem; border:1px solid var(--line); border-bottom-width:3px; border-radius:7px; background:var(--card); color:var(--ink); }
.step svg.ico { max-width:90px; }
.fix .q { flex:0 0 auto; width:2rem; height:2rem; border-radius:50%; background:var(--chip); color:var(--ink); display:flex; align-items:center; justify-content:center; font:800 1rem/1 var(--sans); }
"""

LANG_JS = """<script>
/* AOG-PIANOPIC-V1 — each picture has a Spanish twin; it follows the page language (the EN/ES switch in the top bar) */
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
    src = open(os.path.join(ROOT, "drums-guide.html"), encoding="utf-8").read()
    head = src.split("</head>", 1)[0]
    rep = [("<title>The Drum Machine &mdash; Picture Guide</title>", "<title>The Piano &mdash; Picture Guide</title>"),
           ('<meta name="description" content="The drum machine in pictures. Almost no reading. Print it and keep it next to the machine.">',
            '<meta name="description" content="The piano in pictures. Almost no reading. Print it and keep it next to the piano.">')]
    for a, b in rep:
        assert head.count(a) == 1, a
        head = head.replace(a, b)
    head = re.sub(r"<!-- AOG-DRUMPIC-V1 .*?-->",
                  "<!-- AOG-PIANOPIC-V1 (2026-10-03) — the piano in pictures, the drum machine's picture guide in form: student-facing,\n"
                  "     almost no reading, prints on letter, every figure one block that does not split across a page. English and\n"
                  "     Spanish, pictures included. Built by _work/music/make_piano_guide.py. -->", head, count=1, flags=re.S)
    i = head.rfind("</style>")
    head = head[:i] + EXTRA_CSS + head[i:]
    page = head + "</head>\n<body>\n<script src=\"/aog-grace.js\" defer></script>\n" + "\n".join(BODY) + "\n" + LANG_JS + "\n<script src=\"/aog-topbar.js\"></script>\n</body>\n</html>\n"
    open(os.path.join(ROOT, "piano-guide.html"), "w", encoding="utf-8").write(page)
    print("piano-guide.html written")


if __name__ == "__main__":
    build()
