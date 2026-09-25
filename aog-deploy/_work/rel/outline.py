# World Religions, Grades 9–12 — the course arc. Our own wording: an academic,
# comparative study of religion for a public-school classroom — how to read a
# sacred text, then the major traditions through their own texts, then the
# questions they share. Topics guide the writers; story = the chapter's
# opening narrative hook.
#
# Units number 1–12 straight through the course; chapters 1–24. Each unit
# grows out of one existing room on religions-hub.html (LINKS below).

BANDS = [
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
]

UNITS = [
 # ══════════════════════════════ 9–10 ══════════════════════════════
 dict(n=1, band="9-10", title="How to Read a Sacred Text", strand="Method", chapters=[
  dict(n=1, title="Author, Audience, Purpose", strand="Reading Method",
       topics="what makes a text sacred to a community; who wrote it, for whom, when and why; oral tradition before writing; scrolls, codices and canons — how a community decides what is in; genre — law, story, poetry, prophecy, letter, teaching; the difference between studying a text and practicing a faith; the academic study of religion in a public school.",
       story="A museum case: a Torah scroll, a Qur'an, a palm-leaf manuscript"),
  dict(n=2, title="Translation, Context and Interpretation", strand="Interpretation",
       topics="every translation is an interpretation — the same verse in two English versions; literal, allegorical and contextual readings; how communities interpret (rabbis, church councils, ulama, gurus); historical context; comparing traditions fairly — describe, attribute, do not rank; the 1893 World's Parliament of Religions in Chicago; a toolkit for the rest of the course.",
       story="Two students, two Bibles, one verse that reads differently"),
 ]),
 dict(n=2, band="9-10", title="The Biblical Lens I: The Hebrew Bible", strand="Texts", chapters=[
  dict(n=3, title="Creation, Covenant and Exodus", strand="Torah",
       topics="the Tanakh's three parts (Torah, Nevi'im, Ketuvim); Genesis — creation, Adam and Eve, Noah, Abraham's covenant; Exodus — Moses, the plagues, Passover, Sinai and the Ten Commandments; the law in Leviticus and Deuteronomy; the world as made, fallen and called; how Jews and Christians read these books differently.",
       story="A family reads the Passover story at a Seder table in Skokie"),
  dict(n=4, title="Prophets, Psalms and Wisdom", strand="Prophets and Writings",
       topics="kings and prophets — Samuel, David, Solomon, Elijah; Isaiah, Jeremiah, Amos and the call to justice; the exile in Babylon (586 BCE) and the return; the Psalms as prayer and poetry; Proverbs, Job and Ecclesiastes — wisdom and suffering; Ruth and Esther; how these texts are used in worship today.",
       story="A psalm sung in three languages in one week"),
 ]),
 dict(n=3, band="9-10", title="The Biblical Lens II: The New Testament", strand="Texts", chapters=[
  dict(n=5, title="The Gospels and the Parables", strand="Gospels",
       topics="the Roman world of first-century Judea; the four Gospels and how they differ; the life of Jesus as the Gospels tell it — teaching, healing, the Sermon on the Mount, parables (the Good Samaritan, the Prodigal Son, the Sower); the Passion and the resurrection as Christians believe it; the Kingdom of God.",
       story="A parable retold on a Chicago bus"),
  dict(n=6, title="Paul, the Letters and the Early Church", strand="Letters",
       topics="Acts and the spread of the church; Paul's conversion and journeys; the letters — Romans, Corinthians, Galatians — on faith, grace, love and community; Revelation as apocalyptic writing; how the New Testament canon formed; the creeds; how Christians read the whole Bible through the New Testament; Catholic, Orthodox and Protestant branches in brief.",
       story="A letter read aloud to a house church in Corinth"),
 ]),
 dict(n=4, band="9-10", title="Judaism: Torah, Talmud and a People", strand="Traditions", chapters=[
  dict(n=7, title="Covenant, Sabbath and the Calendar", strand="Jewish Belief and Practice",
       topics="one God, covenant and chosenness as Jews understand it; the Shema; the Sabbath — from Friday sunset, rest, the meal, the synagogue; the Jewish calendar and holidays — Rosh Hashanah, Yom Kippur, Sukkot, Hanukkah, Purim, Passover, Shavuot; kosher food; life-cycle events — brit milah, bar and bat mitzvah, marriage, mourning.",
       story="Friday sunset: the candles are lit and the phones go dark"),
  dict(n=8, title="The Talmud and Jewish Life Through History", strand="Jewish History",
       topics="the Second Temple and its destruction (70 CE); the rabbis, the Mishnah and the Talmud — reasoning by argument; Sephardi and Ashkenazi communities; life under Islam and Christendom; expulsions and ghettos; the Enlightenment and Orthodox, Conservative, Reform and Reconstructionist movements; the Holocaust; Israel and the diaspora; Jewish Chicago.",
       story="A page of Talmud with the argument printed around the text"),
 ]),
 dict(n=5, band="9-10", title="Islam: The Qur'an and the Five Pillars", strand="Traditions", chapters=[
  dict(n=9, title="Revelation, the Prophet and the Pillars", strand="Islamic Belief and Practice",
       topics="Arabia before Islam; Muhammad as Muslims understand him — the first revelation (c. 610), Mecca and Medina, the hijra (622); the Qur'an — its structure, recitation and translation; tawhid; the Five Pillars — shahada, salat, zakat, sawm in Ramadan, hajj; Eid al-Fitr and Eid al-Adha; the mosque; halal.",
       story="Ramadan in a Chicago high school: the fast, the iftar"),
  dict(n=10, title="Hadith, Law and the Golden Age", strand="Islamic Civilization",
       topics="the Hadith and the Sunnah; sharia as scholars describe it and its schools; Sunni and Shia — the split over succession; Sufism; the golden age — Baghdad's House of Wisdom, Córdoba, Timbuktu; algebra, astronomy, medicine and the transmission of Greek learning; Islamic art and calligraphy; Muslims in America and in Chicago today.",
       story="A manuscript copied in Baghdad, read in Córdoba, kept in Timbuktu"),
 ]),
 dict(n=6, band="9-10", title="Hinduism: Dharma, Karma and the Gita", strand="Traditions", chapters=[
  dict(n=11, title="The Vedas and the Many Paths", strand="Hindu Belief",
       topics="Hinduism as a family of traditions; the Vedas and the Upanishads — Brahman and atman; samsara, karma, dharma, moksha; the many deities and the one — Vishnu, Shiva, Devi, Ganesha; the paths of knowledge, devotion, action and meditation; puja, temples and festivals — Diwali, Holi; caste as history and as a matter of reform.",
       story="Diwali lamps on a windowsill in Devon Avenue's neighborhood"),
  dict(n=12, title="Arjuna's Question: The Bhagavad Gita", strand="The Gita",
       topics="the Mahabharata and the Ramayana in outline; the Gita's setting — Arjuna on the battlefield; duty and doubt; Krishna's teaching on action without attachment, devotion and the self; readings from Edwin Arnold's 1885 translation; Gandhi and the Gita; how the Gita is read today; yoga's roots and modern forms.",
       story="A chariot stops between two armies, and a warrior lowers his bow"),
 ]),

 # ══════════════════════════════ 11–12 ══════════════════════════════
 dict(n=7, band="11-12", title="Buddhism: The Four Noble Truths", strand="Traditions", chapters=[
  dict(n=13, title="The Buddha and the Middle Way", strand="Buddhist Teaching",
       topics="Siddhartha Gautama's life as tradition tells it (c. 5th century BCE) — the four sights, renunciation, awakening under the bodhi tree; the Four Noble Truths — suffering, its cause, its end, the path; the Eightfold Path; the Three Marks — impermanence, suffering, non-self; the Three Jewels; meditation and mindfulness; the Dhammapada in Müller's translation.",
       story="A prince sees an old man, a sick man, a corpse and a monk"),
  dict(n=14, title="Sangha, Schools and the Spread of Buddhism", strand="Buddhist History",
       topics="the sangha and the monastery; Ashoka and the spread from India; Theravada in Sri Lanka and Southeast Asia; Mahayana — bodhisattvas, compassion, Zen in Japan, Pure Land; Vajrayana in Tibet and the Dalai Lama; Buddhism's meeting with Confucianism and Daoism in China; Buddhism in America and in Chicago's temples.",
       story="A temple bell in Kyoto and one on Chicago's North Side"),
 ]),
 dict(n=8, band="11-12", title="Confucianism and Daoism", strand="Traditions", chapters=[
  dict(n=15, title="The Analects: Family, Ritual and the Good Ruler", strand="Confucianism",
       topics="China in the Zhou era and the Warring States; Confucius (551–479 BCE) and the Analects (Legge's translation); ren, li, xiao and the junzi; the five relationships; education and the civil-service examinations; ancestor veneration; Confucianism as philosophy, ethics and religion; its place in East Asia today.",
       story="A student asks the Master what a good son owes his parents"),
  dict(n=16, title="The Daodejing: The Way That Cannot Be Named", strand="Daoism",
       topics="Laozi as tradition tells it and the Daodejing (Legge's translation); the Dao, wu wei and naturalness; yin and yang; Zhuangzi's stories; religious Daoism — temples, priests, immortality, the Daoist canon; Chinese popular religion and the blending of the three teachings; Daoist ideas in art, medicine and martial arts.",
       story="Water, the softest thing, wears down the hardest stone"),
 ]),
 dict(n=9, band="11-12", title="Sikhism, Jainism, and the Traditions of Africa and the Americas", strand="Traditions", chapters=[
  dict(n=17, title="The Guru Granth Sahib and Ahimsa", strand="Sikhism and Jainism",
       topics="Guru Nanak (1469–1539) and the ten Gurus; the Guru Granth Sahib as the living Guru; one God, equality, seva and the langar; the Khalsa and the five Ks; the gurdwara; Sikhs in America and the Chicago area; Jainism — Mahavira (c. 6th century BCE), ahimsa, the five vows, the Jain view of karma and liberation; Jain influence on Gandhi.",
       story="A free meal served to everyone who sits down, side by side"),
  dict(n=18, title="Oral Traditions That Keep the World in Story", strand="Indigenous Traditions",
       topics="traditions without a single book — African religions (Yoruba orisha, ancestors, divination; the diaspora in Santería and Candomblé), and Native American traditions (creation stories, the sacred in land and season, ceremonies, the Ojibwe and Potawatomi of the Great Lakes); story, song and ceremony as scripture; respect, protocol and what is not for outsiders; colonization, suppression and revival; the American Indian Religious Freedom Act (1978).",
       story="An elder tells the story of how the land was made, and asks that it not be written down"),
 ]),
 dict(n=10, band="11-12", title="Religion and the World", strand="Religion in Society", chapters=[
  dict(n=19, title="Law, Art, Science and Charity", strand="Religion and Culture",
       topics="religion and law — from the Code of Hammurabi and Torah law to sharia, canon law and the U.S. First Amendment; religion and art — temples, cathedrals, mosques, calligraphy, icons, music; religion and science — Islamic astronomy, monastic scholarship, Galileo, Darwin and the range of religious responses; charity and service — zakat, tzedakah, Christian charity, seva, dana; hospitals, schools and relief organizations.",
       story="A hospital founded by nuns, a food pantry run by a mosque, a school built by a gurdwara"),
  dict(n=20, title="Conflict, Peace and Religious Freedom", strand="Religion and Conflict",
       topics="when religion has been part of conflict — the Crusades, the Thirty Years' War, the partition of India, Northern Ireland — and when it has been part of peace — Gandhi, King, Tutu, interfaith work; religious freedom — the First Amendment, the Establishment and Free Exercise clauses, religion in public schools (what is allowed: teaching about religion), persecution today; the 1893 Parliament and Chicago's interfaith life.",
       story="A march in Selma with a rabbi, a minister and a Greek Orthodox archbishop in the front row"),
 ]),
 dict(n=11, band="11-12", title="One Question, Many Lenses", strand="Comparative", chapters=[
  dict(n=21, title="What Is a Good Life? What Is Justice?", strand="Ethics Compared",
       topics="each tradition's answer in its own words — the Torah's commandments and the prophets; the Sermon on the Mount; the Qur'an on justice and mercy; dharma and the Gita; the Eightfold Path and compassion; ren and the Dao; Sikh seva; secular ethics alongside; side-by-side readings; what they share and where they differ.",
       story="Six students, six traditions, one question on the board"),
  dict(n=22, title="What Happens When We Die? Why Is There Suffering?", strand="Meaning Compared",
       topics="resurrection and judgment in Judaism, Christianity and Islam (with their internal variety); samsara, karma and rebirth in Hinduism, Buddhism, Jainism and Sikhism; ancestors in African and Chinese traditions; Job, the Buddha's first truth, the cross, the Qur'an on trial, karma — how each tradition speaks to suffering; mourning practices compared; secular and humanist views.",
       story="A grandmother's funeral, and the questions the cousins ask afterward"),
 ]),
 dict(n=12, band="11-12", title="Capstone: The Sources Speak", strand="Capstone", chapters=[
  dict(n=23, title="Posing the Question and Gathering the Texts", strand="Research",
       topics="choosing a question worth asking (about work, family, forgiveness, the natural world, wealth, war); finding primary texts from three traditions in reliable public-domain and modern translations; reading with the author-audience-purpose toolkit; quoting and citing sacred texts (book, chapter, verse; sura and ayah; chapter and verse of the Dhammapada); note-taking; avoiding stereotype and overgeneralization.",
       story="A student picks the question that has been bothering her since unit 2"),
  dict(n=24, title="Arguing What Each Would Say", strand="Presentation",
       topics="a thesis about what each tradition would say and why; using evidence — the text, its context, how adherents read it; acknowledging diversity within a tradition; comparing without ranking; respectful language; the written essay and the oral presentation; answering questions; a rubric; reflection on what the study of religion is for.",
       story="Three traditions, three texts, one carefully argued answer"),
 ]),
]

# Rooms already on the site that belong to each unit — nothing gets deleted.
LINKS = {
 1: [("/r1", "How to read a sacred text — cards, hints and a quiz")],
 2: [("/r2", "The Hebrew Bible — the room")],
 3: [("/r3", "The New Testament — the room")],
 4: [("/r4", "Judaism — the room")],
 5: [("/r5", "Islam — the room")],
 6: [("/r6", "Hinduism — the room")],
 7: [("/r7", "Buddhism — the room")],
 8: [("/r8", "Confucianism and Daoism — the room")],
 9: [("/r9", "Sikhism, Jainism, and the traditions of Africa and the Americas — the room")],
 10: [("/r10", "Religion and the world — the room")],
 11: [("/r11", "One question, many lenses — the room")],
 12: [("/r12", "Capstone — the sources speak")],
}
