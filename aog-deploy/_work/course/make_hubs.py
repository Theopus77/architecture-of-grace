#!/usr/bin/env python3
"""
AOG-DOORS-V2 (2026-09-27) — the six course doors, one design.
  Jimmy on bible-hub: "The actual room is pretty meh, blah … we are the 1%."

  python3 _work/course/make_hubs.py doors    → bible-hub, hebrew-bible-hub, quran-hub, talmud-hub,
                                               religions-hub and economics-hub (all six, one layout)
  python3 _work/course/make_hubs.py check    → every link on the doors resolves (file or _redirects)

(`hubs` and `k8`, the V1 commands, now both rebuild all six doors. Name ids or files after the verb
 to build only those: `make_hubs.py doors chn`.)

Each door: a hero with three of the course's own unit banners, "Course contents" and "Start at
the beginning"; one grade band at a time from a drop-down (#k-2 … on the link, last choice
remembered per course); unit cards with their banner, chapters and lesson count; Practice every
day (Daily Drafts by grade); More to explore (each place once); the Resource library; a teacher
fold. Banners and lesson counts are read from <course>-course.html, so re-run this after
rebuilding a course.
"""
import re, sys, html, importlib, os
from pathlib import Path
HERE = Path(__file__).resolve().parent
DEPLOY = HERE.parent.parent
E = lambda s: html.escape(s, quote=True)
BAND_ES = {"k-2": "Grados K–2", "3-5": "Grados 3–5", "6-8": "Grados 6–8", "9-10": "Grados 9–10", "11-12": "Grados 11–12"}
BAND_SHORT = {"k-2": "K–2", "3-5": "3–5", "6-8": "6–8", "9-10": "9–10", "11-12": "11–12"}

# ── link resolution against the files and _redirects ─────────────────────────
def _rules():
    out = []
    for line in (DEPLOY / "_redirects").read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"): continue
        parts = line.split()
        if len(parts) >= 2: out.append((parts[0], parts[1]))
    return out
RULES = _rules()

def _file_ok(target):
    t = target.split("#")[0].split("?")[0]
    if t.startswith("http"): return True
    t = t.lstrip("/")
    if t == "": return (DEPLOY / "index.html").exists()
    return (DEPLOY / t).exists() or (DEPLOY / (t + ".html")).exists() or (DEPLOY / t / "index.html").exists()

def resolves(href):
    if href.startswith(("http://", "https://", "mailto:", "#")): return True
    path = href.split("#")[0].split("?")[0]
    if not path: return True
    if _file_ok(path): return True
    segs = path.strip("/").split("/")
    for frm, to in RULES:
        fs = frm.strip("/").split("/")
        if fs and fs[-1] == "*":
            if segs[:len(fs) - 1] == fs[:-1] and _file_ok(to.replace(":splat", "/".join(segs[len(fs) - 1:]))): return True
            continue
        if len(fs) != len(segs): continue
        if all(f == s or f.startswith(":") for f, s in zip(fs, segs)):
            if _file_ok(to): return True
    return False

def load(cid):
    d = str(HERE.parent / cid)
    for m in ("outline",): sys.modules.pop(m, None)
    sys.path.insert(0, d)
    try:
        o = importlib.import_module("outline")
    finally:
        sys.path.remove(d)
    sys.modules.pop("outline", None)
    return o

# ── AOG-DOORS-V2 (2026-09-27) — Jimmy on bible-hub: "The actual room is pretty meh, blah …
#    we are the 1%." One design for all six course doors: a hero with the course's own
#    drawn scenes, one grade band at a time (a drop-down), unit cards with their banner,
#    a Practice-every-day panel, More to explore (each place once), the Resource library,
#    and a teacher fold. ──────────────────────────────────────────────────────────────

ALL_BANDS = ["k-2", "3-5", "6-8", "9-10", "11-12"]
BAND_EN = {b: "Grades " + BAND_SHORT[b] for b in ALL_BANDS}
GRADE_OF_BAND = {"k-2": "K", "3-5": "3", "6-8": "6", "9-10": "9-10", "11-12": "11-12"}
GRADES = [("K", "Kindergarten", "Kínder")] + [(str(g), "Grade %d" % g, "Grado %d" % g) for g in range(1, 9)] + [
    ("9-10", "Grades 9–10", "Grados 9–10"), ("11-12", "Grades 11–12", "Grados 11–12"), ("adult", "Adult", "Adulto")]

