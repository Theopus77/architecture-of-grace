# The Hebrew Bible (Tanakh), K–12 — the course arc. Our own wording: the
# Tanakh — Torah, Nevi'im, Ketuvim — read as Jewish tradition reads it and as
# historians and literary readers read it, in a public-school classroom. Its
# stories for the youngest readers (K–2), the shape of the book and its big
# story (3–5), the three parts and the Jewish ways of reading (6–8), close
# reading with the commentators, the text's transmission and its life in
# Jewish practice (9–12). Read from the public-domain JPS 1917 translation
# (KJV/ASV for comparison); always described ("Jewish tradition teaches…",
# "the text says…"), never taught as true or false. Topics guide the writers;
# story = the chapter's opening narrative hook.
#
# Units number 1–17 straight through the course; chapters 1–34. Sister
# courses: The Bible (bib), Talmud Study (tal), The Qur'an (qur), World
# Religions (rel).

BANDS = [
 dict(id="k-2",   title="Grades K–2",   level="k2"),
 dict(id="3-5",   title="Grades 3–5",   level="35"),
 dict(id="6-8",   title="Grades 6–8",   level="68"),
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
]

UNITS = [
 # ══════════════════════════════ K–2 (units 1–3, chapters 1–6) ══════════════════════════════
 dict(n=1, band="k-2", title="In the Beginning", strand="Bereshit Stories", chapters=[
  dict(n=1, title="Seven Days and Shabbat", strand="Creation",
       topics="the Torah is a scroll with five books, and the first is called Bereshit, \"In the beginning\"; the story says God made light, sky, land, sea, sun, moon, stars, fish, birds, animals and people in six days and rested on the seventh; Jewish families call the seventh day Shabbat — candles, bread, a day of rest; a garden called Eden; \"the Torah says\" and \"Jewish families…\".",
       story="Two candles, a braided bread and the story of the very first week"),
  dict(n=2, title="Noah, the Ark and the Rainbow", strand="The Flood",
       topics="Noah builds a very big boat, an ark; the animals come in two by two; rain for forty days; the dove and the olive leaf; the rainbow as a sign of a promise; the tower of Babel and many languages; Jews, Christians and Muslims all tell a story of Noah; what a promise means.",
       story="A dove flies back with a leaf in her beak, and everyone on the boat cheers"),
 ]),
 dict(n=2, band="k-2", title="Abraham, Sarah and Their Family", strand="Bereshit Stories", chapters=[
  dict(n=3, title="Abraham and Sarah Go to a New Land", strand="Abraham and Sarah",
       topics="the Torah says God told Abraham and Sarah to leave home and go to a land they did not know; they went; a promise of a big family; a tent open on all sides — welcoming guests; Isaac is born; Isaac and Rebekah at the well; Jewish tradition calls Abraham and Sarah the first of the family; kindness to strangers.",
       story="Three travelers appear in the heat of the day, and Abraham runs to bring them food"),
  dict(n=4, title="Jacob, Rachel, Leah and Joseph", strand="Jacob and Joseph",
       topics="twins Jacob and Esau; Jacob's dream of a ladder to the sky; Jacob works for Rachel and marries Leah too; Jacob gets a new name, Israel; twelve sons and one daughter, Dinah; Joseph's coat, his dreams, Egypt, forgiving his brothers; the family moves to Egypt; the twelve tribes get their names from Jacob's sons.",
       story="A ladder in a dream with angels going up and down"),
 ]),
 dict(n=3, band="k-2", title="Moses and the Torah", strand="Shemot Stories", chapters=[
  dict(n=5, title="Out of Egypt: The Passover Story", strand="Exodus",
       topics="the family becomes a people; a Pharaoh makes them slaves; baby Moses in a basket, Miriam and Pharaoh's daughter; the burning bush; \"let my people go\"; the plagues in a short list; the night of Passover and bread with no time to rise (matzah); crossing the sea; Miriam sings and dances; Jewish families tell this story every year at the Seder.",
       story="The youngest child at the table asks, \"Why is this night different?\""),
  dict(n=6, title="Mount Sinai and the Ten Sayings", strand="Sinai",
       topics="the people camp at a mountain; thunder and a cloud; the story says God gives Moses the Torah; the Ten Commandments (Jewish tradition says \"the Ten Sayings\") in kid words — one God, rest on Shabbat, honor your parents, tell the truth, do not take what is not yours; a mitzvah is a commandment; Jewish families celebrate Shavuot to remember this day; the Torah scroll in the synagogue.",
       story="Everyone in the class writes one rule that would make the room a better place"),
 ]),

 # ══════════════════════════════ 3–5 (units 4–7, chapters 7–14) ══════════════════════════════
 dict(n=4, band="3-5", title="What the Tanakh Is", strand="Orientation", chapters=[
  dict(n=7, title="Torah, Nevi'im, Ketuvim", strand="The Book",
       topics="TaNaKh is made from three first letters — Torah (teaching), Nevi'im (prophets), Ketuvim (writings); 24 books; written mostly in Hebrew, read right to left; the Torah scroll — parchment, a scribe with a quill, no vowels, the yad (pointer), the ark in the synagogue; the weekly Torah portion (parashah) and the yearly cycle; Simchat Torah; the same books Christians call the Old Testament, in a different order; the JPS translation (1917).",
       story="A scroll so long it takes a year to read, one piece every Saturday"),
  dict(n=8, title="The Torah's Big Story", strand="Genesis to Deuteronomy",
       topics="the five books and their Hebrew names — Bereshit, Shemot, Vayikra, Bamidbar, Devarim; creation, the flood, the ancestors, Joseph; slavery, Moses, the Exodus, Sinai; the tabernacle; forty years in the wilderness; Moses's last speeches and death on Mount Nebo; covenant — a bond with promises on both sides; Joshua takes over; the story as one long journey on a map.",
       story="A map from Ur to Egypt to the Jordan, with a footprint for every stop"),
 ]),
 dict(n=5, band="3-5", title="Into the Land", strand="Nevi'im: The Former Prophets", chapters=[
  dict(n=9, title="Joshua, Deborah, Gideon, Samson", strand="Joshua and Judges",
       topics="Joshua and the walls of Jericho; the land divided among the tribes; the judges — leaders who stepped up in a crisis; Deborah under her palm tree; Gideon's small army; Samson's strength and his mistakes; \"in those days there was no king\"; what the stories say about courage, trust and choices.",
       story="A judge sits under a palm tree, and people come from all over to ask her what is right"),
  dict(n=10, title="Ruth, Hannah and Samuel", strand="Ruth and 1 Samuel",
       topics="Ruth — a Moabite who stays with Naomi, gleaning in the fields, Boaz, the great-grandmother of David; Ruth is read on Shavuot; Hannah prays for a child and Samuel is born; Samuel hears a voice in the night; Samuel the prophet and judge; the people ask for a king; loyalty and kindness (chesed) as a thread.",
       story="\"Where you go, I will go\" — a promise made on a dusty road"),
 ]),
 dict(n=6, band="3-5", title="Kings and Prophets", strand="Nevi'im", chapters=[
  dict(n=11, title="Saul, David and Solomon", strand="The Kings",
       topics="Saul, the first king; David the shepherd, the harp, Goliath, David and Jonathan; David becomes king in Jerusalem; David's mistakes and Nathan's story of the poor man's lamb; Solomon's wisdom and the Temple; the kingdom splits — Israel in the north, Judah in the south; Jewish tradition remembers David in the Psalms and in prayers.",
       story="A shepherd boy plays a harp for a troubled king"),
  dict(n=12, title="Elijah, Jonah and the Prophets of Justice", strand="The Prophets",
       topics="a prophet (navi) brings a message, often one people do not want; Elijah and the prophets of Baal, the still small voice, the chair for Elijah at the Seder; Elisha; Amos and Isaiah say: be fair to the poor; Jonah runs away, the big fish, Nineveh says sorry — read on Yom Kippur; Jeremiah and the fall of Jerusalem (586 BCE); exile — living far from home.",
       story="A prophet climbs into a boat going the wrong way"),
 ]),
 dict(n=7, band="3-5", title="Songs, Sayings and Scrolls", strand="Ketuvim", chapters=[
  dict(n=13, title="Psalms and Proverbs", strand="Poetry and Wisdom",
       topics="the Psalms (Tehillim) — 150 songs for every feeling, some sung in the synagogue every week (Psalm 23, 100, 150 in simple words from JPS 1917); Proverbs (Mishlei) — short wise sayings, \"a soft answer turns away wrath\"; Job's question about why bad things happen; the Song of Songs — a poem about love, read on Passover; how poetry says something twice in two ways.",
       story="A shepherd's song about green pastures, sung at a bedside and at a stadium"),
  dict(n=14, title="Esther, Daniel and Going Home", strand="Scrolls and Return",
       topics="Esther — a queen who speaks up, Mordecai, Haman, the Megillah read on Purim with noisemakers; Daniel and his friends in Babylon, the lions' den; Lamentations — a sad poem for the burned Temple, read on Tisha B'Av; Ecclesiastes, read on Sukkot; Ezra and Nehemiah — going home, rebuilding the wall, reading the Torah aloud to everyone; Chronicles, the last book, ends with \"let him go up\".",
       story="The whole town bangs and stamps every time the villain's name is read"),
 ]),

 # ══════════════════════════════ 6–8 (units 8–11, chapters 15–22) ══════════════════════════════
 dict(n=8, band="6-8", title="The Shape of the Tanakh", strand="Method", chapters=[
  dict(n=15, title="Three Parts, Twenty-Four Books, One Scroll", strand="Canon and Text",
       topics="the three parts and why the order differs from the Christian Old Testament (ending with Chronicles, not Malachi); how the canon settled (Torah first, Prophets, then Writings; Yavneh as tradition tells it); Hebrew and Aramaic; the Masoretes and their vowel points and notes (c. 7th–10th centuries CE); the Aleppo and Leningrad codices; the Torah scroll — a sofer, parchment, kosher ink, 304,805 letters, no mistakes; cantillation — chanting the text.",
       story="A scribe checks a scroll letter by letter, because one wrong letter means starting the column again"),
  dict(n=16, title="How Jews Read: Parashah, Midrash, Commentary", strand="Ways of Reading",
       topics="the weekly parashah and the haftarah from the Prophets; reading in community — the synagogue, the bar and bat mitzvah; midrash — stories that fill the gaps (Abraham and the idols); the four levels of meaning (peshat, remez, derash, sod); Rashi (1040–1105) and the commentary printed around the text; the Talmud's way of citing verses; arguing with the text is a form of respect.",
       story="A page with the verse in the middle and five centuries of readers arguing around it"),
 ]),
 dict(n=9, band="6-8", title="Torah: Genesis and Exodus", strand="Torah", chapters=[
  dict(n=17, title="Genesis: From Creation to Joseph", strand="Bereshit",
       topics="Genesis 1 and 2 as two accounts; Eden, Cain and Abel, Noah, Babel; the ancestors — Abraham, Sarah, Hagar, Ishmael, Isaac, Rebekah, Jacob, Esau, Leah, Rachel; the Akedah (the binding of Isaac) and how Jewish tradition reads it; Joseph as a novella; covenant and promise as the thread; the ancient Near East around the stories (Gilgamesh's flood, Mesopotamian law); what archaeology can and cannot say.",
       story="A father and son walk up a mountain, and the son asks where the lamb is"),
  dict(n=18, title="Exodus: Liberation, Sinai, the Mishkan", strand="Shemot",
       topics="slavery and the birth of Moses; the name revealed at the bush; the plagues and Passover; the sea and the Song of the Sea; Sinai — the Ten Sayings (Jewish numbering), the Covenant Code; the golden calf and the thirteen attributes of mercy; the Mishkan (tabernacle) and why half the book is about building it; the Haggadah and the yearly retelling; Exodus in African American history — \"Go Down, Moses\".",
       story="A song sung at the edge of the sea, and the same song sung on a plantation in 1850"),
 ]),
 dict(n=10, band="6-8", title="Torah: Leviticus to Deuteronomy, and the Former Prophets", strand="Torah and Nevi'im", chapters=[
  dict(n=19, title="Holiness, the Wilderness and Moses's Last Words", strand="Vayikra, Bamidbar, Devarim",
       topics="Leviticus — sacrifice, purity, the holiness code, \"love thy neighbour as thyself\" (19:18), Yom Kippur; Numbers — the census, the spies, forty years, Balaam's donkey, the daughters of Zelophehad; Deuteronomy — Moses's speeches, the Shema (6:4–9), tzedakah and the stranger, blessings and curses, Moses's death; the 613 mitzvot as rabbinic tradition counts them; law as a way of life.",
       story="Five sisters go to Moses and ask for their father's land — and the law changes"),
  dict(n=20, title="Joshua to Kings: The Land, the Monarchy, the Fall", strand="The Former Prophets",
       topics="Joshua, Judges, Samuel and Kings as one long history (the Deuteronomistic history); conquest and settlement — the text and the archaeology; the judges; Saul, David, Solomon and the Temple; the divided kingdom (c. 930 BCE); Elijah and Elisha; Assyria takes Samaria (722 BCE); Hezekiah, Josiah's reform and the found scroll; Babylon burns Jerusalem (586 BCE); the Tel Dan stele and Sennacherib's prism as outside evidence.",
       story="Workers repairing the Temple find an old scroll, and a young king tears his clothes when he hears it read"),
 ]),
 dict(n=11, band="6-8", title="The Latter Prophets and the Writings", strand="Nevi'im and Ketuvim", chapters=[
  dict(n=21, title="Isaiah, Jeremiah, Ezekiel and the Twelve", strand="The Latter Prophets",
       topics="the prophet as messenger — call narratives, oracles, sign-acts; Isaiah — Assyria, the vision of peace (2:4), comfort in exile (40); Jeremiah — the temple sermon, the yoke, the new covenant, Lamentations; Ezekiel — the chariot, the dry bones; the Twelve — Amos on justice, Hosea's marriage, Jonah, Micah 6:8, Malachi; haftarot and where the prophets are heard in the synagogue year.",
       story="A prophet walks through Jerusalem wearing a wooden yoke to make a point"),
  dict(n=22, title="Ketuvim: Psalms, Wisdom, the Five Scrolls, Ezra–Nehemiah, Chronicles", strand="The Writings",
       topics="Psalms — types and parallelism, the psalms in the siddur; Proverbs, Job, Ecclesiastes as three voices of wisdom; the five Megillot and their holidays — Song of Songs (Passover), Ruth (Shavuot), Lamentations (Tisha B'Av), Ecclesiastes (Sukkot), Esther (Purim); Daniel — court tales and visions, Aramaic; Ezra–Nehemiah and the return; Chronicles retelling the story; why the Tanakh ends with a call to go home.",
       story="Five short scrolls, five holidays, one calendar year"),
 ]),

 # ══════════════════════════════ 9–10 (units 12–14, chapters 23–28) ══════════════════════════════
 dict(n=12, band="9-10", title="Close Reading Genesis", strand="Torah Close Up", chapters=[
  dict(n=23, title="Creation, Eden and the Akedah", strand="Genesis 1–3 and 22",
       topics="Genesis 1:1–2:3 and 2:4–3:24 close up in JPS 1917 — structure, names of God, style, the two orders of creation; how Rashi, Ibn Ezra and Ramban handle the first verse; midrash on Eden; the documentary hypothesis in brief and its Jewish reception; Genesis 22 — the Akedah — read word by word: the gaps, the silence, the ram; the Akedah in Rosh Hashanah liturgy and in modern Jewish thought; Enuma Elish beside Genesis 1.",
       story="Two students count the words in Genesis 22 that describe what Isaac was thinking, and find none"),
  dict(n=24, title="Jacob, Joseph and the Art of Biblical Narrative", strand="Genesis 25–50",
       topics="how biblical narrative works — economy, dialogue, repetition, the keyword, type-scenes (the meeting at the well), the narrator's silence; Jacob and Esau, the stolen blessing, the wrestling at the Jabbok and the new name; Leah and Rachel; Dinah; Joseph — dreams, pit, prison, palace, the recognition scene; Judah's speech (44:18–34) as a turning point; reading as literature and as Torah.",
       story="A man wrestles a stranger until dawn and walks away limping, with a new name"),
 ]),
 dict(n=13, band="9-10", title="Law, Covenant and the Prophetic Voice", strand="Torah and Nevi'im Close Up", chapters=[
  dict(n=25, title="Sinai, the Decalogue and the Covenant Code", strand="Exodus 19–24",
       topics="Sinai as a treaty scene — the ancient Near Eastern treaty form; the Ten Sayings close up in JPS 1917 and the Jewish, Catholic and Protestant numberings; the Covenant Code (Exodus 21–23) beside Hammurabi — the goring ox, \"an eye for an eye\" and how rabbinic tradition reads it as compensation; the stranger, the widow and the orphan; law as covenant obligation; Shavuot and the giving of the Torah.",
       story="The same case about a goring ox, in Hammurabi and in Exodus, side by side"),
  dict(n=26, title="Amos, Hosea, Micah, Isaiah: Justice, Mercy and Return", strand="The Prophets Close Up",
       topics="Amos 5 close up — \"let justice well up as waters\" (JPS 1917); Hosea's marriage as a parable; Micah 6:6–8; Isaiah 1 and 58 — worship without justice; Isaiah 40 and comfort; teshuvah (return) as the prophetic demand; Jonah as the Yom Kippur afternoon reading and its ending; the prophets in the siddur and in modern Jewish social action; the prophets quoted by King and Heschel.",
       story="A prophet from the south walks into a northern shrine and tells the crowd their worship is noise"),
 ]),
 dict(n=14, band="9-10", title="Poetry, Wisdom and the Scroll of Esther", strand="Ketuvim Close Up", chapters=[
  dict(n=27, title="Psalms and the Song of Songs: Hebrew Poetry", strand="Poetry",
       topics="parallelism close up — synonymous, antithetic, synthetic; imagery, acrostics (Psalm 119, Lamentations); Psalm 23, 90, 137, 150 in JPS 1917; psalms of lament and their turn; the Song of Songs — love poetry, its images, the allegorical reading (Rabbi Akiva: \"the holy of holies\"); psalms in the siddur (Kabbalat Shabbat, Hallel); writing in the psalm form.",
       story="Rabbi Akiva says all the Writings are holy, but this one is the holy of holies"),
  dict(n=28, title="Job, Ecclesiastes and Esther: Questions Without Easy Answers", strand="Wisdom and Esther",
       topics="Job — the prose frame, the dialogue, the whirlwind, the ending, and the friends' theology; Jewish readings of Job (Maimonides, the Talmud's \"Job never existed\"); Ecclesiastes — hevel, the seasons, joy, the editor's last verse; Esther — a book without God's name, irony and reversal, Purim's laughter and its dark chapter 9; three books that let the reader argue.",
       story="A book in which God is never named is read aloud with noisemakers and costumes"),
 ]),

 # ══════════════════════════════ 11–12 (units 15–17, chapters 29–34) ══════════════════════════════
 dict(n=15, band="11-12", title="Text, Transmission and Translation", strand="Text History", chapters=[
  dict(n=29, title="From Scroll to Codex: Masoretes, Scrolls and Versions", strand="Transmission",
       topics="the Dead Sea Scrolls (found 1947) — the Great Isaiah Scroll and what it shows; the Septuagint (Greek, c. 3rd–2nd century BCE) and where it differs; the Targums (Aramaic); the Samaritan Pentateuch; the Masoretes of Tiberias — vowels, accents, the masorah, the Aleppo Codex (c. 930 CE) and the Leningrad Codex (1008 CE); textual criticism and a famous variant; the printed Rabbinic Bible (Bomberg, 1525); the text today.",
       story="A shepherd throws a stone into a cave near the Dead Sea and hears a jar break"),
  dict(n=30, title="Translating the Tanakh", strand="Translation",
       topics="every translation interprets — Isaiah 7:14 in JPS 1917 and KJV; the JPS 1917 translation and its committee, and the 1985 NJPS; Buber and Rosenzweig's German; Everett Fox's English; Hebrew words that resist translation — chesed, tzedek, shalom, nefesh, ruach, torah; the name of God and how Jews write and say it; a verse in five translations; who translates, for whom, and why it matters.",
       story="One Hebrew word, six English words, and a committee that argued for a year"),
 ]),
 dict(n=16, band="11-12", title="Interpretation Across the Centuries", strand="Interpretation", chapters=[
  dict(n=31, title="Midrash, Rashi, Ibn Ezra and Maimonides", strand="Jewish Interpretation",
       topics="midrash halakhah and midrash aggadah — how the rabbis read (Genesis Rabbah on \"in the beginning\"); the Talmud's use of Scripture; the medieval commentators — Rashi's peshat and derash, Ibn Ezra's grammar, Ramban's argument with both, Radak; Maimonides on reading the Torah's language about God (the Guide) in brief; the Mikraot Gedolot page; kabbalistic reading in brief; reading as a conversation across a thousand years.",
       story="On one printed page, an 11th-century rabbi in France answers a 13th-century rabbi in Spain"),
  dict(n=32, title="Jewish, Christian and Academic Readings of the Same Text", strand="Readers Compared",
       topics="the same text, two canons — Tanakh and Old Testament; Isaiah 53, Psalm 22 and Genesis 1:26 read by rabbis and by church fathers; disputation and dialogue in history (Paris 1240, Barcelona 1263) and today; Spinoza (1670) and the beginnings of critical study; Wellhausen and the documentary hypothesis; archaeology from Albright to Finkelstein; literary criticism (Alter, Sternberg) in brief; feminist and other modern readings; what each kind of reader is asking.",
       story="Three readers open Isaiah 53 in one room: a rabbi, a pastor and a historian"),
 ]),
 dict(n=17, band="11-12", title="The Tanakh in Jewish Life and Capstone", strand="Capstone", chapters=[
  dict(n=33, title="The Tanakh in Prayer, Holiday, Home and Literature", strand="The Living Text",
       topics="the siddur as a mosaic of verses — the Shema, the Psalms, the Song of the Sea; the Torah service and the yearly cycle; the Haggadah's use of Deuteronomy 26; the Megillot and their holidays; the text in the home — mezuzah, tefillin, blessings; the Tanakh in Hebrew literature and Zionism, in Yiddish and American Jewish writing, in Black spirituals and American civic speech; the Tanakh in Chicago's synagogues and schools.",
       story="A tiny scroll in a case on the doorpost holds the words the whole course has been reading"),
  dict(n=34, title="Capstone: Arguing an Interpretation from Text and Commentary", strand="Capstone",
       topics="choosing a passage and a question; reading in JPS 1917 and one other translation; peshat first — structure, key words, gaps; then the commentators — Rashi, Ibn Ezra, Ramban, a midrash; then a modern reader; a thesis about what the text does and how it has been read; citing book, chapter and verse and the commentator; acknowledging other readings; a chavruta-style presentation; a rubric; reflection on studying a sacred text in a public school.",
       story="Two students, one verse, four commentaries and an argument that ends in a better question"),
 ]),
]

