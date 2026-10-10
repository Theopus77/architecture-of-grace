# World Cultures and Societies, K–12 — the course arc. Our own wording. How people
# live together around the world: families, customs and fairness (K–2); the
# continents, their cultures, rich and poor, and what governments do (3–5); social
# class through history in Europe, Asia and the Americas, and where "left" and
# "right" come from (6–8); the political spectrum in depth, including the extremes on
# both sides and what they did (9–10); then comparison, mobility, propaganda and a
# capstone (11–12). Balanced: every idea is described with what its supporters and its
# critics say; the course never tells a student which side to take. By the owner's
# decision the course does not cover LGBTQ topics or present-day party fights.
# Topics guide the writers; story = the chapter's opening narrative hook.
#
# Units number 1–17 straight through the course; chapters 1–34. Sister courses:
# Social Studies (ssc), U.S. History (ush), Economics (eco), World Religions (rel).

BANDS = [
 dict(id="k-2",   title="Grades K–2",   level="k2"),
 dict(id="3-5",   title="Grades 3–5",   level="35"),
 dict(id="6-8",   title="Grades 6–8",   level="68"),
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
]

UNITS = [
 # ══════════════════════════════ K–2 (units 1–3, chapters 1–6) ══════════════════════════════
 dict(n=1, band="k-2", title="Families and Homes Around the World", strand="Home", chapters=[
  dict(n=1, title="Many Kinds of Families", strand="Families",
       topics="families come in many sizes; grandparents living with grandchildren in many places (Mexico, India, Italy, Korea); cousins, aunts and uncles; families who care for each other; chores and helping at home; every family has its own ways; saying what your family does.",
       story="A girl in Chicago eats Sunday dinner with three generations at one table"),
  dict(n=2, title="Homes in Hot Places and Cold Places", strand="Homes",
       topics="homes fit the weather and land: apartments in big cities (Tokyo, New York), stilt houses near water (Thailand), adobe homes in dry places (New Mexico), yurts (gers) for herders in Mongolia, snow-block shelters once built by Inuit hunters, farmhouses in Europe; what a home needs: shelter, warmth, water; home is where people care for each other.",
       story="A Mongolian boy helps his family fold up their round felt home to move it"),
 ]),
 dict(n=2, band="k-2", title="Food, Clothes, Words and Holidays", strand="Customs", chapters=[
  dict(n=3, title="What's for Lunch Around the World?", strand="Food and Clothes",
       topics="rice in much of Asia, corn tortillas in Mexico, bread across Europe, injera in Ethiopia; chopsticks, forks and eating with the hand; clothes for hot and cold places; special clothes for special days (kimono, sari, dirndl, huipil) described respectfully; trying new food kindly.",
       story="A class shares lunch and finds five different kinds of bread"),
  dict(n=4, title="Hello, Thank You and Happy New Year", strand="Words and Holidays",
       topics="greetings around the world: hola, bonjour, namaste, ni hao, a bow in Japan; thousands of languages; holidays families keep: Lunar New Year, Diwali, Día de los Muertos, Thanksgiving, Christmas, Eid, Hanukkah — named simply as what families do; learning about a friend's holiday.",
       story="A new student bows when he says hello, and the class learns why"),
 ]),
 dict(n=3, band="k-2", title="Rules, Fairness and Leaders", strand="Community", chapters=[
  dict(n=5, title="Why We Have Rules", strand="Rules",
       topics="rules at home, school and on the road; rules keep us safe and fair; the same rule for everyone; what happens when a rule is broken — fix it and try again; laws are rules for a whole country; people in other countries have rules too.",
       story="A game falls apart on the playground until the children agree on one rule"),
  dict(n=6, title="Leaders and Taking Turns", strand="Leaders",
       topics="a leader helps a group; mayors, governors, presidents, and kings and queens in some countries (like the King of the United Kingdom and the Emperor of Japan); voting to choose; taking turns and sharing; everyone has jobs that help (farmers, nurses, bus drivers, teachers); rich and poor families both matter; being kind to people who are different.",
       story="A class votes for the name of its new fish, and the losing side still helps feed it"),
 ]),

 # ══════════════════════════════ 3–5 (units 4–7, chapters 7–14) ══════════════════════════════
 dict(n=4, band="3-5", title="Continents and Cultures", strand="The World", chapters=[
  dict(n=7, title="What Is Culture?", strand="Culture",
       topics="culture = the shared ways of a group: language, food, clothing, beliefs, art, music, stories, holidays and manners; culture is learned; cultures change and mix (pizza, tacos and ramen in Chicago); the seven continents on most U.S. maps (some countries count five or six); maps and globes; respect without stereotypes — people in one country are not all alike.",
       story="A boy lists everything in his house that came from another country"),
  dict(n=8, title="A Tour of Europe, Asia, Africa and the Americas", strand="Regions",
       topics="Europe: many countries close together, many languages, old castles and new cities; Asia: the largest continent, most of the world's people, China and India each over a billion people; Africa: 54 countries, the Sahara and the Nile, great empires like Mali; the Americas: Indigenous nations, Spanish, Portuguese, English and French speakers; one family's day in each region.",
       story="Four pen pals on four continents describe the same Saturday"),
 ]),
 dict(n=5, band="3-5", title="Rich and Poor, Then and Now", strand="Class", chapters=[
  dict(n=9, title="Kings, Nobles and Peasants Long Ago", strand="Long Ago",
       topics="in many places long ago people were born into a rank: kings and queens, nobles and knights, farmers called peasants or serfs; castles and manors in Europe; emperors and samurai in Japan; the emperor and scholars in China; Aztec and Inca rulers; most people could not choose their job; how that began to change.",
       story="A peasant girl in 1300 England carries water past the lord's castle"),
  dict(n=10, title="Why Some People Have More", strand="Today",
       topics="wealth and income; jobs that need more training often pay more; saving, owning land and businesses; luck and where you are born also matter; being poor is not a person's fault or a sign of who they are; helping neighbors: food banks, schools, public libraries; countries rich and poor; the idea of fairness and opportunity.",
       story="Two cousins with the same dream grow up in different countries"),
 ]),
 dict(n=6, band="3-5", title="How Countries Are Governed", strand="Government", chapters=[
  dict(n=11, title="Who Makes the Rules?", strand="Kinds of Government",
       topics="what a government does: laws, safety, roads, schools; kinds: monarchy (ruled by a king or queen), democracy (people choose), dictatorship (one person or group holds power without fair votes); ancient Athens as one of the first democracies; constitutional monarchies today (UK, Japan, Spain); republics (the U.S., France, Mexico, India).",
       story="A student reads about a country where people could not vote, and asks why"),
  dict(n=12, title="Rights and Responsibilities", strand="Citizens",
       topics="rights: speech, religion, a fair trial, voting; responsibilities: obeying laws, jury duty, paying taxes, voting; the Universal Declaration of Human Rights (1948) and Eleanor Roosevelt; different countries protect rights differently; disagreeing respectfully; people who worked for rights (Gandhi, Martin Luther King Jr., Nelson Mandela) told simply.",
       story="A class writes its own list of rights and argues about the last one"),
 ]),
 dict(n=7, band="3-5", title="Festivals, Arts and Everyday Life", strand="Living Culture", chapters=[
  dict(n=13, title="Festivals and Celebrations", strand="Festivals",
       topics="Carnival in Brazil, Lunar New Year in China and Korea, Diwali in India, Día de los Muertos in Mexico, Oktoberfest in Germany, Cherry Blossom season (hanami) in Japan, Independence Days; why people celebrate: harvest, history, family, faith; Chicago's parades and neighborhood festivals.",
       story="A girl paints a sugar skull with her grandmother and learns it is a way of remembering"),
  dict(n=14, title="Music, Games and Stories", strand="Arts",
       topics="music: mariachi, flamenco, K-pop, the sitar, the African talking drum; games: soccer (football) around the world, cricket in India, baseball in Japan and the Dominican Republic, chess from India and Persia; folktales: Anansi, the Brothers Grimm, the Monkey King; how culture travels and blends.",
       story="A soccer ball passes through the hands of children in five countries"),
 ]),

 # ══════════════════════════════ 6–8 (units 8–11, chapters 15–22) ══════════════════════════════
 dict(n=8, band="6-8", title="Social Class in Europe", strand="Europe", chapters=[
  dict(n=15, title="Feudalism and the Three Estates", strand="Medieval Europe",
       topics="feudalism: lords, vassals, fiefs and oaths; the manor and serfs; the Church; the three estates (clergy, nobility, commoners); the Black Death (1347–51) and labor shortages; the Magna Carta (1215) limiting the king; towns, guilds and merchants; the French Revolution (1789) and the end of the estates.",
       story="In 1789 the Third Estate is locked out of its hall and meets on a tennis court instead"),
  dict(n=16, title="Factories, Workers and the Middle Class", strand="Industrial Europe",
       topics="the Industrial Revolution in Britain (from about the 1760s); factories, cities and child labor; the working class and the middle class; trade unions; reform laws (British Factory Acts); Karl Marx and Friedrich Engels, The Communist Manifesto (1848), described with their critics; Adam Smith, The Wealth of Nations (1776); the welfare state beginning in Germany (Bismarck, 1880s).",
       story="A ten-year-old in a Manchester cotton mill ties broken threads for twelve hours"),
 ]),
 dict(n=9, band="6-8", title="Social Order in Asia", strand="Asia", chapters=[
  dict(n=17, title="India: Varna, Jati and Change", strand="India",
       topics="the caste system described historically: varna (four broad groups in ancient texts) and jati (thousands of birth groups tied to work and marriage); Dalits, once called untouchables; Hindu, Muslim, Sikh and Christian responses; B. R. Ambedkar, a Dalit leader who led the drafting of India's Constitution; the Constitution (1950) abolished untouchability; reservations in schools and jobs; change and debate today — never a verdict on Hindus.",
       story="A young Ambedkar is made to sit apart from his classmates, and grows up to write a nation's constitution"),
  dict(n=18, title="China and Japan: Scholars and Samurai", strand="East Asia",
       topics="imperial China's ideal order: scholars, farmers, artisans, merchants; the civil-service exams (to 1905) as a path up; Japan under the Tokugawa shoguns (about 1603–1868): samurai, farmers, artisans, merchants; the Meiji Restoration (1868) ending the samurai class; Korea's yangban; how rank shaped daily life.",
       story="A merchant in Edo is richer than a samurai but must still bow to him"),
 ]),
 dict(n=10, band="6-8", title="Societies of the Americas", strand="The Americas", chapters=[
  dict(n=19, title="The Aztec, the Maya and the Inca", strand="Before 1500",
       topics="the Aztec (Mexica) capital Tenochtitlan; nobles (pipiltin), commoners (macehualtin), merchants (pochteca), enslaved people; the Maya city-states and kings; the Inca empire, the Sapa Inca, the ayllu and mit'a labor, roads and quipu records; achievements and hierarchies described fairly.",
       story="A trader walks into Tenochtitlan's great market and hears thousands of voices"),
  dict(n=20, title="Colonies, Castas and Slavery", strand="Colonial Americas",
       topics="Spanish and Portuguese colonies; peninsulares, criollos, mestizos, Indigenous people and Africans; the casta paintings; the encomienda; the transatlantic slave trade (about 12 million people taken from Africa); slavery in Brazil, the Caribbean and the United States; resistance (Haitian Revolution 1791–1804); abolition (U.S. 1865, Brazil 1888); legacies of inequality.",
       story="A painter in Mexico City in 1760 is paid to paint sixteen labels for sixteen kinds of people"),
 ]),
 dict(n=11, band="6-8", title="Left, Right and the Kinds of Government", strand="Political Ideas", chapters=[
  dict(n=21, title="Where Left and Right Came From", strand="The Spectrum",
       topics="the French National Assembly (1789): supporters of change sat on the left of the president, supporters of the king and tradition on the right; the words spread worldwide; the left usually stresses equality and change, the right usually stresses tradition, order and liberty from government — but meanings differ by country and era; the middle (center); a line is a simple model with limits.",
       story="In a hot hall in Versailles, deputies choose seats, and two words are born"),
  dict(n=22, title="Monarchy, Democracy and Dictatorship", strand="Governments",
       topics="absolute monarchy (Louis XIV); constitutional monarchy (UK); direct and representative democracy; republics; one-party states; military rule; dictators on the left and the right in the 1900s (Stalin, Hitler, Mussolini, Mao) introduced simply; how to tell if an election is free and fair; checks and balances.",
       story="Two countries both hold elections on the same day, but only one has more than one name on the ballot"),
 ]),

 # ══════════════════════════════ 9–10 (units 12–14, chapters 23–28) ══════════════════════════════
 dict(n=12, band="9-10", title="The Political Spectrum in Depth", strand="Ideologies", chapters=[
  dict(n=23, title="Liberalism, Conservatism and the Center", strand="Mainstream Ideas",
       topics="classical liberalism (John Locke, Adam Smith, John Stuart Mill): rights, markets, limited government; modern liberalism and the welfare state; conservatism (Edmund Burke, Reflections on the Revolution in France, 1790): tradition, gradual change, institutions; Christian democracy in Europe; libertarianism; centrism; what supporters and critics of each say; how the same word ('liberal') means different things in the U.S. and Europe.",
       story="A British student and an American student both call themselves liberal and discover they disagree"),
  dict(n=24, title="Socialism, Social Democracy and Nationalism", strand="Wider Ideas",
       topics="socialism: shared or public ownership; Marx's theory of class struggle; democratic socialism and social democracy (the Nordic model: market economies with high taxes and large welfare states — Sweden, Denmark, Norway); nationalism: loyalty to a nation — unifying (Italy, Germany in the 1800s; independence movements in India and Africa) and dangerous in its extreme forms; populism on the left and right, defined as scholars describe it; supporters and critics of each.",
       story="A Danish nurse explains her taxes to an American cousin, and each is surprised"),
 ]),
 dict(n=13, band="9-10", title="The Extremes: Communism and Fascism", strand="Totalitarianism", chapters=[
  dict(n=25, title="Communism in Power", strand="The Far Left",
       topics="Marxism-Leninism; the Russian Revolution (1917); the USSR under Lenin and Stalin: one-party rule, collective farms, the Gulag labor camps, the famine in Ukraine (Holodomor, 1932–33), the Great Terror; Mao's China: the Great Leap Forward famine (tens of millions died) and the Cultural Revolution; the Khmer Rouge in Cambodia (about 1.5–2 million deaths); Cuba and North Korea; why people were drawn to it (promises of equality, land, an end to exploitation) and what happened; the fall of the Berlin Wall (1989) and the USSR (1991).",
       story="A farmer in Ukraine in 1932 watches officials take the last of his grain"),
  dict(n=26, title="Fascism and Nazism", strand="The Far Right",
       topics="Mussolini's Fascist Italy (from 1922): the cult of the leader, the one-party state, violence against opponents; Hitler and the Nazis (1933–45): racial ideology, antisemitism, the destruction of democracy, the Holocaust (about six million Jews murdered, along with Roma, disabled people, Poles, Soviet prisoners and others); Franco's Spain; Imperial Japan's militarism; why people were drawn to it (national humiliation, depression, fear of communism); totalitarianism as a shared feature of the far left and far right (Hannah Arendt, 1951).",
       story="In 1933 a Berlin teacher is told which books must leave the school library"),
 ]),
 dict(n=14, band="9-10", title="Class and Culture Today", strand="Society Today", chapters=[
  dict(n=27, title="Inequality and Social Mobility", strand="Mobility",
       topics="income vs. wealth; measuring inequality (the Gini coefficient; Latin America among the most unequal regions, Nordic countries among the least); social mobility — how easily children move up or down; the 'Great Gatsby curve' as economists describe it; education as a ladder; class in the UK (accent, schools); India's reservations debate; China's rise from 1978 reforms and hundreds of millions lifted out of extreme poverty; different explanations from left and right.",
       story="Two babies are born on the same day in Oslo and in São Paulo; a student tracks what their chances look like"),
  dict(n=28, title="Culture, Migration and Identity", strand="Culture Today",
       topics="globalization of food, music and film (K-pop, anime, Bollywood, reggaeton); migration from Asia, Latin America and Africa; assimilation, multiculturalism and integration as policies and the debates about them; language preservation; Indigenous peoples today; cultural exchange vs. appropriation as people argue it; Chicago's neighborhoods (Pilsen, Chinatown, Devon Avenue, Ukrainian Village).",
       story="A grandmother in Pilsen teaches a recipe in Spanish to a grandson who answers in English"),
 ]),

 # ══════════════════════════════ 11–12 (units 15–17, chapters 29–34) ══════════════════════════════
 dict(n=15, band="11-12", title="Comparing Systems", strand="Comparison", chapters=[
  dict(n=29, title="Models of the Spectrum", strand="Models",
       topics="the one-line left-right model and its limits; two-axis models (economic left-right plus authoritarian-libertarian); the horseshoe idea that the extremes resemble each other, and the critics of that idea; how 'left' and 'right' mean different things in the U.S., Europe, Latin America and Asia; case studies: Singapore, Sweden, Chile, Japan; using models without stereotyping people.",
       story="A class plots twenty historical leaders on a grid and argues about three of them"),
  dict(n=30, title="Paths to Democracy and Away From It", strand="Democracy",
       topics="waves of democratization (Samuel Huntington); Spain and Portugal in the 1970s; South Korea and Taiwan in the late 1980s; the end of apartheid in South Africa (1994); Eastern Europe after 1989; Latin American transitions (Chile 1990); democratic backsliding as political scientists describe it; the rule of law, a free press and independent courts as warning lights; examples from both left- and right-leaning governments.",
       story="In 1987 students in Seoul march for direct elections, and a general agrees"),
 ]),
 dict(n=16, band="11-12", title="Propaganda, Extremism and Civic Life", strand="Civic Skills", chapters=[
  dict(n=31, title="Reading Propaganda", strand="Propaganda",
       topics="propaganda techniques: the enemy image, the big lie, the cult of personality, bandwagon, fear; Soviet and Nazi posters compared; wartime propaganda in democracies too; media literacy: source, purpose, evidence, lateral reading; algorithms and echo chambers; checking a claim before sharing it.",
       story="A student lays a 1930s Soviet poster beside a 1930s Nazi poster and finds the same tricks"),
  dict(n=32, title="Warning Signs and Civic Strength", strand="Extremism",
       topics="how people are drawn into extremist movements on the far left and far right: grievance, belonging, us-versus-them, dehumanizing language; political violence in history (Red Brigades in Italy, neo-Nazi groups, the Shining Path in Peru); how communities and democracies resist: civic groups, voting, dialogue across difference, free press; disagreeing well.",
       story="A former extremist tells a class what made him join and what made him leave"),
 ]),
 dict(n=17, band="11-12", title="World Cultures Today, and Capstone", strand="Capstone", chapters=[
  dict(n=33, title="Europe, Asia and the Americas Compared", strand="Comparison",
       topics="compare three societies on family, class, government and culture (e.g., Germany, Japan, Mexico); welfare states; aging populations in Europe and East Asia; urbanization; the role of religion and tradition; what each society values most, as its own people describe it; avoiding stereotypes when comparing.",
       story="Three exchange students compare what their families expect of them at eighteen"),
  dict(n=34, title="Capstone: A Question, Evidence and Your Argument", strand="Capstone",
       topics="choose a question (e.g., What best helps people move up? Why do some democracies last? What makes an ideology turn extreme?); gather evidence from at least two regions; represent the strongest views of both left and right fairly; build a claim with evidence and reasoning; answer counterarguments; present and discuss respectfully.",
       story="A student picks a question she thinks she knows the answer to, and the evidence surprises her"),
 ]),
]

