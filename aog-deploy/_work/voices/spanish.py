# 38 · Voces en español: LibriVox Spanish readings: Don Quijote vol. 1 (sections 03 and 05), Bécquer's Rimas (rimas_1810 for XXI and XXIII, rimas_1908 for LIII),
# Darío's Cantos de vida y esperanza (09, 06), Martí's La Edad de Oro (01, Tres héroes) and Versos sencillos V
# (Multilingual Short Works 012). No Spanish speech model here: each line was found by its sounds (esfind.py, ../scripture)
# and checked against the reader's pauses (see README.md).
Q="Don Quixote, Miguel de Cervantes"; B="Rimas, Gustavo Adolfo Bécquer"; D="Song of Autumn in Spring, Rubén Darío"
DM="Triumphal March, Rubén Darío"; M="Three Heroes, José Martí"; MV="Simple Verses, José Martí"
make("fv/e/", "38-voces-en-espanol", [
 ("q3.mp3",36.80,40.91,"En un lugar de la Mancha, de cuyo nombre no quiero acordarme",Q),
 ("q3.mp3",297.56,303.80,"Del poco dormir y del mucho leer, se le secó el celebro",Q),
 ("q5.mp3",2191.91,2200.15,"Ves allí, amigo Sancho Panza, desaforados gigantes",Q),
 ("q5.mp3",2235.04,2239.93,"No son gigantes, sino molinos de viento",Q),
 ("q5.mp3",2298.79,2305.67,"Non fuyades, cobardes y viles criaturas",Q),
 ("r10_3.mp3",13.30,18.79,"¿Qué es poesía?, dices mientras clavas en mi pupila tu pupila azul",B),
 ("r10_3.mp3",19.75,25.14,"¿Qué es poesía? ¿Y tú me lo preguntas? Poesía… eres tú",B),
 ("r10_3.mp3",42.13,51.49,"Por una mirada, un mundo… ¡yo no sé qué te diera por un beso!",B),
 ("rimas6.mp3",82.42,86.06,"Volverán las oscuras golondrinas",B),
 ("rimas6.mp3",96.70,100.60,"Aquellas que aprendieron nuestros nombres… ésas… ¡no volverán!",B),
 ("dario9.mp3",17.40,21.80,"Juventud, divino tesoro, ¡ya te vas para no volver!",D),
 ("dario9.mp3",22.41,26.42,"Cuando quiero llorar, no lloro… y a veces lloro sin querer",D),
 ("dario6.mp3",44.30,48.94,"¡Ya viene el cortejo! ¡Ya viene el cortejo! Ya se oyen los claros clarines",DM),
 ("marti1.mp3",80.92,87.68,"Libertad es el derecho que todo hombre tiene a ser honrado…",M),
 ("marti1.mp3",257.14,260.53,"El sol quema con la misma luz con que calienta",M),
 ("espumas.mp3",15.71,18.76,"Si ves un monte de espumas, es mi verso lo que ves",MV)],
 [0,3,4,5,8,10,12,13],
 "Spanish Voices","Voces en español","LibriVox","Spanish classics, read aloud","Clásicos en español, leídos en voz alta",
 "Lines from Don Quixote, Bécquer, Rubén Darío and José Martí, read aloud in Spanish.",
 "Frases de Don Quijote, Bécquer, Rubén Darío y José Martí, leídas en voz alta.",
 {Q:"Don Quijote, Miguel de Cervantes", D:"Canción de otoño en primavera, Rubén Darío", DM:"Marcha triunfal, Rubén Darío",
  M:"Tres héroes, José Martí", MV:"Versos sencillos, José Martí"})
