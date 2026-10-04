"use strict";
/* ══════════════════════════════════════════════════════════════════════════
   THE BAND (AOG-BAND-V1) — brass and woodwinds, recorded
   ══════════════════════════════════════════════════════════════════════════ */
const LKEY="aog.band.v1";
/* every recording the page can load: for each instrument, the held notes (soft "s" and loud "l") and the short ones ("t"),
   and a tuning correction in cents for the few that were recorded a little off (made by _work/music/make_band.py) */
const MAN=@@MANIFEST@@;
const RHYTHMS=["long","swell","stabs","offbeat","march","waltz","fanfare","broken"];
/* a waltz has three beats in a bar; everything else, four. A waltz plays without a four-beat drum beat (as on the piano) */
const RHYTHM_BEATS={waltz:3};
function beatsPerBar(){ return RHYTHM_BEATS[S.rhythm]||4; }
const S={ lang:"en", sound:"trumpet", key:0, minor:false, preset:"", prog:[], own:false, rhythm:"long", bpm:90,
  oct:null, era:0, vol:0.8, withDrums:false, playing:false };
try{ S.lang=localStorage.getItem("aog.lang")==="es"?"es":"en"; }catch(e){}
function loadState(){
  try{
    const r=JSON.parse(localStorage.getItem(LKEY)||"null");
    if(r){
      if(SOUNDS[r.sound]) S.sound=r.sound;
      if(r.key>=0 && r.key<12) S.key=r.key|0;
      S.minor=!!r.minor;
      if(Array.isArray(r.prog)) S.prog=r.prog.filter(c=>c && typeof c.off==="number" && Q[c.q]).slice(0,12);
      if(typeof r.preset==="string") S.preset=r.preset;
      if(RHYTHMS.indexOf(r.rhythm)>=0) S.rhythm=r.rhythm;
      if(r.bpm>=50 && r.bpm<=180) S.bpm=r.bpm|0;
      if(r.oct>=1 && r.oct<=6) S.oct=r.oct|0;
      if(typeof r.era==="number") S.era=Math.max(0,Math.min(1,r.era));
      if(typeof r.vol==="number") S.vol=Math.max(0.05,Math.min(1,r.vol));
      S.withDrums=!!r.withDrums;
      return;
    }
    /* first visit: the same tempo as the drum machine */
    const d=JSON.parse(localStorage.getItem("aog.drums.bench.v2")||"null");
    if(d && d.bpm>=50 && d.bpm<=180) S.bpm=Math.round(d.bpm);
  }catch(e){}
}
function save(){
  try{ localStorage.setItem(LKEY, JSON.stringify({sound:S.sound,key:S.key,minor:S.minor,prog:S.prog,preset:S.preset,rhythm:S.rhythm,
    bpm:S.bpm,oct:S.oct,era:S.era,vol:S.vol,withDrums:S.withDrums})); }catch(e){}
}

const STR={
  app:{en:"The Band",es:"La banda"},
  kicker:{en:"A band in two taps.",es:"Una banda en dos toques."},
  lead:{en:"Brass, woodwinds, strings and percussion, recorded for real. Tap a chord, or play the keys.",es:"Metales, maderas, cuerdas y percusión, grabados de verdad. Toca un acorde o toca las teclas."},
  drums:{en:"The drum machine",es:"La caja de ritmos"}, decks:{en:"The turntables",es:"Los tocadiscos"},
  instrument:{en:"Instrument",es:"Instrumento"},
  grpBrass:{en:"Brass",es:"Metales"}, grpWinds:{en:"Woodwinds",es:"Maderas"},
  grpStrings:{en:"Strings",es:"Cuerdas"}, grpPerc:{en:"Percussion",es:"Percusión"}, grpBands:{en:"Bands",es:"Bandas"}, grpAll:{en:"Everyone",es:"Todos"},
  loadingPlayers:{en:"Getting the {name} ready · {n} of {all} players. The ready ones play now.",es:"Preparando: {name} · {n} de {all} instrumentos. Los que están listos ya suenan."},
  drumThree:{en:"A waltz counts in threes, so it plays without your four-beat drum beat.",es:"Un vals cuenta de tres en tres, así que suena sin tu ritmo de batería de cuatro."},
  loading:{en:"Getting the {name} ready… {n} of {all}",es:"Preparando: {name}… {n} de {all}"},
  stand:{en:"Until then you hear a stand-in.",es:"Mientras tanto suena un sustituto."},
  ready:{en:"Ready. Every note is a real player.",es:"Listo. Cada nota es un músico de verdad."},
  readyWho:{en:"Ready: {who}. Every note is a real player.",es:"Listo: {who}. Cada nota es un músico de verdad."},
  more:{en:"Ready to play. Adding the loud and short notes… {n} of {all}",es:"Listo para tocar. Sumando las notas fuertes y cortas… {n} de {all}"},
  loadFail:{en:"The recordings did not load. Check the internet, then pick the instrument again.",es:"No cargaron las grabaciones. Revisa el internet y vuelve a elegir el instrumento."},
  chordsH:{en:"Chords",es:"Acordes"},
  keyLab:{en:"Key",es:"Tono"}, moodLab:{en:"Mood",es:"Ánimo"},
  major:{en:"Major · bright",es:"Mayor · brillante"}, minorW:{en:"Minor · moody",es:"Menor · melancólico"},
  padsLine:{en:"Hold a pad to hear the band play a chord. Every pad fits this key.",es:"Mantén un pad para oír a la banda tocar un acorde. Todos los pads van con este tono."},
  wheelH:{en:"Chord wheel",es:"Rueda de acordes"},
  wheelLine:{en:"Tap any chord to hear it. The six light ones are your pads in this key. Turn the wheel to change key.",es:"Toca cualquier acorde para oírlo. Los seis claros son tus pads en este tono. Gira la rueda para cambiar de tono."},
  wheelL:{en:"◀ Turn to {k}",es:"◀ Girar a {k}"}, wheelR:{en:"Turn to {k} ▶",es:"Girar a {k} ▶"},
  wheelMajor:{en:"major",es:"mayor"}, wheelMinor:{en:"minor",es:"menor"},
  wheelGroup:{en:"Chord wheel. Tap a chord to hear it.",es:"Rueda de acordes. Toca un acorde para oírlo."},
  wheelChord:{en:"{c} chord",es:"Acorde {c}"}, wheelPad:{en:"pad {n}",es:"pad {n}"},
  patternLab:{en:"Start from a chord pattern",es:"Empieza con un patrón de acordes"},
  pickPattern:{en:"Choose a pattern…",es:"Elige un patrón…"}, myOwn:{en:"My own pattern",es:"Mi propio patrón"},
  rhythmLab:{en:"How the band plays",es:"Cómo toca la banda"},
  yourPattern:{en:"Your chord pattern · one chord for each bar",es:"Tu patrón de acordes · un acorde por compás"},
  progEmpty:{en:"Pick a pattern above, or press Make my own.",es:"Elige un patrón arriba, o pulsa Hacer el mío."},
  ownOn:{en:"Tap the chord pads or the wheel in the order you want. Up to 8.",es:"Toca los pads o la rueda en el orden que quieras. Hasta 8."},
  play:{en:"▶ Play the chords",es:"▶ Tocar los acordes"}, stop:{en:"■ Stop",es:"■ Parar"},
  own:{en:"Make my own",es:"Hacer el mío"}, clear:{en:"Clear",es:"Borrar"},
  tempoLab:{en:"Tempo",es:"Tempo"}, bpm:{en:"{n} beats a minute",es:"{n} pulsos por minuto"},
  drumOn:{en:"Play with my drum beat",es:"Tocar con mi ritmo de batería"},
  drumFrom:{en:"From the drum machine: {name}",es:"De la caja de ritmos: {name}"},
  drumTempo:{en:"The tempo comes from your drum beat.",es:"El tempo viene de tu ritmo de batería."},
  drumNone:{en:"Make a beat on the drum machine and press Send to the turntables. It shows up here too.",es:"Haz un ritmo en la caja de ritmos y pulsa Enviar a los platos. También aparece aquí."},
  drumGo:{en:"Open the drum machine",es:"Abrir la caja de ritmos"},
  keysH:{en:"Keys",es:"Teclas"},
  lower:{en:"◀ Lower",es:"◀ Más grave"}, higher:{en:"Higher ▶",es:"Más agudo ▶"},
  rangeOut:{en:"{a} to {b}",es:"{a} a {b}"},
  litLine:{en:"Pale keys fit the chord. Orange keys are playing now.",es:"Las teclas claras encajan con el acorde. Las naranjas suenan ahora."},
  touchLine:{en:"Hold a key to hold the note. Grey keys are too high or too low for this instrument.",es:"Mantén una tecla para mantener la nota. Las teclas grises son demasiado agudas o graves para este instrumento."},
  keysLine:{en:"On a computer, A S D F G H J K L ; ' play the white keys and W E T Y U O P the black keys. Z and X go lower and higher. 1 to 6 play the chord pads. Space starts and stops.",es:"En la computadora, A S D F G H J K L Ñ ' tocan las teclas blancas y W E T Y U O P las negras. Z y X bajan y suben. Del 1 al 6 tocan los pads. La barra espaciadora empieza y para."},
  eraLab:{en:"Sound",es:"Sonido"}, eraAria:{en:"Sound era, from 1987 to 2026",es:"Época del sonido, de 1987 a 2026"},
  era87:{en:"1987 crunch",es:"Crujido de 1987"}, eraMost87:{en:"Mostly 1987",es:"Casi todo 1987"},
  eraHalf:{en:"Half and half",es:"Mitad y mitad"}, eraMost26:{en:"Mostly 2026",es:"Casi todo 2026"}, era26:{en:"Clean 2026",es:"Limpio 2026"},
  volLab:{en:"Volume",es:"Volumen"},
  send:{en:"Send to the turntables",es:"Enviar a los platos"},
  sending:{en:"Making the recording…",es:"Haciendo la grabación…"},
  sent:{en:"Sent. Open the turntables to play it.",es:"Enviado. Abre los platos para tocarlo."},
  sendNeed:{en:"Pick a chord pattern first.",es:"Primero elige un patrón de acordes."},
  sendFail:{en:"That did not work. Try again.",es:"No funcionó. Inténtalo otra vez."},
  padsBtn:{en:"Send chords to the drum machine",es:"Enviar acordes a la caja de ritmos"},   /* AOG-CHORD-PADS-V1 */
  padsSending:{en:"Making the chord pads…",es:"Haciendo los pads de acordes…"},
  padsSent:{en:"Sent. On the drum machine, press Put them on pads 3 to 8.",es:"Enviado. En la caja de ritmos, pulsa Ponerlos en los pads 3 a 8."},
  bars:{en:"bars",es:"compases"},
  credit:{en:"Every note is a real player. The brass, the woodwinds, the strings, the harp and the percussion come from VS Chamber Orchestra: Community Edition by Versilian Studios, and the saxophone from Weresax by Karoryfer Samples. Both are given to everyone (public domain).",es:"Cada nota es un músico de verdad. Los metales, las maderas, las cuerdas, el arpa y la percusión vienen de VS Chamber Orchestra: Community Edition de Versilian Studios, y el saxofón de Weresax de Karoryfer Samples. Los dos son regalos para todos (dominio público)."},
  credits:{en:"Full credits",es:"Créditos completos"},
  dark:{en:"Dark",es:"Oscuro"}, light:{en:"Light",es:"Claro"}
};
function t(k, vars){ let s=(STR[k]||{})[S.lang]||k; if(vars) Object.keys(vars).forEach(v=>{ s=s.split("{"+v+"}").join(vars[v]); }); return s; }

/* the instruments: one player each, or a group of them (parts: low to high, the first plays the bass; dbl: more players
   doubling a note of the chord, [player, "b" the bass | "lo" the lowest note | "mid" the one under the top | "top",
   octaves up in semitones]). gain levels them, so the same chord comes out about equally loud on each (measured,
   AOG-BAND-V1); rev = the room; stand = the stand-in's colour while the recordings load. The menu shows them in this
   order, under their group's name.
   AOG-BAND-MORE-V1 (2026-10-04) — Jimmy: "Can all instruments have MULTIPLE VERSIONS OF HOW THEY SOUND? Like a lot more
   than they all currently have!?" More players from the same library (VSCO 2 CE, CC0): the string sections, held and
   plucked, the double bass and the harp; the trumpet with two mutes and the horn with one; the piccolo; trumpet, trombone,
   flute, oboe and bassoon with vibrato (their short notes are the plain ones'). And bands made of them. */
