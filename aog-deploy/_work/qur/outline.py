# The Qur'an, K–12 — the course arc. Our own wording: the Qur'an studied in
# a public-school classroom — what the book is and the stories it tells (K–2),
# its shape and the Prophet's life as context (3–5), its structure, themes and
# recitation tradition (6–8), close reading of surahs with the commentators,
# the Qur'an and the Bible, interpretation, law and art (9–12). Read from
# public-domain translations (Pickthall 1930; Rodwell 1861; Palmer 1880; Sale
# 1734), always described ("Muslims believe…", "the Qur'an says…"), never
# taught as true or false. Topics guide the writers; story = the chapter's
# opening narrative hook.
#
# Units number 1–17 straight through the course; chapters 1–34. Sister
# courses: World Religions (rel), The Bible (bib), The Hebrew Bible (heb),
# Talmud Study (tal).

BANDS = [
 dict(id="k-2",   title="Grades K–2",   level="k2"),
 dict(id="3-5",   title="Grades 3–5",   level="35"),
 dict(id="6-8",   title="Grades 6–8",   level="68"),
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
]

UNITS = [
 # ══════════════════════════════ K–2 (units 1–3, chapters 1–6) ══════════════════════════════
 dict(n=1, band="k-2", title="A Book Called the Qur'an", strand="The Book", chapters=[
  dict(n=1, title="What the Qur'an Is", strand="The Book",
       topics="the Qur'an is the holy book of Muslims; Muslims believe its words came from God to a man named Muhammad; it is written in Arabic and read right to left; families keep it high on a shelf, wrapped or in a case, and wash their hands before reading; it is read aloud and sung more than read silently; many Muslim families live in Chicago; \"Muslims believe\" and \"the Qur'an says\".",
       story="Amira's grandfather takes a green book down from the highest shelf"),
  dict(n=2, title="Surahs and Ayahs", strand="Chapters and Verses",
       topics="a chapter is a surah and there are 114; a line is an ayah; the first surah is Al-Fatiha, \"The Opening\", seven short lines; some surahs are named after animals — The Cow, The Bee, The Ant, The Elephant; long surahs near the front, short ones at the back; children learn the short ones first; a book of chapters like a shelf of drawers.",
       story="A surah named after a bee, and another named after an elephant"),
 ]),
 dict(n=2, band="k-2", title="Muhammad and the First Words", strand="The Prophet's Story", chapters=[
  dict(n=3, title="A Boy in Mecca", strand="Muhammad",
       topics="Mecca, a desert city with a square building called the Kaaba; Muhammad was born there about 1,450 years ago; his parents died and his grandfather and uncle raised him; he cared for sheep and camels; people called him \"the trustworthy\"; he married Khadijah; he liked to go to a quiet cave on a mountain to think; Muslims tell this story with love.",
       story="A boy watches the camel caravans come and go from a city in the desert"),
  dict(n=4, title="The Cave and the Word \"Read\"", strand="The First Revelation",
       topics="Muslims believe that in the cave an angel named Jibril (Gabriel) came and said \"Read!\" (Iqra); Muhammad was afraid and ran home to Khadijah, who comforted him; more words came over many years; friends learned them by heart; the words became the Qur'an; a prophet is a person who brings a message; Muslims say \"peace be upon him\" after his name.",
       story="A man runs down a mountain at night and asks his wife to wrap him in a blanket"),
 ]),
 dict(n=3, band="k-2", title="Words Muslims Say Every Day", strand="Words and Stories", chapters=[
  dict(n=5, title="Bismillah and Alhamdulillah", strand="Everyday Words",
       topics="almost every surah begins \"In the name of God, the Most Gracious, the Most Merciful\" — the Bismillah; Muslims say it before eating, starting work or a trip; \"Alhamdulillah\" means \"thanks be to God\"; \"Allah\" is the Arabic word for God; \"As-salamu alaykum\" — peace be upon you; the Qur'an says to be kind to parents, to share and to tell the truth; words you might hear a friend say.",
       story="Before the first bite of lunch, Yusuf whispers four words"),
  dict(n=6, title="Stories the Qur'an Tells", strand="Stories",
       topics="the Qur'an tells stories about people the Bible tells about too — Nuh (Noah) and the ark, Yunus (Jonah) and the big fish, Musa (Moses) in the basket and at the sea, Ibrahim (Abraham) who built the Kaaba with his son Ismail, Maryam (Mary) and her baby Isa (Jesus); the ant who warned her friends about Sulayman's (Solomon's) army; \"the Qur'an tells this story\"; stories that many families share.",
       story="A tiny ant tells the other ants to hurry home before the king's army marches past"),
 ]),

 # ══════════════════════════════ 3–5 (units 4–7, chapters 7–14) ══════════════════════════════
 dict(n=4, band="3-5", title="The Shape of the Qur'an", strand="Structure", chapters=[
  dict(n=7, title="114 Surahs, 30 Parts", strand="Structure",
       topics="114 surahs, about 6,200 ayahs; the 30 parts (juz') so the whole book can be read in a month; Meccan and Medinan surahs — where they were revealed; the order is roughly longest to shortest, not the order they came; Al-Fatiha, the Throne Verse (2:255), Surah Al-Ikhlas (112) in simple words; the Bismillah at the head of every surah but one; the book's Arabic name means \"the recitation\".",
       story="Thirty bookmarks, one for each night of Ramadan"),
  dict(n=8, title="Reciting, Memorizing and Writing It Beautifully", strand="Recitation",
       topics="the Qur'an was spoken before it was a book; reciting with care (tajwid); a person who knows the whole book by heart is a hafiz — children and adults, all over the world; recitation in Ramadan nights; the mushaf — the written copy; Arabic calligraphy — the words made beautiful because pictures of God and prophets are not made; the Qur'an in translation and why Muslims still read the Arabic.",
       story="A ten-year-old in Chicago recites a whole surah from memory, and her class listens"),
 ]),
 dict(n=5, band="3-5", title="The Life of the Prophet as Context", strand="Seerah", chapters=[
  dict(n=9, title="Mecca: The Message and the Hard Years", strand="Mecca",
       topics="Arabia before Islam — tribes, trade, many gods at the Kaaba; the first revelation (c. 610) as Muslims tell it; the message — one God, be fair, care for the poor and orphans; the first Muslims — Khadijah, Ali, Abu Bakr, Bilal; the leaders of Mecca get angry; boycott and hard years; some Muslims go to Abyssinia, where a Christian king protects them; the Night Journey as Muslims tell it.",
       story="A freed man named Bilal climbs to a rooftop and calls the first Muslims to prayer"),
  dict(n=10, title="Medina: The Hijra and a Community", strand="Medina",
       topics="the invitation from Yathrib; the hijra (622) — the Islamic calendar starts here; the first mosque; the agreement with the tribes of Medina, including Jewish tribes; battles and treaties in outline (Badr, Uhud, Hudaybiyyah), told factually; the return to Mecca (630) and the clearing of the Kaaba; the farewell sermon — fairness and equality; the Prophet's death (632); the Qur'an gathered into one book after him.",
       story="A city changes its name to \"the City of the Prophet\""),
 ]),
 dict(n=6, band="3-5", title="Prophets in the Qur'an", strand="Stories", chapters=[
  dict(n=11, title="Adam, Nuh, Ibrahim and Yusuf", strand="The Early Prophets",
       topics="Muslims believe God sent many prophets and the Qur'an names 25; Adam, the first; Nuh and the ark; Ibrahim — smashing the idols, the test with his son, building the Kaaba with Ismail, and why Muslims celebrate Eid al-Adha; Yusuf — the whole story in one surah (12), \"the best of stories\"; how the Qur'an's telling and the Bible's telling are alike and different.",
       story="A boy tells his father about a dream of eleven stars, the sun and the moon bowing"),
  dict(n=12, title="Musa, Maryam, Isa and Muhammad", strand="The Later Prophets",
       topics="Musa — the prophet named most often in the Qur'an; the basket, the burning bush, Pharaoh, the sea; Maryam — a whole surah (19) with her name; Muslims believe Isa was a prophet born of Maryam, who healed and taught; the Qur'an on Jews and Christians as People of the Book; Muhammad as the last prophet, the \"seal\"; a prophet timeline the three religions share.",
       story="A surah named for a woman, read aloud to a Christian king in Abyssinia"),
 ]),
 dict(n=7, band="3-5", title="What the Qur'an Teaches", strand="Themes", chapters=[
  dict(n=13, title="One God, and Being Good", strand="Belief and Character",
       topics="tawhid — there is one God; the 99 names (the Merciful, the Kind, the Just); the Qur'an says to honor parents, be honest, keep promises, care for orphans and the poor, and not to boast; Luqman's advice to his son (31:13–19) in simple words; angels, the Day of Judgment and paradise as Muslims believe; \"Muslims believe\" every time.",
       story="A wise man walks with his son and gives him seven pieces of advice"),
  dict(n=14, title="Prayer, Fasting and the Pillars in the Qur'an", strand="Practice",
       topics="the Five Pillars and where the Qur'an speaks of them — the shahada, prayer five times facing Mecca, zakat (giving a share), fasting in Ramadan (2:185), hajj to Mecca; the mosque, wudu, Friday prayer; Eid al-Fitr and Eid al-Adha; halal food; how a Muslim child's day and year go; Muslims in Chicago and around the world (about 1.9 billion, estimates vary).",
       story="The first crescent moon of Ramadan is spotted, and phones light up across the city"),
 ]),

 # ══════════════════════════════ 6–8 (units 8–11, chapters 15–22) ══════════════════════════════
 dict(n=8, band="6-8", title="Structure, Style and Recitation", strand="The Text", chapters=[
  dict(n=15, title="Surah, Ayah, Juz': Order, Names and Style", strand="Structure and Style",
       topics="114 surahs, their names and how they were named; Meccan surahs — short, rhythmic, oaths, the Last Day; Medinan surahs — longer, law, community; the mysterious letters; rhymed prose (saj'), refrains (\"Which of your Lord's favors will you deny?\" in Surah 55), parables and signs (ayat); the seven oft-repeated verses; why the order is not chronological; a map of the book.",
       story="Two surahs on facing pages: one is three lines long, the other runs for forty"),
  dict(n=16, title="From Voice to Page: Collection, Script and Tajwid", strand="Transmission",
       topics="memorizers and scribes in the Prophet's lifetime; the collection under Abu Bakr and the standard copy under Uthman (c. 650), as Muslim tradition tells it; early manuscripts — the Birmingham folios (radiocarbon-dated to the 7th century), the Sana'a manuscript; Arabic script and the adding of dots and vowel marks; the readings (qira'at), Hafs and Warsh; tajwid rules; the printed Cairo edition (1924); the Qur'an as sound first.",
       story="A librarian in Birmingham finds that two pages in her collection are older than she thought"),
 ]),
 dict(n=9, band="6-8", title="Seerah: Mecca, Medina and the Occasions of Revelation", strand="Context", chapters=[
  dict(n=17, title="Arabia Before Islam and the Meccan Period", strand="Mecca",
       topics="Arabia c. 600 — tribes, trade routes, Byzantium and Persia, Jews and Christians in Arabia, the Kaaba and its gods; Muhammad's life to 622 as Muslim tradition (the sira of Ibn Ishaq, c. 760) tells it; the first revelation (96:1–5); the message and the opposition; the Meccan surahs' themes — one God, judgment, justice for the weak; the Night Journey; what historians can and cannot confirm.",
       story="A caravan city where a merchant's word was his bond — and one merchant's word changed everything"),
  dict(n=18, title="Medina, the Community and the Occasions of Revelation", strand="Medina",
       topics="the hijra and the Constitution of Medina; the mosque and the ummah; Badr, Uhud, the Trench and the treaty of Hudaybiyyah in outline; relations with the Jewish tribes told factually; the conquest of Mecca and the farewell pilgrimage; asbab al-nuzul — the occasions of revelation, and how they change a reading; Medinan surahs' themes — law, family, community, other peoples of the Book.",
       story="A verse comes after a dispute in the marketplace, and the dispute is what the verse is about"),
 ]),
 dict(n=10, band="6-8", title="Major Themes", strand="Themes", chapters=[
  dict(n=19, title="God, Creation, Signs and the Last Day", strand="Belief",
       topics="tawhid and the 99 names; the Qur'an on creation — the heavens and the earth, the signs (ayat) in nature; angels and jinn as the Qur'an describes them; prophets and books — Torah, Psalms, Gospel, Qur'an; the Day of Judgment, the scales, paradise and hell as the Qur'an describes them; mercy as the most repeated attribute; the Throne Verse and Surah Al-Ikhlas close up (Pickthall).",
       story="A verse says to look at the camel, the sky, the mountains and the earth — and asks why"),
  dict(n=20, title="Law and Ethics: Justice, Charity, Family, Food, War and Peace", strand="Ethics",
       topics="the Qur'an's ethical core — justice, honesty, kindness to parents and neighbors, care for orphans and the poor; zakat and sadaqah; family law in outline and how it is interpreted; halal and haram; the verses on fighting and their contexts (2:190, 2:256 \"no compulsion in religion\", 5:32) and how scholars read them; forgiveness and patience; the difference between the Qur'an, hadith and later law.",
       story="A student reads one verse alone, then with the verse before and after it, and it changes"),
 ]),
 dict(n=11, band="6-8", title="Reading with the Tradition", strand="Interpretation and Civilization", chapters=[
  dict(n=21, title="Hadith, Sunnah and Tafsir: How Muslims Interpret", strand="Interpretation",
       topics="the Sunnah and the hadith collections (Bukhari, Muslim) and how they were tested; tafsir — commentary — al-Tabari (d. 923), Ibn Kathir (d. 1373); clear and ambiguous verses (3:7); abrogation (naskh) as scholars debate it; Sunni and Shia readings; Sufi readings; the ulama and the schools of law; reading a verse with two commentaries side by side.",
       story="A commentary forty volumes long on a book you can carry in one hand"),
  dict(n=22, title="The Qur'an in Islamic Civilization and in America", strand="Civilization",
       topics="Arabic spreads with the Qur'an; calligraphy, geometric art and the mosque; the Qur'an and the sciences — grammar, astronomy for the calendar and qibla, the House of Wisdom; law and the madrasa; the Qur'an in Persian, Turkish, Urdu, Swahili and Malay worlds; translation history — Latin (1143), Sale (1734), Rodwell, Pickthall (1930), Yusuf Ali; the Qur'an in America — enslaved West African Muslims, Omar ibn Said's manuscript, Chicago's mosques today.",
       story="A man enslaved in North Carolina writes his life story in Arabic, beginning with a surah"),
 ]),

 # ══════════════════════════════ 9–10 (units 12–14, chapters 23–28) ══════════════════════════════
 dict(n=12, band="9-10", title="Close Reading Meccan Surahs", strand="Surahs Close Up", chapters=[
  dict(n=23, title="The Short Surahs: Al-Fatiha, Al-'Alaq, Ad-Duha, Al-'Asr, Al-Ikhlas", strand="Meccan Surahs",
       topics="reading Al-Fatiha as prayer and as the book's opening; 96:1–5 as the first revelation; Ad-Duha (93) — consolation and the orphan; Al-'Asr (103) — three lines and a whole ethic; Al-Ikhlas (112) — tawhid; sound, rhyme and oath in Meccan style; Pickthall and Rodwell compared on one surah; the surah as a unit of meaning; how these surahs are used in daily prayer.",
       story="Three lines a Muslim child learns first, and a scholar spends a lifetime on"),
  dict(n=24, title="Surah Yusuf and Surah Maryam: Narrative in the Qur'an", strand="Narrative Surahs",
       topics="Surah 12 as a continuous story — its frame (\"the best of stories\"), dream, pit, Egypt, the wife of the governor, prison, the interpretation of dreams, the reunion; Surah 19 — Zakariya, Maryam and the birth of Isa, Ibrahim, Musa; how Qur'anic narrative works — allusion, repetition, direct speech, the moral frame; Genesis 37–50 and Luke 1 beside them; Muslim and academic readings.",
       story="The Qur'an calls one story \"the best of stories\" and tells it in a single surah"),
 ]),
 dict(n=13, band="9-10", title="Close Reading Medinan Surahs", strand="Surahs Close Up", chapters=[
  dict(n=25, title="Al-Baqarah: Covenant, Law, the Throne Verse and \"No Compulsion\"", strand="Surah 2",
       topics="the longest surah as a whole — its opening, the story of Adam, the children of Israel, the change of qibla, fasting, pilgrimage, law on family and debt, the Throne Verse (255), \"no compulsion in religion\" (256), the closing prayer; the Medinan voice — community and law; reading verses in their sequence; commentators on 2:256; Pickthall's text close up.",
       story="The longest chapter of the book, and one verse in it that has been argued over for 1,400 years"),
  dict(n=26, title="An-Nisa, Al-Ma'idah and Al-Hujurat: Community, Justice and the Peoples of the Book", strand="Surahs 4, 5, 49",
       topics="An-Nisa (4) — orphans, inheritance, marriage, justice (4:135 \"stand out firmly for justice\"); Al-Ma'idah (5) — food, the covenant, Jews and Christians, 5:32 and 5:48 (\"to each a law and a way\"); Al-Hujurat (49) — manners, \"nations and tribes that ye may know one another\" (49:13); how classical and modern scholars read the verses on other faiths; context and occasion.",
       story="A verse says people were made into nations and tribes so that they might know one another"),
 ]),
 dict(n=14, band="9-10", title="The Qur'an and the Bible", strand="Comparative", chapters=[
  dict(n=27, title="Shared Figures, Different Tellings", strand="Adam to Jesus",
       topics="Adam, Noah, Abraham, Joseph, Moses, David, Solomon, Jonah, Mary and Jesus in the Qur'an and in the Bible — side-by-side passages (Pickthall beside KJV/JPS 1917); what the Qur'an assumes its hearers already know; Ibrahim and the Kaaba, Ismail and Isaac; Maryam and the birth of Isa; Isa in the Qur'an — prophet, messiah, not divine, not crucified as Muslims read 4:157; how Jews, Christians and Muslims each read their shared figures.",
       story="Abraham's son on the mountain — one story, three scriptures, and the son's name is not always the same"),
  dict(n=28, title="How the Three Read Each Other's Books", strand="Dialogue",
       topics="the Qur'an on the Torah, the Psalms and the Gospel; People of the Book; tahrif — the claim of alteration — and how scholars discuss it; medieval polemic and dialogue (Baghdad, Córdoba); modern interfaith reading — scriptural reasoning, the Chicago 1893 Parliament and the city's interfaith groups; what scholars of each tradition say about the others' texts; comparing without ranking.",
       story="In tenth-century Baghdad, a Muslim, a Jew and a Christian debate — and a bookseller takes notes"),
 ]),

 # ══════════════════════════════ 11–12 (units 15–17, chapters 29–34) ══════════════════════════════
 dict(n=15, band="11-12", title="Interpretation: Classical and Modern", strand="Tafsir", chapters=[
  dict(n=29, title="The Tafsir Tradition", strand="Classical Interpretation",
       topics="al-Tabari's method — tradition and reasoned choice; al-Zamakhshari's grammar and theology; Fakhr al-Din al-Razi's philosophy; Ibn Kathir's Qur'an-by-Qur'an and hadith; Shia tafsir (al-Tabrisi); Sufi readings (al-Qushayri, Ibn Arabi) — the inner meanings; the tools — grammar, occasions, abrogation, the clear and the ambiguous; one verse in four classical commentaries.",
       story="Four scholars, four centuries, one verse — and four different first sentences"),
  dict(n=30, title="Modern Readings", strand="Modern Interpretation",
       topics="print, colonialism and the modern commentary — Muhammad Abduh and Rashid Rida, Sayyid Qutb, Maududi; Fazlur Rahman's double movement; Muhammad Iqbal; women scholars — Amina Wadud, Asma Barlas; scientific exegesis and its critics; translation debates (Pickthall, Yusuf Ali, Arberry, modern translations); the Qur'an online; how Muslims in America read today.",
       story="A woman stands to give the Friday sermon in 2005, and cites the Qur'an on both sides"),
 ]),
 dict(n=16, band="11-12", title="Law, Ethics and Society", strand="Qur'an and Law", chapters=[
  dict(n=31, title="From Text to Law: Usul al-Fiqh, the Schools and Ijtihad", strand="Law",
       topics="the sources of law — Qur'an, Sunnah, consensus, analogy; the four Sunni schools and the Ja'fari school; ijtihad and taqlid; the Qur'an's legal verses are few — how the rest was reasoned; family law, contracts, criminal law (hudud) in outline and in debate; the objectives of the law (maqasid); sharia as scholars describe it versus sharia in headlines; Muslim jurists in America.",
       story="Of six thousand verses, a few hundred are law — and from them, libraries"),
  dict(n=32, title="War, Peace, Governance and the Earth: Verses in Context", strand="Ethics in Context",
       topics="the verses on fighting — 2:190–194, 9:5, 9:29, 8:61 — with their occasions and the classical rules of war; jihad's meanings; the Qur'an on rulers, consultation (shura) and justice; the Qur'an on the earth — stewardship (khalifa), balance (mizan), water; how extremists misread and how mainstream scholars answer; the Amman Message (2004) and the \"Common Word\" letter (2007).",
       story="The same verse quoted by a scholar and by a terrorist, and what the scholar says next"),
 ]),
 dict(n=17, band="11-12", title="Recitation as Art, and Capstone", strand="Capstone", chapters=[
  dict(n=33, title="Sound and Beauty: Recitation, Calligraphy and the Inimitable", strand="Art",
       topics="the doctrine of i'jaz — the Qur'an's inimitability — and the classical arguments; the reciters (Abdul Basit, Minshawi) and styles (murattal, mujawwad); international recitation competitions; calligraphy — Kufic to Naskh to Thuluth, the mushaf as art; the Qur'an in architecture — inscriptions on mosques; the Qur'an in poetry (Rumi, Hafez), fiction and film; listening and looking as ways of reading.",
       story="A reciter holds one vowel for a full breath, and a hall of thousands goes silent"),
  dict(n=34, title="Capstone: A Verse, Its Contexts and Its Readers", strand="Capstone",
       topics="choosing a verse or a short surah and a question; reading in two translations (one public domain); the surah's structure, the occasion, the words; the classical commentaries and one modern reader; a thesis about what the verse says and how it has been read; citing surah and ayah, translator and commentator; acknowledging other readings; the essay and the presentation; a rubric; reflection on studying a sacred text in a public school.",
       story="One ayah, two translations, three commentaries and a student's own careful argument"),
 ]),
]

