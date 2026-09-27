# Hindu Texts, K–12 — the course arc. Our own wording: the Hindu scriptures
# studied in a public-school classroom — Ramayana and Krishna stories and the
# festivals they light (K–2), what the texts are (shruti and smriti), the two
# epics and the key teachings and festivals (3–5), the history and genres —
# Vedas, Upanishads, epics, Puranas, bhakti poetry (6–8), close reading of the
# Bhagavad Gita, the Upanishads, the Rig Veda and the epics' dharma dilemmas in
# public-domain translation (9–10), then interpretation, comparison and a
# capstone (11–12). Quotations only from public-domain translations (Arnold's
# Gita 1885; Müller's Upanishads, SBE 1 and 15, 1879/1884; Griffith's Rig Veda
# 1896 and Ramayan 1870–74; Ganguli's Mahabharata 1883–96); everything else
# paraphrased and marked so. Always described ("Hindus believe…", "the Gita
# says…", "many Hindus read this as…"), never taught as true or false; deities
# are always described with the respect their devotees give them. Topics guide
# the writers; story = the chapter's opening narrative hook.
#
# Units number 1–17 straight through the course; chapters 1–34. Sister
# courses: Buddhist Texts (bud), Chinese Classics (chn), World Religions (rel).

BANDS = [
 dict(id="k-2",   title="Grades K–2",   level="k2"),
 dict(id="3-5",   title="Grades 3–5",   level="35"),
 dict(id="6-8",   title="Grades 6–8",   level="68"),
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
]

