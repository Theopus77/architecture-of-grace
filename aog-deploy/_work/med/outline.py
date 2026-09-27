# Medicine and Health, K–12 — the course arc. Our own wording. Staying well and how
# people have cared for the sick: healthy habits, germs and helpers (K–2); body systems,
# food, first aid, and the medical traditions of the West, China and India (3–5); the
# history of medicine from Egypt, Greece, China, India and the Islamic world to germ
# theory and antibiotics (6–8); how science tests a treatment, the immune system,
# traditional medicine and the evidence, global health (9–10); then health systems,
# ethics, mental health and a capstone (11–12). Traditions are described respectfully
# ("Traditional Chinese Medicine teaches…", "Ayurveda holds…") and the evidence is
# stated plainly. No remedy is ever said to cure a serious disease; no dosing advice.
# By the owner's decision the course does not cover LGBTQ topics; puberty is kept brief
# and non-explicit.
# Topics guide the writers; story = the chapter's opening narrative hook.
#
# Units number 1–17 straight through the course; chapters 1–34. Sister courses:
# Science (sci), FACS (fcs).

BANDS = [
 dict(id="k-2",   title="Grades K–2",   level="k2"),
 dict(id="3-5",   title="Grades 3–5",   level="35"),
 dict(id="6-8",   title="Grades 6–8",   level="68"),
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
]

