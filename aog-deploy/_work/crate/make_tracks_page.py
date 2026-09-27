#!/usr/bin/env python3
"""Builds ../../decks-tracks.html — the track list to gather before class.
Edit the lists below and run: python3 make_tracks_page.py
Only song NAMES are listed; no copyrighted audio is hosted."""
import html, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "decks-tracks.html")

def sp(en, es, tag="span", cls=""):
    c = f' class="{cls}"' if cls else ""
    return f'<{tag}{c} data-en="{html.escape(en, quote=True)}" data-es="{html.escape(es, quote=True)}">{html.escape(en)}</{tag}>'

# (starter, [ (artist, title, bpm_text, why_en, why_es) ])
S = {  # starter crate names
 "pk": "Paper Kites (90)", "pl": "Porch Light (80)", "im": "Island Morning (84)", "sc": "Sunday Clap (100)",
 "pp": "Practice Pair (102)", "bb": "Brass Bus (106)", "bg": "Bell Garden (110)", "rb": "Rooftop Break (114)",
 "bl": "Blue Lamp (120)", "nm": "Night Market (124)", "fl": "Fast Lane (128)"}

LESSONS = [
 (1, "Power and a record on A", "Encender y un disco en A",
  "Any song with a clear beat. Short is fine.", "Cualquier canción con un pulso claro. Corta está bien.",
  ["pk"], [
   ("Bill Withers", "Lovely Day", "about 98", "Warm, steady and friendly. A calm first record.", "Cálida, estable y amable. Un primer disco tranquilo."),
   ("Stevie Wonder", "Superstition", "about 100", "Starts with drums alone, so you hear it begin right away.", "Empieza solo con batería, así oyes el comienzo enseguida.")]),
 (2, "Play, stop, the platter", "Arrancar, parar, el plato",
  "A song that starts strong, so you hear the motor start and stop.", "Una canción que empieza fuerte, para oír cuándo arranca y para el motor.",
  ["sc"], [
   ("Queen", "We Will Rock You", "about 81", "Stomp, stomp, clap. Easy to hear when it stops.", "Pisotón, pisotón, aplauso. Fácil oír cuándo para."),
   ("Earth, Wind & Fire", "September", "about 126", "Bright from the first second.", "Brillante desde el primer segundo.")]),
 (3, "The crossfader", "El crossfader",
  "Two songs that sound very different, so you can tell which deck you hear.", "Dos canciones muy distintas, para saber qué plato suena.",
  ["pl", "fl"], [
   ("Bob Marley & The Wailers", "Three Little Birds", "about 75", "Slow and soft. Pair it with a fast song.", "Lenta y suave. Júntala con una canción rápida."),
   ("Earth, Wind & Fire", "September", "about 126", "Fast and bright. The other side of the fader.", "Rápida y brillante. El otro lado del fader.")]),
 (4, "Cue a record on B", "Prepara un disco en B",
  "A song with a clear first beat, so the cue point is easy to find.", "Una canción con un primer golpe claro, para encontrar el cue fácil.",
  ["pk"], [
   ("Michael Jackson", "Billie Jean", "about 117", "The drums start alone. Beat one is easy to see.", "La batería empieza sola. El uno se ve fácil."),
   ("Stevie Wonder", "Superstition", "about 100", "A drum intro with a clear first hit.", "Una intro de batería con un primer golpe claro.")]),
 (5, "What BPM is", "Qué es el BPM",
  "One slow song and one fast song, to feel the difference.", "Una canción lenta y una rápida, para sentir la diferencia.",
  ["pl", "fl"], [
   ("Queen", "We Will Rock You", "about 81", "Slow and easy to tap along to.", "Lenta y fácil de seguir con TAP."),
   ("Pharrell Williams", "Happy", "about 160", "Fast. Some people tap it at 80. Both are right: it is double.", "Rápida. Hay quien la marca a 80. Las dos valen: es el doble."),
   ("Bee Gees", "Stayin' Alive", "about 104", "A steady middle speed. Nurses use it to learn CPR timing.", "Una velocidad media y estable. Se usa para aprender el ritmo de RCP.")]),
 (6, "The pitch fader", "El fader de tono",
  "Any song with a steady beat. You will hear it speed up and slow down.", "Cualquier canción con pulso fijo. La oirás acelerar y frenar.",
  ["pp"], [
   ("Stevie Wonder", "Superstition", "about 100", "Steady drums, so small changes are easy to hear.", "Batería estable: los cambios pequeños se oyen fácil."),
   ("Bill Withers", "Lovely Day", "about 98", "Calm and steady.", "Tranquila y estable.")]),
 (7, "Beatmatch by ear", "Igualar el ritmo de oído",
  "Two songs within a few BPM of each other, both with steady drums.", "Dos canciones a pocos BPM una de otra, las dos con batería estable.",
  ["sc", "pp"], [
   ("Daft Punk ft. Pharrell Williams", "Get Lucky (radio edit)", "about 116", "Pairs well with Billie Jean: only 1 BPM apart.", "Va bien con Billie Jean: solo 1 BPM de diferencia."),
   ("Michael Jackson", "Billie Jean", "about 117", "Steady drum machine beat. A classic practice pair.", "Ritmo de caja de ritmos, estable. Una pareja clásica para practicar."),
   ("Mark Ronson ft. Bruno Mars", "Uptown Funk (clean edit)", "about 115", "A third song in the same speed range.", "Una tercera canción en el mismo rango.")]),
 (8, "The EQ: bass swap", "El EQ: cambio de graves",
  "Two songs with a strong bass line.", "Dos canciones con una línea de bajo fuerte.",
  ["bg", "rb"], [
   ("Queen", "Another One Bites the Dust", "about 110", "The bass line is the whole song. Cut it and you will hear it go.", "El bajo es toda la canción. Córtalo y lo notarás."),
   ("Michael Jackson", "Billie Jean", "about 117", "A famous bass line that walks the whole way.", "Un bajo famoso que camina todo el tiempo.")]),
 (9, "A clean blend", "Una mezcla limpia",
  "Two songs close in BPM, with long intros and outros.", "Dos canciones de BPM parecido, con intros y finales largos.",
  ["bl", "nm"], [
   ("Daft Punk", "Around the World", "about 121", "Long, steady, and the same loop for minutes. Easy to blend.", "Larga, estable, el mismo bucle por minutos. Fácil de mezclar."),
   ("Kool & The Gang", "Celebration", "about 121", "Near the same speed. A good song to blend into.", "Casi la misma velocidad. Buena para entrar mezclando.")]),
 (10, "The cue point and the drop", "El punto de cue y la entrada",
  "A song where the beat or bass comes in hard on the one.", "Una canción donde el ritmo o el bajo entra fuerte en el uno.",
  ["rb"], [
   ("Queen", "Another One Bites the Dust", "about 110", "The bass enters alone. Set your cue right there.", "El bajo entra solo. Pon el cue justo ahí."),
   ("Stevie Wonder", "Superstition", "about 100", "The first drum hit is a clean place for a cue.", "El primer golpe de batería es un buen lugar para el cue.")]),
 (11, "The baby scratch", "El scratch básico",
  "A short, clear sound: one drum hit, one word, one horn stab.", "Un sonido corto y claro: un golpe, una palabra, un golpe de metales.",
  ["bb", "sc"], [
   ("The Winstons", "Amen, Brother", "about 136", "An instrumental. The drum break has single, clear hits.", "Instrumental. El break de batería tiene golpes sueltos y claros."),
   ("Queen", "We Will Rock You", "about 81", "The clap is one clear sound. Push it and pull it back.", "El aplauso es un sonido claro. Empújalo y tíralo atrás.")]),
 (12, "The cut", "El corte",
  "A song with gaps, so the cut on and off is easy to hear.", "Una canción con huecos, para oír bien el corte.",
  ["pk", "rb"], [
   ("The Winstons", "Amen, Brother", "about 136", "The drum break: short hits you can chop.", "El break de batería: golpes cortos para cortar."),
   ("Queen", "We Will Rock You", "about 81", "Big gaps between the stomps.", "Mucho espacio entre los pisotones.")]),
 (13, "Phrasing: 8 bars, 16 bars", "Fraseo: 8 compases, 16",
  "A song with clear sections that change every 8 or 16 bars.", "Una canción con partes claras que cambian cada 8 o 16 compases.",
  ["bl", "nm"], [
   ("Earth, Wind & Fire", "September", "about 126", "Verses and chorus change on even 8-bar lines.", "Estrofas y coro cambian en grupos de 8 compases."),
   ("Chic", "Good Times", "about 110", "A steady groove that moves in 8-bar blocks.", "Un groove estable que avanza en bloques de 8.")]),
 (14, "An intro, a build, a drop", "Intro, subida, entrada",
  "Dance music with a clear intro and a big return of the beat.", "Música de baile con una intro clara y una gran vuelta del ritmo.",
  ["nm", "fl"], [
   ("Daft Punk", "One More Time (radio edit)", "about 123", "Famous for a long break and a big return.", "Famosa por un break largo y una gran vuelta."),
   ("Daft Punk", "Around the World", "about 121", "Parts drop out and come back. Good for filter practice.", "Partes que salen y vuelven. Buena para practicar el filtro.")]),
 (15, "Plan a 3-song set", "Planea un set de 3 canciones",
  "Three songs close in BPM that feel good together.", "Tres canciones de BPM cercano que suenen bien juntas.",
  ["bb", "bg", "rb"], [
   ("Bee Gees", "Stayin' Alive", "about 104", "Start here…", "Empieza aquí…"),
   ("Queen", "Another One Bites the Dust", "about 110", "…then a little faster…", "…luego un poco más rápido…"),
   ("Justin Timberlake", "Can't Stop the Feeling!", "about 113", "…and end bright.", "…y termina con brillo.")]),
 (16, "Perform the set", "Toca el set",
  "The three songs you planned. Each at least 2 minutes long.", "Las tres canciones que planeaste. Cada una de 2 minutos o más.",
  ["bl", "nm", "fl"], [
   ("Mark Ronson ft. Bruno Mars", "Uptown Funk (clean edit)", "about 115", "Start…", "Empieza…"),
   ("Daft Punk ft. Pharrell Williams", "Get Lucky (radio edit)", "about 116", "…blend…", "…mezcla…"),
   ("Michael Jackson", "Billie Jean", "about 117", "…and finish. Three songs, three BPM apart.", "…y termina. Tres canciones, 3 BPM de diferencia.")]),
 (17, "Record, save, hand it in", "Graba, guarda, entrega",
  "The same songs as your set. If you share the recording, use free-to-use music.", "Las mismas canciones del set. Si compartes la grabación, usa música libre.",
  ["pk", "sc", "pp"], [
   ("", "Starter crate tracks", "80 to 128", "We made them for this site. You may share mixes made with them.", "Las hicimos para este sitio. Puedes compartir mezclas hechas con ellas."),
   ("", "Free Music Archive, CC0 songs", "varies", "See Free and legal below. Give credit when the license asks.", "Mira Libre y legal abajo. Da crédito cuando la licencia lo pida.")]),
]

