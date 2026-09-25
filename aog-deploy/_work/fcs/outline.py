# Family & Consumer Sciences, K–12 — the course arc. Our own wording, following
# the National Standards for Family and Consumer Sciences Education and the
# Illinois FCS course sequence (food and nutrition, textiles, consumer skills,
# child development, independent living), band by band. Topics guide the
# writers; story = the chapter's opening narrative hook.
#
# Units number 1–20 straight through the course; chapters 1–40. Each unit
# grows out of one existing room on facs-hub.html (LINKS below).

BANDS = [
 dict(id="k-2",   title="Grades K–2",   level="k2"),
 dict(id="3-5",   title="Grades 3–5",   level="35"),
 dict(id="6-8",   title="Grades 6–8",   level="68"),
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
]

UNITS = [
 # ══════════════════════════════ K–2 ══════════════════════════════
 dict(n=1, band="k-2", title="Clean Hands", strand="Health and Safety", chapters=[
  dict(n=1, title="Germs You Cannot See", strand="Hygiene",
       topics="germs are too small to see; how germs travel (hands, coughs, food); when to wash — before eating, after the bathroom, after playing outside, after sneezing, after touching pets; soap lifts germs and water carries them away; covering a cough with your elbow.",
       story="A glitter experiment shows where hands have been"),
  dict(n=2, title="Twenty Seconds, Five Steps", strand="Handwashing",
       topics="wet, lather, scrub, rinse, dry; twenty seconds is two rounds of a short song; backs of hands, between fingers, under nails; drying with a clean towel; hand sanitizer when there is no sink and why soap is better; brushing teeth twice a day.",
       story="The class learns to time twenty seconds without a clock"),
 ]),
 dict(n=2, band="k-2", title="Hot, Cold and Sharp", strand="Kitchen Safety", chapters=[
  dict(n=3, title="Hot Has No Color", strand="Heat Safety",
       topics="hot things can look cool (a stove burner, a pan handle, a mug); ask a grown-up before you touch; oven mitts and pot holders; steam is hot; keep pot handles turned in; cold things can hurt too (ice, freezer); what to do for a small burn — cool running water, tell a grown-up.",
       story="A cup of cocoa that looked cool and was not"),
  dict(n=4, title="Sharp Things Travel Point-Down", strand="Sharp Safety",
       topics="knives, scissors and forks are tools, not toys; carry scissors closed and pointed down; hand a tool handle-first; never catch a falling knife; kid-safe cutting with a butter knife and a cutting board; cleaning up broken glass is a grown-up job; matches and lighters are off-limits.",
       story="Passing the scissors at the craft table"),
 ]),
 dict(n=3, band="k-2", title="Everyday Food and Sometimes Food", strand="Nutrition", chapters=[
  dict(n=5, title="The Parts of a Plate", strand="Food Groups",
       topics="fruits, vegetables, grains, protein foods and dairy; half the plate fruits and vegetables; eat a rainbow of colors; water is the everyday drink; trying a new food takes many tries; where food comes from — farms, gardens, stores.",
       story="Building a lunch plate with colored paper foods"),
  dict(n=6, title="Everyday and Sometimes", strand="Choices",
       topics="no food is bad; everyday foods you eat most days, sometimes foods you have now and then; sweets and salty snacks are sometimes foods; how you feel after a good breakfast; listening to your body — hungry and full; sharing food fairly and saying no thank you politely.",
       story="A birthday party with cake and a bowl of grapes"),
 ]),
 dict(n=4, band="k-2", title="A Job Done to the End", strand="Responsibility", chapters=[
  dict(n=7, title="Get It Out, Do It, Put It Back", strand="Chores",
       topics="three parts of every job; the third part is the one people forget; a place for everything (bins, hooks, shelves); putting toys, clothes and dishes away; making a bed; a helper chart at home and at school; asking how you can help.",
       story="The block corner nobody wanted to clean up"),
  dict(n=8, title="Taking Care of Things", strand="Care",
       topics="taking care of clothes (hanging, folding, laundry basket); taking care of a pet's food and water; watering a plant; wiping a spill right away; taking care of books and borrowed things; saying thank you; what it means to be someone people can count on.",
       story="A class plant that everyone forgot to water"),
 ]),

 # ══════════════════════════════ 3–5 ══════════════════════════════
 dict(n=5, band="3-5", title="Measure It Right", strand="Food Preparation", chapters=[
  dict(n=9, title="Cups, Spoons and Levels", strand="Measuring",
       topics="a cup measures space, not weight; dry measuring cups and the liquid measuring cup, and why each is shaped as it is; spooning flour in and leveling it; brown sugar packed; measuring spoons — teaspoon and tablespoon; reading a liquid cup at eye level; 3 teaspoons in a tablespoon, 16 tablespoons in a cup.",
       story="Two batches of cookies from the same recipe that came out different"),
  dict(n=10, title="Reading a Recipe", strand="Recipes",
       topics="the parts of a recipe — title, yield, ingredients, steps, time; reading it all the way through first; abbreviations (tsp, Tbsp, c, oz); doubling a recipe and halving it; the order of steps matters; timing and setting a timer; a simple no-bake recipe walked through.",
       story="Making trail mix for a field trip, times four"),
 ]),
 dict(n=6, band="3-5", title="The Needle and the Button", strand="Textiles", chapters=[
  dict(n=11, title="Thread, Needle and Knot", strand="Sewing Basics",
       topics="the sewing kit — needle, thread, pins, scissors, thimble, pincushion; threading a needle and tying a knot; the running stitch; the back stitch for a seam that must hold; choosing thread by color and strength; safety with needles and pins; finishing with a knot.",
       story="A torn stuffed animal and the stitch that fixed it"),
  dict(n=12, title="Sew a Button, Mend a Seam", strand="Repairs",
       topics="two-hole and four-hole buttons; the thread shank; sewing a button on so it stays; mending a split seam from the inside; a simple felt project (a bookmark or a pouch); why fixing beats throwing away — cost and waste; caring for clothes so they last.",
       story="The coat with the missing button on the coldest day"),
 ]),
 dict(n=7, band="3-5", title="Money and Choices", strand="Consumer Skills", chapters=[
  dict(n=13, title="Price Per Unit", strand="Smart Shopping",
       topics="a price is half an answer; unit price — price divided by amount; the small unit-price label on the shelf; comparing sizes and brands; sales and coupons; is bigger always cheaper?; needs and wants; a shopping list and sticking to it.",
       story="Two boxes of cereal and which one is really the better deal"),
  dict(n=14, title="Earn, Save, Spend, Share", strand="Money Basics",
       topics="ways kids earn money; saving for a goal — a jar with a picture on it; spend, save and share; a simple budget from an allowance; what a bank does; interest as money paid for saving (a labeled example); giving to others; the difference between a want now and a goal later.",
       story="Saving for a bike, one lawn at a time"),
 ]),
 dict(n=8, band="3-5", title="Plan It, Cook It, Clean It Up", strand="Food Preparation", chapters=[
  dict(n=15, title="Before the Cooking", strand="Planning",
       topics="most of cooking happens before and after; check the cupboard before writing the list; working backwards from dinner time; mise en place — everything in its place; a simple meal plan for a day; kitchen safety review (hot, sharp, clean hands); washing produce.",
       story="A surprise dinner for Mom, planned on the school bus"),
  dict(n=16, title="Start What Waits, Clear As You Go", strand="Cooking and Cleanup",
       topics="starting the thing that takes longest first; using a timer; a simple cooked dish walked through (quesadilla, pasta, scrambled eggs, with a grown-up); clearing as you go; washing dishes in order — glasses, plates, pots; wiping the counter; putting leftovers in the fridge within two hours.",
       story="Dinner on the table by six, and the kitchen clean by seven"),
 ]),

 # ══════════════════════════════ 6–8 ══════════════════════════════
 dict(n=9, band="6-8", title="Kitchen Safety and Sanitation", strand="Food Safety", chapters=[
  dict(n=17, title="Clean, Separate, Cook, Chill", strand="Food Safety",
       topics="the four steps; bacteria and the danger zone (40–140 °F); the two-hour rule; cross-contamination and separate cutting boards; hand washing and clean surfaces; safe minimum internal temperatures (poultry 165 °F, ground beef 160 °F, whole cuts of beef and pork 145 °F with rest, fish 145 °F, leftovers 165 °F) with a food thermometer; thawing safely.",
       story="The picnic potato salad that sat in the sun"),
  dict(n=18, title="Preventing Kitchen Accidents", strand="Kitchen Safety",
       topics="burns, cuts, falls, fires and electric shock; a grease fire — lid, baking soda, never water; a fire extinguisher (PASS); oven and range safety; small-appliance and cord safety; first aid basics for a cut and a burn; when to call 911; food allergies and reading labels for the big allergens.",
       story="A pan catches fire in the middle of a cooking lab"),
 ]),
 dict(n=10, band="6-8", title="Knife Skills", strand="Food Preparation", chapters=[
  dict(n=19, title="The Knife and the Grip", strand="Knife Basics",
       topics="parts of a chef's knife — tip, edge, heel, spine, bolster, handle; the pinch grip; the claw hand; the rocking cut; a sharp knife is safer than a dull one; the cutting board with a damp towel under it; carrying and passing a knife; washing and storing knives.",
       story="A first day on the cutting board with a real chef's knife"),
  dict(n=20, title="The Classic Cuts", strand="Cutting Techniques",
       topics="slice, dice (small, medium, large), mince, julienne, chiffonade, rough chop; why even pieces cook evenly; dicing an onion step by step; mincing garlic; chiffonade of basil; a knife-cuts practical and how it is graded.",
       story="Salsa night: one recipe, four different cuts"),
 ]),
 dict(n=11, band="6-8", title="Measuring and Reading a Recipe", strand="Food Preparation", chapters=[
  dict(n=21, title="Tools and Equivalents", strand="Measuring",
       topics="dry cups against the liquid cup; spoon and level; the equivalents chart (3 tsp = 1 Tbsp, 4 Tbsp = ¼ c, 16 Tbsp = 1 c, 2 c = 1 pt, 4 c = 1 qt, 16 oz = 1 lb); weight against volume and a kitchen scale; measuring fats and sticky ingredients; common measuring mistakes.",
       story="A brownie recipe written in tablespoons only"),
  dict(n=22, title="Scaling and Mise en Place", strand="Recipes",
       topics="parts of a recipe; scaling a recipe up and down with a factor; converting units when scaling; recipe terms (fold, cream, sauté, simmer, whisk); mise en place; a time plan for a lab; substitutions when an ingredient is missing.",
       story="Feeding forty at the family reunion from a recipe for eight"),
 ]),
 dict(n=12, band="6-8", title="Hand Sewing", strand="Textiles", chapters=[
  dict(n=23, title="The Kit and Seven Stitches", strand="Hand Stitches",
       topics="the hand-sewing kit; needle sizes; threading and knotting; running, basting, back, whip, slip, blanket and overcast stitches — what each is for; stitch length and tension; pressing as you go; safety with pins and needles.",
       story="Seven stitches on one practice square"),
  dict(n=24, title="Buttons, Hems and Mending", strand="Repairs and Projects",
       topics="sewing a button with a shank; a hook and eye and a snap; hemming with a slip stitch; mending a split seam and patching a hole; a small project from a pattern (pouch, pillow, tote); measuring and marking; the cost of mending versus replacing; textile waste.",
       story="A thrift-store find that only needed a hem"),
 ]),

 # ══════════════════════════════ 9–10 ══════════════════════════════
 dict(n=13, band="9-10", title="The Sewing Machine", strand="Textiles", chapters=[
  dict(n=25, title="Every Part Named", strand="Machine Basics",
       topics="the parts of a sewing machine; the top thread path in order; winding and inserting a bobbin; how a lockstitch forms; stitch length and width; tension and what the loops underneath mean; needle types and sizes; machine safety and maintenance.",
       story="A machine that jams until the thread path is right"),
  dict(n=26, title="Seams, Corners and a First Project", strand="Machine Sewing",
       topics="the 5/8-inch seam guide; backstitching to lock a seam; pivoting a corner; seam finishes (zigzag, pinked, serged); pressing seams open; a straight-seam project (pillowcase, drawstring bag); reading the machine manual; troubleshooting skipped stitches and bunching.",
       story="A drawstring bag with one perfect corner"),
 ]),
 dict(n=14, band="9-10", title="Fabric, Fibers and Patterns", strand="Textiles", chapters=[
  dict(n=27, title="Fibers and Fabrics", strand="Textile Science",
       topics="natural fibers (cotton, wool, linen, silk) and manufactured fibers (polyester, nylon, rayon, spandex); woven against knit; weaves (plain, twill, satin); properties — breathability, stretch, warmth, durability; the care label symbols; a burn test described, not performed; sustainability and fast fashion.",
       story="Why the gym shirt dries fast and the jeans do not"),
  dict(n=28, title="Patterns and Layout", strand="Pattern Work",
       topics="reading a pattern envelope — size, yardage, notions; taking body measurements; pattern symbols (grainline, notches, fold line); selvage, grain and bias; laying out on grain; cutting and marking; ease; adjusting a pattern for fit.",
       story="A pattern envelope, decoded"),
 ]),
 dict(n=15, band="9-10", title="Cooking Methods and Heat", strand="Food Preparation", chapters=[
  dict(n=29, title="How Heat Moves", strand="Heat Transfer",
       topics="conduction, convection and radiation in the kitchen; dry heat (roast, bake, sauté, grill, fry) against moist heat (boil, simmer, poach, steam) and combination (braise, stew); why a crowded pan steams instead of browning; the Maillard reaction and caramelization in plain terms; preheating.",
       story="Two trays of roasted vegetables, one crowded and one not"),
  dict(n=30, title="Choosing the Method", strand="Technique",
       topics="matching method to the food — tender cuts to dry heat, tough cuts to moist heat; braising a tough cut step by step; stir-frying; making a pan sauce; oven temperatures and what they do; resting meat; the food thermometer again; cooking grains and legumes.",
       story="A cheap cut of beef made tender by time and a lid"),
 ]),
 dict(n=16, band="9-10", title="Nutrition and Meal Planning", strand="Nutrition", chapters=[
  dict(n=31, title="Six Nutrients and a Label", strand="Nutrition Science",
       topics="carbohydrates, proteins, fats, vitamins, minerals and water; what each does; MyPlate's five groups and portions; reading a Nutrition Facts label line by line — serving size, calories, % Daily Value, sodium, added sugars; ingredient lists; dietary needs — allergies, diabetes, vegetarian diets; hydration.",
       story="Two granola bars that looked the same on the front"),
  dict(n=32, title="A Week of Meals on a Budget", strand="Meal Planning",
       topics="planning a week of meals; balancing the plate across a day; a grocery list by store section; unit price and store brands; cooking once, eating twice; food waste and storage; a sample weekly food budget (labeled example); eating well with little time.",
       story="Feeding a family of four for a week on a set amount (example)"),
 ]),

 # ══════════════════════════════ 11–12 ══════════════════════════════
 dict(n=17, band="11-12", title="Food Science: What Happens When You Cook", strand="Food Science", chapters=[
  dict(n=33, title="Proteins, Starches and Gluten", strand="Food Chemistry",
       topics="why an egg sets — protein denaturation and coagulation; why muffins go tough — gluten development and overmixing; starch gelatinization and thickening a sauce; leavening — baking soda, baking powder, yeast and steam; the Maillard reaction and caramelization; acids and bases in the kitchen.",
       story="The muffins that were stirred too long"),
  dict(n=34, title="Emulsions and the Kitchen Experiment", strand="Food Experiments",
       topics="emulsions — mayonnaise, vinaigrette, and why they break; fats and how they carry flavor; sugar's roles beyond sweetness; how to run a controlled kitchen experiment — one variable, a control, measurements, a data table; writing up results; food preservation basics (canning, freezing, drying) and safety.",
       story="Six batches of cookies, one variable each"),
 ]),
 dict(n=18, band="11-12", title="Child Development and Care", strand="Human Development", chapters=[
  dict(n=35, title="The Four Domains", strand="Child Development",
       topics="physical, cognitive, social and emotional development; milestones as ranges, never deadlines; infancy, toddlerhood, preschool and school age; play as the work of childhood; language development; attachment and trust; when to talk to a doctor; every child develops differently, including children with disabilities.",
       story="Two cousins, born a month apart, walking at different times"),
  dict(n=36, title="Guidance and Safe Care", strand="Child Care",
       topics="guidance instead of punishment — routines, choices, redirection, natural consequences; safe sleep for infants (back to sleep, empty crib); childproofing; car seats by age and size; choking hazards; babysitting basics — emergency numbers, allergies, bedtime; age-appropriate activities; recognizing and reporting abuse.",
       story="A first babysitting job and the list on the fridge"),
 ]),
 dict(n=19, band="11-12", title="Independent Living and Money", strand="Consumer Economics", chapters=[
  dict(n=37, title="Paychecks, Budgets and Credit", strand="Personal Finance",
       topics="gross against net pay — federal and state income tax, Social Security and Medicare (FICA) withholding; a budget built from take-home pay (50/30/20 as one example); needs, wants and savings; an emergency fund; credit — APR, minimum payments, how compound interest works for and against you (labeled examples); credit scores in plain terms; debit against credit.",
       story="A first paycheck that was smaller than expected"),
  dict(n=38, title="Renting, Buying and Not Getting Scammed", strand="Consumer Protection",
       topics="a lease — term, deposit, rent, utilities, what landlords and tenants owe each other; renters insurance; utilities and setting up a household; unit pricing and comparison shopping; warranties and returns; spotting a scam — urgency, secrecy, gift cards, too-good-to-be-true; identity theft and passwords; consumer rights and where to complain.",
       story="An apartment listing that asked for a deposit by gift card"),
 ]),
 dict(n=20, band="11-12", title="Capstone: Plan, Cost, Produce", strand="Capstone", chapters=[
  dict(n=39, title="The Spec and the Cost Sheet", strand="Project Planning",
       topics="choosing a project — a meal for a group or a sewn piece; writing a specification; a cost sheet with every ingredient or material and its unit price (labeled examples); a timeline with checkpoints; a materials and equipment list; a safety plan; a rubric for evaluating the result.",
       story="A senior plans a three-course dinner for twelve"),
  dict(n=40, title="Making, Evaluating and Presenting", strand="Production and Presentation",
       topics="producing the project on schedule; documenting the process with photos and notes; evaluating honestly against the spec — taste, fit, finish, cost, time; what you would change; presenting to an audience; careers in FCS — culinary, dietetics, apparel, early childhood, family services, consumer affairs.",
       story="The dinner is served, and the evaluation begins"),
 ]),
]