UNITS = [
 # ══════════════════════════════ K–2 (units 1–3, chapters 1–6) ══════════════════════════════
 dict(n=1, band="k-2", title="Rama, Sita and Hanuman", strand="The Ramayana", chapters=[
  dict(n=1, title="Rama, Sita and the Golden Deer", strand="The Ramayana",
       topics="the Ramayana is a very old story from India, told for more than 2,000 years; Prince Rama, Princess Sita and Rama's brother Lakshmana; Rama keeps his father's promise and goes to live in the forest; a golden deer that is really a trick; Sita is carried away by Ravana, the ten-headed king of Lanka; keeping a promise even when it is hard; many Hindus honor Rama as a form of God.",
       story="A shining golden deer leaps through the forest, and Sita asks Rama to catch it"),
  dict(n=2, title="Hanuman the Brave Helper", strand="The Ramayana",
       topics="Hanuman, who leads the monkey army and is honored by many Hindus as a model of loyal help; he leaps across the sea to find Sita; the squirrel that helps build the bridge with tiny pebbles (a well-loved folk telling); Rama and Sita come home; lamps are lit to welcome them — the story many Hindus remember at Diwali; every helper counts.",
       story="A little squirrel rolls in the sand and shakes it onto a bridge of stones"),
 ]),
 dict(n=2, band="k-2", title="Krishna, Ganesha and the Stories Families Tell", strand="Story Time", chapters=[
  dict(n=3, title="Krishna and the Mountain", strand="Krishna Stories",
       topics="stories of Krishna as a child, loved by many Hindus: the butter he snuck from the pot and his mother Yashoda; the cowherd village; lifting Govardhan Hill like an umbrella to keep the village safe from a storm; Krishna is honored by many Hindus as a form of God; families tell these stories at Janmashtami, his birthday festival; sharing and keeping others safe.",
       story="Rain pours for days, and a boy holds up a whole hill on one finger"),
  dict(n=4, title="Ganesha and the Race Around the World", strand="Ganesha Stories",
       topics="Ganesha, with an elephant head, honored by many Hindus as the remover of obstacles and prayed to before new beginnings; the race with his brother Kartikeya around the world — Kartikeya flies off, Ganesha walks around his parents Shiva and Parvati and says they are his world; the mouse he rides; Ganesh Chaturthi; thinking in a new way; honoring parents.",
       story="Two brothers race around the whole world, and one of them never leaves the garden"),
 ]),
 dict(n=3, band="k-2", title="Lights, Colors and Kindness", strand="Festivals and Values", chapters=[
  dict(n=5, title="Diwali: The Festival of Lights", strand="Diwali",
       topics="Diwali, the festival of lights in autumn; little clay lamps (diyas), rangoli patterns, sweets, new clothes, visiting family; many Hindus remember Rama and Sita coming home, others remember Lakshmi or Krishna; Sikhs and Jains keep Diwali too for their own reasons; light as a sign of good winning over bad; families in Illinois celebrate it too; how a family might get ready, step by step.",
       story="A girl draws a rangoli flower by the front door and sets a tiny lamp in the middle"),
  dict(n=6, title="Holi, Namaste and Helping Others", strand="Values",
       topics="Holi, the spring festival of colors, when friends throw colored powder and make up; the story of Prahlada, a boy who stayed brave and kind; namaste — hands together, a greeting that many explain as honoring the good in the other person; ahimsa — not hurting any living thing; seva — helping others; sharing food; values the stories teach that all children can talk about.",
       story="Pink and green powder fills the air, and two old friends laugh and hug"),
 ]),

 # ══════════════════════════════ 3–5 (units 4–7, chapters 7–14) ══════════════════════════════
 dict(n=4, band="3-5", title="What the Hindu Texts Are", strand="The Library", chapters=[
  dict(n=7, title="Heard and Remembered: Shruti and Smriti", strand="Kinds of Text",
       topics="Hinduism has no single book but a great library; shruti (\"what is heard\") — the Vedas and Upanishads, which Hindus hold were heard by ancient seers (rishis); smriti (\"what is remembered\") — the epics (Ramayana, Mahabharata), the Bhagavad Gita inside the Mahabharata, the Puranas, the law books; different Hindus treasure different texts; the word Hindu and the name Sanatana Dharma (\"eternal way\") many Hindus use.",
       story="A grandmother tells her grandson that some words were heard and some were remembered"),
  dict(n=8, title="Sanskrit, Gurus and Memory", strand="How the Texts Traveled",
       topics="Sanskrit, the old language of most of the texts; the Vedas were passed down by memory for many centuries before writing, with special chanting methods so no syllable changed; UNESCO named Vedic chanting a Masterpiece of the Oral and Intangible Heritage of Humanity (2003); the guru and student; palm-leaf manuscripts; the texts retold in Tamil, Hindi and many other languages; today, comic books, TV and apps.",
       story="A boy repeats a line forward and backward until he knows every sound by heart"),
 ]),
 dict(n=5, band="3-5", title="The Ramayana", strand="Epic I", chapters=[
  dict(n=9, title="Valmiki's Poem: From Ayodhya to the Forest", strand="The Ramayana",
       topics="Valmiki, whom tradition calls the first poet; the poem's seven books (kandas), about 24,000 verses; Ayodhya, King Dasharatha and his promise to Queen Kaikeyi; Rama chooses exile for fourteen years; Bharata puts Rama's sandals on the throne; life in the forest; dharma — doing what is right for your role; Tulsidas retold the story in Hindi (1500s).",
       story="A brother carries a pair of sandals home and sets them on an empty throne"),
  dict(n=10, title="Lanka, Return and the Meaning of Dharma", strand="The Ramayana",
       topics="Sita taken to Lanka; Hanuman's search; the bridge; the battle with Ravana; Rama's return and rule (Rama Rajya as an ideal of fair rule); readers ask hard questions about how Sita is treated, and many retellings (including women's songs) answer differently; the Ramayana in Thailand (Ramakien), Indonesia and Cambodia; Ramlila plays.",
       story="A town in India puts on the whole Ramayana as a play that lasts ten nights"),
 ]),
 dict(n=6, band="3-5", title="The Mahabharata and the Gita", strand="Epic II", chapters=[
  dict(n=11, title="Two Families, One Kingdom", strand="The Mahabharata",
       topics="the Mahabharata, often called the longest poem in the world (about 100,000 verses in its longest versions), traditionally credited to Vyasa; the five Pandava brothers and their hundred Kaurava cousins; Draupadi; the dice game; exile; the war at Kurukshetra; a story about what is right when everyone has a reason; Ganesha as the scribe in a famous legend.",
       story="A game of dice goes wrong, and a family loses its kingdom in one afternoon"),
  dict(n=12, title="Arjuna's Question and Stories Inside the Story", strand="The Bhagavad Gita",
       topics="the Bhagavad Gita (\"song of the Lord\"), 18 chapters in the middle of the Mahabharata; Arjuna does not want to fight his relatives, and Krishna, his charioteer, answers; do your duty without being greedy for the reward — explained simply; stories inside the story: Savitri, who follows Death and wins back her husband's life; Nala and Damayanti; the Mahabharata's saying that it contains everything.",
       story="A bride walks behind Death himself and will not stop asking"),
 ]),
 dict(n=7, band="3-5", title="Key Teachings and Festivals", strand="Beliefs and Practice", chapters=[
  dict(n=13, title="Dharma, Karma, Samsara, Moksha", strand="Key Ideas",
       topics="dharma — duty, right way of living; karma — Hindus believe actions have results; samsara — the belief in rebirth; moksha — freedom from rebirth; Brahman — many Hindus speak of one ultimate reality seen in many forms (Vishnu, Shiva, Devi); the four aims of life; many paths — action, knowledge, devotion; each idea tied to a story the class already knows.",
       story="A girl plants a seed, and her grandfather says every action is a seed too"),
  dict(n=14, title="A Year of Festivals and a Temple Near Chicago", strand="Festivals",
       topics="the Hindu calendar follows the moon and sun; Diwali, Holi, Navaratri and Durga Puja, Janmashtami, Ganesh Chaturthi, Pongal; which stories each one remembers; puja at home and in the temple — murtis, flowers, lamps, prasad; the Hindu Temple of Greater Chicago in Lemont, Illinois, with its Rama temple; visiting respectfully — shoes off, quiet voices.",
       story="A class visits a temple in Lemont and leaves their shoes in neat rows at the door"),
 ]),

 # ══════════════════════════════ 6–8 (units 8–11, chapters 15–22) ══════════════════════════════
 dict(n=8, band="6-8", title="The Vedas", strand="Shruti I", chapters=[
  dict(n=15, title="Hymns of the Rig Veda", strand="Rig Veda",
       topics="the Rig Veda, 1,028 hymns in ten books (mandalas), composed c. 1500–1000 BCE by scholarly estimate; hymns to Agni (fire), Indra, Varuna, Ushas (dawn); the Gayatri mantra (3.62.10); the creation hymn that asks who really knows (10.129); Griffith's 1896 English translation; hymns as poetry and as ritual words; dating debates described without ruling.",
       story="At dawn a priest lights a fire and sings words older than any written book"),
  dict(n=16, title="Four Vedas, Ritual and an Unbroken Voice", strand="The Vedic Corpus",
       topics="the four Vedas — Rig, Sama (chanted melodies), Yajur (ritual formulas), Atharva (everyday charms and hymns); each has layers — Samhitas, Brahmanas, Aranyakas, Upanishads; the fire ritual (yajna); oral transmission and the patha methods; the Vedas' place in weddings and rites today; who was allowed to learn them in the past, and how that has changed.",
       story="A teacher and a student chant the same verse eleven different ways to lock it in memory"),
 ]),
 dict(n=9, band="6-8", title="The Upanishads", strand="Shruti II", chapters=[
  dict(n=17, title="Atman and Brahman: Teachers in the Forest", strand="Big Ideas",
       topics="the Upanishads (c. 800–200 BCE for the oldest), dialogues between teachers and students; atman — the self; Brahman — ultimate reality; the teaching that many readers render \"That art thou\" (Chandogya 6.8.7); \"Lead me from the unreal to the real\" (Brihadaranyaka 1.3.28); Max Müller's translations (SBE 1879/1884); Vedanta, \"end of the Veda\".",
       story="A father tells his son to dissolve salt in water and then find it"),
  dict(n=18, title="Stories of the Upanishads", strand="Dialogues",
       topics="Nachiketa, the boy who questions Death (Katha Upanishad); Svetaketu and his father Uddalaka (Chandogya 6); Satyakama, whose honesty about his birth makes him a student (Chandogya 4.4); Gargi questions Yajnavalkya in the king's court (Brihadaranyaka 3); Maitreyi asks what makes a person immortal; questioning as a way of learning.",
       story="A boy waits three days at Death's door, and Death offers him three wishes"),
 ]),
 dict(n=10, band="6-8", title="Epics, Puranas and Poets", strand="Smriti and Genre", chapters=[
  dict(n=19, title="Itihasa: Epic as Story and Teaching", strand="The Epics",
       topics="itihasa — \"so it was\", the epic genre; frame stories, stories nested in stories; the Mahabharata's eighteen books (parvas); the Ramayana's kandas; epics as teaching about dharma, kingship, friendship and loss; K.M. Ganguli's full English Mahabharata (1883–96) and Griffith's Ramayan (1870–74); regional versions (Kamban's Tamil Ramayana, the Ramcharitmanas).",
       story="A storyteller opens one story and, inside it, another, and inside that another"),
  dict(n=20, title="Puranas and the Bhakti Poets", strand="Devotion",
       topics="the Puranas — encyclopedic texts of stories, cosmology and worship (Bhagavata Purana, Vishnu Purana, Devi Mahatmya); ten avatars of Vishnu as the Puranas tell them; bhakti — loving devotion; poet-saints who sang in their own languages: the Alvars and Nayanars in Tamil, Mirabai, Kabir (claimed by several traditions), Tulsidas, Tukaram; devotion that crossed caste lines.",
       story="A queen leaves the palace singing, and people from every village sing her songs back"),
 ]),
 dict(n=11, band="6-8", title="Hindu Texts in History", strand="History", chapters=[
  dict(n=21, title="From the Indus to the Guptas", strand="Timeline",
       topics="the Indus cities (c. 2600–1900 BCE) and what is and is not known about their religion; the Vedic period; the age of the Upanishads, Buddha and Mahavira; the epics taking shape over centuries (c. 400 BCE–400 CE, scholarly estimates); the Gupta period and the Puranas; the law book of Manu (Manusmriti) and later criticism of it; scholars' dates beside traditional ones, both named.",
       story="Archaeologists find a small clay seal and argue for a hundred years about what it shows"),
  dict(n=22, title="Texts on the Move: Asia, Chicago and Today", strand="The Wider World",
       topics="Angkor Wat's Mahabharata and Ramayana carvings; Bali's Hindu communities; the Gita read by Emerson and Thoreau; Swami Vivekananda at the World's Parliament of Religions in Chicago, 1893; Gandhi and the Gita; Hindu Americans; the Hindu Temple of Greater Chicago in Lemont; the texts in film and on TV (the 1987–88 Ramayan series).",
       story="A young monk stands up in Chicago in 1893 and begins, \"Sisters and Brothers of America\""),
 ]),

 # ══════════════════════════════ 9–10 (units 12–14, chapters 23–28) ══════════════════════════════
 dict(n=12, band="9-10", title="Close Reading the Bhagavad Gita", strand="The Gita I", chapters=[
  dict(n=23, title="Arjuna's Despair and Krishna's Answer", strand="Gita 1–2",
       topics="the battlefield frame (Gita 1); Arjuna's grief and refusal; Krishna's first teaching: the self is not slain (2.19–2.22, the clothing image); steadiness of mind (2.47–2.48, 2.55–2.72, the sthitaprajna); Edwin Arnold's verse translation The Song Celestial (1885) quoted exactly; readers who take the battle literally and those who read it as an inner struggle — both described.",
       story="Arjuna drops his bow in the middle of two armies and sits down in the chariot"),
  dict(n=24, title="Action Without Clinging", strand="Gita 3–6",
       topics="karma yoga — act without attachment to the fruits (3.4–3.9, 3.19); \"better one's own duty, though imperfect\" (3.35); Krishna's teaching that he comes age after age when dharma declines (4.7–4.8), as the Gita says; knowledge and meditation (Gita 5–6); how Gandhi read these chapters; the ethics of doing one's work well; arguing with the text: duty and conscience.",
       story="A nurse at the end of a double shift reads Gita 3 on the train home"),
 ]),
 dict(n=13, band="9-10", title="Devotion, Vision and the Upanishads", strand="The Gita II and Upanishads", chapters=[
  dict(n=25, title="Devotion and the Universal Form", strand="Gita 9–12, 18",
       topics="bhakti in the Gita — \"a leaf, a flower, a fruit, water\" (9.26); the vision of the universal form (Gita 11) and Arjuna's awe; the qualities of the devotee (12.13–12.20); the final teaching (18.66) and how schools read it differently; Oppenheimer's famous quotation of 11.32 (his own wording, not Arnold's); the Gita's three paths as a map.",
       story="Arjuna asks to see Krishna as he truly is, and then asks him to stop"),
  dict(n=26, title="Katha, Chandogya and Isha: \"That Art Thou\"", strand="Upanishads",
       topics="Katha Upanishad — Nachiketa and Death, the chariot image of the self (1.3.3–4); Chandogya 6 — the salt in water, the banyan seed, tat tvam asi; Isha Upanishad 1 — the world pervaded, enjoy by renouncing; Müller's SBE translations quoted exactly; how to read a dialogue — who asks, who answers, what image carries the idea.",
       story="A banyan seed is split open, and the student is asked what he sees inside"),
 ]),
 dict(n=14, band="9-10", title="Hymns and Hard Cases", strand="Rig Veda and the Epics", chapters=[
  dict(n=27, title="The Hymn of Creation and the Purusha Hymn", strand="Rig Veda 10",
       topics="Nasadiya Sukta (10.129) — \"then was not non-existent nor existent\" and its closing doubt, in Griffith (1896); Purusha Sukta (10.90) — the cosmic person and the four varnas; how later tradition used 10.90 to justify caste and how reformers and scholars answer; reading ancient poetry carefully; a question-hymn beside a hierarchy-hymn.",
       story="A student reads a 3,000-year-old hymn that ends by asking whether even the highest one knows"),
  dict(n=28, title="Dharma Dilemmas: Dice, the Yaksha and Sita's Trial", strand="Epic Cases",
       topics="Yudhishthira's dice game and Draupadi's question in the assembly (Sabha Parva); the Yaksha's questions at the lake (Vana Parva) — \"what is the greatest wonder?\"; Karna's loyalties; Sita's fire ordeal (Yuddha Kanda) and her final return to the earth (Uttara Kanda) — how devotees, feminist readers and retellers (e.g. Chandrabati's Bengali Ramayana, 1500s) read them; dharma as subtle (\"sukshma\").",
       story="A queen dragged into a hall of kings asks one legal question no one can answer"),
 ]),

 # ══════════════════════════════ 11–12 (units 15–17, chapters 29–34) ══════════════════════════════
 dict(n=15, band="11-12", title="Interpreters Across the Centuries", strand="Interpretation", chapters=[
  dict(n=29, title="Shankara, Ramanuja, Madhva", strand="Vedanta Schools",
       topics="commentary (bhashya) as a genre; the \"triple foundation\" — Upanishads, Gita, Brahma Sutras; Shankara (c. 8th c.) and Advaita, non-dualism; Ramanuja (c. 11th–12th c.) and Vishishtadvaita, qualified non-dualism and devotion; Madhva (c. 13th c.) and Dvaita, dualism; the same verse (tat tvam asi; Gita 18.66) read three ways; paraphrase for all commentaries.",
       story="Three teachers, centuries apart, write three commentaries on the same four words"),
  dict(n=30, title="Modern Readers: Reform, Freedom and the West", strand="Modern Readings",
       topics="Ram Mohan Roy and the Upanishads against sati; Vivekananda's Vedanta; Tilak's activist Gita; Gandhi's Gita of nonviolence, and the question of how a war poem teaches nonviolence; Aurobindo; Emerson's \"Brahma\" and Thoreau at Walden; Ambedkar's critique of caste in the texts; readers inside and outside the tradition, none ranked.",
       story="Gandhi carries a small Gita to prison and calls it his mother"),
 ]),
 dict(n=16, band="11-12", title="Comparison and Critique", strand="Comparison", chapters=[
  dict(n=31, title="Caste, Gender and the Texts", strand="Critique and Reform",
       topics="varna and jati distinguished; the Purusha hymn, the Manusmriti and the epics' Shambuka and Ekalavya episodes; bhakti saints and reformers (Basava, Ravidas); Jyotirao Phule; B.R. Ambedkar and the 1927 burning of the Manusmriti; the Indian Constitution (1950) abolishing untouchability; women poets and scholars (Gargi, Mirabai, modern Sanskritists); described historically, with the many Hindu positions named.",
       story="In 1927 a lawyer holds a public burning of an old law book, and the argument has not stopped"),
  dict(n=32, title="The Gita Beside Other Scriptures", strand="Comparison",
       topics="duty and conscience: Gita 2–3 beside the Book of Job, the Dhammapada and the Analects; nonviolence: ahimsa in the Gita, Jain and Buddhist texts and the Sermon on the Mount; devotion: bhakti beside the Psalms and Sufi poetry; comparing without ranking; Thoreau, Gandhi, King — a chain of readers.",
       story="A letter from Gandhi reaches Tolstoy, and a book of Tolstoy's reached Gandhi first"),
 ]),
 dict(n=17, band="11-12", title="The Texts in Life, and Capstone", strand="Capstone", chapters=[
  dict(n=33, title="Texts in Performance, Art and Diaspora", strand="Living Texts",
       topics="Ramlila (on UNESCO's intangible heritage list, 2008); Kathakali and Bharatanatyam; temple carvings; Amar Chitra Katha comics; the 1987–88 Ramayan TV series; Diwali at the White House and in Chicago; Hindu American students and representation; appropriation versus appreciation (yoga, Om on merchandise) — described through Hindu voices.",
       story="A dance student in Naperville learns a Ramayana scene from her teacher's teacher's teacher"),
  dict(n=34, title="Capstone: A Passage, Its Readers and Your Argument", strand="Capstone",
       topics="choose one passage (a Gita verse, an Upanishad dialogue, a Rig Veda hymn, an epic episode); establish the text and translation; set its context; gather three readings (a classical commentator, a modern reader, a scholar); argue what the passage means for its readers and why they differ; cite exactly, attribute every belief; present to the class.",
       story="A student lays out three commentaries on one verse and finds they all begin with the same word"),
 ]),
]

