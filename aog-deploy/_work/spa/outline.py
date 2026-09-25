# Spanish, K–12 — the course arc. Our own wording, following the ACTFL
# World-Readiness Standards and the Illinois Learning Standards for World
# Languages (communication, cultures, connections, comparisons, communities),
# novice to intermediate, band by band. Topics guide the writers; story = the
# chapter's opening narrative hook.
#
# Units number 1–20 straight through the course; chapters 1–40. Each unit
# grows out of one existing room on spanish-hub.html (LINKS below).

BANDS = [
 dict(id="k-2",   title="Grades K–2",   level="k2"),
 dict(id="3-5",   title="Grades 3–5",   level="35"),
 dict(id="6-8",   title="Grades 6–8",   level="68"),
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
]

UNITS = [
 # ══════════════════════════════ K–2 ══════════════════════════════
 dict(n=1, band="k-2", title="Sounds of Spanish", strand="Sounds", chapters=[
  dict(n=1, title="Five Vowels, Five Sounds", strand="Vowels",
       topics="a, e, i, o, u each make one sound, always (ah, eh, ee, oh, oo); saying mamá, papá, oso, uva, isla; reading a word the way it is spelled; clapping syllables (ma-ri-po-sa); hola and adiós; the Spanish alphabet song.",
       story="A new friend named Ana says her name, and it sounds the same backward"),
  dict(n=2, title="Special Letters: h, ll, ñ, rr", strand="Letters",
       topics="h is silent (hola, helado); ll sounds like y (llama, pollo); ñ says ny (niño, año, España); the rolled rr (perro, carro) versus r (pero); j sounds like a strong h (jugo); saying a word before you know its meaning.",
       story="A llama named Yoyo and a puppy named Perro at the farm"),
 ]),
 dict(n=2, band="k-2", title="Colors and Numbers", strand="Numbers", chapters=[
  dict(n=3, title="Counting from Cero to Veinte", strand="Numbers",
       topics="uno to diez; once to quince; dieciséis to diecinueve built as diez y seis; veinte; ¿cuántos? (how many?); counting objects in a picture; hay (there is / there are); numbers in songs and games.",
       story="Counting the crayons in the class box with Señora Ruiz"),
  dict(n=4, title="Colors All Around", strand="Colors",
       topics="rojo, azul, amarillo, verde, anaranjado, morado, rosado, negro, blanco, café/marrón; ¿de qué color es?; the color word comes after the thing (la manzana roja); colors of a flag and a rainbow; mixing colors.",
       story="Painting a rainbow and naming each stripe"),
 ]),
 dict(n=3, band="k-2", title="El and La: Naming Things", strand="Nouns", chapters=[
  dict(n=5, title="My Family and My Pets", strand="Family",
       topics="la mamá, el papá, el hermano, la hermana, el abuelo, la abuela, el bebé; el perro, el gato, el pez, el pájaro; el and la go with a name; un and una (a/an); mi (my); Esta es mi mamá.",
       story="A family photo day, and everyone gets a name tag"),
  dict(n=6, title="Things in My Room and School", strand="Things",
       topics="el libro, la mesa, la silla, la puerta, la ventana, el lápiz, la cama; the -o/-a hint (usually el with -o, la with -a); two famous rule-breakers (el día, la mano); ¿Qué es? Es un…; pointing and naming.",
       story="A treasure hunt around the classroom"),
 ]),
 dict(n=4, band="k-2", title="One and Many, Big and Little", strand="Describing", chapters=[
  dict(n=7, title="More Than One", strand="Plurals",
       topics="adding -s (gato → gatos); adding -es (flor → flores); z changes to c (lápiz → lápices); el becomes los, la becomes las; two words change, not one; counting plural things (tres perros).",
       story="One cat becomes a basket full of kittens"),
  dict(n=8, title="Big, Little, Happy, Sad", strand="Adjectives",
       topics="grande, pequeño, alto, bajo, feliz, triste; the describing word goes after the thing (el perro grande); matching -o and -a (el gato pequeño, la gata pequeña); plural describing words (los perros grandes); opposites.",
       story="A big elephant and a little mouse become friends"),
 ]),

 # ══════════════════════════════ 3–5 ══════════════════════════════
 dict(n=5, band="3-5", title="A Whole Thought in Spanish", strand="Sentences", chapters=[
  dict(n=9, title="Who Does What", strand="Subject and Verb",
       topics="a sentence needs someone and something they do; yo, tú, él, ella, nosotros, ellos; the verb ending tells who (hablo, hablas, habla); dropping yo because the ending already says it; simple -ar verbs (hablar, bailar, cantar, caminar); word order.",
       story="A soccer game told in five short Spanish sentences"),
  dict(n=10, title="Saying No and Asking Yes-or-No", strand="Negation and Questions",
       topics="putting no before the verb (No hablo francés); yes/no questions with a rising voice; the upside-down question mark ¿ at the start; sí and no; answering in a full sentence; me gusta / no me gusta as a first taste.",
       story="Twenty questions at a sleepover"),
 ]),
 dict(n=6, band="3-5", title="Soy and Estoy", strand="Two Kinds of Am", chapters=[
  dict(n=11, title="Ser: Who and What I Am", strand="Ser",
       topics="soy, eres, es, somos, son; name, where you are from (Soy de Chicago), what you are like (Soy alto), job; ser answers who? and what is it like?; describing a friend; nationality words.",
       story="A pen-pal letter from a girl in Monterrey"),
  dict(n=12, title="Estar: How and Where I Am", strand="Estar",
       topics="estoy, estás, está, estamos, están; feelings (Estoy cansado, Estoy contenta); location (Estoy en la escuela); ¿Cómo estás?; the rule of thumb — how you feel and where you are use estar; choosing ser or estar.",
       story="A tired, happy day at the county fair"),
 ]),
 dict(n=7, band="3-5", title="Who, Where, When, Why", strand="Questions", chapters=[
  dict(n=13, title="The Question Words", strand="Question Words",
       topics="¿quién?, ¿qué?, ¿dónde?, ¿cuándo?, ¿por qué?, ¿cómo?, ¿cuánto?; the written accent that marks a question word; porque (because) without the accent as the answer; asking about any piece of a sentence.",
       story="A mystery: who took the last empanada?"),
  dict(n=14, title="Interviews and Answers", strand="Conversation",
       topics="interviewing a classmate; ¿Cómo te llamas? ¿Cuántos años tienes? ¿Dónde vives?; answering in full sentences; polite words (por favor, gracias, de nada, perdón); listening for the question word.",
       story="Reporters for the school news interview the new principal"),
 ]),
 dict(n=8, band="3-5", title="First, Then, Last: Telling a Day", strand="Sequencing", chapters=[
  dict(n=15, title="My Day in Order", strand="Daily Routine",
       topics="primero, luego, después, finalmente; times of day (la mañana, la tarde, la noche); a simple daily routine with common verbs (como, voy, juego, leo); days of the week; telling time on the hour (Es la una, Son las tres).",
       story="A day in the life of a student in Puerto Rico"),
  dict(n=16, title="Writing a Short Story", strand="Writing",
       topics="joining sentences with y, pero, también; four to six sentences in order; a beginning, a middle and an end; reading your story aloud; checking verb endings and noun-adjective matches; a comic strip in Spanish.",
       story="A lost backpack and how it came home"),
 ]),

 # ══════════════════════════════ 6–8 ══════════════════════════════
 dict(n=9, band="6-8", title="Greetings and Introductions", strand="Meeting People", chapters=[
  dict(n=17, title="Hola and Hasta Luego", strand="Greetings",
       topics="greetings by time of day (buenos días, buenas tardes, buenas noches); goodbyes (adiós, hasta luego, hasta mañana, chao); tú versus usted — informal and formal; greeting customs (a handshake, a kiss on the cheek in many places); introducing someone (Te presento a…, Mucho gusto).",
       story="First day at a school in Chicago's Pilsen neighborhood"),
  dict(n=18, title="The Alphabet, Names and Origins", strand="Alphabet and Origins",
       topics="the Spanish alphabet and its letter names; spelling your name aloud; ¿Cómo se escribe?; two last names (father's and mother's surname); ¿De dónde eres?; countries and nationalities; accent marks and why they matter (papá versus papa).",
       story="A new classmate spells a name with two last names"),
 ]),
 dict(n=10, band="6-8", title="Numbers, Time and Dates", strand="Numbers and Time", chapters=[
  dict(n=19, title="Numbers to a Thousand", strand="Numbers",
       topics="numbers 0–100 and patterns (treinta y uno); cien versus ciento; hundreds (doscientos, quinientos, setecientos, novecientos); mil; prices and phone numbers; tener for age (Tengo doce años); math aloud (más, menos, son).",
       story="Shopping at a mercado with a budget of 500 pesos (example prices)"),
  dict(n=20, title="The Clock and the Calendar", strand="Time and Dates",
       topics="¿Qué hora es? — y cuarto, y media, menos; a.m./p.m. with de la mañana/tarde/noche; days and months are lowercase; dates written day-first (15/9); el primero de…; birthdays and holidays (Día de los Muertos, Independence days of Mexico on September 16).",
       story="Planning a birthday party around everyone's schedules"),
 ]),
 dict(n=11, band="6-8", title="The Classroom: Nouns and Articles", strand="Nouns", chapters=[
  dict(n=21, title="Gender and Number", strand="Gender",
       topics="every noun has a gender; el/la/los/las and un/una/unos/unas; -o/-a patterns; -ción, -dad (feminine) and -ma words from Greek (el problema, el mapa); exceptions worth knowing (el día, la mano); plurals with -s, -es, z→c.",
       story="Labeling the whole classroom with sticky notes"),
  dict(n=22, title="Hay, Necesito and Classroom Talk", strand="Classroom Language",
       topics="hay (there is/are); ¿Qué hay en…?; necesito, tengo; school supplies and subjects (las matemáticas, la historia, las ciencias); classroom commands you hear (Abran los libros, Escuchen); asking for help (¿Cómo se dice…? ¿Puede repetir?).",
       story="Getting ready for the first week of school"),
 ]),
 dict(n=12, band="6-8", title="Ser, Estar and Describing People", strand="Description", chapters=[
  dict(n=23, title="Two Verbs for To Be", strand="Ser and Estar",
       topics="all forms of ser and estar; ser for identity, origin, traits, time and dates; estar for location, feelings and conditions; pairs that change meaning (es aburrido / está aburrido; es listo / está listo); common errors.",
       story="Two cousins: one always calm, one calm only today"),
  dict(n=24, title="Adjective Agreement and Description", strand="Adjectives",
       topics="adjectives match in gender and number; adjectives ending in -e or a consonant (inteligente, fácil); adjectives before the noun (buen, gran); physical description and personality; describing a family member or a famous person; comparisons more/less (más… que, menos… que).",
       story="Writing a description for a lost-dog poster"),
 ]),

 # ══════════════════════════════ 9–10 ══════════════════════════════
 dict(n=13, band="9-10", title="The Present Tense", strand="Present Tense", chapters=[
  dict(n=25, title="Regular -ar, -er and -ir Verbs", strand="Regular Verbs",
       topics="stem plus ending; full conjugations of hablar, comer, vivir; subject pronouns including vosotros and ustedes; why Spanish usually drops the subject pronoun; the present for habits and for right now; frequency words (siempre, a veces, nunca).",
       story="A week in the life of a family running a taquería"),
  dict(n=26, title="Yo-Irregulars and Ir a", strand="Irregular Verbs",
       topics="yo-go verbs (tengo, hago, pongo, salgo, traigo, digo, vengo); conozco, sé, doy, veo; ir (voy, vas, va); ir a + infinitive for the near future; saber versus conocer; weekend plans.",
       story="Plans for a trip to see relatives in Guadalajara"),
 ]),
 dict(n=14, band="9-10", title="Tener, Gustar and Stem Changes", strand="Verb Patterns", chapters=[
  dict(n=27, title="Boot Verbs and Tener Expressions", strand="Stem-Changing Verbs",
       topics="e→ie (querer, pensar, empezar), o→ue (poder, dormir, volver, jugar u→ue), e→i (pedir, servir); the boot shape — nosotros and vosotros keep the stem; tener expressions (tener hambre, sed, frío, calor, miedo, razón, que + infinitive).",
       story="A hungry, cold soccer team after a game in the rain"),
  dict(n=28, title="Gustar and Its Family", strand="Gustar",
       topics="me gusta / me gustan — the thing liked is the subject; indirect object pronouns me, te, le, nos, os, les; a mí, a ti for emphasis or clarity; encantar, interesar, molestar, faltar; talking about food, music and hobbies; agreeing (a mí también / a mí tampoco).",
       story="Planning a menu that everyone in a big family likes"),
 ]),
 dict(n=15, band="9-10", title="The Preterite: What Happened", strand="Past Tense", chapters=[
  dict(n=29, title="Regular Preterite Endings", strand="Preterite Forms",
       topics="-ar endings (-é, -aste, -ó, -amos, -asteis, -aron); -er/-ir endings (-í, -iste, -ió…); the accent that changes hablo into habló; spelling changes in yo (-car → qué, -gar → gué, -zar → cé); time words (ayer, anoche, la semana pasada).",
       story="What happened at the concert last Saturday"),
  dict(n=30, title="Irregular Preterites", strand="Irregular Preterite",
       topics="ser and ir share forms (fui, fue); hacer (hice, hizo); tener, estar, poder, poner, venir, querer, decir with irregular stems and no accents; dar and ver; i→y verbs (leyó, creyó); stem-changing -ir verbs in the third person (durmió, pidió).",
       story="A class trip to the Field Museum, told by three students"),
 ]),
 dict(n=16, band="9-10", title="The Imperfect and Telling a Story", strand="Narration", chapters=[
  dict(n=31, title="The Imperfect: When I Was Little", strand="Imperfect Forms",
       topics="-aba and -ía endings; only three irregulars (ser, ir, ver); uses — habits in the past, descriptions, age and time, feelings, ongoing background; cuando era niño/a; soler; memories of childhood.",
       story="A grandmother remembers her childhood town in Michoacán"),
  dict(n=32, title="Preterite and Imperfect Together", strand="Aspect",
       topics="the imperfect paints the scene, the preterite moves the plot; an action interrupting another (Leía cuando sonó el teléfono); clue words; verbs that shift meaning (conocí, supe, quise, pude); retelling a fable or a legend such as La Llorona in outline.",
       story="A storm, a power outage and what really happened"),
 ]),

 # ══════════════════════════════ 11–12 ══════════════════════════════
 dict(n=17, band="11-12", title="Pronouns, Reflexives and Commands", strand="Pronouns", chapters=[
  dict(n=33, title="Object Pronouns and Reflexives", strand="Object Pronouns",
       topics="direct (lo, la, los, las) and indirect (le, les) object pronouns; le/les → se before lo/la; placement before a conjugated verb or attached to an infinitive or gerund, and the accent that appears (dámelo, comiéndolo); reflexive verbs and the daily routine (me levanto, me ducho, me visto); reciprocal se.",
       story="A morning routine gone wrong on exam day"),
  dict(n=34, title="Commands", strand="Imperative",
       topics="affirmative tú commands (habla, come) and the eight irregulars (di, haz, ve, pon, sal, sé, ten, ven); negative tú commands (no hables); usted and ustedes commands; nosotros commands (vamos, hablemos); pronouns attached to affirmative, before negative; recipes and directions.",
       story="Following a grandmother's recipe for arroz con pollo"),
 ]),
 dict(n=18, band="11-12", title="The Subjunctive", strand="Mood", chapters=[
  dict(n=35, title="What the Subjunctive Is", strand="Present Subjunctive",
       topics="mood, not tense — the indicative states, the subjunctive wishes, doubts, reacts; forming it from the yo form (hable, coma, viva) and the irregulars (sea, esté, vaya, haya, sepa, dé); the two-clause pattern with que and a change of subject; WEIRDO triggers (wishes, emotions, impersonal expressions, recommendations, doubt, ojalá).",
       story="A letter of advice from an older sister starting college"),
  dict(n=36, title="Doubt, Emotion and the Past Subjunctive", strand="Subjunctive Uses",
       topics="doubt versus certainty (dudo que / creo que); emotion (me alegra que); adverbial conjunctions (para que, antes de que, cuando with the future); the imperfect subjunctive (-ra forms from the preterite ellos form); si clauses (Si tuviera dinero, viajaría); the conditional.",
       story="If I could change one thing about my town"),
 ]),
 dict(n=19, band="11-12", title="The Spanish-Speaking World and Register", strand="Cultures", chapters=[
  dict(n=37, title="Where Spanish Is Spoken", strand="Geography and Variation",
       topics="Spanish as an official language in 20 countries plus Puerto Rico; Spanish in the United States and in Illinois; regional variation — vos in Argentina and Central America, vosotros in Spain, the ceceo/distinción of Spain; vocabulary differences (guagua/camión/autobús, carro/coche); influence of Arabic, Nahuatl and Taíno words (aceite, chocolate, huracán).",
       story="Three friends from Buenos Aires, Madrid and Mexico City order lunch"),
  dict(n=38, title="Formal and Informal Register", strand="Register",
       topics="tú, usted, vos and when to use each; formal letters and emails (Estimado/a, Atentamente); informal messages; register in speaking with elders, teachers and employers; false friends (embarazada, éxito, carpeta); reading authentic texts — signs, menus, news headlines.",
       story="Writing to a company for a summer job in two different voices"),
 ]),
 dict(n=20, band="11-12", title="Capstone: Present and Defend", strand="Capstone", chapters=[
  dict(n=39, title="Reviewing the Whole Sequence", strand="Review",
       topics="the tense map — present, preterite, imperfect, future, conditional, present perfect (he hablado) and the subjunctive; choosing the right verb form from context; connectors (sin embargo, además, por lo tanto, en cambio, aunque); common errors and how to self-correct; reading a longer authentic passage.",
       story="Editing a classmate's essay together"),
  dict(n=40, title="The Presentation", strand="Presentational Communication",
       topics="choosing a topic about the Spanish-speaking world; a thesis (En mi opinión…, Sostengo que…); three supports with evidence; transitions and a conclusion; speaking from notes, not reading; answering questions and defending a point politely (Entiendo su punto, pero…); a rubric.",
       story="A senior presents on why her family's language matters"),
 ]),
]

