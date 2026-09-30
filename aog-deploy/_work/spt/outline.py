# Sports History, K–12 — course id spt
# History of games as institutions. Not PE. Not a playbook.
# Sister: mar (The Measured Step). Cross-link /martial-arts-course.
# Live pages only besides sister: /us-history, /social, /world-cultures.
# Daily Drafts: /drops/sports/K | 3-5 | 6-8 | 9-10 | 11-12
# History only. No technique. Rituals described, never led.

BANDS = [
 dict(id="k-2",   title="Grades K–2",   level="k2"),
 dict(id="3-5",   title="Grades 3–5",   level="35"),
 dict(id="6-8",   title="Grades 6–8",   level="68"),
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
]

UNITS = [
 dict(n=1, band="k-2", title="Play Has Kinds", strand="Play", chapters=[
  dict(n=1, title="Balls, Races, Water, Ice", strand="Play",
       topics="kinds of play; each kind needs a place; pool is not a field; court is not a pond; sport in this book means a game with a place and a spoken rule.",
       story="A class walks from the gym to the playground and notices the floor change"),
  dict(n=2, title="A Turn Everyone Can See", strand="Play",
       topics="a fair turn; whistle, line, or hand as a mark; a team shares a job inside the rule; famous is not the job.",
       story="A whistle blows and half the class freezes while the other half runs"),
 ]),
 dict(n=2, band="k-2", title="Our Field", strand="Place", chapters=[
  dict(n=3, title="Park, Gym, Lights", strand="Place",
       topics="civic rooms near school; people paid for them; Friday lights; draw a real place; no logos.",
       story="Friday lights click on over an empty field before anyone arrives"),
  dict(n=4, title="A Rule You Can Say", strand="Place",
       topics="one-sentence rules; sharing a rectangle; why a line on the ground helps strangers play.",
       story="Two children from different classes meet at a painted line and both know what it means"),
 ]),
 dict(n=3, band="k-2", title="Many Games, One Book", strand="Names", chapters=[
  dict(n=5, title="Games That Travel", strand="Names",
       topics="some games move to new towns; a ball can cross an ocean; names of a few sports without plays.",
       story="A ball from a closet has no writing on it, only wear from many hands"),
  dict(n=6, title="The Measured Step Lives Next Door", strand="Names",
       topics="martial arts is a sister book; this book does not teach a strike; a mat and a field are different rooms.",
       story="A folded jacket hangs in a hallway next to a bag of baseballs"),
 ]),
 dict(n=4, band="3-5", title="How a Diamond Got Lines", strand="Origins", chapters=[
  dict(n=7, title="From a Lot to a Diamond", strand="Baseball",
       topics="sandlot versus measured field; bases; strangers copying lines; baseball as shape not pitching lesson.",
       story="Kids invent bases with jackets, then see a field with painted lines"),
  dict(n=8, title="A Scorebook and a Diamond Plan", strand="Baseball",
       topics="a book that holds innings; why writing a game down lets two towns compare; object plus plan.",
       story="A pencil sits on an open scorebook beside a chalk diamond"),
 ]),
 dict(n=5, band="3-5", title="An Indoor Winter Game", strand="Origins", chapters=[
  dict(n=9, title="A Peach Basket in a Gym", strand="Basketball",
       topics="Naismith 1891 Springfield Massachusetts YMCA winter class; balcony; indoor room invents a sport.",
       story="A teacher looks at a winter gym and needs a game that will not break the windows"),
  dict(n=10, title="From Y to School Hoop", strand="Basketball",
       topics="the game leaves the Y; school gyms copy the room; still no plays taught.",
       story="A peach basket comes down and an iron hoop stays"),
 ]),
 dict(n=6, band="3-5", title="School Fields and World Pitches", strand="Origins", chapters=[
  dict(n=11, title="The Gridiron Beside the School", strand="Football",
       topics="campus games late 1800s; high school field as civic building; no formations.",
       story="Bleachers face a rectangle of painted grass"),
  dict(n=12, title="A Rectangle the World Can Share", strand="Soccer",
       topics="association football; a simple pitch; a rulebook that travels; people kicked balls before the code.",
       story="Two towns that do not share a language still share a rectangle"),
 ]),
 dict(n=7, band="3-5", title="Time, Water, a Line", strand="Origins", chapters=[
  dict(n=13, title="A Clock on a Track", strand="Track",
       topics="lanes; a mark; time made visible; a stopwatch as object.",
       story="A hand drops and eight lanes become eight times"),
  dict(n=14, title="Pool Length and a Tennis Line", strand="Water and Court",
       topics="measured pool; tennis as line and net; drawings people agreed to share.",
       story="A rope floats across water to mark a length"),
 ]),
 dict(n=8, band="6-8", title="Who Was Written Out", strand="History", chapters=[
  dict(n=15, title="Baseball and the Color Line", strand="Exclusion",
       topics="league rules that locked rosters; Negro Leagues as institutions; breaking a line is a date not a mood; no slogans.",
       story="A printed league constitution sits next to a ticket stub from another league"),
  dict(n=16, title="Amateur Codes and Other Locks", strand="Exclusion",
       topics="amateur rules; class; other sports' doors; write the rule then the name it shut out.",
       story="A form asks whether a player was paid, and the answer is a gate"),
 ]),
 dict(n=9, band="6-8", title="City Rooms and Civic Nights", strand="History", chapters=[
  dict(n=17, title="Boxing and the Newspaper", strand="Boxing",
       topics="prizefighting as public story; press and radio; IHSA kept boxing out of early Illinois school sport; town gym versus school league.",
       story="A front page sells a fight the school board will not host"),
  dict(n=18, title="Basketball in the Neighborhood", strand="City",
       topics="Y, settlement house, playground hoop; city rooms before television.",
       story="A chain net hangs in an alley that is also a court"),
 ]),
 dict(n=10, band="6-8", title="Nations and New Rosters", strand="History", chapters=[
  dict(n=19, title="Olympics as a Stage", strand="Olympics",
       topics="flags; boycotts; a code that flattens local games so nations can meet.",
       story="A flag rises over a stadium that is rented for two weeks"),
  dict(n=20, title="Title IX and a New Door", strand="Law",
       topics="Education Amendments 1972; sport inside an education law; Illinois IHSA wrestling 1937; girls wrestling 2021.",
       story="A statute book and a new roster hang on the same bulletin board"),
 ]),
 dict(n=11, band="6-8", title="Other Institutions, Same State", strand="History", chapters=[
  dict(n=21, title="Disability Sport as Institution", strand="Disability Sport",
       topics="Deaf games; wheelchair basketball; Paralympic federations; not charity posters.",
       story="A classification card sits beside a racing chair like a ticket"),
  dict(n=22, title="Illinois Rooms", strand="Illinois",
       topics="park district gyms; who got a field; link ill course for land; IHSA as school institution; no yearbook tone.",
       story="A park-district key opens a gym on a school night"),
 ]),
 dict(n=12, band="9-10", title="School, Work, and the Clip", strand="Institutions", chapters=[
  dict(n=23, title="College Sport as Two Sentences", strand="College",
       topics="eligibility; television; student versus worker; tension is the lesson.",
       story="A media guide and a class schedule share one locker"),
  dict(n=24, title="Who Owned a Career", strand="Labor",
       topics="reserve clause; free agency as labor with dates; a career as property.",
       story="A contract binds a name to a club that can trade the name"),
 ]),
 dict(n=13, band="9-10", title="Numbers and Squares", strand="Institutions", chapters=[
  dict(n=25, title="Radio, Television, the Clip", strand="Media",
       topics="national fights on radio; seasons in living rooms; the clip flattens memory.",
       story="A ten-second clip is all a city remembers of a three-hour game"),
  dict(n=26, title="A Record Is an Argument", strand="Records",
       topics="equipment; altitude; medicine; who was allowed to try; distrust needs a reason.",
       story="Two record books disagree about the same afternoon"),
 ]),
 dict(n=14, band="9-10", title="Field as Square", strand="Institutions", chapters=[
  dict(n=27, title="Protest on a Field", strand="Protest",
       topics="workplace and public square; anthems; boycotts; pick a frame and stay.",
       story="A stadium goes quiet for a song some players will not perform"),
  dict(n=28, title="Two Tours, Not One Ladder", strand="Gender and Money",
       topics="parallel industries; money gaps named as money; media difference.",
       story="Two tour calendars hang side by side with different prize lines"),
 ]),
 dict(n=15, band="11-12", title="What a League Is", strand="Argument", chapters=[
  dict(n=29, title="A Constitution for a Game", strand="Governance",
       topics="bylaws; commissioners; amateurism as ideology; draft a five-line constitution.",
       story="A room of owners votes on a rule the players did not write"),
  dict(n=30, title="High School Profit and the District", strand="School Politics",
       topics="should a district publish Friday-night profit; civic ritual versus revenue; link ss not copy civics.",
       story="A booster check and a board agenda share one night"),
 ]),
 dict(n=16, band="11-12", title="Bodies, Data, and the State", strand="Argument", chapters=[
  dict(n=31, title="Classification, Sex, and Eligibility", strand="Eligibility",
       topics="who a league counts; classification in disability sport; sex eligibility as contested institution; factual range; no slogans.",
       story="A form asks a body to fit a box the league invented"),
  dict(n=32, title="The State in the Stadium", strand="State",
       topics="tax; eminent domain for arenas; public schools as the farm system; Illinois examples only if sure.",
       story="A public bond pays for lights a private team will use"),
 ]),
 dict(n=17, band="11-12", title="Capstone", strand="Capstone", chapters=[
  dict(n=33, title="Pick One Sport and Its Paper", strand="Capstone",
       topics="student chooses one sport; gather rulebook dates; who was written in and out; cite institutions.",
       story="A stack of constitutions from one sport sits on a desk"),
  dict(n=34, title="Object and Plan", strand="Capstone",
       topics="pencil still life: object plus measured plan; write the caption the site requires; no logos; no mid-action bodies.",
       story="A scorebook and a field plan wait for a pencil caption"),
 ]),
]