COURSES = [
    dict(cid="bib", file="bible-hub.html", slug="bible", name=("The Bible", "La Biblia"), contents="bible-course",
         drops="bible", res="bible", kicker=("A course of study · K–12", "Un curso de estudio · K–12"),
         lede=("The Bible as literature and history, from kindergarten to grade 12. We study it; we never preach it.",
               "La Biblia como literatura e historia, de kínder a 12.º grado. La estudiamos; nunca la predicamos."),
         daily=("Ten short lines a day: a reading, key words and quick questions from the Bible.",
                "Diez líneas cortas al día: una lectura, palabras clave y preguntas rápidas de la Biblia."),
         sources=("Quotations come from public-domain translations, or are retold in plain words. A belief is always named as someone’s belief: “Christians believe…”, “Jewish tradition reads…”. Everything else is original text written for this course.",
                  "Las citas vienen de traducciones de dominio público, o se cuentan con palabras sencillas. Una creencia siempre se presenta como de alguien: “Los cristianos creen…”, “La tradición judía lee…”. Todo lo demás es texto original escrito para este curso.")),
    dict(cid="heb", file="hebrew-bible-hub.html", slug="hebrew-bible", name=("The Hebrew Bible", "La Biblia Hebrea"), contents="hebrew-bible-course",
         drops="bible", res="hebrew-bible", kicker=("A course of study · K–12", "Un curso de estudio · K–12"),
         lede=("The Tanakh, the Hebrew Bible, as literature and history, K–12. We study it; we never preach it.",
               "El Tanaj, la Biblia Hebrea, como literatura e historia, K–12. La estudiamos; nunca la predicamos."),
         daily=("Ten short lines a day: a reading, key words and quick questions from the Bible.",
                "Diez líneas cortas al día: una lectura, palabras clave y preguntas rápidas de la Biblia."),
         sources=("Quotations come from the public-domain JPS 1917 translation, or are retold in plain words. A belief is always named as someone’s belief: “Jewish tradition teaches…”. Everything else is original text written for this course.",
                  "Las citas vienen de la traducción JPS de 1917, de dominio público, o se cuentan con palabras sencillas. Una creencia siempre se presenta como de alguien: “La tradición judía enseña…”. Todo lo demás es texto original escrito para este curso.")),
    dict(cid="qur", file="quran-hub.html", slug="quran", name=("The Qur’an", "El Corán"), contents="quran-course",
         drops="quran", res="quran", kicker=("A course of study · K–12", "Un curso de estudio · K–12"),
         lede=("The Qur’an as a text people read, recite and study, K–12. We study it; we never preach it.",
               "El Corán como un texto que la gente lee, recita y estudia, K–12. Lo estudiamos; nunca lo predicamos."),
         daily=("Ten short lines a day: a reading, key words and quick questions about the Qur’an.",
                "Diez líneas cortas al día: una lectura, palabras clave y preguntas rápidas sobre el Corán."),
         sources=("Verses come from public-domain translations, or are retold in plain words. A belief is always named as someone’s belief: “Muslims believe…”. Everything else is original text written for this course.",
                  "Los versículos vienen de traducciones de dominio público, o se cuentan con palabras sencillas. Una creencia siempre se presenta como de alguien: “Los musulmanes creen…”. Todo lo demás es texto original escrito para este curso.")),
    dict(cid="tal", file="talmud-hub.html", slug="talmud", name=("Talmud Study", "Estudio del Talmud"), contents="talmud-course",
         drops="talmud", res="talmud", kicker=("A course of study · K–12", "Un curso de estudio · K–12"),
         lede=("How the Talmud asks questions and argues with care, K–12. We study it; we never preach it.",
               "Cómo el Talmud hace preguntas y discute con cuidado, K–12. Lo estudiamos; nunca lo predicamos."),
         daily=("Ten short lines a day: a reading, key words and quick questions about the Talmud.",
                "Diez líneas cortas al día: una lectura, palabras clave y preguntas rápidas sobre el Talmud."),
         sources=("Passages come from public-domain translations, or are retold in plain words. A belief is always named as someone’s belief: “Rabbinic tradition holds…”. Everything else is original text written for this course.",
                  "Los pasajes vienen de traducciones de dominio público, o se cuentan con palabras sencillas. Una creencia siempre se presenta como de alguien: “La tradición rabínica sostiene…”. Todo lo demás es texto original escrito para este curso.")),
    dict(cid="rel", file="religions-hub.html", slug="religions", name=("World Religions", "Religiones del mundo"), contents="religions-course",
         drops="religion", res="religions", kicker=("A course of study · K–12", "Un curso de estudio · K–12"),
         lede=("The world’s great traditions, each in its own words, K–12. We study them; we never preach them.",
               "Las grandes tradiciones del mundo, cada una con sus propias palabras, K–12. Las estudiamos; nunca las predicamos."),
         daily=("Ten short lines a day: key words, beliefs and practices.",
                "Diez líneas cortas al día: palabras clave, creencias y prácticas."),
         sources=("Each tradition is taught from its own texts, in public-domain translations. A belief is always named as someone’s belief: “Muslims believe…”, “the Torah teaches…”. Traditions are never ranked.",
                  "Cada tradición se enseña desde sus propios textos, en traducciones de dominio público. Una creencia siempre se presenta como de alguien: “Los musulmanes creen…”, “la Torá enseña…”. Las tradiciones nunca se clasifican como mejores o peores."),
         hints={"k-2": ("Families, special days, stories people keep, and being kind.", "Familias, días especiales, historias que la gente guarda y la bondad."),
                "3-5": ("What a religion is, and the traditions our neighbors follow.", "Qué es una religión y las tradiciones de nuestros vecinos."),
                "6-8": ("Study religions like a historian: sources, places and change over time.", "Estudia las religiones como un historiador: fuentes, lugares y cambios en el tiempo."),
                "9-10": ("How to read a sacred text, then the traditions in their own words.", "Cómo leer un texto sagrado, y luego las tradiciones con sus propias palabras."),
                "11-12": ("Compare the traditions, ask one big question of each, and finish with a capstone.", "Compara las tradiciones, haz una gran pregunta a cada una y termina con un proyecto final.")}),
    dict(cid="eco", file="economics-hub.html", slug="economics", name=("Economics", "Economía"), contents="economics-course",
         drops="economics", res="economics", kicker=("A course of study · K–12", "Un curso de estudio · K–12"),
         lede=("How people, families and nations choose what to make, buy and save, K–12.",
               "Cómo las personas, las familias y los países deciden qué hacer, comprar y ahorrar, K–12."),
         daily=("Ten short lines a day: key words, money math and choices.",
                "Diez líneas cortas al día: palabras clave, cuentas de dinero y decisiones."),
         sources=("Examples and numbers are written for this course. Where economists disagree, the lesson says so and gives both sides.",
                  "Los ejemplos y los números están escritos para este curso. Cuando los economistas no están de acuerdo, la lección lo dice y da los dos lados."),
         hints={"k-2": ("Wants and needs, saving and spending, and the people who make things.", "Deseos y necesidades, ahorrar y gastar, y la gente que hace las cosas."),
                "3-5": ("Choices, prices, trade and how a community pays for what it shares.", "Decisiones, precios, comercio y cómo una comunidad paga lo que comparte."),
                "6-8": ("Think like an economist: markets, your own money, and the world.", "Piensa como economista: mercados, tu dinero y el mundo."),
                "9-10": ("Choices, markets and firms: how prices are set.", "Decisiones, mercados y empresas: cómo se fijan los precios."),
                "11-12": ("The whole economy: jobs, money, the Fed and world trade.", "La economía entera: empleos, dinero, la Reserva Federal y el comercio mundial.")}),
    # AOG-TEXTS-V1 — TEXTS_PLAN decision 4 (approved 2026-09-27). Run `doors` only after the three
    # *-course.html pages exist (the door reads its banners and lesson counts from them).
    dict(cid="hin", file="hindu-texts-hub.html", slug="hindu-texts", name=("Hindu Texts", "Textos hindúes"), contents="hindu-texts-course",
         drops="hindu", res="religions", kicker=("A course of study · K–12", "Un curso de estudio · K–12"),
         lede=("The Vedas, the Upanishads, the great epics and the Gita, K–12. We study them; we never preach them.",
               "Los Vedas, los Upanishads, las grandes epopeyas y el Gita, K–12. Los estudiamos; nunca los predicamos."),
         daily=("Ten short lines a day: a reading, key words and quick questions from the Hindu texts.",
                "Diez líneas cortas al día: una lectura, palabras clave y preguntas rápidas de los textos hindúes."),
         sources=("Quotations come from public-domain translations, or are retold in plain words. A belief is always named as someone’s belief: “Hindus believe…”. Everything else is original text written for this course.",
                  "Las citas vienen de traducciones de dominio público, o se cuentan con palabras sencillas. Una creencia siempre se presenta como de alguien: “Los hindúes creen…”. Todo lo demás es texto original escrito para este curso.")),
    dict(cid="bud", file="buddhist-texts-hub.html", slug="buddhist-texts", name=("Buddhist Texts", "Textos budistas"), contents="buddhist-texts-course",
         drops="buddhist", res="religions", kicker=("A course of study · K–12", "Un curso de estudio · K–12"),
         lede=("The Buddha’s life, the Dhammapada and the sutras, K–12. We study them; we never preach them.",
               "La vida del Buda, el Dhammapada y los sutras, K–12. Los estudiamos; nunca los predicamos."),
         daily=("Ten short lines a day: a reading, key words and quick questions from the Buddhist texts.",
                "Diez líneas cortas al día: una lectura, palabras clave y preguntas rápidas de los textos budistas."),
         sources=("Quotations come from public-domain translations, or are retold in plain words. A belief is always named as someone’s belief: “Buddhists believe…”. Everything else is original text written for this course.",
                  "Las citas vienen de traducciones de dominio público, o se cuentan con palabras sencillas. Una creencia siempre se presenta como de alguien: “Los budistas creen…”. Todo lo demás es texto original escrito para este curso.")),
    dict(cid="chn", file="chinese-classics-hub.html", slug="chinese-classics", name=("Chinese Classics", "Clásicos chinos"), contents="chinese-classics-course",
         drops="chinese", res="religions", kicker=("A course of study · K–12", "Un curso de estudio · K–12"),
         lede=("The Analects, the Daodejing and the thinkers who answered them, K–12. We study them; we never preach them.",
               "Las Analectas, el Daodejing y los pensadores que les respondieron, K–12. Los estudiamos; nunca los predicamos."),
         daily=("Ten short lines a day: a reading, key words and quick questions from the Chinese classics.",
                "Diez líneas cortas al día: una lectura, palabras clave y preguntas rápidas de los clásicos chinos."),
         sources=("Quotations come from public-domain translations, or are retold in plain words. A teaching is always named as someone’s: “Confucius taught…”. Everything else is original text written for this course.",
                  "Las citas vienen de traducciones de dominio público, o se cuentan con palabras sencillas. Una enseñanza siempre se presenta como de alguien: “Confucio enseñaba…”. Todo lo demás es texto original escrito para este curso.")),
    # AOG-WCS-MED-V1 (2026-09-27) — two new courses. Run `doors wcs` / `doors med` after each *-course.html exists.
    dict(cid="wcs", file="world-cultures-hub.html", slug="world-cultures", name=("World Cultures and Societies", "Culturas y sociedades del mundo"), contents="world-cultures-course",
         drops="cultures", res="social-studies", kicker=("A course of study · K–12", "Un curso de estudio · K–12"),
         lede=("How people live together around the world: families, customs, social class and political ideas from left to right, K–12.",
               "Cómo vive la gente en el mundo: familias, costumbres, clases sociales e ideas políticas de izquierda a derecha, K–12."),
         daily=("Ten short lines a day: key words, places, people and ideas.",
                "Diez líneas cortas al día: palabras clave, lugares, personas e ideas."),
         sources=("Every idea is described with what its supporters and its critics say. The course never tells you which side to take. Everything is original text written for this course.",
                  "Cada idea se describe con lo que dicen sus partidarios y sus críticos. El curso nunca te dice qué lado elegir. Todo es texto original escrito para este curso.")),
    dict(cid="med", file="medicine-health-hub.html", slug="medicine-health", name=("Medicine and Health", "Medicina y salud"), contents="medicine-health-course",
         drops="health", res="science", kicker=("A course of study · K–12", "Un curso de estudio · K–12"),
         lede=("Healthy habits, the body, and how people have cared for the sick, West and East, K–12.",
               "Hábitos sanos, el cuerpo y cómo la gente ha cuidado a los enfermos, en Occidente y Oriente, K–12."),
         daily=("Ten short lines a day: the body, staying well and the history of medicine.",
                "Diez líneas cortas al día: el cuerpo, estar sano y la historia de la medicina."),
         sources=("Traditions are described with respect, and the course says plainly what the evidence shows. It is for learning, not medical advice: ask a doctor or nurse about your own health.",
                  "Las tradiciones se describen con respeto, y el curso dice con claridad lo que muestra la evidencia. Es para aprender, no es consejo médico: pregunta a un médico o enfermera sobre tu salud.")),
    # AOG-SPT-MAR-V1 (2026-09-30) — the two history books. Run `doors spt` / `doors mar` after each *-course.html exists.
    dict(cid="spt", cards="ss", file="sports-hub.html", slug="sports", name=("Sports History", "Historia del deporte"), contents="sports-course",
         drops="sports", res="social-studies", kicker=("A course of study · K–12", "Un curso de estudio · K–12"),
         lede=("Explore how games got their fields, rules and leagues, and who got to play. Grades K–12.",
               "Explora cómo los juegos recibieron sus campos, reglas y ligas, y quién pudo jugar. Grados K–12."),
         daily=("Ten short lines a day: key words, places, people and dates from sports history.",
                "Diez líneas cortas al día: palabras clave, lugares, personas y fechas de la historia del deporte."),
         sources=("Every fact is checked against records, rulebooks and newspapers of the time. No play, drill or technique is taught. Everything is original text written for this course.",
                  "Cada dato se comprueba con registros, reglamentos y periódicos de la época. No se enseña ninguna jugada ni técnica. Todo es texto original escrito para este curso.")),
    dict(cid="mar", cards="ss", file="martial-arts-hub.html", slug="martial-arts", name=("The Measured Step", "El paso medido"), contents="martial-arts-course",
         drops="martial", res="social-studies", kicker=("A course of study · K–12", "Un curso de estudio · K–12"),
         lede=("Explore the story of the martial arts: the rooms, the codes, the schools and who got to join. Grades K–12.",
               "Explora la historia de las artes marciales: los espacios, los códigos, las escuelas y quién pudo entrar. Grados K–12."),
         daily=("Ten short lines a day: key words, places, people and dates from martial arts history.",
                "Diez líneas cortas al día: palabras clave, lugares, personas y fechas de la historia de las artes marciales."),
         sources=("No strike, hold or throw is taught or shown. Bowing and meditation are described, never led. Stories about where an art began are named as stories. Everything is original text written for this course.",
                  "No se enseña ni se muestra ningún golpe, llave ni lanzamiento. El saludo y la meditación se describen, nunca se dirigen. Las historias sobre el origen de un arte se presentan como historias. Todo es texto original escrito para este curso.")),
    # AOG-UNR-V1 (2026-09-30) — The Unseen Realm (Michael Heiser). Run `doors unr` after unseen-realm-course.html exists.
    dict(cid="unr", file="unseen-realm-hub.html", slug="unseen-realm", name=("The Unseen Realm", "El reino invisible"), contents="unseen-realm-course",
         drops="unseen", res="religions", kicker=("A course of study · K–12", "Un curso de estudio · K–12"),
         lede=("Enoch, the Watchers, angels, demons and the mission of Jesus, read from the ancient documents with the scholars who study them, K–12.",
               "Enoc, los Vigilantes, ángeles, demonios y la misión de Jesús, leídos en los documentos antiguos con los estudiosos que los estudian, K–12."),
         daily=("Ten short lines a day: key words, passages and quick questions from the course.",
                "Diez líneas cortas al día: palabras clave, pasajes y preguntas rápidas del curso."),
         sources=("Every lesson starts from an ancient text: the Bible, 1 Enoch, Jubilees, the Dead Sea Scrolls and others, quoted from public-domain translations or retold. Scholars’ ideas, Michael Heiser’s and others’, are told in our own words and named as theirs. Everything else is original text written for this course.",
                  "Cada lección empieza con un texto antiguo: la Biblia, 1 Enoc, Jubileos, los Rollos del Mar Muerto y otros, citados de traducciones de dominio público o contados de nuevo. Las ideas de los estudiosos, de Michael Heiser y de otros, se cuentan con nuestras palabras y se presentan como suyas. Todo lo demás es texto original escrito para este curso.")),
]

