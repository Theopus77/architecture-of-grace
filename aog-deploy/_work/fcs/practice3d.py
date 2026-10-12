#!/usr/bin/env python3
"""
AOG-FCS-3D-V1 (2026-10-12, at the owner's request) — the FACS course links into the 3D Kitchen
(/kitchen-lab) and the 3D Sewing Room (/sewing-lab), so a lesson can show the person doing the skill.

Jimmy: "Could we not take this amazement to FACS for cooking and sewing lessons? Have this person
cook recipes by preloaded or the viewer plugs it in and demonstration on how to sew etc."

Three pieces, all through what the course builder already renders:
  1. TRY  — a "Watch it in 3D" button (the lesson's "try" link) on existing lessons that teach one skill.
  2. NEW  — one "Watch it in 3D" lesson appended to the end of a chapter (its last section, or a new last
            section when that section is full), so no earlier lesson number changes and saved ticks stay put.
  3. LINKS3D in outline.py's LINKS — the unit page's "Practice rooms" doors.

Every id comes from _work/engine3d/CONTRACT.md (the Addendum). tools/check-facs-3d.js checks them.

Run from this folder:  python3 add_3d.py      (writes the lessons and links into ch*.json, idempotent)
Then:                  python3 assemble.py <n>  for each unit, and the course build.
"""

KITCHEN, SEWING = "/kitchen-lab", "/sewing-lab"

# id → (English, Español) — the words on the buttons
K_SKILLS = {
 "wash-hands": ("Wash hands", "Lavarse las manos"), "tie-hair": ("Tie hair back", "Recogerse el pelo"),
 "measure-dry": ("Measure dry ingredients", "Medir ingredientes secos"), "measure-liquid": ("Measure a liquid", "Medir un líquido"),
 "crack-egg": ("Crack an egg", "Romper un huevo"), "whisk": ("Whisk", "Batir"), "stir": ("Stir", "Revolver"),
 "fold": ("Fold", "Envolver"), "pour": ("Pour", "Verter"), "chop": ("Chop", "Picar"), "slice": ("Slice", "Rebanar"),
 "dice": ("Dice", "Cortar en cubos"), "mince": ("Mince", "Picar fino"), "peel": ("Peel", "Pelar"), "grate": ("Grate", "Rallar"),
 "knead": ("Knead", "Amasar"), "roll-dough": ("Roll dough", "Estirar la masa"), "spread": ("Spread", "Untar"),
 "season": ("Season", "Sazonar"), "flip": ("Flip", "Dar la vuelta"), "saute": ("Sauté", "Saltear"), "boil": ("Boil", "Hervir"),
 "simmer": ("Simmer", "Cocer a fuego lento"), "bake": ("Bake, with oven mitts", "Hornear, con guantes"),
 "check-temp": ("Check the temperature", "Medir la temperatura"), "plate": ("Plate the food", "Servir en el plato"),
 "wipe-clean": ("Wipe the counter", "Limpiar la mesada"), "wash-dishes": ("Wash the dishes", "Lavar los platos"),
}
K_RECIPES = {
 "fruit-salad": ("Fruit salad", "Ensalada de frutas"), "yogurt-parfait": ("Yogurt parfait", "Parfait de yogur"),
 "scrambled-eggs": ("Scrambled eggs", "Huevos revueltos"), "pancakes": ("Pancakes", "Panqueques"),
 "veggie-stir-fry": ("Vegetable stir-fry", "Salteado de verduras"), "tomato-pasta": ("Tomato pasta", "Pasta con tomate"),
 "vinaigrette": ("Vinaigrette", "Vinagreta"), "quick-bread": ("Muffins", "Muffins"), "pizza-dough": ("Pizza dough", "Masa de pizza"),
}
S_MOVES = {
 "thread-needle": ("Thread a needle", "Enhebrar la aguja"), "tie-knot": ("Tie a knot", "Hacer un nudo"),
 "running-stitch": ("Running stitch", "Puntada corrida"), "backstitch": ("Back stitch", "Pespunte"),
 "whipstitch": ("Whip stitch", "Puntada de sobrehilado"), "slip-stitch": ("Slip stitch", "Puntada invisible"),
 "blanket-stitch": ("Blanket stitch", "Punto de festón"), "sew-button": ("Sew on a button", "Coser un botón"),
 "tie-off": ("Tie off", "Rematar"), "pin-pattern": ("Pin the pattern", "Prender el patrón"),
 "cut-fabric": ("Cut the fabric", "Cortar la tela"), "mark-fabric": ("Mark the fabric", "Marcar la tela"),
 "machine-parts": ("Tour the machine", "Recorrido por la máquina"), "wind-bobbin": ("Wind a bobbin", "Llenar la bobina"),
 "thread-machine": ("Thread the machine", "Enhebrar la máquina"), "straight-seam": ("Sew a straight seam", "Coser una costura recta"),
 "backstitch-machine": ("Lock the seam", "Asegurar la costura"), "pivot-corner": ("Pivot a corner", "Girar en una esquina"),
 "seam-allowance": ("The 5/8-inch seam guide", "La guía de 1.5 cm"), "press-seam": ("Press the seam", "Planchar la costura"),
}

def k(skill):  # a kitchen skill
    en, es = K_SKILLS[skill]; return ("%s#skill-%s" % (KITCHEN, skill), en, es)
def r(recipe):  # a preloaded recipe
    en, es = K_RECIPES[recipe]; return ("%s#%s" % (KITCHEN, recipe), en, es)
def s(move):   # a sewing move
    en, es = S_MOVES[move]; return ("%s#%s" % (SEWING, move), en, es)
PLUG = (KITCHEN, "Plug in your own recipe", "Escribe tu propia receta")

def try_of(link):
    href, en, es = link
    if href == KITCHEN:
        return {"href": href, "en": "Open the 3D Kitchen: plug in your own recipe", "es": "Abre la cocina en 3D: escribe tu propia receta"}
    return {"href": href, "en": "Watch it in 3D: %s" % en, "es": "Míralo en 3D: %s" % es}

def door(link):
    """A unit page's "Practice rooms" door (outline LINKS)."""
    href, en, es = link
    room = "3D Sewing Room" if href.startswith(SEWING) else "3D Kitchen"
    return (href, "%s: %s" % (room, en))

