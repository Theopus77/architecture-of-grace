/* The Kitchen Lab's words and recipes (AOG-KITCHEN-RECIPES-V1, 2026-10-12)
   Jimmy: "Could we not take this amazement to FACS for cooking and sewing lessons? Have this person cook recipes by
   preloaded or the viewer plugs it in."
   · ACTIONS   every kitchen skill (ids fixed by the 3D contract), with how to do it and one safety habit, in English and Spanish
   · TOOLS     the tools a step puts in the cook's hands
   · RECIPES   nine real recipes for a school or home kitchen, allergens named
   · read()    the recipe reader: pasted or typed text (English or Spanish) becomes ingredients and steps, on this device.
               No outside service. Quantities with fractions (1 1/2, ½, 1,5), units (cup, tbsp, taza, cucharada …),
               cooking verbs (chop, bake, picar, hornear …) become the skills the cook shows.
   · scale()   ½×, 1×, 2×, 3×; amounts shown with kitchen fractions.
   Works in the page (window.AOGKitchenRecipes) and in Node (require) for tools/check-kitchen.js. */
(function (root) {
"use strict";

/* ── the skills ── at: where the cook stands (sink, board, stove, oven); secs: how long the demo plays at Normal speed;
   clock: what the clock shows (a demo never runs in real time) */
const ACTIONS = {
  "wash-hands": { at: "sink", secs: 11, tools: ["soap", "towel"], clock: { sec: 20 },
    en: { n: "Wash your hands", how: ["Wet your hands with clean running water.", "Add soap and rub it into a lather.", "Scrub for 20 seconds: palms, backs, between the fingers, thumbs and under the nails.", "Rinse well under the water.", "Dry with a clean towel."], safe: "Wash again after you touch raw egg or raw meat." },
    es: { n: "Lávate las manos", how: ["Moja las manos con agua limpia que corre.", "Pon jabón y frótalo hasta hacer espuma.", "Frota 20 segundos: palmas, dorso, entre los dedos, pulgares y debajo de las uñas.", "Enjuaga bien con el agua.", "Seca con una toalla limpia."], safe: "Lávalas otra vez después de tocar huevo crudo o carne cruda." } },
  "tie-hair": { at: "board", secs: 6, tools: ["cap"],
    en: { n: "Tie your hair back", how: ["Pull long hair back and tie it.", "Put on a cap.", "Push your sleeves up.", "Put on a clean apron."], safe: "Hair stays out of the food and away from the stove." },
    es: { n: "Recógete el pelo", how: ["Lleva el pelo largo hacia atrás y átalo.", "Ponte una gorra.", "Sube las mangas.", "Ponte un delantal limpio."], safe: "El pelo se queda lejos de la comida y de la estufa." } },
  "measure-dry": { at: "board", secs: 7, tools: ["cups", "straight"],
    en: { n: "Measure dry food", how: ["Spoon it into the cup. Do not press it down.", "Fill it a little over the top.", "Sweep a straight edge across the top to level it.", "Tip it into the bowl."], safe: "Measure over a plate, so extra does not fall into the bowl." },
    es: { n: "Medir ingredientes secos", how: ["Échalo a la taza con una cuchara. No lo aprietes.", "Llénala un poco por encima del borde.", "Pasa un borde recto por arriba para nivelar.", "Viértelo en el tazón."], safe: "Mide sobre un plato, así lo que sobra no cae en el tazón." } },
  "measure-liquid": { at: "board", secs: 7, tools: ["jug"],
    en: { n: "Measure liquid", how: ["Set the measuring cup flat on the counter.", "Pour slowly up to the line.", "Bend down so your eyes are level with the line.", "Add a little more, or pour a little out."], safe: "Wipe up spills right away so no one slips." },
    es: { n: "Medir líquidos", how: ["Pon la taza medidora plana sobre la mesa.", "Vierte despacio hasta la línea.", "Agáchate para que tus ojos queden a la altura de la línea.", "Añade un poco más o quita un poco."], safe: "Limpia lo que se derrame enseguida para que nadie resbale." } },
  "crack-egg": { at: "board", secs: 7, tools: ["bowl"],
    en: { n: "Crack an egg", how: ["Tap the egg on the flat counter, not on the bowl's edge.", "Put both thumbs in the crack.", "Pull the shell apart over a small bowl.", "Look for bits of shell. Lift them out with a big piece of shell.", "Wash your hands after."], safe: "Raw egg can carry germs. Wash your hands and the counter after." },
    es: { n: "Romper un huevo", how: ["Golpea el huevo sobre la mesa plana, no en el borde del tazón.", "Mete los dos pulgares en la grieta.", "Abre la cáscara sobre un tazón pequeño.", "Busca pedacitos de cáscara. Sácalos con un pedazo grande de cáscara.", "Lávate las manos después."], safe: "El huevo crudo puede tener gérmenes. Lava tus manos y la mesa después." } },
  "whisk": { at: "board", secs: 7, tools: ["bowl", "whisk"],
    en: { n: "Whisk", how: ["Tilt the bowl a little toward you.", "Hold it steady with your other hand.", "Move the whisk in quick circles through the bottom.", "Keep going until it looks smooth."], safe: "A damp towel under the bowl stops it from sliding." },
    es: { n: "Batir", how: ["Inclina un poco el tazón hacia ti.", "Sujétalo con la otra mano.", "Mueve el batidor en círculos rápidos por el fondo.", "Sigue hasta que se vea liso."], safe: "Un trapo húmedo debajo del tazón evita que se deslice." } },
  "stir": { at: "board", secs: 6, tools: ["bowl", "spoon"],
    en: { n: "Stir", how: ["Hold the bowl or the pot handle.", "Stir in slow circles.", "Scrape the sides and the bottom."], safe: "Turn pot handles in, away from the edge." },
    es: { n: "Revolver", how: ["Sujeta el tazón o el mango de la olla.", "Revuelve en círculos lentos.", "Raspa los lados y el fondo."], safe: "Gira los mangos de las ollas hacia dentro, lejos del borde." } },
  "fold": { at: "board", secs: 8, tools: ["bowl", "spatula"],
    en: { n: "Fold", how: ["Put the spatula in at the far side of the bowl.", "Scrape across the bottom toward you.", "Lift and turn it over the top.", "Turn the bowl a quarter turn and do it again.", "Stop when no dry flour shows."], safe: "A few lumps are fine. Too much mixing makes it tough." },
    es: { n: "Mezclar envolviendo", how: ["Mete la espátula por el lado lejano del tazón.", "Raspa el fondo hacia ti.", "Levanta y voltea la mezcla por encima.", "Gira el tazón un cuarto de vuelta y repite.", "Para cuando no se vea harina seca."], safe: "Unos grumos están bien. Mezclar de más lo pone duro." } },
  "pour": { at: "board", secs: 6, tools: ["jug", "bowl"],
    en: { n: "Pour", how: ["Hold it with two hands if it is heavy.", "Pour slowly, close to the bowl.", "Pour away from your body when it is hot."], safe: "Pour hot liquids slowly and away from you." },
    es: { n: "Verter", how: ["Sujétalo con dos manos si pesa.", "Vierte despacio, cerca del tazón.", "Vierte lejos de tu cuerpo si está caliente."], safe: "Vierte los líquidos calientes despacio y lejos de ti." } },
  "chop": { at: "board", secs: 8, tools: ["board", "knife"],
    en: { n: "Chop", how: ["Hold the food with a claw: fingertips tucked under, knuckles toward the blade.", "Keep the knife tip on the board.", "Rock the knife down and forward.", "Move your claw back a little after each cut."], safe: "Put the flat side of the food down so it cannot roll." },
    es: { n: "Picar", how: ["Sujeta la comida con la mano en garra: puntas de los dedos dobladas, nudillos hacia la hoja.", "Deja la punta del cuchillo sobre la tabla.", "Mece el cuchillo hacia abajo y hacia adelante.", "Mueve la garra un poco hacia atrás después de cada corte."], safe: "Pon el lado plano de la comida abajo para que no ruede." } },
  "slice": { at: "board", secs: 8, tools: ["board", "knife"],
    en: { n: "Slice", how: ["Put the flat side down.", "Hold it with the claw grip.", "Push the knife forward and down in one smooth stroke.", "Make each slice the same thickness."], safe: "Go slowly. A sharp knife and a steady claw are safest." },
    es: { n: "Rebanar", how: ["Pon el lado plano abajo.", "Sujeta con la mano en garra.", "Empuja el cuchillo hacia adelante y abajo en un solo movimiento.", "Haz cada rebanada del mismo grosor."], safe: "Ve despacio. Un cuchillo con filo y una garra firme son lo más seguro." } },
  "dice": { at: "board", secs: 9, tools: ["board", "knife"],
    en: { n: "Dice", how: ["Cut slices first.", "Cut the slices into sticks.", "Turn the sticks and cut across into cubes.", "Keep the cubes the same size so they cook evenly."], safe: "Use the claw grip for every cut." },
    es: { n: "Cortar en cubos", how: ["Primero corta rebanadas.", "Corta las rebanadas en tiras.", "Gira las tiras y córtalas en cubos.", "Haz los cubos del mismo tamaño para que se cocinen igual."], safe: "Usa la mano en garra en cada corte." } },
  "mince": { at: "board", secs: 8, tools: ["board", "knife"],
    en: { n: "Mince", how: ["Chop the food small first.", "Rest your other hand flat on top of the blade's back edge.", "Rock the knife back and forth across the pile.", "Scrape the pile together and rock again until very fine."], safe: "Your flat hand stays on top of the blade, never in front of it." },
    es: { n: "Picar fino", how: ["Primero pica la comida en trozos pequeños.", "Apoya la otra mano plana sobre el lomo de la hoja.", "Mece el cuchillo de un lado a otro sobre el montón.", "Junta el montón y vuelve a mecer hasta que quede muy fino."], safe: "La mano plana va encima de la hoja, nunca delante." } },
  "peel": { at: "board", secs: 7, tools: ["peeler"],
    en: { n: "Peel", how: ["Hold the food in one hand.", "Peel away from your body in long strokes.", "Turn the food as you go."], safe: "Peel away from you. Fingers stay behind the blade." },
    es: { n: "Pelar", how: ["Sujeta la comida con una mano.", "Pela hacia afuera, lejos de tu cuerpo, en tiras largas.", "Gira la comida mientras pelas."], safe: "Pela lejos de ti. Los dedos quedan detrás de la cuchilla." } },
  "grate": { at: "board", secs: 7, tools: ["grater"],
    en: { n: "Grate", how: ["Stand the grater on a plate or board.", "Hold the handle at the top.", "Push the food down across the holes.", "Stop when the piece gets small."], safe: "Keep the last small piece. Fingers stay off the holes." },
    es: { n: "Rallar", how: ["Para el rallador sobre un plato o una tabla.", "Sujeta el mango de arriba.", "Pasa la comida hacia abajo por los agujeros.", "Para cuando el pedazo quede pequeño."], safe: "Guarda el último pedacito. Los dedos lejos de los agujeros." } },
  "knead": { at: "board", secs: 9, tools: [],
    en: { n: "Knead", how: ["Push the dough away with the heel of your hand.", "Fold it back over itself.", "Turn it a quarter turn.", "Do it again until it is smooth and springs back."], safe: "Dust the counter with a little flour so the dough does not stick." },
    es: { n: "Amasar", how: ["Empuja la masa con la base de la mano.", "Dóblala sobre sí misma.", "Gírala un cuarto de vuelta.", "Repite hasta que esté lisa y regrese al apretarla."], safe: "Echa un poco de harina en la mesa para que la masa no se pegue." } },
  "roll-dough": { at: "board", secs: 8, tools: ["pin"],
    en: { n: "Roll out dough", how: ["Dust the counter and the rolling pin with flour.", "Roll from the middle out.", "Turn the dough a quarter turn.", "Keep going until it is even all over."], safe: "Light pressure. Let the pin do the work." },
    es: { n: "Estirar la masa", how: ["Echa harina en la mesa y en el rodillo.", "Rueda desde el centro hacia afuera.", "Gira la masa un cuarto de vuelta.", "Sigue hasta que quede pareja."], safe: "Aprieta poco. Deja que el rodillo trabaje." } },
  "spread": { at: "board", secs: 6, tools: ["spoon"],
    en: { n: "Spread", how: ["Spoon it into the middle.", "Spread it outward in circles with the back of the spoon.", "Leave a little border at the edge."], safe: "Go slowly so it stays on the food." },
    es: { n: "Untar", how: ["Pon una cucharada en el centro.", "Extiéndela en círculos con el dorso de la cuchara.", "Deja un borde pequeño en la orilla."], safe: "Ve despacio para que se quede sobre la comida." } },
  "season": { at: "board", secs: 5, tools: [],
    en: { n: "Season", how: ["Take a pinch between your fingers.", "Sprinkle from a little higher up so it spreads evenly.", "Taste with a clean spoon."], safe: "Use a new spoon for each taste, never the stirring spoon." },
    es: { n: "Sazonar", how: ["Toma una pizca entre los dedos.", "Espolvorea desde un poco más alto para que se reparta.", "Prueba con una cuchara limpia."], safe: "Usa una cuchara nueva para cada prueba, nunca la de revolver." } },
  "flip": { at: "stove", secs: 7, tools: ["pan", "turner"],
    en: { n: "Flip", how: ["Wait until bubbles pop and the edges look dry.", "Slide the turner all the way under.", "Lift and turn it over quickly, close to the pan.", "Cook the other side until golden."], safe: "Hold the pan handle with your other hand. A grown-up at the stove for children." },
    es: { n: "Voltear", how: ["Espera a que las burbujas revienten y las orillas se vean secas.", "Mete la espátula plana por completo debajo.", "Levanta y voltea rápido, cerca del sartén.", "Cocina el otro lado hasta que esté dorado."], safe: "Sujeta el mango del sartén con la otra mano. Un adulto en la estufa con los niños." } },
  "saute": { at: "stove", secs: 8, tools: ["pan", "spatula"],
    en: { n: "Sauté", how: ["Heat the pan over medium heat.", "Add a little oil.", "Add the food in one layer, away from you.", "Keep it moving with a spatula."], safe: "Add food away from you so hot oil cannot splash toward you. Handles turned in." },
    es: { n: "Saltear", how: ["Calienta el sartén a fuego medio.", "Pon un poco de aceite.", "Añade la comida en una sola capa, lejos de ti.", "Muévela con una espátula."], safe: "Pon la comida lejos de ti para que el aceite no salpique hacia ti. Mangos hacia dentro." } },
  "boil": { at: "stove", secs: 7, tools: ["pot", "spoon"],
    en: { n: "Boil", how: ["Fill the pot with water.", "Put the lid on so it heats faster.", "Big bubbles that keep rolling mean it is boiling.", "Lower food in gently with a spoon, not your fingers."], safe: "Lift the lid away from you. Steam is hot." },
    es: { n: "Hervir", how: ["Llena la olla con agua.", "Ponle la tapa para que se caliente más rápido.", "Burbujas grandes que no paran quieren decir que hierve.", "Mete la comida con cuidado con una cuchara, no con los dedos."], safe: "Levanta la tapa lejos de ti. El vapor quema." } },
  "simmer": { at: "stove", secs: 7, tools: ["pot", "spoon"],
    en: { n: "Simmer", how: ["Turn the heat down.", "Look for small, gentle bubbles.", "Stir now and then.", "Leave the lid a little open."], safe: "Keep the pot handle turned in." },
    es: { n: "Cocinar a fuego lento", how: ["Baja el fuego.", "Busca burbujas pequeñas y suaves.", "Revuelve de vez en cuando.", "Deja la tapa un poco abierta."], safe: "Deja el mango de la olla hacia dentro." } },
  "bake": { at: "oven", secs: 10, tools: ["mitts", "tray"],
    en: { n: "Bake", how: ["Heat the oven first.", "Put on oven mitts, both hands.", "Open the door and pull the rack out a little.", "Set the pan on the rack. Push it in. Close the door.", "Use the mitts again to take it out."], safe: "Oven mitts on both hands. Pull the rack out; never reach in. A grown-up at the oven for children." },
    es: { n: "Hornear", how: ["Calienta el horno primero.", "Ponte guantes de horno en las dos manos.", "Abre la puerta y saca un poco la rejilla.", "Pon el molde en la rejilla. Empújala. Cierra la puerta.", "Usa los guantes otra vez para sacarlo."], safe: "Guantes de horno en las dos manos. Saca la rejilla; nunca metas el brazo. Un adulto en el horno con los niños." } },
  "check-temp": { at: "stove", secs: 7, tools: ["thermo"],
    en: { n: "Check the temperature", how: ["Push the thermometer tip into the thickest part.", "Do not touch the pan with the tip.", "Wait until the number stops moving.", "Eggs and chicken: 165 °F (74 °C). Ground meat: 160 °F (71 °C).", "Wash the tip after."], safe: "Color does not tell you it is safe. The thermometer does." },
    es: { n: "Medir la temperatura", how: ["Mete la punta del termómetro en la parte más gruesa.", "No toques el sartén con la punta.", "Espera a que el número deje de moverse.", "Huevos y pollo: 165 °F (74 °C). Carne molida: 160 °F (71 °C).", "Lava la punta después."], safe: "El color no dice si es seguro. El termómetro sí." } },
  "plate": { at: "board", secs: 6, tools: ["plate", "spoon"],
    en: { n: "Plate and serve", how: ["Put the main food in the middle of the plate.", "Add the rest beside it.", "Wipe the edge of the plate clean.", "Serve it while it is fresh."], safe: "Use a clean plate, never the one that held raw food." },
    es: { n: "Servir", how: ["Pon la comida principal en el centro del plato.", "Añade lo demás al lado.", "Limpia la orilla del plato.", "Sírvelo fresco."], safe: "Usa un plato limpio, nunca el que tuvo comida cruda." } },
  "wipe-clean": { at: "board", secs: 6, tools: ["cloth"],
    en: { n: "Wipe the counter", how: ["Clear the counter.", "Wipe with a soapy cloth.", "Wipe from the clean side toward the messy side.", "Wipe again after raw egg or meat."], safe: "Clean as you go. A clean counter keeps germs away." },
    es: { n: "Limpiar la mesa", how: ["Despeja la mesa.", "Limpia con un trapo con jabón.", "Limpia del lado limpio hacia el lado sucio.", "Limpia otra vez después de huevo o carne cruda."], safe: "Limpia mientras cocinas. Una mesa limpia aleja los gérmenes." } },
  "wash-dishes": { at: "sink", secs: 8, tools: ["sponge"],
    en: { n: "Wash the dishes", how: ["Scrape food into the trash.", "Wash in hot, soapy water, cleanest dishes first.", "Wash knives one at a time. Never leave them hidden in the water.", "Rinse, then let them dry in a rack."], safe: "Never drop a knife into soapy water where no one can see it." },
    es: { n: "Lavar los trastes", how: ["Tira los restos de comida a la basura.", "Lava con agua caliente y jabón, primero lo más limpio.", "Lava los cuchillos de uno en uno. Nunca los dejes escondidos en el agua.", "Enjuaga y déjalos secar en un escurridor."], safe: "Nunca dejes un cuchillo en agua con jabón donde nadie lo ve." } },
  /* two more the recipes use: rinsing fruit and vegetables, and the calm stand-in for a step the reader cannot picture */
  "rinse": { at: "sink", secs: 7, tools: ["colander"], extra: true,
    en: { n: "Rinse fruit and vegetables", how: ["Hold them under cool running water.", "Rub them gently with your hands.", "No soap.", "Pat dry with a clean towel."], safe: "Rinse even fruit you will peel, so germs do not ride in on the knife." },
    es: { n: "Enjuagar frutas y verduras", how: ["Ponlas bajo agua fresca que corre.", "Frótalas suave con las manos.", "Sin jabón.", "Sécalas con una toalla limpia."], safe: "Enjuaga también la fruta que vas a pelar, para que el cuchillo no lleve gérmenes." } },
  "counter": { at: "board", secs: 5, tools: [], extra: true,
    en: { n: "Work at the counter", how: ["Read the words of this step.", "Do it slowly, one part at a time."], safe: "Ask a grown-up if you are not sure." },
    es: { n: "Trabajar en la mesa", how: ["Lee las palabras de este paso.", "Hazlo despacio, una parte a la vez."], safe: "Pregunta a un adulto si no estás seguro." } }
};
const SKILLS = ["wash-hands", "tie-hair", "measure-dry", "measure-liquid", "crack-egg", "whisk", "stir", "fold", "pour", "chop", "slice", "dice", "mince", "peel", "grate",
  "knead", "roll-dough", "spread", "season", "flip", "saute", "boil", "simmer", "bake", "check-temp", "plate", "wipe-clean", "wash-dishes", "rinse"];

const TOOLS = {
  soap: ["Soap", "Jabón"], towel: ["Clean towel", "Toalla limpia"], cap: ["Cap or hair tie", "Gorra o liga"], cups: ["Dry measuring cups", "Tazas medidoras para secos"],
  straight: ["Straight edge (a table knife)", "Borde recto (un cuchillo de mesa)"], jug: ["Liquid measuring cup", "Taza medidora para líquidos"], spoons: ["Measuring spoons", "Cucharas medidoras"],
  bowl: ["Mixing bowl", "Tazón"], smallbowl: ["Small bowl", "Tazón pequeño"], whisk: ["Whisk", "Batidor"], spoon: ["Wooden spoon", "Cuchara de madera"], spatula: ["Silicone spatula", "Espátula de silicón"],
  board: ["Cutting board", "Tabla de picar"], knife: ["Chef's knife", "Cuchillo de chef"], peeler: ["Peeler", "Pelador"], grater: ["Box grater", "Rallador"],
  pin: ["Rolling pin", "Rodillo"], pan: ["Frying pan", "Sartén"], pot: ["Pot with a lid", "Olla con tapa"], turner: ["Turner (flat spatula)", "Espátula plana"],
  colander: ["Colander", "Colador"], tray: ["Baking sheet", "Bandeja para hornear"], tin: ["Muffin tin with paper cups", "Molde para muffins con capacillos"],
  mitts: ["Oven mitts", "Guantes de horno"], thermo: ["Food thermometer", "Termómetro de cocina"], plate: ["Plates or bowls", "Platos o tazones"],
  cloth: ["Dishcloth", "Trapo de cocina"], sponge: ["Sponge and dish soap", "Esponja y jabón para trastes"], glass: ["Clear glasses or cups", "Vasos transparentes"], jar: ["Jar with a lid", "Frasco con tapa"],
  ladle: ["Ladle", "Cucharón"], cloth2: ["Clean cloth to cover", "Trapo limpio para tapar"]
};

const ALLERGENS = {
  milk: ["Milk", "Leche"], egg: ["Egg", "Huevo"], wheat: ["Wheat (gluten)", "Trigo (gluten)"], soy: ["Soy", "Soya"], peanut: ["Peanuts", "Cacahuates"],
  treenut: ["Tree nuts", "Nueces"], fish: ["Fish", "Pescado"], shellfish: ["Shellfish", "Mariscos"], sesame: ["Sesame", "Ajonjolí"], mustard: ["Mustard", "Mostaza"]
};

/* ── units: id → [English one, English many, Spanish one, Spanish many, US (true) or metric] ── */
const UNITS = {
  cup: ["cup", "cups", "taza", "tazas", 1], tbsp: ["tbsp", "tbsp", "cucharada", "cucharadas", 1], tsp: ["tsp", "tsp", "cucharadita", "cucharaditas", 1],
  oz: ["oz", "oz", "onza", "onzas", 1], floz: ["fl oz", "fl oz", "onza líquida", "onzas líquidas", 1], lb: ["lb", "lb", "libra", "libras", 1],
  g: ["g", "g", "g", "g", 0], kg: ["kg", "kg", "kg", "kg", 0], ml: ["mL", "mL", "mL", "mL", 0], l: ["L", "L", "L", "L", 0],
  pinch: ["pinch", "pinches", "pizca", "pizcas", 1], clove: ["clove", "cloves", "diente", "dientes", 1], can: ["can", "cans", "lata", "latas", 1],
  slice: ["slice", "slices", "rebanada", "rebanadas", 1], stick: ["stick", "sticks", "barra", "barras", 1], packet: ["packet", "packets", "sobre", "sobres", 1],
  handful: ["handful", "handfuls", "puñado", "puñados", 1], qt: ["quart", "quarts", "cuarto de galón", "cuartos de galón", 1], pint: ["pint", "pints", "pinta", "pintas", 1],
  "": ["", "", "", "", 1]
};

/* ── the recipes ── an ingredient: k (its key in the steps), q and u (US amount), m (metric), en/es (name), item (how it looks
   in 3D), alg (allergens). A step: a (skills in order), tools, ing (ingredient keys), en/es (what to do), timer (shown on a
   clock, never played in real time), temp. */
const I = (k, q, u, m, en, es, item, alg) => ({ k, q, u, m, en, es, item: item || k, alg: alg || [] });
const S = (a, tools, ing, en, es, extra) => Object.assign({ a, tools, ing, en, es }, extra || {});
const WASH = S(["wash-hands", "tie-hair"], ["soap", "towel", "cap"], [], "Wash your hands for 20 seconds. Tie your hair back.", "Lávate las manos 20 segundos. Recógete el pelo.");
const RECIPES = [
  { id: "fruit-salad", serves: 4, minutes: 15, level: 1,
    en: { n: "Fruit salad", about: "Cut fruit, a squeeze of lemon, a gentle mix. No stove." }, es: { n: "Ensalada de frutas", about: "Fruta cortada, un poco de limón y una mezcla suave. Sin estufa." },
    tools: ["board", "knife", "bowl", "spatula", "jug", "spoons", "plate"],
    ing: [I("strawberry", 1, "cup", [150, "g"], "strawberries", "fresas"), I("banana", 2, "", null, "bananas", "plátanos"), I("apple", 1, "", null, "apple", "manzana"),
          I("grape", 1, "cup", [150, "g"], "grapes", "uvas"), I("lemon", 1, "tbsp", [15, "ml"], "lemon juice", "jugo de limón", "lemonjuice"),
          I("honey", 1, "tbsp", [15, "ml"], "honey (not for babies under 1)", "miel (no para bebés menores de 1 año)")],
    steps: [WASH,
      S(["rinse"], ["colander"], ["strawberry", "apple", "grape"], "Rinse the fruit under cool running water.", "Enjuaga la fruta con agua fresca que corre."),
      S(["chop"], ["board", "knife"], ["strawberry"], "Cut the green tops off the strawberries. Cut each one in half.", "Quita las hojas verdes a las fresas. Corta cada una a la mitad."),
      S(["peel", "slice"], ["board", "knife"], ["banana"], "Peel the bananas. Slice them into coins.", "Pela los plátanos. Córtalos en rodajas."),
      S(["dice"], ["board", "knife"], ["apple"], "Cut the apple away from the core. Dice it into small cubes.", "Corta la manzana alrededor del corazón. Córtala en cubos pequeños."),
      S(["measure-liquid", "pour"], ["jug", "bowl"], ["lemon", "honey"], "Measure the lemon juice and honey. Pour them over the fruit. Lemon keeps the apple and banana from turning brown.", "Mide el jugo de limón y la miel. Viértelos sobre la fruta. El limón evita que la manzana y el plátano se pongan cafés."),
      S(["fold"], ["bowl", "spatula"], ["strawberry", "banana", "apple", "grape"], "Fold gently with a spatula so the fruit stays whole.", "Mezcla suave con la espátula para que la fruta no se deshaga."),
      S(["plate"], ["plate", "spoon"], [], "Spoon into bowls. Serve cold.", "Sirve en tazones. Sírvela fría."),
      S(["wipe-clean"], ["cloth"], [], "Wipe the counter and the board.", "Limpia la mesa y la tabla.")] },
  { id: "yogurt-parfait", serves: 2, minutes: 10, level: 1,
    en: { n: "Yogurt parfait", about: "Layers of yogurt, fruit and granola in a clear glass." }, es: { n: "Parfait de yogur", about: "Capas de yogur, fruta y granola en un vaso transparente." },
    tools: ["board", "knife", "cups", "straight", "spoon", "glass", "spoons"],
    ing: [I("yogurt", 2, "cup", [480, "g"], "plain yogurt", "yogur natural", "yogurt", ["milk"]), I("granola", 1, "cup", [120, "g"], "granola (check the label for nuts and wheat)", "granola (revisa la etiqueta por nueces y trigo)", "granola", ["wheat", "treenut"]),
          I("strawberry", 1, "cup", [150, "g"], "strawberries", "fresas"), I("blueberry", 0.5, "cup", [75, "g"], "blueberries", "arándanos"), I("honey", 2, "tsp", [10, "ml"], "honey (not for babies under 1)", "miel (no para bebés menores de 1 año)")],
    steps: [WASH,
      S(["rinse"], ["colander"], ["strawberry", "blueberry"], "Rinse the berries in a colander.", "Enjuaga las moras en un colador."),
      S(["slice"], ["board", "knife"], ["strawberry"], "Slice the strawberries.", "Rebana las fresas."),
      S(["measure-dry"], ["cups", "straight"], ["granola"], "Measure the granola. Level the cup.", "Mide la granola. Nivela la taza."),
      S(["plate"], ["glass", "spoon"], ["yogurt", "strawberry", "blueberry", "granola"], "Layer it: yogurt, fruit, granola. Then do it again.", "Haz capas: yogur, fruta, granola. Luego otra vez."),
      S(["pour"], ["spoons"], ["honey"], "Drizzle a little honey on top. Eat it right away so the granola stays crunchy.", "Pon un chorrito de miel encima. Cómelo enseguida para que la granola siga crujiente."),
      S(["wipe-clean"], ["cloth"], [], "Wipe the counter.", "Limpia la mesa.")] },
  { id: "scrambled-eggs", serves: 2, minutes: 10, level: 2,
    en: { n: "Scrambled eggs", about: "Soft eggs on low heat, cooked to a safe 165 °F." }, es: { n: "Huevos revueltos", about: "Huevos suaves a fuego bajo, cocidos hasta 165 °F seguros." },
    tools: ["bowl", "whisk", "jug", "pan", "spatula", "thermo", "plate"],
    ing: [I("egg", 4, "", null, "eggs", "huevos", "egg", ["egg"]), I("milk", 2, "tbsp", [30, "ml"], "milk", "leche", "milk", ["milk"]), I("butter", 1, "tsp", [5, "g"], "butter", "mantequilla", "butter", ["milk"]),
          I("salt", 1, "pinch", null, "salt", "sal"), I("pepper", 1, "pinch", null, "black pepper", "pimienta negra")],
    steps: [WASH,
      S(["crack-egg"], ["bowl"], ["egg"], "Crack the eggs on the flat counter, one at a time, into a bowl. Lift out any shell. Wash your hands.", "Rompe los huevos sobre la mesa plana, uno a la vez, en un tazón. Saca la cáscara. Lávate las manos."),
      S(["measure-liquid", "pour"], ["jug", "bowl"], ["milk"], "Measure the milk. Pour it in.", "Mide la leche. Viértela."),
      S(["whisk"], ["bowl", "whisk"], ["egg", "milk"], "Whisk until the yellow and white are one color.", "Bate hasta que la yema y la clara sean de un solo color."),
      S(["season"], [], ["salt", "pepper"], "Add a pinch of salt and pepper.", "Añade una pizca de sal y pimienta."),
      S(["saute"], ["pan", "spatula"], ["butter"], "Melt the butter in the pan on medium-low heat. Turn the handle in.", "Derrite la mantequilla en el sartén a fuego medio bajo. Gira el mango hacia dentro."),
      S(["pour", "stir"], ["pan", "spatula"], ["egg"], "Pour in the eggs. Push them slowly across the pan with the spatula, about 3 minutes.", "Vierte los huevos. Empújalos despacio por el sartén con la espátula, unos 3 minutos.", { timer: { min: 3 } }),
      S(["check-temp"], ["thermo"], ["egg"], "Check them: 165 °F (74 °C). They look soft and set, with no runny parts.", "Revísalos: 165 °F (74 °C). Se ven suaves y firmes, sin partes líquidas.", { temp: { f: 165, c: 74 } }),
      S(["plate"], ["plate"], [], "Slide them onto a plate. Turn off the stove.", "Pásalos a un plato. Apaga la estufa."),
      S(["wash-dishes"], ["sponge"], [], "Wash the bowl, whisk and pan.", "Lava el tazón, el batidor y el sartén.")] },
  { id: "pancakes", serves: 4, minutes: 25, level: 2,
    en: { n: "Pancakes", about: "Mix dry, mix wet, fold together, then flip when the bubbles pop." }, es: { n: "Panqueques", about: "Mezcla lo seco, mezcla lo líquido, únelos y voltea cuando revienten las burbujas." },
    tools: ["cups", "straight", "spoons", "bowl", "smallbowl", "whisk", "jug", "spatula", "pan", "turner", "plate"],
    ing: [I("flour", 1.5, "cup", [190, "g"], "all-purpose flour", "harina de trigo", "flour", ["wheat"]), I("bp", 3.5, "tsp", [14, "g"], "baking powder", "polvo para hornear", "powder"),
          I("sugar", 1, "tbsp", [12, "g"], "sugar", "azúcar"), I("salt", 0.25, "tsp", [1, "g"], "salt", "sal"),
          I("milk", 1.25, "cup", [300, "ml"], "milk", "leche", "milk", ["milk"]), I("egg", 1, "", null, "egg", "huevo", "egg", ["egg"]), I("butter", 3, "tbsp", [45, "g"], "butter, melted", "mantequilla derretida", "butter", ["milk"])],
    steps: [WASH,
      S(["measure-dry"], ["cups", "straight"], ["flour"], "Spoon the flour into the cup and level it. Tip it into the big bowl.", "Echa la harina a la taza y nivélala. Ponla en el tazón grande."),
      S(["measure-dry", "whisk"], ["spoons", "whisk", "bowl"], ["bp", "sugar", "salt"], "Add the baking powder, sugar and salt. Whisk the dry things together.", "Añade el polvo para hornear, el azúcar y la sal. Bate lo seco."),
      S(["crack-egg"], ["smallbowl"], ["egg"], "Crack the egg into a small bowl. Wash your hands.", "Rompe el huevo en un tazón pequeño. Lávate las manos."),
      S(["measure-liquid", "whisk"], ["jug", "whisk"], ["milk", "butter", "egg"], "Measure the milk. Whisk it with the egg and melted butter.", "Mide la leche. Bátela con el huevo y la mantequilla derretida."),
      S(["fold"], ["bowl", "spatula"], ["flour", "milk"], "Pour the wet into the dry. Fold just until no dry flour shows. Small lumps are fine.", "Vierte lo líquido en lo seco. Mezcla envolviendo solo hasta que no se vea harina seca. Unos grumos están bien."),
      S(["pour"], ["pan", "jug"], ["flour"], "Heat the pan on medium. Pour in ¼ cup of batter.", "Calienta el sartén a fuego medio. Vierte ¼ de taza de mezcla.", { timer: { min: 2 } }),
      S(["flip"], ["pan", "turner"], [], "When bubbles pop and the edges look dry, flip it. Cook 1 more minute until golden.", "Cuando revienten las burbujas y las orillas se vean secas, voltéalo. Cocina 1 minuto más hasta que esté dorado.", { timer: { min: 1 } }),
      S(["plate"], ["plate", "turner"], [], "Stack them on a plate. Turn off the stove.", "Apílalos en un plato. Apaga la estufa."),
      S(["wipe-clean"], ["cloth"], [], "Wipe up flour and batter drips.", "Limpia la harina y las gotas de mezcla.")] },
  { id: "veggie-stir-fry", serves: 3, minutes: 25, level: 3,
    en: { n: "Veggie stir-fry", about: "Many knife skills, then fast cooking in a hot pan." }, es: { n: "Verduras salteadas", about: "Muchos cortes con cuchillo y luego cocción rápida en un sartén caliente." },
    tools: ["board", "knife", "colander", "pan", "spatula", "spoons", "plate"],
    ing: [I("bellpepper", 1, "", null, "red bell pepper", "pimiento rojo"), I("carrot", 1, "", null, "carrot", "zanahoria"), I("broccoli", 1, "cup", [90, "g"], "broccoli", "brócoli"),
          I("onion", 1, "", null, "small onion", "cebolla pequeña"), I("garlic", 2, "clove", null, "garlic", "ajo"), I("oil", 1, "tbsp", [15, "ml"], "vegetable oil", "aceite vegetal"),
          I("soy", 2, "tbsp", [30, "ml"], "soy sauce (or a soy-free sauce)", "salsa de soya (o una salsa sin soya)", "soy", ["soy", "wheat"]), I("sesame", 1, "tsp", [5, "ml"], "sesame oil (leave out for a sesame allergy)", "aceite de ajonjolí (quítalo si hay alergia)", "oil", ["sesame"]),
          I("rice", 2, "cup", [370, "g"], "cooked rice", "arroz cocido")],
    steps: [WASH,
      S(["rinse"], ["colander"], ["bellpepper", "carrot", "broccoli"], "Rinse the vegetables.", "Enjuaga las verduras."),
      S(["peel"], ["peeler"], ["carrot"], "Peel the carrot, away from you.", "Pela la zanahoria, lejos de ti."),
      S(["slice"], ["board", "knife"], ["carrot"], "Slice the carrot into thin coins.", "Corta la zanahoria en rodajas delgadas."),
      S(["slice"], ["board", "knife"], ["bellpepper"], "Slice the pepper into strips. Flat side down.", "Corta el pimiento en tiras. Lado plano abajo."),
      S(["chop"], ["board", "knife"], ["broccoli"], "Chop the broccoli into small trees.", "Pica el brócoli en arbolitos pequeños."),
      S(["dice"], ["board", "knife"], ["onion"], "Dice the onion.", "Corta la cebolla en cubos."),
      S(["mince"], ["board", "knife"], ["garlic"], "Mince the garlic.", "Pica fino el ajo."),
      S(["saute"], ["pan", "spatula"], ["oil", "onion", "carrot", "broccoli", "bellpepper", "garlic"], "Heat the oil in the pan. Add the vegetables away from you. Keep them moving, 5 to 7 minutes.", "Calienta el aceite. Añade las verduras lejos de ti. Muévelas de 5 a 7 minutos.", { timer: { min: 6 } }),
      S(["season", "stir"], ["spoons", "spatula"], ["soy", "sesame"], "Add the soy sauce and sesame oil. Stir.", "Añade la salsa de soya y el aceite de ajonjolí. Revuelve."),
      S(["plate"], ["plate"], ["rice"], "Serve over rice. Turn off the stove.", "Sirve sobre arroz. Apaga la estufa."),
      S(["wash-dishes"], ["sponge"], [], "Wash the knife by itself, then the rest.", "Lava el cuchillo aparte y luego lo demás.")] },
  { id: "tomato-pasta", serves: 4, minutes: 30, level: 3,
    en: { n: "Tomato pasta", about: "Boil the pasta, simmer a simple sauce, grate cheese on top." }, es: { n: "Pasta con tomate", about: "Hierve la pasta, cocina una salsa sencilla a fuego lento y ralla queso encima." },
    tools: ["pot", "pan", "spoon", "board", "knife", "colander", "grater", "plate"],
    ing: [I("pasta", 8, "oz", [225, "g"], "pasta", "pasta", "pasta", ["wheat"]), I("water", 3, "qt", [3, "l"], "water", "agua"), I("oil", 1, "tbsp", [15, "ml"], "olive oil", "aceite de oliva"),
          I("garlic", 2, "clove", null, "garlic", "ajo"), I("tomato", 1, "can", [400, "g"], "crushed tomatoes (14 oz)", "tomate triturado (400 g)", "tomatosauce"),
          I("salt", 0.5, "tsp", [3, "g"], "salt", "sal"), I("basil", 4, "", null, "basil leaves", "hojas de albahaca"), I("cheese", 0.25, "cup", [25, "g"], "Parmesan cheese", "queso parmesano", "cheese", ["milk"])],
    steps: [WASH,
      S(["boil"], ["pot"], ["water"], "Fill the big pot with water. Put the lid on and bring it to a boil. Turn the handle in.", "Llena la olla grande con agua. Tápala y deja que hierva. Gira el mango hacia dentro.", { timer: { min: 10 } }),
      S(["mince"], ["board", "knife"], ["garlic"], "Mince the garlic.", "Pica fino el ajo."),
      S(["saute"], ["pan", "spoon"], ["oil", "garlic"], "Warm the oil in the pan. Sauté the garlic for 1 minute. Do not let it brown.", "Calienta el aceite en el sartén. Saltea el ajo 1 minuto. Que no se dore.", { timer: { min: 1 } }),
      S(["pour", "simmer"], ["pan", "spoon"], ["tomato", "salt"], "Pour in the tomatoes and salt. Simmer for 10 minutes, stirring now and then.", "Vierte el tomate y la sal. Cocina a fuego lento 10 minutos y revuelve de vez en cuando.", { timer: { min: 10 } }),
      S(["boil", "stir"], ["pot", "spoon"], ["pasta"], "Lower the pasta into the boiling water. Stir. Cook 9 to 11 minutes, until soft but still a little firm.", "Mete la pasta en el agua hirviendo. Revuelve. Cocina de 9 a 11 minutos, hasta que esté suave pero un poco firme.", { timer: { min: 10 } }),
      S(["pour"], ["colander", "mitts"], ["pasta"], "A grown-up drains the pasta into a colander in the sink. Pour away from you; the steam is hot.", "Un adulto escurre la pasta en un colador en el fregadero. Vierte lejos de ti; el vapor quema."),
      S(["stir"], ["pan", "spoon"], ["pasta", "tomato"], "Stir the pasta into the sauce.", "Revuelve la pasta con la salsa."),
      S(["grate"], ["grater"], ["cheese"], "Grate the cheese. Stop before your fingers get close.", "Ralla el queso. Para antes de que tus dedos se acerquen."),
      S(["plate"], ["plate"], ["basil", "cheese"], "Serve with cheese and torn basil on top. Turn off the stove.", "Sirve con queso y albahaca encima. Apaga la estufa."),
      S(["wash-dishes"], ["sponge"], [], "Wash the pot, the pan and the knife.", "Lava la olla, el sartén y el cuchillo.")] },
  { id: "vinaigrette", serves: 4, minutes: 10, level: 2,
    en: { n: "Vinaigrette (an emulsion)", about: "Oil and vinegar do not mix, until mustard helps them hold together." }, es: { n: "Vinagreta (una emulsión)", about: "El aceite y el vinagre no se mezclan, hasta que la mostaza los ayuda a unirse." },
    tools: ["jug", "spoons", "bowl", "whisk", "spoon"],
    ing: [I("vinegar", 1, "tbsp", [15, "ml"], "vinegar", "vinagre"), I("mustard", 1, "tsp", [5, "g"], "mustard", "mostaza", "mustard", ["mustard"]), I("honey", 1, "tsp", [5, "ml"], "honey", "miel"),
          I("salt", 1, "pinch", null, "salt", "sal"), I("pepper", 1, "pinch", null, "black pepper", "pimienta negra"), I("oil", 3, "tbsp", [45, "ml"], "olive oil", "aceite de oliva")],
    steps: [WASH,
      S(["measure-liquid", "pour"], ["jug", "bowl"], ["vinegar"], "Measure the vinegar into the bowl.", "Mide el vinagre y ponlo en el tazón."),
      S(["measure-dry"], ["spoons"], ["mustard", "honey"], "Add the mustard and honey.", "Añade la mostaza y la miel."),
      S(["season"], [], ["salt", "pepper"], "Add a pinch of salt and pepper.", "Añade una pizca de sal y pimienta."),
      S(["pour", "whisk"], ["jug", "whisk"], ["oil"], "Pour the oil in a thin stream while you whisk. It turns cloudy and thick: that is the emulsion. Mustard holds the tiny oil drops apart.", "Vierte el aceite en un chorrito fino mientras bates. Se pone turbio y espeso: esa es la emulsión. La mostaza mantiene separadas las gotitas de aceite."),
      S(["season"], ["spoon"], [], "Taste with a clean spoon. Add a little salt if it needs it.", "Prueba con una cuchara limpia. Añade un poco de sal si le falta."),
      S(["wipe-clean"], ["cloth"], [], "Wipe up any oil. Oil on the floor is slippery.", "Limpia el aceite. El aceite en el piso resbala.")] },
  { id: "quick-bread", serves: 12, minutes: 40, level: 2,
    en: { n: "Blueberry muffins (quick bread)", about: "Baking powder makes them rise. No waiting for yeast." }, es: { n: "Muffins de arándanos (pan rápido)", about: "El polvo para hornear los hace crecer. Sin esperar levadura." },
    tools: ["cups", "straight", "spoons", "bowl", "smallbowl", "whisk", "jug", "spatula", "tin", "mitts", "thermo"],
    ing: [I("flour", 2, "cup", [250, "g"], "all-purpose flour", "harina de trigo", "flour", ["wheat"]), I("sugar", 0.5, "cup", [100, "g"], "sugar", "azúcar"),
          I("bp", 2, "tsp", [8, "g"], "baking powder", "polvo para hornear", "powder"), I("salt", 0.5, "tsp", [3, "g"], "salt", "sal"),
          I("milk", 1, "cup", [240, "ml"], "milk", "leche", "milk", ["milk"]), I("oil", 0.33, "cup", [80, "ml"], "vegetable oil", "aceite vegetal"),
          I("egg", 1, "", null, "egg", "huevo", "egg", ["egg"]), I("blueberry", 1, "cup", [150, "g"], "blueberries", "arándanos")],
    steps: [S(["wash-hands", "tie-hair"], ["soap", "towel", "cap"], [], "Wash your hands. Tie your hair back. Ask a grown-up to heat the oven to 400 °F (200 °C). Put paper cups in the muffin tin.", "Lávate las manos. Recógete el pelo. Pide a un adulto que caliente el horno a 400 °F (200 °C). Pon capacillos en el molde.", { temp: { f: 400, c: 200 } }),
      S(["measure-dry"], ["cups", "straight"], ["flour", "sugar"], "Measure the flour and sugar. Level each cup.", "Mide la harina y el azúcar. Nivela cada taza."),
      S(["measure-dry", "whisk"], ["spoons", "whisk"], ["bp", "salt"], "Add the baking powder and salt. Whisk the dry things.", "Añade el polvo para hornear y la sal. Bate lo seco."),
      S(["crack-egg"], ["smallbowl"], ["egg"], "Crack the egg into a small bowl. Wash your hands.", "Rompe el huevo en un tazón pequeño. Lávate las manos."),
      S(["measure-liquid", "whisk"], ["jug", "whisk"], ["milk", "oil", "egg"], "Measure the milk and oil. Whisk them with the egg.", "Mide la leche y el aceite. Bátelos con el huevo."),
      S(["fold"], ["spatula"], ["flour", "milk", "blueberry"], "Pour the wet into the dry. Fold until just mixed. Fold in the blueberries.", "Vierte lo líquido en lo seco. Mezcla envolviendo lo justo. Añade los arándanos."),
      S(["pour"], ["spoon", "tin"], [], "Spoon the batter into the cups, about ⅔ full.", "Pon la mezcla en los capacillos, a ⅔ de su altura."),
      S(["bake"], ["mitts", "tin"], [], "With oven mitts, put the tin in the oven. Bake 18 to 20 minutes.", "Con guantes de horno, mete el molde al horno. Hornea de 18 a 20 minutos.", { timer: { min: 18 }, temp: { f: 400, c: 200 } }),
      S(["check-temp"], ["thermo", "mitts"], [], "Check one muffin in the middle: a toothpick comes out clean, or a thermometer reads about 200 °F (93 °C).", "Revisa un muffin en el centro: un palillo sale limpio o el termómetro marca unos 200 °F (93 °C).", { temp: { f: 200, c: 93 } }),
      S(["plate"], ["plate"], [], "Let them cool 5 minutes, then serve.", "Déjalos enfriar 5 minutos y sirve.", { timer: { min: 5 } }),
      S(["wash-dishes"], ["sponge"], [], "Wash the bowls and tools.", "Lava los tazones y los utensilios.")] },
  { id: "pizza-dough", serves: 2, minutes: 90, level: 3,
    en: { n: "Pizza from scratch (kneading)", about: "Yeast, flour and water, kneaded smooth, risen, rolled and baked." }, es: { n: "Pizza desde cero (amasar)", about: "Levadura, harina y agua, amasadas hasta quedar lisas, levadas, estiradas y horneadas." },
    tools: ["jug", "thermo", "spoons", "cups", "straight", "bowl", "spoon", "cloth2", "pin", "tray", "mitts"],
    ing: [I("water", 1, "cup", [240, "ml"], "warm water (about 110 °F / 43 °C)", "agua tibia (unos 110 °F / 43 °C)"), I("yeast", 2.25, "tsp", [7, "g"], "instant yeast (1 packet)", "levadura instantánea (1 sobre)", "powder"),
          I("sugar", 1, "tsp", [4, "g"], "sugar", "azúcar"), I("flour", 2.5, "cup", [315, "g"], "all-purpose flour", "harina de trigo", "flour", ["wheat"]), I("salt", 1, "tsp", [6, "g"], "salt", "sal"),
          I("oil", 2, "tbsp", [30, "ml"], "olive oil", "aceite de oliva"), I("tomato", 0.5, "cup", [120, "ml"], "tomato sauce", "salsa de tomate", "tomatosauce"),
          I("cheese", 1, "cup", [110, "g"], "shredded mozzarella", "queso mozzarella rallado", "cheese", ["milk"])],
    steps: [WASH,
      S(["measure-liquid", "check-temp"], ["jug", "thermo"], ["water"], "Measure the warm water. Check it: about 110 °F (43 °C). Too hot hurts the yeast.", "Mide el agua tibia. Revísala: unos 110 °F (43 °C). Muy caliente daña la levadura.", { temp: { f: 110, c: 43 } }),
      S(["measure-dry", "stir"], ["spoons", "bowl", "spoon"], ["yeast", "sugar"], "Stir in the yeast and sugar. Wait 5 minutes until it looks foamy.", "Añade la levadura y el azúcar y revuelve. Espera 5 minutos hasta que haga espuma.", { timer: { min: 5 } }),
      S(["measure-dry"], ["cups", "straight"], ["flour", "salt"], "Measure the flour and salt. Level each cup.", "Mide la harina y la sal. Nivela cada taza."),
      S(["pour", "stir"], ["spoon"], ["oil", "flour"], "Add the oil and flour. Stir until a shaggy dough forms.", "Añade el aceite y la harina. Revuelve hasta que se forme una masa."),
      S(["knead"], [], ["flour"], "Knead on a floured counter for 8 minutes, until smooth and springy.", "Amasa sobre la mesa con harina 8 minutos, hasta que quede lisa y elástica.", { timer: { min: 8 } }),
      S(["counter"], ["bowl", "cloth2"], [], "Put it in an oiled bowl. Cover it. Let it rise until about twice as big, about 1 hour.", "Ponla en un tazón con aceite. Tápala. Deja que crezca al doble, más o menos 1 hora.", { timer: { min: 60 }, rise: true }),
      S(["roll-dough"], ["pin"], [], "Press the air out. Roll it into a circle on the tray.", "Saca el aire apretando. Estírala en un círculo sobre la bandeja."),
      S(["spread", "season"], ["spoon"], ["tomato", "cheese"], "Spread the sauce, leaving a border. Sprinkle the cheese.", "Unta la salsa y deja un borde. Espolvorea el queso."),
      S(["bake"], ["mitts", "tray"], [], "A grown-up bakes it at 475 °F (245 °C) for 12 to 15 minutes, until the edge is golden.", "Un adulto la hornea a 475 °F (245 °C) de 12 a 15 minutos, hasta que la orilla esté dorada.", { timer: { min: 13 }, temp: { f: 475, c: 245 } }),
      S(["wipe-clean"], ["cloth"], [], "Wipe the floury counter.", "Limpia la harina de la mesa.")] }
];

/* ── amounts: kitchen fractions ── */
const FR = [[0, ""], [1 / 8, "⅛"], [1 / 4, "¼"], [1 / 3, "⅓"], [3 / 8, "⅜"], [1 / 2, "½"], [5 / 8, "⅝"], [2 / 3, "⅔"], [3 / 4, "¾"], [7 / 8, "⅞"], [1, ""]];
function fmtNum(q, metric, lang) {
  if (q == null || !isFinite(q)) return "";
  if (metric) { const r = q >= 100 ? Math.round(q / 5) * 5 : q >= 10 ? Math.round(q) : Math.round(q * 10) / 10; return String(r).replace(".", lang === "es" ? "," : "."); }
  let w = Math.floor(q + 1e-9), f = q - w, best = FR[0], d = 9;
  FR.forEach(p => { const e = Math.abs(f - p[0]); if (e < d - 1e-9) { d = e; best = p; } });
  if (best[0] === 1) { w += 1; best = FR[0]; }
  if (d > 0.05 && q < 10) return String(Math.round(q * 100) / 100).replace(".", lang === "es" ? "," : ".");
  return (w ? String(w) : "") + best[1] || "0";
}
function unitName(u, q, lang) { const U = UNITS[u] || ["", "", "", ""]; const many = !(q > 0 && q <= 1); return lang === "es" ? U[many ? 3 : 2] : U[many ? 1 : 0]; }
function fmtAmount(ing, f, lang) {
  f = f || 1;
  if (ing.q == null) return "";
  const q = ing.q * f, metricU = UNITS[ing.u] && UNITS[ing.u][4] === 0;
  let s = fmtNum(q, metricU, lang); const un = unitName(ing.u, q, lang); if (un) s += " " + un;
  if (ing.m) s += " (" + fmtNum(ing.m[0] * f, true, lang) + " " + unitName(ing.m[1], 2, lang) + ")";
  return s;
}
function scale(recipe, f) { return Object.assign({}, recipe, { factor: f, ing: recipe.ing.map(i => Object.assign({}, i, { q: i.q == null ? null : i.q * f, m: i.m ? [i.m[0] * f, i.m[1]] : null })) }); }

/* ══ THE RECIPE READER ══ */
const UNIC = { "½": 0.5, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 0.25, "¾": 0.75, "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875, "⅕": 0.2, "⅙": 1 / 6 };
const UNIT_WORDS = [
  [/^(cups?|c\.?|tazas?|tz\.?)$/i, "cup"],
  [/^(tablespoons?|tbsps?\.?|tbs\.?|tbl\.?|T|cucharadas?|cdas?\.?|cucharadas soperas?)$/, "tbsp"],
  [/^(teaspoons?|tsps?\.?|t|cucharaditas?|cdtas?\.?|cditas?\.?|cdita\.?)$/, "tsp"],
  [/^(fl\.? ?oz\.?|fluid ounces?)$/i, "floz"], [/^(ounces?|oz\.?|onzas?)$/i, "oz"], [/^(pounds?|lbs?\.?|libras?)$/i, "lb"],
  [/^(grams?|grammes?|gr?\.?|gramos?|grs\.?)$/i, "g"], [/^(kilograms?|kilos?|kgs?\.?|kilogramos?)$/i, "kg"],
  [/^(milliliters?|millilitres?|ml\.?|mililitros?)$/i, "ml"], [/^(liters?|litres?|l\.?|litros?|lt\.?)$/i, "l"],
  [/^(pinch(es)?|pizcas?|dash(es)?)$/i, "pinch"], [/^(cloves?|dientes?)$/i, "clove"], [/^(cans?|latas?|tins?)$/i, "can"],
  [/^(slices?|rebanadas?|rodajas?)$/i, "slice"], [/^(sticks?|barras?)$/i, "stick"], [/^(packets?|packages?|pkgs?\.?|sobres?|paquetes?)$/i, "packet"],
  [/^(handfuls?|puñados?)$/i, "handful"], [/^(quarts?|qts?\.?)$/i, "qt"], [/^(pints?|pts?\.?|pintas?)$/i, "pint"]
];
const NUMWORDS = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, half: 0.5, un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, media: 0.5, medio: 0.5 };
function num(tok) {
  tok = String(tok).trim();
  if (UNIC[tok] != null) return UNIC[tok];
  let m = tok.match(/^(\d+)([½⅓⅔¼¾⅛⅜⅝⅞⅕⅙])$/); if (m) return +m[1] + UNIC[m[2]];
  m = tok.match(/^(\d+)\/(\d+)$/); if (m && +m[2]) return +m[1] / +m[2];
  m = tok.match(/^\d+([.,]\d+)?$/); if (m) return parseFloat(tok.replace(",", "."));
  const w = tok.toLowerCase(); if (NUMWORDS[w] != null) return NUMWORDS[w];
  return null;
}
/* "1 1/2 cups flour", "1½ c. sugar", "2-3 tbsp oil", "200 g de harina", "2 tazas de leche", "a pinch of salt", "3 eggs, beaten" */
function readIngredient(line) {
  let s = line.replace(/^\s*([-•*·–—]|\d+[.)](?=\s))\s*/, "").trim();
  if (!s) return null;
  s = s.replace(/(\d)([½⅓⅔¼¾⅛⅜⅝⅞⅕⅙])/g, "$1 $2").replace(/(\d)\s*-\s*(\d)/g, "$1-$2").replace(/(\d)(g|kg|ml|mL|l|oz|lb)\b/g, "$1 $2");
  const toks = s.split(/\s+/); let i = 0, q = null, q2 = null;
  const take = () => { const t = toks[i]; if (t == null) return null; const r = t.match(/^([\d.,/½⅓⅔¼¾⅛⅜⅝⅞⅕⅙]+)-([\d.,/]+)$/); if (r) { const a = num(r[1]), b = num(r[2]); if (a != null && b != null) { i++; q2 = b; return a; } } const v = num(t); if (v != null && !(/^(a|an|un|una|uno)$/i.test(t) && !toks[i + 1])) { i++; return v; } return null; };
  q = take();
  if (q != null) { const save = i, v = num(toks[i] || ""); if (v != null && v < 1 && !/^[a-z]+$/i.test(toks[i])) { q += v; i++; } else i = save; }
  if (q != null && /^(of|de)$/i.test(toks[i] || "") && /^(half|media|medio)$/i.test(toks[i - 1] || "")) i++;
  let u = "";
  if (q != null && toks[i]) {
    const t = toks[i].replace(/[,;:]$/, "");
    let hit = UNIT_WORDS.find(w => w[0].test(t));
    // "fluid ounces", "fl oz", "cucharadas soperas"
    const two = toks[i] + " " + (toks[i + 1] || "");
    const hit2 = UNIT_WORDS.find(w => w[0].test(two.replace(/[,;:]$/, "")));
    if (hit2 && /\s\S/.test(two)) { u = hit2[1]; i += 2; }
    else if (hit && !(t === "t" && false)) { u = hit[1]; i++; }
    // "1 (14 oz) can tomatoes"
    if (!u && /^\(/.test(toks[i])) { let j = i; while (j < toks.length && !/\)$/.test(toks[j])) j++; const after = (toks[j + 1] || "").replace(/[,;:]$/, ""); const h3 = UNIT_WORDS.find(w => w[0].test(after)); if (h3) { u = h3[1]; i = j + 2; } }
    if (/^(of|de|del)$/i.test(toks[i] || "")) i++;
  } else if (q == null && /^(pinch|pizca|dash|salt|sal)\b/i.test(s)) { q = 1; u = "pinch"; if (/^(pinch|pizca|dash)/i.test(toks[0])) { i = 1; if (/^(of|de)$/i.test(toks[1] || "")) i = 2; } }
  let name = toks.slice(i).join(" ").replace(/^(of|de)\s+/i, "").trim();
  let note = ""; const c = name.match(/^([^,(]+)[,(]\s*(.+?)\)?$/); if (c) { name = c[1].trim(); note = c[2].trim(); }
  if (!name) return null;
  return { q, q2, u, name, note, raw: line.trim() };
}
/* what the food looks like in 3D, and what allergens its name names */
const ITEMS = [
  [/strawberr|fresa/i, "strawberry"], [/blueberr|ar[aá]ndano|berr|moras?\b|frambues/i, "blueberry"], [/banana|pl[aá]tano/i, "banana"], [/apple|manzana/i, "apple"], [/grape|uvas?\b/i, "grape"],
  [/lemon juice|lime juice|jugo de lim|zumo de lim/i, "lemonjuice"], [/lemon|lime|lim[oó]n/i, "lemon"], [/orange juice|juice|jugo|zumo/i, "lemonjuice"], [/honey|miel|syrup|jarabe|maple/i, "honey"],
  [/yogh?urt|yogur/i, "yogurt"], [/granola|oats|avena|cereal/i, "granola"], [/\beggs?\b|huevos?/i, "egg"], [/milk|leche|cream|crema|buttermilk/i, "milk"], [/butter|mantequilla|margarin/i, "butter"],
  [/\bsalt\b|\bsal\b/i, "salt"], [/black pepper|pimienta/i, "pepper"], [/flour|harina/i, "flour"], [/sugar|az[uú]car/i, "sugar"], [/baking powder|baking soda|polvo para hornear|bicarbonato|yeast|levadura/i, "powder"],
  [/vinegar|vinagre/i, "vinegar"], [/mustard|mostaza/i, "mustard"], [/oil|aceite/i, "oil"], [/bell pepper|pimiento|capsicum/i, "bellpepper"], [/carrot|zanahoria/i, "carrot"], [/broccoli|br[oó]coli/i, "broccoli"],
  [/onion|cebolla|shallot|chalot/i, "onion"], [/garlic|\bajos?\b/i, "garlic"], [/soy sauce|salsa de soya|salsa de soja|tamari/i, "soy"], [/\brice\b|arroz/i, "rice"],
  [/pasta|spaghetti|espagueti|penne|macaroni|macarr|noodle|fideo/i, "pasta"], [/tomato sauce|crushed tomato|salsa de tomate|tomate triturado|marinara|passata/i, "tomatosauce"],
  [/tomato|tomate|jitomate/i, "tomato"], [/basil|albahaca|cilantro|parsley|perejil|herb|hierba/i, "basil"], [/cheese|queso|parmesan|mozzarella|cheddar/i, "cheese"],
  [/cucumber|pepino|zucchini|calabac/i, "cucumber"], [/potato|papa|patata/i, "potato"], [/water|agua/i, "water"], [/cinnamon|canela|spice|especia|paprika|cumin|comino|oregano|or[eé]gano|vanilla|vainilla|nutmeg|nuez moscada/i, "spice"], [/chicken|pollo/i, "chicken"], [/beef|carne|turkey|pavo/i, "meat"]
];
const ALG = [
  [/milk|butter|cheese|yogh?urt|cream|leche|mantequilla|queso|yogur|crema|parmesan|mozzarella/i, "milk"], [/\beggs?\b|huevos?|mayonnaise|mayonesa/i, "egg"],
  [/flour|harina|wheat|trigo|pasta|spaghetti|bread|\bpan\b|noodle|fideo|soy sauce|salsa de soya|granola|couscous|cusc/i, "wheat"],
  [/\bsoy|soya|soja|tofu|edamame|tamari/i, "soy"], [/peanut|cacahuate|man[ií]\b/i, "peanut"],
  [/almond|walnut|pecan|cashew|pistachio|hazelnut|almendra|nuez|nueces|anacardo|pistache|avellana/i, "treenut"], [/\bfish|salmon|tuna|cod\b|pescado|salm[oó]n|at[uú]n/i, "fish"],
  [/shrimp|crab|lobster|clam|mussel|camar[oó]n|cangrejo|langosta|almeja|mejill/i, "shellfish"], [/sesame|tahini|ajonjol[ií]|s[eé]samo/i, "sesame"], [/mustard|mostaza/i, "mustard"]
];
const itemFor = name => { const h = ITEMS.find(p => p[0].test(name)); return h ? h[1] : "generic"; };
const algFor = name => /free|sin\s/i.test(name) ? [] : ALG.filter(p => p[0].test(name)).map(p => p[1]);

/* the verbs → skills. Earlier rows win: a matched phrase is blanked so a shorter verb inside it cannot match again. */
const VERBS = [
  [/\bwash (your |the )?hands\b|\bl[aá]v(ate|ar|ese|en)( las| tus)? manos\b/i, "wash-hands"],
  [/\btie (your |the )?hair|hair back|\brec[oó]g(ete|er|e)( el)? (pelo|cabello)|\bcabello recogido/i, "tie-hair"],
  [/\bwash (the )?dishes|\bdo the dishes|\bwash up\b|\blav(a|ar|e)( los)? (trastes|platos)/i, "wash-dishes"],
  [/\b(wipe|clean)( down)?( the)? (counter|surface|table)|\blimpi(a|ar|e)( la)? (mesa|superficie|encimera)/i, "wipe-clean"],
  [/\bfood thermometer|\bthermometer|\binternal temperature|\breaches \d+ ?°|\bterm[oó]metro|\btemperatura interna/i, "check-temp"],
  [/\bcrack(s|ed|ing)?\b|\bbreak (the |\d+ )?eggs?|\b(romp|casc|quiebr|quebr)(a|e|an|ar)( el| los| \d+)? huevos?|\b(romp|casc)(a|e|ar)\b/i, "crack-egg"],
  [/\b(finely chop|mince[sd]?|mincing)\b|\bpic(a|ar|ad[oa]s?|ue)( muy)? fin(o|a|amente)\b/i, "mince"],
  [/\bdic(e|ed|es|ing)\b|\bcube[sd]?\b|\b(cort|pic)(a|ar|e)(\s+[\wáéíóúñ]+){0,3}\s+en (cubos|cubitos|dados|cuadritos)/i, "dice"],
  [/\bslic(e|ed|es|ing)\b|\b(cort|part)(a|ar|e)(\s+[\wáéíóúñ]+){0,3}\s+en (rodajas|rebanadas|tiras|láminas|laminas)|\breban(a|ar|e)\b/i, "slice"],
  [/\b(fold|folding|folded)\b|\bmovimientos envolventes|\benvolv(er|iendo)|\bincorpor(a|ar|e)( \w+)? (suave|con cuidado)/i, "fold"],
  [/\bmeasure\b|\bmeasuring\b|\bmid(e|a|an)\b|\bmedir\b/i, "measure"],
  [/\bsimmer(s|ed|ing)?\b|\b(a |al )?fuego (lento|bajo)|\bcocin(a|ar|e) a fuego lento|\bhervir a fuego lento/i, "simmer"],
  [/\bflip(s|ped|ping)?\b|\bturn( it| them)? over\b|\bvolte(a|ar|e)\b|\bda(r|le)? la vuelta/i, "flip"],
  [/\bknead(s|ed|ing)?\b|\bamas(a|ar|e)\b/i, "knead"],
  [/\broll( it| the dough)? out\b|\brolling pin\b|\broll the dough\b|\bestir(a|ar|e)( la masa)?\b|\brodillo\b|\bextend(er|é|e) la masa/i, "roll-dough"],
  [/\bgrat(e|ed|es|ing)\b|\bshred(ded)?\b|\bzest\b|\brall(a|ar|e)\b/i, "grate"],
  [/\bpeel(s|ed|ing)?\b|\bpel(a|ar|e)\b/i, "peel"],
  [/\b(chop|chopped|chopping|cut)\b|\bpic(a|ar|ue)\b|\bcort(a|ar|e)\b|\btroce(a|ar|e)\b/i, "chop"],
  [/\bwhisk(s|ed|ing)?\b|\bbeat(s|en|ing)?\b|\bbat(e|ir|a)\b/i, "whisk"],
  [/\bsaut[eé](ed|ing)?\b|\bstir-?fry\b|\bfry\b|\bbrown\b|\bsofr(e[ií]r|íe|ia|ía)|\bsalte(a|ar|e)\b|\bdor(a|ar|e)\b|\bfr(eír|ie|íe|ía|ia)\b/i, "saute"],
  [/\bboil(s|ed|ing)?\b|\bhierv(e|a|an)\b|\bhervir\b|\bhervor\b/i, "boil"],
  [/\bbak(e|ed|es|ing)\b|\broast\b|\boven\b|\bhorne(a|ar|e)\b|\bal horno\b|\bhorno\b/i, "bake"],
  [/\bspread\b|\bunt(a|ar|e)\b|\bextiend(e|a)\b/i, "spread"],
  [/\bseason(ed|ing)?\b|\bsprinkle\b|\bsalt and pepper\b|\bsazon(a|ar|e)\b|\bsalpiment(a|ar|e)\b|\bespolvore(a|ar|e)\b/i, "season"],
  [/\bstir(s|red|ring)?\b|\bmix(es|ing)?\b|\bcombine\b|\btoss\b|\bmezcl(a|ar|e)\b|\brevuelv(e|a)\b|\brevolver\b|\bremuev(e|a)\b|\bcombin(a|ar|e)\b/i, "stir"],
  [/\bpour(s|ed|ing)?\b|\bdrizzle\b|\bdrain\b|\bverti?(e|er|a|ir)\b|\bvierte\b|\bescurr(e|ir|a)\b|\bech(a|ar|e)\b/i, "pour"],
  [/\brinse\b|\bwash (the )?(fruit|vegetables|veggies|produce|berries)|\benjuag(a|ar|ue)\b|\blav(a|ar|e) (la fruta|las verduras|los vegetales)/i, "rinse"],
  [/\bserve\b|\bplate\b|\bgarnish\b|\blayer\b|\barrange\b|\bsirv(e|a)\b|\bservir\b|\bdecor(a|ar|e)\b|\bemplat(a|ar|e)\b/i, "plate"],
  [/\b(clean|wipe)\b|\blimpi(a|ar|e)\b/i, "wipe-clean"],
  [/\bwash\b|\blav(a|ar|e)\b/i, "wash-dishes"]
];
const LIQUID = /milk|water|oil|juice|broth|stock|vinegar|cream|leche|agua|aceite|jugo|zumo|caldo|vinagre|crema|\bml\b|\bmL\b|litro|liter|fl oz/i;
function verbsIn(text, ingNames) {
  let s = " " + text + " "; const out = [];
  VERBS.forEach(([re, id]) => {
    const g = new RegExp(re.source, "gi"); let m;
    while ((m = g.exec(s))) { out.push([m.index, id, m[0]]); s = s.slice(0, m.index) + " ".repeat(m[0].length) + s.slice(m.index + m[0].length); g.lastIndex = m.index + m[0].length; }
  });
  out.sort((a, b) => a[0] - b[0]);
  const ids = [];
  out.forEach(([, id, w]) => {
    if (id === "measure") id = LIQUID.test(text) ? "measure-liquid" : "measure-dry";
    if (id === "boil" && /\bfuego lento|simmer/i.test(text) && ids.includes("simmer")) return;
    if (!ids.includes(id)) ids.push(id);
  });
  return ids;
}
const SECTION_ING = /^\s*(ingredients?|ingredientes|you will need|you'll need|necesitas|lo que necesitas)\s*:?\s*$/i;
const SECTION_STEP = /^\s*(steps?|directions?|instructions?|method|preparation|how to make it|pasos|instrucciones|preparaci[oó]n|procedimiento|modo de preparaci[oó]n|elaboraci[oó]n)\s*:?\s*$/i;
const QTY_START = /^\s*([-•*·–]\s*)?(\d|[½⅓⅔¼¾⅛⅜⅝⅞]|(a|an|one|two|three|four|un|una|uno|dos|tres|cuatro|half|media|medio)\s+(cup|tbsp|tsp|tablespoon|teaspoon|pinch|clove|can|taza|cucharad|pizca|diente|lata|large|small|medium|egg|huevo))/i;
const STEP_START = /^\s*((step|paso)\s*\d+\s*[:.)-]?|\d+\s*[.)]\s+|\d+\s*-\s+)/i;
function read(text, lang) {
  const lines = String(text || "").replace(/\r/g, "").split("\n").map(l => l.replace(/\t/g, " ").trimEnd());
  let title = "", mode = "", ing = [], stepsRaw = [], unknown = [], sawHeader = false;
  lines.forEach((l, n) => {
    const t = l.trim(); if (!t) return;
    if (SECTION_ING.test(t)) { mode = "ing"; sawHeader = true; return; }
    if (SECTION_STEP.test(t)) { mode = "step"; sawHeader = true; return; }
    if (!title && !mode && !QTY_START.test(t) && !STEP_START.test(t) && t.length < 80 && !/[.!?]$/.test(t)) { title = t.replace(/^#+\s*/, ""); return; }
    if (mode === "ing" || (!mode && QTY_START.test(t) && !STEP_START.test(t))) {
      if (mode !== "ing" && STEP_START.test(t)) { stepsRaw.push(t); return; }
      const r = readIngredient(t);
      if (r) ing.push(r); else unknown.push(t);
      return;
    }
    if (mode === "step" || STEP_START.test(t) || /[.!?]$/.test(t) || verbsIn(t).length) { stepsRaw.push(t); return; }
    unknown.push(t);
  });
  // one block of words → its sentences are the steps
  let steps = [];
  stepsRaw.forEach(t => {
    const body = t.replace(STEP_START, "").trim();
    if (!STEP_START.test(t) && /[.!?]\s+[A-ZÁÉÍÓÚÑ¡¿]/.test(body)) body.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¡¿])/).forEach(x => x.trim() && steps.push(x.trim()));
    else if (body) steps.push(body);
  });
  const ingN = ing.map((x, k) => ({ k: "i" + k, q: x.q, q2: x.q2, u: x.u, m: null, en: x.name + (x.note ? ", " + x.note : ""), es: x.name + (x.note ? ", " + x.note : ""), name: x.name, item: itemFor(x.name), alg: algFor(x.name), raw: x.raw }));
  const out = steps.map(t => {
    let a = verbsIn(t);
    const mentioned = ingN.filter(i => i.name.toLowerCase().split(/[\s,]+/).filter(w => w.length > 3).some(w => t.toLowerCase().indexOf(w.replace(/s$/, "")) >= 0)).map(i => i.k);
    const tm = t.match(/(\d+(?:[.,]\d+)?)(?:\s*(?:-|to|a|–)\s*(\d+(?:[.,]\d+)?))?\s*(minutes?|mins?\b|minutos?|hours?|hrs?\b|horas?|seconds?|secs?\b|segundos?)/i);
    let timer = null; if (tm) { const v = (parseFloat(tm[1].replace(",", ".")) + (tm[2] ? parseFloat(tm[2].replace(",", ".")) : parseFloat(tm[1].replace(",", ".")))) / 2; timer = /^h/i.test(tm[3]) ? { min: v * 60 } : /^s/i.test(tm[3]) ? { sec: v } : { min: v }; }
    const tp = t.match(/(\d{2,3})\s*°?\s*(F|C)\b/i) || t.match(/(\d{2,3})\s*(?:degrees|grados)\s*(F|C|Fahrenheit|Celsius)?/i);
    let temp = null; if (tp) { const v = +tp[1], c = /^c/i.test(tp[2] || "") || (!tp[2] && v < 260 && /grados/i.test(t)); temp = c ? { c: v, f: Math.round(v * 9 / 5 + 32) } : { f: v, c: Math.round((v - 32) * 5 / 9) }; }
    const sure = a.length > 0; if (!sure) a = ["counter"];
    const tools = []; a.forEach(id => (ACTIONS[id].tools || []).forEach(x => { if (!tools.includes(x)) tools.push(x); }));
    return { a, tools, ing: mentioned, en: t, es: t, timer, temp, sure };
  });
  const allergens = []; ingN.forEach(i => i.alg.forEach(x => { if (!allergens.includes(x)) allergens.push(x); }));
  const tools = []; out.forEach(s => s.tools.forEach(x => { if (!tools.includes(x)) tools.push(x); }));
  if (!title) title = lang === "es" ? "Mi receta" : "My recipe";
  return { id: "mine", mine: true, serves: null, en: { n: title, about: "" }, es: { n: title, about: "" }, ing: ingN, steps: out, allergens, tools, unknown, sawHeader };
}

/* the allergens of a preloaded recipe come from its ingredients */
RECIPES.forEach(r => { r.allergens = []; r.ing.forEach(i => i.alg.forEach(a => { if (!r.allergens.includes(a)) r.allergens.push(a); })); });

const API = { ACTIONS, SKILLS, TOOLS, ALLERGENS, UNITS, RECIPES, read, readIngredient, verbsIn, scale, fmtAmount, fmtNum, unitName, itemFor, algFor };
root.AOGKitchenRecipes = API;
if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
