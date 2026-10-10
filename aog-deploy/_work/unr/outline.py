# The Unseen Realm, K–12 — the course arc. Our own wording. The Bible's unseen world as the
# ancient texts describe it: God's heavenly council, Enoch and the Watchers, the giants, the
# gods of the nations, angels, demons, and what Michael Heiser called "the forgotten mission of
# Jesus Christ" (Reversing Hermon, 2017). Owner's decision (Jimmy, 2026-09-30): the course is on
# these TOPICS, taught from the PRIMARY DOCUMENTS (the Hebrew Bible, the Septuagint, 1 Enoch,
# Jubilees, the Dead Sea Scrolls, Ugaritic and Mesopotamian texts, Josephus, Philo, the New
# Testament, the church fathers and the rabbis), with the researchers who study them: Michael
# S. Heiser first among several (with George Nickelsburg, James VanderKam, J. T. Milik, Loren
# Stuckenbruck, Annette Yoshiko Reed, Archie Wright, Amar Annus, E. Theodore Mullen, Mark S.
# Smith, Alan Segal and others). Public-domain translations are quoted (KJV, ASV, WEB, JPS 1917;
# R. H. Charles's 1 Enoch and Jubilees, 1917; Whiston's Josephus; Brenton's Septuagint); every
# researcher's idea is attributed, with other readings beside it; the course never tells a
# student what to believe. K–2 is gentle and never frightening. Topics guide the writers;
# story = the chapter's opening narrative hook.
#
# Units number 1–17 straight through the course; chapters 1–34. Sister courses: The Bible
# (bib), The Hebrew Bible (heb), World Religions (rel).

BANDS = [
 dict(id="k-2",   title="Grades K–2",   level="k2"),
 dict(id="3-5",   title="Grades 3–5",   level="35"),
 dict(id="6-8",   title="Grades 6–8",   level="68"),
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
]

