# Chinese Classics, K–12 — the course arc. Our own wording: the Analects and
# the Daodejing (with Mencius and the Zhuangzi beside them) read as philosophy
# and ethics in a public-school classroom — stories of Confucius, Laozi and
# Zhuangzi and the values of family, friendship and harmony (K–2), what the
# classics are, their key teachings and the festivals that carry them (3–5),
# the Warring States, the Hundred Schools, the canon and its history (6–8),
# close reading of the Analects, the Daodejing, Mencius and the Zhuangzi in
# public-domain translation (9–10), then interpretation, comparison and a
# capstone (11–12). Quotations only from public-domain translations (Legge's
# Analects 1861/1893, Tao Teh King SBE 39 1891, Mencius 1861/1895); everything
# else paraphrased and marked so. Always described ("Confucius taught…",
# "the Daodejing says…", "Daoists practice…"). Whether Confucianism is a
# religion is itself a debated question the course names, not settles.
# Topics guide the writers; story = the chapter's opening narrative hook.
#
# Units number 1–17 straight through the course; chapters 1–34. Sister
# courses: Hindu Texts (hin), Buddhist Texts (bud), World Religions (rel).

BANDS = [
 dict(id="k-2",   title="Grades K–2",   level="k2"),
 dict(id="3-5",   title="Grades 3–5",   level="35"),
 dict(id="6-8",   title="Grades 6–8",   level="68"),
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
]