const SOUNDS={
  trumpet: {grp:"grpBrass", en:"Trumpet",          es:"Trompeta",        gain:1.4, rev:0.14, stand:"brass"},
  trumpet_vib:{grp:"grpBrass", en:"Trumpet · with vibrato", es:"Trompeta · con vibrato", gain:1.486, rev:0.14, stand:"brass"},
  trumpet_harmon:{grp:"grpBrass", en:"Trumpet · jazz mute (harmon)", es:"Trompeta · sordina de jazz (harmon)", gain:1.652, rev:0.16, stand:"brass"},
  trumpet_straight:{grp:"grpBrass", en:"Trumpet · straight mute", es:"Trompeta · sordina recta", gain:1.387, rev:0.16, stand:"brass"},
  trombone:{grp:"grpBrass", en:"Trombone",         es:"Trombón",         gain:1.05, rev:0.14, stand:"brass"},
  trombone_vib:{grp:"grpBrass", en:"Trombone · with vibrato", es:"Trombón · con vibrato", gain:0.967, rev:0.14, stand:"brass"},
  horn:    {grp:"grpBrass", en:"French horn",      es:"Corno francés",   gain:1.01, rev:0.18, stand:"brass"},
  horn_mute:{grp:"grpBrass", en:"French horn · muted", es:"Corno francés · con sordina", gain:1.181, rev:0.18, stand:"brass"},
  tuba:    {grp:"grpBrass", en:"Tuba",             es:"Tuba",            gain:1.06, rev:0.12, stand:"brass"},
  brass:   {grp:"grpBrass", en:"Brass section · all four", es:"Sección de metales · los cuatro", parts:["tuba","trombone","horn","trumpet"], gain:1.07, rev:0.16, stand:"brass",
    who:{en:"tuba, trombone, French horn and trumpet",es:"tuba, trombón, corno francés y trompeta"}},
  brass_mute:{grp:"grpBrass", en:"Brass section · with mutes", es:"Sección de metales · con sordinas", parts:["trombone","horn_mute","trumpet_straight","trumpet_harmon"], gain:1.419, rev:0.17, stand:"brass",
    who:{en:"trombone, muted French horn and two muted trumpets",es:"trombón, corno francés con sordina y dos trompetas con sordina"}},
  piccolo: {grp:"grpWinds", en:"Piccolo",          es:"Flautín",         gain:1.506, rev:0.16, stand:"wind"},
  flute:   {grp:"grpWinds", en:"Flute",            es:"Flauta",          gain:1.33, rev:0.16, stand:"wind"},
  flute_vib:{grp:"grpWinds", en:"Flute · with vibrato", es:"Flauta · con vibrato", gain:1.499, rev:0.16, stand:"wind"},
  clarinet:{grp:"grpWinds", en:"Clarinet",         es:"Clarinete",       gain:1.71, rev:0.15, stand:"wind"},
  oboe:    {grp:"grpWinds", en:"Oboe",             es:"Oboe",            gain:0.96, rev:0.15, stand:"wind"},
  oboe_vib:{grp:"grpWinds", en:"Oboe · with vibrato", es:"Oboe · con vibrato", gain:1.356, rev:0.15, stand:"wind"},
  bassoon: {grp:"grpWinds", en:"Bassoon",          es:"Fagot",           gain:1.11, rev:0.14, stand:"wind"},
  bassoon_vib:{grp:"grpWinds", en:"Bassoon · with vibrato", es:"Fagot · con vibrato", gain:1.279, rev:0.14, stand:"wind"},
  /* AOG-BAND-SAX-V1 (2026-10-03) — Jimmy: "You can add the Saxophone after everything else is deployed". An alto saxophone
     from Weresax by Karoryfer Samples (CC0), recorded on every note; held notes only, so its short notes are held ones let go */
  sax:     {grp:"grpWinds", en:"Alto saxophone",   es:"Saxofón alto",    gain:1.4, rev:0.14, stand:"wind"},
  winds:   {grp:"grpWinds", en:"Woodwinds · all four", es:"Maderas · las cuatro", parts:["bassoon","clarinet","oboe","flute"], gain:1.21, rev:0.17, stand:"wind",
    who:{en:"bassoon, clarinet, oboe and flute",es:"fagot, clarinete, oboe y flauta"}},
  winds_choir:{grp:"grpWinds", en:"Woodwind choir · with piccolo", es:"Coro de maderas · con flautín", parts:["bassoon","clarinet","oboe_vib","flute_vib"], dbl:[["piccolo","top",12]], gain:1.148, rev:0.18, stand:"wind",
    who:{en:"bassoon, clarinet, oboe, flute and piccolo",es:"fagot, clarinete, oboe, flauta y flautín"}},
  violins: {grp:"grpStrings", en:"Violins",        es:"Violines",        gain:1.295, rev:0.18, stand:"string"},
  violins_pizz:{grp:"grpStrings", en:"Violins · plucked", es:"Violines · pulsados", gain:1.396, rev:0.2, stand:"pluck"},
  violas:  {grp:"grpStrings", en:"Violas",         es:"Violas",          gain:1.362, rev:0.18, stand:"string"},
  violas_pizz:{grp:"grpStrings", en:"Violas · plucked", es:"Violas · pulsadas", gain:1.021, rev:0.2, stand:"pluck"},
  cellos:  {grp:"grpStrings", en:"Cellos",         es:"Violonchelos",    gain:1.38, rev:0.17, stand:"string"},
  cellos_pizz:{grp:"grpStrings", en:"Cellos · plucked", es:"Violonchelos · pulsados", gain:1.361, rev:0.18, stand:"pluck"},
  contrabass:{grp:"grpStrings", en:"Double bass",  es:"Contrabajo",      gain:1.033, rev:0.14, stand:"string"},
  contrabass_pizz:{grp:"grpStrings", en:"Double bass · plucked", es:"Contrabajo · pulsado", gain:1.099, rev:0.14, stand:"pluck"},
  harp:    {grp:"grpStrings", en:"Harp",           es:"Arpa",            gain:1.377, rev:0.2, stand:"pluck"},
  strings: {grp:"grpStrings", en:"String section · all four", es:"Sección de cuerdas · las cuatro", parts:["contrabass","cellos","violas","violins"], dbl:[["cellos","b",12],["violins","top",12]], gain:1.024, rev:0.18, stand:"string",
    who:{en:"double bass, cellos, violas and violins",es:"contrabajo, violonchelos, violas y violines"}},
  strings_pizz:{grp:"grpStrings", en:"String section · plucked", es:"Sección de cuerdas · pulsada", parts:["contrabass_pizz","cellos_pizz","violas_pizz","violins_pizz"], dbl:[["cellos_pizz","b",12]], gain:1.212, rev:0.2, stand:"pluck",
    who:{en:"double bass, cellos, violas and violins, all plucked",es:"contrabajo, violonchelos, violas y violines, todos pulsados"}},
  /* AOG-BAND-PERC-V1 (2026-10-04) — Jimmy: "We need a string and percussion section!" From the same library: the timpani
     (five drums; rolls for held notes, single strokes for short ones) play the chord's root and fifth; marimba, xylophone
     and glockenspiel play the chord; in the section, bass drum, snare drum, cymbal, triangle and tambourine keep the beat
     of the way you choose to play (KIT_BEATS) and never play chords */
  timpani: {grp:"grpPerc", en:"Timpani",          es:"Timbales",        gain:1.907, rev:0.18, stand:"pluck", roots:true},
  marimba: {grp:"grpPerc", en:"Marimba",          es:"Marimba",         gain:1.204, rev:0.16, stand:"pluck"},
  xylophone:{grp:"grpPerc", en:"Xylophone",       es:"Xilófono",        gain:1.311, rev:0.16, stand:"pluck"},
  glockenspiel:{grp:"grpPerc", en:"Glockenspiel", es:"Glockenspiel",    gain:1.252, rev:0.18, stand:"pluck"},
  percussion:{grp:"grpPerc", en:"Percussion section · all", es:"Sección de percusión · toda", parts:["timpani","marimba","xylophone","glockenspiel"], dbl:[["timpani","b5",0]],
    kit:["bd","sn","cy","tri","tamb","roll"], gain:1.124, rev:0.18, stand:"pluck",
    who:{en:"timpani, marimba, xylophone, glockenspiel, bass drum, snare drum, cymbal, triangle and tambourine",es:"timbales, marimba, xilófono, glockenspiel, bombo, caja, platillo, triángulo y pandereta"}},
  bigband: {grp:"grpBands", en:"Big band",         es:"Big band de jazz", parts:["contrabass_pizz","trombone","sax","trumpet"], dbl:[["trombone","b",12]], gain:1.137, rev:0.14, stand:"brass",
    who:{en:"trumpet, saxophone, trombones and a plucked double bass",es:"trompeta, saxofón, trombones y un contrabajo pulsado"}},
  marching:{grp:"grpBands", en:"Marching band",    es:"Banda de marcha", parts:["tuba","trombone","sax","trumpet"], dbl:[["piccolo","top",12]], gain:1.031, rev:0.14, stand:"brass",
    who:{en:"tuba, trombone, saxophone, trumpet and piccolo",es:"tuba, trombón, saxofón, trompeta y flautín"}},
  mariachi:{grp:"grpBands", en:"Mariachi",         es:"Mariachi",        parts:["contrabass_pizz","violins","violins","trumpet_vib"], dbl:[["trumpet_vib","mid",0],["harp","b",12]], gain:1.223, rev:0.15, stand:"brass",
    who:{en:"two trumpets, violins, harp and a plucked double bass",es:"dos trompetas, violines, arpa y un contrabajo pulsado"}},
  /* AOG-BAND-ORCH-V1 (2026-10-04) — Jimmy: "Can one of the agents make the ORCHESTRA tab, where everyone plays!" Every
     player of the band, voiced as an orchestra is: the bass line on double bass and tuba, the timpani on the root, cellos
     and bassoon an octave up, the harp two octaves up; the middle on trombone, violas, horn, clarinet and saxophone; the
     top on trumpet, oboe and violins, with violins, flute and (lightly) glockenspiel an octave up; a cymbal at the start of
     every four bars. In the ways of playing that have a beat, the violins and violas hold the chord softly under the winds.
     It loads lean (one recording per note, only the notes it uses) and each player joins in as soon as its notes are in. */
  orchestra:{grp:"grpAll", en:"Orchestra · everyone plays", es:"Orquesta · todos tocan", parts:["contrabass","trombone","horn","trumpet"],
    dbl:[["tuba","b",0],["timpani","b",0],["cellos","b",12],["bassoon","b",12],["harp","b",24],["violas","lo",0],["sax","mid",0],["clarinet","mid",0],
         ["oboe","top",0],["violins","top",0],["violins","top",12],["flute","top",12],["glockenspiel","top",12]],
    kit:["cy"], hold:["violins","violas"], trim:{glockenspiel:0.35, kit:2.5}, lean:true, gain:0.508, rev:0.2, stand:"string",
    who:{en:"every player in the band",es:"todos los músicos de la banda"}}
};
/* how loud each player is next to the others: a held note in the middle of its reach comes out as loud on each (measured,
   AOG-BAND-V1, AOG-BAND-MORE-V1) */
const PLAYER={trumpet:0.89, trombone:1.11, horn:1.18, tuba:1.07, flute:0.93, clarinet:0.80, oboe:0.94, bassoon:1.14, sax:0.89,
  trumpet_vib:0.888, trumpet_harmon:0.858, trumpet_straight:0.834, trombone_vib:1.196, horn_mute:1.085, piccolo:0.885, flute_vib:0.945, oboe_vib:1.038, bassoon_vib:1.103,
  violins:1.097, violas:1.065, cellos:1.096, contrabass:1.389, violins_pizz:2.376, violas_pizz:2.539, cellos_pizz:2.118, contrabass_pizz:2.469, harp:1.821,
  timpani:1.299, marimba:1.881, xylophone:1.806, glockenspiel:1.692,
  kit:5.07};  /* a bass drum stroke as loud as a player's note; the other pieces a little under it (KIT_MIX) */
/* players whose note is struck or plucked: it rings out by itself, and a key let go lets it ring a moment longer */
const PLUCKED={violins_pizz:1, violas_pizz:1, cellos_pizz:1, contrabass_pizz:1, harp:1, timpani:1, marimba:1, xylophone:1, glockenspiel:1};
/* the unpitched pieces' levels next to each other (the kit is one player: PLAYER.kit) */
const KIT_MIX={bd:1, sn:0.74, cy:0.3, tri:0.27, tamb:0.25, roll:0.4};   /* measured: snare 1 dB under the bass drum, cymbal and roll 3, tambourine 5, triangle 6 */
function soundName(id){ const s=SOUNDS[id]; return s? (S.lang==="es"?s.es:s.en) : id; }
/* the parts of a sound, as written (one player can take two parts) */
function lineup(id){ return (SOUNDS[id]&&SOUNDS[id].parts) || [id]; }
/* every player a sound needs, once each (the parts and the doublings): these are the recordings it loads */
function partsOf(id){ const s=SOUNDS[id], out=[]; lineup(id).concat(((s&&s.dbl)||[]).map(d=>d[0])).forEach(p=>{ if(out.indexOf(p)<0) out.push(p); }); return out; }
/* the notes a player reaches: from a step below its lowest recording to a step above its highest */
function rangeOf(inst){ const m=MAN[inst]; return [m.sus[0]-1, m.sus[m.sus.length-1]+1]; }
function soundRange(id){ let lo=999, hi=0; partsOf(id).forEach(p=>{ const r=rangeOf(p); lo=Math.min(lo,r[0]); hi=Math.max(hi,r[1]); }); return [lo,hi]; }

/* ── music: keys, chords (the piano's) ── */
const Q={maj:[0,4,7], min:[0,3,7], dom7:[0,4,7,10], maj7:[0,4,7,11], m7:[0,3,7,10]};
const SUF={maj:"", min:"m", dom7:"7", maj7:"maj7", m7:"m7"};
const SUF_ES={maj:"", min:" m", dom7:"7", maj7:" maj7", m7:" m7"};
const NAMES={sharp:["C","C♯","D","D♯","E","F","F♯","G","G♯","A","A♯","B"], flat:["C","D♭","D","E♭","E","F","G♭","G","A♭","A","B♭","B"]};
const SOLFA={sharp:["Do","Do♯","Re","Re♯","Mi","Fa","Fa♯","Sol","Sol♯","La","La♯","Si"], flat:["Do","Re♭","Re","Mi♭","Mi","Fa","Sol♭","Sol","La♭","La","Si♭","Si"]};
const KEY_NAMES={en:["C","D♭","D","E♭","E","F","F♯","G","A♭","A","B♭","B"], es:["Do","Re♭","Re","Mi♭","Mi","Fa","Fa♯","Sol","La♭","La","Si♭","Si"]};
function flats(){ const major=S.minor?(S.key+3)%12:S.key; return [5,10,3,8,1].indexOf(major)>=0; }
function pcName(pc){ const set=flats()?"flat":"sharp"; return (S.lang==="es"?SOLFA:NAMES)[set][((pc%12)+12)%12]; }
function chordName(c){ const pc=((S.key+c.off)%12+12)%12; return rootName(pc, c.q)+(S.lang==="es"?SUF_ES:SUF)[c.q]; }
/* a root in the key is spelled like the key; one outside it (the chord wheel lets you pick those) the usual way round the wheel */
function rootName(pc, q){
  const major=S.minor?(S.key+3)%12:S.key, deg=((pc-major)%12+12)%12;
  if([0,2,4,5,7,9,11].indexOf(deg)>=0) return pcName(pc);
  const rel=(q==="min"||q==="m7") ? (pc+3)%12 : pc;
  return (S.lang==="es"?SOLFA:NAMES)[(rel*7)%12<=6?"sharp":"flat"][pc];
}
/* six pads: the chords that belong to the key (numbers are steps of the scale) */
const PADS_MAJOR=[{n:1,off:0,q:"maj"},{n:2,off:2,q:"min"},{n:3,off:4,q:"min"},{n:4,off:5,q:"maj"},{n:5,off:7,q:"maj"},{n:6,off:9,q:"min"}];
/* AOG-PADS-1TO6-V1 (2026-10-03) — Jimmy: "The wheel the the pad chords have the wrong numbers. It is 134567, not 123456".
   The pads count 1 to 6 in a minor key too (they had been the chords' steps in the scale: 1 3 4 5 6 7) */