# Rooms already on the site that belong to each unit — nothing gets deleted.
# No hub of its own: the Daily Drafts "Qur'an" spiral for the band, the World
# Religions Islam room (/r5), and the sister courses.
def _dd(grade, label):
    return [("/drops/quran/%s" % grade, "Daily Drafts — Qur'an, grades %s" % label)]
LINKS = {
 1: _dd("K", "K–2") + [("/bible", "The Bible — the course")],
 2: _dd("1", "K–2") + [("/religions-course", "World Religions — the course")],
 3: _dd("2", "K–2") + [("/bible", "The Bible — the course"), ("/hebrew-bible", "The Hebrew Bible — the course")],
 4: _dd("3", "3–5") + [("/religions-course", "World Religions — the course")],
 5: _dd("4", "3–5") + [("/religions-course", "World Religions — the course")],
 6: _dd("4", "3–5") + [("/bible", "The Bible — the course"), ("/hebrew-bible", "The Hebrew Bible — the course")],
 7: _dd("5", "3–5") + [("/religions-course", "World Religions — the course")],
 8: _dd("6", "6–8") + [("/r5", "Islam — the room"), ("/r1", "How to read a sacred text — the room")],
 9: _dd("7", "6–8") + [("/r5", "Islam — the room")],
 10: _dd("7", "6–8") + [("/r5", "Islam — the room")],
 11: _dd("8", "6–8") + [("/r5", "Islam — the room"), ("/talmud", "Talmud Study — the course")],
 12: _dd("9-10", "9–10") + [("/r5", "Islam — the room")],
 13: _dd("9-10", "9–10") + [("/r5", "Islam — the room")],
 14: _dd("9-10", "9–10") + [("/bible", "The Bible — the course"), ("/hebrew-bible", "The Hebrew Bible — the course"), ("/r11", "One question, many lenses — the room")],
 15: _dd("11-12", "11–12") + [("/r5", "Islam — the room"), ("/talmud", "Talmud Study — the course")],
 16: _dd("11-12", "11–12") + [("/r10", "Religion and the world — the room")],
 17: _dd("11-12", "11–12") + [("/r12", "World Religions capstone — the sources speak")],
}