# Practice rooms per unit: the Daily Drafts "hindu" spiral at the matching grade, plus the
# World Religions rooms and units that meet the same material.
def _dd(grade, label):
    return [("/drops/hindu/%s" % grade, "Daily Drafts — Hindu texts, grades %s" % label)]
LINKS = {
 1: _dd("K", "K–2") + [("/religions", "World Religions — every band")],
 2: _dd("1", "K–2") + [("/religions", "World Religions — every band")],
 3: _dd("2", "K–2") + [("/religions-course", "World Religions — the course")],
 4: _dd("3", "3–5") + [("/rel6", "World Religions unit 6 — Traditions of India and East Asia")],
 5: _dd("3", "3–5") + [("/rel6", "World Religions unit 6 — Traditions of India and East Asia")],
 6: _dd("4", "3–5") + [("/rel6", "World Religions unit 6 — Traditions of India and East Asia")],
 7: _dd("5", "3–5") + [("/religions-course", "World Religions — the course")],
 8: _dd("6", "6–8") + [("/r6", "Hinduism — the room"), ("/r1", "How to read a sacred text — the room")],
 9: _dd("7", "6–8") + [("/r6", "Hinduism — the room"), ("/rel11", "World Religions unit 11 — South and East Asian Traditions")],
 10: _dd("7", "6–8") + [("/r6", "Hinduism — the room")],
 11: _dd("8", "6–8") + [("/rel11", "World Religions unit 11 — South and East Asian Traditions"), ("/buddhist-texts-course", "Buddhist Texts — the course")],
 12: _dd("9-10", "9–10") + [("/r6", "Hinduism — the room"), ("/rel18", "World Religions unit 18 — Hinduism: Dharma, Karma and the Gita")],
 13: _dd("9-10", "9–10") + [("/r6", "Hinduism — the room"), ("/rel18", "World Religions unit 18 — Hinduism: Dharma, Karma and the Gita")],
 14: _dd("9-10", "9–10") + [("/r6", "Hinduism — the room")],
 15: _dd("11-12", "11–12") + [("/r6", "Hinduism — the room"), ("/r11", "One question, many lenses — the room")],
 16: _dd("11-12", "11–12") + [("/r11", "One question, many lenses — the room"), ("/rel23", "World Religions unit 23 — One Question, Many Lenses")],
 17: _dd("11-12", "11–12") + [("/r12", "World Religions capstone — the sources speak")],
}