# More to explore: every place a band links to, named once, with one plain line.
C_, R_ = ("Course", "Curso"), ("Practice room", "Sala de práctica")
EXPLORE = {
    "/bible": (C_, "The Bible", "La Biblia", "The Bible as literature and history, K–12.", "La Biblia como literatura e historia, K–12."),
    "/bible-course": (C_, "The Bible", "La Biblia", "The Bible as literature and history, K–12.", "La Biblia como literatura e historia, K–12."),
    "/hebrew-bible": (C_, "The Hebrew Bible", "La Biblia Hebrea", "The Tanakh as literature and history, K–12.", "El Tanaj como literatura e historia, K–12."),
    "/quran": (C_, "The Qur’an", "El Corán", "How the Qur’an is read, recited and studied, K–12.", "Cómo se lee, se recita y se estudia el Corán, K–12."),
    "/talmud": (C_, "Talmud Study", "Estudio del Talmud", "How the Talmud asks and answers, K–12.", "Cómo pregunta y responde el Talmud, K–12."),
    "/religions-course": (C_, "World Religions", "Religiones del mundo", "The great traditions in their own words, K–12.", "Las grandes tradiciones con sus propias palabras, K–12."),
    "/r1": (R_, "How to read a sacred text", "Cómo leer un texto sagrado", "Who wrote it, for whom and why. Cards, hints and a quiz.", "Quién lo escribió, para quién y por qué. Tarjetas, pistas y un quiz."),
    "/r2": (R_, "The Hebrew Bible", "La Biblia hebrea", "Creation, covenant, law, prophets and psalms.", "Creación, alianza, ley, profetas y salmos."),
    "/r3": (R_, "The New Testament", "El Nuevo Testamento", "The Gospels, the parables and Paul’s letters.", "Los Evangelios, las parábolas y las cartas de Pablo."),
    "/r4": (R_, "Judaism", "Judaísmo", "The Sabbath, the calendar and the Talmud.", "El sabbat, el calendario y el Talmud."),
    "/r5": (R_, "Islam", "Islam", "The Prophet, the Five Pillars and the Hadith.", "El Profeta, los Cinco Pilares y el Hadiz."),
    "/r6": (R_, "Hinduism", "Hinduismo", "Dharma, karma and Arjuna’s question in the Gita.", "Dharma, karma y la pregunta de Arjuna en el Gita."),
    "/r7": (R_, "Buddhism", "Budismo", "The Four Noble Truths and the Eightfold Path.", "Las Cuatro Nobles Verdades y el Óctuple Sendero."),
    "/r8": (R_, "Confucianism and Daoism", "Confucianismo y taoísmo", "The Analects and the Daodejing.", "Las Analectas y el Daodejing."),
    "/r9": (R_, "Sikhism, Jainism, Africa and the Americas", "Sijismo, jainismo, África y las Américas", "The Guru Granth Sahib, ahimsa and oral traditions.", "El Guru Granth Sahib, ahimsa y las tradiciones orales."),
    "/r10": (R_, "Religion and the world", "La religión y el mundo", "Law, art, science, charity, conflict and peace.", "Ley, arte, ciencia, caridad, conflicto y paz."),
    "/r11": (R_, "One question, many lenses", "Una pregunta, muchas lentes", "Each tradition answers the same big question.", "Cada tradición responde la misma gran pregunta."),
    "/r12": (R_, "Capstone: the sources speak", "Proyecto final: hablan las fuentes", "Ask a question. Answer it from three traditions’ texts.", "Haz una pregunta. Respóndela con los textos de tres tradiciones."),
    "/ec1": (R_, "Scarcity, choice and opportunity cost", "Escasez, decisión y costo de oportunidad", "Why every choice gives something up.", "Por qué cada decisión deja algo atrás."),
    "/ec2": (R_, "Supply, demand and the market", "Oferta, demanda y el mercado", "How buyers and sellers settle on a price.", "Cómo compradores y vendedores llegan a un precio."),
    "/ec3": (R_, "Prices, controls and market failure", "Precios, controles y fallas del mercado", "Price limits, taxes, and when markets fall short.", "Límites de precio, impuestos y cuándo fallan los mercados."),
    "/ec4": (R_, "Competition and firms", "Competencia y empresas", "How many sellers, and how hard it is to join them.", "Cuántos vendedores hay y qué tan difícil es sumarse."),
    "/ec5": (R_, "Measuring the economy", "Medir la economía", "GDP, prices and jobs: what the numbers mean.", "PIB, precios y empleos: qué significan los números."),
    "/ec6": (R_, "The business cycle", "El ciclo económico", "Good times, hard times, and what government does.", "Tiempos buenos, tiempos difíciles y lo que hace el gobierno."),
    "/ec7": (R_, "Money, banks and the Fed", "Dinero, bancos y la Reserva Federal", "What money is, how banks lend, and the Fed’s tools.", "Qué es el dinero, cómo prestan los bancos y las herramientas de la Reserva Federal."),
    "/ec8": (R_, "Trade, taxes and the world", "Comercio, impuestos y el mundo", "Why countries trade, and how taxes work.", "Por qué comercian los países y cómo funcionan los impuestos."),
    "/sports-course": (C_, "Sports History", "Historia del deporte", "How games got their fields, rules and leagues, K–12.", "Cómo los juegos recibieron sus campos, reglas y ligas, K–12."),
    "/martial-arts-course": (C_, "The Measured Step", "El paso medido", "Martial arts history: rooms, codes and schools, K–12.", "Historia de las artes marciales: espacios, códigos y escuelas, K–12."),
    "/social": (C_, "Social Studies", "Estudios Sociales", "History, civics, geography and economics, every band.", "Historia, civismo, geografía y economía, cada banda."),
    "/world-cultures": (C_, "World Cultures", "Culturas del mundo", "How people live together around the world, K–12.", "Cómo vive la gente en el mundo, K–12."),
    "/us-history": (C_, "U.S. History 6–8", "Historia de EE. UU. 6–8", "The story of the United States, as a full course.", "La historia de Estados Unidos, como un curso completo."),
    "/s24": (("Social Studies", "Estudios Sociales"), "Economics in Social Studies", "Economía en Estudios Sociales", "The economics room in the Social Studies hub.", "La sala de economía en Estudios Sociales."),
}
# the rooms the old religions and economics doors listed on each band (kept, so no door is lost)
LEGACY_ROOMS = {
    "rel": {"3-5": ["/r1", "/r6", "/r7", "/r10"], "6-8": ["/r1", "/r5", "/r6", "/r8", "/r9", "/r10"],
            "9-10": ["/r1", "/r2", "/r3", "/r4", "/r5", "/r6"], "11-12": ["/r7", "/r8", "/r9", "/r10", "/r11", "/r12"],
            "k-2": ["/bible", "/quran", "/talmud", "/hebrew-bible"]},
    "eco": {"3-5": ["/ec1", "/ec2", "/ec8"], "6-8": ["/s24", "/ec1", "/ec2", "/ec4", "/ec7", "/ec5", "/ec8"],
            "9-10": ["/ec1", "/ec2", "/ec3", "/ec4"], "11-12": ["/ec5", "/ec6", "/ec7", "/ec8"]},
}