# Practice rooms per unit: the Daily Drafts "sports" bank at the matching grade, plus related courses.
def _dd(grade, label):
    return [("/drops/sports/%s" % grade, "Daily Drafts — Sports History, grades %s" % label)]
LINKS = {
 1: _dd('K', 'K–2') + [('/martial-arts-course', 'The Measured Step — martial arts history'), ('/social', 'Social Studies — every band')],
 2: _dd('1', 'K–2') + [('/martial-arts-course', 'The Measured Step — martial arts history'), ('/social', 'Social Studies — every band')],
 3: _dd('2', 'K–2') + [('/martial-arts-course', 'The Measured Step — martial arts history'), ('/social', 'Social Studies — every band')],
 4: _dd('3', '3–5') + [('/martial-arts-course', 'The Measured Step — martial arts history'), ('/social', 'Social Studies — every band')],
 5: _dd('3', '3–5') + [('/martial-arts-course', 'The Measured Step — martial arts history'), ('/social', 'Social Studies — every band')],
 6: _dd('4', '3–5') + [('/martial-arts-course', 'The Measured Step — martial arts history'), ('/social', 'Social Studies — every band')],
 7: _dd('5', '3–5') + [('/martial-arts-course', 'The Measured Step — martial arts history'), ('/social', 'Social Studies — every band')],
 8: _dd('6', '6–8') + [('/us-history', 'U.S. History, grades 6–8'), ('/martial-arts-course', 'The Measured Step — martial arts history'), ('/social', 'Social Studies — every band')],
 9: _dd('7', '6–8') + [('/us-history', 'U.S. History, grades 6–8'), ('/martial-arts-course', 'The Measured Step — martial arts history'), ('/social', 'Social Studies — every band')],
 10: _dd('7', '6–8') + [('/us-history', 'U.S. History, grades 6–8'), ('/martial-arts-course', 'The Measured Step — martial arts history'), ('/social', 'Social Studies — every band')],
 11: _dd('8', '6–8') + [('/us-history', 'U.S. History, grades 6–8'), ('/martial-arts-course', 'The Measured Step — martial arts history'), ('/social', 'Social Studies — every band')],
 12: _dd('9-10', '9–10') + [('/martial-arts-course', 'The Measured Step — martial arts history'), ('/social', 'Social Studies — every band')],
 13: _dd('9-10', '9–10') + [('/martial-arts-course', 'The Measured Step — martial arts history'), ('/social', 'Social Studies — every band')],
 14: _dd('9-10', '9–10') + [('/martial-arts-course', 'The Measured Step — martial arts history'), ('/social', 'Social Studies — every band')],
 15: _dd('11-12', '11–12') + [('/martial-arts-course', 'The Measured Step — martial arts history'), ('/social', 'Social Studies — every band')],
 16: _dd('11-12', '11–12') + [('/martial-arts-course', 'The Measured Step — martial arts history'), ('/social', 'Social Studies — every band')],
 17: _dd('11-12', '11–12') + [('/martial-arts-course', 'The Measured Step — martial arts history'), ('/social', 'Social Studies — every band')],
}