const PADS_MINOR=[{n:1,off:0,q:"min"},{n:2,off:3,q:"maj"},{n:3,off:5,q:"min"},{n:4,off:7,q:"min"},{n:5,off:8,q:"maj"},{n:6,off:10,q:"maj"}];
function pads(){ return S.minor?PADS_MINOR:PADS_MAJOR; }
const C=(off,q)=>({off:off,q:q||"maj"});
/* the piano's eighteen patterns, in the same three groups (AOG-PIANO-PATTERNS-V2); the ids never change */
const PRESETS=[
  {id:"pop",     g:"pop",  en:"Pop · 1 5 6 4",             es:"Pop · 1 5 6 4",              minor:false, chords:[C(0),C(7),C(9,"min"),C(5)]},
  {id:"fifties", g:"pop",  en:"Fifties · 1 6 4 5",         es:"Años 50 · 1 6 4 5",          minor:false, chords:[C(0),C(9,"min"),C(5),C(7)]},
  {id:"sadpop",  g:"pop",  en:"Sad pop · 6 4 1 5",         es:"Pop triste · 6 4 1 5",       minor:false, chords:[C(9,"min"),C(5),C(0),C(7)]},
  {id:"anime",   g:"pop",  en:"Anime and J-pop · 4 5 3 6", es:"Anime y J-pop · 4 5 3 6",    minor:false, chords:[C(5),C(7),C(4,"min"),C(9,"min")]},
  {id:"canon",   g:"pop",  en:"Canon · 8 chords",          es:"Canon · 8 acordes",          minor:false, chords:[C(0),C(7),C(9,"min"),C(4,"min"),C(5),C(0),C(5),C(7)]},
  {id:"three",   g:"pop",  en:"Three chords · 1 4 5 1",    es:"Tres acordes · 1 4 5 1",     minor:false, chords:[C(0),C(5),C(7),C(0)]},
  {id:"fiesta",  g:"pop",  en:"Fiesta · 1 4 5 4",          es:"Fiesta · 1 4 5 4",           minor:false, chords:[C(0),C(5),C(7),C(5)]},
  {id:"rock",    g:"pop",  en:"Rock · 1 ♭7 4 1",           es:"Rock · 1 ♭7 4 1",            minor:false, chords:[C(0),C(10),C(5),C(0)]},
  {id:"hymn",    g:"pop",  en:"Hymn and gospel · 1 4 1 5", es:"Himno y góspel · 1 4 1 5",  minor:false, chords:[C(0),C(5),C(0),C(7)]},
  {id:"wheel",   g:"pop",  en:"Around the wheel · 3 6 2 5 1", es:"Por la rueda · 3 6 2 5 1", minor:false, chords:[C(4,"dom7"),C(9,"dom7"),C(2,"dom7"),C(7,"dom7"),C(0),C(0)]},
  {id:"blues",   g:"jazz", en:"Blues · 12 bars",           es:"Blues · 12 compases",        minor:false, chords:[C(0,"dom7"),C(0,"dom7"),C(0,"dom7"),C(0,"dom7"),C(5,"dom7"),C(5,"dom7"),C(0,"dom7"),C(0,"dom7"),C(7,"dom7"),C(5,"dom7"),C(0,"dom7"),C(7,"dom7")]},
  {id:"jazz",    g:"jazz", en:"Jazz · 2 5 1",              es:"Jazz · 2 5 1",               minor:false, chords:[C(2,"m7"),C(7,"dom7"),C(0,"maj7"),C(0,"maj7")]},
  {id:"turn",    g:"jazz", en:"Jazz turnaround · 1 6 2 5", es:"Vuelta de jazz · 1 6 2 5",   minor:false, chords:[C(0,"maj7"),C(9,"m7"),C(2,"m7"),C(7,"dom7")]},
  {id:"mblues",  g:"jazz", en:"Minor blues · 12 bars",     es:"Blues menor · 12 compases",  minor:true,  chords:[C(0,"m7"),C(0,"m7"),C(0,"m7"),C(0,"m7"),C(5,"m7"),C(5,"m7"),C(0,"m7"),C(0,"m7"),C(7,"dom7"),C(5,"m7"),C(0,"m7"),C(7,"dom7")]},
  {id:"minor",   g:"min",  en:"Minor groove",              es:"Ritmo menor",      minor:true,  chords:[C(0,"min"),C(8),C(3),C(10)]},
  {id:"flamenco",g:"min",  en:"Flamenco",                  es:"Flamenco",         minor:true,  chords:[C(0,"min"),C(10),C(8),C(7)]},
  {id:"mfolk",   g:"min",  en:"Minor folk",                es:"Folk menor",       minor:true,  chords:[C(0,"min"),C(5,"min"),C(7),C(0,"min")]},
  {id:"epic",    g:"min",  en:"Epic",                      es:"Épico",            minor:true,  chords:[C(0,"min"),C(10),C(8),C(10)]}
];
const PRESET_GROUPS={pop:{en:"Pop, rock and folk",es:"Pop, rock y folk"}, jazz:{en:"Blues and jazz",es:"Blues y jazz"}, min:{en:"Minor and moody",es:"Menor y melancólico"}};
const RHYTHM_WORDS={
  long:{en:"Long notes · one chord a bar",es:"Notas largas · un acorde por compás"},
  swell:{en:"Swell · soft to loud",es:"Crecer · de suave a fuerte"},
  stabs:{en:"Stabs · short and punchy",es:"Golpes · cortos y con fuerza"},
  offbeat:{en:"Off-beat · ska and reggae",es:"Contratiempo · ska y reggae"},
  march:{en:"March · oom-pah",es:"Marcha · um-pa"},
  waltz:{en:"Waltz · oom-pah-pah, three beats",es:"Vals · um-pa-pa, tres tiempos"},
  fanfare:{en:"Fanfare · ta-ta-ta-taa",es:"Fanfarria · ta-ta-ta-taa"},
  broken:{en:"Broken · one note at a time",es:"Arpegio · una nota a la vez"}
};
/* a chord's notes in the middle of the keyboard, moved as little as possible from the last chord (the piano's) */
let lastVoicing=null;
function voicing(c, prev){
  const root=((S.key+c.off)%12+12)%12, pcs=Q[c.q].map(i=>(root+i)%12), out=[];
  for(let inv=0; inv<pcs.length; inv++){
    const order=pcs.slice(inv).concat(pcs.slice(0,inv));
    for(let lo=52; lo<=66; lo++){
      if(lo%12!==order[0]) continue;
      const v=[lo]; for(let j=1;j<order.length;j++){ let n=v[j-1]+1; while(n%12!==order[j]) n++; v.push(n); }
      if(v[v.length-1]<=79) out.push(v);
    }
  }
  const mid=v=>v.reduce((a,b)=>a+b,0)/v.length;
  const cost=v=>prev ? v.reduce((s,n)=>s+Math.min.apply(null, prev.map(m=>Math.abs(n-m))),0)+0.3*Math.abs(mid(v)-63) : Math.abs(mid(v)-62);
  out.sort((a,b)=>cost(a)-cost(b));
  return out[0];
}
function bassOf(c){ return 36+(((S.key+c.off)%12)+12)%12; }
function mtof(m){ return 440*Math.pow(2,(m-69)/12); }
function noteLabel(m){ return pcName(m)+(Math.floor(m/12)-1); }
function chordPcs(c){ return Q[c.q].map(i=>((S.key+c.off+i)%12+12)%12); }
/* a note moved by octaves into a player's reach (null when it cannot be) */
function fitIn(m, inst){
  const r=rangeOf(inst);
  let x=m; while(x<r[0]) x+=12; while(x>r[1]) x-=12;
  return x>=r[0] ? x : null;
}
/* who plays what in a chord: one player takes every note it can reach, and its bass is the root under the chord, or
   the chord's own root when it cannot go lower (dup: a held chord does not play that note twice); in a section, the
   first part takes the bass and the others the chord, low to high (a seventh's fourth note goes to the top player too);
   then the doublings (dbl) add the bass or a chord note an octave away on another player, as an orchestra doubles its
   bass line and its tune ("b5": the bass's fifth, as a timpanist tunes two drums). No player sounds the same note twice.
   The timpani alone (roots) play only the root and the fifth. */
function chordParts(c, vo){
  const parts=lineup(S.sound), bass=bassOf(c), out=[];
  const has={}, add=(inst, m, bs, fifth)=>{ if(m==null || has[inst+":"+m]) return; has[inst+":"+m]=1; const p={inst:inst, m:m}; if(bs) p.bass=true; if(fifth) p.fifth=true; out.push(p); };
  if(parts.length===1 && SOUNDS[S.sound] && SOUNDS[S.sound].roots){ const inst=parts[0]; add(inst, fitIn(bass, inst), true); add(inst, fitIn(bass+7, inst), true, true); return out; }
  if(parts.length===1){
    const inst=parts[0], seen={};
    vo.forEach(m=>{ const x=fitIn(m, inst); if(x!=null && !seen[x]){ seen[x]=1; out.push({inst:inst, m:x}); } });
    const lowest=Math.min.apply(null, out.map(o=>o.m)), b=fitIn(bass, inst);
    if(b!=null) out.unshift(b<lowest && !seen[b] ? {inst:inst, m:b, bass:true} : {inst:inst, m:b, bass:true, dup:true});
    return out;
  }
  add(parts[0], fitIn(bass, parts[0]), true);
  vo.forEach((m,i)=>{ const inst=parts[Math.min(1+i, parts.length-1)]; add(inst, fitIn(m, inst)); });
  ((SOUNDS[S.sound]||{}).dbl||[]).forEach(([inst, w, up])=>{
    const src = w==="b" ? bass : w==="b5" ? bass+7 : w==="lo" ? vo[0] : w==="mid" ? vo[Math.max(0, vo.length-2)] : vo[vo.length-1];
    add(inst, fitIn(src+(up||0), inst), w==="b"||w==="b5", w==="b5");
  });
  return out;
}
/* who plays a key: the one player, or in a section the part whose reach is centred nearest the note */
function playerFor(m, id){
  const parts=partsOf(id||S.sound); let best=null, bd=1e9;
  parts.forEach(p=>{ const r=rangeOf(p); if(m<r[0]||m>r[1]) return; const d=Math.abs(m-(r[0]+r[1])/2); if(d<bd){ bd=d; best=p; } });
  return best;
}

/* ══════════════════════════════════════════════════════════════════════════
   THE ENGINE — one chain per audio context (live, or offline for a recording)
   voices → [room] → 1987 crunch (sample-and-hold at 26,040 Hz, twelve bits) → tone → glue → limiter → volume
   ══════════════════════════════════════════════════════════════════════════ */
const CRUNCH_SRC=`
class AogCrunch extends AudioWorkletProcessor{
  static get parameterDescriptors(){ return [{name:'era', defaultValue:0, minValue:0, maxValue:1}]; }
  constructor(){ super(); this.ph=0; this.h0=0; this.h1=0; this.step=26040/sampleRate; }
  process(inputs, outputs, params){
    const inp=inputs[0], out=outputs[0]; if(!out||!out.length) return true;
    const a=params.era, L=inp&&inp[0], R=inp&&(inp[1]||inp[0]);
    const oL=out[0], oR=out[1]||null, n=oL.length;
    for(let i=0;i<n;i++){
      const e=a.length>1?a[i]:a[0], x=L?L[i]:0, y=R?R[i]:0;
      this.ph+=this.step;
      if(this.ph>=1){ this.ph-=1; this.h0=Math.round(x*2048)/2048; this.h1=Math.round(y*2048)/2048; }
      oL[i]=e*this.h0+(1-e)*x;
      if(oR) oR[i]=e*this.h1+(1-e)*y;
    }
    return true;
  }
}
registerProcessor('aog-crunch', AogCrunch);`;
let crunchURL=null;
function crunchModule(){ if(!crunchURL) crunchURL=URL.createObjectURL(new Blob([CRUNCH_SRC],{type:"application/javascript"})); return crunchURL; }
/* the same noise every time (a fixed seed, like the drum machine's ROM) */
function seeded(seed){ let x=seed|0||0x2f6b1a3d; return ()=>{ x^=x<<13; x^=x>>>17; x^=x<<5; return ((x>>>0)/4294967296)*2-1; }; }
function roomIR(c){
  const sr=c.sampleRate, len=Math.floor(sr*2.6), ir=c.createBuffer(2,len,sr);
  for(let ch=0; ch<2; ch++){
    const d=ir.getChannelData(ch), r=seeded(ch?0x51a7c3e1:0x2f6b1a3d), pre=Math.floor(sr*0.012); let lp=0;
    for(let i=pre;i<len;i++){ const tt=(i-pre)/sr, k=0.25+0.7*Math.min(1,tt/1.6); lp+= (r()-lp)*(1-k*0.85); d[i]=lp*Math.exp(-6.9*tt/2.4); }
  }
  return ir;
}
function eraHz(e){ return Math.exp(Math.log(18000)*(1-e)+Math.log(8500)*e); }
function makeChain(c){
  const ch={c:c};
  ch.bus=c.createGain(); ch.send=c.createGain(); ch.pre=c.createGain();
  const cv=c.createConvolver(); cv.buffer=roomIR(c); ch.send.connect(cv);
  const ret=c.createGain(); ret.gain.value=0.9; cv.connect(ret); ret.connect(ch.pre);
  ch.bus.connect(ch.pre);
  ch.lp=c.createBiquadFilter(); ch.lp.type="lowpass"; ch.lp.Q.value=0.5;
  ch.comp=c.createDynamicsCompressor();
  ch.comp.threshold.value=-16; ch.comp.knee.value=10; ch.comp.ratio.value=2.5; ch.comp.attack.value=0.006; ch.comp.release.value=0.25;
  ch.lim=c.createDynamicsCompressor();
  ch.lim.threshold.value=-2; ch.lim.knee.value=0; ch.lim.ratio.value=20; ch.lim.attack.value=0.002; ch.lim.release.value=0.1;
  ch.master=c.createGain(); ch.makeup=c.createGain(); ch.makeup.gain.value=1.8;
  ch.pre.connect(ch.lp); ch.lp.connect(ch.comp); ch.comp.connect(ch.makeup); ch.makeup.connect(ch.lim); ch.lim.connect(ch.master); ch.master.connect(c.destination);
  ch.crunch=null;
  return ch;
}
async function addCrunch(ch){             /* spliced in when ready; until then the chain plays clean */
  try{
    if(!ch.c.audioWorklet) return;
    await ch.c.audioWorklet.addModule(crunchModule());
    const n=new AudioWorkletNode(ch.c,"aog-crunch",{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[2]});
    ch.pre.disconnect(ch.lp); ch.pre.connect(n); n.connect(ch.lp); ch.crunch=n;
  }catch(e){}
}
function setEra(ch, e, at){
  const c=ch.c, now=at==null?c.currentTime:at;
  ch.lp.frequency.setTargetAtTime(eraHz(e), now, 0.02);
  if(ch.crunch){ const p=ch.crunch.parameters.get("era"); p.setTargetAtTime(e, now, 0.02); }
}
function volGain(v){ return Math.max(0,Math.min(1,v))*0.95; }
function setSendLevel(ch, id){ ch.send.gain.value=SOUNDS[id].rev; }