UNITS = [
 # ══════════════════════════════ K–2 (units 1–3, chapters 1–6) ══════════════════════════════
 dict(n=1, band="k-2", title="My Healthy Body", strand="Healthy Habits", chapters=[
  dict(n=1, title="Germs and Clean Hands", strand="Germs",
       topics="germs are tiny living things too small to see; some make us sick; washing hands with soap for about 20 seconds (sing a song); coughing into your elbow; tissues; brushing teeth twice a day; baths; not sharing cups when sick.",
       story="A boy uses glitter to see how germs spread from hand to hand"),
  dict(n=2, title="Food, Sleep and Play", strand="Energy",
       topics="food gives energy; fruits, vegetables, grains, protein and milk; water is the best drink; sometimes foods; sleep helps you grow (children need about 10–12 hours); moving and playing every day; warming up; resting when tired; each body is different and that's okay.",
       story="A girl who stayed up late finds her soccer game much harder"),
 ]),
 dict(n=2, band="k-2", title="Helpers Who Keep Us Well", strand="Helpers", chapters=[
  dict(n=3, title="A Visit to the Doctor", strand="Checkups",
       topics="doctors, nurses, dentists, pharmacists; a checkup: height, weight, listening to the heart with a stethoscope, looking in ears; shots help your body fight germs; it is okay to feel nervous and to ask questions; taking medicine only from a trusted adult; calling 911 in an emergency.",
       story="A nervous girl squeezes her dad's hand at her checkup, and the nurse lets her listen to her own heart"),
  dict(n=4, title="Feelings and Calm Bodies", strand="Feelings",
       topics="naming feelings: happy, sad, mad, scared, worried; feelings show up in the body; calm breathing (smell the flower, blow out the candle); asking a trusted adult for help; kindness helps everyone feel safe; everyone's brain works in its own way; stretching and quiet time.",
       story="A boy's tummy feels tight before a spelling test, and his teacher shows him balloon breathing"),
 ]),
 dict(n=3, band="k-2", title="Healthy Ways Around the World", strand="World Health", chapters=[
  dict(n=5, title="Old Ways of Staying Well", strand="Traditions",
       topics="people everywhere have cared for health for a very long time; in China, people drink tea and practice tai chi, slow gentle moves, in parks; in India, many people practice yoga and use spices like turmeric in food; Indigenous peoples in the Americas used plants they knew well; grandparents' remedies like soup and rest; doctors today learn from science and ask about home remedies.",
       story="A grandmother in a Chicago park teaches her grandson the slow moves of tai chi"),
  dict(n=6, title="Staying Safe", strand="Safety",
       topics="helmets on bikes and scooters; car seats and seat belts; crossing the street; sunscreen and hats; staying away from medicine and cleaning products (only adults handle them); fire safety — stop, drop and roll; knowing your address; safe adults.",
       story="A family practices their fire escape plan, and the youngest leads the way"),
 ]),

 # ══════════════════════════════ 3–5 (units 4–7, chapters 7–14) ══════════════════════════════
 dict(n=4, band="3-5", title="How the Body Works", strand="The Body", chapters=[
  dict(n=7, title="Body Systems Working Together", strand="Systems",
       topics="the skeleton (206 bones in an adult) and muscles; the heart and blood vessels (circulatory system); lungs (respiratory system); stomach and intestines (digestive system); the brain and nerves (nervous system); how systems work together when you run; the skin as the largest organ.",
       story="A runner's heart, lungs and muscles all speed up in the last lap"),
  dict(n=8, title="Food as Fuel", strand="Nutrition",
       topics="nutrients: carbohydrates, protein, fats, vitamins, minerals, water; MyPlate; reading a simple food label; sugar and teeth; foods from many cultures that are healthy (rice and beans, lentil dal, stir-fried vegetables, fish); breakfast; no food is 'bad' — balance and variety.",
       story="A class compares school lunches from five countries"),
 ]),
 dict(n=5, band="3-5", title="Germs, Vaccines and First Aid", strand="Staying Well", chapters=[
  dict(n=9, title="Germs and How We Fight Them", strand="Germs",
       topics="bacteria and viruses; how germs spread (air, touch, food, water); the immune system's white blood cells; fever as the body fighting; vaccines teach the body to recognize a germ; Edward Jenner and smallpox (1796); smallpox eradicated (1980); antibiotics work on bacteria, not viruses.",
       story="A milkmaid tells a country doctor she will never catch smallpox"),
  dict(n=10, title="First Aid and Emergencies", strand="First Aid",
       topics="small cuts: wash, cover, tell an adult; nosebleeds; burns: cool water; when to call 911 and what to say; Poison Control; allergies and EpiPens (adults and trained helpers use them); staying calm; a first-aid kit; helping a friend get an adult.",
       story="A girl calmly calls 911 when her grandfather falls"),
 ]),
 dict(n=6, band="3-5", title="Medicine East and West", strand="Traditions", chapters=[
  dict(n=11, title="Doctors of the West", strand="Western Medicine",
       topics="Hippocrates of ancient Greece (about 2,400 years ago) and the idea that illness has natural causes; the Hippocratic Oath; Florence Nightingale and clean hospitals (Crimean War, 1850s); Louis Pasteur and germs; Clara Barton and the American Red Cross (1881); hospitals, labs and medicines today; science tests what works.",
       story="Florence Nightingale walks the dark hospital ward with a lamp, counting what makes soldiers sick"),
  dict(n=12, title="Traditional Chinese Medicine and Ayurveda", strand="Eastern Traditions",
       topics="Traditional Chinese Medicine (TCM) teaches about qi (life energy) and balance of yin and yang — described as its teaching; acupuncture with thin needles; herbs; tai chi and qigong; Ayurveda from India teaches about three doshas and balance; yoga, diet and spices; these systems are thousands of years old and used by millions; scientists study them — some practices help some people (tai chi for balance, yoga for stretching and calm), and people should always tell their doctor what they use.",
       story="A boy watches his grandmother's acupuncturist and then his pediatrician, and asks how they are alike"),
 ]),
 dict(n=7, band="3-5", title="Mind and Body", strand="Whole Health", chapters=[
  dict(n=13, title="Mental Health Is Health", strand="Mental Health",
       topics="the brain and feelings; stress and what helps (breathing, moving, talking, sleep); worry and sadness are common and help is available; school counselors, psychologists and doctors; different minds learn and feel in their own ways; kindness and including others; screens and sleep.",
       story="A girl tells the school counselor about a worry she has carried for weeks, and it gets lighter"),
  dict(n=14, title="Growing and Changing", strand="Growing Up",
       topics="growth spurts; needing more sleep and food; teeth: baby teeth and adult teeth; eyes and glasses; hearing; getting stronger with exercise; bodies grow at different times and that is normal; asking a parent, nurse or doctor about changes (kept brief and non-explicit).",
       story="Two friends measure themselves on the same door frame every year"),
 ]),

 # ══════════════════════════════ 6–8 (units 8–11, chapters 15–22) ══════════════════════════════
 dict(n=8, band="6-8", title="Ancient Medicine", strand="Ancient World", chapters=[
  dict(n=15, title="Egypt, Greece and Rome", strand="Mediterranean",
       topics="Egyptian medical papyri (Edwin Smith, about 1600 BCE, on wounds; Ebers papyrus); Hippocrates and the four humors (blood, phlegm, yellow bile, black bile) — the theory and why it was later abandoned; Galen of Pergamon (2nd century CE) and his long influence; Roman aqueducts, baths and public health; Asclepius temples described as history.",
       story="An Egyptian scribe copies instructions for setting a broken jaw onto papyrus"),
  dict(n=16, title="China and India", strand="Asia",
       topics="the Huangdi Neijing (Yellow Emperor's Inner Classic, compiled about 2,000+ years ago): qi, yin-yang, the five phases, meridians — as TCM teaches them; pulse diagnosis; acupuncture and herbal formulas; Ayurveda's Charaka Samhita (medicine) and Sushruta Samhita (surgery, including early nose reconstruction and cataract surgery); the three doshas (vata, pitta, kapha) as Ayurveda teaches them; how these traditions continue today.",
       story="An Ayurvedic surgeon in ancient India practices cuts on a melon before touching a patient"),
 ]),
 dict(n=9, band="6-8", title="From the Islamic Golden Age to the Renaissance", strand="Medieval to Modern", chapters=[
  dict(n=17, title="Hospitals and the Canon", strand="Islamic World",
       topics="Baghdad, Cairo and Damascus hospitals (bimaristans) that treated all; al-Razi (Rhazes) distinguishing smallpox from measles; Ibn Sina (Avicenna), The Canon of Medicine (about 1025), used in Europe for several hundred years; Ibn al-Nafis and the pulmonary circulation (13th century); Unani medicine today; translation into Latin; medieval European monasteries and the Black Death.",
       story="A doctor in Baghdad writes careful notes on two rashes that everyone else calls the same"),
  dict(n=18, title="Looking Inside the Body", strand="Renaissance",
       topics="Andreas Vesalius, On the Fabric of the Human Body (1543), correcting Galen; William Harvey and the circulation of the blood (1628); Ambroise Paré and wound care; the microscope: Antonie van Leeuwenhoek sees 'animalcules' (1670s); observation and experiment replace authority.",
       story="Vesalius notices that Galen's human jawbone looks like a dog's"),
 ]),
 dict(n=10, band="6-8", title="The Germ Revolution", strand="Modern Medicine", chapters=[
  dict(n=19, title="Vaccines, Germs and Clean Surgery", strand="Germ Theory",
       topics="Jenner's smallpox vaccine (1796); Ignaz Semmelweis and handwashing (1847); John Snow and the Broad Street pump (1854) — the start of epidemiology; Louis Pasteur (pasteurization, rabies vaccine 1885); Robert Koch (tuberculosis 1882, cholera); Joseph Lister and antiseptic surgery (1867); anesthesia (ether demonstrated 1846).",
       story="John Snow removes a pump handle in London, and the cholera cases fall"),
  dict(n=20, title="Antibiotics and the 1900s", strand="20th Century",
       topics="Alexander Fleming and penicillin (1928); mass production in World War II; insulin (Banting and Best, 1921–22); X-rays (Röntgen, 1895); the polio vaccine (Jonas Salk, 1955); DNA's structure (1953); antibiotic resistance; how life expectancy rose; public health: clean water, sewers, food safety.",
       story="Fleming comes back from vacation to a moldy dish and notices what is not growing around the mold"),
 ]),
 dict(n=11, band="6-8", title="Your Body's Defenses and Choices", strand="Health Science", chapters=[
  dict(n=21, title="The Immune System", strand="Immunity",
       topics="skin and mucus as barriers; innate immunity and inflammation; white blood cells, antibodies and memory cells; how vaccines create memory; herd immunity; allergies as the immune system overreacting; autoimmune conditions named simply; how scientists know this.",
       story="A scraped knee turns red and warm, and a student learns what is happening inside"),
  dict(n=22, title="Healthy Choices and Hard Things", strand="Choices",
       topics="nutrition for growing teens; sleep (8–10 hours); exercise; vaping, alcohol and drugs and the developing brain (facts, not fear); peer pressure and refusal skills; stress and anxiety; asking for help (988 Suicide and Crisis Lifeline); puberty mentioned briefly and non-explicitly with 'ask a trusted adult or nurse'.",
       story="A student is handed a vape at a party and remembers the facts from health class"),
 ]),

 # ══════════════════════════════ 9–10 (units 12–14, chapters 23–28) ══════════════════════════════
 dict(n=12, band="9-10", title="How Medicine Knows", strand="Evidence", chapters=[
  dict(n=23, title="Testing a Treatment", strand="Research Methods",
       topics="James Lind's scurvy trial (1747); the randomized controlled trial; control groups, blinding and placebo; the placebo effect; sample size; peer review; phases of drug trials and the FDA; correlation vs. causation; the hierarchy of evidence; systematic reviews (Cochrane); how to read a health headline.",
       story="A ship's surgeon in 1747 splits twelve sick sailors into six pairs and gives each pair something different"),
  dict(n=24, title="Epidemiology and Public Health", strand="Populations",
       topics="incidence and prevalence; outbreaks, epidemics and pandemics (1918 influenza, HIV/AIDS, COVID-19 described factually); contact tracing; the Framingham Heart Study (from 1948) and risk factors; smoking and lung cancer (Doll and Hill, 1950s); the CDC and WHO; vaccines and eradication of smallpox; social determinants of health.",
       story="Researchers in Framingham, Massachusetts, start checking the hearts of a whole town in 1948"),
 ]),
 dict(n=13, band="9-10", title="Traditional Medicine and the Evidence", strand="Integrative Medicine", chapters=[
  dict(n=25, title="Traditional Chinese Medicine Today", strand="TCM",
       topics="TCM's concepts (qi, meridians, yin-yang, the five phases) described as its framework; practice in China's hospitals alongside Western medicine; acupuncture: evidence suggests it may help some people with some chronic pain and nausea, while sham-controlled trials often show similar effects; tai chi for balance and fall prevention in older adults; artemisinin from sweet wormwood (Tu Youyou, Nobel Prize 2015) as a drug discovered through traditional texts; risks: herb-drug interactions, contamination, endangered-animal products; respectful, evidence-based discussion.",
       story="Tu Youyou reads a 1,600-year-old recipe for fever and changes how she extracts a plant"),
  dict(n=26, title="Ayurveda, Unani and Other Traditions", strand="World Traditions",
       topics="Ayurveda's doshas, diet and daily routine as it teaches them; recognized by India's Ministry of AYUSH; yoga and meditation: good evidence for some uses (low back pain, stress) ; turmeric and curcumin research (promising in the lab, limited proof in people); heavy-metal contamination in some imported products; Unani medicine; Kampo in Japan; Indigenous and curandero traditions in the Americas; integrative medicine clinics; always telling your doctor about herbs and supplements.",
       story="A cardiologist in Chicago asks a new patient about the herbs her mother sends from India"),
 ]),
 dict(n=14, band="9-10", title="Global Health", strand="Global Health", chapters=[
  dict(n=27, title="Diseases That Shape the World", strand="Infectious Disease",
       topics="malaria (mosquitoes, bed nets, artemisinin, the first vaccines); tuberculosis; HIV and antiretroviral therapy; cholera and clean water; measles and vaccination; neglected tropical diseases; the Global Fund, Gavi and the WHO; polio nearly eradicated; how poverty and geography shape disease.",
       story="A health worker in Kenya hangs a bed net over a baby's crib"),
  dict(n=28, title="Chronic Disease and Lifestyle", strand="Chronic Disease",
       topics="heart disease, stroke, cancer and diabetes as leading causes of death worldwide; risk factors: smoking, diet, activity, blood pressure; the Okinawan and Mediterranean diets as studied; food environments; screening; prevention vs. treatment; how culture shapes eating and activity.",
       story="Researchers visit the Japanese island of Okinawa to learn why many people there live so long"),
 ]),

 # ══════════════════════════════ 11–12 (units 15–17, chapters 29–34) ══════════════════════════════
 dict(n=15, band="11-12", title="Health Systems Around the World", strand="Systems", chapters=[
  dict(n=29, title="Who Pays for Care?", strand="Health Systems",
       topics="four common models: Beveridge (UK's NHS, 1948), Bismarck (Germany, Japan), national health insurance (Canada, Taiwan), and out-of-pocket; the mixed U.S. system (employer insurance, Medicare and Medicaid from 1965, the ACA 2010) described neutrally; costs, wait times, coverage and outcomes compared; what supporters and critics of each say; India's and China's systems.",
       story="Four patients with the same broken arm in London, Berlin, Toronto and Chicago each get a bill, or don't"),
  dict(n=30, title="Medicine Across Cultures", strand="Culture and Care",
       topics="culturally responsive care; interpreters; how beliefs shape care (family decision-making in many Asian and Latin American cultures); integrating traditional healers (WHO Traditional Medicine Strategy); trust and mistrust; health disparities; the Hmong family story told in 'The Spirit Catches You and You Fall Down' (Anne Fadiman, 1997) summarized; listening as a medical skill.",
       story="A doctor learns that the most important person in the exam room is the grandmother who has not spoken yet"),
 ]),
 dict(n=16, band="11-12", title="Ethics and the Mind", strand="Ethics", chapters=[
  dict(n=31, title="Medical Ethics", strand="Bioethics",
       topics="the four principles: autonomy, beneficence, non-maleficence, justice; informed consent; the Nuremberg Code (1947); the Tuskegee syphilis study (1932–72) and its legacy; Henrietta Lacks and HeLa cells; the Belmont Report (1979); organ donation; allocating scarce resources; genetic testing and privacy.",
       story="In 1951 cells are taken from Henrietta Lacks without her knowledge, and they never stop growing"),
  dict(n=32, title="Mental Health and the Brain", strand="Mental Health",
       topics="the history of mental health care (asylums, reform, Dorothea Dix); depression, anxiety and how they are treated (therapy such as CBT, medication, lifestyle); stigma and how it is changing; neurodiversity as a respectful way of describing different minds; addiction as a brain condition that can be treated; mindfulness from Buddhist roots and its studied uses; 988 and school supports; mental health in different cultures.",
       story="A student reads Dorothea Dix's report on jails in 1840s Massachusetts and compares it to a clinic today"),
 ]),
 dict(n=17, band="11-12", title="The Future of Medicine, and Capstone", strand="Capstone", chapters=[
  dict(n=33, title="New Frontiers", strand="Frontiers",
       topics="mRNA vaccines; CRISPR gene editing and its ethics; personalized medicine; AI in diagnosis; telehealth; antibiotic resistance; aging populations; careers in health (nurse, doctor, pharmacist, therapist, EMT, researcher, public-health worker, acupuncturist and others licensed by states); what each path needs.",
       story="A girl with sickle cell disease becomes one of the first people treated with an edited gene"),
  dict(n=34, title="Capstone: A Health Question and the Evidence", strand="Capstone",
       topics="choose a question (e.g., Does tai chi prevent falls? How did one country cut childhood deaths? Should a treatment be covered?); find reliable sources (systematic reviews, WHO, CDC, NIH, peer-reviewed studies); weigh evidence from Western and traditional perspectives fairly; state what is known, what is not, and what you conclude; present it respectfully.",
       story="A student sets out to prove her grandmother's remedy works, and designs a fair test instead"),
 ]),
]

