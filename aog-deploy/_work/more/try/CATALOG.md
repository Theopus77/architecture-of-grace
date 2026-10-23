# Try it: the lab moments a lesson may open (AOG-TRY-V1, 2026-10-23)

A lesson's "Try it" button opens ONE exact moment in a lab on this site. Use only the addresses below, exactly as
written. English label first, Spanish second (use them for `en` and `es`, adding a verb: "Look at onion cells under the
microscope" / "Mira células de cebolla en el microscopio").

## The Telescope — /telescope?target=<id>
moon Moon/Luna · jupiter Jupiter/Júpiter · saturn Saturn/Saturno · mars Mars/Marte · venus Venus/Venus · uranus Uranus/Urano ·
orion Orion Nebula/Nebulosa de Orión · pleiades Pleiades/Pléyades · dcluster Double Cluster/Cúmulo Doble ·
andromeda Andromeda Galaxy/Galaxia de Andrómeda · m13 M13 star cluster/Cúmulo M13 · ring Ring Nebula/Nebulosa del Anillo ·
m27 Dumbbell Nebula/Nebulosa Dumbbell · mizar Mizar and Alcor (a double star)/Mizar y Alcor · albireo Albireo (a colored double star)/Albireo ·
sun Sun, with a safe solar filter/Sol, con filtro solar seguro
Also: /telescope (the whole lab), /telescope-lessons (its lessons).

## The Microscope Lab — /microscope?slide=<id>
e Letter e/Letra e · onion Onion skin cells/Epidermis de cebolla · pond Pond water (tiny living things)/Agua de estanque ·
blood Blood smear/Frotis de sangre · cheek Cheek cells/Células de la mejilla · hair Human hair/Cabello humano ·
elodea Elodea leaf (chloroplasts)/Hoja de elodea · bact Bacteria smear/Frotis de bacterias · virus Virus? (too small to see)/¿Virus? ·
pollen Pollen/Polen · wing Butterfly wing scales/Ala de mariposa · leaf Leaf peel (stomata)/Piel de hoja (estomas) ·
diatom Diatoms/Diatomeas · papyrus Papyrus with ink/Papiro con tinta · scroll Parchment scroll fragment/Fragmento de rollo (pergamino) ·
tablet Clay tablet (cuneiform)/Tablilla de arcilla (cuneiforme) · crystal Salt and sugar crystals/Sal y azúcar ·
hairs Leaf hairs/Pelos de hoja · dog Dog hair and a tick/Pelo de perro y garrapata · section Leaf cross-section/Corte de hoja ·
fly Fly wing/Ala de mosca · fern Fern spore capsules/Cápsulas de esporas de helecho · fabric Cotton and polyester cloth/Tela: algodón y poliéster ·
dna DNA (extracted, a stringy goo)/ADN extraído · sand Beach sand/Arena de playa · yeast Baker's yeast/Levadura de pan ·
scale Stage micrometer (measuring tiny things)/Micrómetro de platina
Also: /microscope (the whole lab), /microscope-lessons.

## The Oscilloscope — /waves?l=<N>#lessons (one lesson on the scope)
1 Power and a trace · 2 The grid: divisions · 3 Volts per division · 4 Time per division · 5 Frequency from the period ·
6 Sine, square, triangle, saw · 7 The trigger · 8 Two channels · 9 Phase · 10 Amplitude and loudness ·
11 Harmonics: a square is many sines · 12 Measure a pulse · 13 Noise and averaging · 14 AC and DC coupling ·
15 The 10× probe · 16 Design a measurement
Also: /waves (the whole lab).

## The Dojo (3D moves) — /dojo#<id>
ready, horse, front-stance, back-stance, cat-stance, guard, step-forward, step-back, shuffle, pivot, jab, cross, hook,
uppercut, reverse-punch, palm-strike, knife-hand, high-block, low-block, inside-block, outside-block, knee-raise,
front-kick, teep, roundhouse-kick, side-kick, back-kick, back-fall, side-fall, sprawl, ginga, en-garde, lunge,
combo-jab-cross, combo-block-punch, form-1. (Only for lessons about that move or its art; safe, solo, into the air.)

## The 3D Kitchen — /kitchen-lab#<recipe> or /kitchen-lab#skill-<id>
Recipes: fruit-salad, yogurt-parfait, scrambled-eggs, pancakes, veggie-stir-fry, tomato-pasta, vinaigrette (an emulsion),
quick-bread (muffins), pizza-dough (kneading).
Skills: wash-hands, tie-hair, measure-dry, measure-liquid, crack-egg, whisk, stir, fold, pour, chop, slice, dice, mince,
peel, grate, knead, roll-dough, spread, season, flip, saute, boil, simmer, bake, check-temp (food thermometer), plate,
wipe-clean, wash-dishes.

## The 3D Sewing Room — /sewing-lab#<id>
thread-needle, tie-knot, running-stitch, backstitch, whipstitch, slip-stitch, blanket-stitch, sew-button, tie-off,
pin-pattern, cut-fabric, mark-fabric, machine-parts, wind-bobbin, thread-machine, straight-seam, backstitch-machine,
pivot-corner, seam-allowance, press-seam.

## The Recording Studio rooms
/drum-machine (rhythm, beats, patterns in time) · /piano (notes, scales, chords, melody) · /guitar · /bass · /band ·
/turntables · /mixing-desk (sound, layers, volume) · /piano-lessons · /guitar-lessons · /bass-lessons

## Other
/cube (the Cube Lab: patterns, permutations, algorithms, 3D shapes) · /drops/foundry (Word Foundry: word parts)

## Picker's job
You get one or more courses. Their lessons are listed in `_work/more/threads/index_<group>.txt`, one per line:
`course|unit|lesson id|band|title — main idea`. Read every line for your courses.
For each lesson where ONE address above shows exactly what the lesson teaches, so a learner who taps it sees the
lesson come alive, pick it. Strong fits only; most lessons get none. Never force a fit. Lab moments that would be
unsafe or confusing for the band are out (the Dojo only for lessons about that move, solo into the air; the stove and
knives for grades 3 and up with a grown-up).
Write `_work/more/try/<course>.json` per course (keep any entries already in it):
{"<unit>:<lesson id>": {"href": "/microscope?slide=onion", "en": "Look at onion cells under the microscope", "es": "Mira células de cebolla en el microscopio"}}
`en`/`es`: a short plain invitation (≤ 9 words), starting with a verb. Check the JSON loads with python.
Reply with one line per course: how many picks.