# ── 1. "Watch it in 3D" buttons on lessons that already teach the skill: chapter → [(lesson title, link)]
TRY = {
 2: [("Wet and Lather", k("wash-hands"))],
 3: [("Mitts and Pot Holders", k("bake")), ("Handles Turned In", k("boil"))],
 4: [("Butter Knife and Board", k("spread"))],
 5: [("Eat a Rainbow", r("fruit-salad"))],
 8: [("Wipe It Now", k("wipe-clean"))],
 9: [("Spoon In and Level", k("measure-dry")), ("Read It at Eye Level", k("measure-liquid"))],
 10: [("Doubling a Recipe", PLUG)],
 11: [("Through the Eye", s("thread-needle")), ("The Anchor Knot", s("tie-knot")), ("The Running Stitch", s("running-stitch")),
      ("The Back Stitch", s("backstitch")), ("Tie It Off", s("tie-off"))],
 12: [("Sewing the Button On", s("sew-button"))],
 15: [("Hot, Sharp and Clean Hands", k("wash-hands"))],
 16: [("Scrambled Eggs", r("scrambled-eggs")), ("Pasta in a Big Pot", r("tomato-pasta")),
      ("Glasses, Plates, Then Pots", k("wash-dishes")), ("Wipe the Counter and the Stove", k("wipe-clean"))],
 17: [("Hands and Surfaces", k("wash-hands")), ("The Food Thermometer", k("check-temp"))],
 18: [("Oven, Range and Appliances", k("bake"))],
 19: [("The Claw Hand", k("chop"))],
 20: [("Slice and Rough Chop", k("slice")), ("Dice, Three Sizes", k("dice")), ("Mince", k("mince"))],
 21: [("Spoon and Level", k("measure-dry")), ("Reading a Liquid at Eye Level", k("measure-liquid"))],
 22: [("Mixing Words", k("fold")), ("Heat Words", k("saute")), ("Scaling Up and Changing Units", PLUG)],
 23: [("Thread the Needle, Tie the Knot", s("thread-needle")), ("The Running Stitch", s("running-stitch")),
      ("The Whip Stitch", s("whipstitch")), ("The Slip Stitch", s("slip-stitch")), ("The Blanket Stitch", s("blanket-stitch"))],
 24: [("A Button with a Shank", s("sew-button")), ("Hemming with a Slip Stitch", s("slip-stitch")), ("Measure, Mark, Cut, Sew", s("mark-fabric"))],
 25: [("Touring the Machine", s("machine-parts")), ("The Top Thread Path", s("thread-machine")), ("Winding a Bobbin", s("wind-bobbin"))],
 26: [("The 5/8-Inch Guide", s("seam-allowance")), ("Start, Backstitch, End", s("backstitch-machine")),
      ("Pivoting a Corner", s("pivot-corner")), ("Pressing Seams Open", s("press-seam"))],
 28: [("Laying Out the Pieces", s("pin-pattern")), ("Cutting and Marking", s("cut-fabric"))],
 29: [("Roasting and Baking", k("bake")), ("Sautéing and Pan-Frying", k("saute")), ("Boiling, Simmering, Poaching, Steaming", k("simmer"))],
 30: [("Stir-Frying", r("veggie-stir-fry")), ("The Thermometer Decides", k("check-temp"))],
 32: [("Eating Well With Little Time", r("veggie-stir-fry"))],
 33: [("Custards, Scrambles and Gentle Heat", r("scrambled-eggs")), ("The Muffin Method", r("quick-bread")), ("When You Want Gluten", r("pizza-dough"))],
 34: [("A Vinaigrette by Ratio", r("vinaigrette"))],
 39: [("Scaling Recipes to the Head Count", PLUG)],
 40: [("Serving and Finishing", k("plate"))],
}

# ── 2. New "Watch it in 3D" lessons: chapter → list of lessons (appended to the last section),
#       or {"section": title, "lessons": [...]} (a new last section, when the last one already has 4).
def W(w, d): return {"w": w, "d": d}
def Q(q, choices, a, why): return {"q": q, "choices": choices, "a": a, "why": why}

