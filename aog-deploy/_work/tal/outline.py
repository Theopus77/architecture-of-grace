# Talmud Study, K–12 — the course arc. Our own wording: the Talmud studied in
# a public-school classroom — its rabbis and their stories (K–2), how the
# Mishnah and Gemara came to be and the famous stories (3–5), how a page is
# read and how an argument moves, with sugyot in paraphrase (6–8), real
# passages read in public-domain translation, then reasoning, history and a
# capstone (9–12). Argument and mercy are the two threads. Quotations only
# from public-domain translations (Rodkinson 1896–1903; Charles Taylor's
# Pirkei Avot 1877; JPS 1917 for verses); everything else paraphrased and
# marked so. Always described ("rabbinic tradition holds…", "the Gemara
# asks…"), never taught as true or false. Topics guide the writers; story =
# the chapter's opening narrative hook.
#
# Units number 1–17 straight through the course; chapters 1–34. Sister
# courses: The Hebrew Bible (heb), The Bible (bib), The Qur'an (qur), World
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
 dict(n=1, band="k-2", title="A Very Big Book of Questions", strand="The Book", chapters=[
  dict(n=1, title="What Is the Talmud?", strand="The Book",
       topics="the Talmud is a very big set of Jewish books — many volumes on a long shelf; it is full of rabbis (Jewish teachers) asking questions and answering each other; a page has words in the middle and more words all around; people study it two by two and talk out loud; Jewish people study it, and anyone can learn about it; \"the rabbis said\" and \"Jewish tradition\".",
       story="A library shelf so long that Sam counts twenty books before he gets to the end"),
  dict(n=2, title="The Torah and Its Rules", strand="Torah and Mitzvah",
       topics="the Torah is the first five books of the Bible, kept as a scroll; Jewish tradition says Moses received it at Mount Sinai; a rule in the Torah is a mitzvah; Shabbat — rest on the seventh day; a rule needs explaining — \"do no work\" makes people ask \"what counts as work?\"; the Talmud is where the rabbis worked out the answers; asking a good question is a way of learning.",
       story="The Torah says rest on Shabbat, and a whole class argues about whether coloring is work"),
 ]),
 dict(n=2, band="k-2", title="Rabbis Who Told Stories", strand="Stories", chapters=[
  dict(n=3, title="Hillel on One Foot", strand="Hillel and Shammai",
       topics="Hillel and Shammai were two rabbis about 2,000 years ago who often disagreed; a man asked Shammai to teach the whole Torah while he stood on one foot, and Shammai sent him away; the man asked Hillel, who said: what is hateful to you, do not do to another — the rest is explanation, go and learn; Hillel was patient; a rule you can stand on one foot for; kindness as the first lesson.",
       story="A man hops on one foot and asks for the whole Torah before he falls over"),
  dict(n=4, title="Honi and the Carob Tree, Akiva and the Water", strand="More Stories",
       topics="Honi saw an old man planting a carob tree that would not give fruit for seventy years, and the man said: my grandparents planted for me, I plant for my grandchildren; Rabbi Akiva was a shepherd who could not read until he was forty, saw water wearing a hole in a stone, and decided that if water can do that, learning can shape him; planting for others; it is never too late to learn.",
       story="An old man plants a tree he will never eat from, and a passerby cannot understand why"),
 ]),
 dict(n=3, band="k-2", title="Learning Together", strand="How to Study", chapters=[
  dict(n=5, title="Two Voices, One Page", strand="Chavruta",
       topics="Talmud is studied with a partner (a chavruta), out loud, with questions; disagreeing kindly — Hillel's students and Shammai's students disagreed and still married each other's children; the rabbis said both sides can be \"words of the living God\"; when you do not understand, you ask; when your friend is wrong, you say why, gently; a study partner is a friend who makes you think.",
       story="Two kids read one page together and get stuck on the same word"),
  dict(n=6, title="Kindness Rules from the Rabbis", strand="Mitzvot",
       topics="visiting someone who is sick; welcoming a guest, like Abraham running to feed strangers; honoring parents; not embarrassing someone in front of others; returning a lost thing to its owner; giving tzedakah — a share for people who need it; feeding animals before yourself; the rabbis made rules about being kind, and this course will read them.",
       story="A lost mitten on the playground, and the class makes a rule about lost things"),
 ]),

 # ══════════════════════════════ 3–5 (units 4–7, chapters 7–14) ══════════════════════════════
 dict(n=4, band="3-5", title="From Sinai to the Mishnah", strand="Origins", chapters=[
  dict(n=7, title="Written Torah and Oral Torah", strand="Oral Torah",
       topics="rabbinic tradition holds that at Sinai Moses received the Written Torah and an Oral Torah — the explanations; the Oral Torah was passed by memory teacher to student; Ezra reads the Torah aloud (c. 450 BCE); the Men of the Great Assembly; the Pharisees and the Sadducees disagreed about the Oral Torah; the Second Temple; Hillel and Shammai; why the rules needed explaining — what counts as work, how to keep a holiday.",
       story="A chain of teachers and students, each one remembering what the last one said"),
  dict(n=8, title="Judah the Prince Writes It Down", strand="The Mishnah",
       topics="the Temple is destroyed by Rome (70 CE); Rabbi Yochanan ben Zakkai escapes Jerusalem in a coffin and starts a school at Yavneh; the rabbis fear the Oral Torah will be forgotten; Rabbi Judah the Prince gathers it into the Mishnah (c. 200 CE); six orders — Seeds, Festivals, Women, Damages, Holy Things, Purities — and 63 tractates; short and clear, in Hebrew; the Mishnah as the seed of the Talmud.",
       story="A rabbi is carried out of a burning city in a coffin and asks the general for a school"),
 ]),
 dict(n=5, band="3-5", title="The Gemara and the Two Talmuds", strand="The Talmud", chapters=[
  dict(n=9, title="Babylon and the Land of Israel", strand="The Gemara",
       topics="after the Mishnah, rabbis in the Land of Israel and in Babylon (today's Iraq) discussed it for 300 years; that discussion is the Gemara, in Aramaic; the academies of Sura and Pumbedita; the Jerusalem Talmud (c. 400 CE) and the Babylonian Talmud (c. 500 CE) — the Babylonian is longer and the one most studied; Ravina and Rav Ashi as its editors, tradition says; Mishnah plus Gemara equals Talmud.",
       story="A question asked in Tiberias, answered in Babylon three generations later"),
  dict(n=10, title="A Page of Talmud", strand="The Page",
       topics="the daf — one leaf, two sides (2a, 2b); the Mishnah and Gemara in the middle column; Rashi's explanation on the inside; the Tosafot's questions on the outside; the Vilna printing (1880s) that fixed the page everyone uses; 2,711 pages; Daf Yomi — one page a day, the whole Talmud in about seven and a half years, studied by people all over the world at once; finding tractate Berakhot page 2.",
       story="A grandmother and a grandson in different cities read the same page on the same morning"),
 ]),
 dict(n=6, band="3-5", title="Famous Stories from the Talmud", strand="Aggadah", chapters=[
  dict(n=11, title="The Oven of Akhnai: \"It Is Not in Heaven\"", strand="Argument",
       topics="Rabbi Eliezer and the other rabbis argue about an oven; he calls on a carob tree, a stream and the walls to prove him right, and finally a voice from heaven; Rabbi Joshua answers with a verse — the Torah \"is not in heaven\" — meaning people must decide by majority; the story's sad ending, told gently; what the story says about how the rabbis decided; disagreement with respect.",
       story="A carob tree jumps, a stream runs backward, and the rabbis still say no"),
  dict(n=12, title="Rabbi Akiva, Rachel and Beruriah", strand="People",
       topics="Akiva the shepherd, his wife Rachel who sent him to study for twenty-four years, his 24,000 students, and his \"love your neighbor as yourself is a great principle\"; Beruriah, a learned woman quoted in the Talmud, wife of Rabbi Meir, who read a psalm to say: pray for sins to end, not sinners; Rabbi Meir; the rabbis as people with families and jobs — a shoemaker, a woodcutter, a doctor.",
       story="A woman corrects her husband's prayer with a better reading of a verse"),
 ]),
 dict(n=7, band="3-5", title="Fair and Kind: Talmud in Everyday Life", strand="Halakhah for Kids", chapters=[
  dict(n=13, title="Lost and Found, Honest Weights, Fair Wages", strand="Bava Metzia",
       topics="the tractate Bava Metzia (\"the middle gate\") is about things people find, buy, borrow and lend; returning a lost object — the finder announces it, the owner describes a sign; when a thing has no sign and the owner has given up; honest scales and no overcharging (ona'ah); pay a worker the same day (from Deuteronomy); the Talmud says do not hurt someone with words either.",
       story="Two people grab one coat at the same time and both say \"it's mine\""),
  dict(n=14, title="Tzedakah, Guests and Saving a Life", strand="Mercy",
       topics="tzedakah is justice, not just charity — everyone gives, even the poor; the anonymous gift; welcoming guests is greater than greeting the Divine Presence, the rabbis said of Abraham; visiting the sick; pikuach nefesh — saving a life comes before almost every other rule, even Shabbat; \"whoever saves one life, it is as if he saved a whole world\" (Mishnah Sanhedrin); the rabbis' rules for mercy.",
       story="A rule says rest on Shabbat, and a rabbi says: drive the ambulance"),
 ]),

 # ══════════════════════════════ 6–8 (units 8–11, chapters 15–22) ══════════════════════════════
 dict(n=8, band="6-8", title="How a Page Is Read", strand="Method", chapters=[
  dict(n=15, title="Mishnah, Gemara, Rashi, Tosafot: The Vilna Page", strand="The Page",
       topics="the layout — Mishnah and Gemara at the center, Rashi (1040–1105) on the inner margin, Tosafot (his grandsons and students, 12th–13th centuries) on the outer; the smaller commentaries and cross-references; Aramaic and Hebrew; Bomberg's first full printing (Venice, 1520–23) and the Vilna Shas (1880–86); modern editions and translations — Steinsaltz, Schottenstein, Sefaria online; how to cite (Berakhot 2a); the tractates and their orders.",
       story="A printer in Venice, a Christian, decides where every commentary will sit for the next 500 years"),
  dict(n=16, title="The Moves of the Gemara: Question, Proof, Objection, Answer", strand="Argument",
       topics="the shape of a sugya — a Mishnah, a question, a proof from a verse or an earlier teaching (baraita), an objection, a resolution, or teyku (\"let it stand\"); the terms — kushya, terutz, mai ta'ama; the reasoning tools — a fortiori (kal va-chomer), analogy (gezerah shavah); named voices — Rav and Shmuel, Abaye and Rava; building a mock sugya about a school rule; why the argument is kept, not just the answer.",
       story="A class turns \"no phones in class\" into a page of Talmud with five objections"),
 ]),
 dict(n=9, band="6-8", title="The Rabbis and Their World", strand="History", chapters=[
  dict(n=17, title="Second Temple to Yavneh", strand="Origins",
       topics="Judea under Greece and Rome; Pharisees, Sadducees, Essenes; Hillel and Shammai (c. 1st century BCE); the destruction of the Temple (70 CE) and Yochanan ben Zakkai; Yavneh and the beginnings of rabbinic Judaism — prayer in place of sacrifice; the Bar Kokhba revolt (132–135) and Rabbi Akiva's death; Usha and the Galilee; Judah the Prince and the Mishnah (c. 200); what historians know and what the Talmud tells.",
       story="A general asks a rabbi what he wants, and the rabbi asks for a town of scholars"),
  dict(n=18, title="Tannaim and Amoraim: Academies, Empires and the Editors", strand="Making the Talmud",
       topics="the Tannaim (Mishnah teachers) and the Amoraim (Gemara teachers) by generation; the academies of Tiberias and Caesarea, Sura, Pumbedita and Nehardea; Rav and Shmuel, Rabbi Yochanan and Resh Lakish, Abaye and Rava, Rav Ashi and Ravina; the Exilarch; Jewish life under the Persian Sasanians and Christian Rome; the Savoraim and the closing of the Talmud (c. 500–600); the Geonim after.",
       story="Two study partners who were once a rabbi and a bandit, and what happened when one died"),
 ]),
 dict(n=10, band="6-8", title="Sugyot in Paraphrase I: Time and Damages", strand="Halakhah", chapters=[
  dict(n=19, title="Shabbat, the Shema and Hanukkah", strand="Berakhot and Shabbat",
       topics="Berakhot 2a — \"from when do we recite the evening Shema?\" — the Talmud's first question and how it is argued; the 39 categories of Shabbat work and how they come from the tabernacle; carrying and the eruv; Hanukkah in Shabbat 21b — the story of the oil, Hillel and Shammai on how to light the candles, and \"we light the way of Hillel\"; time as the Talmud's first subject.",
       story="The first page of the Talmud asks what time it is"),
  dict(n=20, title="The Ox, the Pit and the Fire: Damages and Neighbors", strand="Bava Kamma and Bava Metzia",
       topics="the four fathers of damage — the ox, the pit, the grazing animal, the fire — and what they teach about responsibility; the ox that gored (Exodus 21) and \"an eye for an eye\" read as money; the two who hold one cloak (Bava Metzia 2a) and dividing fairly; lost objects and despair (ye'ush); wronging with words (ona'at devarim); \"love your neighbor\" as a great principle; the rabbis on wages, tenants and neighbors.",
       story="A pit dug in a public street, a fallen ox and a question that lasts three pages"),
 ]),
 dict(n=11, band="6-8", title="Sugyot in Paraphrase II: Argument and Mercy", strand="Aggadah and Ethics", chapters=[
  dict(n=21, title="Hillel and Shammai, Akhnai and \"These and Those\"", strand="Argument",
       topics="the Houses of Hillel and Shammai and why the law follows Hillel (Eruvin 13b — \"these and those are the words of the living God\", and the Hillelites taught the other view first); the Oven of Akhnai (Bava Metzia 59b) as an argument about authority — and its second half, on hurting with words; Rabbi Joshua and the emperor's daughter; Rabbi Eliezer's ban; how the Talmud keeps minority opinions; disagreement for the sake of heaven (Avot 5).",
       story="A heavenly voice takes one side, and the rabbis politely overrule it"),
  dict(n=22, title="Aggadah: Pirkei Avot, Speech, Repentance", strand="Ethics",
       topics="aggadah — the stories and ethics woven through the law; Pirkei Avot — the chain of tradition, \"if I am not for myself…\", \"it is not your duty to finish the work…\", \"who is wise?\" (Taylor 1877); the ethics of speech — lashon hara, embarrassing someone is like shedding blood; repentance (teshuvah) in Yoma — sins against God and against people; Elisha ben Abuyah, the rabbi who left; mercy as the Talmud's counterweight to argument.",
       story="\"Who is rich? The one who is happy with what he has\" — a saying tested on a Tuesday"),
 ]),

 # ══════════════════════════════ 9–10 (units 12–14, chapters 23–28) ══════════════════════════════
 dict(n=12, band="9-10", title="Reading Real Passages: Berakhot and Shabbat", strand="Texts Close Up", chapters=[
  dict(n=23, title="Berakhot 2a–3a: The Evening Shema", strand="Berakhot",
       topics="the Mishnah's first line and the Gemara's first question (\"where does the tanna stand?\"); the priests, the stars and the poor man's dinner as three markers of nightfall; the watches of the night and David's harp; reading Rodkinson's translation (1896–1903) against the page — its strengths and its gaps; identifying the moves; a first sugya read from the actual text.",
       story="\"Where does the teacher stand?\" — the first question the Talmud asks about its first line"),
  dict(n=24, title="Shabbat 31a and 21b: Hillel's Convert and the Hanukkah Lights", strand="Shabbat",
       topics="Shabbat 31a — the three converts, Shammai's measuring rod, Hillel's patience, \"what is hateful to you…\", and the man who wanted to be High Priest; Shabbat 21b — \"what is Hanukkah?\", the cruse of oil, the Houses on the order of lighting, the lamp at the door; halakhah and aggadah in one passage; Rodkinson's text and a modern paraphrase side by side.",
       story="A man bets four hundred zuz that he can make Hillel angry"),
 ]),
 dict(n=13, band="9-10", title="Reading Real Passages: Bava Metzia and Sanhedrin", strand="Texts Close Up", chapters=[
  dict(n=25, title="Bava Metzia 59b: The Oven of Akhnai and Wronging with Words", strand="Bava Metzia",
       topics="the full sugya — the oven, the miracles, \"it is not in heaven\" (Deuteronomy 30:12 in JPS 1917), Rabbi Nathan meets Elijah (\"my children have defeated me\"), the ban on Rabbi Eliezer, Rabban Gamliel's death; the frame — ona'at devarim, why the passage is about hurting with words; authority, majority and mercy read together; modern readers (Orthodox, Conservative, academic) on the passage.",
       story="Elijah reports that heaven laughed and said, \"My children have defeated me\""),
  dict(n=26, title="Sanhedrin 37a and Makkot 7a: One Life, and a Court That Rarely Kills", strand="Sanhedrin",
       topics="Mishnah Sanhedrin 4:5 — how witnesses are warned, \"whoever destroys one life… whoever saves one life\" (and the two versions of the line); every person a whole world; the court's procedure — 23 judges, examination, the bias toward acquittal; Makkot 7a — a Sanhedrin that executes once in seven (or seventy) years is called destructive, and Akiva and Tarfon's answer; capital law as a text against its own use.",
       story="Two rabbis say that if they had sat on the court, no one would ever have been executed"),
 ]),
 dict(n=14, band="9-10", title="Law and Story Together", strand="Texts Close Up", chapters=[
  dict(n=27, title="Pirkei Avot 1–2: The Chain and the Sayings", strand="Avot",
       topics="Avot 1:1 — the chain from Moses to the Men of the Great Assembly and the three sayings; the pairs (zugot); Hillel's sayings (1:12–14); Rabban Gamliel, Judah the Prince; \"the day is short, the work is great\" (2:15–16); Charles Taylor's 1877 translation as the public-domain text; Avot in the siddur (Shabbat afternoons between Passover and Shavuot); a saying explained and one argued with.",
       story="Forty generations in one sentence, and then a rule about judging slowly"),
  dict(n=28, title="Ta'anit and Yoma: Rain, Honi, Repentance and Yom Kippur", strand="Ta'anit and Yoma",
       topics="Ta'anit 23a — Honi the circle-drawer, the seventy-year sleep, the carob tree; Nakdimon ben Gurion and the rain; fasting for rain and the ethics of prayer; Yoma 85b — pikuach nefesh, the verses argued; Yoma 8:9 — Yom Kippur atones for sins against God, not between people until they are reconciled; law, story and mercy in one tractate.",
       story="A man draws a circle in the dust and says he will not step out until it rains"),
 ]),

 # ══════════════════════════════ 11–12 (units 15–17, chapters 29–34) ══════════════════════════════
 dict(n=15, band="11-12", title="Talmudic Reasoning and Halakhah", strand="Reasoning", chapters=[
  dict(n=29, title="The Thirteen Rules, Logic and the Codes", strand="Hermeneutics",
       topics="Rabbi Ishmael's thirteen rules of interpretation (in the siddur) — a fortiori, analogy, general and particular; Rabbi Akiva's reading of every letter; how a sugya's reasoning is analyzed (the Brisker method in brief); from Talmud to code — the Geonim, Alfasi (Rif), Maimonides's Mishneh Torah (1180), the Tur, Karo's Shulchan Arukh (1565) and Isserles's gloss; how a rule travels from a page to a practice.",
       story="Thirteen rules recited every morning, most people never asking what they are for"),
  dict(n=30, title="Responsa, Custom and Modern Questions", strand="Halakhah Today",
       topics="the responsa literature — a question sent, an answer reasoned from the sources; minhag (custom) and its force; modern questions argued Talmudically — electricity on Shabbat, organ donation and brain death, medical ethics, technology, women's Torah study and ordination across Orthodox, Conservative and Reform; how each movement reads the same sugya; a responsum read in paraphrase.",
       story="A letter asks whether a lamp switch is a fire, and the answer runs twenty pages"),
 ]),
 dict(n=16, band="11-12", title="The Talmud in History", strand="History", chapters=[
  dict(n=31, title="Burning and Printing: From Paris 1240 to Vilna", strand="Survival",
       topics="the disputation of Paris (1240) and the burning of the Talmud (1242); censorship and the Basel Talmud; Bomberg's printing (1520–23) and the fixed page; the Council of Trent; Poland-Lithuania and the yeshiva; the Vilna Shas (1880–86) and the Romm press; the Vilna Gaon; Daf Yomi (1923, Rabbi Meir Shapiro); the Holocaust and the survivors' Talmud printed by the U.S. Army in Germany (1949).",
       story="Twenty-four wagonloads of manuscripts burned in a Paris square, and the text survived"),
  dict(n=32, title="Talmud Beyond the Yeshiva", strand="The Talmud Today",
       topics="academic Talmud study — Wissenschaft des Judentums, manuscripts and text criticism (the Munich codex), the Cairo Genizah; women's Talmud study — Beruriah to the 20th century, Nechama Leibowitz, women's batei midrash, the Siyum HaShas of 2020; Talmud in Israeli law and public life; the Talmud in literature (Agnon, Potok) and in comparative law courses; Sefaria and the open text; Talmud study in Chicago.",
       story="A stadium fills to celebrate finishing a book that takes seven and a half years to read"),
 ]),
 dict(n=17, band="11-12", title="Great Debates and Capstone", strand="Capstone", chapters=[
  dict(n=33, title="Honoring Parents, and \"These and Those\": A Whole Sugya", strand="Kiddushin and Eruvin",
       topics="Kiddushin 30b–31b — honor and reverence for parents, what each includes, Dama ben Netina the non-Jew who would not wake his father, the limits of the obligation; Eruvin 13b — three years of argument and the heavenly voice, \"these and those are the words of the living God\", why the law follows Hillel; reading a whole sugya start to finish and mapping its moves; argument and mercy as one method.",
       story="A jeweler loses a fortune rather than wake his sleeping father, and the rabbis take notes"),
  dict(n=34, title="Capstone: Chavruta — Present a Sugya, Its Argument and Its Mercy", strand="Capstone",
       topics="choosing a sugya from the course or another in public-domain translation; reading it with a partner; mapping the moves — Mishnah, question, proof, objection, answer; the commentators (Rashi, Tosafot in paraphrase) and one modern reader; a thesis about what the argument decides and what it protects; citing tractate and page; a chavruta-style presentation with the partner taking the other side; a rubric; reflection on studying a sacred text in a public school.",
       story="Two students stand at the front, take opposite sides of a page, and agree on what it is about"),
 ]),
]