# Practice rooms per unit: the Daily Drafts "health" spiral at the matching grade, plus the
# Science and FACS courses that meet the same material.
def _dd(grade, label):
    return [("/drops/health/%s" % grade, "Daily Drafts — Medicine and Health, grades %s" % label)]
LINKS = {
 1: _dd("K", "K–2") + [("/science-course", "Science — the course")],
 2: _dd("1", "K–2") + [("/science-course", "Science — the course")],
 3: _dd("2", "K–2") + [("/facs-course", "FACS — the course")],
 4: _dd("3", "3–5") + [("/science-course", "Science — the course")],
 5: _dd("4", "3–5") + [("/science-course", "Science — the course")],
 6: _dd("4", "3–5") + [("/religions-course", "World Religions — the course")],
 7: _dd("5", "3–5") + [("/facs-course", "FACS — the course")],
 8: _dd("6", "6–8") + [("/science-course", "Science — the course")],
 9: _dd("7", "6–8") + [("/science-course", "Science — the course")],
 10: _dd("7", "6–8") + [("/science-course", "Science — the course")],
 11: _dd("8", "6–8") + [("/facs-course", "FACS — the course")],
 12: _dd("9-10", "9–10") + [("/science-course", "Science — the course")],
 13: _dd("9-10", "9–10") + [("/science-course", "Science — the course")],
 14: _dd("9-10", "9–10") + [("/science-course", "Science — the course")],
 15: _dd("11-12", "11–12") + [("/economics-course", "Economics — the course")],
 16: _dd("11-12", "11–12") + [("/science-course", "Science — the course")],
 17: _dd("11-12", "11–12") + [("/science-course", "Science — the course")],
}