# Practice rooms per unit: the Daily Drafts "cultures" spiral at the matching grade, plus the
# Social Studies and Economics courses that meet the same material.
def _dd(grade, label):
    return [("/drops/cultures/%s" % grade, "Daily Practice — World Cultures, grades %s" % label)]
LINKS = {
 1: _dd("K", "K–2") + [("/social-studies-course", "Social Studies — the course")],
 2: _dd("1", "K–2") + [("/social-studies-course", "Social Studies — the course")],
 3: _dd("2", "K–2") + [("/social-studies-course", "Social Studies — the course")],
 4: _dd("3", "3–5") + [("/social-studies-course", "Social Studies — the course")],
 5: _dd("4", "3–5") + [("/economics-course", "Economics — the course")],
 6: _dd("4", "3–5") + [("/social-studies-course", "Social Studies — the course")],
 7: _dd("5", "3–5") + [("/religions-course", "World Religions — the course")],
 8: _dd("6", "6–8") + [("/social-studies-course", "Social Studies — the course")],
 9: _dd("7", "6–8") + [("/religions-course", "World Religions — the course")],
 10: _dd("7", "6–8") + [("/us-history", "U.S. History — the course")],
 11: _dd("8", "6–8") + [("/social-studies-course", "Social Studies — the course")],
 12: _dd("9-10", "9–10") + [("/economics-course", "Economics — the course")],
 13: _dd("9-10", "9–10") + [("/social-studies-course", "Social Studies — the course")],
 14: _dd("9-10", "9–10") + [("/economics-course", "Economics — the course")],
 15: _dd("11-12", "11–12") + [("/social-studies-course", "Social Studies — the course")],
 16: _dd("11-12", "11–12") + [("/social-studies-course", "Social Studies — the course")],
 17: _dd("11-12", "11–12") + [("/economics-course", "Economics — the course")],
}
