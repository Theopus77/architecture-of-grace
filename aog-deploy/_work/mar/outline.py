# The Measured Step — martial arts history, K–12 — course id mar
# History of rooms and codes. No technique, strike, choke, throw, or how-to.
# Bowing, meditation, ritual objects: described, never led.
# Sister: spt. Cross-link /sports-course.
# Live pages only besides sister: /us-history, /social, /world-cultures.
# Daily Drafts: /drops/martial/K | 3-5 | 6-8 | 9-10 | 11-12

BANDS = [
 dict(id="k-2",   title="Grades K–2",   level="k2"),
 dict(id="3-5",   title="Grades 3–5",   level="35"),
 dict(id="6-8",   title="Grades 6–8",   level="68"),
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
]

UNITS = [
 dict(n=1, band="k-2", title="The Circle on the Floor", strand="Rooms", chapters=[
  dict(n=1, title="Circle, Square, Strip", strand="Rooms",
       topics="roda as circle; boxing as square with ropes; fencing as a strip; the floor is a rule you can see; no how-to fight.",
       story="Tape on a gym floor makes a circle before anyone steps in"),
  dict(n=2, title="A Song in a Circle", strand="Rooms",
       topics="some rooms use music; capoeira's roda named as a place; song starts the room; still no technique.",
       story="A single-string bow leans against a wall while a circle waits"),
 ]),
 dict(n=2, band="k-2", title="Jacket and Belt", strand="Marks", chapters=[
  dict(n=3, title="A School Mark", strand="Marks",
       topics="belt as class mark not magic; gi as school clothes; Illinois wrestling uses a singlet; different rooms different clothes.",
       story="A folded white jacket and a colored belt sit on a shelf like library books"),
  dict(n=4, title="Many Names", strand="Names",
       topics="Japan Okinawa Korea China Thailand Brazil Europe; karate is not taekwondo; kung fu is a wide English word.",
       story="A hallway sign lists six arts and none of them share a last name"),
 ]),
 dict(n=3, band="k-2", title="Fair Start", strand="Fairness", chapters=[
  dict(n=5, title="Bow, Handshake, Whistle", strand="Fairness",
       topics="how rooms start; PE marks versus dojo marks; describe not perform a ritual as worship.",
       story="Two classes start the same minute with two different signals"),
  dict(n=6, title="Rules That Keep Players Safe", strand="Fairness",
       topics="Broughton's rules (1743); Queensberry gloves and rounds (1867); fencing masks and electric scoring; weight classes; world federations write rule books; headgear in school wrestling; when women and girls got their own events.",
       story="A teacher opens an old book of rules and finds a pair of gloves"),
 ]),
 dict(n=4, band="3-5", title="Wrestling Older Than the League", strand="Origins", chapters=[
  dict(n=7, title="Holds Before Stadiums", strand="Wrestling",
       topics="deep time images of wrestling; many lands; school wrestling is a later room with clock and weight classes.",
       story="A carved scene of two wrestlers sits in a museum case far from a gym clock"),
  dict(n=8, title="Illinois 1937", strand="Wrestling",
       topics="IHSA wrestling state champions 1937; date marks school sport not the invention of holding.",
       story="A 1937 program lists names under a state seal"),
 ]),
 dict(n=5, band="3-5", title="A School with a Rulebook", strand="Origins", chapters=[
  dict(n=9, title="Kanō Writes Judo", strand="Judo",
       topics="Jigoro Kano late 1800s; older jujutsu schools; education code; ranks; Olympic judo 1964 Tokyo.",
       story="A teacher rewrites older school notes into a book meant for a classroom"),
  dict(n=10, title="Why a Code Matters", strand="Judo",
       topics="a rulebook turns a fight-world into a school sport; compare to Queensberry later.",
       story="Two jackets bow because a page said the match has a start"),
 ]),
 dict(n=6, band="3-5", title="Okinawa and Korea", strand="Origins", chapters=[
  dict(n=11, title="A Demonstration in Tokyo", strand="Karate",
       topics="karate from Ryukyu/Okinawa; Chinese influence; Funakoshi 1922 Tokyo; after 1945 names blur in American storefronts.",
       story="An Okinawan teacher stands on a Tokyo stage with an empty floor"),
  dict(n=12, title="A Korean School Sport", strand="Taekwondo",
       topics="twentieth-century national design; Olympic path from 2000; not just Korean karate.",
       story="A new national federation prints a curriculum for schools"),
 ]),
 dict(n=7, band="3-5", title="Circle and Ring", strand="Origins", chapters=[
  dict(n=13, title="A Bow, a Song, a Circle", strand="Capoeira",
       topics="Afro-Brazilian art; roda; law once treated it as a problem; later schools and stages; art can change rooms.",
       story="A berimbau hangs where a ban used to hang"),
  dict(n=14, title="Queensberry and the Ring", strand="Boxing",
       topics="1867 Queensberry gloves and rounds; early IHSA bars boxing from school sport; town gym is another institution.",
       story="A gloved rulebook sits on one desk; a school handbook sits on another"),
 ]),
 dict(n=8, band="6-8", title="China Is Not One Kung Fu", strand="Place", chapters=[
  dict(n=15, title="Many Systems", strand="China",
       topics="northern southern; temple stories; Republican national programs; wushu taolu as judged composition; sanda as another code; English kung fu flattens the map.",
       story="A floor plan for a form and a ring plan for a sport share one building"),
  dict(n=16, title="Name the Room Not the Movie", strand="China",
       topics="film names versus school names; paraphrase films; no technique.",
       story="A movie poster and a school charter disagree about the same word"),
 ]),
 dict(n=9, band="6-8", title="Southeast Asia and Travel", strand="Place", chapters=[
  dict(n=17, title="Muay Thai Objects", strand="Muay Thai",
       topics="Thailand's ring sport; mongkon and pra jiad as gym marks not costume aisle.",
       story="A head hoop and an armband rest on a ring plan"),
  dict(n=18, title="Silat, Arnis, a Chicago Gym", strand="Diaspora",
       topics="silat family; arnis/eskrima in PE abroad; gym is not village festival; both real.",
       story="A stick used as a sport object lies on a PE closet shelf"),
 ]),
 dict(n=10, band="6-8", title="Who May Stand on the Mat", strand="Nation", chapters=[
  dict(n=19, title="Women on the Mat", strand="Gender",
       topics="Title IX 1972; combat sports moved slowly; IHSA girls wrestling 2021; Olympic women's calendars in judo and taekwondo.",
       story="A new weight-class sheet adds names the old sheet never had"),
  dict(n=20, title="When the State Uses the Gym", strand="State",
       topics="Japanese budo in school and wartime PE; restrictions after 1945; return as school sport; China and Korea national display; health culture or state project.",
       story="A ministry memo assigns hours of gym to a national art"),
 ]),
 dict(n=11, band="6-8", title="Illinois Storefronts", strand="Local", chapters=[
  dict(n=21, title="Four Rooms in One County", strand="Illinois",
       topics="wrestling room; storefront karate; college judo; boxing gym; compare two.",
       story="Four doors on one commercial strip use four different words for school"),
  dict(n=22, title="Chicago Gloves and Illinois Mats", strand="Illinois",
       topics="Chicago Golden Gloves and the Chicago Tribune; park district field houses as rooms for boxing and judo; IHSA wrestling (boys 1937, girls 2022); a trophy case holds many sports, each with its own rule book and records.",
       story="A wrestling bracket and a Golden Gloves program share a trophy case"),
 ]),
 dict(n=12, band="9-10", title="Who Hangs the Sign", strand="Claim", chapters=[
  dict(n=23, title="Lineage and a Certificate", strand="Authority",
       topics="Shotokan Gracie Kukkiwon as claims; federation versus weekend seminar; courts and trademarks.",
       story="Two certificates on one wall name two different grandfathers"),
  dict(n=24, title="Olympic Code versus Village Art", strand="Codes",
       topics="standard equipment and time; flattening as price of the stage; village rules answer a different institution.",
       story="A village festival and an Olympic heat share a name and nothing else"),
 ]),
 dict(n=13, band="9-10", title="Film and the New League", strand="Claim", chapters=[
  dict(n=25, title="Invented Style", strand="Film",
       topics="cinema grammar of styles; gyms inherit movie names; paraphrase films; no how-to.",
       story="A student arrives asking for a style a village never used"),
  dict(n=26, title="MMA as a League", strand="MMA",
       topics="late twentieth-century spectator institution; commissions; borrows wrestling boxing judo Muay Thai rooms; not a lost temple.",
       story="A commission stamp sits on a bout sheet like a license"),
 ]),
 dict(n=14, band="9-10", title="What PE Flattens", strand="School", chapters=[
  dict(n=27, title="Martial Arts in School and Service", strand="PE",
       topics="wartime combatives courses in military training; judo in U.S. colleges (San Jose State); martial arts in PE curricula; a short school unit versus a long lineage; liability and insurance in school programs.",
       story="A six-week unit tries to hold six centuries"),
  dict(n=28, title="Who Regulates the Room", strand="PE",
       topics="state athletic commissions and boxing licenses (New York, 1920); concussion laws for young athletes (Washington 2009, Illinois 2011); NFHS rules on weight and skin checks; who is responsible when a gym opens its doors.",
       story="A license hangs framed beside the door of a boxing gym"),
 ]),
 dict(n=15, band="11-12", title="Ownership", strand="Argument", chapters=[
  dict(n=29, title="Who Owns a Name", strand="Argument",
       topics="lineage markets; nation brands; diaspora schools; evidence not vibe.",
       story="A lawyer and a teacher argue about the same three letters on a door"),
  dict(n=30, title="Memory in the Gym", strand="Argument",
       topics="empire; occupation; who gets honored on the wall; hard topics factual.",
       story="A photograph of a founder hangs above a flag the founder never flew"),
 ]),
 dict(n=16, band="11-12", title="Compare Without Ranking", strand="Argument", chapters=[
  dict(n=31, title="Six Rooms Again", strand="Taxonomy",
       topics="grapple strike armed-as-sport flow diaspora modern mix; taxonomy as tool not ranking.",
       story="Six objects on a shelf refuse to become one belt"),
  dict(n=32, title="Capstone Compare", strand="Capstone",
       topics="two arts; origin room nation code; no technique; cite dates.",
       story="Two rulebooks open to the page that names who may start"),
 ]),
 dict(n=17, band="11-12", title="Object and Plan", strand="Capstone", chapters=[
  dict(n=33, title="Objects as Evidence", strand="Capstone",
       topics="a belt, a mask, a berimbau, a banzuke and a rule book read as primary sources; museums, archives and halls of fame that keep them; writing a caption that says what an object is, where it came from and who made it.",
       story="A fencing mask sits in a museum case beside a printed rule book"),
  dict(n=34, title="A Plan for Your Own Research", strand="Capstone",
       topics="pick one tradition; gather its founding dates, governing body, rule book editions and records of who was admitted when; weigh legend against record; cite each institution and plan a short research paper.",
       story="A student lays out a founding charter, a rule book and a newspaper clipping"),
 ]),
]