FREE = [
 ("ccMixter", "https://ccmixter.org/view/media/samples/acappellas", "Acapellas, beats and remixes shared for remixing.", "Acapellas, ritmos y remezclas para remezclar.",
  "Mostly CC BY or CC BY-NC. Name the artist; BY-NC means no selling.", "Casi todo CC BY o CC BY-NC. Nombra al artista; BY-NC quiere decir sin vender.", False),
 ("Looperman", "https://www.looperman.com/acapellas", "Loops and acapellas from musicians.", "Loops y acapellas de músicos.",
  "Loops are free to use. Each acapella has its own terms, set by the person who shared it.", "Los loops son de uso libre. Cada acapella tiene sus propias reglas, puestas por quien la subió.", False),
 ("Freesound", "https://freesound.org/", "Single sounds, voices and samples.", "Sonidos sueltos, voces y samples.",
  "Each sound has its own license. CC0 is free; CC BY needs credit.", "Cada sonido tiene su licencia. CC0 es libre; CC BY pide crédito.", False),
 ("Pixabay Music", "https://pixabay.com/music/", "Full songs in many styles.", "Canciones completas de muchos estilos.",
  "Free under the Pixabay Content License. Credit is not required.", "Gratis con la Licencia de Contenido de Pixabay. No hace falta dar crédito.", False),
 ("Free Music Archive", "https://freemusicarchive.org/", "Full songs. You can filter by license.", "Canciones completas. Puedes filtrar por licencia.",
  "Check each track's Creative Commons license. CC0 is free; CC BY needs credit.", "Revisa la licencia Creative Commons de cada pista. CC0 es libre; CC BY pide crédito.", False),
 ("Musopen", "https://musopen.org/music/", "Classical music recordings.", "Grabaciones de música clásica.",
  "Public-domain recordings. Free to use.", "Grabaciones de dominio público. Uso libre.", False),
 ("BBC Sound Effects", "https://sound-effects.bbcrewind.co.uk/", "Sound effects from the BBC.", "Efectos de sonido de la BBC.",
  "Free for personal, education and research use. Fine in class; do not post mixes with them publicly.", "Gratis para uso personal, educativo y de investigación. Bien en clase; no publiques mezclas con ellos.", False),
 ("Internet Archive: 78 RPM records", "https://archive.org/details/georgeblood", "Very old records: jazz, swing, blues, Latin.", "Discos muy antiguos: jazz, swing, blues, latino.",
  "Many are in the public domain in the U.S. Read each item's page first.", "Muchos son de dominio público en EE. UU. Lee primero la página de cada uno.", True),
 ("YouTube Audio Library", "https://studio.youtube.com/", "Free songs inside YouTube Studio (sign in, then Audio Library).", "Canciones gratis en YouTube Studio (entra y abre Audio Library).",
  "Free to use. Some songs ask for credit, and it says which.", "Uso libre. Algunas piden crédito, y allí dice cuáles.", True),
]

