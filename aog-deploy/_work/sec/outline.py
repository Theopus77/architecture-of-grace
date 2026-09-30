# Secret Societies, K–12 — the course arc. Our own wording. Why people form groups with
# private rites, signs and promises; what those groups did for their members and to their
# neighbors; and how to tell a documented record from a legend or a forgery.
# K–2: clubs, codes, safe and unsafe secrets, builders who helped their towns.
# 3–5: ancient mystery rites, the Templars, American lodges, codebreaking.
# 6–8: Freemasonry's real history, orders around the world, America's fear of secret
#      societies, the Black Hand and the Chicago Outfit.
# 9–10: the real Illuminati and the legend after it, the Klan and those who fought it,
#       the Mafia on trial.
# 11–12: forgeries and fakes, real government secrets, Bill Cooper and the conspiracy age.
# Owner's decisions (2026-09-30): brotherhoods and orders, plus criminal and hate secret
# orders; resistance networks and college/power clubs are left out. Criminal and hate
# groups are taught in grades 6–12 only, with victims and resisters at the center.
# Bill Cooper is taught in 11–12 as a documented life plus a claims ledger students weigh
# for themselves (documented / disputed / shown false).
# Research: _work/sec/research/d1–d9, 00-source-check.md and verified.md (2026-09-30). Anything marked UNVERIFIED or
# "KNOWN, NOT RE-CHECKED" there must be confirmed before it goes into a lesson.
# Topics guide the writers; story = the chapter's opening narrative hook.
#
# Units number 1–17 straight through the course; chapters 1–34. Sister courses:
# World Cultures (wcs), U.S. History (ush), Social Studies (ssc), World Religions (rel).

BANDS = [
 dict(id="k-2",   title="Grades K–2",   level="k2"),
 dict(id="3-5",   title="Grades 3–5",   level="35"),
 dict(id="6-8",   title="Grades 6–8",   level="68"),
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
]