# Rooms already on the site that belong to each unit — nothing gets deleted.
LINKS = {
 1: [("/fc13", "Clean hands — the room")],
 2: [("/fc14", "Hot, cold and sharp — the room")],
 3: [("/fc15", "Everyday food and sometimes food — the room")],
 4: [("/fc16", "A job done to the end — the room")],
 5: [("/fc17", "Measure it right — the room")],
 6: [("/fc18", "The needle and the button — the room")],
 7: [("/fc19", "Money and choices — the room")],
 8: [("/fc20", "Plan it, cook it, clean it up — the room")],
 9: [("/fc1", "Kitchen safety and sanitation — the room")],
 10: [("/fc2", "Knife skills — the room")],
 11: [("/fc3", "Measuring and reading a recipe — the room")],
 12: [("/fc4", "Hand sewing — the room")],
 13: [("/fc5", "The sewing machine — the room")],
 14: [("/fc6", "Fabric, fibers and patterns — the room")],
 15: [("/fc7", "Cooking methods and heat — the room")],
 16: [("/fc8", "Nutrition and meal planning — the room")],
 17: [("/fc9", "Food science — the room")],
 18: [("/fc10", "Child development and care — the room")],
 19: [("/fc11", "Independent living and money — the room")],
 20: [("/fc12", "Capstone — plan, cost, produce — the room")],
}