SETUP = [
 ("Pick the songs for the lessons you will teach. Use the list above.", "Elige las canciones de las lecciones que vas a dar. Usa la lista de arriba."),
 ("Get the files: buy them, or download free ones. Keep them in one folder.", "Consigue los archivos: cómpralos o baja los gratis. Guárdalos en una carpeta."),
 ("Check each song is the clean version. Listen all the way through once.", "Revisa que cada canción sea la versión limpia. Escúchala entera una vez."),
 ("On each device, open the Turntables and press Load the starter crate. Then tap Add songs for your own files.", "En cada aparato, abre los Tocadiscos y pulsa Cargar la caja inicial. Luego toca Agregar canciones para tus archivos."),
 ("The crate stays on that device only. Do this on every device students use.", "La caja se queda solo en ese aparato. Hazlo en cada aparato que usen."),
 ("Play one song and set a comfortable volume. Test headphones too.", "Toca una canción y ajusta un volumen cómodo. Prueba también los audífonos."),
 ("Keep a backup copy of the folder on a USB stick or in your drive.", "Guarda una copia de la carpeta en una memoria USB o en tu nube."),
]

def card(n, en, es, need_en, need_es, starters, picks):
    rows = []
    for a, t, b, we, ws in picks:
        who = f'<span class="art">{html.escape(a)}</span> · ' if a else ""
        bpm = sp(f"{b} BPM" if b[0].isdigit() or b.startswith("about") else b,
                 (f"{b.replace('about', 'unos').replace(' to ', ' a ')} BPM" if b[0].isdigit() or b.startswith("about") else "varía"))
        rows.append(f'<li><p class="song">{who}<b>{html.escape(t)}</b> <span class="bpm">{bpm}</span></p><p class="why">{sp(we, ws)}</p></li>')
    st = ", ".join(S[k] for k in starters)
    return f'''<article class="card" id="l{n}">
  <h3><span class="num">{n}</span> {sp(en, es)}</h3>
  <p class="need"><b>{sp("Needs:", "Necesita:")}</b> {sp(need_en, need_es)}</p>
  <p class="st"><b>{sp("From the starter crate:", "De la caja inicial:")}</b> {html.escape(st)}</p>
  <ul class="picks">{"".join(rows)}</ul>
  <p class="go no-print"><a href="music-decks.html?lesson={n}">{sp("Open this lesson on the turntables →", "Abrir esta lección en los tocadiscos →")}</a></p>
</article>'''