UNITS = [
 # ══════════════════════════════ K–2 (units 1–3, chapters 1–6) ══════════════════════════════
 dict(n=1, band="k-2", title="God's Family in Heaven", strand="Beginnings", chapters=[
  dict(n=1, title="Who Lives in the Unseen World?", strand="Heaven",
       topics="some things are real but we cannot see them (wind, love); the Bible tells of heaven as God's home; heavenly helpers the Bible calls angels and 'sons of God'; Job 38:7 says they sang and shouted for joy when the world was made; Michael Heiser, a teacher who read the Bible in its old languages, called them God's family in heaven; angels as messengers who bring news; kind, calm, never scary.",
       story="A girl feels the wind on her kite and asks her grandpa how something can be real if you cannot see it"),
  dict(n=2, title="A Garden Home", strand="Eden",
       topics="Genesis 1–2 told simply: God made a garden home where people and God could be together; Heiser saw Eden as God's home on earth, where his heavenly family and his earthly family met; people were made to care for the world; a shining one (the serpent) chose to trick Eve; people chose not to listen; they had to leave the garden, but God still cared for them and made them clothes (Genesis 3:21); choices matter and we can make good ones.",
       story="A boy helps his mother plant a garden and imagines a garden where everyone got along"),
 ]),
 dict(n=2, band="k-2", title="Big Choices Go Wrong", strand="Genesis 6–11", chapters=[
  dict(n=3, title="Noah and the Rainbow Promise", strand="The Flood",
       topics="Genesis 6 told gently: some heavenly ones chose wrong and came down to earth; the world filled with hurting and unkindness; Noah chose to listen to God; the big boat and the animals; the rainbow promise (Genesis 9); an old book called Enoch told more about those heavenly ones, called Watchers; no frightening detail; the story says God keeps promises.",
       story="After a storm, a family sees a rainbow from the window and the grandmother tells Noah's story"),
  dict(n=4, title="The Tall Tower and Many Nations", strand="Babel",
       topics="Genesis 11: people built a tall tower to reach the sky; God mixed up their languages and spread them over the earth; many nations and languages began; Heiser read Deuteronomy 32 to say God put the nations under other heavenly ones for a time; God chose one man, Abraham, to start a new family that would one day bless every nation (Genesis 12:3); taking turns, listening, being kind to people who speak differently.",
       story="Children build a block tower and can't agree, until they find a way to share"),
 ]),
 dict(n=3, band="k-2", title="Everyone Invited Home", strand="Promise Kept", chapters=[
  dict(n=5, title="The Messenger Who Came Close", strand="The Angel of the LORD",
       topics="the Bible tells of a special messenger called the Angel of the LORD; he spoke to Hagar in the desert (Genesis 16) and to Moses from a burning bush (Exodus 3); Heiser thought this messenger was God himself coming close in a way people could see; angels help and bring good news (Gabriel to Mary, Luke 1); God is near; what helps us feel safe.",
       story="Moses is watching sheep when he sees a bush that burns but does not burn up"),
  dict(n=6, title="Good News for Every Nation", strand="Jesus and the Nations",
       topics="Jesus helped people who were hurting and the stories say he was stronger than every bad power; he sent his friends to all nations (Matthew 28:19); at Pentecost (Acts 2) people from many lands heard the good news in their own languages — Heiser saw this as the opposite of Babel; everyone is invited into God's family; Revelation 7:9 pictures people from every nation together; welcoming others.",
       story="A new student speaks another language, and the class learns to say hello in it"),
 ]),

 # ══════════════════════════════ 3–5 (units 4–7, chapters 7–14) ══════════════════════════════
 dict(n=4, band="3-5", title="Old Books and God's Council", strand="Sources and the Divine Council", chapters=[
  dict(n=7, title="How We Know: Old Books and Those Who Study Them", strand="Primary Sources",
       topics="a primary source is the old writing itself (a scroll, a tablet, a book of the Bible); a secondary source is what a later scholar writes about it; manuscripts are hand-made copies; translations carry old words into English; the Bible's first languages (Hebrew, Aramaic, Greek); scholars who study the unseen world in these texts, named simply: Michael S. Heiser (The Unseen Realm, 2015), George Nickelsburg and James VanderKam (who translated 1 Enoch, 2004), Loren Stuckenbruck (who studied the Dead Sea Scroll Book of Giants); the Hebrew word elohim can mean God or other spirit beings, and scholars explain it in different ways (Heiser: it tells where a being lives, the spirit world); reading an old text the way its first readers did; checking a claim against the text itself.",
       story="A college student opens a Hebrew Bible to Psalm 82 and cannot believe what the first verse seems to say"),
  dict(n=8, title="God's Council in Heaven", strand="The Divine Council",
       topics="Psalm 82: God stands in the 'divine council' and judges the elohim (scholars such as E. Theodore Mullen, 1980, and Heiser compare the council of El in texts from Ugarit); Psalm 89:5–7 the assembly of the holy ones; 1 Kings 22:19–23 Micaiah's vision of the host of heaven; Job 1–2 the sons of God come before the LORD; Isaiah 6 the seraphim; Heiser: God has a council like a king's court, not because he needs help but because he shares his work; other readers (some Jewish and Christian readers) say the 'gods' in Psalm 82 are human judges — describe both.",
       story="A class visits the city council and a student notices it is a bit like a picture in the Psalms"),
 ]),
 dict(n=5, band="3-5", title="Three Rebellions", strand="Genesis 3, 6 and 11", chapters=[
  dict(n=9, title="Eden and the Shining One", strand="The First Rebellion",
       topics="Heiser's 'three rebellions' framework: Eden, the sons of God in Genesis 6, and Babel; Eden as God's garden and meeting place (Ezekiel 28:13–14 calls it the garden and mountain of God); the serpent (Hebrew nachash) — Heiser noted the word can connect to 'shining' and 'one who gives omens', so he read the serpent as a shining spirit being, not an ordinary snake; the choice, the loss of the garden, and the promise in Genesis 3:15; later Christians named the serpent Satan (Revelation 12:9); others read it simply as a snake in a teaching story.",
       story="Two cousins argue whether the snake in Genesis was just a snake, and look it up together"),
  dict(n=10, title="The Sons of God and the Flood", strand="The Second Rebellion",
       topics="Genesis 6:1–4: the sons of God, the daughters of men, the Nephilim; three main readings: (1) heavenly beings (the oldest Jewish reading, in 1 Enoch and Jubilees, and Heiser's view), (2) the line of Seth marrying the line of Cain (from about the 200s–400s CE, Augustine), (3) powerful human kings; Heiser's reasons; the Flood follows; Noah; keep the giants calm and factual (the text says 'mighty men of old').",
       story="A student reads Genesis 6 aloud in class and three classmates hear it three different ways"),
 ]),
 dict(n=6, band="3-5", title="Babel and the Nations", strand="The Third Rebellion", chapters=[
  dict(n=11, title="The Tower and the Gods of the Nations", strand="Babel",
       topics="Genesis 11:1–9 the tower of Babel; Genesis 10 the Table of Nations (about 70 nations in the Hebrew text); Deuteronomy 32:8–9: God divided the nations 'according to the number of the sons of God' — the reading of the Dead Sea Scrolls and the Greek Septuagint — while the later Hebrew text most Bibles once followed says 'sons of Israel'; Heiser's reading: God gave the nations to lesser elohim and kept Israel as his own portion; Deuteronomy 4:19–20.",
       story="A girl counts the nations in Genesis 10 on a big map her teacher unrolls"),
  dict(n=12, title="Abraham and God's Own Portion", strand="A New Family",
       topics="Genesis 12:1–3: right after Babel, God calls Abram; the promise that all families of the earth will be blessed; Heiser: God starts a new family to win back the nations; Israel as God's portion (Deuteronomy 32:9); Psalm 82:8 'arise, O God… you shall inherit all the nations'; how later readers saw this fulfilled in Jesus; Jewish readings of the covenant with Abraham described fairly.",
       story="Abram packs up his family in Haran, and a servant asks where they are going"),
 ]),
 dict(n=7, band="3-5", title="Angels and the Angel of the LORD", strand="Messengers", chapters=[
  dict(n=13, title="What Angels Are and What They Do", strand="Angels",
       topics="Hebrew mal'ak and Greek angelos both mean 'messenger' — a job, not a kind of being (Heiser, Angels, 2018); other names: sons of God, holy ones, host of heaven, cherubim (Genesis 3:24, the ark cover), seraphim (Isaiah 6); named angels in the Bible: Michael and Gabriel (Raphael in Tobit); angels in the Bible are not chubby babies and people do not become angels when they die; the Bible describes them serving God and helping people (Hebrews 1:14).",
       story="A boy sees a baby-angel ornament and learns that angels in the Bible are often scary-big and say 'Do not be afraid'"),
  dict(n=14, title="The Angel of the LORD", strand="God Made Visible",
       topics="the Angel of the LORD speaks as God (Genesis 16:7–13 Hagar; Genesis 22:11–12; Exodus 3:2–6; Judges 6 Gideon; Judges 13 Samson's parents); Exodus 23:20–21 'my name is in him'; Heiser's 'two Yahwehs' reading: God invisible and God visible, which Christians later linked to Jesus; Jewish readers usually read the Angel as a messenger who speaks for God — describe both; Heiser also pointed to the Word and the Name.",
       story="Gideon is hiding wheat in a winepress when a stranger sits under the oak tree and calls him a mighty warrior"),
 ]),

 # ══════════════════════════════ 6–8 (units 8–11, chapters 15–22) ══════════════════════════════
 dict(n=8, band="6-8", title="Enoch and the Watchers", strand="1 Enoch", chapters=[
  dict(n=15, title="Who Was Enoch, and What Is 1 Enoch?", strand="The Book",
       topics="Genesis 5:21–24: Enoch 'walked with God, and he was not, for God took him'; the Book of Enoch (1 Enoch): five parts written about 300 BCE–the turn of the era (Book of the Watchers 1–36, Parables 37–71, Astronomical Book 72–82, Dream Visions 83–90, Epistle 91–108); preserved whole in Ge'ez (Ethiopic) and in the canon of the Ethiopian Orthodox Tewahedo Church; Aramaic pieces found among the Dead Sea Scrolls at Qumran; James Bruce brought copies to Europe (1773); R. H. Charles's English translation (1912, 1917); not in the Jewish, Catholic or Protestant canons; Heiser: not Scripture for him, but important for understanding what New Testament writers knew.",
       story="In 1773 a Scottish traveler carries three Ethiopian manuscripts home, and one is a book Europe thought was lost"),
  dict(n=16, title="The Book of the Watchers", strand="1 Enoch 1–36",
       topics="1 Enoch 6–16: two hundred Watchers led by Shemihazah (Semjaza) swear an oath on Mount Hermon and come down in the days of Jared; Asael (Azazel) teaches metalwork, weapons and cosmetics, others teach sorcery and star-reading; giants are born and harm the earth; the angels Michael, Gabriel, Raphael and Uriel bring the cry of the earth to God; Enoch is asked to plead for the Watchers and is refused; the Watchers bound until judgment; Heiser's reading (Reversing Hermon): Genesis 6 answered Mesopotamian stories of the apkallu, wise beings who brought culture before the flood; age-appropriate, calm.",
       story="A teen reads Genesis 6 and 1 Enoch 6 side by side on a phone and notices one line becomes a whole chapter"),
 ]),
 dict(n=9, band="6-8", title="Giants in the Land", strand="Nephilim to Goliath", chapters=[
  dict(n=17, title="Nephilim, Anakim and Rephaim", strand="The Giant Clans",
       topics="Numbers 13:33 the scouts see the sons of Anak 'of the Nephilim'; Deuteronomy 2–3: Emim, Zamzummim, Anakim, called Rephaim; Og king of Bashan, last of the Rephaim, with his iron bed about nine cubits long (Deuteronomy 3:11); Joshua 11:21–22 Anakim left in Gaza, Gath and Ashdod; Goliath of Gath (1 Samuel 17; four cubits and a span in the Dead Sea Scroll and Septuagint, six cubits in the Masoretic text); Heiser's argument that these clans are linked to the Genesis 6 story; other readers see tall warriors or exaggeration in war reports; the word Rephaim also names the dead in Ugaritic and Hebrew texts.",
       story="David walks into the Valley of Elah carrying a sling and five smooth stones"),
  dict(n=18, title="Bashan, Hermon and the Conquest", strand="Cosmic Geography",
       topics="Mount Hermon (about 9,200 feet) at the north of Bashan; Bashan's cities Ashtaroth and Edrei (Joshua 12:4), linked in Ugaritic texts with the Rephaim and gods of the dead; Psalm 68:15–16 Bashan's mountain jealous of Zion; Heiser's 'cosmic geography': places tied to spiritual powers; his reading that the conquest targeted the giant clans (Joshua 11:21–22); the hard moral questions of the conquest named honestly, with how Jewish and Christian readers have wrestled with them; other scholars' views (hyperbole in ancient war writing).",
       story="A hiker stands on snowy Hermon and looks south over the plain of Bashan"),
 ]),
 dict(n=10, band="6-8", title="The Gods of the Nations", strand="The Deuteronomy 32 Worldview", chapters=[
  dict(n=19, title="Deuteronomy 32 and the Dead Sea Scrolls", strand="Texts and Manuscripts",
       topics="what a manuscript is; the Masoretic Text (about 900s CE copies), the Greek Septuagint (about 200s BCE onward) and the Dead Sea Scrolls (about 250 BCE–70 CE, found 1947–1956); Deuteronomy 32:8 in each: 'sons of Israel' (Masoretic), 'angels/sons of God' (Septuagint), 'sons of God' (4QDeut-j, Qumran); many modern translations now follow the scroll reading (named without quoting: ESV, NRSV); Heiser called this the 'Deuteronomy 32 worldview'; Deuteronomy 32:17 (shedim) and Psalm 96:5 (elilim, daimonia in the Septuagint) on the gods of the nations.",
       story="In 1947 a Bedouin shepherd throws a stone into a cave near the Dead Sea and hears a jar break"),
  dict(n=20, title="Princes, Gods and Holy Ground", strand="Rulers of the Nations",
       topics="Daniel 10:13, 20–21: the prince of Persia and the prince of Greece opposed by Michael 'your prince'; Heiser: spiritual rulers over nations; holy ground: Sinai, Zion, the tabernacle; 2 Kings 5:17 Naaman takes two mule-loads of Israel's soil home to worship the LORD; 1 Samuel 26:19 David driven out to 'serve other gods'; Heiser's point that land and worship were linked; other readers see these as figures of speech or later development; how Christians and Jews have read Daniel's princes.",
       story="Naaman, a Syrian general healed in the Jordan, asks for an odd gift: two loads of dirt"),
 ]),
 dict(n=11, band="6-8", title="The Satan, Demons and Dark Powers", strand="Dark Powers in the Texts", chapters=[
  dict(n=21, title="The Satan, the Serpent and the Devil", strand="The Adversary",
       topics="Hebrew satan means 'adversary'; in Job 1–2 and Zechariah 3 'the satan' (with 'the') is a title for an accuser in God's council; Heiser (Demons, 2020): the Old Testament does not use 'satan' as a name the way the New Testament uses 'Satan' and 'the devil'; Isaiah 14 (the king of Babylon, 'Day Star'/'Lucifer' in the KJV) and Ezekiel 28 (the king of Tyre) — read as poems about human kings, and by many Christians also as the fall of a spirit being; Heiser saw the Eden rebel behind them; Second Temple names (Belial, Mastema); Satan in the Gospels and Revelation 12:9.",
       story="A student notices that in Job 'the satan' walks into God's court like he belongs there"),
  dict(n=22, title="Where Do Demons Come From?", strand="Unclean Spirits",
       topics="Heiser's three groups of dark powers: the Eden rebel, the fallen sons of God over the nations (principalities), and demons; 1 Enoch 15:8–12: when the giants died their spirits became evil spirits on the earth — Heiser's case that this is the Second Temple origin of 'unclean spirits'; Jesus's exorcisms in the Gospels (Mark 1:23–27; Mark 5:1–20, the Gerasene man); Azazel and the Day of Atonement goat (Leviticus 16); other views (fallen angels themselves). Care: never connect demons with disability, mental illness or neurodivergence; people in the Gospel stories are shown as people Jesus restored to their community; no instructions for spiritual practices.",
       story="In a town by the Sea of Galilee, a man everyone avoids runs toward Jesus's boat"),
 ]),

 # ══════════════════════════════ 9–10 (units 12–14, chapters 23–28) ══════════════════════════════
 dict(n=12, band="9-10", title="Reversing Hermon: The Forgotten Mission", strand="Hermon in the Gospels", chapters=[
  dict(n=23, title="Caesarea Philippi and the Mountain", strand="Caesarea Philippi",
       topics="Reversing Hermon (2017), subtitle Enoch, the Watchers, and the Forgotten Mission of Jesus Christ; Caesarea Philippi at Panias (Banias), the cave shrine of Pan at the foot of Mount Hermon; Matthew 16:13–20 Peter's confession and 'the gates of Hades'; Heiser's reading: Jesus declares war on the powers at the very place tied to the Watchers' descent; the Transfiguration (Matthew 17:1–8) on 'a high mountain' — Heiser and others place it on Hermon, while old tradition names Mount Tabor; the Gospels' sequence as he reads it; other readings of the rock and the gates.",
       story="At the Banias spring, water pours from the rock below a cliff carved with niches for Pan"),
  dict(n=24, title="Pentecost, the Nations and Paul's Road to Spain", strand="Babel Reversed",
       topics="Acts 2:1–13: tongues 'divided' like fire, and a list of nations; Heiser: the Babel scattering (Genesis 11) reversed, the nations reclaimed; Deuteronomy 32:8 and Acts 17:26; the Great Commission (Matthew 28:18–20) 'all nations'; Luke 10:1 the seventy (or seventy-two) sent out, matching the Table of Nations numbers; Paul's plan to reach Spain (Romans 15:24, 28) — Heiser tied it to Tarshish at the far edge of the Table of Nations (Isaiah 66:19); Ephesians 3:10 the church shows God's wisdom to the rulers and authorities; other scholars' readings.",
       story="Travelers from Egypt, Rome and Mesopotamia crowd a Jerusalem street and each hears their own language"),
 ]),
 dict(n=13, band="9-10", title="Enoch in the New Testament", strand="The Watchers Remembered", chapters=[
  dict(n=25, title="Jude, Peter and the Spirits in Prison", strand="Jude and the Petrine Letters",
       topics="Jude 14–15 quotes 1 Enoch 1:9 and names Enoch 'the seventh from Adam'; Jude 6 angels who 'kept not their first estate' kept in chains; 2 Peter 2:4 God cast them to Tartarus (Greek tartaroō) — the Greek underworld prison of the Titans; 1 Peter 3:18–22 Christ 'preached unto the spirits in prison' who disobeyed in Noah's days — Heiser (and many scholars) read it through 1 Enoch; other readings (Christ preaching through Noah; the harrowing of hell); why Jude's quotation did and did not bring 1 Enoch into church canons.",
       story="A monk in Ethiopia copies Jude in Ge'ez and knows the book Jude quotes sits on the next shelf"),
  dict(n=26, title="Paul's Powers and Principalities", strand="Rulers and Authorities",
       topics="Paul's vocabulary: rulers (archai), authorities (exousiai), powers, thrones, dominions, world-rulers (Ephesians 1:21; 6:12; Colossians 1:16; 2:15; Romans 8:38–39; 1 Corinthians 2:6–8 the 'rulers of this age' who crucified the Lord); Heiser: the fallen sons of God of Deuteronomy 32; 1 Corinthians 10:20 sacrifices to daimonia; 1 Corinthians 11:10 'because of the angels' — Heiser's reading linked to the Watchers, alongside other scholarly readings; Galatians 4:3, 9 'elemental spirits' (stoicheia) debated; Colossians 2:15 the powers disarmed at the cross.",
       story="A teacher writes Paul's list of powers on the board and asks who these 'rulers' could be"),
 ]),
 dict(n=14, band="9-10", title="Angels Up Close", strand="Angels in the Texts", chapters=[
  dict(n=27, title="Names, Ranks and Roles", strand="The Heavenly Host",
       topics="Heiser (Angels, 2018): terms describe roles or status — elohim, sons of God, holy ones, host, watchers ('irin, Daniel 4:13, 17, 23), ministers, cherubim, seraphim, archangel (1 Thessalonians 4:16; Jude 9 Michael); ranks as the Bible hints at them and how later writers (Pseudo-Dionysius, about 500 CE, nine choirs) built fuller systems that go beyond the text; guardian angels (Matthew 18:10; Acts 12:15); angels are not dead humans; Hebrews 1–2 Christ above the angels.",
       story="Isaiah stands in the temple and sees six-winged seraphim calling 'Holy, holy, holy'"),
  dict(n=28, title="Angels in Worship, Law and Story", strand="Angels in Scripture",
       topics="angels at Sinai giving the law (Deuteronomy 33:2 in the Septuagint; Acts 7:53; Galatians 3:19; Hebrews 2:2); Colossians 2:18 warns against angel worship; Revelation 19:10 and 22:8–9 John told not to worship an angel; angels in the birth and resurrection stories; angels in Jewish tradition of the Second Temple (Tobit's Raphael, the Dead Sea Scrolls' Songs of the Sabbath Sacrifice); Heiser's warnings against popular ideas that go beyond the Bible; angels in art and culture described.",
       story="In Revelation, John falls at an angel's feet and the angel tells him to get up"),
 ]),

 # ══════════════════════════════ 11–12 (units 15–17, chapters 29–34) ══════════════════════════════
 dict(n=15, band="11-12", title="The Primary Documents and the Scholars", strand="Sources", chapters=[
  dict(n=29, title="The Documents: Enoch, Jubilees, the Scrolls and Their Neighbors", strand="The Documents",
       topics="read the sources themselves: 1 Enoch 6–16 (R. H. Charles, 1917); Jubilees 4:15–22, 5:1–11 and 10:1–14 (the Watchers first sent to teach, Mastema and the spirits; Charles, 1917); the Book of Giants from Qumran (fragments studied by J. T. Milik, 1976, and Loren Stuckenbruck, 1997); the Damascus Document's line on the Watchers who fell; the Genesis Apocryphon (Lamech fears Noah's father was a Watcher); Josephus, Antiquities 1.73 (angels of God and women; Whiston, 1737); Philo, On the Giants; Ugarit (Ras Shamra, found 1928): the council of El and parallels with Psalm 82 and 29; Mesopotamian apkallu sages and Berossus's Oannes (Amar Annus, 2010, compared them with the Watchers, as did Heiser); comparing texts with care (Samuel Sandmel's warning against 'parallelomania', 1961).",
       story="In 1928 a farmer's plow in northern Syria hits a stone slab and opens a lost city's library"),
  dict(n=30, title="Scholars in Conversation", strand="The Research",
       topics="how the researchers read these texts and where they differ: the divine council (E. Theodore Mullen, 1980; Mark S. Smith, The Origins of Biblical Monotheism, 2001; Michael Heiser's 2004 dissertation and The Unseen Realm, 2015); Deuteronomy 32:8 and the text critics (the Qumran reading widely accepted; Emanuel Tov); 1 Enoch's date and growth (J. T. Milik, 1976; James VanderKam, 1984; George Nickelsburg's commentary, 2001); where evil spirits come from (Archie Wright, The Origin of Evil Spirits, 2005; Stuckenbruck, The Myth of Rebellious Angels, 2014); how the Watchers story spread (Annette Yoshiko Reed, Fallen Angels and the History of Judaism and Christianity, 2005); 'two powers in heaven' (Alan Segal, 1977; Heiser); Heiser's 'three rebellions' and 'Deuteronomy 32 worldview' and its critics; Jewish perspectives; reading an argument fairly: claim, evidence, counter-evidence.",
       story="Two students debate Psalm 82 in a library, each with a stack of commentaries by different scholars"),
 ]),
 dict(n=16, band="11-12", title="Destiny: God's Family and the Nations Restored", strand="Endgame", chapters=[
  dict(n=31, title="Believers as God's Family", strand="Children of God",
       topics="Heiser's reading of the story's goal: God restoring his family of humans and heavenly beings together; 'children of God' (John 1:12; Romans 8:14–23; Galatians 4:4–7 adoption); believers will judge angels (1 Corinthians 6:3); ruling the nations (Revelation 2:26–27; 3:21); Psalm 82:6 quoted by Jesus in John 10:34–36; comparison with Eastern Orthodox theosis (Athanasius, 'God became man so that we might become god', paraphrase) and with Jewish readings; Heiser's insistence that believers never become equal to God.",
       story="A student reads John 10 and is startled that Jesus quotes 'you are gods'"),
  dict(n=32, title="Har Magedon and the New Eden", strand="Revelation",
       topics="Revelation 16:16 Armageddon (Har Magedon); the usual reading 'mountain of Megiddo'; Heiser's proposal that it echoes har mo'ed, the 'mount of assembly' of Isaiah 14:13, the mountain of God's council; the final battle as the powers' last stand; Revelation 20: Satan bound; Revelation 21–22: the new Jerusalem as a cube like the holy of holies, a garden city with the tree of life whose leaves heal 'the nations' (22:2) — Eden restored; other ways readers interpret Revelation (preterist, historicist, futurist, idealist) named neutrally.",
       story="On the hill of Megiddo, a tour guide points to twenty-some layers of ruined cities"),
 ]),
 dict(n=17, band="11-12", title="How the Story Was Received, and Capstone", strand="Reception and Capstone", chapters=[
  dict(n=33, title="From the Scrolls to the Church Fathers and the Rabbis", strand="Reception",
       topics="how later readers received the Watchers story, read from their own writings: the Testament of Reuben 5; Justin Martyr, 2 Apology 5 (angels, women and demons; Ante-Nicene Fathers); Irenaeus; Tertullian defends reading Enoch (On the Apparel of Women 1.3); Julius Africanus and the Sethite reading (early 200s CE); Augustine, City of God 15.23 (c. 420 CE); Genesis Rabbah 26 and the Targum Onqelos ('sons of the great ones'); Targum Pseudo-Jonathan names Shemhazai and Azael; the Ethiopian Orthodox church keeps 1 Enoch in its canon; James Bruce and R. H. Charles bring it to English readers; Annette Yoshiko Reed's account of why the story faded and returned (2005); modern popular claims (ancient astronauts, 'giants built the pyramids') checked against the texts — Heiser, among others, argued against Zecharia Sitchin's readings.",
       story="A student finds a viral video claiming 'the Bible proves giants built the pyramids' and checks it against the ancient texts"),
  dict(n=34, title="Capstone: An Argument from the Texts", strand="Capstone",
       topics="choose one question (e.g. Who are the sons of God in Genesis 6? What does Deuteronomy 32:8 say in the oldest copies? Is 1 Peter 3:19 about the Watchers? What did Jesus do at Caesarea Philippi? Where do demons come from in 1 Enoch and in the Gospels?); gather the primary documents (Hebrew Bible, Septuagint, 1 Enoch, Jubilees, the Scrolls, the New Testament, the fathers and the rabbis); state at least two researchers' readings (for example Heiser and Nickelsburg, or Reed and Stuckenbruck); weigh the evidence; write a fair argument; cite document, chapter and verse and translation; present calmly and respectfully to readers who may believe differently.",
       story="A senior lays out Genesis 6, 1 Enoch 6 and Jude 14 on a table and starts to write"),
 ]),
]

