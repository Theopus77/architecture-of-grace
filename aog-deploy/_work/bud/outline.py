# Buddhist Texts, K–12 — the course arc. Our own wording: the Buddhist
# scriptures studied in a public-school classroom — the prince who asked why,
# the Jataka tales and the practices of calm and kindness (K–2), what the
# texts are (the Three Baskets), the Buddha's life as they tell it, the key
# teachings and the festivals (3–5), history, schools and genres — suttas,
# Vinaya, Jatakas, Mahayana sutras, Zen and Tibetan texts (6–8), close reading
# of the first sermon, the Buddha's last days, the Dhammapada and the Jatakas
# in public-domain translation (9–10), then interpretation, comparison and a
# capstone (11–12). Quotations only from public-domain translations (Müller's
# Dhammapada, SBE 10, 1881; Rhys Davids' Buddhist Suttas, SBE 11, 1881; the
# Cowell Jataka, 1895–1907); everything else paraphrased and marked so. Always
# described ("Buddhists believe…", "the sutta says…", "Theravada teachers
# read…"), never taught as true or false. Meditation is described, never led.
# Topics guide the writers; story = the chapter's opening narrative hook.
#
# Units number 1–17 straight through the course; chapters 1–34. Sister
# courses: Hindu Texts (hin), Chinese Classics (chn), World Religions (rel).

BANDS = [
 dict(id="k-2",   title="Grades K–2",   level="k2"),
 dict(id="3-5",   title="Grades 3–5",   level="35"),
 dict(id="6-8",   title="Grades 6–8",   level="68"),
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
]