# Practice rooms per unit: the Daily Drafts "martial" bank at the matching grade, plus related courses.
def _dd(grade, label):
    return [("/drops/martial/%s" % grade, "Daily Drafts — The Measured Step, grades %s" % label)]
LINKS = {
 1: _dd('K', 'K–2') + [('/sports-course', 'Sports History — the course'), ('/world-cultures', 'World Cultures — every band')],
 2: _dd('1', 'K–2') + [('/sports-course', 'Sports History — the course'), ('/world-cultures', 'World Cultures — every band')],
 3: _dd('2', 'K–2') + [('/sports-course', 'Sports History — the course'), ('/world-cultures', 'World Cultures — every band')],
 4: _dd('3', '3–5') + [('/sports-course', 'Sports History — the course'), ('/world-cultures', 'World Cultures — every band')],
 5: _dd('3', '3–5') + [('/sports-course', 'Sports History — the course'), ('/world-cultures', 'World Cultures — every band')],
 6: _dd('4', '3–5') + [('/sports-course', 'Sports History — the course'), ('/world-cultures', 'World Cultures — every band')],
 7: _dd('5', '3–5') + [('/sports-course', 'Sports History — the course'), ('/world-cultures', 'World Cultures — every band')],
 8: _dd('6', '6–8') + [('/sports-course', 'Sports History — the course'), ('/world-cultures', 'World Cultures — every band')],
 9: _dd('7', '6–8') + [('/sports-course', 'Sports History — the course'), ('/world-cultures', 'World Cultures — every band')],
 10: _dd('7', '6–8') + [('/sports-course', 'Sports History — the course'), ('/world-cultures', 'World Cultures — every band')],
 11: _dd('8', '6–8') + [('/sports-course', 'Sports History — the course'), ('/world-cultures', 'World Cultures — every band')],
 12: _dd('9-10', '9–10') + [('/sports-course', 'Sports History — the course'), ('/world-cultures', 'World Cultures — every band')],
 13: _dd('9-10', '9–10') + [('/sports-course', 'Sports History — the course'), ('/world-cultures', 'World Cultures — every band')],
 14: _dd('9-10', '9–10') + [('/sports-course', 'Sports History — the course'), ('/world-cultures', 'World Cultures — every band')],
 15: _dd('11-12', '11–12') + [('/sports-course', 'Sports History — the course'), ('/world-cultures', 'World Cultures — every band')],
 16: _dd('11-12', '11–12') + [('/sports-course', 'Sports History — the course'), ('/world-cultures', 'World Cultures — every band')],
 17: _dd('11-12', '11–12') + [('/sports-course', 'Sports History — the course'), ('/world-cultures', 'World Cultures — every band')],
}