# Practice rooms per unit: the Daily Drafts "unseen" book at the matching grade, plus the Bible
# courses that read the same texts.
def _dd(grade, label):
    return [("/drops/unseen/%s" % grade, "Daily Practice — The Unseen Realm, grades %s" % label)]
LINKS = {
 1: _dd("K", "K–2") + [("/bible", "The Bible — the course")],
 2: _dd("1", "K–2") + [("/bible", "The Bible — the course")],
 3: _dd("2", "K–2") + [("/bible", "The Bible — the course")],
 4: _dd("3", "3–5") + [("/bible", "The Bible — the course")],
 5: _dd("3", "3–5") + [("/hebrew-bible", "The Hebrew Bible — the course")],
 6: _dd("4", "3–5") + [("/hebrew-bible", "The Hebrew Bible — the course")],
 7: _dd("5", "3–5") + [("/bible", "The Bible — the course")],
 8: _dd("6", "6–8") + [("/hebrew-bible", "The Hebrew Bible — the course")],
 9: _dd("7", "6–8") + [("/hebrew-bible", "The Hebrew Bible — the course")],
 10: _dd("7", "6–8") + [("/hebrew-bible", "The Hebrew Bible — the course")],
 11: _dd("8", "6–8") + [("/bible", "The Bible — the course")],
 12: _dd("9-10", "9–10") + [("/bible", "The Bible — the course")],
 13: _dd("9-10", "9–10") + [("/bible", "The Bible — the course")],
 14: _dd("9-10", "9–10") + [("/religions-course", "World Religions — the course")],
 15: _dd("11-12", "11–12") + [("/hebrew-bible", "The Hebrew Bible — the course")],
 16: _dd("11-12", "11–12") + [("/bible", "The Bible — the course")],
 17: _dd("11-12", "11–12") + [("/religions-course", "World Religions — the course")],
}