UNITS = [
 # ══════════════════════════════ K–2 (units 1–3, chapters 1–6) ══════════════════════════════
 dict(n=1, band="k-2", title="Stories of Confucius", strand="Confucius", chapters=[
  dict(n=1, title="A Boy Who Loved to Learn", strand="Confucius",
       topics="Confucius (Kongzi, \"Master Kong\") lived in China about 2,500 years ago, in a state called Lu; his father died when he was small and his family was poor; he worked hard jobs and loved to learn; he said he set his heart on learning at fifteen; loving to learn is something anyone can do; his words were written down by his students in a book called the Analects.",
       story="A poor boy in old China counts grain for a living and practices old songs at night"),
  dict(n=2, title="Teacher Kong and His Students", strand="Confucius",
       topics="Confucius taught anyone who wanted to learn, rich or poor; his students — Yan Hui, who was poor and happy, and Zilu, who was brave and quick; good manners and respect (li); treat others the way you want to be treated — his rule about reciprocity, told simply; Teachers' Day on his birthday in Taiwan (September 28); what makes a good teacher and a good student.",
       story="A student asks the teacher one word to live by, and the teacher answers with one word"),
 ]),
 dict(n=2, band="k-2", title="Stories of Laozi and Zhuangzi", strand="The Dao", chapters=[
  dict(n=3, title="The Old Master Rides West", strand="Laozi",
       topics="Laozi, the \"Old Master\" — a teacher so old, the stories say, that his name means old; the legend that he rode west on a water buffalo and a gatekeeper asked him to write down his wisdom before leaving; the book called the Daodejing; the Dao — \"the Way\"; be gentle and simple; historians are not sure Laozi was one real person, and we can say so kindly.",
       story="A gatekeeper stops an old man on a water buffalo and asks for one thing before he goes"),
  dict(n=4, title="The Butterfly Dream and the Useless Tree", strand="Zhuangzi",
       topics="Zhuangzi, a teacher who told funny, puzzling stories; he dreamed he was a butterfly and woke up wondering if he was a butterfly dreaming he was Zhuangzi; the big crooked tree no carpenter wanted, which grew old and gave shade to everyone; being different can be good; asking \"what if?\"; the stories are paraphrased for little readers.",
       story="A man wakes from a dream about flying and is not sure who he is"),
 ]),
 dict(n=3, band="k-2", title="Family, Friends and Harmony", strand="Values", chapters=[
  dict(n=5, title="Respect at Home and the New Year", strand="Family",
       topics="filial piety (xiao) — caring for and respecting parents and grandparents, as Confucius taught; Lunar New Year — cleaning the house, red envelopes, dumplings, visiting elders, dragon and lion dances; families who keep it in Chicago's Chinatown and beyond; honoring ancestors at Qingming; many families keep these customs whatever their beliefs; how we show respect at home.",
       story="A girl sweeps the whole house the day before New Year, and her grandmother tells her why"),
  dict(n=6, title="Be Like Water", strand="Harmony",
       topics="the Daodejing says the best is like water — soft, helping everything, going to low places (paraphrase for K–2); water wears away stone; yin and yang — two sides that fit together, like day and night; harmony — getting along; bamboo that bends in wind and does not break; staying calm; friends who are different fit together.",
       story="A drop of water falls on the same stone every day, and one day there is a hole"),
 ]),

 # ══════════════════════════════ 3–5 (units 4–7, chapters 7–14) ══════════════════════════════
 dict(n=4, band="3-5", title="What the Classics Are", strand="The Books", chapters=[
  dict(n=7, title="The Analects: Sayings Collected by Students", strand="The Analects",
       topics="the Analects (Lunyu, \"collected sayings\") — 20 short books of sayings and conversations, gathered by Confucius's students and their students after his death; \"The Master said…\"; not one long story but many short scenes; bamboo strips tied with cord; James Legge's English translation (1861); the Analects as one of the Four Books students memorized for centuries.",
       story="Students sit down after their teacher's death and each writes what they remember him saying"),
  dict(n=8, title="The Daodejing: 81 Short Chapters", strand="The Daodejing",
       topics="the Daodejing (Tao Te Ching, \"the classic of the way and its power\") — about 5,000 Chinese characters in 81 short poetic chapters; its famous first line that the Dao that can be spoken is not the lasting Dao; one of the most translated books in the world; Legge's translation (1891); the oldest copies on bamboo found at Guodian in 1993; the same ideas in poems and pictures.",
       story="A girl counts the characters in a poem and learns the whole book is only about 5,000 of them"),
 ]),
 dict(n=5, band="3-5", title="Key Teachings of Confucius", strand="Confucian Ethics", chapters=[
  dict(n=9, title="Ren, Li and the Junzi", strand="Virtues",
       topics="ren — humaneness, caring for others; li — ritual and good manners that show respect; yi — doing what is right; the junzi — the \"exemplary person\" whom Confucius described; \"What you do not want done to yourself, do not do to others\" (Analects 15.23 in Legge's numbering, paraphrased here); learning and practicing (Analects 1.1); examples from school life.",
       story="A new student forgets to bow and wonders if manners really matter"),
  dict(n=10, title="Five Relationships and Mencius's Sprouts", strand="Relationships",
       topics="the five relationships — ruler and subject, parent and child, husband and wife, older and younger sibling, friend and friend — each with duties both ways; Mencius (Mengzi), a later teacher; his mother moved three times to find a good place for him to learn (a famous story); Mencius taught that everyone has sprouts of goodness; the child at the well, told simply.",
       story="A mother moves house three times until her son copies the right neighbors"),
 ]),
 dict(n=6, band="3-5", title="Key Teachings of the Dao", strand="Daoist Thought", chapters=[
  dict(n=11, title="The Dao, Wu Wei and Yin-Yang", strand="Big Ideas",
       topics="the Dao — the Way of nature that the Daodejing says cannot be fully named; wu wei — acting without forcing, like a good swimmer who goes with the current; yin and yang — the taijitu symbol, opposites that need each other; de — power or virtue; examples from nature and sport; Daoism as a philosophy and, for many people, a religion with temples and priests.",
       story="A swimmer stops fighting a strong current and floats safely to shore"),
  dict(n=12, title="Water, the Uncarved Block and Simplicity", strand="Images",
       topics="the Daodejing's images: water (ch. 8, 78), the uncarved block (pu), the empty hub of a wheel and the empty bowl (ch. 11), the small village (ch. 80); simplicity and wanting less; Cook Ding and his knife (Zhuangzi); the frog in the well who thinks the sky is small (Zhuangzi); images as a way to teach ideas.",
       story="A cook's knife stays sharp for nineteen years, and a king asks him how"),
 ]),
 dict(n=7, band="3-5", title="Festivals and Everyday Life", strand="Practice", chapters=[
  dict(n=13, title="New Year, Qingming and the Mid-Autumn Moon", strand="Festivals",
       topics="the lunar calendar; Lunar New Year and the zodiac animals; Qingming (Tomb-Sweeping Day) — cleaning family graves, honoring ancestors; Dragon Boat Festival and the poet Qu Yuan; Mid-Autumn Festival — mooncakes, lanterns, the moon lady Chang'e; how Confucian respect for family shows in these days; festivals kept in China, Taiwan, Korea, Vietnam and across America.",
       story="A family climbs a hill with brooms and flowers to sweep their great-grandparents' graves"),
  dict(n=14, title="Temples, Teachers and Chinatown", strand="Community",
       topics="Confucius temples (the one in his hometown Qufu) and the Teachers' Day ceremony; Daoist temples, incense and priests; the civil-service exams that made the classics the heart of schooling for about 1,300 years; Chicago's Chinatown on the South Side and its Lunar New Year parade; many Chinese Americans mix Confucian, Daoist, Buddhist, Christian or no religious practice; respect when visiting.",
       story="A boy watches a lion dance in Chicago's Chinatown and asks why it bows at the doors"),
 ]),

 # ══════════════════════════════ 6–8 (units 8–11, chapters 15–22) ══════════════════════════════
 dict(n=8, band="6-8", title="The Age of Philosophers", strand="History", chapters=[
  dict(n=15, title="Zhou, Spring and Autumn and the Hundred Schools", strand="Ancient China",
       topics="the Zhou dynasty and the Mandate of Heaven; the Spring and Autumn period (771–476 BCE) and the Warring States (475–221 BCE); Confucius (traditional dates 551–479 BCE); wandering advisers looking for a ruler to listen; the \"Hundred Schools of Thought\" — Confucians, Daoists, Mohists, Legalists; why chaos produced philosophy; primary sources vs. later legends.",
       story="An adviser travels from court to court, and no king will take his advice"),
  dict(n=16, title="Mozi, the Legalists and the Burning of the Books", strand="Rivals",
       topics="Mozi and universal love (jian ai), against expensive rituals and war; Han Feizi and the Legalists — strict law, reward and punishment; the Qin unification (221 BCE) and the burning of books (213 BCE), as Sima Qian reports it and as historians weigh it; the Han dynasty choosing Confucian learning; debate among schools as the setting of the classics.",
       story="A minister orders the old books burned, and a scholar hides a set inside a wall"),
 ]),
 dict(n=9, band="6-8", title="The Confucian Classics", strand="Confucian Texts", chapters=[
  dict(n=17, title="Four Books and Five Classics", strand="The Canon",
       topics="the Five Classics — Book of Songs (Shijing), Book of Documents, Book of Changes (Yijing), Book of Rites, Spring and Autumn Annals; the Four Books — Analects, Mencius, Great Learning, Doctrine of the Mean — grouped by Zhu Xi (1100s); the Analects' structure and who compiled it (scholars debate layers); genres — sayings, dialogue, poetry, history, divination.",
       story="A student in 1500 must memorize over 400,000 characters of classics to sit for an exam"),
  dict(n=18, title="Mencius and Xunzi: Is Human Nature Good?", strand="Debate",
       topics="Mencius (c. 372–289 BCE): human nature is good, the four sprouts, the child at the well (2A.6), rulers who lose the people's trust may lose the Mandate; Xunzi (c. 310–235 BCE): human nature is bad and needs shaping, like warping a board straight; a real debate inside one tradition; Legge's Mencius quoted exactly; Xunzi paraphrased.",
       story="Two teachers look at the same crying child and draw opposite conclusions"),
 ]),
 dict(n=10, band="6-8", title="The Daoist Texts", strand="Daoist Texts", chapters=[
  dict(n=19, title="Laozi, the Zhuangzi and the Guodian Bamboo", strand="Texts and Authors",
       topics="the Daodejing's authorship — Sima Qian's biography of Laozi and its uncertainty; the Mawangdui silk copies (1973) with the halves reversed; the Guodian bamboo slips (1993, c. 300 BCE); the Zhuangzi (inner chapters and later ones), its humor, dialogues and tall tales; poetry vs. story as genres; translation difficulty — one character, many English words.",
       story="Archaeologists open a tomb in 1993 and find the Daodejing written on bamboo 2,300 years ago"),
  dict(n=20, title="Daoism as Religion: Temples, Immortals and the Canon", strand="Daoist Religion",
       topics="religious Daoism as a living tradition — the Celestial Masters (2nd c. CE), Laozi honored as a deity by Daoists, the Daozang canon (1445 edition, about 1,400 texts), temples, priests, festivals, tai chi and qigong; the Eight Immortals in art; distinguishing philosophical and religious Daoism, and why many scholars now say the line is blurry; respectful description.",
       story="Incense smoke curls through a Daoist temple as a priest in embroidered robes chants"),
 ]),
 dict(n=11, band="6-8", title="The Classics Through History", strand="History and Travel", chapters=[
  dict(n=21, title="Empire, Exams and Neo-Confucianism", strand="The Imperial Age",
       topics="the Han and state Confucianism; Buddhism's arrival and the three teachings (Confucianism, Daoism, Buddhism) side by side; the civil-service exams (Sui/Tang to 1905); Zhu Xi's commentary made the exam standard (1313); Neo-Confucianism in Korea (Joseon), Japan and Vietnam; women's education texts (Ban Zhao's Lessons for Women, c. 100 CE); who was left out.",
       story="In 1905 the emperor ends an exam that had shaped China for thirteen centuries"),
  dict(n=22, title="The Classics Travel West", strand="Translation",
       topics="Jesuits in China (Matteo Ricci, 1600s) and the first Latin Confucius (1687); Voltaire and the Enlightenment; James Legge in Hong Kong and Oxford, The Chinese Classics (1861–72) and Sacred Books of the East (1879–91); the Daodejing's many English versions; Chinese immigrants in America and the Exclusion Act (1882); the classics in American classrooms today.",
       story="A Scottish missionary and a Chinese scholar, Wang Tao, work side by side on a translation"),
 ]),

 # ══════════════════════════════ 9–10 (units 12–14, chapters 23–28) ══════════════════════════════
 dict(n=12, band="9-10", title="Close Reading the Analects", strand="The Analects", chapters=[
  dict(n=23, title="Learning, Filial Piety and Governing by Virtue", strand="Analects 1–2",
       topics="Legge's translation quoted exactly: 1.1 (learning with constant perseverance), 1.2 (filial piety and fraternal submission as the root), 2.1 (governing by virtue like the north polar star), 2.3 (lead by virtue and propriety, not punishment), 2.4 (the life stages from fifteen to seventy), 2.7 (filial piety is more than feeding); who speaks — the Master or a disciple; chapter numbering differences.",
       story="A student reads 2.4 aloud and her grandfather says he is at \"sixty\" and still listening"),
  dict(n=24, title="Ren, Reciprocity and the Rectification of Names", strand="Analects 4, 12, 13, 15",
       topics="ren in 12.1 and 12.22 (\"to love all men\"); the negative Golden Rule in 15.23 (Legge: \"What you do not want done to yourself, do not do to others\") and 12.2; shu, reciprocity (4.15, 15.23); rectification of names (13.3); the junzi and the small man (4.16); Yan Hui's poverty (6.9); reading a short saying in context of its neighbors; how Legge's word choices shape a reading.",
       story="A disciple asks for one word to live by all his life, and the Master gives him \"reciprocity\""),
 ]),
 dict(n=13, band="9-10", title="Close Reading the Daodejing", strand="The Daodejing", chapters=[
  dict(n=25, title="Naming, Opposites, Water and Emptiness", strand="Daodejing 1, 2, 8, 11",
       topics="Legge's Tao Teh King (SBE 39, 1891) quoted exactly: ch. 1 (the Tao that can be trodden is not the enduring Tao), ch. 2 (opposites give birth to each other), ch. 8 (the highest excellence is like water), ch. 11 (thirty spokes, the empty space makes the wheel useful), ch. 16 (returning to the root); paradox as a method; comparing Legge with a modern paraphrase.",
       story="A potter holds up a bowl and asks which part of it holds the water"),
  dict(n=26, title="The Sage Ruler and the Small State", strand="Daodejing 17, 57, 60, 80",
       topics="ch. 17 (the best rulers are hardly known — \"we are as we are, of ourselves\"), ch. 57 (the more prohibitions, the poorer the people), ch. 60 (governing a great state like cooking small fish), ch. 80 (the small state), ch. 67 (three treasures — compassion, economy, not presuming to be first); political readings vs. personal ones; the Daodejing and Legalist readers.",
       story="A cook tells a governor that a small fish falls apart if you stir it too much"),
 ]),
 dict(n=14, band="9-10", title="Mencius and Zhuangzi Close Up", strand="Mencius and Zhuangzi", chapters=[
  dict(n=27, title="Mencius: The Child at the Well and the Ox", strand="Mencius",
       topics="Legge's Mencius quoted exactly: 2A.6 (all men have a mind which cannot bear to see the sufferings of others; the child about to fall into a well; the four principles), 1A.7 (King Xuan spares the ox), 6A.1–2 (Gaozi's willow and water debate), 7B.14 (the people are the most important element); arguing by analogy; Mencius's case for a humane government.",
       story="A king sees an ox trembling on the way to sacrifice and cannot bear it"),
  dict(n=28, title="Zhuangzi: Cook Ding, the Frog and the Fish", strand="Zhuangzi",
       topics="the Zhuangzi in paraphrase: Cook Ding (ch. 3), the frog in the well (ch. 17), the happiness of fish on the Hao bridge (ch. 17), the butterfly dream (ch. 2), Zhuangzi drumming on a pot at his wife's death (ch. 18); humor and paradox as philosophy; perspective and skill; how readers from Guo Xiang (c. 300 CE) to today read it.",
       story="Two friends on a bridge argue about whether they can know that the fish are happy"),
 ]),

 # ══════════════════════════════ 11–12 (units 15–17, chapters 29–34) ══════════════════════════════
 dict(n=15, band="11-12", title="Interpreters Across the Centuries", strand="Interpretation", chapters=[
  dict(n=29, title="Commentators: Wang Bi, Zhu Xi and Wang Yangming", strand="Classical Commentary",
       topics="commentary as the main genre of Chinese philosophy; Wang Bi (226–249) on the Daodejing and \"nothingness\"; He Yan's collected Analects commentary; Zhu Xi (1130–1200) — principle (li 理) and the investigation of things; Wang Yangming (1472–1529) — the unity of knowing and acting; the same line (Great Learning, \"investigate things\") read two ways; all paraphrased.",
       story="A young scholar stares at bamboo for seven days trying to find its principle, and falls ill"),
  dict(n=30, title="Modern Readers: Revolution, Revival and the West", strand="Modern Readings",
       topics="the May Fourth Movement (1919) and \"down with the Confucian shop\"; the Cultural Revolution's anti-Confucius campaign (1973–74); New Confucianism; Confucius Institutes and the debates about them; the Daodejing in the West — Tolstoy, Heidegger, Ursula K. Le Guin's version, business and self-help books; feminist readings; readers inside and outside the tradition, none ranked.",
       story="In 1919 students march in Beijing, and some carry signs against Confucius"),
 ]),
 dict(n=16, band="11-12", title="Comparison and Debate", strand="Comparison", chapters=[
  dict(n=31, title="Confucius and Laozi in Dialogue", strand="Inside Comparison",
       topics="ritual vs. naturalness; the legend of Confucius meeting Laozi (Sima Qian) and the Zhuangzi's teasing Confucius; Analects 14.36 (recompense injury with justice) beside Daodejing 63 (recompense injury with kindness); ruling by virtue vs. ruling by not interfering; is Confucianism a religion? — scholars' and practitioners' views named; the three teachings as one.",
       story="Two quotations about repaying injury sit side by side on a board, and the class splits"),
  dict(n=32, title="The Golden Rule and the Good Person Across Traditions", strand="Ethics Compared",
       topics="Analects 15.23 beside Hillel (Shabbat 31a), Matthew 7:12 and the Mahabharata's rule; the junzi beside Aristotle's virtuous person and the bodhisattva; Mencius and Xunzi beside debates on human nature (Hobbes, Rousseau); wu wei and the Gita's action without attachment; comparing without ranking; a comparison chart built from exact quotations.",
       story="A student lines up five versions of the Golden Rule and notices one is written in the negative"),
 ]),
 dict(n=17, band="11-12", title="The Classics Today, and Capstone", strand="Capstone", chapters=[
  dict(n=33, title="The Classics in Translation, Art and Daily Life", strand="Living Texts",
       topics="translating the untranslatable — dao, ren, de rendered many ways; calligraphy and landscape painting as Daoist art; tai chi in Chicago parks; Confucian ethics in East Asian families, schools and business; Chinese American voices on stereotypes; the classics in video games and film; appreciation vs. caricature.",
       story="Retirees practice tai chi in a Chicago park at sunrise, and a student asks what they are thinking about"),
  dict(n=34, title="Capstone: A Passage, Its Readers and Your Argument", strand="Capstone",
       topics="choose one passage (an Analects saying, a Daodejing chapter, a Mencius argument, a Zhuangzi story); establish the text and translation; set its context; gather three readings (a classical commentator, a modern reader, a scholar); argue what the passage means and why readers differ; cite exactly, attribute every claim; present to the class.",
       story="A student lays out four translations of Daodejing chapter 1 and finds none of them agree"),
 ]),
]

