/* AOG-CHORDS-LIB-V1 (Jimmy, 2026-10-05: "work on those scales, modes and chords and all that") — the chord library every
   instrument loads (guitar, bass, piano, The Band). Each kind: iv = steps above the root (above 12 = the octave up: a 9th
   is 14), sym = what follows the root's letter (Cm7♭5), en/es = its plain name. The first six ids are the ones the pages
   already use (maj, min, dom7, maj7, m7, add9), so their chords keep working. AOGChords.pcs(root, id) gives the pitch
   classes; AOGChords.label(id, lang) the menu line. */
window.AOGChords=(function(){
  const K={
    /* three notes */
    maj:{iv:[0,4,7], sym:"", en:"Major · bright", es:"Mayor · brillante"},
    min:{iv:[0,3,7], sym:"m", en:"Minor · soft or sad", es:"Menor · suave o triste"},
    dim:{iv:[0,3,6], sym:"dim", en:"Diminished · tense", es:"Disminuido · tenso"},
    aug:{iv:[0,4,8], sym:"aug", en:"Augmented · dreamy, unsettled", es:"Aumentado · soñador, inquieto"},
    sus2:{iv:[0,2,7], sym:"sus2", en:"Sus2 · open, no third", es:"Sus2 · abierto, sin tercera"},
    sus4:{iv:[0,5,7], sym:"sus4", en:"Sus4 · waiting to resolve", es:"Sus4 · esperando resolver"},
    five:{iv:[0,7], sym:"5", en:"Power chord · root and fifth, rock", es:"Power chord · raíz y quinta, rock"},
    flat5:{iv:[0,4,6], sym:"(♭5)", en:"Major ♭5 · bright with a bent fifth", es:"Mayor ♭5 · brillante con la quinta baja"},
    /* sixths and added notes */
    six:{iv:[0,4,7,9], sym:"6", en:"Sixth · sweet, old-time", es:"Sexta · dulce, de antes"},
    m6:{iv:[0,3,7,9], sym:"m6", en:"Minor sixth · mysterious", es:"Menor sexta · misterioso"},
    add9:{iv:[0,4,7,14], sym:"add9", en:"Add9 · major with a sparkle", es:"Add9 · mayor con un brillo"},
    madd9:{iv:[0,3,7,14], sym:"m(add9)", en:"Minor add9 · minor with a sparkle", es:"Menor add9 · menor con un brillo"},
    sixnine:{iv:[0,4,7,9,14], sym:"6/9", en:"Six-nine · warm jazz major", es:"Seis-nueve · mayor cálido de jazz"},
    m69:{iv:[0,3,7,9,14], sym:"m6/9", en:"Minor six-nine · smooth", es:"Menor seis-nueve · suave"},
    add11:{iv:[0,4,7,17], sym:"add11", en:"Add11 · major with the 4th up high", es:"Add11 · mayor con la 4.ª arriba"},
    /* sevenths */
    dom7:{iv:[0,4,7,10], sym:"7", en:"Seventh · bluesy, wants to move", es:"Séptima · con blues, quiere moverse"},
    maj7:{iv:[0,4,7,11], sym:"maj7", en:"Major seventh · soft and dreamy", es:"Séptima mayor · suave y soñadora"},
    m7:{iv:[0,3,7,10], sym:"m7", en:"Minor seventh · mellow", es:"Menor séptima · tranquila"},
    mmaj7:{iv:[0,3,7,11], sym:"m(maj7)", en:"Minor-major seventh · spy-movie tension", es:"Menor con séptima mayor · tensión de película de espías"},
    m7b5:{iv:[0,3,6,10], sym:"m7♭5", en:"Half-diminished · the jazz 2 chord in minor", es:"Semidisminuido · el acorde 2 del jazz en menor"},
    dim7:{iv:[0,3,6,9], sym:"dim7", en:"Diminished seventh · very tense, every step the same", es:"Séptima disminuida · muy tenso, todos los pasos iguales"},
    sus47:{iv:[0,5,7,10], sym:"7sus4", en:"Seventh sus4 · open, funky", es:"Séptima sus4 · abierto, funky"},
    sus27:{iv:[0,2,7,10], sym:"7sus2", en:"Seventh sus2 · open and airy", es:"Séptima sus2 · abierto y ligero"},
    aug7:{iv:[0,4,8,10], sym:"7♯5", en:"Seventh ♯5 · pushes hard toward home", es:"Séptima ♯5 · empuja fuerte hacia casa"},
    augmaj7:{iv:[0,4,8,11], sym:"maj7♯5", en:"Major seventh ♯5 · floating", es:"Séptima mayor ♯5 · flotante"},
    dom7b5:{iv:[0,4,6,10], sym:"7♭5", en:"Seventh ♭5 · edgy jazz", es:"Séptima ♭5 · jazz con filo"},
    maj7b5:{iv:[0,4,6,11], sym:"maj7♭5", en:"Major seventh ♭5 · bright and strange", es:"Séptima mayor ♭5 · brillante y extraño"},
    /* ninths, elevenths, thirteenths */
    nine:{iv:[0,4,7,10,14], sym:"9", en:"Ninth · funky and full", es:"Novena · funky y llena"},
    m9:{iv:[0,3,7,10,14], sym:"m9", en:"Minor ninth · smooth soul", es:"Menor novena · soul suave"},
    maj9:{iv:[0,4,7,11,14], sym:"maj9", en:"Major ninth · lush", es:"Novena mayor · rica"},
    mmaj9:{iv:[0,3,7,11,14], sym:"m(maj9)", en:"Minor-major ninth · dark and lush", es:"Menor con novena mayor · oscuro y rico"},
    sus49:{iv:[0,5,7,10,14], sym:"9sus4", en:"Ninth sus4 · gospel and soul", es:"Novena sus4 · góspel y soul"},
    eleven:{iv:[0,4,7,10,14,17], sym:"11", en:"Eleventh · every note stacked, wide and open", es:"Oncena · todas las notas apiladas, amplia y abierta"},
    m11:{iv:[0,3,7,10,14,17], sym:"m11", en:"Minor eleventh · deep and modern", es:"Menor oncena · profunda y moderna"},
    maj7s11:{iv:[0,4,7,11,18], sym:"maj7♯11", en:"Major seventh ♯11 · Lydian sparkle", es:"Séptima mayor ♯11 · brillo lidio"},
    thirteen:{iv:[0,4,7,10,14,21], sym:"13", en:"Thirteenth · big band and funk", es:"Trecena · big band y funk"},
    m13:{iv:[0,3,7,10,14,21], sym:"m13", en:"Minor thirteenth · rich and dark", es:"Menor trecena · rica y oscura"},
    maj13:{iv:[0,4,7,11,14,21], sym:"maj13", en:"Major thirteenth · the full bright sound", es:"Trecena mayor · todo el sonido brillante"},
    /* altered dominants */
    dom7b9:{iv:[0,4,7,10,13], sym:"7♭9", en:"Seventh ♭9 · dark pull to home", es:"Séptima ♭9 · tira oscuro hacia casa"},
    dom7s9:{iv:[0,4,7,10,15], sym:"7♯9", en:"Seventh ♯9 · the rock and blues crunch", es:"Séptima ♯9 · el golpe del rock y el blues"},
    dom7s11:{iv:[0,4,7,10,18], sym:"7♯11", en:"Seventh ♯11 · Lydian dominant", es:"Séptima ♯11 · lidio dominante"},
    dom7b13:{iv:[0,4,7,10,20], sym:"7♭13", en:"Seventh ♭13 · bittersweet", es:"Séptima ♭13 · agridulce"},
    dom7s5s9:{iv:[0,4,8,10,15], sym:"7♯5♯9", en:"Altered seventh · all the tension", es:"Séptima alterada · toda la tensión"},
    dom7s5b9:{iv:[0,4,8,10,13], sym:"7♯5♭9", en:"Seventh ♯5 ♭9 · dark and strong", es:"Séptima ♯5 ♭9 · oscura y fuerte"},
    thirteenb9:{iv:[0,4,10,13,21], sym:"13♭9", en:"Thirteenth ♭9 · jazz tension", es:"Trecena ♭9 · tensión de jazz"}
  };
  const GROUPS=[
    ["three",["maj","min","dim","aug","sus2","sus4","five","flat5"]],
    ["added",["six","m6","add9","madd9","sixnine","m69","add11"]],
    ["seventh",["dom7","maj7","m7","mmaj7","m7b5","dim7","sus47","sus27","aug7","augmaj7","dom7b5","maj7b5"]],
    ["ext",["nine","m9","maj9","mmaj9","sus49","eleven","m11","maj7s11","thirteen","m13","maj13"]],
    ["alt",["dom7b9","dom7s9","dom7s11","dom7b13","dom7s5s9","dom7s5b9","thirteenb9"]]];
  const GW={three:{en:"Three-note chords",es:"Acordes de tres notas"}, added:{en:"Sixths and added notes",es:"Sextas y notas añadidas"},
    seventh:{en:"Sevenths",es:"Séptimas"}, ext:{en:"Ninths, elevenths and thirteenths",es:"Novenas, oncenas y trecenas"},
    alt:{en:"Altered sevenths",es:"Séptimas alteradas"}};
  return {
    KINDS:K, GROUPS:GROUPS, GROUP_WORDS:GW,
    ids:()=>[].concat(...GROUPS.map(g=>g[1])),
    pcs:(root,id)=>{ const k=K[id]; return k ? [...new Set(k.iv.map(i=>((root+i)%12+12)%12))] : []; },
    label:(id,lang)=>{ const k=K[id]; return k ? (lang==="es"?k.es:k.en) : id; },
    group:(g,lang)=>{ const x=GW[g]; return x ? (lang==="es"?x.es:x.en) : g; },
    sym:(id)=>{ const k=K[id]; return k ? k.sym : ""; }
  };
})();
