# Skateboarding: History, Tricks and the Science of Balance — course id skt (2026-10-11)
# Jimmy: "a history of skateboarding curriculum made for k12 and adult in curriculum and daily
# practice … how to do tricks, grinds, etc. how it balance all the grooves from a science perspective."
# Three threads run through every band: HISTORY (people, places, dates), HOW TO (tricks and grinds,
# taught step by step, always with safety first) and SCIENCE (forces, energy, friction, torque, balance).
# This book DOES teach technique, unlike Sports History and The Measured Step (Jimmy's request).
# Daily Practice: /drops/skate/K | 3-5 | 6-8 | 9-10 | 11-12 | adult
# Sister: spt (Sports History). Link, don't copy.

BANDS = [
 dict(id="k-2",   title="Grades K–2",   level="k2"),
 dict(id="3-5",   title="Grades 3–5",   level="35"),
 dict(id="6-8",   title="Grades 6–8",   level="68"),
 dict(id="9-10",  title="Grades 9–10",  level="hs"),
 dict(id="11-12", title="Grades 11–12", level="hs2"),
 dict(id="adult", title="Adult",        level="ad"),
]

UNITS = [
 # ── K–2 ──────────────────────────────────────────────────────────────
 dict(n=1, band="k-2", title="A Board With Wheels", strand="History", chapters=[
  dict(n=1, title="Surfing on the Sidewalk", strand="History",
       topics="surfers in California in the 1950s wanted to surf when the waves were flat; roller-skate wheels fixed under a wooden board; people called it sidewalk surfing; first boards sold in stores around 1959; skateboarding is now done all over the world.",
       story="A child watches the ocean go flat and wonders what a surfer does on a day with no waves"),
  dict(n=2, title="The Parts of a Skateboard", strand="Parts",
       topics="the deck (the board you stand on); the nose and the tail; grip tape is rough like sandpaper so shoes do not slip; trucks are the metal parts that hold the wheels and help you turn; four wheels; bearings let wheels spin; each part has a job.",
       story="A skateboard lies upside down on a table and a class points to each part"),
 ]),
 dict(n=2, band="k-2", title="Safe and Steady", strand="Safety", chapters=[
  dict(n=3, title="Helmet First", strand="Safety",
       topics="a helmet protects your head and should fit snugly and be buckled; knee pads, elbow pads and wrist guards; flat shoes with good soles; ride in a safe place away from cars; ride with a grown-up nearby; learning to fall small: bend low, roll, do not catch yourself with straight arms.",
       story="Before anyone rolls, a class lines up and checks each other's helmet straps"),
  dict(n=4, title="Balance Is Something You Practice", strand="Balance",
       topics="standing on the board on grass or carpet first so it cannot roll; feet over the bolts; bend your knees like a spring; arms out help balance; look where you want to go; some people ride with the left foot forward (regular) and some with the right foot forward (goofy) and both are fine; balance gets better with practice.",
       story="On a carpet in the classroom, a skateboard stays still while children take turns standing on it"),
 ]),
 dict(n=3, band="k-2", title="Push, Roll, Stop", strand="Moving", chapters=[
  dict(n=5, title="Push and Roll", strand="Moving",
       topics="one foot stays on the board, the other foot pushes the ground; a push is a force that starts you moving; after the push, put the foot back on the board and roll; small pushes are fine; smooth ground rolls better than bumpy ground.",
       story="A child on a smooth playground gives one small push and is surprised how far the board rolls"),
  dict(n=6, title="Slow Down, Turn, Stop", strand="Moving",
       topics="dragging a foot gently on the ground slows you down (friction); leaning on your toes or heels turns the board; going down a hill makes you go faster because gravity pulls you down; stopping before you get too fast; stepping off safely.",
       story="A gentle slope at the park makes the board speed up, and a child learns to drag a foot to slow down"),
 ]),
 # ── 3–5 ──────────────────────────────────────────────────────────────
 dict(n=4, band="3-5", title="From Clay Wheels to Urethane", strand="History", chapters=[
  dict(n=7, title="The First Boom", strand="1950s–1960s",
       topics="homemade boards with roller-skate wheels; companies such as Makaha and Hobie made boards in the early 1960s; clay and steel wheels were slippery and loud; the 1965 national championships in Anaheim, California, shown on television; Patti McGee, an early women's champion; the boom faded around 1966 when many riders got hurt on poor wheels.",
       story="A metal wheel hits a tiny pebble and the board stops dead while the rider keeps going"),
  dict(n=8, title="A New Wheel Changes Everything", strand="1970s",
       topics="Frank Nasworthy and the urethane wheel (Cadillac Wheels, early 1970s) gripped and rolled smoothly; the kicktail, patented by Larry Stevenson; sealed precision bearings; the Zephyr team from Santa Monica and Venice at the 1975 Del Mar contest; drought in California in the mid-1970s left swimming pools empty and skaters rode their curved walls.",
       story="A skater rolls over a crack that used to stop clay wheels and keeps on rolling"),
 ]),
 dict(n=5, band="3-5", title="Forces on Four Wheels", strand="Science", chapters=[
  dict(n=9, title="Push, Pull and Inertia", strand="Forces",
       topics="a force is a push or a pull; inertia: a moving thing keeps moving until a force stops it (why a rider flies forward when the wheel hits a rock); friction between wheels and ground slows the board; gravity pulls everything down; Newton's first law in plain words; why soft wheels grip and roll over cracks.",
       story="A board rolls across a gym floor and slowly stops, and a class asks what stopped it"),
  dict(n=10, title="Energy on a Ramp", strand="Energy",
       topics="height stores energy (stored or potential energy); rolling down turns it into motion energy (kinetic energy); a ramp works like a slide; a higher start means more speed at the bottom; friction turns some energy into heat and sound so you never roll quite as high as you started; a halfpipe as a back-and-forth energy trade.",
       story="A marble rolls back and forth in a curved bowl, and each trip is a little lower"),
 ]),
 dict(n=6, band="3-5", title="First Tricks", strand="How To", chapters=[
  dict(n=11, title="Kickturns, Tic-Tacs and Manuals", strand="Tricks",
       topics="safety gear and a flat smooth place; the kickturn: press the tail, lift the front wheels, turn; tic-tac: small kickturns side to side to move forward without pushing; the manual: balancing on the back wheels; the tail as a lever; practice a little each day.",
       story="A beginner presses the tail too hard and the board shoots out, then tries again more gently"),
  dict(n=12, title="Dropping In and Carving", strand="Tricks",
       topics="start on a small ramp with a coach or grown-up; the drop-in: tail on the coping, front foot on the bolts, lean forward and commit; leaning back makes the board slip out; carving: long smooth turns using toes and heels; pumping a ramp gains speed without pushing.",
       story="A rider stands at the top of a small ramp for a long time before deciding to lean forward"),
 ]),
 # ── 6–8 ──────────────────────────────────────────────────────────────
 dict(n=7, band="6-8", title="Pools, Parks and the Ollie", strand="History", chapters=[
  dict(n=13, title="Empty Pools and the First Skateparks", strand="1970s",
       topics="pool riding in Southern California; the frontside air and riding vertical walls; the first built skateparks of 1976 such as Carlsbad in California and Skateboard City in Port Orange, Florida; dozens of parks opened by the late 1970s; insurance and injury lawsuits closed many parks by the early 1980s; magazines such as SkateBoarder.",
       story="A skater looks down into an empty backyard pool and sees the curved wall as a wave"),
  dict(n=14, title="The Ollie and the Street", strand="1980s",
       topics="Alan 'Ollie' Gelfand and the no-hands aerial on vert in the late 1970s; Rodney Mullen brought the ollie to flat ground in the early 1980s and invented many flat-ground tricks such as the kickflip as it is done today; Powell Peralta's Bones Brigade and skate videos (The Bones Brigade Video Show, 1984); Thrasher (1981) and TransWorld SKATEboarding (1983); backyard ramps; street skating on curbs, ledges and stairs.",
       story="A skater pops a board into the air with no hands and the board stays under their feet"),
 ]),
 dict(n=8, band="6-8", title="The Physics of the Ollie", strand="Science", chapters=[
  dict(n=15, title="Levers and Torque", strand="Torque",
       topics="the board as a lever with the rear wheels as the pivot (fulcrum); striking the tail pushes it down and rotates the nose up; torque = force times distance from the pivot; why the tail is angled up (the kicktail); Newton's third law: the ground pushes back up on the tail; the rider jumps so the board has room to rise.",
       story="A ruler on the edge of a desk flips up when one end is tapped"),
  dict(n=16, title="Friction, Timing and Hang Time", strand="Motion",
       topics="grip tape friction lets the front foot drag the board upward and level it out; the order: crouch, pop, slide, jump, level, land; center of mass rises and falls in a curve (a parabola); hang time and jump height: a 30 cm ollie keeps a rider in the air about half a second; bending knees on landing spreads the force over more time.",
       story="Slow-motion video shows a shoe sliding up the grip tape while the board rises"),
 ]),
 dict(n=9, band="6-8", title="Ollies and Flip Tricks", strand="How To", chapters=[
  dict(n=17, title="The Ollie Step by Step", strand="Tricks",
       topics="gear and a flat smooth spot; foot position (back foot ball on the tail, front foot behind the bolts); crouch; snap the tail; slide the front foot to the nose; jump and pull knees up; level the board; land over the bolts with bent knees; practice standing still on grass first, then rolling slowly; common problems and fixes.",
       story="Hundreds of tries on a carpet come before the first rolling ollie"),
  dict(n=18, title="Shove-its, Kickflips and Heelflips", strand="Tricks",
       topics="the pop shove-it: the board spins flat 180 degrees under you (around a vertical axis); the kickflip: the front foot flicks off the toe-side edge of the nose and the board flips along its long axis; the heelflip uses the heel and flips the other way; names of rotation axes; catching the board with the feet; practicing the motions slowly.",
       story="A board spins under a jumping skater and lands wheels-down, and a friend asks how"),
 ]),
 # ── 9–10 ─────────────────────────────────────────────────────────────
 dict(n=10, band="9-10", title="Street, Video and the World Stage", strand="History", chapters=[
  dict(n=19, title="The Street Era", strand="1990s",
       topics="skate videos as the way tricks spread (Blind's Video Days, 1991; Plan B's Questionable, 1992); smaller wheels and double-kick decks; ledges, handrails and stairs; skate shops as community centers; city bans and 'skateboarding is not a crime'; skaters who changed the style such as Mark Gonzales and Natas Kaupas.",
       story="A grainy VHS tape is passed hand to hand until a whole town learns a new trick"),
  dict(n=20, title="X Games, the 900 and New Doors", strand="1990s–2000s",
       topics="ESPN's Extreme Games (1995), renamed the X Games; Tony Hawk's 900 (two and a half spins) in 1999; the Tony Hawk's Pro Skater video game (1999); women in skateboarding such as Patti McGee, Peggy Oki, Cindy Whitehead and Elissa Steamer; skaters of color who shaped the sport; skateboarding's sales boom.",
       story="A crowd counts out loud as a skater spins in the air for the eleventh try"),
 ]),
 dict(n=11, band="9-10", title="Grinds and Slides", strand="How To and Science", chapters=[
  dict(n=21, title="Grinds and Slides Step by Step", strand="Tricks",
       topics="start on a low curb or a flat bar with gear; wax; the 50-50 (both trucks on the edge); the 5-0 (back truck only); the boardslide (the middle of the deck slides across a rail); the noseslide and tailslide; approach angle and speed; looking at the end of the rail; how to bail safely.",
       story="A skater waxes a curb and listens to the sound of trucks grinding for the first time"),
  dict(n=22, title="The Science of Friction on a Rail", strand="Friction",
       topics="kinetic friction force = coefficient of friction times normal force; on a level rail the slowing (deceleration) is the coefficient times g; slide distance d = v^2 / (2 times coefficient times g); wax lowers the coefficient; metal versus concrete versus painted edges; heat and wear; why speed carries a grind farther; a worked example.",
       story="Two skaters hit the same ledge at the same speed and one slides twice as far"),
 ]),
 dict(n=12, band="9-10", title="Balance, Turning and Spin", strand="Science", chapters=[
  dict(n=23, title="Center of Mass and Turning", strand="Balance",
       topics="center of mass and base of support; balance means keeping the center of mass over the base; truck geometry: leaning tilts the axles and steers the wheels (kingpin angle and bushings); centripetal force in a turn; tighter trucks versus looser trucks; speed wobble and how a lower stance and pressure on the front foot calm it.",
       story="A rider leans into a long carve and the board draws a curve on the ground"),
  dict(n=24, title="Rotation and Angular Momentum", strand="Rotation",
       topics="angular momentum stays the same unless a torque acts; winding up the arms and shoulders before a 180; pulling arms in spins faster (smaller moment of inertia); moment of inertia; pumping a bowl: crouching on the walls and standing tall at the bottom adds energy; frontside and backside.",
       story="A skater on a spinning stool pulls in their arms and spins faster"),
 ]),
 # ── 11–12 ────────────────────────────────────────────────────────────
 dict(n=13, band="11-12", title="Skateboarding, the City and the World", strand="History", chapters=[
  dict(n=25, title="Public Space and the Right to Skate", strand="Public Space",
       topics="skate stoppers and hostile design; the Southbank undercroft in London, skated since the 1970s and saved by the Long Live Southbank campaign in 2014; Burnside in Portland, built by skaters under a bridge in 1990 and later accepted by the city; the Tony Hawk Foundation (2002), now The Skatepark Project; arguments for and against skateparks and street skating.",
       story="A city council meeting fills with skaters holding hand-drawn maps of a park"),
  dict(n=26, title="Skateboarding Around the World and the Olympics", strand="Global",
       topics="Skateistan, founded in Kabul in 2007, using skating to bring children to school; skateboarding at the Tokyo 2020 Olympics (held in 2021) with street and park events; medalists such as Momiji Nishiya and Yuto Horigome of Japan and Rayssa Leal of Brazil; Sky Brown; Paris 2024; debates inside skateboarding about contests and the Olympics.",
       story="A thirteen-year-old stands on an Olympic podium beside skaters twice her age"),
 ]),
 dict(n=14, band="11-12", title="Engineering the Board and the Ramp", strand="Science", chapters=[
  dict(n=27, title="Decks, Wheels and Bearings", strand="Engineering",
       topics="seven plies of maple pressed with glue; concave adds stiffness and grip for the feet; wheel hardness (durometer, e.g. 78A soft to 101A hard) and diameter; soft wheels for rough ground, hard wheels for parks; urethane chemistry in plain terms; bearings and the ABEC tolerance scale (a precision rating, not a speed rating); trade-offs engineers make.",
       story="A shop worker presses a thumbnail into two wheels to show how they differ"),
  dict(n=28, title="Ramps by Design", strand="Engineering",
       topics="transition and radius; a quarterpipe as an arc of a circle; the coping; energy conservation predicts the height a rider can reach; centripetal acceleration at the bottom of a ramp (v^2/r) makes riders feel heavier; why tighter transitions feel harder; flat bottom; building ramps safely with plywood and framing; a worked design problem.",
       story="Two ramp plans sit side by side, one with a tight curve and one with a wide curve"),
 ]),
 dict(n=15, band="11-12", title="Advanced Tricks and How Skill Is Built", strand="How To", chapters=[
  dict(n=29, title="Spins, Flips and Grabs", strand="Tricks",
       topics="frontside and backside 180s; the 360 flip (tre flip) combines a shove-it and a kickflip; varial flips; backside airs and grabs on a ramp; rock to fakie; axis and rotation for each trick; progression: which tricks build on which.",
       story="A trick list on a notebook page grows one line at a time over a year"),
  dict(n=30, title="The Science of Practice", strand="Learning",
       topics="motor learning: skills move from careful thinking to automatic; spaced practice beats one long session; variable practice; filming yourself for feedback; fear as a normal signal and breaking a trick into small steps; rest and sleep help skills settle; learning how to fall (rolling, sliding on knee pads); the skate community teaching each other.",
       story="A skater who could not land a trick on Friday lands it first try on Monday"),
 ]),
 # ── Adult ────────────────────────────────────────────────────────────
 dict(n=16, band="adult", title="Culture, Art and Who Skates", strand="Culture", chapters=[
  dict(n=31, title="Graphics, Photographs and Video", strand="Art",
       topics="deck graphics as art (Jim Phillips at Santa Cruz; Vernon Courtland Johnson at Powell Peralta); skate photography and magazines (SkateBoarder, Thrasher, TransWorld); skate video as an art form, from VHS to the internet; skateboarding and music such as punk and hip-hop; DIY culture and zines.",
       story="A wall of old decks in a shop tells forty years of art history"),
  dict(n=32, title="Doors Opened: Women, Skaters of Color and Adaptive Skating", strand="Inclusion",
       topics="Patti McGee and the 1960s; Peggy Oki and the Zephyr team; women's contests and pro careers; skaters of color such as Ray Barbee, Stevie Williams and Nyjah Huston; skateboarding in Brazil and Japan; adaptive and wheelchair skating (WCMX) and Aaron Fotheringham; groups that welcome new and different skaters; skateboarding as a place where many people belong.",
       story="An all-ages session at a skatepark mixes a grandmother on her first board with a wheelchair rider dropping in"),
 ]),
 dict(n=17, band="adult", title="Starting or Returning as an Adult", strand="How To", chapters=[
  dict(n=33, title="Starting Safely at Any Age", strand="Safety",
       topics="adult bodies heal more slowly, so protection matters more: helmet, wrist guards, knee pads; wrist injuries are among the most common skateboarding injuries; warming up; choosing a stable board (wider deck, softer wheels) or a cruiser; practicing falls on grass; quiet times at the park; setting small goals.",
       story="A forty-year-old buys a board on a Saturday and practices falling on grass before rolling"),
  dict(n=34, title="Getting Better: Practice, Fear and Community", strand="Learning",
       topics="motor learning for adults; short, frequent sessions; breaking tricks into steps; fear and confidence; finding a crew or a lesson; teaching children and being a beginner beside them; skating for fitness and balance; tracking progress with notes and video.",
       story="A parent and child learn the same trick on the same afternoon and cheer for each other"),
 ]),
 dict(n=18, band="adult", title="Capstone: Science and Community", strand="Capstone", chapters=[
  dict(n=35, title="Measure Your Own Skating", strand="Science",
       topics="measuring speed with a phone video and a known distance; finding the slope of a hill; a friction experiment with a waxed and an unwaxed ledge; hang time from video frames and the jump height it predicts; energy on a ramp: predicted versus measured; writing up results like a scientist.",
       story="A tape measure, a phone and a notebook turn a parking lot into a physics lab"),
  dict(n=36, title="Plan a Skatepark for Your Town", strand="Community",
       topics="how skateparks get built: community meetings, design firms, budgets, city councils; street plaza versus bowl; inclusion for beginners, girls and women, and adaptive riders; safety, lighting and noise; examples of skater-led parks; writing a proposal with evidence.",
       story="A sketch on a napkin becomes a set of drawings in front of a city council"),
 ]),
]

LINKS = {
 1: [],
 2: [],
 3: [],
 4: [("/sports", "Sports History")],
 5: [],
 6: [],
 7: [],
 8: [],
 9: [],
 10: [("/sports", "Sports History")],
 11: [],
 12: [("/skate#flip", "Skate Lab: Spin")],
 13: [("/sports", "Sports History")],
 14: [],
 15: [("/skate#flip", "Skate Lab: Flip tricks")],
 16: [("/sports", "Sports History")],
 17: [],
 18: [("/skate#ramp", "Skate Lab: Ramp design")],
}