NEW = {
 # ═══ K–2 ═══
 2: [{
  "title": "Watch Clean Hands in 3D",
  "mainIdea": "Watch a cook wash hands. Then copy each step at your sink.",
  "reading": [
   "A cook in the 3D kitchen washes hands. Tap the button to watch. Look at the soap. Look at the backs of the hands.",
   "Watch the fingers scrub between each other. Watch the nails get scrubbed too. Then the water rinses the soap away.",
   "Now try it at a real sink. Sing your song two times. Dry your hands on a clean towel."],
  "words": [W("watch", "look closely to learn how a thing is done")],
  "look": {"type": "think", "title": "What Did the Cook Do?",
           "text": "The cook wet both hands. Then came the soap. The cook scrubbed the backs, the fingers and the nails. Then the cook rinsed and dried.",
           "prompt": "Which step would you show a friend first?"},
  "check": [
   Q("What does the cook scrub after the soap?", ["Only the palms", "The backs, the fingers and the nails", "Nothing at all"], 1,
     "Germs hide on the backs of hands, between fingers and under nails, so the cook scrubs them all."),
   Q("How long does the cook scrub?", ["Twenty seconds, two songs", "One quick second", "Until the water is cold"], 0,
     "Twenty seconds of scrubbing lifts the germs. Two rounds of a short song is about that long."),
   Q("What does the cook use to dry hands?", ["A shirt", "A pants leg", "A clean towel"], 2,
     "A clean towel dries hands without putting germs back on them."),
  ],
  "try": try_of(k("wash-hands")),
 }],
 4: [{
  "title": "Watch the Butter Knife in 3D",
  "mainIdea": "Watch how a cook holds a butter knife and where the other hand goes.",
  "reading": [
   "In the 3D kitchen, a cook spreads jam on bread with a butter knife. The bread sits on a board. The cook holds the handle.",
   "Watch the other hand. It holds the bread at the side. The knife moves away from the fingers. Then the knife lies flat.",
   "Sharp knives and the hot oven are grown-up jobs. You can watch the cook chop and bake in 3D. A grown-up stays by you."],
  "words": [W("butter knife", "a knife with a round, dull edge for spreading")],
  "look": {"type": "think", "title": "Where Do the Hands Go?",
           "text": "A slice of bread is on a board. One hand holds the butter knife by the handle. The other hand holds the bread at the side. The knife spreads away from the fingers.",
           "prompt": "Show with your hands where each one goes."},
  "check": [
   Q("Which part of the knife does the cook hold?", ["The blade", "The handle", "The tip"], 1,
     "The handle is made for your hand. The blade is the part that cuts or spreads."),
   Q("Where does the knife go when the cook is done?", ["Flat on the board", "In a pocket", "Up in the air"], 0,
     "A knife lying flat on the board cannot fall or poke anyone."),
   Q("Who uses the sharp knife and the oven?", ["A friend your age", "A pet", "A grown-up"], 2,
     "Sharp knives and hot ovens are grown-up jobs. You can watch and help in safe ways."),
  ],
  "try": try_of(k("spread")),
 }],
 5: [{
  "title": "Watch a Fruit Salad in 3D",
  "mainIdea": "A cook makes a fruit salad in 3D. Watch it and count the colors.",
  "reading": [
   "In the 3D kitchen, a cook makes a fruit salad. First the cook washes hands. Then the fruit gets a rinse in cool water.",
   "Count the colors that go in the bowl. A grown-up does the cutting. The cook stirs it all gently with a big spoon.",
   "The recipe has allergy notes. Some people cannot eat some foods. Ask before you share food with a friend."],
  "words": [W("rinse", "wash food or hands with clean water")],
  "look": {"type": "think", "title": "A Rainbow Bowl",
           "text": "Picture a big bowl. Red strawberries. Orange melon. Green grapes. Blueberries. A cook stirs them with a big spoon.",
           "prompt": "What colors would you put in your fruit salad?"},
  "check": [
   Q("What does the cook do before touching the fruit?", ["Washes hands", "Eats a grape", "Turns on the oven"], 0,
     "Clean hands keep germs off the food."),
   Q("Why put many colors in a fruit salad?", ["It makes the bowl heavy", "Different colors give your body different good things", "It makes it cold"], 1,
     "Each color of fruit brings different good things for your body. Eating a rainbow helps."),
   Q("What should you do before you share food with a friend?", ["Hide it", "Add more sugar", "Ask about allergies"], 2,
     "Some foods make some people sick. Asking first keeps your friend safe."),
  ],
  "try": try_of(r("fruit-salad")),
 }],
 8: [{
  "title": "Watch the Dishes in 3D",
  "mainIdea": "Watch a cook wash the dishes and wipe the counter, start to finish.",
  "reading": [
   "A job is done when it is put away. In the 3D kitchen, a cook washes dishes after cooking. Glasses go first. Pots go last.",
   "Then the cook wipes the counter with a clean cloth. Crumbs go in the trash. The cloth gets rinsed and hung up.",
   "You can wash plastic cups and dry spoons. A grown-up handles sharp knives and very hot water."],
  "words": [W("counter", "the flat top in a kitchen where food is made")],
  "look": {"type": "think", "title": "The Last Part of the Job",
           "text": "Dinner is over. Dirty plates sit by the sink. Crumbs are on the counter. The cook fills the sink with warm, soapy water.",
           "prompt": "What should the cook wash first? What comes last?"},
  "check": [
   Q("What does the cook wash first?", ["The greasy pot", "The glasses", "The trash can"], 1,
     "Glasses go first while the water is clean. Greasy pots go last."),
   Q("What goes in the trash when the cook wipes the counter?", ["Crumbs", "Clean spoons", "The cloth"], 0,
     "Crumbs go in the trash. The cloth gets rinsed and hung up to use again."),
   Q("Who handles the sharp knives in the dishwater?", ["The youngest child", "The family pet", "A grown-up"], 2,
     "A knife hidden under bubbles can cut a hand. A grown-up washes the sharp knives."),
  ],
  "try": try_of(k("wash-dishes")),
 }],

 # ═══ 3–5 ═══
 10: {"section": "Watch It in 3D", "lessons": [{
  "title": "Watch Pancakes in 3D",
  "mainIdea": "Watching a cook follow a whole recipe shows how measuring, reading and timing work together.",
  "reading": [
   "The 3D kitchen has a pancake recipe ready to play. The cook reads it from the top first. Then the cook washes hands and ties hair back. Tap the button below to watch each step, one at a time.",
   "Notice three things. The cook scoops the flour and levels it with a straight edge. The milk goes in a liquid cup, and the cook bends down to read it at eye level. The dry and wet parts are stirred only until they come together.",
   "A grown-up stays at the stove the whole time. The pan handle is turned in, away from the edge. The recipe names its allergens, such as egg, milk and wheat, so check them before you cook for someone."],
  "words": [W("level", "flat across the top of the cup, with the extra pushed off"),
            W("allergen", "a food that can make some people's bodies react and get sick")],
  "look": {"type": "think", "title": "Pause and Predict",
           "text": "The cook has flour in a dry cup, heaped over the top. A straight edge lies on the counter. The milk waits in a clear liquid cup on the counter.",
           "prompt": "Before you press play, say what the cook will do next with the flour and with the milk."},
  "check": [
   Q("How does the cook make the cup of flour exact?", ["Shakes the cup", "Presses the flour down hard", "Levels it with a straight edge", "Adds a little extra on top"], 2,
     "Leveling with a straight edge pushes off the extra, so the cup holds exactly one cup."),
   Q("Where should your eyes be when you read a liquid cup?", ["Level with the line on the cup", "Looking down from above", "Looking up from the floor", "Closed while you pour"], 0,
     "From above or below, the line looks higher or lower than it is. Eye level shows the true amount."),
   Q("Why does the cook stir the batter only until it comes together?", ["To save soap", "Too much stirring makes pancakes tough", "The bowl gets hot", "It makes the batter cold"], 1,
     "Stirring too long makes the batter stretchy, and the pancakes come out tough instead of soft."),
  ],
  "try": try_of(r("pancakes")),
 }, {
  "title": "Plug In Your Own Recipe",
  "mainIdea": "You can type your own recipe into the 3D kitchen and watch a cook act out each step.",
  "reading": [
   "The 3D kitchen can read a recipe you type in, in English or Spanish. Write each ingredient with its amount, like 2 cups flour. Then write the steps, one on each line. The cook acts out each step it knows.",
   "Try the scale buttons. Tap 2x and every amount doubles: 2 cups of flour becomes 4 cups, and 1 teaspoon of salt becomes 2 teaspoons. Tap 1/2x and every amount is cut in half. Check one line yourself to be sure.",
   "If the cook does not know a word, it works at the counter and shows your step in words. Your recipe stays on this device. Nobody else can see it unless you share it."],
  "words": [W("scale", "to make a recipe bigger or smaller by multiplying every amount"),
            W("ingredient", "one food that goes into a recipe")],
  "look": {"type": "data", "title": "A Recipe, Doubled (example)",
           "rows": [["flour, cups", 4], ["milk, cups", 3], ["eggs", 2], ["salt, tsp", 1]],
           "unit": "amount after 2x",
           "cite": "Example recipe before doubling: 2 c flour, 1 1/2 c milk, 1 egg, 1/2 tsp salt",
           "prompt": "Pick one line and check it: what was the amount before, and what is it times 2?"},
  "check": [
   Q("A recipe calls for 3 tablespoons of oil. You tap 2x. How much oil now?", ["5 tablespoons", "3 tablespoons", "1 1/2 tablespoons", "6 tablespoons"], 3,
     "Doubling multiplies by 2: 3 × 2 = 6 tablespoons."),
   Q("How should you type the steps?", ["One step on each line", "All steps in one long line", "Only the ingredients", "Only the title"], 0,
     "One step on each line lets the cook act out the steps in order."),
   Q("Where does a recipe you save stay?", ["On every computer in school", "On this device", "On a poster", "With a store"], 1,
     "A saved recipe stays on the device you used. Nobody else sees it unless you share it."),
  ],
  "try": try_of(PLUG),
 }]},
 12: [{
  "title": "Watch a Button Go On",
  "mainIdea": "Watching a button being sewn in 3D shows where the needle goes and how the shank is made.",
  "reading": [
   "The 3D sewing room shows a four-hole button being sewn onto cloth. Tap the button below to watch. The needle is already threaded, with a knot at the end of the thread.",
   "Notice three things. The needle comes up from the back of the cloth, so the knot hides. The thread crosses the holes in the same pattern every time. At the end, the thread wraps around under the button to make a short stem, the shank.",
   "Pins and needles go back in the pincushion, never in your mouth. Pass scissors closed, handle first. You can also watch the running stitch and the back stitch, and how to tie off."],
  "words": [W("shank", "a short stem of thread under a button that leaves room for the other layer of cloth"),
            W("pincushion", "a soft holder where pins and needles stay when you are not using them")],
  "look": {"type": "think", "title": "Count the Trips",
           "text": "A four-hole button sits on a coat. The thread goes up through one hole and down through the hole across from it. Then it goes up and down through the other two holes. The pattern makes an X.",
           "prompt": "Why should every trip through the button follow the same pattern?"},
  "check": [
   Q("Where does the needle start, so the knot is hidden?", ["On top of the button", "Inside the pocket", "At the back of the cloth", "In your mouth"], 2,
     "Starting from the back puts the knot on the inside, where nobody sees it."),
   Q("What is the short stem of thread under a button called?", ["The shank", "The hem", "The seam", "The bobbin"], 0,
     "The shank lifts the button so the buttonhole side of the coat fits under it."),
   Q("Where do needles go when you stop sewing?", ["On the floor", "In the pincushion", "Between your lips", "In a pants pocket"], 1,
     "A needle in the pincushion cannot poke a foot, a mouth or a hand."),
  ],
  "try": try_of(s("sew-button")),
 }],
 16: [{
  "title": "Watch Breakfast, Start to Clean",
  "mainIdea": "The 3D cook makes scrambled eggs and then cleans up, so you can watch a whole job from start to finish.",
  "reading": [
   "The 3D kitchen has a scrambled-egg recipe ready. The cook washes hands, ties hair back and sets out every tool first. Then the cook cracks the eggs into a bowl and whisks them with a fork.",
   "Notice three things. The pan handle is turned in, away from the edge. The cook stirs the eggs gently until they are firm, with no runny parts. Then the cook washes the dishes, glasses first and the pan last, and wipes the counter.",
   "A grown-up stays at the stove with you the whole time. Eggs are an allergen, so the recipe says so. Wash your hands again with soap after you touch a raw egg or its shell."],
  "words": [W("whisk", "to beat food fast with a wire tool or a fork to mix it"),
            W("firm", "set all the way through, with no runny liquid left")],
  "look": {"type": "think", "title": "Order the Breakfast",
           "text": "Here are five jobs, out of order: wipe the counter; stir the eggs until firm; wash hands; crack and whisk the eggs; wash the dishes.",
           "prompt": "Put the five jobs in order. Then press play and check your order against the cook."},
  "check": [
   Q("How do you know the scrambled eggs are done?", ["They are firm with no runny parts", "They have been in the pan one minute", "They smell sweet", "They are still shiny and wet"], 0,
     "Eggs are cooked when they are firm all the way through, with no runny liquid."),
   Q("Which way should the pan handle point?", ["Out over the edge", "In, away from the edge", "Toward a friend", "Up in the air"], 1,
     "A handle turned in cannot be bumped, so the hot pan stays on the stove."),
   Q("In what order does the cook wash the dishes?", ["Pan first, glasses last", "Only the pan", "Glasses first, pan last", "Spoons only"], 2,
     "Glasses go first while the water is cleanest. The greasy pan goes last."),
  ],
  "try": try_of(r("scrambled-eggs")),
 }],

 # ═══ 6–8 ═══
 18: [{
  "title": "Watch Safe Habits in 3D",
  "mainIdea": "Watching a cook use a food thermometer, oven mitts and a clean cloth in 3D turns the safety rules into habits you can picture.",
  "reading": [
   "The 3D kitchen can show one skill at a time. Start with the food thermometer. The cook pushes the tip into the thickest part of the food, away from bone and away from the pan, and waits for the number to stop moving. Poultry is safe at 165 °F and ground beef at 160 °F.",
   "Next, watch the bake skill. The cook puts on dry oven mitts before reaching in, slides the rack out, lifts the pan and sets it on the stove top. Wet mitts are not safe, because water carries the heat straight through to your skin.",
   "Then watch hand washing and wiping the counter. The cook washes for 20 seconds after touching raw meat and cleans the board and the counter before anything ready-to-eat goes there. That is how cross-contamination is stopped."],
  "words": [W("food thermometer", "a tool you push into food to read the temperature inside it"),
            W("cross-contamination", "germs moving from raw food, hands or tools onto food that will not be cooked")],
  "look": {"type": "data", "title": "Numbers the 3D Cook Checks",
           "rows": [["poultry", 165], ["ground beef", 160], ["fish", 145], ["leftovers, reheated", 165]],
           "unit": "°F", "cite": "USDA safe minimum internal temperatures",
           "prompt": "The thermometer in the chicken reads 158 °F. What should the cook do next?"},
  "check": [
   Q("Where should the thermometer tip go?", ["Touching the bottom of the pan", "Into the thickest part, away from bone", "Just under the skin", "Against a bone"], 1,
     "The thickest part heats last. Bone and pan read hotter than the food, so keep the tip away from them."),
   Q("Why are wet oven mitts unsafe?", ["They are slippery to hold", "They get dirty faster", "Water carries the heat through to your skin", "They shrink in the oven"], 2,
     "Wet cloth passes heat quickly and can turn to steam, so a wet mitt can burn the hand inside it."),
   Q("Ground beef patties read 160 °F in the thickest part. What does that mean?", ["They have reached the safe temperature", "They need to reach 200 °F", "They only needed 145 °F", "They are still raw"], 0,
     "Ground beef is safe at 160 °F, measured in the thickest part."),
  ],
  "try": try_of(k("check-temp")),
 }],
 20: [{
  "title": "Watch the Cuts in 3D",
  "mainIdea": "Watching chop, slice, dice and mince in 3D, from any side, shows where both hands go on every cut.",
  "reading": [
   "The 3D kitchen shows each knife cut as its own skill: chop, slice, dice and mince. You can turn the view and watch from the side, so you can see the knife tip stay on the board. Start with dice.",
   "Notice the guiding hand. The fingertips are tucked under in the *claw grip*, and the flat of the blade rides against the knuckles. The knife hand pinches the blade just in front of the handle. The cook cuts a flat side first so the food cannot roll.",
   "Then compare the cuts. A slice is a thin, even piece. To *dice*, the cook cuts planks, then sticks, then even cubes. To *mince*, the cook rocks the knife over a small pile again and again until the pieces are very fine.",
   "Practice the real cuts only in the lab with your teacher, a damp towel under the board and a sharp knife. Whenever you look away, set the knife down flat with the edge turned away from you."],
  "words": [W("claw grip", "the guiding hand with fingertips curled under and knuckles in front, so the blade rides the knuckles"),
            W("dice", "to cut food into even cubes"), W("mince", "to cut food into very fine pieces")],
  "look": {"type": "think", "title": "Freeze the Frame",
           "text": "Pause the dice skill halfway. The onion half lies flat side down. The guiding hand is curled. The knife tip touches the board. Only the heel of the blade is lifted.",
           "prompt": "Name two things in this frame that keep the cook's fingers safe."},
  "check": [
   Q("What does the guiding hand look like in the 3D cuts?", ["Flat, with fingers spread", "Curled into a claw, knuckles in front", "Holding the blade", "Behind the back"], 1,
     "In the claw, the knuckles face the blade and the fingertips stay tucked behind them."),
   Q("Why does the cook cut a flat side before dicing?", ["It looks nicer", "It makes the knife sharper", "So the food cannot roll", "It saves time washing"], 2,
     "Round food rolls under a blade. A flat side keeps it still, so the cut lands where you aim."),
   Q("What is the order of cuts for a dice?", ["Planks, then sticks, then cubes", "Cubes, then sticks, then planks", "Mince, then slice", "Sticks only"], 0,
     "Planks cut into sticks, and sticks cut across into even cubes."),
  ],
  "try": try_of(k("dice")),
 }],
 22: [{
  "title": "Plug In and Scale a Recipe",
  "mainIdea": "Typing a recipe into the 3D kitchen and scaling it lets you check your factor and watch the steps before you cook.",
  "reading": [
   "The 3D kitchen reads a recipe you type or paste in, in English or Spanish. Put each ingredient on its own line with its amount and unit, then each step on its own line. The cook matches the verbs it knows, such as whisk, fold, simmer and sauté, to a demonstration.",
   "Use the scale buttons to check your own math. To scale a recipe for 4 up to 8, the *scaling factor* is 2: 3/4 cup of milk becomes 1 1/2 cups, and 2 tablespoons of butter becomes 4 tablespoons, which is 1/4 cup. Work one line by hand first, then compare it with the page.",
   "Watch the measuring skills while you are there. The dry cup is scooped and leveled with a straight edge, and the liquid cup sits flat while the cook reads it at eye level. A step the cook does not know still shows its words, so nothing is skipped. Your recipe stays on this device; check allergens and set up your *mise en place* before you cook it for real."],
  "words": [W("scaling factor", "the number you multiply every amount by: servings wanted divided by servings the recipe makes"),
            W("mise en place", "French for everything in its place: every tool and ingredient measured and set out before cooking")],
  "look": {"type": "data", "title": "A Recipe for 4, Scaled to 8 (example)",
           "rows": [["milk, cups", 1.5], ["butter, Tbsp", 4], ["flour, cups", 3], ["salt, tsp", 1]],
           "unit": "amount for 8 servings",
           "cite": "Example recipe for 4: 3/4 c milk, 2 Tbsp butter, 1 1/2 c flour, 1/2 tsp salt",
           "prompt": "What is the factor here, and how many cups is 4 tablespoons of butter?"},
  "check": [
   Q("A recipe serves 6. You need 18 servings. What factor do you use?", ["2", "6", "3", "12"], 2,
     "Servings wanted divided by servings made: 18 ÷ 6 = 3."),
   Q("You scale 2 Tbsp of butter by 2x and get 4 Tbsp. How many cups is that?", ["1/4 cup", "1/2 cup", "1 cup", "1/8 cup"], 0,
     "4 tablespoons = 1/4 cup, because 16 tablespoons make 1 cup."),
   Q("What does the 3D cook do with a step whose verb it does not know?", ["Skips it", "Works at the counter and shows the step's words", "Stops the whole recipe", "Doubles it"], 1,
     "An unknown step still plays as work at the counter with its words on screen, so no step is lost."),
  ],
  "try": try_of(PLUG),
 }],
 23: [{
  "title": "Watch the Stitches in 3D",
  "mainIdea": "In the 3D sewing room each stitch stays in the cloth, so you can compare how every hand stitch is built.",
  "reading": [
   "The 3D sewing room shows each hand stitch on two layers of fabric. The thread follows the needle down and up, and every finished stitch stays in the cloth. Start by watching the needle get threaded and the knot tied.",
   "Then watch the running stitch and the *back stitch* side by side. The running stitch leaves even gaps on top. The back stitch steps back to fill each gap, so the top shows one solid line. That is why it holds a seam.",
   "Next compare the whip stitch going over an edge, the slip stitch hiding inside a fold for a hem, and the blanket stitch making a looped edge. Finish with the *tie-off*, so the stitches cannot pull out.",
   "Before you sew along with the screen, put the pins and needles you are not using in the pincushion, never in your mouth. Pass the shears closed, with the handles toward the other person."],
  "words": [W("back stitch", "a strong hand stitch that steps back to fill each gap, making a solid line on top"),
            W("tie-off", "the small knot at the end of a line of stitches that keeps them from pulling out")],
  "look": {"type": "think", "title": "Top and Back",
           "text": "Two practice strips lie side by side. Strip A has dashes on top with gaps between them. Strip B has one solid line on top, and on the back the stitches overlap.",
           "prompt": "Which strip is the running stitch, and which is the back stitch? Which would you use to close a split seam?"},
  "check": [
   Q("What does the top of a back stitch look like?", ["Dashes with gaps", "One solid line", "Loops along the edge", "Nothing shows"], 1,
     "Each back stitch fills the gap behind it, so the top shows one solid line."),
   Q("Which stitch hides inside a fold for a hem?", ["The slip stitch", "The running stitch", "The blanket stitch", "The basting stitch"], 0,
     "The slip stitch travels inside the fold, so almost nothing shows on the outside."),
   Q("Why do you tie off at the end?", ["To make the thread longer", "To change color", "So the stitches cannot pull out", "So the needle stays sharp"], 2,
     "Without a tie-off, the last stitches slide loose and the line pulls out."),
  ],
  "try": try_of(s("backstitch")),
 }],

 # ═══ 9–10 ═══
 26: [{
  "title": "Watch a Seam in 3D",
  "mainIdea": "Watching the machine sew in 3D, with the needle, presser foot and feed dogs moving together, shows what your hands should and should not do.",
  "reading": [
   "The 3D sewing room shows the machine from any side. Start with the machine tour, then watch the bobbin wind and the top thread follow its path from the spool to the needle. Every part you named in class moves in the same order it does on a real machine.",
   "Then watch the straight seam. The *feed dogs* under the presser foot move the fabric; the hands only guide it, never push or pull. The raw edges ride along the 5/8-inch line of the guide, which sets the *seam allowance*. A few stitches forward and back at each end lock the seam.",
   "Watch the corner next. The needle stays down in the fabric, the presser foot lifts, the fabric turns on the needle, and the foot comes down again; that is how you *pivot*. Then the iron presses the seam open and then to one side, lifted and set down rather than slid. On the real machine, fingers stay out of the needle's path and off the line the presser foot travels, and the iron rests upright and is unplugged when you finish."],
  "words": [W("feed dogs", "the small toothed bars under the presser foot that move the fabric forward"),
            W("seam allowance", "the space between the stitching and the raw edge, 5/8 inch on most patterns"),
            W("pivot", "to turn the fabric on the needle while it is down, making a sharp corner")],
  "look": {"type": "think", "title": "Who Moves the Fabric?",
           "text": "A student pushes the fabric hard toward the back of the machine while sewing. The stitches come out long and uneven, and the needle bends.",
           "prompt": "Watch the straight seam in 3D. What moves the fabric, and what should the student's hands do instead?"},
  "check": [
   Q("What moves the fabric under the presser foot?", ["The feed dogs", "Your hands pushing", "The bobbin", "The spool"], 0,
     "The feed dogs move the fabric at an even rate. Hands only guide it."),
   Q("How do you turn a sharp corner?", ["Lift the needle out, then turn", "Needle down, foot up, turn, foot down", "Cut the thread and start over", "Sew faster around it"], 1,
     "With the needle down, the fabric turns on that point, so the corner stays sharp and the stitching unbroken."),
   Q("Why backstitch at the start and end of a seam?", ["To make it wider", "To mark the grain", "To lock the stitches so they do not pull out", "To clean the feed dogs"], 2,
     "A few stitches back over the line lock the thread at each end of the seam."),
  ],
  "try": try_of(s("straight-seam")),
 }],
 28: [{
  "title": "Watch the Layout in 3D",
  "mainIdea": "Watching a pattern being pinned, marked and cut in 3D shows why each step happens before the next.",
  "reading": [
   "The 3D sewing room shows a pattern piece being laid out and pinned on folded fabric. Watch the *grainline* arrow first: the sewer measures from each end of the arrow to the *selvage* and moves the piece until both measurements match. Only then do the pins go in.",
   "Then watch the marking. Each *notch*, dot and dart is transferred with chalk or a fabric marker before the pattern comes off, because once the paper is gone, the marks are the only map left to show which edges match. Watch how the marker reaches every dot and notch on the piece, and how each one lines up with its partner on the next piece.",
   "Then watch the cutting. The shears take long, smooth strokes with the lower blade resting on the table, so the fabric does not lift and shift. The sewer walks around the table instead of turning the fabric. Pins go into the pincushion, never the mouth, and shears are passed closed, handles first."],
  "words": [W("grainline", "the arrow on a pattern piece that must run parallel to the selvage"),
            W("selvage", "the finished edge of woven fabric that does not fray"),
            W("notch", "a small mark on a pattern edge that shows which pieces match when sewn")],
  "look": {"type": "think", "title": "A Piece Off Grain",
           "text": "A student pins a pant-leg piece with the grainline arrow 1 inch closer to the selvage at the top than at the bottom. After sewing and washing, the leg twists around the body.",
           "prompt": "What should the student have checked while pinning, and what would the 3D layout show?"},
  "check": [
   Q("How do you know a pattern piece is on grain?", ["The arrow is the same distance from the selvage at both ends", "The piece is near the fold", "The piece is upside down", "It is pinned in the middle only"], 0,
     "Equal measurements at both ends mean the grainline runs parallel to the selvage."),
   Q("Why mark notches before unpinning the pattern?", ["Chalk dries out", "Once the paper is gone, the marks are the only map left", "Notches stop fraying", "It makes cutting faster"], 1,
     "The marks tell you which edges match when you sew. Without the paper, they are all you have."),
   Q("How should shears move when cutting fabric?", ["Short snips held in the air", "Tearing along the edge", "Turning the fabric with every cut", "Long smooth strokes, lower blade on the table"], 3,
     "Keeping the lower blade on the table stops the fabric from lifting, so the cut follows the line."),
  ],
  "try": try_of(s("pin-pattern")),
 }],
 29: [{
  "title": "Watch Heat at Work in 3D",
  "mainIdea": "Watching sauté, simmer and bake in 3D lets you name the kind of heat transfer doing most of the work in each.",
  "reading": [
   "The 3D kitchen shows each cooking method as its own skill. Watch the sauté first: a little oil in a preheated pan, food in a single layer, and the cook moving it often. The pan touches the food directly, so most of the heat arrives by *conduction*, straight from the metal into the food.",
   "Compare boil and simmer. At a boil, large bubbles break the surface fast; at a simmer, small bubbles rise gently. In both, *convection* currents carry heat through the water to the food. Notice the pot handle turned in, away from the edge of the stove.",
   "Then watch the bake skill. The oven's hot air moves by convection, and the hot walls give off *radiation*. The cook wears dry oven mitts and slides the rack out instead of reaching into the oven. Look for the food turning golden brown: that is the *Maillard reaction*, and it needs dry heat. Ask yourself why a crowded pan would turn the sauté into steaming."],
  "words": [W("conduction", "heat moving by direct contact, from pan to food"),
            W("convection", "heat carried by moving air or liquid"),
            W("radiation", "heat traveling as energy waves across space, as from an oven wall or a broiler"),
            W("Maillard reaction", "browning when proteins and sugars react under dry heat, making new flavors")],
  "look": {"type": "think", "title": "Name the Heat",
           "text": "Three skills play in the 3D kitchen: onions sizzling in a skillet, pasta in a pot of rolling water, and muffins rising in the oven.",
           "prompt": "For each one, name the main kind of heat transfer and one thing the cook does to stay safe."},
  "check": [
   Q("In a sauté, which kind of heat transfer does most of the work?", ["Radiation", "Convection in the air", "Conduction from the pan", "None of them"], 2,
     "The food touches the hot pan, so heat moves by conduction."),
   Q("How does a simmer look different from a boil?", ["Small, gentle bubbles instead of large, fast ones", "No bubbles at all", "Smoke rises from it", "The water turns brown"], 0,
     "A simmer shows small bubbles rising gently; a boil shows large bubbles breaking fast."),
   Q("Why does a crowded pan steam instead of brown?", ["The oil gets too hot", "Water released by the food cools the pan and cannot escape", "The handle is turned in", "The food is too dry"], 1,
     "Too much food lets out water that cannot evaporate fast enough, so the food steams and the Maillard reaction cannot start."),
  ],
  "try": try_of(k("saute")),
 }],
 32: [{
  "title": "Watch a Weeknight Meal in 3D",
  "mainIdea": "Watching a stir-fry and a pasta dinner in 3D shows how prep, allergens and cooking once to eat twice fit into a week's plan.",
  "reading": [
   "The 3D kitchen has two dinner recipes worth watching while you plan a week: a vegetable stir-fry and a tomato pasta. Open each one and read its ingredient list as if it were going onto your grocery list, sorted by store section. Mark what you already have at home, so the list holds only what you need to buy.",
   "Watch the stir-fry for how the cook preps. Every vegetable is washed, cut to an even size and set out before the pan heats, because stir-frying moves too fast to stop and chop. That is *mise en place*, and the even pieces also cook in the same amount of time.",
   "Watch the pasta for how one pot of sauce can serve two meals. Notice the *allergen* each recipe names, such as wheat in pasta, and think about who you are cooking for. Then plug in one of your own family's recipes on the same page and scale it with 2x to see how cooking once can feed you twice. *Leftovers* go in the refrigerator within two hours."],
  "words": [W("mise en place", "having every ingredient prepped and every tool set out before cooking starts"),
            W("allergen", "a food that causes an allergic reaction in some people, named on labels and recipes"),
            W("leftovers", "cooked food saved for another meal, refrigerated within two hours")],
  "look": {"type": "data", "title": "Cook Once, Eat Twice (example)",
           "rows": [["servings at 1x", 4], ["servings at 2x", 8], ["family-of-4 dinners at 2x", 2]],
           "unit": "count", "cite": "Example: a sauce recipe that serves 4, doubled",
           "prompt": "If the doubled sauce serves 8, how many dinners does it make for a family of four?"},
  "check": [
   Q("Why does the stir-fry cook set out every vegetable before heating the pan?", ["It looks good on camera", "Stir-frying moves too fast to stop and chop", "Raw vegetables spoil in minutes", "The knife must cool down"], 1,
     "Once the pan is hot, the food cooks in minutes. Everything must be ready first."),
   Q("A recipe serves 4. You scale it 2x. How many servings?", ["6", "2", "4", "8"], 3,
     "4 servings × 2 = 8 servings."),
   Q("How soon should leftovers go into the refrigerator?", ["Within two hours", "By the next morning", "After they cool all day", "Within six hours"], 0,
     "The two-hour rule: food left out longer sits in the danger zone, where bacteria grow fast."),
  ],
  "try": try_of(r("veggie-stir-fry")),
 }],

 # ═══ 11–12 ═══
 33: [{
  "title": "Watch Gluten and Eggs in 3D",
  "mainIdea": "Watching kneading, muffin mixing and scrambled eggs in 3D shows protein chemistry decide the texture of real food.",
  "reading": [
   "The 3D kitchen lets you watch chemistry happen inside real recipes. Start with pizza dough and its knead skill: the cook pushes the dough away with the heel of the hand, folds it back and gives it a quarter turn. Each push stretches *gluten*, the network that forms when the proteins glutenin and gliadin in wheat flour meet water.",
   "Compare that with the muffins. There the cook folds the wet and dry ingredients together only until the flour disappears, and lumps are left on purpose. Muffins want little gluten, for a tender crumb; pizza wants a lot, for a stretchy, chewy crust. Same flour, opposite goals, and the mixing decides which one you get.",
   "Then watch scrambled eggs. As the eggs heat, their proteins *denature*, unfolding from tight coils, and then *coagulate*, bonding into a soft solid. Gentle heat and steady stirring keep the curds tender; high heat squeezes water out and turns them rubbery. The eggs are done when firm, with no runny liquid. Raw dough and raw egg are not ready to eat: wash your hands after handling them, and name wheat and egg as allergens when you serve."],
  "words": [W("gluten", "a stretchy protein network formed when wheat flour proteins meet water and are mixed"),
            W("denature", "for a protein to unfold from its natural shape, often because of heat or acid"),
            W("coagulate", "for unfolded proteins to bond together into a solid, as when an egg sets")],
  "look": {"type": "think", "title": "Two Doughs, One Flour",
           "text": "Batch A was kneaded for 8 minutes and springs back when poked. Batch B was stirred 15 strokes and still shows lumps of flour mixture.",
           "prompt": "Which batch should become pizza and which muffins? Explain your answer using gluten."},
  "check": [
   Q("What does kneading do to dough?", ["Melts the fat", "Develops gluten so the dough stretches", "Removes the yeast", "Removes the starch"], 1,
     "Kneading lines up and links the gluten proteins into a stretchy network."),
   Q("Why stop mixing muffin batter while lumps remain?", ["To limit gluten so the muffins stay tender", "To make them rise less", "To keep the oven cool", "Because lumps add sugar"], 0,
     "More mixing means more gluten. Muffins stay tender when mixing stops early."),
   Q("What happens to egg proteins as eggs cook?", ["They dissolve into water", "They turn into sugar", "They denature, then coagulate into a solid", "Nothing changes"], 2,
     "Heat unfolds the proteins, and the unfolded proteins bond into the soft solid of a cooked egg."),
  ],
  "try": try_of(r("pizza-dough")),
 }],
 34: [{
  "title": "Watch an Emulsion Form",
  "mainIdea": "Watching a vinaigrette whisked together in 3D shows how droplets, an emulsifier and time decide whether an emulsion holds.",
  "reading": [
   "The vinaigrette recipe in the 3D kitchen is an *emulsion* you can watch form. The cook measures vinegar into a bowl, adds salt and a little mustard, then pours in the oil in a thin, steady stream while whisking hard. Pause the skill partway and look at the bowl.",
   "Whisking breaks the oil into tiny droplets and spreads them through the vinegar. Oil and water do not mix, so on their own the droplets join back together. Mustard works as an *emulsifier*: it coats the droplets and helps keep them apart for much longer.",
   "Leave the dressing to stand and it slowly separates; that makes it a *temporary emulsion*. Mayonnaise holds much longer because egg yolk, with its lecithin, is a stronger emulsifier. A common starting ratio for vinaigrette is about 3 parts oil to 1 part vinegar. To test a change, alter one thing at a time and keep the whisking the same, as in any controlled experiment. Some people are allergic to mustard or egg, so name them on the recipe, and keep the dressing in the refrigerator."],
  "words": [W("emulsion", "a mixture of two liquids that normally do not mix, with one spread through the other as tiny droplets"),
            W("emulsifier", "an ingredient that helps the droplets of an emulsion stay apart"),
            W("temporary emulsion", "an emulsion that separates on its own after standing")],
  "look": {"type": "think", "title": "Plan the Test",
           "text": "You want to know whether mustard keeps a vinaigrette together longer. You have oil, vinegar, mustard, two jars, a measuring cup and a timer.",
           "prompt": "Write the control, the one variable and what you will measure. Which step from the 3D vinaigrette must stay the same in both jars?"},
  "check": [
   Q("What does whisking do to the oil in a vinaigrette?", ["Heats it", "Breaks it into tiny droplets spread through the vinegar", "Turns it into vinegar", "Removes its fat"], 1,
     "Whisking splits the oil into droplets small enough to spread through the vinegar."),
   Q("What job does the mustard do?", ["Adds only color", "Makes the oil boil", "Kills all bacteria", "Works as an emulsifier that helps keep droplets apart"], 3,
     "An emulsifier coats the droplets and slows them from joining back together."),
   Q("A vinaigrette separates after standing for a while. What kind of emulsion is it?", ["A temporary emulsion", "A permanent emulsion", "A suspension of salt", "A solution"], 0,
     "An emulsion that separates on its own after standing is a temporary emulsion."),
  ],
  "try": try_of(r("vinaigrette")),
 }],
 40: [{
  "title": "Rehearse Your Project in 3D",
  "mainIdea": "A rehearsal in the 3D kitchen or sewing room lets you test your timeline and catch a missing step before production day.",
  "reading": [
   "Before production day, you can *rehearse* a food capstone in the 3D kitchen. Type or paste your recipe in, one ingredient and one step per line, and scale it to your *head count*. The cook acts out each step it recognizes, so you can watch your timeline play in order and spot a step that is missing or out of place.",
   "Use the rehearsal as *evidence*. Note where the cook stops to wait, which tools it reaches for, and which steps share the stove at once. Compare that with your time plan and your equipment list. Finish with the plate skill and decide how the food will look when it reaches the table.",
   "Sewing a capstone instead? The 3D sewing room shows the straight seam, the seam guide, pivoting a corner and pressing, so you can rehearse the order of construction before you cut your fabric. A rehearsal never replaces the safety plan: on production day, hands are washed, hair is tied back, the thermometer is used, and the iron rests upright and is unplugged when you finish."],
  "words": [W("rehearse", "to practice the whole process once before the real performance"),
            W("head count", "the number of people you are serving, used to scale a recipe"),
            W("evidence", "notes, photos or data that show what happened and support your evaluation")],
  "look": {"type": "think", "title": "Find the Gap",
           "text": "A student's rehearsal in the 3D kitchen shows the cook dicing onions while the oil smokes in the pan. In the student's time plan, the onions were to be cut during cooking.",
           "prompt": "What should change in the time plan, and how would mise en place fix it?"},
  "check": [
   Q("What can a 3D rehearsal help you find before production day?", ["A missing or out-of-order step", "The exact taste of the dish", "Your final grade", "The price at the store"], 0,
     "Watching the steps play in order shows gaps and clashes in the timeline."),
   Q("Your recipe serves 4 and your head count is 12. What do you do before rehearsing?", ["Nothing; serve smaller portions", "Scale it by 3", "Scale it by 12", "Scale it by 8"], 1,
     "12 ÷ 4 = 3, so every amount is multiplied by 3."),
   Q("Which rule still applies on production day after a rehearsal?", ["Skip the thermometer", "Leave the iron face down", "Wash hands and use the thermometer", "Hold pins in your mouth"], 2,
     "A rehearsal tests the plan. The real safety rules apply every time you cook or sew."),
  ],
  "try": try_of(PLUG),
 }],
}