# Rooms already on the site that belong to each unit — nothing gets deleted.
# No hub of its own: the Daily Drafts "The Bible" and "Talmud" spirals for the
# band, the World Religions Hebrew Bible room (/r2), and the sister courses.
def _dd(grade, label):
    return [("/drops/bible/%s" % grade, "Daily Drafts — The Bible, grades %s" % label)]
LINKS = {
 1: _dd("K", "K–2") + [("/bible", "The Bible — the course")],
 2: _dd("1", "K–2") + [("/bible", "The Bible — the course")],
 3: _dd("2", "K–2") + [("/drops/talmud/2", "Daily Drafts — Talmud, grades K–2"), ("/talmud", "Talmud Study — the course")],
 4: _dd("3", "3–5") + [("/bible", "The Bible — the course"), ("/religions-course", "World Religions — the course")],
 5: _dd("4", "3–5") + [("/bible", "The Bible — the course")],
 6: _dd("4", "3–5") + [("/bible", "The Bible — the course")],
 7: _dd("5", "3–5") + [("/drops/talmud/5", "Daily Drafts — Talmud, grades 3–5")],
 8: _dd("6", "6–8") + [("/r2", "The Hebrew Bible — the room"), ("/r1", "How to read a sacred text — the room")],
 9: _dd("6", "6–8") + [("/r2", "The Hebrew Bible — the room"), ("/bible", "The Bible — the course")],
 10: _dd("7", "6–8") + [("/r2", "The Hebrew Bible — the room"), ("/talmud", "Talmud Study — the course")],
 11: _dd("8", "6–8") + [("/r2", "The Hebrew Bible — the room")],
 12: _dd("9-10", "9–10") + [("/r2", "The Hebrew Bible — the room"), ("/bible", "The Bible — the course")],
 13: _dd("9-10", "9–10") + [("/r2", "The Hebrew Bible — the room"), ("/drops/talmud/9-10", "Daily Drafts — Talmud, grades 9–10")],
 14: _dd("9-10", "9–10") + [("/r2", "The Hebrew Bible — the room")],
 15: _dd("11-12", "11–12") + [("/r1", "How to read a sacred text — the room"), ("/bible", "The Bible — the course")],
 16: _dd("11-12", "11–12") + [("/r4", "Judaism — the room"), ("/talmud", "Talmud Study — the course")],
 17: _dd("11-12", "11–12") + [("/r4", "Judaism — the room"), ("/r12", "World Religions capstone — the sources speak")],
}