/* ── the recordings: one set per player, loaded when its sound is picked; only the players of the sound you picked
   are kept, so a phone keeps its memory ── */
const SETS={};
function setOf(key){ return SETS[key]||(SETS[key]={buf:{}, start:{}, state:"idle", done:0, total:0, job:null, ready:false}); }
/* the orchestra loads lean (AOG-BAND-ORCH-V1): a set "lean:<player>" holds one held recording per note (the loud one,
   where there is one), only the notes the orchestra can ask that player for, and short notes only for the timpani; its
   kit, only the cymbal. So an iPad keeps up, and each player joins in as soon as its own notes are in. */
const LEAN=Object.keys(SOUNDS).find(id=>SOUNDS[id].lean);
function setKey(inst, id){ return (SOUNDS[id||S.sound]||{}).lean ? "lean:"+inst : inst; }
function instOf(key){ return key.slice(0,5)==="lean:" ? key.slice(5) : key; }
/* every set a sound needs: its players, and the kit if it has a beat section */
function setsOf(id){ return partsOf(id).concat((SOUNDS[id]||{}).kit ? ["kit"] : []).map(p=>setKey(p, id)); }
const LEAN_NOTES={};
function leanNotes(inst){
  if(LEAN_NOTES[inst]) return LEAN_NOTES[inst];
  const s=SOUNDS[LEAN], want=new Set(), r=rangeOf(inst), man=MAN[inst];
  lineup(LEAN).map((p,i)=>[p, i===0?"b":"c", 0]).concat(s.dbl||[]).forEach(([p, w, up])=>{
    if(p!==inst) return;
    const span = w==="b" ? [36,47] : w==="b5" ? [43,54] : [52,79];        /* the bass under every chord; the chord's notes */
    for(let q=span[0]; q<=span[1]; q++){ const x=fitIn(q+(up||0), inst); if(x==null) continue; want.add(x);
      if(w==="b"){ const f=fitIn(x+7, inst); if(f!=null){ want.add(f); if(f-12>=r[0]) want.add(f-12); } } }   /* and a march's fifth */
  });
  const [lo,hi]=soundRange(LEAN); for(let q=lo; q<=hi; q++) if(playerFor(q, LEAN)===inst) want.add(q);   /* the keys it plays */
  const sus=new Set(), stac=new Set();
  want.forEach(q=>{ sus.add(nearest(man.sus, q)); if(man.stac.length) stac.add(nearest(man.stac, q)); });
  return (LEAN_NOTES[inst]={sus:[...sus].sort((a,b)=>a-b), stac:[...stac].sort((a,b)=>a-b)});
}
function filesOf(key){
  const inst=instOf(key), lean=key!==inst, m=MAN[inst], f=[];
  if(m.hits){ (lean ? SOUNDS[LEAN].kit : Object.keys(m.hits)).forEach(p=>(m.hits[p]||[]).forEach(h=>f.push(h))); return f; }
  if(lean){ const ln=leanNotes(inst); ln.sus.forEach(n=>f.push(n+(m.susL.indexOf(n)>=0?"l":"s"))); if(inst==="timpani") ln.stac.forEach(n=>f.push(n+"t")); return f; }
  m.sus.forEach(n=>f.push(n+"s")); m.susL.forEach(n=>f.push(n+"l")); m.stac.forEach(n=>f.push(n+"t")); return f;
}
/* the files a set must have before its player plays: every soft held note (or, lean, every file it loads) */
function mainOf(key){ const inst=instOf(key); return (key!==inst || MAN[inst].hits) ? filesOf(key) : MAN[inst].sus.map(n=>n+"s"); }
/* where a file lives: a player's own folder, but the vibrato players' short notes are the plain player's (stacDir) */
function fileUrl(key, f){ const inst=instOf(key), d=(f.slice(-1)==="t" && MAN[inst].stacDir) || inst; return "/audio/band/"+d+"/"+f+".mp3"; }
function decodeWith(dec, ab){ return new Promise((ok,no)=>{ const r=dec.decodeAudioData(ab, ok, no); if(r && r.then) r.then(ok,no); }); }
/* where the sound starts in a decoded file (an MP3 can carry a little silence in front) */
function onsetOf(buf){
  const d=buf.getChannelData(0); let pk=0; for(let i=0;i<d.length;i++){ const a=Math.abs(d[i]); if(a>pk) pk=a; }
  let i=0; const thr=pk*0.03; while(i<d.length && Math.abs(d[i])<thr) i++;
  return Math.max(0, i-Math.floor(0.002*buf.sampleRate))/buf.sampleRate;
}
function loadInst(key, onStep, lanes){
  const set=setOf(key);
  if(set.job) return set.job;
  set.state="loading"; set.done=0;
  const OC=window.OfflineAudioContext||window.webkitOfflineAudioContext;
  const dec=new OC(1, 1, 32000);
  const files=filesOf(key), main=mainOf(key); set.total=files.length;
  let idx=0;
  async function worker(){
    while(idx<files.length){
      const f=files[idx++];
      try{
        const r=await fetch(fileUrl(key, f)); if(!r.ok) throw new Error(r.status);
        const b=await decodeWith(dec, await r.arrayBuffer());
        set.buf[f]=b; set.start[f]=onsetOf(b);
      }catch(e){}
      set.done++;
      if(!set.ready && main.every(x=>set.buf[x])) set.ready=true;
      if(onStep) onStep();
    }
  }
  const ws=[]; for(let i=0;i<(lanes||6);i++) ws.push(worker());
  set.job=Promise.all(ws).then(()=>{
    set.state = set.ready ? "ready" : "failed";
    if(!set.ready) set.job=null;
    if(onStep) onStep();
    return set;
  });
  return set.job;
}
/* a sound's recordings; only its own sets are kept. A big group (the orchestra) fetches two players at a time, the
   strings and the horn and trumpet first, so the first ones are ready soon and the phone is not asked for everything at
   once; picking another sound stops it */
const LEAN_FIRST=["violins","cellos","contrabass","horn","trumpet","flute","violas","oboe","clarinet","trombone"];
let LOADING="";
function loadSound(id, onStep){
  const keys=setsOf(id); LOADING=id;
  Object.keys(SETS).forEach(k=>{ if(keys.indexOf(k)<0 && SETS[k].state!=="idle") delete SETS[k]; });
  if(!(SOUNDS[id]||{}).lean) return Promise.all(keys.map(k=>loadInst(k, onStep)));
  const rank=k=>{ const i=LEAN_FIRST.indexOf(instOf(k)); return i<0 ? 99 : i; };
  const queue=keys.slice().sort((a,b)=>rank(a)-rank(b)), jobs=[];
  const lane=async()=>{ while(queue.length && LOADING===id){ const j=loadInst(queue.shift(), onStep, 3); jobs.push(j); await j; } };
  return Promise.all([lane(), lane()]).then(()=>Promise.all(jobs));
}
function soundReady(id){ return setsOf(id).every(k=>SETS[k] && SETS[k].ready); }
function nearest(list, m){ let best=list[0]; list.forEach(n=>{ if(Math.abs(n-m)<Math.abs(best-m)) best=n; }); return best; }

/* a voice is a little chain that ends in a gain we can fade out: stop(t) lets go, kill(t) silences at once */
function voiceShell(c, out, nodes, rel, endPad){
  return {
    nodes:nodes, rel:rel, stopped:false,
    stop(t, tau){ if(this.stopped) return; this.stopped=true; const T=Math.max(t, c.currentTime);
      rel.gain.setTargetAtTime(0, T, tau); this.end=T+tau*7+(endPad||0); this.relAt=T;
      nodes.forEach(n=>{ try{ n.stop(this.end); }catch(e){} }); },
    kill(t){ const T=Math.max(t, c.currentTime); try{ rel.gain.cancelScheduledValues(T); rel.gain.setTargetAtTime(0, T, 0.01); }catch(e){}
      this.stopped=true; this.end=T+0.08; this.relAt=T; nodes.forEach(n=>{ try{ n.stop(this.end); }catch(e){} }); }
  };
}
/* AOG-PIANO-LATE-NOTE-V1: every gain is made already holding where its sound is, so a note the engine hears a moment late
   just starts a moment late */
function gainAt(c, v){ try{ return new GainNode(c, {gain:v}); }catch(e){ const g=c.createGain(); g.gain.value=v; return g; } }
function osc(c, type, f){ const o=c.createOscillator(); o.type=type; o.frequency.value=f; return o; }
/* one player, one note. Held notes ("sus") blend the soft and the loud recording by how hard you play, as a player's
   tone grows brighter as it grows louder; a swell slides that blend from soft to loud. Short notes ("stac") are their
   own recording. */
function windVoice(c, ch, inst, m, v, when, art, swellTo, swellDur){
  const set=SETS[setKey(inst)], man=MAN[inst]; if(!set || !set.ready) return null;
  const vv=Math.max(0.05, Math.min(1, v)), srcs=[], snd=SOUNDS[S.sound], trim=(snd.trim&&snd.trim[inst])||1;
  const out=gainAt(c, PLAYER[inst]*snd.gain*trim*(0.55+0.45*vv)), rel=gainAt(c, 1);
  const play=(key, n, g, gTo)=>{
    const buf=set.buf[key]; if(!buf) return null;
    const s=c.createBufferSource(); s.buffer=buf;
    s.playbackRate.value=Math.pow(2, (m-n)/12 - (man.tune[key]||0)/1200);
    const gn=gainAt(c, g);
    if(gTo!=null){ gn.gain.setValueAtTime(g, when); gn.gain.linearRampToValueAtTime(gTo, when+swellDur); }
    s.connect(gn); gn.connect(out); s.start(when, set.start[key]||0); srcs.push(s);
    return {buf:buf, key:key, rate:s.playbackRate.value};
  };
  let main=null;
  const st=man.stac.filter(q=>set.buf[q+"t"]);                /* the short notes this set has (a lean set may have none) */
  if(art==="stac" && st.length){ const n=nearest(st, m); if(Math.abs(n-m)<=4) main=play(n+"t", n, 1); }
  if(!main){
    const avail=man.sus.filter(q=>set.buf[q+"s"]||set.buf[q+"l"]), n=nearest(avail.length?avail:man.sus, m);
    const hasS=!!set.buf[n+"s"], hasL=!!set.buf[n+"l"], lift=hasS && !hasL && man.susL.length>0 && man.susL.indexOf(n)<0;
    /* a note the library recorded soft only, in a player that has loud ones: the soft one stands in for both, rising
       8 dB (2.5 times) as you play harder, so it is as loud as its neighbours (AOG-BAND-MORE-V1); a lean set's loud
       note alone (the orchestra) stands in for the soft one too */
    const blend=x=>{ const a=Math.cos(x*Math.PI/2), b=Math.sin(x*Math.PI/2); return (hasS&&hasL) ? [a, b] : hasL ? [0, b+0.4*a] : lift ? [a+2.5*b, 0] : [1, 0]; };
    const [gS, gL]=blend(vv);
    if(swellTo!=null){ const [tS, tL]=blend(Math.max(0.05, Math.min(1, swellTo))); if(hasS) main=play(n+"s", n, gS, tS); if(hasL){ const r=play(n+"l", n, gL, tL); main=main||r; } }
    else { if(hasS) main=play(n+"s", n, gS); if(hasL && gL>0.02){ const r=play(n+"l", n, gL); main=main||r; } }
  }
  if(!main) return null;
  out.connect(rel); rel.connect(ch.bus); rel.connect(ch.send);
  const vc=voiceShell(c, ch.bus, srcs, rel);
  vc.tau=art==="stac" ? 0.03 : PLUCKED[inst] ? 0.3 : 0.07;     /* a pluck let go rings on a moment, as a string does */
  vc.natural=when+(main.buf.duration-(set.start[main.key]||0))/main.rate;
  return vc;
}
/* the stand-in, while the recordings load: a soft reedy, brassy, bowed or plucked tone made here */
function standVoice(c, ch, kind, m, v, when){
  const f=mtof(m), vv=Math.max(0.05,Math.min(1,v)), peak=0.09*(0.5+0.5*vv);
  const k={brass:["sawtooth",3+3*vv,0.04], string:["sawtooth",2.5,0.12], pluck:["triangle",4,0.005]}[kind]||["square",2.2,0.04];
  const o=osc(c, k[0], f);
  let lp; try{ lp=new BiquadFilterNode(c,{type:"lowpass", frequency:Math.min(6000, f*k[1]), Q:0.8}); }catch(e){ lp=c.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=Math.min(6000, f*3); }
  const amp=gainAt(c, peak); amp.gain.setValueAtTime(0, when); amp.gain.linearRampToValueAtTime(peak, when+k[2]);
  if(kind==="pluck") amp.gain.setTargetAtTime(0, when+0.01, 0.25);
  const rel=gainAt(c,1); o.connect(lp); lp.connect(amp); amp.connect(rel); rel.connect(ch.bus); rel.connect(ch.send);
  o.start(when);
  const vc=voiceShell(c, ch.bus, [o], rel); vc.tau=0.06;
  return vc;
}
function makeVoice(c, ch, inst, m, v, when, art, swellTo, swellDur){
  if(m<20 || m>108) return null;
  const vc=windVoice(c, ch, inst, m, v, when, art||"sus", swellTo, swellDur);
  if(vc) return vc;
  /* a group plays with the players that are ready; only until the first one is does a stand-in play */
  if(partsOf(S.sound).some(p=>{ const s=SETS[setKey(p)]; return s && s.ready; })) return null;
  return standVoice(c, ch, SOUNDS[S.sound].stand, m, v, when);
}
/* one stroke of an unpitched piece (bass drum, snare, cymbal, triangle, tambourine): the soft or the loud recording by
   how hard; a roll (the snare's) swells from soft to loud over dur seconds */