# ── 3. The unit page's Practice rooms doors (outline.py LINKS adds these after the room)
LINKS3D = {
 1: [k("wash-hands")],
 2: [k("spread"), k("bake"), k("chop")],
 3: [r("fruit-salad"), r("yogurt-parfait")],
 4: [k("wash-dishes"), k("wipe-clean")],
 5: [k("measure-dry"), k("measure-liquid"), r("pancakes"), PLUG],
 6: [s("thread-needle"), s("running-stitch"), s("sew-button"), s("tie-off")],
 8: [k("wash-hands"), r("scrambled-eggs"), k("wash-dishes"), k("wipe-clean")],
 9: [k("wash-hands"), k("check-temp"), k("bake"), k("wipe-clean")],
 10: [k("chop"), k("slice"), k("dice"), k("mince")],
 11: [k("measure-dry"), k("measure-liquid"), r("quick-bread"), PLUG],
 12: [s("running-stitch"), s("backstitch"), s("slip-stitch"), s("sew-button")],
 13: [s("machine-parts"), s("thread-machine"), s("straight-seam"), s("pivot-corner")],
 14: [s("pin-pattern"), s("mark-fabric"), s("cut-fabric")],
 15: [k("saute"), k("simmer"), k("bake"), k("check-temp")],
 16: [r("veggie-stir-fry"), r("tomato-pasta"), PLUG],
 17: [r("scrambled-eggs"), r("pizza-dough"), r("quick-bread"), r("vinaigrette")],
 20: [PLUG, k("plate"), s("straight-seam")],
}
LINK_DOORS = {n: [door(l) for l in ls] for n, ls in LINKS3D.items()}