UNITS = [
 # ══════════════════════════════ K–2 (units 1–3, chapters 1–6) ══════════════════════════════
 dict(n=1, band="k-2", title="Clubs, Secrets and Staying Safe", strand="Clubs", chapters=[
  dict(n=1, title="What Is a Club?", strand="Belonging",
       topics="a club is a group that shares something: a hobby, a job, a team; clubhouses, club names and club rules; welcoming new members kindly; being left out feels bad, so good clubs think about others; grown-ups have clubs too (lodges, teams, choirs).",
       story="Three friends build a blanket-fort clubhouse and must decide who may come in"),
  dict(n=2, title="Safe Secrets and Unsafe Secrets", strand="Staying Safe",
       topics="a surprise is a happy secret that ends soon (a birthday gift); a safe secret hurts no one; an unsafe secret makes you feel worried, scared or hurt; any secret about touching, hurting or danger is told to a trusted grown-up; naming your trusted grown-ups; telling is not tattling when someone could get hurt.",
       story="A boy keeps a birthday surprise for his grandma, then learns which secrets must be told"),
 ]),
 dict(n=2, band="k-2", title="Signs, Symbols and Secret Codes", strand="Codes", chapters=[
  dict(n=3, title="Pictures That Talk", strand="Symbols",
       topics="a symbol is a picture that stands for an idea (a heart, a stop sign, a road sign); old groups used symbols too: a ladder of seven pictures on an ancient floor in Ostia, Italy; a square and compass for builders; badges, pins and flags show which group you belong to; making your own class symbol.",
       story="A girl finds a strange carved picture on an old building downtown and asks what it means"),
  dict(n=4, title="Our Own Secret Code", strand="Codes",
       topics="a code swaps letters for shapes or numbers; the pigpen code: letters in a tic-tac-toe grid and an X; long ago people carved pigpen letters on gravestones; passwords and hand signals; codes need a key; codes are for fun and games, and never for hiding something unsafe.",
       story="Two sisters pass pigpen notes about where the cookies are hidden"),
 ]),
 dict(n=3, band="k-2", title="Builders and Helpers", strand="Lodges", chapters=[
  dict(n=5, title="The Stone Builders", strand="Builders",
       topics="long ago skilled stonemasons built great churches and castles by hand; tools: the square, the level, the plumb line, the mallet; learning a trade as an apprentice; builders met in a hut called a lodge; masons kept their work methods to themselves so only trained builders did the work.",
       story="A young apprentice carves his first stone and signs it with his own mason's mark"),
  dict(n=6, title="Lodges That Help", strand="Helpers",
       topics="later, many clubs called lodges formed to help members and neighbors: paying for doctors and funerals, helping widows and orphans, running children's hospitals (Shriners); Chicago once had a Masonic Temple building (1892) that was among the tallest in the world; people helping people; kind groups welcome questions.",
       story="A family in a Chicago neighborhood long ago gets help from the lodge when the father is sick"),
 ]),

 # ══════════════════════════════ 3–5 (units 4–7, chapters 7–14) ══════════════════════════════
 dict(n=4, band="3-5", title="Mystery Rites of the Ancient World", strand="Ancient", chapters=[
  dict(n=7, title="The Mysteries of Eleusis", strand="Greece",
       topics="the Eleusinian Mysteries near Athens, kept for more than a thousand years; Demeter and Persephone; the long walk from Athens to Eleusis; initiates promised silence, and the secret mostly held; what writers in ancient times did and did not say; why people wanted to join (hope, belonging); the rites ended in the late 300s CE.",
       story="A young Athenian walks the Sacred Way to Eleusis with thousands of others"),
  dict(n=8, title="Mithras and Pythagoras", strand="Rome and Greece",
       topics="Mithras worshippers met in small cave-like rooms (mithraea) across the Roman Empire, including under the church of San Clemente in Rome and at Ostia; seven grades shown on the Felicissimus floor mosaic at Ostia; Roman soldiers and traders; the London Mithraeum found in 1954; Pythagoras's brotherhood in southern Italy: rules, silence, numbers; what we know vs. stories told later.",
       story="Workers digging in London in 1954 lift out a carved stone head"),
 ]),
 dict(n=5, band="3-5", title="The Knights Templar", strand="Knights", chapters=[
  dict(n=9, title="Monks Who Were Knights", strand="Rise",
       topics="the Templars began about 1119–1120 to guard pilgrims going to Jerusalem; they lived by a rule like monks and fought as knights; red cross, white mantle; gifts of land made them rich; they kept money safe for travelers (an early kind of banking); castles and houses across Europe.",
       story="A pilgrim hands his money to a Templar house in France and gets a written receipt to take on his journey"),
  dict(n=10, title="Arrested on a Friday", strand="Fall",
       topics="on 13 October 1307 King Philip IV of France had the Templars arrested; forced confessions; the trials; the Chinon Parchment (1308), found in the Vatican archives by Barbara Frale in 2001; Pope Clement V ended the order in 1312; Jacques de Molay burned in Paris in 1314; legends of hidden treasure and secret survival, and what the evidence shows.",
       story="A historian in the Vatican archives opens a parchment that was misfiled for centuries"),
 ]),
 dict(n=6, band="3-5", title="Lodges and Orders in America", strand="America", chapters=[
  dict(n=11, title="Prince Hall and African Lodge", strand="Prince Hall",
       topics="Prince Hall, a free Black man in Boston; he and fourteen other free Black men were made Masons in Boston in 1775 (a 2026 paper by Oscar Alleyne argues 1778); African Lodge No. 459 received a charter from England (dated 1784, arrived 1787); Prince Hall's petitions against slavery and for schools; Prince Hall Masonry today; the Prince Hall archive at the Chicago Public Library's Woodson Regional Library.",
       story="Prince Hall signs a petition asking Massachusetts lawmakers to end slavery"),
  dict(n=12, title="Joiners: Odd Fellows, Eastern Star and Knights of Columbus", strand="A Nation of Joiners",
       topics="in the 1800s and early 1900s millions of Americans joined orders; mutual aid: sick pay, burial, life insurance before modern insurance was common; Odd Fellows; the Order of the Eastern Star for women and men; the Knights of Columbus (1882), founded by Father Michael McGivney in part to help Catholic families; Woodmen gravestones shaped like tree stumps; Chicago's 1892 Masonic Temple and Medinah Temple.",
       story="A widow in 1890 receives a check from her husband's lodge the week after his funeral"),
 ]),
 dict(n=7, band="3-5", title="Codebreakers", strand="Ciphers", chapters=[
  dict(n=13, title="Codes on Stones and in Books", strand="Ciphers",
       topics="the pigpen cipher and how it works; James Leeson's gravestone at Trinity Church in New York (1794) with a pigpen message; substitution ciphers; keys; how codebreakers count letters (E is the most common in English); making and breaking a code together.",
       story="A visitor in a New York churchyard notices strange shapes on an old gravestone"),
  dict(n=14, title="The Copiale Cipher and the Art of Memory", strand="Codebreakers",
       topics="the Copiale Cipher: a 105-page handwritten book from the 1700s in a mix of symbols and letters, cracked in 2011 by Kevin Knight, Beáta Megyesi and Christiane Schaefer; it turned out to describe the rituals of a secret society (the Oculists); computers and people working together; the Schaw Statutes (1599) asked Scottish masons to be tested on the art of memory; memory-palace practice.",
       story="Three researchers in two countries stare at a book nobody had read for almost 300 years"),
 ]),

 # ══════════════════════════════ 6–8 (units 8–11, chapters 15–22) ══════════════════════════════
 dict(n=8, band="6-8", title="From Stonemasons to Freemasons", strand="Freemasonry", chapters=[
  dict(n=15, title="Guilds, Lodges and the First Grand Lodge", strand="Origins",
       topics="the Regius Poem (c. 1390), the oldest known text of masons' rules; the Schaw Statutes (1598–1599) and the Aitchison's Haven minute (1599), the oldest surviving lodge minute; Elias Ashmole's 1646 diary note; gentlemen join working lodges ('speculative' masonry); the Grand Lodge in London, traditionally dated 1717 (some historians argue 1721); Anderson's Constitutions (1723); degrees, ritual, symbols and charity; the 1738 papal ban and why the Catholic Church objected.",
       story="Elias Ashmole writes one short line in his diary in 1646 that historians still argue over"),
  dict(n=16, title="Freemasons and the American Founding", strand="Founding",
       topics="which founders were Masons (Washington, Franklin, Paul Revere) and which were not (John Adams said he never was; Jefferson is not documented as a member); Washington's own letters on how rarely he attended; the cornerstone of the U.S. Capitol (1793); the eye on the Great Seal: the 1776 committee report, Du Simitière, and why the record does not show a Masonic design; the eye went on the dollar in 1935; testing a popular claim against the paper trail.",
       story="A student holds up a dollar bill and asks who put the eye on the pyramid"),
 ]),
 dict(n=9, band="6-8", title="Orders Around the World", strand="World", chapters=[
  dict(n=17, title="Poro, Sande and Ekpe in West Africa", strand="Africa",
       topics="the Poro (men's) and Sande (women's) societies of Sierra Leone, Liberia and Guinea: teaching young people the skills and duties of adulthood, settling disputes, keeping community life; Sande masks, among the few masks worn by women; Ekpe (Leopard) society of the Cross River region and nsibidi signs; what outsiders should not publish out of respect; museum pieces and who gets to tell their story; keep these separate from the 'human leopard' killings, which were a different thing.",
       story="A girl in Sierra Leone returns to her village after Sande training and is welcomed with song"),
  dict(n=18, title="The Heaven and Earth Society", strand="China",
       topics="the Tiandihui (Heaven and Earth Society) in Qing China from about the 1760s: brotherhood oaths, mutual aid for travelers and migrants, secret poems and hand signs; founding legends vs. the historical record; later Hongmen groups; some branches later turned to crime (triads) and many Chinese American associations (tongs) began as mutual aid; no stereotype — most members of these communities had nothing to do with crime.",
       story="A young migrant far from home flashes a hand sign and finds brothers who give him a meal"),
 ]),
 dict(n=10, band="6-8", title="America Fears the Secret Societies", strand="Fear", chapters=[
  dict(n=19, title="The Disappearance of William Morgan", strand="The Morgan Affair",
       topics="William Morgan of Batavia, New York, planned to publish Masonic rituals; arrested at Batavia on 11 September 1826, taken from outside the Canandaigua jail on the night of 12 September, never seen again; several men convicted of kidnapping, light sentences; public anger; the Anti-Masonic Party and the first national nominating convention (Baltimore, 1831); thousands of lodges closed; what was proven and what never was.",
       story="A carriage pulls away from the Canandaigua jail in the dark, and a man is never seen again"),
  dict(n=20, title="Know-Nothings and Anti-Secret Crusaders", strand="Nativism",
       topics="the Order of the Star Spangled Banner (1850s), called Know-Nothings because members said 'I know nothing'; hostility to Catholic immigrants; Chicago's Lager Beer Riot (1855) under Mayor Levi Boone; Jonathan Blanchard of Wheaton College and the Christian Cynosure (Chicago, from 1868) against all secret orders; the forged 'Knights of Columbus oath' condemned in the Congressional Record (1913) and reprinted anyway; how fear of secret groups was used against real neighbors.",
       story="Chicago saloon keepers march to the courthouse in 1855 and the city erupts"),
 ]),
 dict(n=11, band="6-8", title="The Black Hand and the Chicago Outfit", strand="Crime", chapters=[
  dict(n=21, title="Letters Signed With a Black Hand", strand="Extortion",
       topics="Black Hand extortion letters in New York and Chicago (about 1900–1915): threats against Italian immigrant shopkeepers by criminals who preyed on their own neighbors; most Italian immigrants were victims, not criminals; Lieutenant Joseph Petrosino of the NYPD, killed in Palermo in 1909; the White Hand Society in Chicago formed by Italian Americans to fight back; how a community stood up.",
       story="A Chicago baker finds a letter under his door with a black handprint and a demand for money"),
  dict(n=22, title="Torrio, Capone and the People Who Took Them Down", strand="The Outfit",
       topics="Prohibition (1920–1933) and bootlegging; Johnny Torrio and Al Capone in Chicago; violence and bribery; the St. Valentine's Day Massacre (1929); the Chicago Crime Commission and its 'public enemies' list (1930); Frank J. Wilson and the IRS; Capone's 1931 tax-evasion conviction; Eliot Ness and the Prohibition agents; the real cost to Chicagoans; no glamorizing.",
       story="An IRS agent finds a ledger in a Chicago office that ties Capone to his money"),
 ]),

 # ══════════════════════════════ 9–10 (units 12–14, chapters 23–28) ══════════════════════════════
 dict(n=12, band="9-10", title="The Real Illuminati and the Legend After", strand="Illuminati", chapters=[
  dict(n=23, title="Weishaupt's Order, 1776–1785", strand="The Order",
       topics="Adam Weishaupt, law professor at Ingolstadt, founded the order on 1 May 1776; Enlightenment aims (reason, opposition to clerical control of learning); grades like the Minerval; code names (Weishaupt = Spartacus); Baron Knigge and growth through Masonic lodges; Bavarian edicts of 1784 and 1785 banning secret societies; the 1786–1787 raids and the government's publication of seized papers (Einige Originalschriften, 1787); the order's end; what the papers actually show.",
       story="Bavarian officers search a house in 1786 and carry off the order's letters"),
  dict(n=24, title="Barruel, Robison and the Birth of a Legend", strand="The Legend",
       topics="Rosicrucian manifestos (1614–1616) and the Golden Dawn (1888) as earlier and later esoteric orders; the French Revolution blamed on secret societies: Abbé Barruel (1797) and John Robison, Proofs of a Conspiracy (1797); the 1798 Illuminati scare in the U.S. (Jedidiah Morse); Washington's two 1798 letters to G. W. Snyder; how the legend grew in the 20th century, including 1960s–70s satire (Principia Discordia, Robert Anton Wilson) taken seriously; claims ledger: documented, disputed, unsupported.",
       story="A Boston minister warns his congregation in 1798 that a secret order is plotting against America"),
 ]),
 dict(n=13, band="9-10", title="The Klan and the People Who Fought It", strand="Hate Orders", chapters=[
  dict(n=25, title="Terror in the Reconstruction South", strand="First Klan",
       topics="founded in Pulaski, Tennessee, 1865–1866 by Confederate veterans; night riding, terror against freedpeople, Black voters and officeholders, and white Republicans; testimony of survivors to the Joint Select Committee (1871–1872); the Enforcement Acts and the Ku Klux Klan Act of 1871; federal prosecutions in South Carolina; the order faded, but white-supremacist violence continued (the White League); victims and witnesses at the center.",
       story="A Black farmer from South Carolina travels to testify before Congress about the night riders"),
  dict(n=26, title="The Second Klan and Those Who Exposed It", strand="Second Klan",
       topics="the 1915 revival at Stone Mountain and the film The Birth of a Nation; the 1920s Klan as a mass secret order against Black Americans, Catholics, Jews and immigrants; the New York World exposé (1921) and congressional hearing; Illinois: the Williamson County / Herrin Klan war (1924–1925); Chicago's American Unity League and its paper Tolerance, which printed members' names; D.C. Stephenson's conviction in Indiana (1925) and the Klan's collapse; Ida B. Wells's anti-lynching work from Chicago (A Red Record, 1895); the NAACP; NAACP v. Alabama (1958) on protecting membership lists; Stetson Kennedy's 1940s reporting and the later debate about it.",
       story="A Chicago newspaper prints a list of Klan members' names, and the city reads it over breakfast"),
 ]),
 dict(n=14, band="9-10", title="The Mafia on Trial", strand="Mafia", chapters=[
  dict(n=27, title="From Sicily to America", strand="Origins",
       topics="the Mafia in western Sicily from the 1860s–70s; Leopoldo Franchetti's 1876 inquiry (published 1877); the Sangiorgi report (1898–1900); omertà, the rule of silence; immigration and the first American families; the 1957 Apalachin meeting in New York; the 1950–1951 Kefauver Committee, with hearings in 14 cities including Chicago (some Chicago testimony was taken in closed session) and live television at the New York hearings in March 1951; Joseph Valachi's 1963 testimony to the McClellan committee, which gave the name 'Cosa Nostra'; tongs and triads compared, with the mutual-aid side of tongs.",
       story="Millions of Americans watch a nervous mobster's hands on live television in 1951"),
  dict(n=28, title="Breaking the Silence", strand="The State Fights Back",
       topics="the RICO Act (1970) and why it mattered; the Maxi Trial in Palermo (1986–1987): 475 people charged; on 16 December 1987 the court convicted 346 and gave 19 life sentences (some sources give 338–344; say 'more than 330' if unsure); Italy's highest court upheld the verdict on 30 January 1992; judges Giovanni Falcone and Paolo Borsellino, both killed in 1992; the people of Palermo and the anti-Mafia movement (Addiopizzo); witnesses who broke omertà (Tommaso Buscetta); Chicago's Operation Family Secrets trial (2007); the real cost to ordinary people.",
       story="One night in June 2004, young people in Palermo cover the city with stickers that say a whole people who pays the pizzo is a people without dignity"),
 ]),

 # ══════════════════════════════ 11–12 (units 15–17, chapters 29–34) ══════════════════════════════
 dict(n=15, band="11-12", title="Forgeries and Fakes", strand="Forgeries", chapters=[
  dict(n=29, title="The Protocols: Anatomy of a Forgery", strand="The Protocols",
       topics="the Protocols of the Elders of Zion, first printed in Russia in 1903; Philip Graves in The Times (London), August 1921, showed passages copied from Maurice Joly's 1864 satire Dialogue in Hell between Machiavelli and Montesquieu, which never mentioned Jews; the Bern trial (1934–1935); Henry Ford's Dearborn Independent printed it and Ford apologized in 1927; Nazi Germany used it; it still circulates; how side-by-side comparison proves copying; teach with care and put the harm it caused at the center; never reproduce the text beyond short paired passages that show the copying.",
       story="A Times correspondent in Constantinople is handed an old French book and sees the Protocols inside it"),
  dict(n=30, title="Planted Papers: Dossiers Secrets, MJ-12 and Alternative 3", strand="Testing Documents",
       topics="the Dossiers Secrets planted in the Bibliothèque nationale (1967) and later admitted by its makers (the Priory of Sion hoax); the Majestic-12 papers (surfaced 1984–1987) and the FBI's file, in which Air Force investigators said no such committee was ever formed and an FBI official called the document 'completely bogus'; Anglia TV's Alternative 3 (1977), a spoof later repeated as fact; how historians test a document: provenance, paper and type, anachronisms, who gains; the Chinon Parchment as the genuine counter-example; students test a document themselves.",
       story="A librarian in Paris finds typed pages about a secret priory that no one remembers adding to the shelves"),
 ]),
 dict(n=16, band="11-12", title="Real Government Secrets", strand="Documented Secrets", chapters=[
  dict(n=31, title="MKUltra and the Church Committee", strand="MKUltra",
       topics="the CIA's MKUltra program (1953 onward): drug and behavior experiments, some on people who did not consent; Frank Olson's death (1953); the 1973 order to destroy the files; the Rockefeller Commission and the Church Committee (1975–1976); the 3 August 1977 Senate hearing after surviving financial records were found; what was proven and what was not; how oversight changed.",
       story="A clerk finds boxes of old CIA money records that were supposed to have been destroyed"),
  dict(n=32, title="COINTELPRO and Operation Northwoods", strand="Watching Citizens",
       topics="the FBI's COINTELPRO (1956–1971) against groups across the spectrum, including civil rights leaders; the 1971 Media, Pennsylvania break-in that revealed it; Chicago: the 1969 killing of Fred Hampton and what later lawsuits and records showed; Operation Northwoods (13 March 1962), a Joint Chiefs proposal for staged attacks, rejected by President Kennedy's administration and released in 1997; the lesson: some secrets were real and were exposed by documents, which is also how false claims are tested.",
       story="Eight citizens break into a small FBI office in 1971 and mail the files to newspapers"),
 ]),
 dict(n=17, band="11-12", title="Bill Cooper and the Conspiracy Age, and Capstone", strand="Capstone", chapters=[
  dict(n=33, title="Bill Cooper: A Life and a Ledger", strand="Cooper",
       topics="Milton William Cooper (1943–2001): Air Force and Navy service (what records show vs. what he claimed about intelligence work); his 1988–1989 lectures and the MJ-12 papers; Behold a Pale Horse (1991); his shortwave program The Hour of the Time; his 1998 federal charges of tax evasion and bank fraud and death in a 2001 shootout with Apache County deputies in Eagar, Arizona; his audience and influence. The claims ledger: documented (MKUltra, COINTELPRO, Northwoods, Bohemian Grove and the CFR and Trilateral Commission exist), disputed or unproven (MJ-12, alien treaties, JFK claims, shadow government), shown false (the Protocols he reprinted, Alternative 3). Fair, non-mocking; students weigh each claim; confirm every fact in d9 before writing.",
       story="A trucker on a night drive in the 1990s tunes his shortwave radio to Cooper's voice"),
  dict(n=34, title="Capstone: Test a Claim", strand="Capstone",
       topics="choose one claim about a secret society from the course; find the earliest source; check who made it and why; look for documents, court records and scholars on more than one side; sort the parts into documented, disputed and unsupported; write and present an argument from evidence; disagree respectfully.",
       story="A student sets out to prove a claim she has believed for years, and follows the evidence wherever it goes"),
 ]),
]

# Practice rooms per unit. A Daily Drafts "secrets" book is added in step 7; until it exists,
# the units point to the sister courses that meet the same material.
LINKS = {
 1: [("/social-studies-course", "Social Studies — the course")],
 2: [("/social-studies-course", "Social Studies — the course")],
 3: [("/world-cultures-course", "World Cultures — the course")],
 4: [("/religions-course", "World Religions — the course")],
 5: [("/world-cultures-course", "World Cultures — the course")],
 6: [("/us-history", "U.S. History — the course")],
 7: [("/social-studies-course", "Social Studies — the course")],
 8: [("/us-history", "U.S. History — the course")],
 9: [("/world-cultures-course", "World Cultures — the course")],
 10: [("/us-history", "U.S. History — the course")],
 11: [("/us-history", "U.S. History — the course")],
 12: [("/world-cultures-course", "World Cultures — the course")],
 13: [("/us-history", "U.S. History — the course")],
 14: [("/us-history", "U.S. History — the course")],
 15: [("/world-cultures-course", "World Cultures — the course")],
 16: [("/us-history", "U.S. History — the course")],
 17: [("/social-studies-course", "Social Studies — the course")],
}