# Practice rooms per unit: the Daily Drafts "chinese" spiral at the matching grade, plus the
# World Religions rooms and units that meet the same material.
def _dd(grade, label):
    return [("/drops/chinese/%s" % grade, "Daily Drafts — Chinese classics, grades %s" % label)]
LINKS = {
 1: _dd("K", "K–2") + [("/religions", "World Religions — every band")],
 2: _dd("1", "K–2") + [("/religions", "World Religions — every band")],
 3: _dd("2", "K–2") + [("/religions-course", "World Religions — the course")],
 4: _dd("3", "3–5") + [("/rel6", "World Religions unit 6 — Traditions of India and East Asia")],
 5: _dd("3", "3–5") + [("/rel6", "World Religions unit 6 — Traditions of India and East Asia")],
 6: _dd("4", "3–5") + [("/rel6", "World Religions unit 6 — Traditions of India and East Asia")],
 7: _dd("5", "3–5") + [("/religions-course", "World Religions — the course")],
 8: _dd("6", "6–8") + [("/r8", "Confucianism and Daoism — the room"), ("/rel11", "World Religions unit 11 — South and East Asian Traditions")],
 9: _dd("7", "6–8") + [("/r8", "Confucianism and Daoism — the room"), ("/r1", "How to read a sacred text — the room")],
 10: _dd("7", "6–8") + [("/r8", "Confucianism and Daoism — the room")],
 11: _dd("8", "6–8") + [("/r8", "Confucianism and Daoism — the room"), ("/buddhist-texts-course", "Buddhist Texts — the course")],
 12: _dd("9-10", "9–10") + [("/r8", "Confucianism and Daoism — the room"), ("/rel20", "World Religions unit 20 — Confucianism and Daoism")],
 13: _dd("9-10", "9–10") + [("/r8", "Confucianism and Daoism — the room"), ("/rel20", "World Religions unit 20 — Confucianism and Daoism")],
 14: _dd("9-10", "9–10") + [("/r8", "Confucianism and Daoism — the room")],
 15: _dd("11-12", "11–12") + [("/r8", "Confucianism and Daoism — the room"), ("/r11", "One question, many lenses — the room")],
 16: _dd("11-12", "11–12") + [("/r11", "One question, many lenses — the room"), ("/rel23", "World Religions unit 23 — One Question, Many Lenses")],
 17: _dd("11-12", "11–12") + [("/r12", "World Religions capstone — the sources speak")],
}