UNITS = [
 # ══════════════════════════════ K–2 (units 1–3, chapters 1–6) ══════════════════════════════
 dict(n=1, band="k-2", title="The Prince Who Asked Why", strand="The Buddha's Story", chapters=[
  dict(n=1, title="Siddhartha Sees the World", strand="The Buddha's Story",
       topics="a long time ago in India a prince named Siddhartha lived in a palace; Buddhists tell that he had everything but had never seen sadness; outside the walls he saw a sick man, an old man, a funeral and a calm holy man; he wondered why people suffer; he left the palace to find an answer; asking big questions.",
       story="A prince rides out of the palace gate and sees an old man for the very first time"),
  dict(n=2, title="Under the Bodhi Tree", strand="The Buddha's Story",
       topics="Siddhartha tried being very hungry and very hard on himself, and it did not help; he took a bowl of rice from a girl named Sujata; he found a middle way — not too much, not too little; he sat under a tree and thought until, Buddhists believe, he understood — he became the Buddha, \"the awakened one\"; the Bodhi tree in Bodh Gaya still grows from a cutting; the middle way in everyday life.",
       story="A girl brings a bowl of rice to a thin, tired man sitting under a tree"),
 ]),
 dict(n=2, band="k-2", title="Jataka Tales", strand="Animal Stories", chapters=[
  dict(n=3, title="The Monkey King's Bridge", strand="Jataka Tales",
       topics="Jataka tales are over 500 stories Buddhists tell about the Buddha's earlier lives, often as an animal; the Great Monkey King (Mahakapi Jataka) stretches his own body across a river so his monkeys can escape, and a king learns what a good leader does; the stories teach kindness, courage and wisdom; many cultures tell tales like these.",
       story="Eighty thousand monkeys run across their king's back to get away from the archers"),
  dict(n=4, title="The Hare in the Moon", strand="Jataka Tales",
       topics="the Hare Jataka (Sasa Jataka): four animal friends — a hare, a monkey, a jackal and an otter — want to give a gift; the hare has only grass, so he offers himself; the story says Sakka paints the hare on the moon to remember; giving what you can; the rabbit in the moon in Japan, China and elsewhere; look at the moon tonight.",
       story="Four friends each look for a gift, and the hare comes back with nothing but an idea"),
 ]),
 dict(n=3, band="k-2", title="Calm and Kindness", strand="Values and Practice", chapters=[
  dict(n=5, title="Breathing and Being Still", strand="Practice",
       topics="Buddhists practice meditation — sitting still and paying attention, often to breathing; a monk or nun, a temple, a bell; Buddhists say it helps the mind grow calm and clear; many people who are not Buddhist sit quietly too; what calm feels like; describing a practice is different from doing it — here we learn about it; a picture of a quiet meditation hall.",
       story="A small bell rings in a temple, and a whole room goes quiet"),
  dict(n=6, title="Kind to Every Living Thing", strand="Values",
       topics="the story of young Siddhartha and his cousin Devadatta and the swan — the one who saves a life, not the one who hurts it, should keep it; metta — loving-kindness toward all beings; do not hurt living things; sharing; saying sorry; the five simple promises Buddhists make, told for small children; kindness in our class.",
       story="A swan falls from the sky with an arrow in its wing, and two cousins both run to it"),
 ]),

 # ══════════════════════════════ 3–5 (units 4–7, chapters 7–14) ══════════════════════════════
 dict(n=4, band="3-5", title="What the Buddhist Texts Are", strand="The Library", chapters=[
  dict(n=7, title="The Three Baskets", strand="The Tipitaka",
       topics="the Tipitaka (\"three baskets\") in the Pali language: the Vinaya (rules for monks and nuns), the Suttas (teachings and talks), the Abhidhamma (careful lists about the mind); the Dhammapada and the Jatakas are in the Sutta basket; Mahayana Buddhists also treasure many other sutras in Sanskrit, Chinese and Tibetan; there is no single Buddhist Bible; \"Thus have I heard\" — how suttas begin.",
       story="A monk explains why the old books were once stored in three baskets"),
  dict(n=8, title="From Memory to Palm Leaves", strand="How the Texts Traveled",
       topics="tradition says the Buddha's students met after his death (the First Council) and Ananda recited the teachings from memory; monks chanted them together for centuries; the Pali Canon was written on palm leaves in Sri Lanka in the 1st century BCE, the tradition records; the Diamond Sutra from Dunhuang (868 CE), the oldest dated printed book known; translations into Chinese, Tibetan and English.",
       story="Five hundred monks sit in a cave, and one of them begins, \"Thus have I heard\""),
 ]),
 dict(n=5, band="3-5", title="The Buddha's Life as the Texts Tell It", strand="Life of the Buddha", chapters=[
  dict(n=9, title="Four Sights and the Great Going Forth", strand="Early Life",
       topics="Lumbini, Queen Maya's dream, Kapilavastu, King Suddhodana; the four sights; leaving at night on the horse Kanthaka; years with teachers and in hard fasting; the middle way; awakening at Bodh Gaya (dates vary; many scholars say the 5th century BCE); which parts come from the old suttas and which from later biographies like the Buddhacarita.",
       story="At midnight a prince looks once at his sleeping baby son and then rides away"),
  dict(n=10, title="Teaching, the Sangha and the Last Journey", strand="Teaching Life",
       topics="the first sermon in the Deer Park at Sarnath; the sangha — monks, then nuns led by Mahapajapati; students like Ananda, Sariputta, Moggallana; 45 years of walking and teaching; the story of Kisa Gotami and the mustard seed; the Buddha's death at Kushinagar at 80; the four pilgrimage places.",
       story="A mother carrying her sick child goes door to door looking for a mustard seed"),
 ]),
 dict(n=6, band="3-5", title="Key Teachings", strand="The Dharma", chapters=[
  dict(n=11, title="Four Noble Truths and the Eightfold Path", strand="Core Teachings",
       topics="the Four Noble Truths explained like a doctor's visit: suffering (dukkha), its cause (craving), its end (nirvana), and the path; the Noble Eightfold Path in three groups — wisdom, ethics, meditation; the wheel with eight spokes as a symbol; the Three Jewels — Buddha, Dharma, Sangha; karma and rebirth as Buddhists teach them.",
       story="A doctor looks at a sick patient and asks four questions in a row"),
  dict(n=12, title="Five Precepts and the Dhammapada's Sayings", strand="Ethics",
       topics="the five precepts — not harming, not stealing, not misusing sex (for this age: keeping promises in families), not lying, not taking intoxicants — as Buddhist laypeople take them; the Dhammapada, 423 short verses in 26 chapters; \"hatred does not cease by hatred\" (verse 5); the mind comes first (verse 1); the verses as proverbs Buddhists memorize.",
       story="A girl copies one Dhammapada verse onto a card and tapes it to her mirror"),
 ]),
 dict(n=7, band="3-5", title="Festivals and Communities", strand="Practice", chapters=[
  dict(n=13, title="Vesak, Obon and the Buddhist Year", strand="Festivals",
       topics="Vesak (Wesak), which many Buddhists keep for the Buddha's birth, awakening and death; bathing the baby Buddha statue (Hanamatsuri in Japan); Uposatha days; Kathina — giving robes to monks after the rains retreat; Obon and its dances for ancestors; Losar, Tibetan New Year; lanterns, flowers and gifts; different countries, different calendars.",
       story="Children pour sweet tea over a tiny statue in a temple full of flowers"),
  dict(n=14, title="Temples and Sanghas in Chicago", strand="Community",
       topics="the Buddhist Temple of Chicago, founded in 1944 by Japanese Americans after the wartime incarceration camps; Thai, Vietnamese, Cambodian, Sri Lankan, Tibetan, Korean and convert communities in Illinois; what a visitor sees — a shrine, offerings of flowers, candles and incense, bowing, chanting, shoes off; monks' alms rounds in Asia; visiting respectfully.",
       story="A family leaves a camp in 1944, moves to Chicago and helps start a temple"),
 ]),

 # ══════════════════════════════ 6–8 (units 8–11, chapters 15–22) ══════════════════════════════
 dict(n=8, band="6-8", title="From India Across Asia", strand="History", chapters=[
  dict(n=15, title="The Buddha's India and Ashoka's Edicts", strand="Early History",
       topics="the Ganges valley c. 5th century BCE — cities, kingdoms, wandering teachers (shramanas), the Jains; dating the Buddha (scholars differ); early councils; Emperor Ashoka (c. 268–232 BCE), the Kalinga war, the rock and pillar edicts; the Sarnath lion capital on India's emblem; stupas at Sanchi; decline of Buddhism in India and its 20th-century revival.",
       story="An emperor walks the field after a battle and carves his regret in stone"),
  dict(n=16, title="Theravada, Mahayana, Vajrayana: Roads to Asia", strand="Schools",
       topics="Theravada in Sri Lanka and Southeast Asia and its Pali Canon; Mahayana in China, Korea, Japan, Vietnam, and the bodhisattva ideal; Vajrayana in Tibet, Bhutan and Mongolia; the Silk Road; Faxian and Xuanzang, who walked to India for texts; Borobudur; schools compared without ranking; how each school chooses its scriptures.",
       story="A monk walks from China to India in the 600s and comes home with 657 texts"),
 ]),
 dict(n=9, band="6-8", title="Genres of the Pali Canon", strand="Genres I", chapters=[
  dict(n=17, title="Suttas, Vinaya and Abhidhamma", strand="Three Baskets Close Up",
       topics="the five Nikayas of the Sutta Pitaka (Long, Middle-Length, Connected, Numerical, Minor); a sutta's parts — setting, questioner, teaching, repetition for memory, the listeners' response; the Vinaya's rules and the stories of why each was made; the Abhidhamma's lists; Rhys Davids' Buddhist Suttas (SBE 11, 1881); the Pali Text Society (1881).",
       story="A monk asks why a rule exists, and the Vinaya answers with a story"),
  dict(n=18, title="Verses, Jatakas and Nuns' Songs", strand="Poetry and Story",
       topics="the Dhammapada as verse wisdom; the Jatakas — story in the present, story of the past, and the link; the Therigatha, songs of the early nuns (among the oldest collections of women's poetry — paraphrase); the Sutta Nipata; commentaries by Buddhaghosa (5th c.); the Cowell Jataka translation (1895–1907); how genre changes how we read.",
       story="An old nun sings about her gray hair and why she is no longer afraid of it"),
 ]),
 dict(n=10, band="6-8", title="Mahayana Sutras, Zen and Tibet", strand="Genres II", chapters=[
  dict(n=19, title="The Lotus Sutra and the Heart Sutra", strand="Mahayana Sutras",
       topics="Mahayana sutras (c. 1st century BCE onward, scholars date); the Lotus Sutra's parable of the burning house and skillful means; the bodhisattva Guanyin/Avalokiteshvara; the Heart Sutra's \"form is emptiness\" and its daily chanting in East Asia; the Pure Land sutras and Amitabha; all paraphrased; how Mahayana Buddhists understand these sutras' authority.",
       story="A father calls his children out of a burning house by promising them carts full of toys"),
  dict(n=20, title="Zen Stories and Tibetan Texts", strand="Later Traditions",
       topics="Chan/Zen and the koan collections (Gateless Gate, 1228) — the sound of one hand; Dogen; the Platform Sutra of Huineng; Tibetan Kangyur and Tengyur; Milarepa's songs; the so-called Tibetan Book of the Dead (Bardo Thodol) and its Western reception; Shantideva's Bodhicaryavatara; paraphrase throughout; Zen stories vs. popular \"zen\".",
       story="A teacher pours tea into a full cup until it runs across the table"),
 ]),
 dict(n=11, band="6-8", title="Buddhist Texts Come to America", strand="The Wider World", chapters=[
  dict(n=21, title="Translators, Scholars and 1893", strand="Translation",
       topics="the Pali Text Society and T.W. and Caroline Rhys Davids; Max Müller's Sacred Books of the East (1879–1910); Edwin Arnold's poem The Light of Asia (1879); the World's Parliament of Religions in Chicago, 1893 — Anagarika Dharmapala and Soyen Shaku; D.T. Suzuki; how a translator's word choice (\"suffering\" or \"unsatisfactoriness\") shapes a reader.",
       story="A young Sri Lankan speaker in white robes addresses a hall in Chicago in 1893"),
  dict(n=22, title="Japanese American Buddhists and Buddhism Today", strand="American Buddhism",
       topics="Buddhist Churches of America; Jodo Shinshu temples in the incarceration camps (1942–45); the Buddhist Temple of Chicago (1944) and the Midwest Buddhist Temple (1944); immigrant temples after 1965; convert communities and meditation centers; the Dalai Lama and Thich Nhat Hanh as public figures; mindfulness programs and debates about separating them from Buddhism.",
       story="A priest holds services in a camp barracks, and years later his temple stands in Chicago"),
 ]),

 # ══════════════════════════════ 9–10 (units 12–14, chapters 23–28) ══════════════════════════════
 dict(n=12, band="9-10", title="Close Reading the Suttas", strand="Suttas", chapters=[
  dict(n=23, title="Setting the Wheel in Motion", strand="The First Sermon",
       topics="the Dhammacakkappavattana Sutta in Rhys Davids' SBE 11 (1881) quoted exactly; the two extremes and the middle path; the four truths each with three turnings; Kondañña's understanding; the gods' cry through the worlds as the text tells it; reading repetition and lists; why Buddhists call it the first sermon; terms dukkha, tanha, nibbana.",
       story="Five former companions agree to ignore the Buddha, and then find they cannot"),
  dict(n=24, title="The Buddha's Last Days", strand="Mahaparinibbana Sutta",
       topics="the Book of the Great Decease (SBE 11); Ananda's grief; \"be ye lamps unto yourselves\" (2.33 in Rhys Davids); the last meal from Cunda the smith; the final words that all compounded things decay, strive with earnestness; relics and stupas; what the text teaches about leadership after a teacher's death; readers across schools.",
       story="An old man lies between two trees and asks his students three times for their questions"),
 ]),
 dict(n=13, band="9-10", title="Close Reading the Dhammapada", strand="Dhammapada", chapters=[
  dict(n=25, title="The Twin Verses and the Mind", strand="Dhammapada 1–3",
       topics="Müller's translation (SBE 10, 1881) quoted exactly: verses 1–2 (mind precedes all), 3–5 (\"he abused me…\"; hatred ceases by love), the chapter on the mind (33–43); the pairing structure; the commentary stories behind verses (paraphrase); comparing Müller's wording with a modern paraphrase; what \"mind\" translates (manas).",
       story="Two men hear the same insult; one carries it home, one sets it down"),
  dict(n=26, title="Anger, the Wise and the Self", strand="Dhammapada 5–25",
       topics="the fool and the wise (ch. 5–6); the thousands (ch. 8: one word that brings peace is better than a thousand useless ones); self (ch. 12: \"self is the lord of self\", v. 160) and how that line sits with not-self teaching; anger (ch. 17); the Brahmana chapter (26) redefining worth by conduct not birth; close reading a verse and its neighbors.",
       story="A student reads verse 160 and asks how a teaching of not-self can say \"self is the lord of self\""),
 ]),
 dict(n=14, band="9-10", title="Jatakas and Hard Questions", strand="Stories and Inquiry", chapters=[
  dict(n=27, title="Jatakas as Moral Arguments", strand="Jataka",
       topics="the Cowell Jataka (1895–1907) quoted exactly where certain; the frame structure; the Vessantara Jataka — the prince who gives away everything, even his children, and the ethical debate it has always provoked; the Monkey King and the Hare again, read closely; the perfections (paramis); Jatakas at Bharhut and Borobudur in stone.",
       story="A village in Thailand spends a whole day reciting the thirteen chapters of Vessantara's story"),
  dict(n=28, title="Questions to the Buddha: Kalamas, Tevijja and the Raft", strand="Inquiry",
       topics="the Tevijja Sutta (SBE 11) — the Brahmins' paths and the ladder to nowhere; the Kalama Sutta (paraphrase) — do not accept a teaching merely by tradition, test it, and how modern readers sometimes over-read it; the parable of the raft (Majjhima 22, paraphrase); the unanswered questions and the poisoned arrow (Majjhima 63, paraphrase); inquiry within a tradition.",
       story="A man shot with an arrow refuses help until he knows the archer's name"),
 ]),

 # ══════════════════════════════ 11–12 (units 15–17, chapters 29–34) ══════════════════════════════
 dict(n=15, band="11-12", title="Interpreters Across the Centuries", strand="Interpretation", chapters=[
  dict(n=29, title="Not-Self and Emptiness: Classical Readers", strand="Philosophy",
       topics="anatta (not-self) in the early texts; the chariot simile in the Questions of King Milinda (paraphrase); Buddhaghosa's Visuddhimagga (5th c.); Nagarjuna (c. 2nd c.) and emptiness (shunyata), the two truths; Yogacara; Tibetan and Chinese scholastic schools; the same term read several ways; all commentary paraphrased.",
       story="A king asks a monk his name, and the monk asks the king what a chariot is"),
  dict(n=30, title="Modern Readers: Engaged, Reform and Convert Buddhism", strand="Modern Readings",
       topics="Buddhist modernism; Ambedkar's 1956 conversion with hundreds of thousands of Dalits and his The Buddha and His Dhamma; Thich Nhat Hanh and \"engaged Buddhism\"; Thich Quang Duc (1963) described factually; the Dalai Lama and science; women's full ordination debates; Buddhist environmental readings; readers inside and outside the tradition, none ranked.",
       story="In 1956 a crowd in Nagpur recites the Three Refuges with Dr. Ambedkar"),
 ]),
 dict(n=16, band="11-12", title="Comparison", strand="Comparison", chapters=[
  dict(n=31, title="Suffering and Its End Across Traditions", strand="Suffering",
       topics="dukkha and nirvana beside moksha in the Upanishads and Gita, the Book of Job and Ecclesiastes, and the Daodejing's acceptance; what each names as the cause and the cure; shared terms that do not mean the same (karma, dharma in Hindu and Buddhist use); comparing without ranking; reading each text in its own terms first.",
       story="Kisa Gotami and Job sit side by side in a student's essay"),
  dict(n=32, title="Ethics Across Traditions", strand="Ethics",
       topics="the five precepts beside the Ten Commandments, the yamas and the Analects' reciprocity; ahimsa in Buddhist, Jain and Hindu texts; metta and the Sermon on the Mount; the bodhisattva and the junzi as ideal persons; a Buddhist ethics of intention (cetana); careful comparison chart; the Golden Rule across texts (Dhammapada 129–130).",
       story="A student makes a chart of five ethical rules from five traditions and finds a pattern and a surprise"),
 ]),
 dict(n=17, band="11-12", title="The Texts in Life, and Capstone", strand="Capstone", chapters=[
  dict(n=33, title="Texts in Art, Ritual and American Life", strand="Living Texts",
       topics="sutras copied as devotion (Heart Sutra calligraphy), recited at funerals and memorials; Tibetan sand mandalas made and swept away; Buddhist art and stupas; the Buddha image and its respectful use (statues as decor debate); mindfulness in schools and hospitals; Buddhist voices on appropriation; Chicago's temples as living communities.",
       story="Monks spend a week making a sand mandala in a museum and then sweep it into a river"),
  dict(n=34, title="Capstone: A Passage, Its Readers and Your Argument", strand="Capstone",
       topics="choose one passage (a Dhammapada chapter, the first sermon, a Jataka, a sutta dialogue); establish the text and translation; set its context and school; gather three readings (a classical commentator, a modern teacher, a scholar); argue what the passage means for its readers and why they differ; cite exactly, attribute every belief; present to the class.",
       story="A student sets three translations of Dhammapada verse 1 side by side and starts underlining"),
 ]),
]