function kitVoice(c, ch, piece, v, when, dur){
  const set=SETS[setKey("kit")], hits=(MAN.kit&&MAN.kit.hits||{})[piece]; if(!set || !set.ready || !hits) return null;
  const key=hits[hits.length>1 && v>=0.68 ? 1 : 0], buf=set.buf[key]; if(!buf) return null;
  const snd=SOUNDS[S.sound], g=PLAYER.kit*snd.gain*((snd.trim&&snd.trim.kit)||1)*(KIT_MIX[piece]||1)*(0.4+0.6*Math.max(0.05,Math.min(1,v)));
  const s=c.createBufferSource(); s.buffer=buf;
  const out=gainAt(c, dur ? g*0.12 : g), rel=gainAt(c, 1);
  if(dur){ out.gain.setValueAtTime(g*0.12, when); out.gain.linearRampToValueAtTime(g, when+dur); }
  s.connect(out); out.connect(rel); rel.connect(ch.bus); rel.connect(ch.send);
  s.start(when, set.start[key]||0);
  const vc=voiceShell(c, ch.bus, [s], rel); vc.tau=0.15; vc.kit=piece;
  vc.natural=when+buf.duration-(set.start[key]||0);
  return vc;
}

/* ── the live engine ── */
let ac=null, LIVE_CH=null;
function ctx(){
  if(!ac){
    const AC=window.AudioContext||window.webkitAudioContext;
    /* an iPhone on silent mutes web audio; an instrument is something you play, so it plays like music does */
    try{ if(navigator.audioSession) navigator.audioSession.type="playback"; }catch(e){}
    ac=new AC({latencyHint:"interactive"});
    LIVE_CH=makeChain(ac);
    LIVE_CH.master.gain.value=volGain(S.vol);
    setSendLevel(LIVE_CH, S.sound);
    setEra(LIVE_CH, S.era);
    addCrunch(LIVE_CH).then(()=>setEra(LIVE_CH, S.era));
  }
  if(ac.state==="suspended") ac.resume();
  return ac;
}
const LIVE=new Map();        /* "k60" a key, "p:trumpet:60" a pad's note → its voice */
const ALL=[];                /* every voice sounding on the live context, to keep the count kind to the phone */
/* at most VOICE_CAP voices at once (AOG-BAND-ORCH-V1), so an iPad keeps up with the whole orchestra: when one more starts,
   the oldest goes first, the ones already let go before the ones still held */
const VOICE_CAP=32;
function track(vc, when){
  const now=when==null ? ac.currentTime : when;
  for(let i=ALL.length-1;i>=0;i--){ const v=ALL[i]; if((v.end&&v.end<=now)||(v.natural&&v.natural<=now)) ALL.splice(i,1); }
  ALL.push(vc);
  while(ALL.length>VOICE_CAP){
    let k=ALL.findIndex(v=>v!==vc && v.relAt!=null && v.relAt<=now); if(k<0) k=0;
    const old=ALL.splice(k,1)[0]; try{ old.kill(now); }catch(e){}
  }
}
function prune(){ const now=ac?ac.currentTime:0; for(let i=ALL.length-1;i>=0;i--){ const v=ALL[i]; if((v.end&&v.end<now)||(v.natural&&v.natural<now)) ALL.splice(i,1); } }
function noteOn(key, inst, m, v){
  if(!inst) return;
  const c=ctx(), now=c.currentTime;
  const old=LIVE.get(key); if(old){ old.stop(now, 0.05); LIVE.delete(key); }
  const vc=makeVoice(c, LIVE_CH, inst, m, v, now, "sus");
  if(!vc) return;
  vc.m=m; vc.down=true; LIVE.set(key, vc); track(vc); prune();
  litKeys();
}
function noteOff(key){
  const vc=LIVE.get(key); if(!vc) return;
  vc.down=false; vc.stop(ac.currentTime, vc.tau); LIVE.delete(key);
  litKeys();
}
function allOff(){
  if(!ac) return;
  LIVE.forEach(vc=>vc.stop(ac.currentTime, Math.min(vc.tau,0.15))); LIVE.clear();
  litKeys();
}

/* ══════════════════════════════════════════════════════════════════════════
   CHORDS — pads, the pattern, and the player
   ══════════════════════════════════════════════════════════════════════════ */
const padHeld={};
/* a chord held by a finger (a pad or the wheel): every part's note sounds while it is down */
function holdChord(tag, c, v){
  const vo=voicing(c, lastVoicing); lastVoicing=vo;
  const keys=[];
  chordParts(c, vo).filter(p=>!p.dup).forEach(p=>{ const key=tag+":"+p.inst+":"+p.m; noteOn(key, p.inst, p.m, (v||0.74)*(p.bass?0.85:1)); keys.push(key); });
  return keys;
}
function padDown(i, v){
  const c=pads()[i]; if(!c) return;
  padUp(i);
  padHeld[i]=holdChord("p"+i, c, v);
  const el=document.querySelector('.pad[data-i="'+i+'"]'); if(el) el.classList.add("hit");
  paintWheelState();
  if(S.own && S.prog.length<8){ S.prog.push({off:c.off, q:c.q}); S.preset=""; save(); paintProg(); paintProgSel(); }
}
function padUp(i){
  const keys=padHeld[i]; if(!keys) return;
  delete padHeld[i];
  keys.forEach(k=>noteOff(k));
  const el=document.querySelector('.pad[data-i="'+i+'"]'); if(el) el.classList.remove("hit");
  paintWheelState();
}
/* one bar of each way of playing: t and d in beats; w = "b" the bass, "c" the chord, "f" the bass's fifth,
   a number = one note of the chord, low to high; a = "sus" held or "stac" short; to = a swell's end strength */
function barEvents(rh, n){
  if(rh==="swell") return [{t:0,w:"b",d:3.95,v:.3,to:.95,a:"sus"},{t:0,w:"c",d:3.95,v:.3,to:.95,a:"sus"}];
  if(rh==="stabs") return [{t:0,w:"b",d:.9,v:.85,a:"stac"},{t:0,w:"c",d:.45,v:.9,a:"stac"},{t:1.5,w:"c",d:.45,v:.72,a:"stac"},{t:2,w:"b",d:.9,v:.8,a:"stac"},{t:2,w:"c",d:.45,v:.88,a:"stac"},{t:3.5,w:"c",d:.45,v:.7,a:"stac"}];
  if(rh==="offbeat") return [{t:0,w:"b",d:.9,v:.8,a:"stac"},{t:2,w:"b",d:.9,v:.75,a:"stac"}].concat([.5,1.5,2.5,3.5].map(x=>({t:x,w:"c",d:.35,v:.8,a:"stac"})));
  if(rh==="march") return [{t:0,w:"b",d:.8,v:.85,a:"stac"},{t:1,w:"c",d:.6,v:.68,a:"stac"},{t:2,w:"f",d:.8,v:.8,a:"stac"},{t:3,w:"c",d:.6,v:.68,a:"stac"}];
  if(rh==="waltz") return [{t:0,w:"b",d:.9,v:.82,a:"stac"},{t:1,w:"c",d:.6,v:.62,a:"stac"},{t:2,w:"c",d:.6,v:.58,a:"stac"}];   /* oom-pah-pah */
  if(rh==="fanfare") return [{t:0,w:"c",d:.3,v:.82,a:"stac"},{t:1/3,w:"c",d:.3,v:.7,a:"stac"},{t:2/3,w:"c",d:.3,v:.76,a:"stac"},{t:1,w:"b",d:2.9,v:.85,a:"sus"},{t:1,w:"c",d:2.9,v:.92,a:"sus"}];
  if(rh==="broken"){ const p=(n>3?[0,1,2,3,2,1,0,1]:[0,1,2,1,0,1,2,1]).map(k=>n>4 ? Math.round(k*(n-1)/3) : k);   /* a big group's notes, low to high, spread over the four steps */
    return [{t:0,w:"b",d:3.9,v:.72,a:"sus"}].concat(p.map((k,i)=>({t:i*0.5,w:k,d:0.95,v:i%2 ? 0.6 : 0.7,a:"sus"}))); }
  return [{t:0,w:"b",d:3.9,v:.7,a:"sus"},{t:0,w:"c",d:3.9,v:.7,a:"sus"}];
}
/* the beat section's strokes in each way of playing ([piece, beat from the bar's start, strength]); a cymbal also opens
   every four bars. Unpitched pieces never play chords: they keep the beat (AOG-BAND-PERC-V1) */