# Rooms already on the site that belong to each unit — nothing gets deleted.
# No hub of its own: the Daily Drafts "Talmud" spiral for the band, the World
# Religions Judaism room (/r4), and the sister courses.
def _dd(grade, label):
    return [("/drops/talmud/%s" % grade, "Daily Drafts — Talmud, grades %s" % label)]
LINKS = {
 1: _dd("K", "K–2") + [("/hebrew-bible", "The Hebrew Bible — the course")],
 2: _dd("1", "K–2") + [("/hebrew-bible", "The Hebrew Bible — the course")],
 3: _dd("2", "K–2") + [("/religions-course", "World Religions — the course")],
 4: _dd("3", "3–5") + [("/hebrew-bible", "The Hebrew Bible — the course")],
 5: _dd("4", "3–5") + [("/religions-course", "World Religions — the course")],
 6: _dd("4", "3–5") + [("/hebrew-bible", "The Hebrew Bible — the course")],
 7: _dd("5", "3–5") + [("/religions-course", "World Religions — the course")],
 8: _dd("6", "6–8") + [("/r4", "Judaism — the room"), ("/r1", "How to read a sacred text — the room")],
 9: _dd("7", "6–8") + [("/r4", "Judaism — the room"), ("/hebrew-bible", "The Hebrew Bible — the course")],
 10: _dd("7", "6–8") + [("/r4", "Judaism — the room")],
 11: _dd("8", "6–8") + [("/r4", "Judaism — the room")],
 12: _dd("9-10", "9–10") + [("/r4", "Judaism — the room")],
 13: _dd("9-10", "9–10") + [("/r4", "Judaism — the room"), ("/hebrew-bible", "The Hebrew Bible — the course")],
 14: _dd("9-10", "9–10") + [("/r4", "Judaism — the room")],
 15: _dd("11-12", "11–12") + [("/r4", "Judaism — the room"), ("/quran", "The Qur'an — the course")],
 16: _dd("11-12", "11–12") + [("/r4", "Judaism — the room"), ("/r10", "Religion and the world — the room")],
 17: _dd("11-12", "11–12") + [("/r12", "World Religions capstone — the sources speak")],
}
