# World Religions, K–12 — the course arc. Our own wording: an academic,
# comparative study of religion for a public-school classroom — how to read a
# sacred text, then the major traditions through their own texts, then the
# questions they share. Topics guide the writers; story = the chapter's
# opening narrative hook.
#
# NUMBERING (2026-09-27): the 9–10 and 11–12 units keep their original numbers
# (units 1–12, chapters 1–24) because their pages, banners, short links and
# saved progress already exist. The K–2, 3–5 and 6–8 bands were added later
# and carry the NEXT numbers (units 13–24, chapters 25–48). The UNITS list is
# ordered by BAND, not by n, because the builder groups the contents page in
# list order — so K–2 prints first even though its numbers are higher. See
# _work/course/RELIGION_PLAN.md for the renumbering decision.

BANDS = [
 dict(id="k-2",   title="Grades K–2",   level="k2"),
 dict(id="3-5",   title="Grades 3–5",   level="35"),
 dict(id="6-8",   title="Grades 6–8",   level="68"),
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
]

UNITS = [
 # ══════════════════════════════ K–2 (units 13–15, chapters 25–30) ══════════════════════════════
 dict(n=13, band="k-2", title="Families and Their Special Days", strand="Holidays and Places", chapters=[
  dict(n=25, title="Special Days at Home", strand="Holidays",
       topics="different families keep different special days — Christmas, Hanukkah, Eid al-Fitr, Diwali, Lunar New Year, Vaisakhi; lights, food, gifts, songs and being together; some families keep none; every family's day is real to them; saying \"some families…\" and \"Muslims celebrate…\"; asking a friend kindly about their day.",
       story="Mia's class makes a calendar and finds a light on almost every month"),
  dict(n=26, title="Places Where People Gather", strand="Sacred Places",
       topics="a church, a synagogue, a mosque, a temple, a gurdwara — what each looks like from the street and inside; what people do there (sing, pray, read, eat together, learn); being a good guest — quiet voices, shoes off in some places, a covered head in others; a neighborhood walk in Chicago; not every family goes to one.",
       story="A walk down one Chicago street with five doors that open on Friday, Saturday and Sunday"),
 ]),
 dict(n=14, band="k-2", title="Stories People Keep", strand="Stories and Books", chapters=[
  dict(n=27, title="Old Stories from Many Lands", strand="Stories",
       topics="a story a community has told for a very long time — Noah and the big boat (Jews, Christians and Muslims tell it), the prince who saw an old man, a sick man and a monk (Buddhists tell it), the lamps that welcomed Rama home (Hindus tell it at Diwali), the man who shared his food with everyone (Sikhs tell of Guru Nanak); \"this is a story that ___ tell\"; what each story asks us to remember.",
       story="Grandpa says, \"Sit down, this is a story my grandpa told me\""),
  dict(n=28, title="Books People Keep Safe", strand="Sacred Books",
       topics="the Torah scroll, the Bible, the Qur'an and the Guru Granth Sahib as objects — how they are carried, covered, kept high, read aloud and sung; a scroll versus a book; clean hands and careful pages; a book can be special to one family and interesting to everyone; the school library keeps copies of all of them.",
       story="The librarian opens a glass case with four books that are never left on the floor"),
 ]),
 dict(n=15, band="k-2", title="Being Kind, Being Fair", strand="Living Together", chapters=[
  dict(n=29, title="Golden Rules", strand="Kindness",
       topics="\"treat others the way you want to be treated\" in many traditions' own simple words — Hillel, Jesus, the Prophet Muhammad, Confucius, the Buddha (paraphrased for young readers); sharing, helping and telling the truth; giving to people who need it — tzedakah, zakat, langar, charity; the same rule, many voices.",
       story="Six lunch boxes, one forgotten lunch, and what happens next"),
  dict(n=30, title="Quiet Time and Thank-You Time", strand="Practices",
       topics="ways families are quiet or say thank you — a prayer before a meal, a blessing over candles, kneeling on a rug five times a day, sitting still to breathe, a song, a moment of silence; some families do none of these; being respectful when someone else is quiet; what helps a person feel calm.",
       story="The classroom's one minute of quiet, and what each child does with it"),
 ]),

 # ══════════════════════════════ 3–5 (units 16–19, chapters 31–38) ══════════════════════════════
 dict(n=16, band="3-5", title="What Is a Religion?", strand="Method", chapters=[
  dict(n=31, title="Beliefs, Practices, Communities", strand="Studying Religion",
       topics="three parts most religions have — what people believe, what people do, and who they do it with; symbols (the cross, the star of David, the crescent, the om, the dharma wheel, the khanda); the words \"believe\", \"tradition\" and \"sacred\"; people who follow no religion; the difference between learning about a religion and being part of one; rules for talking about religion at school — describe, do not judge.",
       story="A poster project: five symbols, and the class finds out what each one means to the people who use it"),
  dict(n=32, title="A Year of Holidays", strand="Calendars",
       topics="calendars by the sun and by the moon; why Ramadan and Easter move and why Christmas does not; Rosh Hashanah, Yom Kippur, Passover; Christmas and Easter; Ramadan, Eid al-Fitr, Eid al-Adha; Diwali and Holi; Vesak; Vaisakhi; Lunar New Year; what each holiday remembers; a data look at a year of holidays.",
       story="Twelve months on one wall, with a sticker for every holiday the class can name"),
 ]),
 dict(n=17, band="3-5", title="Judaism, Christianity and Islam", strand="Traditions", chapters=[
  dict(n=33, title="Abraham's Family: Judaism and Christianity", strand="Judaism and Christianity",
       topics="Abraham, Moses and the story Jews tell of Sinai; one God, the Torah, the synagogue, Shabbat and kosher food; Jerusalem; Christians and the story they tell of Jesus — his teaching, the Good Samaritan, Christmas and Easter; the Bible's two parts; church, baptism, communion; Catholic, Orthodox and Protestant as three big families; how the two traditions share books and differ about Jesus.",
       story="Two cousins, one Passover table and one Easter table, and the same story of Moses at both"),
  dict(n=34, title="Islam: One God, Five Pillars", strand="Islam",
       topics="Muhammad as Muslims tell his story — Mecca, the cave, the message, Medina; the Qur'an in Arabic; Allah is the Arabic word for God; the Five Pillars in plain words — saying the faith, praying five times, giving, fasting in Ramadan, the pilgrimage to Mecca; the mosque, Friday prayer, Eid; Muslims in Chicago and across the world; Sunni and Shia as two big families.",
       story="A Ramadan sunset: the date, the water, the family at the table"),
 ]),
 dict(n=18, band="3-5", title="Traditions of India and East Asia", strand="Traditions", chapters=[
  dict(n=35, title="Hinduism and Buddhism", strand="Hinduism and Buddhism",
       topics="Hinduism — many ways to worship, many gods and one great spirit (Brahman) as Hindus describe it; the Ganges, temples, puja at home; Diwali and Holi; karma and reincarnation in simple words; Buddhism — the story of Prince Siddhartha; the Buddha's teaching that wanting too much brings unhappiness and the path that helps; monks, temples, meditation, Vesak; where Buddhists live today.",
       story="A boy lights a lamp for Diwali; a girl rings a bell at a temple on the North Side"),
  dict(n=36, title="Sikhism, Jainism, Confucius and the Dao", strand="More Traditions",
       topics="Guru Nanak and the Sikhs — one God, everyone equal, the langar meal, the turban and the five Ks, the gurdwara; the Jains — ahimsa, do no harm to any living thing; Confucius in China — respect for parents and teachers, sayings from the Analects in simple words; the Dao — going with the way of nature, yin and yang; Lunar New Year customs; how many people in Asia follow more than one of these.",
       story="A free meal where everyone, rich or poor, sits on the same floor"),
 ]),
 dict(n=19, band="3-5", title="Religion in Our Community", strand="Religion in Society", chapters=[
  dict(n=37, title="Neighbors of Many Faiths", strand="Community",
       topics="Chicago's houses of worship — churches, synagogues, mosques, temples, the Bahá'í House of Worship in Wilmette; the 1893 Parliament of Religions; freedom of religion in the First Amendment in plain words — the government does not pick a religion, and people may follow any or none; being a good neighbor — asking questions kindly, not teasing about food, clothes or holidays; interfaith helping projects.",
       story="A food drive run by a church, a mosque and a synagogue on the same block"),
  dict(n=38, title="Stories That Travel", strand="Oral Traditions",
       topics="traditions kept by telling, not by one book — the Potawatomi and Ojibwe of the Great Lakes, the Yoruba of West Africa; creation stories, the land and seasons as sacred, ancestors; some stories are shared and some are not for outsiders — asking permission; how religions traveled with people to Chicago — the Great Migration and its churches, immigrants and their temples and mosques.",
       story="An elder tells how the Great Lakes were made, and asks the class to remember it, not write it"),
 ]),

 # ══════════════════════════════ 6–8 (units 20–24, chapters 39–48) ══════════════════════════════
 dict(n=20, band="6-8", title="Studying Religion Like a Historian", strand="Method", chapters=[
  dict(n=39, title="Sources, Genres and Timelines", strand="Sources",
       topics="primary and secondary sources about a religion; scripture as a primary source — law, story, poetry, prophecy, letter, teaching; who wrote it, for whom, when, why; BCE and CE; a timeline of when the major traditions began; a map of where they began and where they are now; what a historian can say (what people believed and did) and cannot say (whether a belief is true).",
       story="Two students find two dates for the same founder and learn what \"c.\" means"),
  dict(n=40, title="Symbols, Rituals and Sacred Space", strand="Practice",
       topics="ritual — an action done the same way on purpose; rites of passage (birth, coming of age, marriage, death) across traditions; pilgrimage — Mecca, Jerusalem, Varanasi, Bodh Gaya, Amritsar, Rome; sacred space — cathedral, mosque, synagogue, mandir, stupa, gurdwara, and what each building's shape says; sacred time — the week, the fast, the feast.",
       story="Four buildings on one Chicago bus route, read from the outside in"),
 ]),
 dict(n=21, band="6-8", title="Judaism and Christianity in History", strand="Traditions", chapters=[
  dict(n=41, title="From Abraham to the Rabbis", strand="Judaism",
       topics="the Israelites' story as the Hebrew Bible tells it and as historians read it; the Temple in Jerusalem; exile in Babylon (586 BCE) and return; the Second Temple and its destruction (70 CE); rabbis, the Mishnah and the Talmud; synagogue, Torah, Shabbat, the holidays and the life cycle; Jewish communities in Europe, the Middle East and America; Orthodox, Conservative and Reform; antisemitism and the Holocaust, told factually.",
       story="A scroll carried out of a burning city, and a school that opened in its place"),
  dict(n=42, title="From Jesus to the Reformation and Beyond", strand="Christianity",
       topics="Judea under Rome; Jesus as the Gospels tell his story; the early church and Paul; persecution and Constantine (313 CE); the creeds; the East–West split (1054); monasteries, cathedrals and universities; the Reformation (1517) — Luther, Calvin, the printing press; Catholic, Orthodox and Protestant today; Christianity in the Americas, the Black church and the civil rights movement; Christianity in Chicago.",
       story="A letter from prison read aloud in Rome, and another read aloud in Birmingham"),
 ]),
 dict(n=22, band="6-8", title="Islam in History", strand="Traditions", chapters=[
  dict(n=43, title="Muhammad, the Qur'an and the First Community", strand="Islam",
       topics="Arabia before Islam; Muhammad's life as Muslims tell it — the first revelation (c. 610), Mecca, the hijra to Medina (622), the return; the Qur'an — surahs and ayahs, Arabic, recitation; the Five Pillars; the mosque, Ramadan and the two Eids; Sunni and Shia — the disagreement over leadership; the Islamic calendar.",
       story="A merchant who was called \"the trustworthy\" climbs a mountain outside Mecca"),
  dict(n=44, title="Caliphates, Learning and the Wider World", strand="Islamic Civilization",
       topics="the caliphates in outline — Rashidun, Umayyad, Abbasid; Baghdad's House of Wisdom, algebra, astronomy, medicine, paper; al-Andalus and Córdoba; trans-Saharan trade, Mali and Mansa Musa, Timbuktu; the Ottomans; Islam in South and Southeast Asia — Indonesia today; Muslims in America — from enslaved West Africans to Chicago's mosques.",
       story="A caravan of gold and books crosses the Sahara toward a city of scholars"),
 ]),
 dict(n=23, band="6-8", title="South and East Asian Traditions", strand="Traditions", chapters=[
  dict(n=45, title="Hinduism and Buddhism: Dharma, Karma, Awakening", strand="Hinduism and Buddhism",
       topics="the Vedas and the Upanishads; the Ramayana and the Mahabharata in outline; Brahman and the deities; dharma, karma, samsara and moksha; puja, temples, festivals; caste as history and as reform; the Buddha's life as tradition tells it; the Four Noble Truths and the Eightfold Path; Ashoka; the spread along the Silk Road; Theravada and Mahayana; Buddhism in Chicago.",
       story="A king who fought a terrible war and then carved his regret on pillars across India"),
  dict(n=46, title="Sikhism, Jainism, Confucianism, Daoism and Shinto", strand="East Asia and the Punjab",
       topics="Guru Nanak and the ten Gurus, the Guru Granth Sahib, the Khalsa, the langar; Mahavira, ahimsa and the Jain vows; Confucius and the Analects — ren, li, xiao; the civil-service examinations; Laozi and the Daodejing — wu wei, yin and yang; religious Daoism; Shinto — kami, shrines, festivals; how the three teachings blend in China and Buddhism with Shinto in Japan.",
       story="A shrine gate on a mountain path, a temple bell below it, and a family that visits both"),
 ]),
 dict(n=24, band="6-8", title="Traditions Without One Book, and Religion Today", strand="Religion in Society", chapters=[
  dict(n=47, title="Indigenous Traditions of Africa, the Americas and the Pacific", strand="Indigenous Traditions",
       topics="oral tradition as scripture; ancestors, the land and the seasons; the Yoruba orisha and divination; the diaspora — Santería, Candomblé, Vodou — formed under slavery; Native American traditions — many nations, many traditions; the Potawatomi, Ojibwe and Miami of the Great Lakes; Pacific traditions and tapu; suppression by colonizers, boarding schools, revival and the American Indian Religious Freedom Act (1978); respect and protocol.",
       story="A ceremony that was illegal in 1900 is held in the open in 2000"),
  dict(n=48, title="Religion, Rights and Living Together", strand="Religion and Society",
       topics="the First Amendment — Establishment and Free Exercise; teaching about religion in a public school; religious freedom and persecution around the world; the 1893 Parliament and Chicago's interfaith life; counting the world's religions — a data look, with why estimates differ; the nonreligious; when religion has divided and when it has united; disagreeing respectfully.",
       story="A courtroom, a classroom and a kitchen table where the same question comes up"),
 ]),

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

 # K–8 units (added 2026-09-27): no hub rooms yet — the Daily Drafts "Religions" spiral for the band, and the sister courses.
 13: [("/drops/religion/K", "Daily Drafts — Religions, grades K–2"), ("/bible", "The Bible — the course"), ("/quran", "The Qur'an — the course")],
 14: [("/drops/religion/1", "Daily Drafts — Religions, grades K–2"), ("/bible", "The Bible — the course"), ("/talmud", "Talmud Study — the course")],
 15: [("/drops/religion/2", "Daily Drafts — Religions, grades K–2"), ("/hebrew-bible", "The Hebrew Bible — the course")],
 16: [("/drops/religion/3", "Daily Drafts — Religions, grades 3–5"), ("/r1", "How to read a sacred text — the room")],
 17: [("/drops/religion/4", "Daily Drafts — Religions, grades 3–5"), ("/bible", "The Bible — the course"), ("/quran", "The Qur'an — the course")],
 18: [("/drops/religion/5", "Daily Drafts — Religions, grades 3–5"), ("/r6", "Hinduism — the room"), ("/r7", "Buddhism — the room")],
 19: [("/drops/religion/5", "Daily Drafts — Religions, grades 3–5"), ("/r10", "Religion and the world — the room")],
 20: [("/drops/religion/6", "Daily Drafts — Religions, grades 6–8"), ("/r1", "How to read a sacred text — the room")],
 21: [("/drops/religion/7", "Daily Drafts — Religions, grades 6–8"), ("/hebrew-bible", "The Hebrew Bible — the course"), ("/talmud", "Talmud Study — the course"), ("/bible", "The Bible — the course")],
 22: [("/drops/religion/7", "Daily Drafts — Religions, grades 6–8"), ("/quran", "The Qur'an — the course"), ("/r5", "Islam — the room")],
 23: [("/drops/religion/8", "Daily Drafts — Religions, grades 6–8"), ("/r6", "Hinduism — the room"), ("/r8", "Confucianism and Daoism — the room")],
 24: [("/drops/religion/8", "Daily Drafts — Religions, grades 6–8"), ("/r9", "Traditions of Africa and the Americas — the room"), ("/r10", "Religion and the world — the room")],
}