# Rooms already on the site that belong to each unit — nothing gets deleted.
LINKS = {
 1: [("/sp13", "Five vowels that never change — the room")],
 2: [("/sp14", "Colors and counting to twenty — the room")],
 3: [("/sp15", "El and la — naming what is here")],
 4: [("/sp16", "One and many, big and little")],
 5: [("/sp17", "A whole thought in Spanish — the room")],
 6: [("/sp18", "Soy and estoy — who I am, how I am")],
 7: [("/sp19", "Who, where, when, why")],
 8: [("/sp20", "First, then, last — telling a day")],
 9: [("/sp1", "Greetings and introductions — the room")],
 10: [("/sp2", "Numbers, time and dates")],
 11: [("/sp3", "The classroom — nouns and articles")],
 12: [("/sp4", "Ser, estar and describing people")],
 13: [("/sp5", "The present tense — the room")],
 14: [("/sp6", "Tener, gustar and stem changes")],
 15: [("/sp7", "The preterite — telling what happened")],
 16: [("/sp8", "The imperfect and telling a story")],
 17: [("/sp9", "Pronouns, reflexives and commands — the room")],
 18: [("/sp10", "The subjunctive")],
 19: [("/sp11", "The Spanish-speaking world and register")],
 20: [("/sp12", "Capstone — present and defend")],
}