def teach_text(cid):
    """the course's own 'for the teacher' paragraph, from its build script"""
    import ast
    t = ast.parse((HERE.parent / cid / ("build_%s.py" % cid)).read_text(encoding="utf-8"))
    for n in ast.walk(t):
        if isinstance(n, ast.keyword) and n.arg == "teach":
            return ast.literal_eval(n.value)
        if isinstance(n, ast.Dict):
            for k, v in zip(n.keys, n.values):
                if isinstance(k, ast.Constant) and k.value == "teach": return ast.literal_eval(v)
    return None

def course_art(contents):
    """{unit n: (banner svg, lesson count)} from the course contents page"""
    s = (DEPLOY / (contents + ".html")).read_text(encoding="utf-8")
    parts = re.split(r'(?=<section class="unit-spread" id="u\d+")', s)
    out = {}
    for p in parts[1:]:
        n = int(re.match(r'<section class="unit-spread" id="u(\d+)"', p).group(1))
        m = (re.search(r'<div class="scene" aria-hidden="true">(<svg.*?</svg>)</div>', p, re.S)
             or re.search(r'<div class="scene" aria-hidden="true" data-aog-render="[^"]*"[^>]*>(<picture.*?</picture>)', p, re.S))   # AOG-PENCIL-DOORS: a drawn picture
        body = p.split("</section>", 1)[0] if "</section>" in p else p
        out[n] = (m.group(1) if m else "", body.count('class="lrow"'))
    return out

def svg_scoped(svg, pre, cls=""):
    """a banner, re-id'd so the same scene can sit twice on one page, and silent to screen readers"""
    if svg.startswith("<picture"):   # a pencil drawing: silent, lazy, filling its tile
        return re.sub(r'\salt="[^"]*"', ' alt=""', svg).replace("<img ", '<img aria-hidden="true" class="%s" style="width:100%%;height:100%%;object-fit:cover;object-position:75%% 40%%" ' % cls, 1)
    ids = re.findall(r'\sid="([^"]+)"', svg)
    for i in sorted(set(ids), key=len, reverse=True):
        svg = svg.replace('id="%s"' % i, 'id="%s-%s"' % (pre, i)).replace("url(#%s)" % i, "url(#%s-%s)" % (pre, i)).replace('href="#%s"' % i, 'href="#%s-%s"' % (pre, i))
    svg = re.sub(r'\s(role|aria-label)="[^"]*"', "", svg, count=2)
    return svg.replace("<svg ", '<svg aria-hidden="true" class="%s" ' % cls, 1)

def sp(en, es, tag="span", cls="", extra=""):
    c = ' class="%s"' % cls if cls else ""
    return '<%s%s%s data-en="%s" data-es="%s">%s</%s>' % (tag, c, extra, E(en), E(es), E(en), tag)

ARROW = '<svg class="dr-ar" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
ICO_BOARD = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><rect x="2.5" y="3.5" width="15" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 13.5v3M6.5 16.5h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'

def unit_card_ss(h, u):
    """AOG-SS-CARDS-V1 (2026-09-30) — Jimmy: the two history books' cards match social-studies-hub
    exactly: the same .unit.open.course markup, so aog-sketch.js adds the unit's pencil drawing,
    aog-grace.js the striped number and the chevron that opens the description."""
    n = u["n"]; en, es = h["name"]; t = u["title"]
    d = "; ".join(c["title"] for c in u["chapters"]) + "."
    return (f'<div class="unit open course"><div class="un" aria-hidden="true">{n}</div>'
            f'<div class="t" data-en="{E(t)}" data-es="{E(t)}">{E(t)}</div><div class="yrs">{E(u["strand"])}</div>'
            f'<div class="d" data-en="{E(d)}" data-es="{E(d)}">{E(d)}</div>'
            f'<div class="doors"><a class="door" href="/{h["cid"]}{n}" data-en="Open the unit" data-es="Abrir la unidad">Open the unit</a>'
            f'<button class="beam no-print" type="button" data-beam="/{h["cid"]}{n}" data-name="{E(en)} · Unit {n} · {E(t)}" data-name-es="{E(es)} · Unidad {n} · {E(t)}" data-en="Show on the board" data-es="Mostrar en la pizarra">Show on the board</button></div></div>')

def unit_card(h, u, art):
    if h.get("cards") == "ss": return unit_card_ss(h, u)
    n = u["n"]; en, es = h["name"]; svg, nl = art.get(u["n"], ("", 0))
    nch = len(u["chapters"]); t = u["title"]
    chs = "".join("<li>%s</li>" % E(c["title"]) for c in u["chapters"])
    meta_en = "%d chapter%s · %d lessons" % (nch, "" if nch == 1 else "s", nl)
    meta_es = "%d capítulo%s · %d lecciones" % (nch, "" if nch == 1 else "s", nl)
    return f'''<article class="dr-card" aria-labelledby="ut{n}">
  <div class="dr-art">{svg_scoped(svg, "c%d" % n) if svg else ""}<span class="dr-num">{sp("Unit %d" % n, "Unidad %d" % n)}</span></div>
  <div class="dr-cbody">
    <p class="dr-strand">{E(u["strand"])}</p>
    <h3 id="ut{n}">{E(t)}</h3>
    <ol class="dr-chs">{chs}</ol>
    <p class="dr-meta">{sp(meta_en, meta_es)}</p>
    <div class="dr-acts">
      <a class="dr-open" href="/{h["cid"]}{n}" aria-describedby="ut{n}"><span data-en="Open the unit" data-es="Abrir la unidad">Open the unit</span>{ARROW}</a>
      <button class="dr-beam no-print" type="button" data-beam="/{h["cid"]}{n}" data-name="{E(en)} · Unit {n} · {E(t)}" data-name-es="{E(es)} · Unidad {n} · {E(t)}">{ICO_BOARD}<span data-en="Show on the board" data-es="Mostrar en la pizarra">Show on the board</span></button>
    </div>
  </div>
</article>'''

def explore_links(h, o, b):
    seen, out = {"/" + h["slug"], "/" + h["contents"]}, []
    cand = [href for u in o.UNITS if u["band"] == b for href, _ in o.LINKS.get(u["n"], [])]
    cand += LEGACY_ROOMS.get(h["cid"], {}).get(b, [])
    for href in cand:
        if href.startswith("/drops/") or href in seen or href not in EXPLORE or not resolves(href): continue
        seen.add(href); out.append(href)
    return out

def explore_card(href):
    kind, ten, tes, len_, les = EXPLORE[href]
    return (f'<a class="dr-ex" href="{E(href)}">{sp(kind[0], kind[1], cls="dr-exk")}'
            f'{sp(ten, tes, "b", "dr-ext")}{sp(len_, les, cls="dr-exd")}{ARROW}</a>')