# Practice rooms per unit: the Daily Drafts "buddhist" spiral at the matching grade, plus the
# World Religions rooms and units that meet the same material.
def _dd(grade, label):
    return [("/drops/buddhist/%s" % grade, "Daily Practice — Buddhist texts, grades %s" % label)]
LINKS = {
 1: _dd("K", "K–2") + [("/religions", "World Religions — every band")],
 2: _dd("1", "K–2") + [("/religions", "World Religions — every band")],
 3: _dd("2", "K–2") + [("/religions-course", "World Religions — the course")],
 4: _dd("3", "3–5") + [("/rel6", "World Religions unit 6 — Traditions of India and East Asia")],
 5: _dd("3", "3–5") + [("/rel6", "World Religions unit 6 — Traditions of India and East Asia")],
 6: _dd("4", "3–5") + [("/rel6", "World Religions unit 6 — Traditions of India and East Asia")],
 7: _dd("5", "3–5") + [("/religions-course", "World Religions — the course")],
 8: _dd("6", "6–8") + [("/r7", "Buddhism — the room"), ("/rel11", "World Religions unit 11 — South and East Asian Traditions")],
 9: _dd("7", "6–8") + [("/r7", "Buddhism — the room"), ("/r1", "How to read a sacred text — the room")],
 10: _dd("7", "6–8") + [("/r7", "Buddhism — the room"), ("/chinese-classics-course", "Chinese Classics — the course")],
 11: _dd("8", "6–8") + [("/r7", "Buddhism — the room"), ("/hindu-texts-course", "Hindu Texts — the course")],
 12: _dd("9-10", "9–10") + [("/r7", "Buddhism — the room"), ("/rel19", "World Religions unit 19 — Buddhism: The Four Noble Truths")],
 13: _dd("9-10", "9–10") + [("/r7", "Buddhism — the room"), ("/rel19", "World Religions unit 19 — Buddhism: The Four Noble Truths")],
 14: _dd("9-10", "9–10") + [("/r7", "Buddhism — the room")],
 15: _dd("11-12", "11–12") + [("/r7", "Buddhism — the room"), ("/r11", "One question, many lenses — the room")],
 16: _dd("11-12", "11–12") + [("/r11", "One question, many lenses — the room"), ("/rel23", "World Religions unit 23 — One Question, Many Lenses")],
 17: _dd("11-12", "11–12") + [("/r12", "World Religions capstone — the sources speak")],
}
