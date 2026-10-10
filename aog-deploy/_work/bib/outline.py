# The Bible, K–12 — the course arc. Our own wording: the Bible read as
# literature and history in a public-school classroom — its stories for the
# youngest readers (K–2), its big story (3–5), its genres and its world (6–8),
# close reading and interpretation (9–12). Old Testament and New Testament,
# read from public-domain translations (KJV, ASV, WEB; JPS 1917 for the Hebrew
# Bible), always described ("Christians believe…", "the text says…"), never
# taught as true or false. Topics guide the writers; story = the chapter's
# opening narrative hook.
#
# Units number 1–18 straight through the course; chapters 1–36. `band` is the
# grade band; `strand` prints where a unit's years go; `level` (BANDS) sets the
# writing rules (SPEC.md). Sister courses: The Hebrew Bible (heb), Talmud Study
# (tal), The Qur'an (qur), World Religions (rel).

BANDS = [
 dict(id="k-2",   title="Grades K–2",   level="k2"),
 dict(id="3-5",   title="Grades 3–5",   level="35"),
 dict(id="6-8",   title="Grades 6–8",   level="68"),
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
]

UNITS = [
 # ══════════════════════════════ K–2 (units 1–4, chapters 1–8) ══════════════════════════════
 dict(n=1, band="k-2", title="Beginnings", strand="Genesis Stories", chapters=[
  dict(n=1, title="Seven Days and a Garden", strand="Creation",
       topics="the Bible is a big book made of many smaller books; the very first story, Genesis, says God made light, sky, land and sea, sun and moon, fish and birds, animals and people, and rested on the seventh day; a garden called Eden; Adam and Eve; a snake, a fruit and a rule that was broken; leaving the garden; \"the story says\" and \"Jews and Christians tell this story\".",
       story="Grandma opens the biggest book in the house to page one"),
  dict(n=2, title="Noah and the Rainbow", strand="The Flood",
       topics="Noah builds a very big boat because the story says a flood is coming; two of each animal; forty days of rain; a raven and a dove; the olive leaf; the rainbow as a promise; the tower of Babel and why the story says people speak many languages; what a promise is; Muslims tell a story of Noah (Nuh) too.",
       story="Rain on the window, and a picture book with a boat full of animals"),
 ]),
 dict(n=2, band="k-2", title="Abraham's Family", strand="Genesis Stories", chapters=[
  dict(n=3, title="Abraham, Sarah and a Promise", strand="Abraham",
       topics="Abraham and Sarah leave home for a new land because the story says God told them to; a promise of a family as many as the stars; Isaac is born when they are very old; Isaac and Rebekah; Jacob and Esau — twins who did not get along, and made up; Jacob's ladder dream; Jacob's twelve sons; a family tree you can draw.",
       story="A tent, a night sky and more stars than anyone could count"),
  dict(n=4, title="Joseph and His Brothers", strand="Joseph",
       topics="Joseph's special coat; his dreams; his brothers sell him and he goes to Egypt; Joseph explains Pharaoh's dream — seven fat years, seven thin years; storing food; the brothers come to buy food and do not know him; Joseph forgives; the family moves to Egypt; forgiving someone who was unkind.",
       story="A coat with every color, and eleven brothers who wanted one too"),
 ]),
 dict(n=3, band="k-2", title="Moses and the Way Out", strand="Exodus Stories", chapters=[
  dict(n=5, title="A Baby in a Basket", strand="Moses",
       topics="the family grows into a people in Egypt; a Pharaoh who makes them slaves; a mother hides her baby in a basket on the Nile; Miriam watches; Pharaoh's daughter finds him and names him Moses; Moses grows up and runs away; the burning bush — the story says God sends him back to say \"let my people go\".",
       story="A basket floats down the river, and a big sister hides in the reeds"),
  dict(n=6, title="Through the Sea to a Mountain", strand="Exodus",
       topics="Pharaoh says no; the plagues in a short list; the night of Passover; the sea opens and the people cross; manna in the desert; Mount Sinai and the Ten Commandments in kid words (tell the truth, do not steal, rest one day, honor your parents); Jews remember this every Passover; Christians read it too.",
       story="A wall of water on the left, a wall of water on the right, and dry ground in the middle"),
 ]),
 dict(n=4, band="k-2", title="Kings, Prophets and a Teacher", strand="Stories from Both Testaments", chapters=[
  dict(n=7, title="David, Daniel and Jonah", strand="Old Testament Stories",
       topics="David the shepherd boy with a sling; David and Goliath; David becomes king and writes songs called psalms (Psalm 23 in simple words); Daniel in the lions' den; Jonah, the big fish and the city that said sorry; a prophet is someone who speaks a message; courage and being brave.",
       story="A boy with five smooth stones stands in front of a giant"),
  dict(n=8, title="Stories Jesus Told", strand="New Testament Stories",
       topics="Christians tell the story of Jesus — born in Bethlehem, the shepherds and the star as Luke and Matthew tell it; Jesus the teacher who told stories called parables; the lost sheep; the Good Samaritan — being a neighbor; the mustard seed; Jesus welcomes children; Christmas and Easter as days when Christians remember him.",
       story="A man is hurt on the road, and the person who stops is the one nobody expected"),
 ]),

 # ══════════════════════════════ 3–5 (units 5–8, chapters 9–16) ══════════════════════════════
 dict(n=5, band="3-5", title="What the Bible Is", strand="Orientation", chapters=[
  dict(n=9, title="A Library of Books", strand="The Book",
       topics="the Bible as a library — 66 books in most Protestant Bibles, 73 in Catholic Bibles, 24 in the Hebrew Bible (the same words counted differently); Old Testament and New Testament, and why Jews say Tanakh; chapters and verses, and how to find John 3:16; written in Hebrew, Aramaic and Greek; translations — the King James Bible (1611) and newer ones; who reads it and how (synagogue, church, home, school).",
       story="A class finds the same sentence in four Bibles that do not look alike"),
  dict(n=10, title="The Torah's Big Story: Creation to Sinai", strand="Genesis to Deuteronomy",
       topics="the first five books in order — Genesis, Exodus, Leviticus, Numbers, Deuteronomy; creation, the flood, Abraham, Isaac, Jacob, Joseph; slavery in Egypt, Moses, the Exodus, Passover; Sinai and the Ten Commandments; the years in the wilderness; Moses looks at the land he will not enter; covenant — a promise with rules on both sides; how Jews and Christians both keep these books.",
       story="A map of the journey from Ur to Egypt to the edge of Canaan, drawn on butcher paper"),
 ]),
 dict(n=6, band="3-5", title="The Land, the Judges and the Kings", strand="The Historical Books", chapters=[
  dict(n=11, title="Joshua, Judges and Ruth", strand="Joshua to Ruth",
       topics="Joshua and Jericho; the twelve tribes and the land; judges as leaders in a crisis — Deborah, Gideon, Samson; \"everyone did what was right in their own eyes\"; Ruth — a foreigner who stays with Naomi, loyalty and kindness, the great-grandmother of David; how a story teaches what a people valued.",
       story="Ruth says, \"Where you go, I will go\" — and means it"),
  dict(n=12, title="Samuel, Saul, David and Solomon", strand="The Kings",
       topics="Hannah and Samuel; the people ask for a king; Saul; David — shepherd, musician, giant-slayer, king; David and Jonathan; David's mistakes and Nathan's story of the lamb; Solomon's wisdom (the two mothers), the Temple in Jerusalem; the kingdom splits in two — Israel and Judah; what a king was supposed to be.",
       story="Two women, one baby and a king who asks for a sword"),
 ]),
 dict(n=7, band="3-5", title="Prophets, Exile and Return", strand="Prophets and Writings", chapters=[
  dict(n=13, title="Elijah, Isaiah, Jeremiah and the Exile", strand="The Prophets",
       topics="a prophet speaks a message, mostly to kings and crowds; Elijah on Mount Carmel and the still small voice; Amos and Isaiah on treating the poor fairly; Jeremiah warns Jerusalem; Assyria takes Israel (722 BCE) and Babylon takes Judah (586 BCE); the Temple burns; \"by the rivers of Babylon\"; Ezekiel's dry bones — hope in exile.",
       story="A prophet stands at the city gate saying what nobody wants to hear"),
  dict(n=14, title="Psalms, Proverbs, Daniel, Esther and Home Again", strand="The Writings",
       topics="the Psalms — songs for every feeling (Psalm 23, 100, 150 in simple words); Proverbs — short wise sayings; Job's hard question; Daniel and his friends in Babylon; Esther saves her people (Purim); Cyrus lets the exiles return (538 BCE); Ezra reads the Torah aloud; Nehemiah rebuilds the wall; the Hebrew Bible ends with going home.",
       story="A queen who was told to stay quiet decides to speak"),
 ]),
 dict(n=8, band="3-5", title="The New Testament Story", strand="The New Testament", chapters=[
  dict(n=15, title="The Life of Jesus in the Gospels", strand="The Gospels",
       topics="four Gospels — Matthew, Mark, Luke, John — four tellings of one life; Judea under Rome; Jesus's birth as Luke and Matthew tell it; John the Baptist; the twelve disciples; teaching by parables (the sower, the prodigal son, the Good Samaritan); the Sermon on the Mount in simple words; healing stories; Palm Sunday, the Last Supper, the cross and, as Christians believe, the resurrection; Christmas and Easter.",
       story="A father runs down the road to hug the son who wasted everything"),
  dict(n=16, title="Acts, Paul's Letters and the Early Church", strand="Acts to Revelation",
       topics="Acts — the followers of Jesus in Jerusalem, Pentecost, Peter; Saul becomes Paul on the road to Damascus; Paul's journeys around the Mediterranean and a map; a letter to a church — what a letter can do (1 Corinthians 13 on love, in simple words); Revelation as a book of pictures and hope; the New Testament's 27 books; how Christians came to be in every country.",
       story="A letter arrives in Corinth, and the whole church gathers to hear it read"),
 ]),

 # ══════════════════════════════ 6–8 (units 9–13, chapters 17–26) ══════════════════════════════
 dict(n=9, band="6-8", title="Genres and How to Read Them", strand="Method", chapters=[
  dict(n=17, title="Law, Narrative and Genealogy", strand="Reading the Prose",
       topics="genre — the kind of writing a passage is, and why it changes how you read; narrative — plot, character, repetition, the narrator who rarely explains; law — case law (\"if… then\") and commands, the Ten Commandments, the Covenant Code beside Hammurabi's laws; genealogies as maps of a people; reading a chapter and asking who wrote it, for whom, when and why; the Bible as literature in a public school.",
       story="A student reads the same page as a story, then as a law code, and finds two different books"),
  dict(n=18, title="Poetry, Prophecy, Gospel, Letter, Apocalypse", strand="Reading the Other Genres",
       topics="Hebrew poetry — parallelism (say it, then say it again differently), imagery, acrostics; prophecy as speech to the present, not fortune-telling — the messenger formula, the oracle, the sign-act; wisdom sayings; the gospel as a genre — an ancient life with a purpose; letters — greeting, thanks, body, farewell; apocalypse — symbols, numbers and visions in a time of persecution (Daniel, Revelation).",
       story="Six passages on six cards, and the class sorts them by what kind of writing each is"),
 ]),
 dict(n=10, band="6-8", title="The Pentateuch as Literature and History", strand="Torah", chapters=[
  dict(n=19, title="Genesis: Creation, Flood, Ancestors", strand="Genesis",
       topics="Genesis 1 and Genesis 2 as two creation accounts and how readers have handled that; Eden, Cain and Abel, Noah, Babel; the Mesopotamian flood story (Gilgamesh) beside Noah — likeness and difference; the ancestors — Abraham, Sarah, Hagar, Isaac, Rebekah, Jacob, Leah, Rachel, Joseph; covenant and promise as the thread; what archaeology can and cannot say about the ancestors.",
       story="A clay tablet in a museum tells of a flood and a boat — and it is older than Genesis"),
  dict(n=20, title="Exodus to Deuteronomy: Covenant and Law", strand="Exodus to Deuteronomy",
       topics="Exodus as the founding story — slavery, Moses, plagues, Passover, the sea, Sinai; the Ten Commandments in KJV and in JPS 1917 (numbered differently by Jews, Catholics and Protestants); the Covenant Code, Leviticus's holiness laws (\"love thy neighbour as thyself\"), Deuteronomy's speeches and the Shema; the tabernacle; Egypt and Canaan in the Late Bronze Age; what historians debate about the Exodus.",
       story="A people at the foot of a mountain, and a list of ten things carved in stone"),
 ]),
 dict(n=11, band="6-8", title="The History Books and the Ancient Near East", strand="Former Prophets and Writings", chapters=[
  dict(n=21, title="Joshua to Kings: Tribes, Monarchy, Two Kingdoms", strand="Joshua to 2 Kings",
       topics="conquest and settlement — the Bible's account and what archaeology suggests; the judges; Samuel, Saul, David, Solomon; Jerusalem and the Temple; the divided kingdom (c. 930 BCE); Assyria and the fall of Samaria (722 BCE); Hezekiah, Josiah, Babylon and the fall of Jerusalem (586 BCE); evidence outside the Bible — the Tel Dan stele, the Mesha stele, Sennacherib's prism.",
       story="A stone found in 1993 carries the words \"House of David\""),
  dict(n=22, title="Exile, Persia and the Second Temple", strand="Exile and Return",
       topics="exile in Babylon and what it changed — scripture, synagogue, identity; Cyrus's edict (538 BCE) and the Cyrus Cylinder; Ezra, Nehemiah, the Second Temple; Chronicles retelling Samuel–Kings; Esther and Daniel as stories of life under empire; the Greeks, the Maccabees and Hanukkah (in the Apocrypha — which Bibles include them and why); the world Jesus was born into.",
       story="A clay cylinder in the British Museum, and a king who let the exiles go home"),
 ]),
 dict(n=12, band="6-8", title="Poetry and Wisdom", strand="Psalms and Wisdom", chapters=[
  dict(n=23, title="The Psalms: Praise, Lament, Thanks", strand="Psalms",
       topics="150 psalms in five books; types — praise, lament, thanksgiving, royal, wisdom, pilgrimage; parallelism and imagery close up (Psalm 23, Psalm 1, Psalm 137, Psalm 150 in KJV and JPS 1917); David's name on the psalms; psalms in synagogue and church, and in music from Gregorian chant to gospel; writing a psalm-shaped poem of your own.",
       story="The same psalm sung in Hebrew on Friday night and in English on Sunday morning"),
  dict(n=24, title="Proverbs, Job, Ecclesiastes and the Song of Songs", strand="Wisdom",
       topics="wisdom literature across the ancient Near East (Egypt's Instruction of Amenemope); Proverbs — the two-line saying, the fear of the LORD, the woman of valor; Job — the wager, the friends, the whirlwind, and the question of undeserved suffering; Ecclesiastes — \"vanity of vanities\", a time for everything; the Song of Songs as love poetry and as allegory; three books that disagree with each other.",
       story="Three friends sit with a man who has lost everything, and say the wrong things"),
 ]),
 dict(n=13, band="6-8", title="The New Testament in Its World", strand="The New Testament", chapters=[
  dict(n=25, title="Gospels: Four Portraits, One Roman World", strand="The Gospels",
       topics="Judea and Galilee under Rome — Herod, Pilate, the Temple, Pharisees, Sadducees, Essenes, Zealots; the four Gospels and their dates (c. 65–100 CE); the Synoptics and John; parables close up; the Sermon on the Mount (Matthew 5–7); miracle stories as the Gospels tell them; the Passion narrative and the resurrection accounts as Christians read them; the Dead Sea Scrolls and the world of the text.",
       story="A coin with Caesar's face, and a question meant as a trap"),
  dict(n=26, title="Acts, Letters and Revelation", strand="Acts to Revelation",
       topics="Acts as a sequel to Luke; Pentecost, Peter, Stephen, Paul; Paul's journeys on a map and the cities — Antioch, Philippi, Corinth, Ephesus, Rome; the letter as a genre and Paul's letters in order (Romans, Corinthians, Galatians, Philippians, Philemon); the Catholic letters; Revelation — apocalypse under Domitian, symbols and hope; how the 27 books became the canon (Athanasius, 367 CE).",
       story="A prisoner dictates a letter to a runaway slave's master and calls the slave a brother"),
 ]),

 # ══════════════════════════════ 9–10 (units 14–16, chapters 27–32) ══════════════════════════════
 dict(n=14, band="9-10", title="Close Reading the Torah", strand="Torah Close Up", chapters=[
  dict(n=27, title="Two Creation Accounts, Eden and Babel", strand="Genesis 1–11",
       topics="Genesis 1:1–2:3 and 2:4–3:24 side by side — order, names of God, style; the documentary hypothesis in brief (J, E, P, D) and its critics; Eden read as story, as theology and as allegory; Cain and Abel, the flood, Babel; Enuma Elish beside Genesis 1; Jewish, Christian and academic readings; a close-reading toolkit — repetition, keyword, structure, gap.",
       story="Two students underline every name for God in Genesis 1–3, in two colors"),
  dict(n=28, title="Covenant, Law and the Character of God", strand="Exodus to Deuteronomy",
       topics="the Sinai covenant as an ancient treaty (Hittite treaty form); the Decalogue close up — three numberings; the Covenant Code beside Hammurabi (the goring ox); Leviticus 19 — holiness as ethics; Deuteronomy's speeches, the Shema, blessings and curses; the golden calf and divine anger and mercy (Exodus 34:6–7); how Jews, Christians and scholars read law in the Torah.",
       story="A treaty carved in the 13th century BCE, and a covenant that reads like it"),
 ]),
 dict(n=15, band="9-10", title="Prophets and Poets Close Up", strand="Prophets and Writings Close Up", chapters=[
  dict(n=29, title="Amos, Hosea, Isaiah, Jeremiah: Justice and Hope", strand="The Prophets",
       topics="the prophet as social critic — Amos on the poor, Hosea's marriage, Micah 6:8; First Isaiah and Assyria, the servant songs of Second Isaiah and how Jews and Christians read them differently; Jeremiah's call, the temple sermon, the new covenant; Ezekiel's visions; oracle, woe, lawsuit and vision as forms; the prophets in the civil rights movement (King quoting Amos).",
       story="\"Let justice roll down like waters\" — a verse read in 760 BCE and in 1963"),
  dict(n=30, title="Job and Ecclesiastes: Suffering and Meaning", strand="Wisdom",
       topics="Job as a literary whole — prose frame, poetic dialogue, the speeches from the whirlwind, the ending; the friends' theology and its collapse; Ecclesiastes — hevel, the cycle, joy in the ordinary, the editor's last word; Proverbs' confidence beside their doubt; the problem of evil across traditions; modern readers of Job (MacLeish, Wiesel) in brief.",
       story="A man on an ash heap demands a hearing, and gets a storm"),
 ]),
 dict(n=16, band="9-10", title="Reading the Gospels Closely", strand="Gospels Close Up", chapters=[
  dict(n=31, title="The Sermon on the Mount and the Parables", strand="Teaching",
       topics="Matthew 5–7 close up — the Beatitudes, the antitheses (\"you have heard… but I say\"), the Lord's Prayer, the golden rule; Luke's Sermon on the Plain compared; the parable as a form — the sower, the Good Samaritan, the prodigal son, the laborers in the vineyard; how parables surprise; the kingdom of God; Jewish teaching of the same era (Hillel) beside Jesus's.",
       story="A lawyer asks \"who is my neighbor?\" and gets a story instead of a definition"),
  dict(n=32, title="Passion, Resurrection and the Historical Jesus", strand="Passion Narratives",
       topics="the four Passion narratives compared — Gethsemane, the trials, the crucifixion, the last words; the resurrection accounts and their differences; the empty tomb as Christians believe it; the historical Jesus — sources (Josephus, Tacitus), criteria, what historians agree on; Jesus in Jewish and Muslim tradition; reading a text one believes and a text one studies.",
       story="Four accounts of one Friday, laid in four columns on the table"),
 ]),

 # ══════════════════════════════ 11–12 (units 17–18, chapters 33–36) ══════════════════════════════
 dict(n=17, band="11-12", title="Paul, Interpretation and the Making of the Canon", strand="Letters and Canon", chapters=[
  dict(n=33, title="Romans and Galatians: Faith, Law and Grace", strand="Paul",
       topics="Paul's life and letters in order; Galatians — the crisis, the argument, freedom; Romans — sin, faith, grace, Israel, the ethics of chapters 12–15; Paul on women, slavery and the state, and how readers have argued about him; the New Perspective on Paul in brief; reading a letter as a whole and in its occasion; Luther and Romans (1517).",
       story="A letter written to a church its author had never visited changed a monk's life 1,400 years later"),
  dict(n=34, title="Canon, Manuscripts and Translation", strand="Text and Transmission",
       topics="how the canon formed — the Hebrew canon, the Septuagint, the Apocrypha, Marcion, the Muratorian fragment, Athanasius; manuscripts — the Dead Sea Scrolls, Codex Sinaiticus, papyri; textual criticism and a famous variant (the ending of Mark); translation — Jerome's Vulgate, Wycliffe, Tyndale, the King James Bible (1611), modern versions; a verse in five translations; who decides what a word means.",
       story="A monk in the Sinai desert finds pages of a fourth-century Bible in a basket"),
 ]),
 dict(n=18, band="11-12", title="The Bible in Culture and Capstone", strand="Capstone", chapters=[
  dict(n=35, title="The Bible in Literature, Art, Law and American Life", strand="Reception",
       topics="the Bible in English literature — Milton, Bunyan, Melville, Morrison; in art and music — Michelangelo, Rembrandt, Handel, spirituals; in American history — the Puritans, both sides of the slavery debate citing scripture, Lincoln's Second Inaugural, Frederick Douglass, King's \"I Have a Dream\"; the Bible and the First Amendment — Abington v. Schempp (1963) and teaching about the Bible in public schools; Bible translation and literacy.",
       story="Two preachers in 1860, one text, two opposite sermons — and Lincoln's answer in 1865"),
  dict(n=36, title="Capstone: A Close Reading Argued from the Text", strand="Capstone",
       topics="choosing a passage and a question; reading in two translations; genre, context, structure, key words; what Jewish, Christian and academic readers have said; a thesis about what the text does and means; evidence from the text and its world; acknowledging other readings; citing book, chapter and verse; the essay and the presentation; a rubric; reflection on reading a sacred text in a public school.",
       story="One passage, two translations, three commentaries and a student's own argument"),
 ]),
]