HEAD = open(os.path.join(HERE, "tracks_head.html"), encoding="utf-8").read()

body = f'''<div class="wrap">
<header class="mast ws-mast">
  <div class="k">{sp("Music · The Turntables · Track list", "Música · Los tocadiscos · Lista de canciones")}</div>
  <h1>{sp("Songs to gather before class", "Canciones para reunir antes de clase")}</h1>
  <p class="cdeck">{sp("For each lesson: what kind of song works, and a few songs that fit. Use clean versions only.", "Para cada lección: qué tipo de canción sirve y algunas que encajan. Usa solo versiones limpias.")}</p>
  <p class="hubline no-print"><a href="music-decks.html">{sp("← The Turntables", "← Los tocadiscos")}</a> · <a href="decks-lessons.html">{sp("Worksheets", "Hojas de trabajo")}</a> · <button type="button" class="linkbtn" onclick="window.print()">{sp("Print this list", "Imprimir esta lista")}</button></p>
</header>
</div>
<main class="wrap">
<section class="note">
  <h2>{sp("No time to gather songs?", "¿No hay tiempo para reunir canciones?")}</h2>
  <p>{sp("The turntables come with a Starter crate: eleven short tracks we made, from 80 to 128 BPM. Press Load the starter crate on the turntables. They work for every lesson.", "Los tocadiscos traen una Caja inicial: once pistas cortas que hicimos, de 80 a 128 BPM. Pulsa Cargar la caja inicial en los tocadiscos. Sirven para todas las lecciones.")}</p>
  <p class="small">{sp("BPM numbers below are about right. Recordings differ a little. The deck will measure the real tempo when you load a song.", "Los BPM de abajo son aproximados. Las grabaciones varían un poco. El plato mide el tempo real cuando cargas la canción.")}</p>
</section>
<h2 class="sec">{sp("The 17 lessons", "Las 17 lecciones")}</h2>
<div class="cards">
{chr(10).join(card(*L) for L in LESSONS)}
</div>
<h2 class="sec" id="free">{sp("Free and legal", "Libre y legal")}</h2>
<p class="secline">{sp("The same free sites the turntables list. Each one says how you may use its music. Check before you share a mix.", "Los mismos sitios gratis que muestran los tocadiscos. Cada uno dice cómo puedes usar su música. Revisa antes de compartir una mezcla.")}</p>
<div class="cards">
{chr(10).join(f'<article class="card"><h3><a href="{u}" target="_blank" rel="noopener noreferrer">{html.escape(n)}</a>{(" " + sp("Extra", "Extra", cls="tag")) if x else ""}</h3><p>{sp(a, b)}</p><p class="lic"><b>{sp("License:", "Licencia:")}</b> {sp(c, d)}</p></article>' for n, u, a, b, c, d, x in FREE)}
</div>
<h2 class="sec" id="setup">{sp("How to set up before class", "Cómo preparar antes de clase")}</h2>
<ol class="check card">
{chr(10).join(f'<li>{sp(a, b)}</li>' for a, b in SETUP)}
</ol>
</main>
<footer class="foot wrap no-print">
  <p><b>Architecture of Grace · Music · The Turntables.</b> {sp("This page lists song names only. It plays no music.", "Esta página solo da nombres de canciones. No toca música.")}</p>
  <p class="foot-home"><a href="/">Architecture of Grace</a></p>
</footer>
</body>
</html>
'''
open(OUT, "w", encoding="utf-8").write(HEAD + body)
print("wrote", OUT)