def band_section(h, o, b, art):
    bu = [u for u in o.UNITS if u["band"] == b]
    nch = sum(len(u["chapters"]) for u in bu); nl = sum(art.get(u["n"], ("", 0))[1] for u in bu)
    hint = h.get("hints", {}).get(b)
    ex = explore_links(h, o, b)
    out = [f'<section class="band dr-band" id="{b}" aria-labelledby="h-{b}">',
           f'<div class="dr-bhead" id="course-{b}"><div>',
           f'<h2 id="h-{b}" data-en="{BAND_EN[b]}" data-es="{BAND_ES[b]}">{BAND_EN[b]}</h2>']
    if hint: out.append(sp(hint[0], hint[1], "p", "dr-hint"))
    out.append(sp("%d units · %d chapters · %d lessons" % (len(bu), nch, nl), "%d unidades · %d capítulos · %d lecciones" % (len(bu), nch, nl), "p", "dr-stats"))
    out.append(f'</div><a class="dr-sec" href="/{h["contents"]}#band-{b}">{sp("All lessons in this band", "Todas las lecciones de esta banda")}{ARROW}</a></div>')
    out.append('<div class="%s">' % ("grid" if h.get("cards") == "ss" else "dr-grid") + "\n".join(unit_card(h, u, art) for u in bu) + '</div>')
    if ex:
        out.append(f'<div class="dr-more"><h3>{sp("More to explore on this band", "Más para explorar en esta banda")}</h3>'
                   '<div class="dr-exgrid">' + "".join(explore_card(x) for x in ex) + '</div></div>')
    out.append('</section>')
    return "\n".join(out)