# Rooms already on the site that belong to each unit — nothing gets deleted.
# This course has no hub of its own: its practice rooms are the Daily Drafts
# "The Bible" spiral for the band (/drops/bible/<grade>) and the sister courses.
def _band_links(grade, band_label):
    return [("/drops/bible/%s" % grade, "Daily Practice — The Bible, grades %s" % band_label)]
LINKS = {
 1: _band_links("K", "K–2") + [("/hebrew-bible", "The Hebrew Bible — the course")],
 2: _band_links("1", "K–2") + [("/hebrew-bible", "The Hebrew Bible — the course")],
 3: _band_links("2", "K–2") + [("/hebrew-bible", "The Hebrew Bible — the course"), ("/quran", "The Qur'an — the course")],
 4: _band_links("2", "K–2") + [("/religions-course", "World Religions — the course")],
 5: _band_links("3", "3–5") + [("/hebrew-bible", "The Hebrew Bible — the course"), ("/religions-course", "World Religions — the course")],
 6: _band_links("4", "3–5") + [("/hebrew-bible", "The Hebrew Bible — the course")],
 7: _band_links("5", "3–5") + [("/hebrew-bible", "The Hebrew Bible — the course")],
 8: _band_links("5", "3–5") + [("/religions-course", "World Religions — the course")],
 9: _band_links("6", "6–8") + [("/r1", "How to read a sacred text — the room")],
 10: _band_links("6", "6–8") + [("/hebrew-bible", "The Hebrew Bible — the course"), ("/r2", "The Hebrew Bible — the room")],
 11: _band_links("7", "6–8") + [("/hebrew-bible", "The Hebrew Bible — the course"), ("/r2", "The Hebrew Bible — the room")],
 12: _band_links("7", "6–8") + [("/hebrew-bible", "The Hebrew Bible — the course")],
 13: _band_links("8", "6–8") + [("/r3", "The New Testament — the room")],
 14: _band_links("9-10", "9–10") + [("/hebrew-bible", "The Hebrew Bible — the course"), ("/r2", "The Hebrew Bible — the room")],
 15: _band_links("9-10", "9–10") + [("/hebrew-bible", "The Hebrew Bible — the course")],
 16: _band_links("9-10", "9–10") + [("/r3", "The New Testament — the room")],
 17: _band_links("11-12", "11–12") + [("/r3", "The New Testament — the room"), ("/r1", "How to read a sacred text — the room")],
 18: _band_links("11-12", "11–12") + [("/r12", "World Religions capstone — the sources speak"), ("/talmud", "Talmud Study — the course")],
}