const KIT_BEATS={
  long:   [["bd",0,.55],["tri",2,.4]],
  swell:  [["roll",0,.85],["bd",0,.4]],
  stabs:  [["bd",0,.85],["sn",1.5,.72],["bd",2,.8],["sn",3.5,.7]],
  offbeat:[["bd",0,.75],["sn",1,.6],["bd",2,.7],["sn",3,.6],["tamb",.5,.55],["tamb",1.5,.5],["tamb",2.5,.55],["tamb",3.5,.5]],
  march:  [["bd",0,.85],["sn",1,.7],["bd",2,.8],["sn",3,.7]],
  waltz:  [["bd",0,.8],["tri",1,.5],["tri",2,.45]],
  fanfare:[["sn",0,.62],["sn",1/3,.5],["sn",2/3,.56],["bd",1,.85],["cy",1,.6]],
  broken: [["bd",0,.5],["tri",1,.4],["tri",3,.4]]
};
/* schedule bar k of the pattern on a context and chain; returns the voices it made */
function scheduleBar(c, ch, k, t0, barSec, swing, prevRef){
  const chord=S.prog[k%S.prog.length]; if(!chord) return [];
  const vo=voicing(chord, prevRef.v); prevRef.v=vo;
  /* in a way of playing with a beat, the players named in hold (the orchestra's violins and violas) hold the chord softly
     under the others, the whole bar */
  const snd=SOUNDS[S.sound], holdIt=(snd.hold && S.rhythm!=="long" && S.rhythm!=="swell") ? snd.hold : [];
  const parts=chordParts(chord, vo), held=parts.filter(p=>holdIt.indexOf(p.inst)>=0), rest=parts.filter(p=>holdIt.indexOf(p.inst)<0);
  const bass=rest.filter(p=>p.bass), upper=rest.filter(p=>!p.bass).sort((a,b)=>a.m-b.m);
  const beat=barSec/beatsPerBar(), out=[], started={}, live=(c===ac);
  const keep=(vc, p, when, dur)=>{ vc.stop(when+dur, vc.tau); vc.m=p.m; vc.inst=p.inst; vc.on=when; vc.off=when+dur; out.push(vc); if(live) track(vc, when); };
  barEvents(S.rhythm, upper.length).forEach(ev=>{
    const late=(ev.t%1===0.5) ? (swing-0.5)*beat : 0;     /* the off-beats lean back with the drum machine's swing */
    const when=t0+ev.t*beat+late, dur=ev.d*beat;
    let who;
    if(ev.w==="b") who=ev.a==="stac" ? bass.filter(p=>!p.fifth) : bass;   /* a timpani's fifth joins held notes, not strokes */
    else if(ev.w==="f") who=bass.filter(p=>!p.fifth).map(p=>{ const x=fitIn(p.m+7, p.inst); return x!=null ? {inst:p.inst, m:(x-12>=rangeOf(p.inst)[0]?x-12:x)} : p; });
    else if(ev.w==="c") who=upper;
    else who=upper.length ? [upper[Math.min(ev.w, upper.length-1)]] : [];
    who.forEach(p=>{
      const id=p.inst+":"+p.m+"@"+Math.round(when*1000); if(started[id]) return; started[id]=1;   /* never the same note twice at once */
      const vc=makeVoice(c, ch, p.inst, p.m, ev.v*(p.bass?0.9:1), when, ev.a, ev.to, ev.to!=null?dur:0);
      if(vc) keep(vc, p, when, dur);
    });
  });
  held.forEach(p=>{ const vc=makeVoice(c, ch, p.inst, p.m, 0.56, t0, "sus"); if(vc){ vc.held=true; keep(vc, p, t0, barSec-0.1*beat); } });
  if(snd.kit){
    const done={};
    (KIT_BEATS[S.rhythm]||[]).concat(k%4===0 ? [["cy",0,.7]] : []).forEach(([piece, tb, v])=>{
      if(snd.kit.indexOf(piece)<0 || done[piece+tb]) return; done[piece+tb]=1;
      const when=t0+tb*beat+((tb%1===0.5) ? (swing-0.5)*beat : 0), roll=piece==="roll" ? barSec*0.97 : 0;
      const vc=kitVoice(c, ch, piece, v, when, roll);
      if(vc){ vc.stop(when+(roll||barSec*1.5), vc.tau); vc.on=when; vc.off=when+(roll||0.1); out.push(vc); if(live) track(vc, when); }
    });
  }
  return out;
}
const PLAY={raf:0, t0:0, bar:0, barSec:2.5, voices:[], prev:{v:null}, drum:null, cur:-1, sig:""};
/* the drum machine's beat plays along when it is on, and the way of playing counts in fours (a waltz plays without it) */
function drumsLive(){ return !!(S.withDrums && DRUM.take && beatsPerBar()===4); }
function curBpm(){ return drumsLive() ? DRUM.take.bpm : S.bpm; }
function curSwing(){ return (drumsLive() && typeof DRUM.take.swing==="number") ? DRUM.take.swing : 0.5; }
async function start(){
  if(!S.prog.length){ const l=document.getElementById("ownLine"); if(l) l.textContent=t("sendNeed"); return; }
  const c=ctx();
  if(drumsLive() && !DRUM.buf){ try{ DRUM.buf=await decodeWith(c, await DRUM.take.wav.arrayBuffer()); }catch(e){ DRUM.buf=null; } }
  stop(true);
  S.playing=true;
  const bpm=curBpm(); PLAY.barSec=beatsPerBar()*60/bpm; PLAY.bar=0; PLAY.prev={v:lastVoicing}; PLAY.cur=-1;
  const t1=c.currentTime+0.12;                       /* not "t": that name is the page's word lookup */
  if(drumsLive() && DRUM.buf){
    const d=DRUM.take, off=(typeof d.offset==="number")?d.offset:0.03;
    const s=c.createBufferSource(); s.buffer=DRUM.buf; s.loop=true;
    const pass=(d.passSec && d.loops) ? d.passSec*d.loops : (d.bars||8)*PLAY.barSec;
    s.loopStart=off; s.loopEnd=Math.min(DRUM.buf.duration, off+pass);
    const g=c.createGain(); g.gain.value=0.9; s.connect(g); g.connect(LIVE_CH.pre); s.start(t1);
    PLAY.drum=s; PLAY.t0=t1+off;
  } else PLAY.t0=t1;
  tick();
  paintPlay();
}
function stop(quiet){
  if(PLAY.raf) cancelAnimationFrame(PLAY.raf); PLAY.raf=0;
  if(ac){ const now=ac.currentTime; PLAY.voices.forEach(v=>v.kill(now)); }
  PLAY.voices=[];
  if(PLAY.drum){ try{ PLAY.drum.stop(); }catch(e){} PLAY.drum=null; }
  S.playing=false; PLAY.cur=-1;
  litKeys(); paintNow();
  if(!quiet) paintPlay();
}
function tick(){
  if(!S.playing) return;
  const now=ac.currentTime;
  while(PLAY.t0+PLAY.bar*PLAY.barSec < now+0.3){
    const v=scheduleBar(ac, LIVE_CH, PLAY.bar, PLAY.t0+PLAY.bar*PLAY.barSec, PLAY.barSec, curSwing(), PLAY.prev);
    PLAY.voices=PLAY.voices.filter(x=>!(x.end && x.end<now)).concat(v);
    PLAY.bar++;
  }
  const cur=Math.floor((now-PLAY.t0)/PLAY.barSec);
  if(cur>=0 && cur!==PLAY.cur){ PLAY.cur=cur; paintNow(); litKeys(); }
  else if([...sounding()].sort((a,b)=>a-b).join(",")!==PLAY.sig) litKeys();   /* the orange keys follow each note */
  PLAY.raf=requestAnimationFrame(tick);
}

/* ── the drum machine's beat, from the shelf the music tools share ── */
const DRUM={take:null, buf:null};
async function checkDrums(){
  try{ DRUM.take=await AOGHandoff.get("drumbench"); }catch(e){ DRUM.take=null; }
  if(DRUM.take && !(DRUM.take.wav && DRUM.take.bpm)) DRUM.take=null;
  DRUM.buf=null;
  paintDrums();
}

/* ── a recording for the turntables ── */
function wavBlob(L, R, sr){
  const n=L.length, ab=new ArrayBuffer(44+n*4), v=new DataView(ab);
  const str=(o,s)=>{ for(let i=0;i<s.length;i++) v.setUint8(o+i, s.charCodeAt(i)); };
  str(0,"RIFF"); v.setUint32(4,36+n*4,true); str(8,"WAVE"); str(12,"fmt "); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,2,true);
  v.setUint32(24,sr,true); v.setUint32(28,sr*4,true); v.setUint16(32,4,true); v.setUint16(34,16,true); str(36,"data"); v.setUint32(40,n*4,true);
  let o=44; for(let i=0;i<n;i++){ const l=Math.max(-1,Math.min(1,L[i])), r=Math.max(-1,Math.min(1,R[i]));
    v.setInt16(o,l<0?l*0x8000:l*0x7fff,true); v.setInt16(o+2,r<0?r*0x8000:r*0x7fff,true); o+=4; }
  return new Blob([ab],{type:"audio/wav"});
}
async function bounce(){
  const line=document.getElementById("sendLine"), btn=document.getElementById("sendBtn");
  if(!S.prog.length){ line.textContent=t("sendNeed"); return; }
  btn.disabled=true; line.textContent=t("sending");
  try{
    await loadSound(S.sound, paintLoad);
    if(drumsLive() && !DRUM.buf){ ctx(); try{ DRUM.buf=await decodeWith(ac, await DRUM.take.wav.arrayBuffer()); }catch(e){ DRUM.buf=null; } }
    const bpm=curBpm(), barSec=beatsPerBar()*60/bpm, L=S.prog.length;
    const reps=Math.max(1, Math.ceil((22/barSec)/L)), bars=L*reps;
    const sr=44100, withD=drumsLive() && DRUM.buf, off0=withD ? ((typeof DRUM.take.offset==="number")?DRUM.take.offset:0.03) : 0.05;
    const dur=off0+bars*barSec+3;
    const OC=window.OfflineAudioContext||window.webkitOfflineAudioContext;
    const oc=new OC(2, Math.ceil(dur*sr), sr);
    const ch=makeChain(oc); await addCrunch(ch);
    ch.master.gain.value=volGain(Math.max(S.vol,0.8)); setSendLevel(ch, S.sound); setEra(ch, S.era, 0);
    if(withD){
      const d=DRUM.take, s=oc.createBufferSource(); s.buffer=DRUM.buf; s.loop=true;
      const pass=(d.passSec && d.loops) ? d.passSec*d.loops : (d.bars||8)*barSec;
      s.loopStart=off0; s.loopEnd=Math.min(DRUM.buf.duration, off0+pass);
      const g=oc.createGain(); g.gain.value=0.9; s.connect(g); g.connect(ch.pre); s.start(0); s.stop(off0+bars*barSec+0.05);
    }
    const prev={v:null};
    for(let k=0;k<bars;k++) scheduleBar(oc, ch, k, off0+k*barSec, barSec, curSwing(), prev);
    const buf=await oc.startRendering();
    const blob=wavBlob(buf.getChannelData(0), buf.getChannelData(1), sr);
    const name=(S.lang==="es"?"Banda":"Band")+" · "+soundName(S.sound)+" · "+Math.round(bpm)+" BPM · "+bars+" "+t("bars");
    await AOGHandoff.put("bandbench", {name:name, bpm:bpm, bars:bars, at:Date.now(), wav:blob});
    line.innerHTML=t("sent")+` <a href="music-decks.html">${t("decks")}</a>`;
  }catch(e){ line.textContent=t("sendFail"); }
  btn.disabled=false;
}
/* AOG-CHORD-PADS-V1 — the six chords of the key, each a short hit made the way a pad plays it, for the drum machine's
   pads 3 to 8; made at its own rate (26,040 Hz), clean: the drum machine adds its own 1987 crunch */
function padLabel(c, es){ const pc=((S.key+c.off)%12+12)%12; return (es?SOLFA:NAMES)[flats()?"flat":"sharp"][pc].replace("♯","#").replace("♭","b")+(c.q==="min"?"m":""); }
async function sendPads(){
  const line=$("padsLine"), btn=$("padsBtn");
  btn.disabled=true; line.textContent=t("padsSending");
  try{
    await loadSound(S.sound, paintLoad);
    const SR=26040, LEN=1.4, OC=window.OfflineAudioContext||window.webkitOfflineAudioContext, out=[];
    for(const c of pads()){
      const oc=new OC(1, Math.ceil(LEN*SR), SR), ch=makeChain(oc);
      ch.master.gain.value=volGain(0.8); setSendLevel(ch, S.sound); setEra(ch, 0, 0);
      chordParts(c, voicing(c, null)).filter(p=>!p.dup).forEach(p=>{ const vc=makeVoice(oc, ch, p.inst, p.m, 0.74*(p.bass?0.85:1), 0.004, "sus"); if(vc) vc.stop(LEN-0.3, 0.1); });
      const d=(await oc.startRendering()).getChannelData(0);
      let pk=0; for(let i=0;i<d.length;i++) pk=Math.max(pk, Math.abs(d[i]));
      const g=pk>0?0.8/pk:1; for(let i=0;i<d.length;i++) d[i]*=g;
      out.push({en:padLabel(c,false), es:padLabel(c,true), pcm:d});
    }
    await AOGHandoff.put("chordpads", {from:"band", name:soundName(S.sound), at:Date.now(), pads:out});
    line.innerHTML=t("padsSent")+` <a href="music-drums.html">${t("drums")}</a>`;
  }catch(e){ line.textContent=t("sendFail"); }
  btn.disabled=false;
}

/* ══════════════════════════════════════════════════════════════════════════
   THE PAGE
   ══════════════════════════════════════════════════════════════════════════ */
const $=id=>document.getElementById(id);
/* the music tools in one menu, at the right of the bar as on the others, by their short names (AOG-MUSIC-TOOLS-MENU-V1) */
function navHtml(){
  const es=S.lang==="es", tools=[["drums","music-drums.html","Drums","Ritmos"],["piano","music-piano.html","Piano","Piano"],["guitar","music-guitar.html","Guitar","Guitarra"],["bass","music-bass.html","Bass","Bajo"],["band","music-band.html","Band","Banda"],["decks","music-decks.html","Turntables","Tocadiscos"]];
  return `<span class="sisters"><span id="navTools" class="aogdd-src" data-aog-dropdown="Music tools|Instrumentos">`+tools.map(x=>`<a href="${x[1]}"${x[0]==="band"?' class="on"':""}>${es?x[3]:x[2]}</a>`).join("")+`</span></span>`;
}
/* AOG-MUSIC-REC-V1 (2026-10-03): ● Record on the keys keeps what the band plays as a take (aog-recorder.js, the one recorder
   every music tool shares) */
const REC=AOGRecorder.attach({context:()=>ctx(), tap:()=>LIVE_CH.lim, lang:()=>S.lang, what:{en:"the band",es:"la banda"},
  prefix:{en:"Band",es:"Banda"}, file:{en:"band-take",es:"banda-toma"}, shelf:"bandbench", bpm:()=>curBpm(),
  ids:{btn:"recBtn", time:"recTime", line:"recLine", list:"takes"}});