def hero(h, o, art):
    en, es = h["name"]
    units = o.UNITS
    tot_ch = sum(len(u["chapters"]) for u in units); tot_l = sum(art.get(u["n"], ("", 0))[1] for u in units)
    pick = [units[0]["n"], units[len(units) // 2]["n"], units[-1]["n"]]
    tiles = "".join('<div class="dr-tile dr-t%d">%s</div>' % (i + 1, svg_scoped(art[n][0], "h%d" % n)) for i, n in enumerate(pick) if art.get(n, ("",))[0])
    return f'''<header class="dr-hero">
  <div class="eyebrow">
    <a href="/">Architecture of Grace</a>
    <div class="sw">
      <div class="seg" role="group" aria-label="Language"><button type="button" id="langEn" class="on">EN</button><button type="button" id="langEs">ES</button></div>
      <button id="themeBtn" type="button" aria-label="Switch between light and dark">Dark mode</button>
    </div>
  </div>
  <div class="dr-hgrid">
    <div class="dr-htext">
      <h1 data-en="{E(en)}" data-es="{E(es)}">{E(en)}</h1>
      <p class="dr-lede" data-aog-fits="1" data-en="{E(h["lede"][0])}" data-es="{E(h["lede"][1])}">{E(h["lede"][0])}</p>
      <div class="dr-cta no-print">
        <a class="btn dr-go dr-go1" href="/{h["contents"]}">{sp("Course contents", "Contenido del curso")}</a>
        <a class="btn dr-go dr-go2" href="/{h["cid"]}{units[0]["n"]}">{sp("Start at the beginning", "Empezar desde el principio")}</a>
      </div>
      <ul class="dr-facts" aria-label="The course in numbers">
        <li><b>{len(units)}</b>{sp("units", "unidades")}</li><li><b>{tot_ch}</b>{sp("chapters", "capítulos")}</li><li><b>{tot_l}</b>{sp("lessons", "lecciones")}</li><li><b>5</b>{sp("grade bands", "bandas de grados")}</li>
      </ul>
    </div>
    <div class="dr-collage" aria-hidden="true">{tiles}</div>
  </div>
</header>'''

def picker(h, o):
    opts = []
    for b in [x["id"] for x in o.BANDS]:
        n = sum(1 for u in o.UNITS if u["band"] == b)
        opts.append(f'<option value="{b}" data-en="{BAND_EN[b]} · {n} units" data-es="{BAND_ES[b]} · {n} unidades">{BAND_EN[b]} · {n} units</option>')
    return f'''<div class="dr-pick no-print">
  <label for="bandSel">{sp("Choose a grade band", "Elige una banda de grados")}</label>
  <div class="dr-selwrap"><select id="bandSel">{"".join(opts)}</select></div>
  {sp("Your choice is remembered on this device.", "Tu elección se guarda en este dispositivo.", "p", "dr-pnote")}
</div>'''

def practice(h):
    opts = "".join(f'<option value="{g}" data-en="{E(a)}" data-es="{E(b)}">{E(a)}</option>' for g, a, b in GRADES)
    d = h["drops"]
    return f'''<section class="dr-practice no-print" aria-labelledby="h-practice">
  <div class="dr-ptext">
    <h2 id="h-practice">{sp("Practice every day", "Practica cada día")}</h2>
    {sp(h["daily"][0], h["daily"][1], "p")}
  </div>
  <div class="dr-pform">
    <label for="gradeSel">{sp("Grade", "Grado")}</label>
    <div class="dr-prow"><div class="dr-selwrap"><select id="gradeSel" data-drops="{d}">{opts}</select></div>
    <a class="dr-pgo" id="gradeGo" href="/drops/{d}/K">{sp("Go", "Ir")}{ARROW}</a></div>
  </div>
</section>'''

def teacher(h):
    tt = teach_text(h["cid"]) or ("", "")
    return f'''<details class="teach dr-teach">
  <summary>{sp("For the teacher", "Para el maestro")}</summary>
  <div class="inner">
    <h3>{sp("What the course covers", "Qué cubre el curso")}</h3>
    {sp(tt[0], tt[1], "p")}
    <h3>{sp("Sources", "Fuentes")}</h3>
    {sp(h["sources"][0], h["sources"][1], "p")}
    <h3>{sp("Share one band", "Comparte una banda")}</h3>
    <p data-en="Add the band to the address, like &lt;b&gt;/{h["slug"]}#6-8&lt;/b&gt;. Tap &lt;b&gt;Show on the board&lt;/b&gt; to show a unit’s short address, big enough for the back row." data-es="Agrega la banda a la dirección, así: &lt;b&gt;/{h["slug"]}#6-8&lt;/b&gt;. Toca &lt;b&gt;Mostrar en la pizarra&lt;/b&gt; para mostrar la dirección corta de una unidad, en grande.">Add the band to the address, like <b>/{h["slug"]}#6-8</b>. Tap <b>Show on the board</b> to show a unit’s short address, big enough for the back row.</p>
    {sp("This page is a map. It saves nothing about a student and sends nothing anywhere.", "Esta página es un mapa. No guarda nada sobre un estudiante y no envía nada a ningún lado.", "p")}
  </div>
</details>'''

FOOT2 = {True: ("Original classroom material. We describe what people believe; we never tell anyone what to believe.",
                "Material original de clase. Describimos lo que la gente cree; nunca le decimos a nadie qué creer."),
         False: ("Original classroom material, free to use in any classroom.", "Material original de clase, libre para usar en cualquier salón.")}

CSS = r"""
/* AOG-DOORS-V2 — the course door. Phone first; iPad two columns; computer three. Still. */
:root{
  --d-bg:#F7F3EA; --d-card:#FFFFFF; --d-card2:#FBF8F1; --d-ink:#15233A; --d-sub:#4A5568; --d-line:#E3DCCB;
  --d-gold:#8A6414; --d-gold-l:#E3B04B; --d-navy:#0A1E33; --d-wash:#F3EBD8; --d-shadow:0 1px 2px rgba(10,30,51,.06),0 12px 28px -18px rgba(10,30,51,.35);
  --d-serif:"Fraunces","Iowan Old Style","Palatino Linotype",Georgia,serif;
  --d-sans:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
}
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){
  --d-bg:#0B1A2C; --d-card:#13294A; --d-card2:#102440; --d-ink:#F4EEE2; --d-sub:#C3CFDD; --d-line:rgba(244,238,226,.14);
  --d-gold:#F2C964; --d-wash:rgba(242,201,100,.10); --d-shadow:0 1px 2px rgba(0,0,0,.4),0 16px 34px -20px rgba(0,0,0,.8); } }
:root[data-theme="dark"]{
  --d-bg:#0B1A2C; --d-card:#13294A; --d-card2:#102440; --d-ink:#F4EEE2; --d-sub:#C3CFDD; --d-line:rgba(244,238,226,.14);
  --d-gold:#F2C964; --d-wash:rgba(242,201,100,.10); --d-shadow:0 1px 2px rgba(0,0,0,.4),0 16px 34px -20px rgba(0,0,0,.8);
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
html,body{background:var(--d-bg) !important}
body{color:var(--d-ink);font:16px/1.55 var(--d-sans);margin:0;padding:0 16px 64px;overflow-wrap:break-word}
button,select,a{touch-action:manipulation}
.wrap{max-width:1180px;margin:0 auto}
:focus-visible{outline:3px solid var(--d-gold);outline-offset:3px}

/* ── hero ── */
.dr-hero{padding:28px 0 30px}
.eyebrow{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px}
.eyebrow a{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;font-weight:700}
.eyebrow .sw{display:flex;gap:8px;align-items:center}
.seg{display:inline-flex;gap:2px}
.dr-hgrid{display:grid;grid-template-columns:1fr;gap:22px;align-items:center}
.dr-hero h1{margin:0 0 12px}
.dr-lede{max-width:46ch}
.dr-cta{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 18px}
html.aog-grace [data-aog-hero] a.btn.dr-go, a.btn.dr-go{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:12px 22px !important;border-radius:999px !important;
  font:700 16px/1.1 var(--d-sans) !important;letter-spacing:0 !important;text-decoration:none !important;flex:1 1 200px;text-align:center}
html.aog-grace [data-aog-hero] a.btn.dr-go1, a.btn.dr-go1{background:var(--d-gold-l) !important;border:2px solid var(--d-gold-l) !important;color:#0A1E33 !important}
html.aog-grace [data-aog-hero] a.btn.dr-go1 *{color:#0A1E33 !important}
/* AOG-HERO-INK-V1 (2026-09-30): cream words only once the masthead is painted navy; before that
   (or if aog-grace.js is slow on a phone) they are dark ink, so they never fade into a light page. */
a.btn.dr-go2{background:var(--d-card) !important;border:2px solid var(--d-gold) !important;color:var(--d-ink) !important}
html.aog-grace [data-aog-hero] a.btn.dr-go2{background:rgba(255,255,255,.06) !important;border:2px solid rgba(242,201,100,.75) !important;color:#F4EEE2 !important}
html.aog-grace [data-aog-hero] a.btn.dr-go2 *{color:#F4EEE2 !important;opacity:1 !important}
html.aog-grace [data-aog-hero] a.btn.dr-go:hover{transform:none}
html.aog-grace [data-aog-hero] a.btn.dr-go2:hover{background:rgba(242,201,100,.16) !important}
.dr-facts{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,auto);justify-content:start;gap:4px 22px}
.dr-facts li{display:flex;flex-direction:column;font-size:13px;letter-spacing:.04em;color:var(--d-sub)}
.dr-facts b{font:600 26px/1.1 var(--d-serif);color:var(--d-ink);letter-spacing:0}
html.aog-grace [data-aog-hero] .dr-facts li, html.aog-grace [data-aog-hero] .dr-facts li span{color:#E6DDCB !important;opacity:1 !important}
html.aog-grace [data-aog-hero] .dr-facts b{color:#F4EEE2 !important;opacity:1 !important}
.dr-collage{display:grid;grid-template-columns:1.55fr 1fr;grid-template-rows:1fr 1fr;gap:8px;height:200px}
.dr-tile{position:relative;overflow:hidden;border-radius:14px;border:1px solid rgba(242,201,100,.45);box-shadow:0 18px 36px -22px rgba(0,0,0,.8);background:#13294A}
.dr-tile svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.dr-t1{grid-row:1 / span 2}
@media (min-width:700px){ .dr-collage{height:260px} }
@media (min-width:1000px){
  .dr-hgrid{grid-template-columns:1.05fr 1fr;gap:44px}
  .dr-collage{height:360px}
  .dr-go{flex:0 0 auto}
}

/* ── band picker ── */
.dr-pick{display:grid;grid-template-columns:1fr;gap:6px 16px;align-items:center;background:var(--d-card);border:1px solid var(--d-line);border-radius:16px;padding:16px;box-shadow:var(--d-shadow);margin:0 0 26px}
.dr-pick label{font:700 13px/1.2 var(--d-sans);letter-spacing:.12em;text-transform:uppercase;color:var(--d-gold)}
.dr-pnote{margin:0;color:var(--d-sub);font-size:14px}
.dr-selwrap{position:relative}
.dr-selwrap::after{content:"";position:absolute;right:16px;top:50%;width:9px;height:9px;border-right:2.5px solid var(--d-ink);border-bottom:2.5px solid var(--d-ink);transform:translateY(-70%) rotate(45deg);pointer-events:none}
.dr-selwrap select{-webkit-appearance:none;appearance:none;width:100%;min-height:50px;font:600 17px/1.2 var(--d-sans);color:var(--d-ink);background:var(--d-card2);border:1.5px solid var(--d-line);border-radius:12px;padding:12px 44px 12px 14px;cursor:pointer}
.dr-selwrap select:hover{border-color:var(--d-gold)}
@media (min-width:700px){ .dr-pick{grid-template-columns:auto minmax(260px,360px) 1fr;padding:14px 18px} }

/* ── one band ── */
.band[hidden]{display:none}
.dr-bhead{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:10px 20px;margin:0 0 18px;padding-bottom:14px;border-bottom:1px solid var(--d-line)}
.dr-bhead h2{font:600 clamp(28px,4.4vw,40px)/1.05 var(--d-serif);margin:0 0 6px;letter-spacing:-.015em}
.dr-hint{margin:0 0 4px;color:var(--d-sub);max-width:60ch}
.dr-stats{margin:0;font-weight:700;font-size:14px;letter-spacing:.04em;color:var(--d-gold)}
.dr-sec{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:10px 16px;border-radius:999px;border:1.5px solid var(--d-line);background:var(--d-card);color:var(--d-ink);font-weight:700;text-decoration:none}
.dr-sec:hover{border-color:var(--d-gold)}
.dr-ar{flex:0 0 auto}

.dr-grid{display:grid;grid-template-columns:1fr;gap:18px}
@media (min-width:700px){ .dr-grid{grid-template-columns:repeat(2,1fr)} }
@media (min-width:1100px){ .dr-grid{grid-template-columns:repeat(3,1fr)} }
.dr-card{position:relative;display:flex;flex-direction:column;background:var(--d-card);border:1px solid var(--d-line);border-radius:18px;overflow:hidden;box-shadow:var(--d-shadow)}
.dr-card:hover{border-color:var(--d-gold)}
.dr-card:focus-within{outline:3px solid var(--d-gold);outline-offset:2px}
.dr-card :focus-visible{outline:none}
.dr-art{position:relative;aspect-ratio:1200/470;background:#1A3657;overflow:hidden;border-bottom:1px solid var(--d-line)}
.dr-art svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.dr-num{position:absolute;left:12px;top:12px;background:rgba(10,30,51,.86);color:#F4EEE2;font:700 13px/1 var(--d-sans);letter-spacing:.1em;text-transform:uppercase;padding:8px 11px;border-radius:999px;border:1px solid rgba(242,201,100,.6)}
.dr-cbody{display:flex;flex-direction:column;flex:1 1 auto;padding:16px 18px 18px}
.dr-strand{margin:0 0 4px;font:700 12px/1.3 var(--d-sans);letter-spacing:.14em;text-transform:uppercase;color:var(--d-gold)}
.dr-card h3{font:600 23px/1.18 var(--d-serif);margin:0 0 10px;letter-spacing:-.01em}
.dr-chs{margin:0 0 12px;padding:0;list-style:none;counter-reset:ch;display:grid;gap:6px}
.dr-chs li{counter-increment:ch;position:relative;padding-left:32px;color:var(--d-sub);font-size:15.5px;line-height:1.35}
.dr-chs li::before{content:counter(ch);position:absolute;left:0;top:-1px;width:22px;height:22px;border-radius:50%;background:var(--d-wash);color:var(--d-ink);font:700 12px/22px var(--d-sans);text-align:center}
.dr-meta{margin:auto 0 14px;padding-top:4px;font-size:14px;font-weight:600;color:var(--d-sub)}
.dr-acts{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.dr-open{display:inline-flex;align-items:center;gap:8px;min-height:46px;padding:11px 18px;border-radius:999px;background:var(--d-navy);color:#F4EEE2;font-weight:700;text-decoration:none;flex:1 1 auto;justify-content:center}
:root[data-theme="dark"] .dr-open{background:#E3B04B;color:#0A1E33}
.dr-open::after{content:"";position:absolute;inset:0;border-radius:18px}
.dr-beam{position:relative;z-index:1;display:inline-flex;align-items:center;gap:7px;min-height:46px;padding:10px 14px;border-radius:999px;border:1.5px solid var(--d-line);background:var(--d-card);color:var(--d-ink);font:600 15px/1.1 var(--d-sans);cursor:pointer;flex:1 1 auto;justify-content:center}
.dr-beam:hover{border-color:var(--d-gold)}
.dr-beam:focus-visible{outline:3px solid var(--d-gold);outline-offset:2px}

/* ── more to explore ── */
.dr-more{margin:30px 0 0}
.dr-more h3{font:600 22px/1.2 var(--d-serif);margin:0 0 12px}
.dr-exgrid{display:grid;grid-template-columns:1fr;gap:10px}
@media (min-width:700px){ .dr-exgrid{grid-template-columns:repeat(2,1fr)} }
@media (min-width:1100px){ .dr-exgrid{grid-template-columns:repeat(3,1fr)} }
.dr-ex{position:relative;display:grid;grid-template-columns:1fr auto;gap:2px 12px;align-items:center;min-height:44px;padding:14px 16px;border-radius:14px;background:var(--d-card);border:1px solid var(--d-line);color:var(--d-ink);text-decoration:none}
.dr-ex:hover{border-color:var(--d-gold)}
.dr-exk{grid-column:1;font:700 11.5px/1.2 var(--d-sans);letter-spacing:.14em;text-transform:uppercase;color:var(--d-gold)}
.dr-ext{grid-column:1;font:600 18px/1.25 var(--d-serif)}
.dr-exd{grid-column:1;font-size:14.5px;color:var(--d-sub);line-height:1.4}
.dr-ex .dr-ar{grid-column:2;grid-row:1 / span 3;color:var(--d-gold)}

/* ── practice every day ── */
.dr-practice{display:grid;grid-template-columns:1fr;gap:14px;margin:40px 0 0;padding:20px;border-radius:18px;background:var(--d-card);border:1px solid var(--d-line);box-shadow:var(--d-shadow);border-top:5px solid var(--d-gold-l)}
.dr-practice h2{font:600 26px/1.15 var(--d-serif);margin:0 0 4px}
.dr-practice p{margin:0;color:var(--d-sub);max-width:52ch}
.dr-pform label{display:block;font:700 13px/1.2 var(--d-sans);letter-spacing:.12em;text-transform:uppercase;color:var(--d-gold);margin:0 0 6px}
.dr-prow{display:grid;grid-template-columns:1fr auto;gap:10px}
.dr-pgo{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:50px;min-width:88px;padding:12px 20px;border-radius:999px;background:var(--d-navy);color:#F4EEE2;font-weight:700;text-decoration:none}
:root[data-theme="dark"] .dr-pgo{background:#E3B04B;color:#0A1E33}
@media (min-width:700px){ .dr-practice{grid-template-columns:1.3fr 1fr;align-items:end;padding:24px 26px} }

/* ── resource library: one fold, in the page's own paper ── */
.dr-res{margin:40px 0 0;border:1px solid var(--d-line);border-radius:18px;background:var(--d-card);box-shadow:var(--d-shadow)}
.dr-res summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:14px;min-height:64px;padding:16px 20px}
.dr-res summary::-webkit-details-marker{display:none}
.dr-res summary::after{content:"";flex:0 0 auto;margin-left:auto;width:10px;height:10px;border-right:2.5px solid var(--d-ink);border-bottom:2.5px solid var(--d-ink);transform:rotate(45deg)}
.dr-res[open] summary::after{transform:rotate(-135deg)}
.dr-rt{display:flex;flex-direction:column;gap:2px}
.dr-rt b{font:600 24px/1.15 var(--d-serif)}
.dr-rt span{color:var(--d-sub);font-size:15px}
.dr-res .aogres{--r-bg:transparent;--r-card:var(--d-card2);--r-ink:var(--d-ink);--r-sub:var(--d-sub);--r-line:var(--d-line);max-width:none;margin:0;padding:4px 20px 18px;border-top:0;font-family:var(--d-sans)}
.dr-res .aogres > h2,.dr-res .aogres-lead{display:none}
.dr-res .aogres h3{font-family:var(--d-serif)}
.dr-res .aogres-card{border-radius:14px}

/* ── teacher ── */
.dr-teach{margin:36px 0 0;border:1px solid var(--d-line);border-radius:14px;background:var(--d-card)}
.dr-teach summary{cursor:pointer;min-height:52px;display:flex;align-items:center;padding:12px 18px;font:600 19px/1.2 var(--d-serif);list-style:none}
.dr-teach summary::-webkit-details-marker{display:none}
.dr-teach summary::before{content:"+";display:inline-grid;place-items:center;width:26px;height:26px;margin-right:12px;border-radius:50%;background:var(--d-wash);font:700 16px/1 var(--d-sans)}
.dr-teach[open] summary::before{content:"–"}
.dr-teach .inner{padding:0 18px 16px;max-width:75ch}
.dr-teach h3{font:700 13px/1.2 var(--d-sans);letter-spacing:.12em;text-transform:uppercase;color:var(--d-gold);margin:16px 0 6px}
.dr-teach p{margin:0 0 8px;color:var(--d-sub)}
footer{margin:36px 0 0;padding-top:16px;border-top:1px solid var(--d-line);color:var(--d-sub);font-size:14px}
footer p{margin:0 0 6px}

/* the board beam */
#beam{position:fixed;inset:0;z-index:9999;background:#0A1E33;color:#F4EEE2;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;cursor:pointer}
#beam .x{position:absolute;top:16px;right:18px;font-size:15px;color:rgba(244,238,226,.8)}
#beam .wk{font:700 14px/1.2 var(--d-sans);letter-spacing:.2em;text-transform:uppercase;color:#F2C964}
#beam .nm{font:600 clamp(22px,4vw,40px)/1.2 var(--d-serif);margin:12px 0 18px;max-width:30ch}
#beam .url{font:700 clamp(34px,8vw,96px)/1.05 var(--d-sans);letter-spacing:-.01em;word-break:break-all}
#beam .hint{color:rgba(244,238,226,.85);margin-top:18px}

@media print{
  body{background:#fff;color:#000;padding:0}
  .no-print,.dr-collage,.eyebrow .sw,.dr-res{display:none !important}
  .band[hidden]{display:block !important}
  .dr-card,.dr-ex,.dr-teach{box-shadow:none;break-inside:avoid;border-color:#999}
  .dr-art{display:none}
  .dr-grid,.dr-exgrid{grid-template-columns:1fr 1fr}
  .dr-teach .inner{display:block}
}
"""

JS = r"""
(function(){
"use strict";
/* AOG-DOORS-V2 — the door's own engine: one band at a time (the drop-down, #6-8 on the link,
   the last choice remembered per course), EN|ES, theme, Practice-every-day, the board beam.
   The site bar (aog-topbar.js) CLICKS #langEn / #langEs / #themeBtn and hides them. */
var SLUG="__SLUG__", KEY="aog.hub."+SLUG+".", LEGACY="aog.interior.ws.v1.", NAME=__NAME__;
var H=document.documentElement;
function $(s){return document.querySelector(s);}
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null;}}
var lang="en";
function T(en,es){return lang==="es"?es:en;}
function paintLang(){
  H.lang=lang;
  var n=document.querySelectorAll("[data-en]");
  for(var i=0;i<n.length;i++){
    var el=n[i], v=(lang==="es")?el.getAttribute("data-es"):el.getAttribute("data-en");
    if(v==null) continue;
    if(v.indexOf("<")!==-1||v.indexOf("&lt;")!==-1) el.innerHTML=v; else el.textContent=v;
  }
  var bEn=$("#langEn"),bEs=$("#langEs");
  if(bEn) bEn.classList.toggle("on",lang!=="es");
  if(bEs) bEs.classList.toggle("on",lang==="es");
  paintTheme();
}
function pickLang(v){return function(){ if(lang===v) return; lang=v; store("aog.lang",v); store(LEGACY+"lang",v); paintLang(); };}
$("#langEn").addEventListener("click",pickLang("en"));
$("#langEs").addEventListener("click",pickLang("es"));
(function(){ var s=store("aog.lang")||store(LEGACY+"lang"); if(s==="es"||s==="en") lang=s; })();
function paintTheme(){ var b=$("#themeBtn"); if(!b) return; var d=H.getAttribute("data-theme")==="dark"; b.textContent=d?T("Light mode","Modo claro"):T("Dark mode","Modo oscuro"); }
$("#themeBtn").addEventListener("click",function(){
  var d=H.getAttribute("data-theme")==="dark"?"light":"dark";
  H.setAttribute("data-theme",d); store("aog.theme",d); store(LEGACY+"theme",d); paintTheme();
});

/* ── one band at a time: ?band=6-8 or #6-8 on the link wins, then this device's last choice ── */
var BANDS=__BANDS__, GRADE={"k-2":"K","3-5":"3","6-8":"6","9-10":"9-10","11-12":"11-12"};
function bandCanon(v){ v=String(v==null?"":v).toLowerCase(); for(var i=0;i<BANDS.length;i++){ if(BANDS[i].toLowerCase()===v) return BANDS[i]; } return null; }
function bandFrom(){ var c;
  var m=/[?&]band=([^&#]+)/.exec(location.search||""); if(m&&(c=bandCanon(m[1]))) return c;
  var h=(location.hash||"").replace(/^#(band-)?/,""); if((c=bandCanon(h))) return c;
  var s=store(KEY+"band"); if(s&&(c=bandCanon(s))) return c;
  return BANDS[0];
}
var sel=$("#bandSel"), gsel=$("#gradeSel"), go=$("#gradeGo");
function setGrade(g){ if(!gsel) return; gsel.value=g; go.setAttribute("href","/drops/"+gsel.getAttribute("data-drops")+"/"+g); }
function showBand(id,push){
  var secs=document.querySelectorAll(".dr-band");
  for(var i=0;i<secs.length;i++) secs[i].hidden=(secs[i].id!==id);
  if(sel) sel.value=id;
  setGrade(GRADE[id]||"K");
  store(KEY+"band",id);
  if(push){ try{ history.replaceState(null,"","#"+id); }catch(e){} }
}
if(sel) sel.addEventListener("change",function(){ showBand(sel.value,true); });
if(gsel) gsel.addEventListener("change",function(){ setGrade(gsel.value); });
window.addEventListener("hashchange",function(){ var c=bandCanon((location.hash||"").replace(/^#(band-)?/,"")); if(c) showBand(c,false); });
showBand(bandFrom(),false);
/* a link to #h-6-8 or #course-6-8 (older anchors) opens that band */
(function(){ var m=/^#(?:h-|course-)(.+)$/.exec(location.hash||""); var c=m&&bandCanon(m[1]); if(c){ showBand(c,false); var t=document.getElementById(location.hash.slice(1)); if(t) t.scrollIntoView(); } })();

/* ── the board beam: the short address, big enough for the back row ── */
document.addEventListener("click",function(e){
  var btn=e.target.closest("[data-beam]"); if(!btn) return;
  var host=location.hostname||"architectureofgrace.org";
  if(host==="localhost"||host==="127.0.0.1"||!host) host="architectureofgrace.org";
  var url=host.replace(/^www\./,"")+btn.getAttribute("data-beam");
  var nm=(lang==="es"&&btn.getAttribute("data-name-es"))?btn.getAttribute("data-name-es"):btn.getAttribute("data-name");
  var el=document.createElement("div"); el.id="beam"; el.setAttribute("role","dialog"); el.setAttribute("aria-label",url);
  el.innerHTML='<div class="x">'+T("Tap anywhere to close","Toca para cerrar")+'</div><div class="wk"></div><div class="nm"></div><div class="url"></div><p class="hint">'+T("Type it in the address bar.","Escríbelo en la barra de direcciones.")+'</p>';
  el.querySelector(".wk").textContent=T(NAME[0],NAME[1]);
  el.querySelector(".nm").textContent=nm||""; el.querySelector(".url").textContent=url;
  function close(){ el.remove(); btn.focus(); document.removeEventListener("keydown",esc); }
  function esc(ev){ if(ev.key==="Escape") close(); }
  el.addEventListener("click",close); document.addEventListener("keydown",esc);
  document.body.appendChild(el); el.setAttribute("tabindex","-1"); el.focus();
});
paintLang();
})();
"""

# the unit cards of social-studies-hub.html (its own rules, with the door's colours)
SS_CARD_CSS = """
/* AOG-SS-CARDS-V1 — the cards of social-studies-hub.html */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
.unit{background:var(--d-card);border:1px solid var(--d-line);border-radius:10px;padding:14px 16px;box-shadow:var(--d-shadow);display:flex;flex-direction:column;gap:6px}
.unit.open{border-left:4px solid var(--room,var(--d-gold))}
.unit .t{font-family:var(--d-serif);font-weight:700;font-size:1.05rem;line-height:1.25}
.unit .d{font-size:.88rem;color:var(--d-sub);flex:1 1 auto}
.doors{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:4px}
.door{display:inline-flex;align-items:center;min-height:44px;padding:8px 14px;border:1px solid var(--d-line);border-radius:999px;background:var(--d-bg);color:var(--d-ink);font:600 .85rem var(--d-sans);text-decoration:none}
.door:hover{border-color:var(--d-gold)}
.door:focus-visible,.beam:focus-visible{outline:2px solid var(--d-gold);outline-offset:2px}
.beam{border:0;background:none;color:var(--d-sub);font:600 .8rem var(--d-sans);cursor:pointer;min-height:44px;padding:8px 6px;text-decoration:underline;text-underline-offset:3px;margin-left:auto}
.beam:hover{color:var(--d-ink)}
.unit.course{position:relative;padding-left:64px}
.unit.course .un{position:absolute;left:14px;top:14px;width:38px;height:38px;border-radius:9px;background:#A8323A;color:#fff;display:flex;align-items:center;justify-content:center;font:800 1.25rem "Avenir Next Condensed","Arial Narrow",var(--d-sans);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 3px 0 #5A151B}
.unit.course .yrs{font:italic 600 .84rem var(--d-serif);color:var(--d-sub);margin-top:-2px}
@media print{ .beam{display:none !important} .grid{display:block !important} .grid>*{break-inside:avoid;margin:0 0 12px} }
"""

def head_of(file, h=None):
    """the page's own head up to and including the managed icons block (kept verbatim).
    A new door has no page yet: it borrows talmud-hub.html's head with its own name, words and address."""
    end = "<!-- ═══ END AOG ICONS + LINK PREVIEW ═══ -->"
    if not (DEPLOY / file).exists() and h:
        s = (DEPLOY / "talmud-hub.html").read_text(encoding="utf-8")
        s = s[:s.index(end) + len(end)]
        en = h["name"][0]
        desc = "%s, K–12 — studied band by band, for a public-school classroom. Free and private." % en
        s = re.sub(r"Talmud Study, K–12 — [^\"]*Free and private\.", lambda m: E(desc), s)
        s = s.replace("Talmud Study", en).replace("/talmud\"", "/%s\"" % h["slug"])
        return s
    s = (DEPLOY / file).read_text(encoding="utf-8")
    return s[:s.index(end) + len(end)]

def make_door(h):
    o = load(h["cid"]); en, es = h["name"]
    art = course_art(h["contents"])
    bands = [b["id"] for b in o.BANDS]
    head = head_of(h["file"], h)
    body = "\n".join(band_section(h, o, b, art) for b in bands)
    foot = FOOT2[h["cid"] != "eco"]
    js = JS.replace("__SLUG__", h["slug"]).replace("__BANDS__", str(bands).replace("'", '"').replace(" ", "")) \
           .replace("__NAME__", '["%s","%s"]' % (en.replace('"', ""), es.replace('"', "")))
    page = f'''{head}
<!-- AOG-DOORS-V2 — built by _work/course/make_hubs.py doors. Do not hand-edit; re-run it. -->
<style>{CSS}{SS_CARD_CSS if h.get("cards") == "ss" else ""}</style>
<link rel="stylesheet" href="/aog-resources.css">
<link rel="stylesheet" href="/aog-calm.css">
</head>
<body>
<script src="/aog-topbar.js"></script>
<script src="/aog-grace.js" defer></script>

<div class="wrap">
{hero(h, o, art)}
<main id="content">
{picker(h, o)}
{body}
{practice(h)}
<details class="dr-res">
  <summary><span class="dr-rt">{sp("Resource library", "Biblioteca de recursos", "b")}{sp("Trusted places to read, watch and explore, chosen for this course.", "Lugares confiables para leer, ver y explorar, elegidos para este curso.")}</span></summary>
  <div data-aog-resources="{h["res"]}"></div>
</details>
{teacher(h)}
</main>
<footer>
  {sp("This page saves nothing about a student and can’t send anything.", "Esta página no guarda nada sobre un estudiante y no puede enviar nada.", "p")}
  {sp(foot[0], foot[1], "p")}
</footer>
</div>
<script>{js}</script>
<script src="/aog-resources.js" defer></script>
</body>
</html>
'''
    (DEPLOY / h["file"]).write_text(page, encoding="utf-8")
    print("wrote", h["file"], len(page), "bytes ·", len(o.UNITS), "unit cards")

def check(files):
    bad = 0; total = 0
    for f in files:
        s = (DEPLOY / f).read_text(encoding="utf-8")
        for href in re.findall(r'(?:href|data-beam)="([^"]+)"', s):
            href = html.unescape(href)
            if href.startswith(("http", "mailto:", "#", "data:")): continue
            total += 1
            if not resolves(href): bad += 1; print("BROKEN", f, href)
    print("links checked: %d · broken: %d" % (total, bad))
    return bad

if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "check"
    if what in ("doors", "hubs", "k8"):
        # optional names after the verb build only those hubs: `make_hubs.py hubs chn` (cid or file)
        only = set(sys.argv[2:])
        for h in COURSES:
            if not only or h["cid"] in only or h["file"] in only: make_door(h)
    else:
        sys.exit(1 if check(sys.argv[2:] or [h["file"] for h in COURSES]) else 0)