function paintText(){
  document.documentElement.setAttribute("lang", S.lang);
  document.querySelectorAll("[data-t]").forEach(el=>{ el.textContent=t(el.getAttribute("data-t")); });
  $("brand").textContent=t("app"); $("mastK").textContent=t("kicker"); $("mastH").textContent=t("app"); $("mastL").textContent=t("lead");
  $("langBtn").textContent=S.lang==="es"?"EN":"ES";
  $("themeBtn").textContent=document.documentElement.getAttribute("data-theme")==="dark"?t("light"):t("dark");
  $("majBtn").textContent=t("major"); $("minBtn").textContent=t("minorW");
  $("ownBtn").textContent=t("own"); $("clearBtn").textContent=t("clear");
  $("downBtn").textContent=t("lower"); $("upBtn").textContent=t("higher");
  $("sendBtn").textContent=t("send"); $("padsBtn").textContent=t("padsBtn"); REC.paint();
  $("era").setAttribute("aria-label", t("eraAria"));
  $("nav").innerHTML=navHtml();
  $("foot").innerHTML=`<p>${t("credit")} <a href="/audio/band/CREDITS.txt">${t("credits")}</a></p>`;
  paintSounds(); paintKeySel(); paintProgSel(); paintRhythm(); paintMood(); paintPads(); paintProg(); paintPlay(); paintTempo();
  paintDial(); paintLoad(); paintDrums(); buildKeys();
}
function paintSounds(){
  const sel=$("soundSel"), groups={}, order=[];
  Object.keys(SOUNDS).forEach(id=>{ const g=SOUNDS[id].grp||""; if(!groups[g]){ groups[g]=[]; order.push(g); } groups[g].push(id); });
  const opt=id=>`<option value="${id}"${id===S.sound?" selected":""}>${soundName(id)}</option>`;
  sel.innerHTML=order.map(g=>g ? `<optgroup label="${t(g)}">`+groups[g].map(opt).join("")+`</optgroup>` : groups[g].map(opt).join("")).join("");
}
function paintKeySel(){ $("keySel").innerHTML=KEY_NAMES[S.lang].map((n,i)=>`<option value="${i}"${i===S.key?" selected":""}>${n}</option>`).join(""); }
function paintProgSel(){
  let html=`<option value="">${t(S.prog.length&&!S.preset?"myOwn":"pickPattern")}</option>`, g=null;
  PRESETS.forEach(p=>{ if(p.g!==g){ if(g) html+="</optgroup>"; g=p.g; html+=`<optgroup label="${PRESET_GROUPS[g][S.lang]}">`; }
    html+=`<option value="${p.id}"${p.id===S.preset?" selected":""}>${S.lang==="es"?p.es:p.en}</option>`; });
  $("progSel").innerHTML=html+(g?"</optgroup>":"");
}
function paintRhythm(){ $("rhythmSel").innerHTML=RHYTHMS.map(r=>`<option value="${r}"${r===S.rhythm?" selected":""}>${RHYTHM_WORDS[r][S.lang]}</option>`).join(""); }
function paintMood(){ $("majBtn").setAttribute("aria-pressed", S.minor?"false":"true"); $("minBtn").setAttribute("aria-pressed", S.minor?"true":"false"); }
const PAD_KEYS=["1","2","3","4","5","6"];
function paintPads(){
  $("pads").innerHTML=pads().map((c,i)=>`<button type="button" class="pad" data-i="${i}"><small>${c.n}</small>${chordName(c)}<br><kbd aria-hidden="true">${PAD_KEYS[i]}</kbd></button>`).join("");
  document.querySelectorAll(".pad").forEach(el=>{
    const i=+el.getAttribute("data-i"); let downAt=0;
    el.onpointerdown=(e)=>{ if(e.button>0) return; if(e.pointerType==="mouse") e.preventDefault(); downAt=performance.now();
      try{ el.setPointerCapture(e.pointerId); }catch(err){} padDown(i, 0.74); };
    el.onpointerup=el.onpointercancel=el.onlostpointercapture=()=>padUp(i);
    el.onclick=()=>{ if(downAt && performance.now()-downAt<1500){ downAt=0; return; } padDown(i,0.74); setTimeout(()=>padUp(i), 900); };
  });
  paintWheel();   /* key, mood or words changed: the wheel is drawn again */
  paintNow();
}
function paintProg(){
  const box=$("prog");
  box.innerHTML = S.prog.length ? S.prog.map((c,i)=>`<span class="slot" data-s="${i}">${chordName(c)}</span>`).join("")
    : `<span class="line" style="margin:0">${t("progEmpty")}</span>`;
  $("ownBtn").setAttribute("aria-pressed", S.own?"true":"false");
  $("ownLine").textContent=S.own?t("ownOn"):"";
  paintNow();
}
function paintNow(){
  const k = S.playing && PLAY.cur>=0 && S.prog.length ? PLAY.cur%S.prog.length : -1;
  document.querySelectorAll(".slot").forEach(el=>el.classList.toggle("now", +el.getAttribute("data-s")===k));
  const cur=k>=0?S.prog[k]:null;
  document.querySelectorAll(".pad").forEach(el=>{ const c=pads()[+el.getAttribute("data-i")]; el.classList.toggle("now", !!(cur && c && c.off===cur.off && (c.q===cur.q || (cur.q==="dom7"&&c.q==="maj") || (cur.q==="maj7"&&c.q==="maj") || (cur.q==="m7"&&c.q==="min")))); });
  paintWheelState();
}
/* the chord wheel, as on the piano (AOG-PIANO-WHEEL-V1/V2): the circle of fifths, majors outside and their minors inside;
   the six pads sit side by side; hold a chord to hear it, turn to change key; gold = your fingers, orange = the pattern's chord */
const WHEEL={held:null, press:"", ptr:null};
function wheelPos(pc){ return (pc*7)%12; }
function wheelChord(p, ring){ const root=ring==="o" ? (p*7)%12 : ((p*7)+9)%12; return {off:((root-S.key)%12+12)%12, q:ring==="o"?"maj":"min"}; }
function wheelName(p, ring){ const root=ring==="o" ? (p*7)%12 : ((p*7)+9)%12; return {root:rootName(root, ring==="o"?"maj":"min"), m:ring==="i"}; }
function paintWheel(){
  const svg=$("wheel"); if(!svg) return;
  const es=S.lang==="es", home=wheelPos(S.minor?(S.key+3)%12:S.key), P=(r,a)=>{ const q=(a-90)*Math.PI/180; return [200+r*Math.cos(q), 200+r*Math.sin(q)]; };
  const f=n=>n.toFixed(1), arc=(r1,r2,a0,a1)=>{ const A=P(r2,a0),B=P(r2,a1),Cq=P(r1,a1),D=P(r1,a0); return `M${f(A[0])} ${f(A[1])}A${r2} ${r2} 0 0 1 ${f(B[0])} ${f(B[1])}L${f(Cq[0])} ${f(Cq[1])}A${r1} ${r1} 0 0 0 ${f(D[0])} ${f(D[1])}Z`; };
  const focusK = document.activeElement && document.activeElement.closest && document.activeElement.closest("#wheel .wd") ? document.activeElement.getAttribute("data-k") : "";
  let out="";
  [["o",124,198,160],["i",56,124,90]].forEach(([g,r1,r2,rl])=>{
    for(let p=0;p<12;p++){
      const fit=[(home+11)%12,home,(home+1)%12].indexOf(p)>=0, c=wheelChord(p,g), nm=wheelName(p,g), key=g+p;
      const pad=fit ? pads().find(x=>x.off===c.off && x.q===c.q) : null;
      const name=nm.root+(nm.m?(es?" m":"m"):""), short=nm.root+(nm.m?"m":"");
      const label=t("wheelChord",{c:name})+(pad?", "+t("wheelPad",{n:pad.n}):"");
      const [x,y]=P(rl,p*30), big=g==="o"?(short.length>2?23:27):(short.length>4?14:(short.length>3?16:18));
      let txt=`<text x="${f(x)}" y="${f(y)}" style="font-size:${big}px">${short}</text>`;
      if(pad){ const [nx,ny]=P(g==="o"?183:109,p*30); txt+=`<text class="pn" x="${f(nx)}" y="${f(ny)}" style="font-size:12px">${pad.n}</text>`; }
      out+=`<g class="wd ${g}${fit?" fit":""}" data-k="${key}" tabindex="0" role="button" aria-label="${label}"><path d="${arc(r1,r2,p*30-15,p*30+15)}"/>${txt}</g>`;
    }
  });
  const hr=S.minor?[56,124]:[124,198];
  const ring=`<path class="home" d="${arc(hr[0]+3,hr[1]-3,home*30-15+1.2,home*30+15-1.2)}"/>`;
  const hub=`<circle class="hub" cx="200" cy="200" r="52"/><text class="hub-k" x="200" y="190" style="font-size:${pcName(S.key).length>3?22:28}px">${pcName(S.key)}</text><text class="hub-m" x="200" y="218" style="font-size:14px">${t(S.minor?"wheelMinor":"wheelMajor")}</text>`;
  svg.innerHTML=out+ring+hub;
  svg.setAttribute("aria-label", t("wheelGroup"));
  if(focusK){ const el=svg.querySelector(`[data-k="${focusK}"]`); if(el) el.focus({preventScroll:true}); }
  const kn=(pc)=>KEY_NAMES[S.lang][((pc%12)+12)%12]+(S.minor?"m":"");
  const L=$("turnL"), R=$("turnR"); if(L) L.textContent=t("wheelL",{k:kn(S.key+5)}); if(R) R.textContent=t("wheelR",{k:kn(S.key+7)});
  paintWheelState();
}
function wheelKeyOf(c){ const root=((S.key+c.off)%12+12)%12; return (c.q==="min"||c.q==="m7") ? "i"+wheelPos((root+3)%12) : "o"+wheelPos(root); }
/* three fingers on the keys that make a major or minor chord light its wedge too */
function handChordKey(){
  const pcs=new Set(); LIVE.forEach((vc,key)=>{ if(vc.down && key[0]==="k") pcs.add(((vc.m%12)+12)%12); });
  if(pcs.size!==3) return "";
  for(const r of pcs){ if(pcs.has((r+4)%12) && pcs.has((r+7)%12)) return "o"+wheelPos(r); if(pcs.has((r+3)%12) && pcs.has((r+7)%12)) return "i"+wheelPos((r+3)%12); }
  return "";
}
function curChord(){ return (S.playing && PLAY.cur>=0 && S.prog.length) ? S.prog[PLAY.cur%S.prog.length] : null; }
function paintWheelState(){
  const svg=$("wheel"); if(!svg) return;
  const k=curChord(), now=k ? wheelKeyOf(k) : "";
  const hit=new Set(); if(WHEEL.press) hit.add(WHEEL.press);
  Object.keys(padHeld).forEach(i=>{ const c=pads()[+i]; if(c) hit.add(wheelKeyOf(c)); });
  const hand=handChordKey(); if(hand) hit.add(hand);
  svg.querySelectorAll(".wd").forEach(g=>{ const key=g.getAttribute("data-k"), h=hit.has(key);
    if(g.classList.contains("hit")!==h) g.classList.toggle("hit", h);
    const n=!h && key===now; if(g.classList.contains("now")!==n) g.classList.toggle("now", n); });
}
function wheelRelease(){ const keys=WHEEL.held; WHEEL.held=null; WHEEL.press=""; if(keys) keys.forEach(k=>noteOff(k)); paintWheelState(); }
function wheelDown(key){
  const g=key[0], p=+key.slice(1), c=wheelChord(p,g);
  ctx(); if(WHEEL.held) wheelRelease();
  WHEEL.held=holdChord("w", c, 0.74); WHEEL.press=key;
  paintWheelState();
  if(S.own && S.prog.length<8){ S.prog.push({off:c.off, q:c.q}); S.preset=""; save(); paintProg(); paintProgSel(); }
}
function turnWheel(step){ const ks=$("keySel"); ks.value=String(((S.key+step)%12+12)%12); ks.onchange(); }
function paintPlay(){ const b=$("playBtn"); b.textContent=S.playing?t("stop"):t("play"); b.classList.toggle("go", S.playing); $("litLine").hidden=!S.playing; }
function paintTempo(){
  const r=$("bpm"), locked=drumsLive();
  r.value=String(curBpm()); r.disabled=!!locked;
  $("bpmOut").textContent=t("bpm",{n:Math.round(curBpm())});
}
function eraWord(){ const e=S.era; return t(e>=0.9?"era87":e>=0.6?"eraMost87":e>0.4?"eraHalf":e>0.1?"eraMost26":"era26"); }
function paintDial(){
  $("era").value=String(Math.round((1-S.era)*100)); $("eraOut").textContent=eraWord(); $("era").setAttribute("aria-valuetext", eraWord());
  $("vol").value=String(Math.round(S.vol*100)); $("volOut").textContent=Math.round(S.vol*100);
}
function paintLoad(){
  const line=$("loadLine"); if(!line) return;
  const snd=SOUNDS[S.sound], keys=setsOf(S.sound), sets=keys.map(setOf), name=soundName(S.sound).split(" · ")[0].toLowerCase();
  if(sets.some(s=>s.state==="failed")){ line.textContent=t("loadFail"); return; }
  const done=sets.reduce((a,s)=>a+s.done,0), all=keys.reduce((a,k)=>a+filesOf(k).length,0), who=snd.who ? snd.who[S.lang] : "";
  if(sets.every(s=>s.ready)){ line.textContent = done<all ? t("more",{n:done, all:all}) : who ? t("readyWho",{who:who}) : t("ready"); return; }
  /* the orchestra counts players: each plays as soon as it is ready */
  if(snd.lean){ line.textContent=t("loadingPlayers",{name:name, n:sets.filter(s=>s.ready).length, all:sets.length}); return; }
  line.textContent=t("loading",{name:name, n:done, all:all})+" "+t("stand");
}
function paintDrums(){
  const box=$("drumBox"); if(!box) return;
  if(!DRUM.take){
    box.innerHTML=`<p class="line">${t("drumNone")} <a href="music-drums.html">${t("drumGo")}</a></p>`;
    if(S.withDrums){ S.withDrums=false; }
  } else {
    box.innerHTML=`<div class="row" style="margin-top:.7rem"><button type="button" class="pbtn" id="drumBtn" aria-pressed="${S.withDrums?"true":"false"}">${t("drumOn")}</button></div>
      <p class="line">${t("drumFrom",{name:(DRUM.take.name||"").replace(/</g,"&lt;")})}${S.withDrums?" "+t(beatsPerBar()===4?"drumTempo":"drumThree"):""}</p>`;
    $("drumBtn").onclick=()=>{ S.withDrums=!S.withDrums; save(); const was=S.playing; if(was) stop(true); paintDrums(); paintTempo(); if(was) start(); };
  }
  paintTempo();
}

/* ══ the keys (the piano's): as many octaves as fit, white keys at least 40 px wide; the ones the instrument cannot
   reach are grey and silent; Lower and Higher stay within its reach ══ */
const WHITE=[0,2,4,5,7,9,11], BLACK_AFTER={0:1,2:3,5:6,7:8,9:10};
const KEYMAP={KeyA:0,KeyW:1,KeyS:2,KeyE:3,KeyD:4,KeyF:5,KeyT:6,KeyG:7,KeyY:8,KeyH:9,KeyU:10,KeyJ:11,KeyK:12,KeyO:13,KeyL:14,KeyP:15,Semicolon:16,Quote:17};
const CAP={0:"A",1:"W",2:"S",3:"E",4:"D",5:"F",6:"T",7:"G",8:"Y",9:"H",10:"U",11:"J",12:"K",13:"O",14:"L",15:"P",16:";",17:"'"};
let KB={whites:8, lo:60, hi:72};
function octaves(){ const w=$("kbd").clientWidth||330; return w>=880?3 : w>=600?2 : 1; }
/* the octaves the keys may start on, for this sound: the lowest whose keys reach its range, up to the highest */
function octSpan(oc){ const [lo,hi]=soundRange(S.sound); const a=Math.max(1, Math.floor(lo/12)-1), b=Math.max(a, Math.min(7-oc, Math.ceil((hi-12*oc)/12)-1)); return [a,b]; }
function buildKeys(){
  const kb=$("kbd"), oc=octaves(), [oa,ob]=octSpan(oc), [rlo,rhi]=soundRange(S.sound);
  if(S.oct==null){ const mid=(rlo+rhi)/2; S.oct=Math.round((mid-6*oc)/12)-1; }
  S.oct=Math.max(oa, Math.min(ob, S.oct));
  const lo=12*(S.oct+1), hi=lo+12*oc;
  KB={whites:7*oc+1, lo:lo, hi:hi};
  let html="", wi=0; const w=100/KB.whites;
  for(let m=lo; m<=hi; m++){
    const pc=m%12; if(WHITE.indexOf(pc)<0) continue;
    const cap=CAP[m-lo]!=null?`<span class="kc">${CAP[m-lo]}</span>`:"", out=playerFor(m)?"":" out";
    html+=`<div class="wk${out}" data-m="${m}" aria-label="${noteLabel(m)}">${cap}<span class="nm">${pcName(m)}${pc===0?`<small>${Math.floor(m/12)-1}</small>`:""}</span></div>`;
    if(BLACK_AFTER[pc]!=null && m+1<=hi){
      const bm=m+1, bcap=CAP[bm-lo]!=null?`<span class="kc">${CAP[bm-lo]}</span>`:"", bout=playerFor(bm)?"":" out";
      html+=`<div class="bk${bout}" data-m="${bm}" aria-label="${noteLabel(bm)}" style="left:calc(${(wi+1)*w}% - ${w*0.31}%);width:${w*0.62}%">${bcap}</div>`;
    }
    wi++;
  }
  kb.innerHTML=html;
  $("rangeOut").textContent=t("rangeOut",{a:noteLabel(lo), b:noteLabel(hi)});
  $("downBtn").disabled=S.oct<=oa; $("upBtn").disabled=S.oct>=ob;
  litKeys();
}
/* pale = every key on screen that fits the chord; orange = a key while the band is sounding it; gold = your fingers (AOG-PIANO-LIT-V2) */
function sounding(){
  const now=ac?ac.currentTime:0, by=new Map(), out=new Set();
  PLAY.voices.forEach(v=>{ if(v.m==null) return; if(!by.has(v.m)) by.set(v.m,[]); by.get(v.m).push(v); });
  by.forEach((list,m)=>{ list.sort((a,b)=>a.on-b.on);
    for(let i=0;i<list.length;i++){ const a=list[i], b=list[i+1];
      if(now>=a.on && now<a.off){ out.add(m); return; }
      if(b && now>=a.off && now<b.on && b.on-a.off<0.2){ out.add(m); return; } } });
  return out;
}
function litKeys(){
  const kb=$("kbd"); if(!kb) return;
  const down=new Set(), now=S.playing?sounding():new Set(), fit=new Set(), cc=curChord();
  LIVE.forEach(vc=>{ if(vc.down) down.add(vc.m); });
  if(cc) chordPcs(cc).forEach(pc=>fit.add(pc));
  PLAY.sig=[...now].sort((a,b)=>a-b).join(",");
  kb.querySelectorAll("[data-m]").forEach(el=>{ const m=+el.getAttribute("data-m"), d=down.has(m), n=!d&&now.has(m);
    el.classList.toggle("down", d); el.classList.toggle("now", n); el.classList.toggle("lit", !d&&!n&&fit.has(((m%12)+12)%12)); });
  paintWheelState();
}
/* fingers: each pointer plays the key under it, and sliding moves to the next key */
const POINTERS=new Map();
function keyAt(x,y){ const el=document.elementFromPoint(x,y); const k=el && el.closest && el.closest("#kbd [data-m]"); return k||null; }
function velAt(el, y){ const r=el.getBoundingClientRect(); const f=(y-r.top)/Math.max(1,r.height); return Math.max(0.15, Math.min(1, 0.3+0.7*f)); }
function keyOn(m, v){ noteOn("k"+m, playerFor(m), m, v); }
function keyOff(m){ noteOff("k"+m); }
function bindKeyboard(){
  const kb=$("kbd");
  /* a held finger is a long press to an iPad, and a long press brings up the magnifier: the keys and the pads keep the touch (AOG-PIANO-NO-LOUPE-V1) */
  [kb, $("pads")].forEach(el=>el.addEventListener("touchstart",(e)=>{ if(e.cancelable) e.preventDefault(); },{passive:false}));
  kb.addEventListener("pointerdown",(e)=>{
    if(e.button>0) return; e.preventDefault();
    const k=keyAt(e.clientX,e.clientY); if(!k) return;
    try{ kb.setPointerCapture(e.pointerId); }catch(err){}
    const m=+k.getAttribute("data-m"); POINTERS.set(e.pointerId, m); keyOn(m, velAt(k, e.clientY));
  });
  kb.addEventListener("pointermove",(e)=>{
    if(!POINTERS.has(e.pointerId)) return;
    const k=keyAt(e.clientX,e.clientY); const m=k?+k.getAttribute("data-m"):null, was=POINTERS.get(e.pointerId);
    if(m===was) return;
    if(was!=null && ![...POINTERS.entries()].some(([id,x])=>id!==e.pointerId && x===was)) keyOff(was);
    POINTERS.set(e.pointerId, m);
    if(m!=null) keyOn(m, velAt(k, e.clientY));
  });
  const up=(e)=>{ if(!POINTERS.has(e.pointerId)) return; const m=POINTERS.get(e.pointerId); POINTERS.delete(e.pointerId);
    if(m!=null && ![...POINTERS.values()].some(x=>x===m)) keyOff(m); };
  kb.addEventListener("pointerup",up); kb.addEventListener("pointercancel",up); kb.addEventListener("lostpointercapture",up);
}
/* computer keys: by position, so other keyboard layouts work too */
const HELD_KEYS=new Map();
function typing(el){ if(!el||!el.tagName) return false; const tg=el.tagName; return el.isContentEditable||tg==="TEXTAREA"||(tg==="INPUT"&&el.type!=="range"); }
function moveOct(step){ const was=S.oct; S.oct+=step; buildKeys(); if(S.oct!==was) save(); }
document.addEventListener("keydown",(e)=>{
  if(e.metaKey||e.ctrlKey||e.altKey||typing(e.target)) return;
  if(e.target && e.target.tagName==="SELECT") return;
  if(KEYMAP[e.code]!=null){ e.preventDefault(); if(e.repeat||HELD_KEYS.has(e.code)) return;
    const m=KB.lo+KEYMAP[e.code]; HELD_KEYS.set(e.code, m); keyOn(m, 0.7); return; }
  const pi=PAD_KEYS.indexOf(e.key); if(pi>=0 && e.code.indexOf("Digit")===0){ e.preventDefault(); if(!e.repeat) padDown(pi, 0.74); return; }
  if(e.code==="KeyZ"||e.code==="KeyX"){ e.preventDefault(); if(!e.repeat) moveOct(e.code==="KeyZ"?-1:1); return; }
  if(e.code==="Space"){
    const b=e.target.closest && e.target.closest("button,a,summary,[role=button]");
    if(b && b.id!=="playBtn" && !b.classList.contains("pad")) return;
    e.preventDefault(); if(!e.repeat){ S.playing?stop():start(); }
  }
});
document.addEventListener("keyup",(e)=>{
  if(HELD_KEYS.has(e.code)){ keyOff(HELD_KEYS.get(e.code)); HELD_KEYS.delete(e.code); return; }
  const pi=PAD_KEYS.indexOf(e.key); if(pi>=0 && e.code.indexOf("Digit")===0) padUp(pi);
});
window.addEventListener("blur",()=>{ HELD_KEYS.forEach(m=>keyOff(m)); HELD_KEYS.clear(); });

function bind(){
  $("soundSel").onchange=()=>{ const id=$("soundSel").value; if(!SOUNDS[id]) return; S.sound=id; S.oct=null; save();
    allOff(); if(ac) setSendLevel(LIVE_CH, id);
    loadSound(id, paintLoad); paintLoad(); buildKeys(); };
  $("keySel").onchange=()=>{ S.key=+$("keySel").value; lastVoicing=null; save(); paintPads(); paintProg(); buildKeys(); };
  $("majBtn").onclick=()=>{ if(!S.minor) return; S.minor=false; save(); paintMood(); paintPads(); paintProg(); };
  $("minBtn").onclick=()=>{ if(S.minor) return; S.minor=true; save(); paintMood(); paintPads(); paintProg(); };
  $("progSel").onchange=()=>{ const p=PRESETS.find(x=>x.id===$("progSel").value); if(!p) return;
    S.preset=p.id; S.prog=p.chords.map(c=>({off:c.off,q:c.q})); S.minor=p.minor; S.own=false; lastVoicing=null; save();
    paintMood(); paintPads(); paintProg(); paintProgSel(); if(S.playing){ stop(true); start(); } };
  $("rhythmSel").onchange=()=>{ const was=beatsPerBar(); S.rhythm=$("rhythmSel").value; save();
    if(beatsPerBar()!==was){ paintDrums(); if(S.playing){ stop(true); start(); } } };   /* a waltz's bar is shorter: start it on its own count */
  { const W=$("wheel");
    W.addEventListener("pointerdown",(e)=>{ const g=e.target.closest && e.target.closest(".wd"); if(!g || e.button>0) return; e.preventDefault();
      try{ W.setPointerCapture(e.pointerId); }catch(err){} WHEEL.ptr=e.pointerId; wheelDown(g.getAttribute("data-k")); });
    const wUp=(e)=>{ if(WHEEL.ptr!==e.pointerId) return; WHEEL.ptr=null; wheelRelease(); };
    W.addEventListener("pointerup",wUp); W.addEventListener("pointercancel",wUp); W.addEventListener("lostpointercapture",wUp);
    W.addEventListener("touchstart",(e)=>{ if(e.cancelable) e.preventDefault(); },{passive:false});   /* no magnifier, no scroll from the wheel */
    W.addEventListener("keydown",(e)=>{ const g=e.target.closest && e.target.closest(".wd"); if(g && (e.key==="Enter"||e.key===" ")){ e.preventDefault(); if(!e.repeat) wheelDown(g.getAttribute("data-k")); } });
    W.addEventListener("keyup",(e)=>{ if((e.key==="Enter"||e.key===" ") && WHEEL.ptr==null && WHEEL.held) wheelRelease(); }); }
  $("turnL").onclick=()=>turnWheel(5); $("turnR").onclick=()=>turnWheel(7);
  $("ownBtn").onclick=()=>{ S.own=!S.own; if(S.own && S.preset){ S.prog=[]; S.preset=""; } save(); paintProg(); paintProgSel(); };
  $("clearBtn").onclick=()=>{ if(S.playing) stop(); S.prog=[]; S.preset=""; save(); paintProg(); paintProgSel(); };
  $("playBtn").onclick=()=>{ S.playing?stop():start(); };
  $("bpm").oninput=()=>{ S.bpm=+$("bpm").value; $("bpmOut").textContent=t("bpm",{n:S.bpm}); save();
    if(S.playing && !drumsLive()){ const next=PLAY.t0+PLAY.bar*PLAY.barSec, nb=beatsPerBar()*60/S.bpm; PLAY.t0=next-PLAY.bar*nb; PLAY.barSec=nb; } };
  $("downBtn").onclick=()=>moveOct(-1);
  $("upBtn").onclick=()=>moveOct(1);
  $("era").oninput=()=>{ S.era=Math.max(0,Math.min(1,1-(+$("era").value)/100)); $("eraOut").textContent=eraWord(); $("era").setAttribute("aria-valuetext",eraWord());
    if(ac) setEra(LIVE_CH, S.era); clearTimeout(bind.et); bind.et=setTimeout(save,250); };
  $("vol").oninput=()=>{ S.vol=Math.max(0.05,(+$("vol").value)/100); $("volOut").textContent=Math.round(S.vol*100); if(ac) LIVE_CH.master.gain.setTargetAtTime(volGain(S.vol), ac.currentTime, 0.02); clearTimeout(bind.vt); bind.vt=setTimeout(save,250); };
  $("sendBtn").onclick=bounce;
  $("padsBtn").onclick=sendPads;
  $("langBtn").onclick=()=>{ S.lang=S.lang==="es"?"en":"es"; try{ localStorage.setItem("aog.lang", S.lang); }catch(e){} paintText(); };
  $("themeBtn").onclick=()=>{ const h=document.documentElement, d=h.getAttribute("data-theme")==="dark"?"light":"dark";
    h.setAttribute("data-theme", d); h.classList.toggle("dark", d==="dark"); try{ localStorage.setItem("aog.interior.ws.v1.theme", d); }catch(e){} paintText(); };
  /* after a menu is picked with a finger or the mouse, it gives focus back, so Space plays instead of reopening the menu */
  ["soundSel","keySel","progSel","rhythmSel"].forEach(id=>{ const el=$(id);
    el.addEventListener("pointerdown",()=>{ el._ptr=true; });
    el.addEventListener("change",()=>{ if(el._ptr){ el._ptr=false; setTimeout(()=>el.blur(),0); } }); });
  bindKeyboard();
  let rt=0; window.addEventListener("resize",()=>{ clearTimeout(rt); rt=setTimeout(()=>{ const before=KB.whites; if(7*octaves()+1!==before) buildKeys(); },150); });
}

loadState();
bind();
paintText();
document.addEventListener("visibilitychange",()=>{ if(document.hidden){ stop(); allOff(); } });
window.addEventListener("pagehide",()=>{ stop(true); allOff(); });
/* wake Safari's audio on the first touch, every time it sleeps (AOG-MUSIC-TOUCH-V1) */
["touchstart","touchend","pointerdown","click","keydown"].forEach(ev=>document.addEventListener(ev,()=>{ try{ if(ac && ac.state!=="running") ac.resume(); }catch(e){} },{capture:true,passive:true}));
/* the recordings start loading once the page is up; the drum beat is looked up on the shared shelf */
window.addEventListener("load",()=>{ setTimeout(()=>loadSound(S.sound, paintLoad), 300); });
checkDrums();
try{ AOGHandoff.listen(function(key){ if(key==="drumbench") checkDrums(); }); }catch(e){}
window.addEventListener("focus", checkDrums);
