
/* AOG-DECKS-V2 · AOG-VINYL-ENGINE-V1 (2026-09-22) — decks with weight.
   The platter is dragged by ANGLE, not by sideways pixels, and the hand sets a
   velocity the playhead integrates sample by sample in aog-vinyl-worklet.js.
   A song is a file the student picks; it is decoded here and never sent.
   AOG-DJ-V1 (2026-10-04) — a third deck, a mixer, pads, loops in beats, SYNC to a
   MASTER, effects in beats, and four records made on the page (aog-dj.js). */
const STR = {
  app:{en:"The Turntables",es:"Los tocadiscos"},
  eyebrow:{en:"Load a song. Spin it.",es:"Pon un disco. Gíralo."},
  tag:{en:"Three decks with weight. Grab a platter and it follows your hand; let go and the motor takes it back.",es:"Tres platos con peso. Agarra un plato y sigue tu mano; suéltalo y el motor lo retoma."},
  tagLong:{en:"Three decks with weight and a mixer. Grab a platter and it follows your hand — forward, back, fast, slow — and the record goes quiet the moment you hold it still, the way vinyl does. Let go and the motor pulls it back up to speed. The mixer blends the decks, and Record keeps the take as a .wav you can save or drop back onto a platter. Play the records made right here, or a song from this computer. A song never leaves this computer.",es:"Tres platos con peso y un mezclador. Agarra un plato y sigue tu mano — adelante, atrás, rápido, lento — y el disco se calla en cuanto lo detienes, como el vinilo de verdad. Suéltalo y el motor lo devuelve a su velocidad. El mezclador une los platos, y Grabar guarda la toma como un .wav que puedes conservar o volver a poner en un plato. Toca los discos hechos aquí mismo, o una canción de esta computadora. Una canción nunca sale de esta computadora."},
  load:{en:"Load a song",es:"Cargar una canción"},
  dockH:{en:"Your songs. Tap one to put it on.",es:"Tus canciones. Toca una para ponerla."},
  dockNone:{en:"No songs yet. Add one from this device and it stays here.",es:"Aún no hay canciones. Agrega una de este aparato y se queda aquí."},
  dockAdd:{en:"+ From this device",es:"+ De este aparato"},
  /* AOG-DECKS-ITUNES-V1 (2026-10-06) — Jimmy: "can a section to grab music from iTunes be accessible?" A web page cannot open
     the Music app or an iTunes library (Apple keeps it to the device), so this says how to bring a song in as a file. */
  itH:{en:"Songs from iTunes",es:"Canciones de iTunes"},
  it1:{en:"This page can't open your Music app, but a song file works: songs you bought and albums you added yourself.",es:"Esta página no puede abrir tu app Música, pero un archivo de canción sí funciona: canciones que compraste y álbumes que agregaste tú."},
  it2:{en:"On a computer: in Music (or iTunes), right-click a song and choose Show in Finder (Show in Windows Explorer on Windows). Drag songs from that folder onto a deck. To load a whole album, use Add songs.",es:"En una computadora: en Música (o iTunes), haz clic derecho en una canción y elige Mostrar en el Finder (Mostrar en el Explorador de Windows en Windows). Arrastra canciones de esa carpeta a un plato. Para cargar un álbum entero, usa Agregar canciones."},
  it3:{en:"On an iPad or iPhone: songs in the Music app stay inside it. Copy them once from a computer: put them in iCloud Drive, or AirDrop them and choose Save to Files. Then tap + From this device, then Browse.",es:"En un iPad o iPhone: las canciones de la app Música se quedan dentro de ella. Cópialas una vez desde una computadora: ponlas en iCloud Drive, o mándalas por AirDrop y elige Guardar en Archivos. Luego toca + De este aparato y luego Explorar."},
  it4:{en:"Apple Music songs you stream can't play here. Apple locks them to the Music app.",es:"Las canciones de Apple Music que escuchas en línea no pueden sonar aquí. Apple las deja solo en la app Música."},
  locked:{en:"%s is locked to the Music app (Apple Music), so it can't play here. A song you bought on iTunes works.",es:"%s está bloqueada en la app Música (Apple Music), así que no puede sonar aquí. Una canción que compraste en iTunes sí funciona."},
  dockEdit:{en:"Remove songs",es:"Quitar canciones"},
  dockClose:{en:"Close",es:"Cerrar"},
  barsH:{en:"Bars to rap",es:"Rimas para rapear"},
  barsLead:{en:"Bars, announcer calls and famous quotes to say over a beat. Tap Next for another.",es:"Rimas, gritos de narrador y frases famosas para decir sobre un ritmo. Toca Siguiente para otra."},
  barsKind:{en:"Kind",es:"Tipo"},
  barsBack:{en:"Back",es:"Atrás"},
  barsNext:{en:"Next",es:"Siguiente"},
  barsOf:{en:"%i of %n",es:"%i de %n"},
  dockDone:{en:"Done",es:"Listo"},
  none:{en:"No song yet.",es:"Aún no hay canción."},
  play:{en:"Start",es:"Arrancar"},
  stop:{en:"Stop",es:"Parar"},
  cue:{en:"Return to cue",es:"Volver al cue"},
  setCue:{en:"Set cue",es:"Marcar cue"},
  speed:{en:"Pitch",es:"Tono"},
  vol:{en:"Volume",es:"Volumen"},
  nudge:{en:"Nudge",es:"Empuje"},
  mix:{en:"Crossfader",es:"Crossfader"},
  curve:{en:"Fader",es:"Fader"},
  smooth:{en:"Blend",es:"Mezcla"},
  sharp:{en:"Cut",es:"Corte"},
  rpm:{en:"Speed",es:"Velocidad"},
  noiseOn:{en:"Vinyl noise: on",es:"Ruido de vinilo: sí"},
  noiseOff:{en:"Vinyl noise: off",es:"Ruido de vinilo: no"},
  drag:{en:"Drag the record to scratch.",es:"Arrastra el disco para rayar."},
  foot:{en:"The Turntables · Architecture of Grace · your song stays here",es:"Los tocadiscos · Architecture of Grace · tu canción se queda aquí"},
  loading:{en:"Loading %s …",es:"Cargando %s …"},
  nope:{en:"This browser could not read %s. An MP3, M4A, WAV or AAC file works.",es:"Este navegador no pudo leer %s. Un archivo MP3, M4A, WAV o AAC sí funciona."},
  drop:{en:"You can also drag a song onto a deck.",es:"También puedes arrastrar una canción a un plato."},
  eqLow:{en:"Low",es:"Graves"},
  eqMid:{en:"Mid",es:"Medios"},
  eqHigh:{en:"High",es:"Agudos"},
  killL:{en:"KILL LOW",es:"CORTA GRAVES"},
  killM:{en:"KILL MID",es:"CORTA MEDIOS"},
  killH:{en:"KILL HIGH",es:"CORTA AGUDOS"},
  flat:{en:"FLAT",es:"PLANO"},
  eqTitle:{en:"The curve you are actually hearing",es:"La curva que estás oyendo"},
  eject:{en:"⏏ Take it off",es:"⏏ Quitar"},
  key:{en:"KEY",es:"TONO FIJO"},   /* not "TONO": that word is the Pitch slider's (speed.es) */
  slip:{en:"SLIP",es:"SLIP"},
  rev:{en:"REV",es:"REV"},
  tap:{en:"TAP",es:"TAP"},
  echo:{en:"Echo",es:"Eco"},
  reverb:{en:"Reverb",es:"Sala"},
  flanger:{en:"Flanger",es:"Flanger"},
  cueHold:{en:"CUE",es:"CUE"},
  hot:{en:"Pad",es:"Pad"},
  loop:{en:"Loop",es:"Bucle"},
  sync:{en:"SYNC",es:"SYNC"},
  filter:{en:"Filter",es:"Filtro"},
  bpmWait:{en:"listening…",es:"escuchando…"},
  noBeat:{en:"no steady beat",es:"sin pulso claro"},
  benchNone:{en:"Bounce a pattern from the drum machine and it lands here.",es:"Rebota un patrón de la caja de ritmos y aparece aquí."},
  keys:{en:"From the piano",es:"Del piano"},
  keysGo:{en:"Open the piano",es:"Abrir el piano"},
  guitar:{en:"From the guitar",es:"De la guitarra"}, guitarGo:{en:"Open the guitar",es:"Abrir la guitarra"},   /* AOG-STRINGS-V1 */
  bassT:{en:"From the bass",es:"Del bajo"}, bassGo:{en:"Open the bass",es:"Abrir el bajo"},
  bandT:{en:"From the band",es:"De la banda"}, bandGo:{en:"Open the band",es:"Abrir la banda"},   /* AOG-BAND-V1 */
  studioT:{en:"From the mixing desk",es:"De la mesa de mezclas"}, studioGo:{en:"Open the mixing desk",es:"Abrir la mesa de mezclas"},   /* AOG-STUDIO-V1 */
  drumTakeT:{en:"A take from the drums",es:"Una toma de la batería"}, kitGo:{en:"Open the drum kit",es:"Abrir la batería"},   /* AOG-MUSIC-REC-V1 */
  padsT:{en:"From the drum machine",es:"De la caja de ritmos"}, padsGo:{en:"Open the drum machine",es:"Abrir la caja de ritmos"},   /* AOG-PADS-STUDIO-V1 */
  crateNext:{en:"Up next",es:"Lo que sigue"},
  crateNextNone:{en:"Your songs wait here.",es:"Tus canciones esperan aquí."},
  crateAdd:{en:"Add songs",es:"Agregar canciones"},
  starterH:{en:"Starter crate",es:"Caja inicial"},
  starterLead:{en:"Eleven practice tracks, 80 to 128 BPM.",es:"Once pistas para practicar, de 80 a 128 BPM."},
  starterGo:{en:"Load the starter crate",es:"Cargar la caja inicial"},
  starterBusy:{en:"Loading %n of %t…",es:"Cargando %n de %t…"},
  starterDone:{en:"Done. The starter tracks are in Up next.",es:"Listo. Las pistas iniciales están en Lo que sigue."},
  starterFail:{en:"Some tracks did not load. Check the internet and try again.",es:"Algunas pistas no cargaron. Revisa el internet y vuelve a intentarlo."},
  wordH:{en:"Scripture records",es:"Discos de Escrituras"},
  wordLead:{en:"The Bible read aloud, in English and Spanish. One verse or line on each pad.",es:"La Biblia en voz alta, en inglés y en español. Un versículo o una línea en cada pad."},
  wordGo:{en:"Load the scripture records",es:"Cargar los discos de Escrituras"},
  wordDone:{en:"Done. The scripture records are in Up next.",es:"Listo. Los discos de Escrituras están en Lo que sigue."},
  speechH:{en:"Speeches",es:"Discursos"},
  speechLead:{en:"Famous words, spoken aloud. One line on each pad.",es:"Palabras famosas, dichas en voz alta. Una línea en cada pad."},
  speechGo:{en:"Load the speeches",es:"Cargar los discursos"},
  speechDone:{en:"Done. The speeches are in Up next.",es:"Listo. Los discursos están en Lo que sigue."},
  showList:{en:"See the tracks",es:"Ver las pistas"},
  pullHint:{en:"Tap a spine to pull that record out.",es:"Toca el lomo de un disco para sacarlo."},
  starterList:{en:"More: a track list for every lesson",es:"Más: una lista de canciones para cada lección"},
  findH:{en:"Free songs and samples online",es:"Canciones y samples gratis en internet"},
  findHint:{en:"Download a file, then tap Add songs. Check each site's rules before you share a mix.",es:"Descarga un archivo y toca Agregar canciones. Revisa las reglas de cada sitio antes de compartir una mezcla."},
  crateHint:{en:"Press A, B or C, or drag a record onto a deck.",es:"Pulsa A, B o C, o arrastra un disco a un plato."},
  cratePrev:{en:"Previously spun",es:"Tocadas antes"},
  cratePrevNone:{en:"Every record you put on a platter shows up here.",es:"Cada disco que pones en un plato aparece aquí."},
  crateDrop:{en:"Remove",es:"Quitar"},
  crateClear:{en:"Clear list",es:"Borrar lista"},
  touch:{en:"Platter",es:"Plato"},
  touchFine:{en:"fine",es:"fino"},
  touchNormal:{en:"normal",es:"normal"},
  touchVinyl:{en:"1:1 vinyl",es:"vinilo 1:1"},
  wide:{en:"WIDE",es:"AMPLIO"},
  rec:{en:"● Record",es:"● Grabar"},
  recStop:{en:"■ Stop recording",es:"■ Parar grabación"},
  recHint:{en:"Records the mix — never a microphone. The take stays on this computer.",es:"Graba la mezcla — nunca un micrófono. La toma se queda en esta computadora."},
  takes:{en:"Takes",es:"Tomas"},
  take:{en:"Take",es:"Toma"},
  save:{en:"Save as .wav",es:"Guardar como .wav"},
  /* AOG-STUDIO-SEND-V1 */
  toStudio:{en:"Send to the Mixing Desk",es:"Enviar a la mesa de mezclas"},
  studioSent:{en:"Sent to the Mixing Desk.",es:"Enviada a la mesa de mezclas."},
  layer:{en:"+ Add to My Track",es:"+ Añadir a mi pista"}, layerSent:{en:"Added to My Track.",es:"Añadida a mi pista."},   /* AOG-MYTRACK-V1: inside the Studio */
  studioGo:{en:"Open the Mixing Desk",es:"Abrir la mesa de mezclas"},
  studioFail:{en:"That did not work. Try again.",es:"No funcionó. Inténtalo otra vez."},
  noRoom:{en:"This device has no room left for takes. At the Mixing Desk, remove a take you do not need, then try again.",es:"Este aparato no tiene más espacio para tomas. En la mesa de mezclas, quita una toma que no necesites y vuelve a intentarlo."},
  toA:{en:"Onto deck A",es:"Al plato A"},
  toB:{en:"Onto deck B",es:"Al plato B"},
  toC:{en:"Onto deck C",es:"Al plato C"},
  onto:{en:"Onto deck",es:"Al plato"},
  full:{en:"Ten minutes is the limit — recording stopped.",es:"Diez minutos es el límite — grabación detenida."},
  drums:{en:"Drum machine",es:"Caja de ritmos"},
  sci:{en:"Science door",es:"Puerta de ciencias"},
  dark:{en:"Dark",es:"Oscuro"}, light:{en:"Light",es:"Claro"},
  /* AOG-DJ-V1 */
  deck:{en:"Deck",es:"Plato"},
  master:{en:"MASTER",es:"MASTER"},
  masterTip:{en:"The deck the others follow when they SYNC",es:"El plato que siguen los demás con SYNC"},
  pads:{en:"Pads",es:"Pads"},
  snap:{en:"Lands",es:"Cae"},
  snap1:{en:"on the beat",es:"en el pulso"},
  snap2:{en:"on ½ beat",es:"en ½ pulso"},
  snap4:{en:"on ¼ beat",es:"en ¼ de pulso"},
  snap0:{en:"right away",es:"al instante"},
  chop:{en:"Chop 8",es:"Cortar 8"},
  chopTip:{en:"Put the next 8 beats on the 8 pads",es:"Pon los 8 pulsos que siguen en los 8 pads"},
  /* AOG-CHOPS-TO-PADS-V1 (STUDIO-HANDOFF §9: "I cut this from my record. Put it on the pads.") */
  chopsSend:{en:"Chops to the Drum Machine",es:"Cortes a la caja de ritmos"},
  chopsTip:{en:"Put 16 beats from here on the Drum Machine's 16 pads",es:"Pon 16 pulsos desde aquí en los 16 pads de la caja de ritmos"},
  chopsSent:{en:"16 chops from %s are on the Drum Machine's pads.",es:"16 cortes de %s están en los pads de la caja de ritmos."},
  chopsGo:{en:"Open the Drum Machine",es:"Abrir la caja de ritmos"},
  chopsEnd:{en:"Too close to the end of the record. Move back a little and try again.",es:"Muy cerca del final del disco. Retrocede un poco y vuelve a intentarlo."},
  chopsFail:{en:"That did not work. Try again.",es:"No funcionó. Inténtalo otra vez."},
  chopsWord:{en:"chops",es:"cortes"},
  erase:{en:"Erase",es:"Borrar"},
  eraseTip:{en:"Then tap the pad to empty",es:"Luego toca el pad que quieres vaciar"},
  keysHint:{en:"On a keyboard, the left hand plays the left deck and the right hand the right: Q and P start and stop, W and O cue, E and I sync, A S D F Z X C V and H J K L N M , . are the pads. ← and → move the crossfader.",es:"Con un teclado, la mano izquierda toca el plato de la izquierda y la derecha el de la derecha: Q y P ponen y paran, W y O marcan el cue, E e I sincronizan, A S D F Z X C V y H J K L N M , . son los pads. ← y → mueven el crossfader."},
  padHint:{en:"Pads: tap an empty pad to mark the spot. Tap it again and the record jumps there on the beat. With SLIP on, a pad plays while you hold it, then the song carries on where it would have been.",es:"Pads: toca un pad vacío para marcar el punto. Tócalo otra vez y el disco salta ahí en el pulso. Con SLIP encendido, el pad suena mientras lo mantienes y luego la canción sigue donde habría estado."},
  loopN:{en:"Loop %n beats",es:"Bucle de %n pulsos"},
  /* AOG-DECKS-SAY-V1 (Jimmy, 2026-10-09: "The loops option and the taps don't work on the turn table"): every press says what it did */
  sayLoad:{en:"Load a song on this deck first.",es:"Primero pon una canción en este plato."},
  sayNoBeat:{en:"This record has no beat yet. Tap TAP in time with the music, then pick a loop.",es:"Este disco aún no tiene pulso. Toca TAP al ritmo de la música y luego elige un bucle."},
  sayLoop:{en:"Looping %n beats. Tap it again to let go.",es:"En bucle %n pulsos. Tócalo otra vez para soltarlo."},
  sayLoopOff:{en:"Loop off. The record plays on.",es:"Bucle apagado. El disco sigue."},
  sayTap:{en:"Tap %n · keep tapping in time with the beat.",es:"Toque %n · sigue tocando al ritmo."},
  sayTapSet:{en:"Tempo set: %n beats a minute.",es:"Tempo listo: %n pulsos por minuto."},
  sayPadSet:{en:"Pad %n marks this spot. Tap it again to jump back here.",es:"El pad %n marca este punto. Tócalo otra vez para volver aquí."},
  bars4:{en:"4 bars",es:"4 compases"},
  bars4Tip:{en:"Repeat these 4 bars to make the groove last",es:"Repite estos 4 compases para que el ritmo dure"},
  mixer:{en:"Mixer",es:"Mezclador"},
  channel:{en:"Channel",es:"Canal"},
  fx:{en:"Effect",es:"Efecto"},
  beats:{en:"Beats",es:"Pulsos"},
  amount:{en:"Amount",es:"Cantidad"},
  side:{en:"Crossfader side",es:"Lado del crossfader"},
  sideL:{en:"Left",es:"Izq."}, sideN:{en:"None",es:"Ninguno"}, sideR:{en:"Right",es:"Der."},
  off:{en:"off",es:"apagado"},
  showA:{en:"Deck A",es:"Plato A"}, showB:{en:"Deck B",es:"Plato B"}, showC:{en:"Deck C",es:"Plato C"},
  making:{en:"Making the record …",es:"Haciendo el disco …"},
  madeH:{en:"Records",es:"Discos"},
  madeLead:{en:"Ready to play. Nothing to download.",es:"Listos para tocar. Nada que descargar."},
  madeFail:{en:"That record could not be made on this device.",es:"Ese disco no se pudo hacer en este aparato."},
  /* AOG-DJ-DESK-V1 */
  pairLab:{en:"Decks on the desk",es:"Platos en la mesa"},
  waiting:{en:"%d is waiting · ",es:"%d espera · "},
  more:{en:"Loops, tap and more",es:"Bucles, tap y más"},
  recSide:{en:"SIDE %d · 33⅓",es:"CARA %d · 33⅓"}
};
const S = { lang: localStorage.getItem("aog.lang")==="es"?"es":"en", theme: document.documentElement.getAttribute("data-theme")||"light" };
function t(k){ return STR[k][S.lang]; }

/* a 33⅓ record turns 200° in one second of music. That number is the whole
   bridge between a hand on the platter and a place in the song. */
const DEG_PER_SEC = 200;

let actx, master, comp, OUT = null, LIMIT = null, workletReady = null, eqScope = null;
const IDS = ["A","B","C"];
const decks = IDS.map(makeDeck);
let curve = "smooth", noiseOn = true, masterId = null;
/* AOG-DECKS-TOUCH-V1 (2026-09-23) — Jimmy: "when you're scratching it seems to
   be going a bit too fast, so when you try to slow it down to make the vocals
   sound interesting it is too fast."
   A real 12-inch record is 30 cm across; this platter is about 6 cm on a laptop.
   At 1:1 a centimeter of hand is five times the record it would be under your
   palm, so the smallest movement is a big move in the music. The touch ratio is
   the jog-wheel gearing: FINE means you turn further to move the same amount of
   song, which is what makes a slow, steady pull — the one that stretches a
   vocal — possible with a mouse. 1:1 is still there for true vinyl behavior. */
const TOUCH = { fine:0.35, normal:0.6, vinyl:1 };
let touch = (localStorage.getItem("aog.decks.touch") || "fine");
if(!TOUCH[touch]) touch = "fine";
/* the tape: what the decks are doing, caught on its way to the speakers */
const TAPE = { node:null, sink:null, on:false, chunks:[], frames:0, t0:0, takes:[], n:0, timer:null, bpm0:0, bpm1:0, msg:"" };
const TAPE_MAX_SEC = 600;
/* AOG-DJ-LEVEL-V1 — every record is level-matched as it loads (measured in LUFS, the
   way broadcasters measure loudness), so a quiet record and a loud one blend evenly. */
const LEVEL_LUFS = -15;
/* the platter stands still for anyone who asks the computer for less motion */
const STILL = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

function ctx(){
  /* AOG-MUSIC-TOUCH-V1 — Safari suspends the engine between gestures; every call wakes it */
  if(actx && actx.state!=="running"){ try{ actx.resume(); }catch(e){} }
  if(!actx){
    const AC = window.AudioContext||window.webkitAudioContext;
    actx = new AC({ latencyHint:"interactive" });
    /* AOG-DECKS-LOUDNESS-V1 — the same treatment the drum machine got: a normal
       level with a real limiter behind it, so three loud songs at once still
       cannot clip. The last 6% is deliberately left alone. */
    master = actx.createGain(); master.gain.value = 0.94;
    comp = actx.createDynamicsCompressor();
    comp.threshold.value = -12; comp.ratio.value = 2.5; comp.knee.value = 10;
    const makeup = actx.createGain(); makeup.gain.value = 1.6;
    const limiter = actx.createDynamicsCompressor();
    limiter.threshold.value = -3; limiter.knee.value = 0; limiter.ratio.value = 20;
    limiter.attack.value = 0.002; limiter.release.value = 0.09;
    comp.connect(makeup); makeup.connect(limiter); limiter.connect(master);
    /* AOG-DJ-LIMIT-V1 — OUT is the very end: what the speakers, the tape and the curve all hear.
       Once the worklet is in, a look-ahead wall sits just before it, so nothing leaves above -1 dBFS. */
    OUT = actx.createGain(); master.connect(OUT); OUT.connect(actx.destination);
    if(actx.audioWorklet){
      workletReady = actx.audioWorklet
        .addModule(new URL("aog-vinyl-worklet.js", document.baseURI).href)
        .then(()=>{ try{ const lim = new AudioWorkletNode(actx, "aog-djlimit", { numberOfInputs:1, numberOfOutputs:1, outputChannelCount:[2] });
                         master.disconnect(OUT); master.connect(lim); lim.connect(OUT); LIMIT = lim; }catch(e){} })
        .catch((err)=>{ workletReady = null; try{ console.warn("vinyl worklet unavailable — falling back", err); }catch(e){} });
    }
    eqScope = actx.createAnalyser(); eqScope.fftSize = 2048; eqScope.smoothingTimeConstant = 0.72;
    OUT.connect(eqScope);
    buildTape();   /* ⚠ AFTER workletReady exists, or the tape quietly falls back */
  }
  if(actx.state==="suspended") actx.resume();
  return actx;
}
function makeDeck(id){
  return { id, buf:null, peaks:null, zpk:null, name:"", note:"", pos:0, cue:0, rate:0, rr:0, frame:0, motor:false,
           pitch:1, rpm:1, vol:1, node:null, core:null, gain:null, xg:null, trim:null, fx:null, lp:null, hp:null,
           rot:0, level:0, held:false, wide:false, pending:[],
           bpm:0, beat0:0, bands:null, cues:[null,null,null,null,null,null,null,null], loopBeats:0, loopOn:false,
           loopA:0, loopB:0, cueHeld:false, revOn:false,
           keyOn:true, slipOn:true, syncLock:false, taps:[], trackKey:"", made:"", lufs:null, gain0:1,
           side: id==="A" ? "L" : id==="B" ? "R" : "N", eqv:{high:0,mid:0,low:0}, filtv:0,
           fxType:"echo", fxBeats:{echo:0.75, reverb:2, flanger:16}, fxAmt:0, fxSent:"",
           snap:1, erase:false, slipPos:0, div:false, pend:false, lastJump:null, jumps:0, wraps:0,
           waveDirty:true, wcan:null, zcan:null, bend:1, padDown:{}, xgv:1 };
}
function send(d, m){
  if(d.node && d.node.port) d.node.port.postMessage(m, m.L ? [m.L.buffer, m.R.buffer] : []);
  else if(d.core) d.core.msg(m);
  else d.pending.push(m);
}
function ramp(p, v, tau){ const now = actx.currentTime; p.cancelScheduledValues(now); p.setTargetAtTime(v, now, tau || 0.01); }
function biq(type, hz, q){ const b = actx.createBiquadFilter(); b.type = type; b.frequency.value = hz; b.Q.value = q; return b; }
async function ensureNode(d){
  ctx();
  if(d.node || d.core) return;
  if(d._making) return d._making;   /* two taps at once must not build two decks */
  d._making = (async ()=>{
    if(workletReady){
      try{
        await workletReady;
        const n = new AudioWorkletNode(actx, "aog-vinyl", { numberOfInputs:0, outputChannelCount:[2] });
        n.port.onmessage = (e)=>{ hear(d, e.data); };
        d.node = n;
      }catch(e){ d.node = null; }
    }
    if(!d.node){
      /* no AudioWorklet (old Safari): the same core, on the old processor */
      d.core = new self.AOGVinylCore(actx.sampleRate);
      const n = actx.createScriptProcessor(512, 0, 2);
      n.onaudioprocess = (e)=>{
        const o = e.outputBuffer, c = d.core;
        c.frame = Math.round((e.playbackTime || actx.currentTime) * actx.sampleRate);
        c.process(o.getChannelData(0), o.getChannelData(1), o.length);
        hear(d, { t:"st", pos:c.pos, level:c.level, rate:c.rate/(c.srRatio||1), rr:c.rate, frame:c.frame, motor:c.motorOn, ended:c.ended,
                  slip:c.slipPos, div:c.div, pend:!!c.pend, loopOn:c.loopOn, loopA:c.loopA, loopB:c.loopB, jumps:c.jumps, wraps:c.wraps, lastJump:c.lastJump });
      };
      d.node = n;
    }
    /* AOG-DJ-MIXER-V1 — the channel, in the order a club mixer has it:
       level match → three-band isolator EQ (with kills) → the filter (low-pass
       left, high-pass right) → the channel fader → the crossfader → the effect,
       after both faders so an echo rings on once the record is cut. */
    d.trim = actx.createGain(); d.trim.gain.value = d.gain0;
    d.eq = AOGDJ.isolator(actx);
    d.lp = biq("lowpass", Math.min(20000, actx.sampleRate*0.45), -3.01);
    d.hp = biq("highpass", 10, -3.01);
    d.gain = actx.createGain(); d.gain.gain.value = chanGain(d);
    d.xg = actx.createGain(); d.xg.gain.value = 1;
    d.fx = null;
    if(workletReady){
      try{ await workletReady; d.fx = new AudioWorkletNode(actx, "aog-djfx", { numberOfInputs:1, numberOfOutputs:1, outputChannelCount:[2] });
        d.fx.port.onmessage = (e)=>{ if(e.data && e.data.t==="fxst") d.fxState = e.data; }; }catch(e){ d.fx = null; }
    }
    if(!d.fx && self.AOGDJFxCore){
      const core = new self.AOGDJFxCore(actx.sampleRate), n = actx.createScriptProcessor(512, 2, 2);
      n.onaudioprocess = (e)=>{ const i = e.inputBuffer, o = e.outputBuffer; core.process(i.getChannelData(0), i.getChannelData(1), o.getChannelData(0), o.getChannelData(1), o.length); };
      n.port = { postMessage:(m)=>{ if(m.t==="ask") d.fxState = core.state(); else core.msg(m); } };
      d.fx = n;
    }
    d.node.connect(d.trim); d.trim.connect(d.eq.input); d.eq.output.connect(d.lp); d.lp.connect(d.hp);
    d.hp.connect(d.gain); d.gain.connect(d.xg);
    if(d.fx){ d.xg.connect(d.fx); d.fx.connect(comp); } else d.xg.connect(comp);
    send(d, { t:"noise", v: noiseOn ? 0.5 : 0 });
    send(d, { t:"key", on:d.keyOn });
    send(d, { t:"slip", on:d.slipOn });
    const q = d.pending; d.pending = [];
    q.forEach(m=>send(d, m));
    ["low","mid","high"].forEach(b=>{ d.eq.set(b, d.eqv[b]); });
    applyFilter(d); fxSend(d, true);
    setMix(); eqDirty = true;
  })();
  try{ await d._making; } finally { d._making = null; }
}
/* what the audio thread tells the page, about 60 times a second */
function hear(d, m){
  if(!m || m.t!=="st") return;
  d.pos = m.pos; d.level = m.level; d.rate = m.rate; d.rr = m.rr; d.frame = m.frame;
  d.slipPos = m.slip; d.div = m.div; d.pend = m.pend; d.lastJump = m.lastJump; d.jumps = m.jumps; d.wraps = m.wraps;
  if(m.loopOn){ d.loopA = m.loopA; d.loopB = m.loopB; }
  d.wLoopOn = m.loopOn;
  if(d._startAt != null && m.frame >= d._startAt) d._startAt = null;   /* the booked start has happened */
  if(d.motor && m.ended && d._startAt == null){ d.motor = false; }
}
async function loadFile(d, file, opts){
  d.note = t("loading").replace("%s", file.name); paintDeck(d);
  try{
    ctx(); await ensureNode(d);
    const arr = await file.arrayBuffer();
    const buf = await new Promise(function(ok, no){
      const r = actx.decodeAudioData(arr.slice(0), ok, no);
      if(r && r.then) r.then(ok, no);
    });
    const L = Float32Array.from(buf.getChannelData(0));
    const R = Float32Array.from(buf.numberOfChannels>1 ? buf.getChannelData(1) : buf.getChannelData(0));
    putOn(d, buf, L, R, Object.assign({ name:file.name, key:(file.name||"?") + "·" + (file.size||0) + "·" + Math.round(buf.duration*100) }, opts||{}));
    if(!opts || !opts.restore) crateSpun(d, file, arr);
  }catch(e){
    d.note = (/\.m4p$/i.test(file.name) ? t("locked") : t("nope")).replace("%s", file.name); paintDeck(d);
    setTimeout(()=>{ if(d.note){ d.note=""; paintDeck(d); } }, 9000);
  }
}
/* AOG-DJ-V1 — the one door every record comes in by: a song from the computer, a take,
   a shelf from another tool, or a record made on this page. */
function putOn(d, buf, L, R, o){
  stopDeck(d, true);
  d.buf = buf; d.name = o.name; d.note = ""; d.pos = 0; d.cue = 0; d.motor = false; d.made = o.made || "";
  d.peaks = peaksOf(buf); d.zpk = zoomPeaks(buf); d.waveDirty = true;
  d.bpm = -1; d.bands = null; d.cues = [null,null,null,null,null,null,null,null];
  d.loopOn = false; d.loopBeats = 0; send(d, { t:"loop", on:false, keep:true });
  d.trackKey = o.key;
  d.lufs = o.lufs != null ? o.lufs : null;
  send(d, { t:"buf", L:L, R:R, sr:buf.sampleRate });
  if(o.pos > 0 && o.pos < buf.length-3){ d.pos = d.cue = o.pos; send(d, { t:"seek", v:d.pos, park:true }); }
  const known = marksLoad(d);
  setTimeout(()=>{
    try{ analyse(d, { bpm:o.bpm, beat0:o.beat0, lufs:o.lufs }); }catch(e){ d.bpm = 0; }
    const wd = wordOf(d.name);
    if(wd){ d.bpm = 0; d.beat0 = 0; d.cues = fill8(wd.verses.map(v=>Math.round(v.at*buf.sampleRate))); }   /* AOG-SCRIPTURE-V1: a verse on each pad */
    else if(known){ d.bpm = known.bpm; d.beat0 = known.beat0; d.cues = fill8(known.cues); }
    else {
      /* a starter track: the tempo is exact and beat one is the very first sound */
      const sb = starterBpm(d.name);
      if(sb){ d.bpm = sb; const a0 = buf.getChannelData(0); let i0 = 0; while(i0 < a0.length && Math.abs(a0[i0]) < 0.05) i0++; d.beat0 = i0 < a0.length ? i0/buf.sampleRate : 0; }
      marksSave(d);
    }
    levelMatch(d);
    d.waveDirty = true; paintDeck(d); drawWave(d); drawZoom(d); fxSend(d); paintStrips();
  }, 30);
  drawWave(d); drawZoom(d); paintDeck(d); paintStrips();
}
function fill8(c){ const o = [null,null,null,null,null,null,null,null]; (c||[]).forEach((v,i)=>{ if(i<8) o[i] = v; }); return o; }
function levelMatch(d){
  let db = 0;
  if(d.lufs != null && isFinite(d.lufs) && d.lufs > -60) db = Math.max(-12, Math.min(9, LEVEL_LUFS - d.lufs));
  d.gain0 = Math.pow(10, db/20);
  if(d.trim) ramp(d.trim.gain, d.gain0, 0.02);
}
/* ══ AOG-DECKS-PRO-V1 (2026-09-23) — WHAT THE DECK KNOWS ABOUT THE RECORD ═════
   One pass over the song, once, at load. It gives three things no turntable can
   give you and every DJ wants: the shape of the music split into bass, middle
   and top (so the waveform shows you where the drums are instead of a green
   blob), the tempo, and where beat one sits. Everything after this — the grid,
   the beat loops, SYNC — is arithmetic on those three. ══════════════════════ */
function peaksOf(buf){
  const W = 1200, a = buf.getChannelData(0), step = Math.max(1, Math.floor(a.length/W)), out = new Float32Array(W);
  for(let x=0;x<W;x++){
    let m=0; const o=x*step, e=Math.min(a.length, o+step);
    for(let i=o;i<e;i+=4){ const v=a[i]<0?-a[i]:a[i]; if(v>m) m=v; }
    out[x]=m;
  }
  return out;
}
/* the close-up's own picture: the loudest sample in every 32, worked out once */
function zoomPeaks(buf){
  const a = buf.getChannelData(0), Z = 32, n = Math.ceil(a.length/Z), out = new Float32Array(n);
  for(let k=0;k<n;k++){ let m = 0; const e = Math.min(a.length, (k+1)*Z); for(let i=k*Z;i<e;i++){ const v = a[i]<0?-a[i]:a[i]; if(v>m) m=v; } out[k] = m; }
  return out;
}
function analyse(d, known){
  known = known || {};
  const buf = d.buf; if(!buf) return;
  const a = buf.getChannelData(0), sr = buf.sampleRate, n = a.length;
  const W = 1200, step = n/W;
  const lo = new Float32Array(W), mid = new Float32Array(W), hi = new Float32Array(W);
  const kLo = 1 - Math.exp(-2*Math.PI*180/sr), kHi = 1 - Math.exp(-2*Math.PI*3200/sr);
  const hop = Math.max(1, Math.round(sr/400)), frames = Math.floor(n/hop);
  const env = new Float32Array(frames);
  let f1 = 0, f2 = 0, acc = 0, cnt = 0, fi = 0;
  for(let i=0;i<n;i++){
    const x = a[i];
    f1 += kLo*(x - f1);            /* bass */
    f2 += kHi*(x - f2);            /* bass + middle */
    const c = (i/step)|0;
    const al = f1<0?-f1:f1, am = Math.abs(f2-f1), ah = Math.abs(x-f2);
    if(c<W){
      if(al>lo[c]) lo[c]=al;
      if(am>mid[c]) mid[c]=am;
      if(ah>hi[c]) hi[c]=ah;
    }
    acc += x*x; cnt++;
    if(cnt===hop){ if(fi<frames) env[fi++] = Math.sqrt(acc/hop); acc = 0; cnt = 0; }
  }
  d.bands = { lo:lo, mid:mid, hi:hi };
  /* how loud the record is, as an ear hears it — for the level match */
  if(known.lufs == null){ try{ d.lufs = AOGDJ.loudness(buf.getChannelData(0), buf.numberOfChannels>1 ? buf.getChannelData(1) : null, sr); }catch(e){ d.lufs = null; } }
  else d.lufs = known.lufs;
  /* a record that knows its own tempo (made here, or bounced by another tool) skips the guessing */
  if(known.bpm > 0 && known.beat0 != null){ d.bpm = known.bpm; d.beat0 = known.beat0; return; }
  /* the beat is where the sound GROWS: rising energy, lined up with itself */
  const on = new Float32Array(frames);
  for(let i=1;i<frames;i++){ const dv = env[i]-env[i-1]; on[i] = dv>0?dv:0; }
  const fps = sr/hop;
  let bestBpm = known.bpm > 0 ? known.bpm : 0;
  if(!bestBpm){
    let best = 0;
    for(let bpm=72; bpm<=176; bpm+=0.25){
      const lag = Math.round(60/bpm*fps);
      if(lag < 2 || lag*3 >= frames) continue;
      let sum = 0;
      for(let i=0; i+lag<frames; i++) sum += on[i]*on[i+lag];
      sum /= (frames - lag);
      if(sum > best){ best = sum; bestBpm = bpm; }
    }
    if(!bestBpm || frames < 200){ d.bpm = 0; d.beat0 = 0; return; }
    /* the coarse pass lands within a quarter of a beat per minute; this one walks
       around that answer in fiftieths, because a tempo that is 0.6% out drifts a
       tenth of a second across sixteen bars and the grid stops looking honest. */
    let fine = bestBpm, fineBest = best;
    for(let bpm=bestBpm-2; bpm<=bestBpm+2; bpm+=0.02){
      const lagf = 60/bpm*fps, l0 = Math.floor(lagf), fr = lagf - l0;
      if(l0 < 2 || l0*3 >= frames) continue;
      let sum = 0;
      for(let i=0; i+l0+1<frames; i++) sum += on[i]*(on[i+l0]*(1-fr) + on[i+l0+1]*fr);
      sum /= (frames - l0);
      if(sum > fineBest){ fineBest = sum; fine = bpm; }
    }
    bestBpm = fine;
  }
  const period = 60/bestBpm*fps;
  let bo = 0, bs = -1;
  for(let off=0; off<period; off+=1){
    let sum = 0;
    for(let k=0; off + k*period < frames; k++) sum += on[Math.round(off + k*period)] || 0;
    if(sum > bs){ bs = sum; bo = off; }
  }
  d.bpm = Math.round(bestBpm*100)/100;
  d.beat0 = bo/fps;
}
async function buildTape(){
  if(TAPE.node || !actx) return;
  const keep = (L,R)=>{ TAPE.chunks.push([L,R]); TAPE.frames += L.length; };
  if(workletReady){
    try{
      await workletReady;
      const n = new AudioWorkletNode(actx, "aog-tape", { numberOfInputs:1, numberOfOutputs:1, outputChannelCount:[2] });
      n.port.onmessage = (e)=>{ if(e.data && e.data.t==="chunk") keep(e.data.L, e.data.R); };
      TAPE.node = n;
    }catch(e){ TAPE.node = null; }
  }
  if(!TAPE.node){
    const n = actx.createScriptProcessor(4096, 2, 2);
    n.onaudioprocess = (e)=>{
      if(!TAPE.on) return;
      keep(Float32Array.from(e.inputBuffer.getChannelData(0)),
           Float32Array.from(e.inputBuffer.getChannelData(1) || e.inputBuffer.getChannelData(0)));
    };
    TAPE.node = n;
  }
  /* it hangs off the master and ends in silence: a node only runs if it is
     connected to the destination, and we are not playing the mix twice. */
  TAPE.sink = actx.createGain(); TAPE.sink.gain.value = 0;
  OUT.connect(TAPE.node); TAPE.node.connect(TAPE.sink); TAPE.sink.connect(actx.destination);
}
function armTape(on){
  if(!TAPE.node) return;
  TAPE.on = on;
  if(TAPE.node.port) TAPE.node.port.postMessage({ t:"arm", on:on });
}
async function recToggle(){
  ctx(); await buildTape();
  if(!TAPE.on){
    TAPE.chunks = []; TAPE.frames = 0; TAPE.t0 = performance.now();
    TAPE.bpm0 = mixTempo(); TAPE.bpm1 = 0; TAPE.msg = "";
    armTape(true);
    TAPE.timer = setInterval(()=>{
      const sec = (performance.now()-TAPE.t0)/1000;
      const el = document.getElementById("recTime"); if(el) el.textContent = clock(sec);
      if(sec >= TAPE_MAX_SEC){ recToggle(); const h=document.getElementById("recHint"); if(h) h.textContent = t("full"); }
    }, 200);
  } else {
    TAPE.bpm1 = mixTempo();
    armTape(false);
    clearInterval(TAPE.timer); TAPE.timer = null;
    setTimeout(()=>{ finishTake(); }, 120);   /* let the last chunk arrive */
  }
  paintTape();
}
function finishTake(){
  if(!TAPE.frames){ paintTape(); return; }
  const n = TAPE.frames, L = new Float32Array(n), R = new Float32Array(n);
  let o = 0;
  TAPE.chunks.forEach(c=>{ L.set(c[0], o); R.set(c[1], o); o += c[0].length; });
  TAPE.chunks = []; TAPE.frames = 0;
  const wav = wavBlob(L, R, actx.sampleRate);
  TAPE.takes.unshift({ n: ++TAPE.n, sec: n/actx.sampleRate, url: URL.createObjectURL(wav), blob: wav, at: Date.now(), bpm: TAPE.bpm1 || TAPE.bpm0 });
  while(TAPE.takes.length > 6){ const old = TAPE.takes.pop(); URL.revokeObjectURL(old.url); }
  paintTape();
}
/* a 16-bit stereo WAV: it opens in anything, on any machine, with no codec to
   argue about — which matters when a student mails it to themselves. */
function wavBlob(L, R, sr){
  const n = L.length, bytes = 44 + n*4, ab = new ArrayBuffer(bytes), v = new DataView(ab);
  const str = (o,s)=>{ for(let i=0;i<s.length;i++) v.setUint8(o+i, s.charCodeAt(i)); };
  str(0,"RIFF"); v.setUint32(4, bytes-8, true); str(8,"WAVEfmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr*4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true);
  str(36,"data"); v.setUint32(40, n*4, true);
  let o = 44;
  for(let i=0;i<n;i++){
    let l = L[i], r = R[i];
    l = l>1?1:l<-1?-1:l; r = r>1?1:r<-1?-1:r;
    v.setInt16(o, l*32767, true); v.setInt16(o+2, r*32767, true); o += 4;
  }
  return new Blob([ab], { type:"audio/wav" });
}
/* "Onto deck A · B · C": one short label, three buttons that each say their deck to a screen reader */
function ontoHTML(attr){
  return `<span class="onto"><em>${t("onto")}</em>${IDS.map(id=>`<button type="button" ${attr(id)} aria-label="${t("to"+id)}">${id}</button>`).join("")}</span>`;
}
function paintTape(){
  const btn = document.getElementById("recBtn");
  if(btn){ btn.textContent = TAPE.on ? t("recStop") : t("rec"); btn.classList.toggle("on", TAPE.on); }
  const tm = document.getElementById("recTime"); if(tm && !TAPE.on) tm.textContent = "0:00";
  const box = document.getElementById("takes");
  if(!box) return;
  box.innerHTML = TAPE.takes.map(k=>`
    <div class="take" data-take="${k.n}">
      <b>${t("take")} ${k.n}</b> <span class="tlen">${clock(k.sec)}</span>
      <audio controls preload="none" src="${k.url}"></audio>
      <a class="ghost" href="${k.url}" download="turntables-take-${k.n}.wav">${t("save")}</a>
      ${ontoHTML(id=>`data-totake="${k.n}" data-deck="${id}"`)}
      <button type="button" class="ghost" data-tostudio="${k.n}">${t(inStudioNow() ? "layer" : "toStudio")}</button>
    </div>`).join("");
  box.querySelectorAll("a[download]").forEach(a=>{ a.addEventListener("click", ()=>{ LX.saved = true; }); });
  box.querySelectorAll("[data-totake]").forEach(b=>{
    b.onclick = ()=>{
      const k = TAPE.takes.find(x=>x.n === +b.getAttribute("data-totake")); if(!k) return;
      const d = decks.find(x=>x.id === b.getAttribute("data-deck"));
      loadFile(d, new File([k.blob], "take-"+k.n+".wav", { type:"audio/wav" }));
    };
  });
  box.querySelectorAll("[data-tostudio]").forEach(b=>{ b.onclick = ()=>tapeToStudio(+b.getAttribute("data-tostudio"), b); });
  paintTakeLine();
}
/* AOG-STUDIO-SEND-V1 (2026-10-04) — Jimmy: "All the instruments should be able to record and send their tracks over to
   the STUDIO." A take of the mix joins the Studio's inbox (aog-handoff.js, "studioinbox"), beside the instruments' takes:
   its number, length, tempo (the MASTER deck's, as heard, when Record stopped; 0 when no deck knows its tempo) and when it
   was made. The same take sent twice is kept once. One line says what happened. */
function mixTempo(){
  const m = decks.find(d=>d.id===masterId && d.buf && d.bpm > 0) || decks.find(d=>d.motor && d.buf && d.bpm > 0);
  return m ? Math.round(effBpm(m)*100)/100 : 0;
}
async function tapeToStudio(n, btn){
  const k = TAPE.takes.find(x=>x.n === n); if(!k) return;
  if(btn) btn.disabled = true;
  try{
    if(!window.AOGHandoff || !AOGHandoff.add) throw new Error("no inbox");
    await AOGHandoff.add(AOGHandoff.INBOX, { from:"decks", n:k.n, name:{ en:"Turntables take "+k.n, es:"Toma de los tocadiscos "+k.n },
      sec:Math.round(k.sec*1000)/1000, bpm:k.bpm || 0, at:k.at || Date.now(), take:true, wav:k.blob }, { key:"decks|"+(k.at||0)+"|"+k.n });
    TAPE.msg = "studioSent"; TAPE.sentN = n;
  }catch(e){ TAPE.msg = (e && e.name === "QuotaExceededError") ? "noRoom" : "studioFail"; }
  if(btn) btn.disabled = false;
  paintTakeLine();
}
function inStudioNow(){ return document.documentElement.classList.contains("in-studio"); }   /* aog-labdoors.js, AOG-STUDIO-SHELL-V1 */
/* AOG-STUDIO-TRANSPORT-V1 (2026-10-09) — the Recording Studio's transport (/the-studio) drives this page's Record */
window.AOGStudioRec = {
  on: ()=>!!TAPE.on, busy: ()=>false,
  toggle: ()=>{ const b = document.getElementById("recBtn"); if(b) b.click(); },
  last: ()=>TAPE.takes[0] ? { n:TAPE.takes[0].n, sec:TAPE.takes[0].sec } : null,
  sent: ()=>!!(TAPE.takes[0] && TAPE.sentN === TAPE.takes[0].n),
  add: ()=>TAPE.takes[0] ? tapeToStudio(TAPE.takes[0].n) : Promise.resolve()
};
function paintTakeLine(){
  const el = document.getElementById("takeLine"); if(!el) return;
  if(TAPE.msg === "studioSent") el.innerHTML = `${t(inStudioNow() ? "layerSent" : "studioSent")} <a href="/studio">${t("studioGo")}</a>`;
  else el.textContent = TAPE.msg ? t(TAPE.msg) : "";
}
/* ══ AOG-DECKS-FROM-BENCH-V1 (2026-09-23) ════════════════════════════════════
   The drum machine bounces its pattern onto a shelf both benches can reach
   (aog-handoff.js); here it is a beat you drop on a platter. So: your own beat
   on deck B, a song on deck A, scratch over it, and Record keeps the lot.
   AOG-DJ-V1 — a shelf that says its tempo (and where beat one is) gives the deck
   an exact grid, so SYNC with another tool's beat is exact too. */
const SHELF = [
  { key:"padbench",   id:"padbench",  lab:"padsT",     go:"padsGo",   href:"music-pads.html",   file:"beat-lab.wav" }, /* AOG-PADS-STUDIO-V1: a loop or take from the Beat Lab */
  { key:"keysbench",  id:"keys",      lab:"keys",      go:"keysGo",   href:"music-piano.html",  file:"piano.wav" },   /* AOG-PIANO-V1 */
  { key:"guitarbench",id:"guitar",    lab:"guitar",    go:"guitarGo", href:"music-guitar.html", file:"guitar.wav" },  /* AOG-STRINGS-V1 */
  { key:"bassbench",  id:"bass",      lab:"bassT",     go:"bassGo",   href:"music-bass.html",   file:"bass.wav" },
  { key:"bandbench",  id:"band",      lab:"bandT",     go:"bandGo",   href:"music-band.html",   file:"band.wav" },    /* AOG-BAND-V1 */
  { key:"drumtake",   id:"drumtake",  lab:"drumTakeT", go:"kitGo",    href:"music-kit.html",    file:"drumtake.wav" },/* AOG-MUSIC-REC-V1: a take recorded on the drum kit */
  { key:"studiobench",id:"studio",    lab:"studioT",   go:"studioGo", href:"music-studio.html", file:"studio.wav" }   /* AOG-STUDIO-V1: a song mixed in the studio */
];
const SHELVES = {};
async function checkBench(){
  for(const s of SHELF){ try{ SHELVES[s.key] = await AOGHandoff.get(s.key); }catch(e){ SHELVES[s.key] = null; } }
  paintBench();
}
/* a bounce knows its tempo (and the drum machine and the studio know where beat one is);
   a take of free playing does not, so the deck listens for it */
function shelfGrid(tk){
  if(!tk || !(tk.bpm > 0) || tk.take) return {};
  return tk.offset != null ? { bpm:+tk.bpm, beat0:+tk.offset } : { bpm:+tk.bpm };
}
function paintBench(){
  const box = document.getElementById("bench");
  if(!box) return;
  let html = "";
  SHELF.forEach(s=>{
    const tk = SHELVES[s.key];
    if(!tk || !tk.wav){
      return;   /* AOG-DECKS-CALM-V1: an empty shelf says nothing; the lab doors at the top lead to each lab */
    }
    /* ⚠ the piano's buttons keep their old name (data-keys), the rest say which shelf they take */
    const attr = s.id === "keys" ? (id=>`data-keys="${id}"`) : (id=>`data-take="${s.id}" data-deck="${id}"`);
    html += `<div class="take">
      <b>${t(s.lab)}</b> <span class="tlen">${esc(tk.name||"")}</span>
      ${ontoHTML(attr)}
      <a class="ghost" href="${s.href}">${t(s.go)}</a>
    </div>`;
  });
  box.innerHTML = html;
  const put = (s, d)=>{ const tk = SHELVES[s.key]; if(tk && tk.wav && d) loadFile(d, new File([tk.wav], s.file, { type:"audio/wav" }), shelfGrid(tk)); };
  box.querySelectorAll("[data-take]").forEach(b=>{
    b.onclick = ()=>{ const s = SHELF.find(x=>x.id===b.getAttribute("data-take")); put(s, decks.find(x=>x.id===b.getAttribute("data-deck"))); };
  });
  box.querySelectorAll("[data-keys]").forEach(b=>{
    b.onclick = ()=>{ put(SHELF.find(x=>x.id==="keys"), decks.find(x=>x.id===b.getAttribute("data-keys"))); };
  });
}
/* ══ AOG-DECKS-CRATE-V1 (2026-09-25) — THE RECORD CRATE ══════════════════════
   Jimmy: "make it so the turntable saves what was last used (if the tab is
   closed) … a 'Previously spun' or a crate for upcoming music so it can go
   smoother." Three shelves, all in IndexedDB on this computer, never sent:
   · what is on each platter, and where the needle was, so a closed tab opens
     with the same records on, parked where you left them;
   · the last eight records you played, one tap to put any back on a deck;
   · UP NEXT — songs you line up before the set, played in order. ══════════ */
const CRATE = { db:"aog-crate", store:"crate", prev:[], next:[], lib:[], max:8 };
/* AOG-DJ-AUDIO-ONLY-V1 (Jimmy, 2026-10-10: "The photo and video is suppose to be gone … I am uploading music"): on an
   iPhone or iPad, .m4a, .m4b, .aac and .amr count as MPEG-4 video, so Safari offered Photo Library and Take Video.
   There the song boxes ask for audio only; audio/* still takes .m4a, .mp3, .wav and the rest from Files. */
const AUDIO_ONLY = (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) ? "audio/*" : "";
function crateDb(){
  return new Promise((ok, no)=>{
    if(!window.indexedDB){ no(new Error("no indexedDB")); return; }
    const r = indexedDB.open(CRATE.db, 1);
    r.onupgradeneeded = ()=>{ if(!r.result.objectStoreNames.contains(CRATE.store)) r.result.createObjectStore(CRATE.store); };
    r.onsuccess = ()=>ok(r.result); r.onerror = ()=>no(r.error);
  });
}
async function crateGet(k){
  try{
    const db = await crateDb();
    return await new Promise(ok=>{
      const q = db.transaction(CRATE.store, "readonly").objectStore(CRATE.store).get(k);
      q.onsuccess = ()=>{ db.close(); ok(q.result || null); }; q.onerror = ()=>{ db.close(); ok(null); };
    });
  }catch(e){ return null; }
}
async function cratePut(k, v){
  try{
    const db = await crateDb();
    await new Promise(ok=>{
      const tx = db.transaction(CRATE.store, "readwrite");
      if(v == null) tx.objectStore(CRATE.store).delete(k); else tx.objectStore(CRATE.store).put(v, k);
      tx.oncomplete = ()=>{ db.close(); ok(); }; tx.onerror = tx.onabort = ()=>{ db.close(); ok(); };
    });
  }catch(e){}
}
const crateId = f => (f.name||"?") + "·" + (f.size||0);
function crateFile(r){ return new File([r.blob], r.name, { type:r.blob.type||"" }); }
/* AOG-DECKS-LIBRARY-V1 (2026-09-26) — Jimmy: "the music comes and goes ... make it a permanent
   fixture ... installed in the Load a song dock." iPhone hands the page a borrowed file that can
   vanish later, so every song is copied into the page's own storage the moment it arrives, and
   every song ever added lives in the library that Load a song opens. */
async function crateCopy(file, arr){
  const buf = arr || await file.arrayBuffer();
  return new Blob([buf.slice ? buf.slice(0) : buf], { type:file.type||"" });
}
async function crateInstall(file, arr){
  const rec = { id:crateId(file), name:file.name, blob:await crateCopy(file, arr), at:Date.now() };
  CRATE.lib = [rec].concat(CRATE.lib.filter(x=>x.id!==rec.id)).slice(0, 60);
  cratePut("lib", CRATE.lib); paintDocks();
  return rec;
}
async function crateSpun(d, file, arr){
  const rec = await crateInstall(file, arr);
  cratePut("deck-"+d.id, rec);
  CRATE.prev = [rec].concat(CRATE.prev.filter(x=>x.id!==rec.id)).slice(0, CRATE.max);
  cratePut("prev", CRATE.prev);
  paintCrate();
}
function crateForget(d){ cratePut("deck-"+d.id, null); try{ localStorage.removeItem("aog.decks.pos."+d.id); }catch(e){} }
function crateKeepPlace(){
  decks.forEach(d=>{ try{ if(d.buf) localStorage.setItem("aog.decks.pos."+d.id, String(Math.round(d.pos||0))); }catch(e){} });
}
async function crateOpen(){
  CRATE.prev = (await crateGet("prev")) || [];
  CRATE.next = (await crateGet("next")) || [];
  CRATE.lib = (await crateGet("lib")) || [];
  /* songs saved before the library existed join it */
  CRATE.next.concat(CRATE.prev).forEach(r=>{ if(r && r.blob && !CRATE.lib.some(x=>x.id===r.id)) CRATE.lib.push(r); });
  paintCrate(); paintDocks();
  /* the records that were on when the tab closed go back on, stopped */
  for(const d of decks){
    const r = await crateGet("deck-"+d.id);
    if(!r || d.buf) continue;
    let pos = 0; try{ pos = +localStorage.getItem("aog.decks.pos."+d.id) || 0; }catch(e){}
    if(r.made){ await loadMade(d, r.made, { restore:true, pos:pos }); continue; }
    if(!r.blob) continue;
    await loadFile(d, crateFile(r), { restore:true, pos:pos });
  }
}
function crateRow(r, i, list){
  return `<div class="take">
      <span class="nm" title="${esc(r.name)}">${list==="next"?(i+1)+". ":""}${esc(r.name)}</span>
      ${ontoHTML(id=>`data-crate="${list}" data-i="${i}" data-deck="${id}"`)}
      <button type="button" class="ghost" data-cratedrop="${list}" data-i="${i}" aria-label="${t("crateDrop")}">✕</button>
    </div>`;
}
function crateTake(i, d){
  const r = CRATE.next[i]; if(!r || !d) return;
  CRATE.next.splice(i,1); cratePut("next", CRATE.next);
  LX.crateTake = true;
  loadFile(d, crateFile(r)); paintCrate();
}
function esc(s){ return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
/* AOG-DECKS-FIND-V1 (2026-09-26) — Jimmy: "when you go to load a song [there]
   should [be] direct links to websites that offer acapellas and samples
   (lyrical / voice and music)." Free, well-known sources; each opens in a new tab. */
const FIND = [
  {u:"https://ccmixter.org/view/media/samples/acappellas", n:"ccMixter", en:"acapellas · voice", es:"acapellas · voz"},
  {u:"https://www.looperman.com/acapellas", n:"Looperman", en:"acapellas · loops", es:"acapellas · loops"},
  {u:"https://freesound.org/", n:"Freesound", en:"samples · voice and sounds", es:"samples · voz y sonidos"},
  {u:"https://pixabay.com/music/", n:"Pixabay Music", en:"full songs", es:"canciones completas"},
  {u:"https://freemusicarchive.org/", n:"Free Music Archive", en:"full songs", es:"canciones completas"},
  {u:"https://musopen.org/music/", n:"Musopen", en:"classical recordings", es:"grabaciones clásicas"},
  {u:"https://sound-effects.bbcrewind.co.uk/", n:"BBC Sound Effects", en:"sound effects", es:"efectos de sonido"}
];
function findLinks(){
  return `<details class="more find-box"><summary>${t("findH")}</summary><ul class="find">${FIND.map(f=>`<li><a href="${f.u}" target="_blank" rel="noopener noreferrer">${f.n}</a> <span>${f[S.lang]||f.en}</span></li>`).join("")}</ul><p class="rechint" style="margin:0">${t("findHint")}</p><p class="rechint" style="margin:0"><a href="decks-tracks.html" id="starterList" style="color:inherit;font-weight:700">${t("starterList")}</a></p></details>`;
}
/* AOG-DECKS-STARTER-V1 (2026-09-27) — Jimmy: "Could the team gather tracks for the
   turntables to set up in advance?" Eleven short tracks made for the site (see
   _work/crate/make_crate.py: synthesized, no samples), each at an exact tempo.
   Nothing loads until the learner presses the button; then each file goes in
   through crateInstall, the same path as Add songs, and joins Up next. */
const STARTER = [
  ["01-paper-kites","Paper Kites","Cometas de papel",90,"Boom-bap","Boom-bap"],
  ["02-porch-light","Porch Light","Luz del porche",80,"Slow jam","Balada lenta"],
  ["03-island-morning","Island Morning","Mañana en la isla",84,"Reggae one-drop","Reggae one-drop"],
  ["04-sunday-clap","Sunday Clap","Aplauso del domingo",100,"Clap-along","Para aplaudir"],
  ["05-practice-pair","Practice Pair","Pareja de práctica",102,"Soul groove","Groove soul"],
  ["06-brass-bus","Brass Bus","Autobús de metales",106,"Funk","Funk"],
  ["07-bell-garden","Bell Garden","Jardín de campanas",110,"Bell and tom groove","Campana y tom"],
  ["08-rooftop-break","Rooftop Break","Break en la azotea",114,"Breakbeat","Breakbeat"],
  ["09-blue-lamp","Blue Lamp","Lámpara azul",120,"House","House"],
  ["10-night-market","Night Market","Mercado de noche",124,"House","House"],
  ["11-fast-lane","Fast Lane","Carril rápido",128,"House","House"]
];
const starterName = x => x[1] + " - " + x[3] + " BPM - " + x[4] + ".mp3";
/* a starter track's tempo is known exactly; the deck uses it instead of a guess */
function starterBpm(name){ const x = STARTER.find(r=>starterName(r)===name); return x ? x[3] : 0; }
let starterMsg = "";
async function starterLoad(btn){
  if(btn) btn.disabled = true;
  let bad = 0;
  for(let i=0;i<STARTER.length;i++){
    const x = STARTER[i];
    starterMsg = t("starterBusy").replace("%n", i+1).replace("%t", STARTER.length);
    const m = document.getElementById("starterMsg"); if(m) m.textContent = starterMsg;
    try{
      const r = await fetch("audio/crate/" + x[0] + ".mp3");
      if(!r.ok) throw new Error(r.status);
      const blob = await r.blob();
      const f = new File([blob], starterName(x), { type:"audio/mpeg" });
      const rec = await crateInstall(f);
      if(!CRATE.next.some(y=>y.id===rec.id)) CRATE.next.push(rec);
    }catch(e){ bad++; }
  }
  cratePut("next", CRATE.next);
  starterMsg = bad ? t("starterFail") : t("starterDone");
  paintCrate();
}
/* AOG-SCRIPTURE-V1 (2026-10-05) — Jimmy: "Produce some of the best scripture verses …
   that talk about sanctification and how Jesus is the only way." Two records of KJV
   verses read by LibriVox volunteers (public domain; audio/crate/CREDITS.txt). They
   are listed in audio/crate/crate.json with each verse's start: those land on pads
   1 to 8. Speech has no tempo, so the deck keeps none (no beat snapping). */
/* AOG-FDR-V1 (2026-10-06): speeches (kind "speech", e.g. FDR's own recordings) get their own box, made the same way */
let WORD = [], wordMsg = {scripture:"", speech:""};
fetch("audio/crate/crate.json").then(r=>r.ok?r.json():[]).then(j=>{ WORD = (Array.isArray(j)?j:[]).filter(x=>x.kind==="scripture"||x.kind==="speech"); paintCrate(); }).catch(()=>{});
const wordName = x => x.title + " - " + (x.version||"KJV") + ".mp3";
function wordOf(name){ return WORD.find(x=>wordName(x)===name) || null; }
const WORDKEY = {scripture:"word", speech:"speech"};
async function wordLoad(btn, kind){
  if(btn) btn.disabled = true;
  const list = WORD.filter(x=>x.kind===kind), id = WORDKEY[kind]+"Msg";
  let bad = 0;
  for(let i=0;i<list.length;i++){
    const x = list[i];
    wordMsg[kind] = t("starterBusy").replace("%n", i+1).replace("%t", list.length);
    const m = document.getElementById(id); if(m) m.textContent = wordMsg[kind];
    try{
      const r = await fetch("audio/crate/" + x.file);
      if(!r.ok) throw new Error(r.status);
      const f = new File([await r.blob()], wordName(x), { type:"audio/mpeg" });
      const rec = await crateInstall(f);
      if(!CRATE.next.some(y=>y.id===rec.id)) CRATE.next.push(rec);
    }catch(e){ bad++; }
  }
  cratePut("next", CRATE.next);
  wordMsg[kind] = bad ? t("starterFail") : t(WORDKEY[kind]+"Done");
  paintCrate();
}
function wordHtml(kind){
  const list = WORD.filter(x=>x.kind===kind), k = WORDKEY[kind];
  if(!list.length) return "";
  const es = S.lang === "es";
  return `<h3>${t(k+"H")}</h3>
    <p class="rechint" style="margin:0">${t(k+"Lead")}</p>
    ${spineBox(kind, list.map(x=>({ name:es?(x.title_es||x.title):x.title, sub:x.version||"", hue:hueOf(x.title), what:es?(x.line_es||x.line||""):(x.line||""), on:id=>`data-pick="w:${x.file}" data-deck="${id}"` })))}
    <div class="take" style="background:none;border:0;padding:0">
      <button type="button" class="ghost" id="${k}Go">${t(k+"Go")}</button>
    </div>
    <p class="starter-msg" id="${k}Msg" role="status" aria-live="polite">${wordMsg[kind]}</p>`;
}
function starterHtml(){
  const es = S.lang === "es";
  return `<h3>${t("starterH")}</h3>
    <p class="rechint" style="margin:0">${t("starterLead")}</p>
    ${spineBox("starter", STARTER.map((x,i)=>({ name:es?x[2]:x[1], sub:x[3]+" BPM · "+(es?x[5]:x[4]), hue:hueOf(x[1]), on:id=>`data-pick="s:${i}" data-deck="${id}"` })))}
    <div class="take" style="background:none;border:0;padding:0">
      <button type="button" class="ghost" id="starterGo">${t("starterGo")}</button>
    </div>
    <p class="starter-msg" id="starterMsg" role="status" aria-live="polite">${starterMsg}</p>`;
}
/* AOG-DECKS-BARS-V1: quick bars to rap over the beats, written for this site. Each card is two lines. */
const BARS = {
  en: [
    { k:"roast", name:"Roast", list:[
      ["Your flow's so slow it needs a hall pass,","I'm on lap ten and you're still looking for the gas."],
      ["You rap like Wi-Fi in the back of the bus:","one bar, then nothing, then a whole lot of fuss."],
      ["Your mixtape's so cold it came with a scarf,","played it at the party and the speakers just laughed."],
      ["You left your verse on read like a group chat at three,","everybody saw it, nobody replied, not even me."],
      ["I don't need autotune, I was born in key,","you need a search party to find the melody."],
      ["Your style's a rerun nobody asked for,","even the remote got up and walked out the door."],
      ["I spit so hot the smoke alarm went off,","you spit so cold the mic caught a cough."],
      ["I'm on two percent and I still outlast you,","your whole verse is buffering, loading, past due."] ]},
    { k:"brag", name:"Brag", list:[
      ["I'm the plot twist, the cheat code, the final boss,","you're the tutorial level everybody skips across."],
      ["My verses got layers like Abuela's lasagna,","your verse is a cracker: dry, no sauce, no drama."],
      ["They said stay in your lane, so I built a highway,","eight lanes wide and every lane goes my way."],
      ["My brain works different, that's my secret sauce,","I see the angles that the straight lines lost."],
      ["Crown on my head? That's a thinking cap,","I don't do homework, homework does my rap."],
      ["Cool as the pillow on the other side,","smooth as a moonwalk, no slip, just glide."],
      ["I don't flex muscles, I flex vocabulary,","words so big they need their own dictionary."],
      ["Knock me down once, I bounce like a ball in gym,","back on my feet before you even swing again."] ]},
    { k:"life", name:"Every day", list:[
      ["Mom said “clean your room,” so I dropped a remix,","swept on the one, folded clothes on the six."],
      ["Pop quiz on a Monday? That's a villain arc,","I studied in my dreams, so I'm acing in the dark."],
      ["Teacher said “show your work,” so I brought a mic,","now the whole class knows what the answer's like."],
      ["Bedtime's at nine but my flow stays awake,","counting no sheep, just the bars that I make."],
      ["Little brother took my seat and my last fry,","now he's in my verse and he's never gonna hide."],
      ["Group project? I carried it like groceries,","four bags, one trip, no help, no apologies."],
      ["Alarm went off, I hit snooze like a drum,","five more minutes turned into a whole new album."],
      ["Lunch line long like a Monday in June,","I freestyled the wait and got served by noon."] ]},
    { k:"calls", name:"Announcer calls", list:[
      ["He's at the forty, the thirty, the twenty,","nobody's catching this kid, he's got speed to spare and plenty!"],
      ["From downtown… BANG!","Somebody call the fire department, the net's on fire!"],
      ["Back, back, back, back… GONE!","That ball just got its own passport!"],
      ["Three seconds left, she rises, she shoots…","IT'S GOOD! The whole gym just lost its mind!"],
      ["He crossed him up so bad,","his sneakers are still in the parking lot!"],
      ["Swing and a miss! Strike three!","That bat needs a nap and a snack!"],
      ["Top corner! The goalie didn't even move,","he watched it like it was his favorite show!"],
      ["Ladies and gentlemen, the homework is DONE,","and this kid is ON FIRE!"] ]},
    { k:"quotes", name:"Famous quotes", list:[
      ["“Well done is better than well said.”","Benjamin Franklin"],
      ["“Lost time is never found again.”","Benjamin Franklin"],
      ["“Always do right. This will gratify some people","and astonish the rest.” Mark Twain"],
      ["“If you tell the truth","you don't have to remember anything.” Mark Twain"],
      ["“If there is no struggle, there is no progress.”","Frederick Douglass"],
      ["“Do what you can, with what you have,","where you are.” Theodore Roosevelt"],
      ["“I can do all things through Christ","which strengtheneth me.” Philippians 4:13"],
      ["“Be strong and of a good courage.”","Joshua 1:9"] ]},
    { k:"women", name:"Famous women", list:[
      ["“I never ran my train off the track,","and I never lost a passenger.” Harriet Tubman"],
      ["“Failure is impossible.”","Susan B. Anthony"],
      ["“Truth is powerful and it prevails.”","Sojourner Truth"],
      ["“You must do the thing","you think you cannot do.” Eleanor Roosevelt"],
      ["“Alone we can do so little;","together we can do so much.” Helen Keller"],
      ["“The most effective way to do it,","is to do it.” Amelia Earhart"],
      ["“I may be compelled to face danger,","but never fear it.” Clara Barton"],
      ["“I never gave or took any excuse.”","Florence Nightingale"],
      ["“Nothing in life is to be feared,","it is only to be understood.” Marie Curie"],
      ["“Blessed assurance, Jesus is mine!”","Fanny Crosby"],
      ["“You must never be fearful about what you are doing","when it is right.” Rosa Parks"],
      ["“Invest in the human soul.","Who knows, it might be a diamond in the rough.” Mary McLeod Bethune"] ]},
    { k:"chuck", name:"Chuck Norris facts", list:[
      ["Chuck Norris doesn't do push-ups.","He pushes the Earth down."],
      ["Chuck Norris counted to infinity.","Twice. Then he rapped it backwards."],
      ["Chuck Norris doesn't need a beat.","The beat needs Chuck Norris."],
      ["When Chuck Norris drops the mic,","the floor says thank you."],
      ["Chuck Norris doesn't turn the volume up.","The volume turns itself up out of respect."],
      ["Chuck Norris doesn't read books.","He stares at them until they tell him everything."],
      ["Chuck Norris can clap with one hand,","and the crowd still claps back."],
      ["Chuck Norris doesn't do homework.","Homework does Chuck Norris, and gets an A."],
      ["Chuck Norris's turntable only spins one way:","his way."],
      ["When Chuck Norris freestyles,","the dictionary takes notes."],
      ["Chuck Norris doesn't wear a watch.","He tells time what time it is."],
      ["Chuck Norris can hit the snare","before the drummer thinks of it."] ]},
    { k:"faith", name:"Faith", list:[
      ["Goliath talked big, he was nine feet tall,","one kid, one stone, now who's taking the fall?"],
      ["Walls of Jericho? We just turned up the bass,","seven laps, one shout, wall fell flat on its face."],
      ["Jonah ran from God and got swallowed whole,","three days in a fish? Now that's a bad stroll."],
      ["Threw me in the fire like Shadrach's crew,","walked out with no smoke, not one hair touched, true."],
      ["The enemy tried to stop me, forgot my name,","I'm a child of the King, I don't play his game."],
      ["Armor from Ephesians and my helmet on tight,","shield of faith up, bring on the whole night."],
      ["I don't need a hype man, I got grace on my side,","the Lord's in my corner, I don't run, I don't hide."],
      ["Lions in the den looking hungry and mean,","Daniel took a nap like the cleanest routine."] ]}
  ],
  es: [
    { k:"roast", name:"Batalla", list:[
      ["Tu flow es tan lento que pide permiso,","yo ya di diez vueltas y tú sigues en el piso."],
      ["Tus rimas tan frías que traen bufanda,","la bocina las oyó y se fue de la banda."],
      ["Tú rapeas como el wifi en el autobús:","una barra, se corta, y después ni la luz."],
      ["No necesito autotune, yo nací afinado,","tú buscas el ritmo como celular extraviado."] ]},
    { k:"brag", name:"Presumir", list:[
      ["Soy el giro en la trama, el jefe final,","tú eres el tutorial que todos saltan igual."],
      ["Mis versos tienen capas como lasaña de abuela,","los tuyos son galleta: secos, sin salsa, sin canela."],
      ["Me dijeron “quédate en tu carril”, hice una autopista,","ocho carriles anchos y todos van a mi pista."],
      ["Mi mente es distinta, esa es mi salsa secreta,","veo los ángulos que pierde la línea recta."] ]},
    { k:"life", name:"Día a día", list:[
      ["Mamá dijo “limpia el cuarto”, yo le metí ritmo,","barrí en el uno y en el cuatro lo mismo."],
      ["¿Examen sorpresa un lunes? Qué villano,","estudié en mis sueños y saqué diez temprano."],
      ["Sonó la alarma, la apagué como tambor,","cinco minutos más y salió un disco mejor."],
      ["La fila del almuerzo larga como semana,","rapeé la espera y comí con más ganas."] ]},
    { k:"calls", name:"Narrador", list:[
      ["¡Goooool! ¡Gol, gol, gol!","¡El portero todavía está buscando la pelota!"],
      ["¡Tira desde la luna… y ENCESTA!","¡El gimnasio entero se volvió loco!"],
      ["¡Se va, se va, se va… y se fue!","¡Esa pelota ya tiene pasaporte!"],
      ["¡Lo dejó sentado con ese amague!","¡Sus tenis se quedaron en el estacionamiento!"] ]},
    { k:"quotes", name:"Frases famosas", list:[
      ["“Bien hecho es mejor que bien dicho.”","Benjamin Franklin"],
      ["“Si no hay lucha, no hay progreso.”","Frederick Douglass"],
      ["“Todo lo puedo en Cristo","que me fortalece.” Filipenses 4:13"],
      ["“Esfuérzate y sé valiente.”","Josué 1:9"] ]},
    { k:"women", name:"Mujeres famosas", list:[
      ["“Nunca saqué mi tren de la vía","y nunca perdí un pasajero.” Harriet Tubman"],
      ["“Fracasar es imposible.”","Susan B. Anthony"],
      ["“Debes hacer lo que crees","que no puedes hacer.” Eleanor Roosevelt"],
      ["“Solos podemos hacer muy poco;","juntos podemos hacer mucho.” Helen Keller"],
      ["“Nada en la vida debe ser temido,","solo comprendido.” Marie Curie"],
      ["“Nunca debes tener miedo de lo que haces","cuando es lo correcto.” Rosa Parks"] ]},
    { k:"chuck", name:"Datos de Chuck Norris", list:[
      ["Chuck Norris no hace lagartijas.","Empuja la Tierra hacia abajo."],
      ["Chuck Norris contó hasta el infinito.","Dos veces."],
      ["Chuck Norris no necesita ritmo.","El ritmo necesita a Chuck Norris."],
      ["Cuando Chuck Norris suelta el micrófono,","el piso le da las gracias."],
      ["Chuck Norris no usa reloj.","Él le dice al tiempo qué hora es."],
      ["Cuando Chuck Norris improvisa,","el diccionario toma apuntes."] ]},
    { k:"faith", name:"Fe", list:[
      ["Goliat hablaba fuerte, medía tres metros,","un niño, una piedra, y se acabaron sus cuentos."],
      ["¿Murallas de Jericó? Subimos el bajo,","siete vueltas, un grito, y el muro pa' abajo."],
      ["Jonás huyó de Dios y se lo tragó un pez,","tres días en la panza: ¡qué mala vez!"],
      ["Escudo de la fe arriba, casco bien puesto,","la armadura de Efesios, y voy listo pa' esto."] ]}
  ]
};
let BARSAT = (()=>{ try{ return JSON.parse(localStorage.getItem("aog.decks.bars")) || {k:"roast", i:0}; }catch(e){ return {k:"roast", i:0}; } })();
function paintBars(){
  const box = document.getElementById("bars"); if(!box) return;
  const sets = BARS[S.lang] || BARS.en, set = sets.find(x=>x.k===BARSAT.k) || sets[0];
  const n = set.list.length, i = ((BARSAT.i % n) + n) % n, b = set.list[i];
  box.innerHTML = `
    <h3>${t("barsH")}</h3>
    <p class="rechint" style="margin:0">${t("barsLead")}</p>
    <div class="bars-top"><label for="barsKind">${t("barsKind")}</label>
      <select id="barsKind">${sets.map(x=>`<option value="${x.k}"${x.k===set.k?" selected":""}>${esc(x.name)}</option>`).join("")}</select></div>
    <p class="barcard" aria-live="polite"><span>${esc(b[0])}</span><span>${esc(b[1])}</span></p>
    <div class="bars-nav">
      <button type="button" class="ghost" id="barsBack">${t("barsBack")}</button>
      <button type="button" class="ghost" id="barsNext">${t("barsNext")}</button>
      <span class="n">${t("barsOf").replace("%i", i+1).replace("%n", n)}</span>
    </div>`;
  const save = ()=>{ try{ localStorage.setItem("aog.decks.bars", JSON.stringify(BARSAT)); }catch(e){} };
  const go = (d, focus)=>{ BARSAT = {k:set.k, i:i+d}; save(); paintBars(); const f=document.getElementById(focus); if(f) f.focus(); };
  document.getElementById("barsBack").onclick = ()=>go(-1, "barsBack");
  document.getElementById("barsNext").onclick = ()=>go(1, "barsNext");
  document.getElementById("barsKind").onchange = e=>{ BARSAT = {k:e.target.value, i:0}; save(); paintBars(); const f=document.getElementById("barsKind"); if(f) f.focus(); };
}
paintBars();
function paintCrate(){
  const box = document.getElementById("crate"); if(!box) return;
  box.innerHTML = `
    <h3>${t("crateNext")}</h3>
    ${CRATE.next.length ? spineBox("next", CRATE.next.map((r,i)=>({ name:r.name.replace(/\.[^.]+$/,""), sub:"", hue:hueOf(r.name), n:i+1, drag:i,
        on:id=>`data-crate="next" data-i="${i}" data-deck="${id}"`, x:`<button type="button" class="x" data-cratedrop="next" data-i="${i}" aria-label="${t("crateDrop")}">✕</button>` }))) : `<div class="cbox empty">${t("crateNextNone")}</div>`}
    ${CRATE.next.length ? `<p class="rechint" style="margin:0">${t("crateHint")}</p>` : ""}
    <div class="take" style="background:none;border:0;padding:0">
      <label class="ghost">${t("crateAdd")}<input type="file" multiple id="crateAdd" accept="${AUDIO_ONLY || "audio/*,.mp3,.m4a,.aac,.wav,.aif,.aiff,.ogg,.opus,.flac"}"></label>
      ${CRATE.next.length?`<button type="button" class="ghost" data-crateclear="next">${t("crateClear")}</button>`:""}
    </div>
    ${starterHtml()}
    ${wordHtml("scripture")}
    ${wordHtml("speech")}
    ${findLinks()}
    ${CRATE.prev.length ? `<h3>${t("cratePrev")}</h3>` : ""}
    ${CRATE.prev.map((r,i)=>crateRow(r,i,"prev")).join("")}
    ${CRATE.prev.length?`<div class="take" style="background:none;border:0;padding:0"><button type="button" class="ghost" data-crateclear="prev">${t("crateClear")}</button></div>`:""}`;
  const sg = document.getElementById("starterGo");
  if(sg) sg.onclick = ()=>starterLoad(sg);
  const wg = document.getElementById("wordGo");
  if(wg) wg.onclick = ()=>wordLoad(wg, "scripture");
  const sg2 = document.getElementById("speechGo");
  if(sg2) sg2.onclick = ()=>wordLoad(sg2, "speech");
  wirePicks(box);
  wireSpines(box, paintCrate);
  const add = document.getElementById("crateAdd");
  add.onchange = ()=>{
    const fs = Array.from(add.files||[]); if(!fs.length) return;
    (async ()=>{
      for(const f of fs){ const rec = await crateInstall(f); if(!CRATE.next.some(x=>x.id===rec.id)) CRATE.next.push(rec); }
      cratePut("next", CRATE.next); paintCrate();
    })();
  };
  box.querySelectorAll("[data-crate]").forEach(b=>{
    b.onclick = ()=>{
      const list = b.getAttribute("data-crate"), i = +b.getAttribute("data-i");
      const r = CRATE[list][i]; if(!r) return;
      /* a song taken from UP NEXT has been played: it leaves the queue and
         lands in PREVIOUSLY SPUN, the way a record goes from one pile to the other */
      if(list==="next"){ crateTake(i, decks.find(x=>x.id===b.getAttribute("data-deck"))); return; }
      loadFile(decks.find(x=>x.id===b.getAttribute("data-deck")), crateFile(r));
      paintCrate();
    };
  });
  box.querySelectorAll("[data-sleeve]").forEach(el=>{
    el.addEventListener("dragstart", ev=>{ ev.dataTransfer.setData("text/aog-sleeve", el.getAttribute("data-sleeve")); ev.dataTransfer.effectAllowed = "move"; });
  });
  box.querySelectorAll("[data-cratedrop]").forEach(b=>{
    b.onclick = ()=>{
      const list = b.getAttribute("data-cratedrop");
      CRATE[list].splice(+b.getAttribute("data-i"), 1); cratePut(list, CRATE[list]); paintCrate();
    };
  });
  box.querySelectorAll("[data-crateclear]").forEach(b=>{
    b.onclick = ()=>{ const list = b.getAttribute("data-crateclear"); CRATE[list] = []; cratePut(list, []); paintCrate(); };
  });
}
window.addEventListener("pagehide", crateKeepPlace);
document.addEventListener("visibilitychange", ()=>{ if(document.hidden) crateKeepPlace(); });

/* ══ AOG-DJ-MADE-V1 (2026-10-04) — THE RECORDS MADE RIGHT HERE ════════════════
   Four records in the spirit of Jimmy's DJs, named by style, made by aog-dj.js
   with math in a Worker the moment one is asked for (a second or two), so there
   is nothing to download. Each knows its exact tempo and that beat one is the
   very first sample, so its grid, its loops and SYNC are exact from the start. */
const MADE = (window.AOGDJ && AOGDJ.list) || [];
function madeTrack(id){
  return new Promise((ok, no)=>{
    let w = null;
    try{ w = new Worker(new URL("aog-dj.js", document.baseURI).href); }catch(e){ w = null; }
    if(!w){ try{ const r = AOGDJ.render(id); ok(r); }catch(e){ no(e); } return; }
    w.onmessage = (e)=>{ const m = e.data; w.terminate(); if(m && m.t==="done") ok(m); else no(new Error(m && m.msg || "failed")); };
    w.onerror = (e)=>{ w.terminate(); try{ ok(AOGDJ.render(id)); }catch(err){ no(err); } };
    w.postMessage({ t:"render", id:id });
  });
}
async function loadMade(d, id, opts){
  const x = MADE.find(r=>r.id===id); if(!x || !d) return;
  opts = opts || {};
  d.note = t("making"); paintDeck(d);
  try{
    ctx(); await ensureNode(d);
    let r, L, R;
    /* the same record already on another deck is copied, not made again */
    const twin = decks.find(o=>o!==d && o.made===id && o.buf);
    if(twin){ L = Float32Array.from(twin.buf.getChannelData(0)); R = Float32Array.from(twin.buf.getChannelData(1)); r = { sr:twin.buf.sampleRate, bpm:x.bpm, beat0:0 }; }
    else { r = await madeTrack(id); L = r.L; R = r.R; }
    const buf = actx.createBuffer(2, L.length, r.sr);
    buf.copyToChannel(L, 0); buf.copyToChannel(R, 1);
    putOn(d, buf, L, R, { name: x[S.lang] || x.en, key:"made:"+id+":v1", bpm:x.bpm, beat0:0, lufs:-14, made:id, pos:opts.pos || 0 });
    if(!opts.restore){ cratePut("deck-"+d.id, { made:id, name:x.en }); try{ localStorage.removeItem("aog.decks.pos."+d.id); }catch(e){} }
    LX.made = true;
  }catch(e){
    d.note = t("madeFail"); paintDeck(d);
    setTimeout(()=>{ if(d.note){ d.note=""; paintDeck(d); } }, 6000);
  }
}
/* AOG-DECKS-SLEEVES-V1: one sleeve, for any record; `on(id)` gives the A/B/C button its data */
function sleeveCard(name, sub, hue, on, extra){
  return `<div class="sleeve still" style="--h:${hue}">
      <div class="art" aria-hidden="true"></div>
      <span class="nm" title="${esc(name)}">${esc(name)}</span>
      <span class="sub">${esc(sub)}</span>
      <div class="sb" role="group" aria-label="${esc(name)}">${IDS.map(id=>`<button type="button" ${on(id)} aria-label="${esc(name)} · ${t("to"+id)}">${id}</button>`).join("")}${extra||""}</div>
    </div>`;
}
/* AOG-DECKS-SPINES-V1: a crate of spines, and the record pulled out of it.
   items: { name, sub, hue, on(id) → the A/B/C button's data, x → extra buttons (✕), drag → Up next's index } */
const PULL = {};
function spineBox(key, items, line){
  const at = PULL[key] != null && PULL[key] < items.length ? PULL[key] : null;
  const it = at == null ? null : items[at];
  return `<div class="cbox shelf spines" data-box="${key}">${items.map((x,i)=>`<button type="button" class="spine${i===at?" out":""}" style="--h:${x.hue}" data-spine="${key}:${i}" aria-pressed="${i===at}" aria-label="${esc(x.name)}${x.sub?" · "+esc(x.sub):""}"${x.drag!=null?` draggable="true" data-sleeve="${x.drag}"`:""}><span class="sp-t">${esc(x.name)}</span>${x.n?`<span class="sp-n">${x.n}</span>`:""}</button>`).join("")}</div>
    <div class="pulled">${it ? sleeveCard(it.name, it.sub, it.hue, it.on, it.x) + (it.what?`<p class="what">${esc(it.what)}</p>`:"") : `<p class="hint">${t("pullHint")}</p>`}</div>`;
}
/* a spine tapped: that record comes out (tap it again and it goes back); the crates keep where they were scrolled */
function wireSpines(box, repaint){
  box.querySelectorAll("[data-spine]").forEach(b=>{
    b.onclick = ()=>{
      const [k, i] = b.getAttribute("data-spine").split(":"), n = +i;
      PULL[k] = PULL[k] === n ? null : n;
      const keep = {}; document.querySelectorAll(".cbox[data-box]").forEach(c=>{ keep[c.getAttribute("data-box")] = c.scrollLeft; });
      repaint();
      document.querySelectorAll(".cbox[data-box]").forEach(c=>{ const v = keep[c.getAttribute("data-box")]; if(v) c.scrollLeft = v; });
      const again = document.querySelector(`[data-spine="${k}:${n}"]`); if(again) again.focus({ preventScroll:true });
    };
  });
}
function hueOf(str){ let h = 0; for(const ch of String(str)) h = (h*31 + ch.charCodeAt(0)) % 360; return h; }
/* a sleeve from the starter crate (s:index) or the scripture and speech shelves (w:file) goes straight onto a deck */
async function pickOnto(key, d){
  if(!d) return;
  let url, name;
  if(key.startsWith("s:")){ const x = STARTER[+key.slice(2)]; if(!x) return; url = "audio/crate/" + x[0] + ".mp3"; name = starterName(x); }
  else { const x = WORD.find(w=>w.file===key.slice(2)); if(!x) return; url = "audio/crate/" + x.file; name = wordName(x); }
  d.note = t("making"); paintDeck(d);
  try{
    const r = await fetch(url); if(!r.ok) throw new Error(r.status);
    await loadFile(d, new File([await r.blob()], name, { type:"audio/mpeg" }));
  }catch(e){ d.note = t("starterFail"); paintDeck(d); setTimeout(()=>{ if(d.note){ d.note = ""; paintDeck(d); } }, 6000); }
}
function wirePicks(box){
  box.querySelectorAll("[data-pick]").forEach(b=>{ b.onclick = ()=>pickOnto(b.getAttribute("data-pick"), decks.find(x=>x.id===b.getAttribute("data-deck"))); });
}
function paintMade(){
  const box = document.getElementById("made"); if(!box) return;
  const es = S.lang === "es";
  box.innerHTML = `<h3>${t("madeH")}</h3>
    <p class="rechint" style="margin:0">${t("madeLead")}</p>
    ${spineBox("made", MADE.map(x=>({ name:es?x.es:x.en, sub:x.bpm+" BPM", hue:x.hue, what:es?x.what_es:x.what_en, on:id=>`data-made="${x.id}" data-deck="${id}"` })))}`;
  box.querySelectorAll("[data-made]").forEach(b=>{
    b.onclick = ()=>loadMade(decks.find(x=>x.id===b.getAttribute("data-deck")), b.getAttribute("data-made"));
  });
  wireSpines(box, paintMade);
}

/* what a deck remembers about a record it has seen before: the tempo it worked
   out, where beat one is, and the marks you left on it. Kept by name and size,
   so the same file dropped tomorrow is ready the moment it loads. */
const MARKS = "aog.decks.marks.v1";
function marksAll(){
  try{ return JSON.parse(localStorage.getItem(MARKS) || "{}"); }catch(e){ return {}; }
}
function marksSave(d){
  if(!d.trackKey) return;
  try{
    const all = marksAll();
    all[d.trackKey] = { bpm:d.bpm, beat0:d.beat0, cues:d.cues, at:Date.now() };
    const keys = Object.keys(all);
    if(keys.length > 40){
      keys.sort((a,b)=>(all[a].at||0)-(all[b].at||0)).slice(0, keys.length-40).forEach(k=>delete all[k]);
    }
    localStorage.setItem(MARKS, JSON.stringify(all));
  }catch(e){}
}
function marksLoad(d){
  if(!d.trackKey) return null;
  const m = marksAll()[d.trackKey];
  return (m && m.bpm > 0) ? m : null;
}
function pitchText(d){
  const pct = (d.pitch-1)*100;
  return (pct>=0?"+":"") + pct.toFixed(pct>9||pct<-9?0:1) + "%";
}
function touchLabel(){
  return t("touch")+": "+(touch==="fine"?t("touchFine"):touch==="normal"?t("touchNormal"):t("touchVinyl"));
}

/* ══ AOG-DJ-SYNC-V1 — the clock, the grid, the MASTER ═══════════════════════
   Every deck reports where its needle is AND which frame of the audio clock that
   was. So the page can say where any deck will be at any frame, and book a start
   or a jump for the exact frame another deck crosses a beat. */
function nowFrame(){ return actx ? Math.round(actx.currentTime * actx.sampleRate) : 0; }
function heardFrame(){ return nowFrame() - Math.round(((actx && actx.baseLatency) || 0) * actx.sampleRate + ((actx && actx.outputLatency) || 0) * actx.sampleRate); }
function posAt(d, F){ return d.pos + (F - d.frame) * (d.rr || 0); }
function beatLen(d){ return d.buf && d.bpm > 0 ? 60/d.bpm*d.buf.sampleRate : 0; }
function grid0(d){ return d.buf ? d.beat0*d.buf.sampleRate : 0; }
function effBpm(d){ return d.bpm > 0 ? d.bpm*d.pitch*d.rpm : 0; }
function masterDeck(){ const m = decks.find(x=>x.id===masterId); return m && m.buf && m.bpm > 0 ? m : null; }
function setMaster(id){ masterId = id; paintMasters(); }
function paintMasters(){
  document.querySelectorAll("[data-master]").forEach(b=>{ const on = b.getAttribute("data-master")===masterId; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on?"true":"false"); });
}
/* the master is the first deck to play with a beat; when it stops while another plays,
   the playing one leads (stopDeck hands it over); a MASTER pressed by hand stays put */
function autoMaster(){
  if(masterDeck()) return;
  const playing = decks.filter(x=>x.buf && x.bpm > 0 && x.motor);
  const pick = playing.find(x=>!x.syncLock) || playing[0];
  if(pick) setMaster(pick.id);
}
/* the speed that puts this deck on the master's tempo, half or double time allowed */
function syncRatio(d, m){
  const base = effBpm(m)/(d.bpm*d.rpm);
  let best = base, f = 1;
  [0.5, 2].forEach(k=>{ const w = base*k; if(Math.abs(Math.log(w)) < Math.abs(Math.log(best))){ best = w; f = 1/k; } });
  return { want:best, f:f };   /* f: master beats per beat of this deck … in this deck's terms */
}
function setPitch(d, v, fromSync){
  if(v < 0.92 || v > 1.08){ if(!d.wide){ d.wide = true; const wb = document.querySelector('[data-wide="'+d.id+'"]'); if(wb) wb.classList.add("on"); } }
  v = Math.max(d.wide?0.5:0.92, Math.min(d.wide?1.5:1.08, v));
  if(Math.abs(v - d.pitch) < 1e-7) return;
  d.pitch = v; send(d, { t:"pitch", v:v });
  const inp = document.querySelector('[data-speed="'+d.id+'"]');
  if(inp){ if(d.wide){ inp.min="0.5"; inp.max="1.5"; inp.step="0.01"; } inp.value = String(v); }
  const po = document.querySelector('[data-pitchout="'+d.id+'"]'); if(po) po.textContent = pitchText(d);
  fxSend(d);
  /* the master moved: everyone synced to it follows at once */
  if(!fromSync && d.id === masterId) decks.forEach(o=>{ if(o!==d && o.syncLock && o.buf && o.bpm > 0) setPitch(o, syncRatio(o, d).want, true); });
}
/* where a synced deck's beat sits against the master's, in master beats (−0.5 … 0.5) */
function phaseErr(d, m, F, f){
  const pd = posAt(d, F), pm = posAt(m, F);
  const is = (pd - grid0(d))/beatLen(d), im = (pm - grid0(m))/beatLen(m);
  let e = (is*f) - im; e -= Math.round(e);
  return e;
}
/* put a synced deck on the master's beat: a jump booked 60 ms ahead, to the sample */
function realign(d, m, f){
  const sr = actx.sampleRate, F = nowFrame() + Math.round(0.06*sr);
  const pd = posAt(d, F), pm = posAt(m, F);
  const im = (pm - grid0(m))/beatLen(m), is0 = (pd - grid0(d))/beatLen(d);
  const fm = im - Math.floor(im), n = Math.round(is0*f - fm), is = (n + fm)/f;
  send(d, { t:"sched", frame:F, m:{ t:"jump", v: grid0(d) + is*beatLen(d) } });
  d._aligned = performance.now();
}
let lastLock = 0;
function syncTick(now){
  if(now - lastLock < 100) return;
  lastLock = now;
  autoMaster();
  const m = masterDeck(); if(!m) return;
  decks.forEach(d=>{
    if(d === m || !d.syncLock || !d.buf || d.bpm <= 0){ if(d.bend !== 1){ d.bend = 1; send(d, { t:"bend", v:1 }); } return; }
    const r = syncRatio(d, m);
    setPitch(d, r.want, true);
    let bend = 1;
    if(d.motor && m.motor && !d.held && !m.held && !d.cueHeld && !d.revOn && !d.div && !d.pend && d._startAt == null
       && now - (d._aligned||0) > 300 && Math.abs(d.rr) > 0.05 && Math.abs(m.rr) > 0.05){
      const err = phaseErr(d, m, Math.max(d.frame, m.frame), r.f);
      if(Math.abs(err) > 0.03) realign(d, m, r.f);
      else if(Math.abs(err) > 0.003) bend = 1 - Math.max(-0.006, Math.min(0.006, err * 60/effBpm(m) / 1.2));
    }
    if(Math.abs(bend - d.bend) > 1e-5){ d.bend = bend; send(d, { t:"bend", v:bend }); }
  });
}

/* ══ AOG-DJ-MIXER-V1 — the channel strip's sound ═════════════════════════════ */
/* the crossfader's two sides: Blend is constant-power (a long, even fade); Cut keeps
   both sides full and slams shut in the last few millimetres, for scratching */
function sideGains(x){
  if(curve==="sharp") return [Math.max(0, Math.min(1, (0.985 - x)/0.035)), Math.max(0, Math.min(1, (x - 0.015)/0.035))];
  return [Math.cos(x*Math.PI/2), Math.sin(x*Math.PI/2)];
}
function chanGain(d){ return d.vol*d.vol; }   /* a fader's travel, the way an ear hears loudness */
function setMix(){
  const xfv = +document.getElementById("xf").value, sg = sideGains(xfv);
  decks.forEach(d=>{
    d.xgv = d.side==="L" ? sg[0] : d.side==="R" ? sg[1] : 1;
    if(!actx) return;
    if(d.gain) ramp(d.gain.gain, chanGain(d), 0.008);
    if(d.xg) ramp(d.xg.gain, d.xgv, curve==="sharp" ? 0.0012 : 0.004);
  });
  paintSides(); paintBay();
}
function paintSides(){
  const L = decks.filter(d=>d.side==="L").map(d=>d.id).join(" "), R = decks.filter(d=>d.side==="R").map(d=>d.id).join(" ");
  const a = document.getElementById("labA"), b = document.getElementById("labB");
  if(a) a.textContent = L || "—"; if(b) b.textContent = R || "—";
}
/* one knob, two filters: left of center a low-pass closes down to a rumble, right of
   center a high-pass opens up to a whisper. In the middle it is out of the way. */
function applyFilter(d){
  if(!d.lp || !actx) return;
  const v = d.filtv, top = Math.min(20000, actx.sampleRate*0.45);
  const lpF = v < -0.03 ? Math.max(60, top*Math.pow(60/top, Math.min(1, (-v-0.03)/0.97))) : top;
  const hpF = v > 0.03 ? 18*Math.pow(9000/18, Math.min(1, (v-0.03)/0.97)) : 10;
  const qdb = -3.01 + 7.5*Math.min(1, Math.abs(v)*2.5);   /* a little resonance as it moves: the DJ filter's "zing" */
  ramp(d.lp.frequency, lpF, 0.012); ramp(d.hp.frequency, hpF, 0.012);
  ramp(d.lp.Q, v < -0.03 ? qdb : -3.01, 0.02); ramp(d.hp.Q, v > 0.03 ? qdb : -3.01, 0.02);
}
/* the effect's tempo is this deck's tempo as it plays now (pitch and all) */
function fxSend(d, force){
  if(!d.fx) return;
  const bpm = effBpm(d) || (masterDeck() ? effBpm(masterDeck()) : 120) || 120;
  const m = { t:"fx", type:d.fxType, amt:d.fxAmt, beatSec:60/bpm, beats:d.fxBeats };
  const sig = JSON.stringify(m);
  if(!force && sig === d.fxSent) return;
  d.fxSent = sig; d.fx.port.postMessage(m);
}
const FXBEATS = { echo:[0.25,0.5,0.75,1,2], reverb:[1,2,4,8], flanger:[4,8,16,32] };
function beatsLabel(v){ return v===0.25?"¼":v===0.5?"½":v===0.75?"¾":String(v); }

/* AOG-DJ-PERF-V1 — a canvas's width comes from a ResizeObserver, never read in the middle of
   a frame: reading layout after the platters have turned makes the browser lay the page out
   again, six times a frame on three decks. */
const SIZE = new WeakMap();
const RO = window.ResizeObserver ? new ResizeObserver(es=>{ es.forEach(e=>SIZE.set(e.target, e.contentRect.width)); decks.forEach(d=>{ d.waveDirty = true; d._drawn = -1; }); eqDirty = true; }) : null;
function cssW(cv){ const w = RO ? SIZE.get(cv) : undefined; return w == null ? cv.clientWidth : w; }
/* AOG-DJ-PERF-V2 — everything that moves (platters, arms, meters, the needles on the
   waveforms, the close-up groove) moves by a paused animation whose time is set each
   frame. The browser only slides finished pictures: nothing is drawn again, no element
   changes, and the page's helpers that watch for changes stay asleep. */
const KF = {
  turn:  { k:[{transform:"rotate(0deg)"},{transform:"rotate(360deg)"}], t:360000, p:"transform", f:v=>"rotate("+(v/1000)+"deg)" },
  fill:  { k:[{transform:"scaleX(0)"},{transform:"scaleX(1)"}], t:1000, p:"transform", f:v=>"scaleX("+(v/1000)+")" },
  fillY: { k:[{transform:"scaleY(0)"},{transform:"scaleY(1)"}], t:1000, p:"transform", f:v=>"scaleY("+(v/1000)+")" },
  right: { k:[{transform:"translateX(0px)"},{transform:"translateX(100000px)"}], t:100000, p:"transform", f:v=>"translateX("+v+"px)" },
  left:  { k:[{transform:"translateX(0px)"},{transform:"translateX(-100000px)"}], t:100000, p:"transform", f:v=>"translateX("+(-v)+"px)" },
  show:  { k:[{opacity:0},{opacity:1}], t:1000, p:"opacity", f:v=>String(v/1000) }
};
function anim(el, kind){
  if(!el) return null;
  const K = KF[kind], m = { el, K, v:NaN, a:null };
  if(el.animate){ try{ m.a = el.animate(K.k, { duration:K.t, fill:"both" }); m.a.pause(); }catch(e){ m.a = null; } }
  return m;
}
function setA(m, v){
  if(!m || m.v === v || !isFinite(v)) return;
  m.v = v;
  if(m.a) m.a.currentTime = v; else m.el.style[m.K.p] = m.K.f(v);
}
/* a record's pictures are drawn in a Worker where the browser allows it (AOGDJ.paintWave
   and paintZoom, in aog-dj.js) and on the page where it does not. The old picture stays
   up until the new one is ready to show, so nothing blinks. */
let PICW = null, picN = 0;
const PICWAIT = {};
function picWorker(){
  if(PICW !== null) return PICW || null;
  PICW = false;
  try{
    if(window.Worker && typeof OffscreenCanvas === "function" && OffscreenCanvas.prototype.convertToBlob && new OffscreenCanvas(1,1).getContext("2d")){
      const w = new Worker(new URL("aog-dj.js", document.baseURI).href);
      w.onmessage = (e)=>{ const m = e.data || {}, cb = PICWAIT[m.req]; if(!cb) return; delete PICWAIT[m.req]; cb(m.t === "pic" ? m.blob : null); };
      w.onerror = ()=>{ PICW = false; Object.keys(PICWAIT).forEach(k=>{ const cb = PICWAIT[k]; delete PICWAIT[k]; cb(null); }); };
      PICW = w;
    }
  }catch(e){ PICW = false; }
  return PICW || null;
}
function picture(d, kind, o, img, then, fail){
  const slot = kind === "zoom" ? "z" : "w";
  const g = (d[slot+"Gen"] = (d[slot+"Gen"]||0) + 1), live = ()=>d[slot+"Gen"] === g;
  const show = (blob)=>{
    if(!live()) return;
    if(!blob){ if(fail) fail(); return; }
    const url = URL.createObjectURL(blob), pre = new Image();
    const swap = ()=>{
      if(!live()){ URL.revokeObjectURL(url); return; }
      const old = img._blob; img.src = url; img._blob = url;
      if(old) setTimeout(()=>URL.revokeObjectURL(old), 2000);
      if(then) then();
    };
    pre.src = url;
    if(pre.decode) pre.decode().then(swap, swap); else { pre.onload = swap; pre.onerror = swap; }
  };
  const here = ()=>{                                 /* drawn on the page itself */
    if(!live()) return;
    try{
      const c = d[slot+"can"] || (d[slot+"can"] = document.createElement("canvas")), W = kind === "zoom" ? o.n : o.w;
      if(c.width !== W) c.width = W; if(c.height !== o.h) c.height = o.h;
      const x = c.getContext("2d");
      if(kind === "zoom"){ o.zpk = d.zpk; AOGDJ.paintZoom(x, o); } else { o.peaks = d.peaks; o.bands = d.bands; AOGDJ.paintWave(x, o); }
      c.toBlob(show);
    }catch(e){ if(fail) fail(); }
  };
  const W = picWorker();
  if(!W) return here();
  if(d._picZ !== d.zpk || d._picB !== d.bands){       /* the record's numbers go over once */
    d._picZ = d.zpk; d._picB = d.bands;
    W.postMessage({ t:"picdata", deck:d.id, zpk:d.zpk, peaks:d.peaks, bands:d.bands });
  }
  const req = ++picN;
  PICWAIT[req] = (blob)=>{ if(blob) show(blob); else here(); };
  W.postMessage({ t:"pic", deck:d.id, kind, req, o });
}
function parts(d){ if(!d.$ || !d.$.el.isConnected) d.$ = deckParts(d); return d.$; }
/* ══ the waveform: one picture per record; the needle, the loop and the slip mark sit on top ══ */
function drawWave(d){
  const P = parts(d); if(!P) return;
  const cw = cssW(P.wave); if(!cw) return;
  if(!d.buf || !d.peaks){
    if(d._wkey !== "empty"){ d._wkey = "empty"; d.wGen = (d.wGen||0) + 1; P.wimg.removeAttribute("src"); setA(P.mv.head, 0); setA(P.mv.slipO, 0); }
    if(d._lk){ d._lk = ""; P.wloop.style.width = "0"; }
    return;
  }
  const w = Math.round(cw*2), h = 128, dur = d.buf.length;
  const key = d.trackKey + "|" + w + "|" + d.bpm + "|" + d.beat0 + "|" + d.cues.join(",") + "|" + (d.bands ? 3 : 1);
  if(d.waveDirty || key !== d._wkey){
    d._wkey = key; d.waveDirty = false;
    picture(d, "wave", { w, h, len:dur, sr:d.buf.sampleRate, bpm:d.bpm, beat0:d.beat0, cues:d.cues.slice() }, P.wimg);
  }
  setA(P.mv.head, Math.round(d.pos/dur*cw*2)/2);
  const slip = !!(d.div && d.slipOn);                /* the shadow needle, while it slips */
  setA(P.mv.slipO, slip ? 1000 : 0);
  if(slip) setA(P.mv.slip, Math.round(d.slipPos/dur*cw*2)/2);
  const lk = d.loopOn && d.loopB > d.loopA            /* the loop, lit */
    ? (d.loopA/dur*100).toFixed(2) + "%|" + Math.max(2/cw*100, (d.loopB - d.loopA)/dur*100).toFixed(2) + "%" : "";
  if(lk !== (d._lk || "")){ d._lk = lk; const [l, wd] = lk ? lk.split("|") : ["0", "0"]; P.wloop.style.left = l; P.wloop.style.width = wd; }
}
const PADC = ["#f4a3b0","#f0c26e","#9fd4a0","#7fc7f5","#c9a7f5","#f5b97f","#8fe0d0","#f5e07f"];
/* the close-up: a second and a half of groove either side of the needle, which
   is where you actually watch a scratch happen. The groove is one picture seven
   screens long that slides under the needle line; a fresh one is made while the
   needle still has a screen and a half to go. */
const ZN = 7;
function drawZoom(d){
  const P = parts(d); if(!P) return;
  const cw = cssW(P.zoom); if(!cw) return;
  if(!d.buf || !d.zpk){
    if(d.zs || d.zNext){ d.zs = d.zNext = null; d.zGen = (d.zGen||0) + 1; P.zimg.removeAttribute("src"); }
    return;
  }
  const w = Math.round(cw*2), h = 72, sr = d.buf.sampleRate, span = sr*1.2, per = span/w, start = d.pos - span/2;
  const key = d.trackKey + "|" + w + "|" + (d.loopOn ? d.loopA + "-" + d.loopB : "") + "|" + d.bpm + "|" + d.beat0;
  const zs = d.zs, edge = 1.5*w*per, now = performance.now();
  if((!d.zNext || now - d.zNext.at > 3000) && now > (d.zWait || 0) &&
     (!zs || zs.key !== key || start < zs.s0 + edge || start + span > zs.s0 + zs.n*per - edge)){
    const nx = d.zNext = { s0: start - ((ZN-1)/2)*w*per, n: ZN*w, per, key, at: now };
    picture(d, "zoom", { n:nx.n, h, s0:nx.s0, per, sr, bpm:d.bpm, beat0:d.beat0, loop: d.loopOn && d.loopB > d.loopA ? [d.loopA, d.loopB] : null }, P.zimg,
      ()=>{ d.zs = nx; d.zNext = null; setA(P.mv.zoom, Math.round((d.pos - span/2 - nx.s0)/nx.per)/2); },
      ()=>{ if(d.zNext === nx) d.zNext = null; d.zWait = performance.now() + 1000; });
  }
  if(d.zs) setA(P.mv.zoom, Math.round((start - d.zs.s0)/d.zs.per)/2);
}
function clock(sec){
  if(!isFinite(sec)||sec<0) sec=0;
  const m=Math.floor(sec/60), s=Math.floor(sec%60);
  return m+":"+(s<10?"0":"")+s;
}
/* AOG-DECKS-TAP-V1 (2026-09-26) — Jimmy: "the word START can't be tapped."
   paintDeck runs every frame; rewriting the button's words 60 times a second
   swaps the text under a finger, and Safari drops the tap. Only write words
   when they change. */
function setT(el, v){
  /* AOG-DJ-PERF-V1 — a clock that ticks rewrites only its text, not the element: the site's
     readability and menu helpers re-check the page whenever elements change, not when words do */
  const n = el.firstChild;
  if(n && n.nodeType === 3 && !n.nextSibling){ if(n.nodeValue !== v) n.nodeValue = v; }
  else if(el.textContent !== v) el.textContent = v;
}
function deckParts(d){
  const el = document.getElementById("deck"+d.id); if(!el) return null;
  const q = (s)=>el.querySelector(s), wave = document.getElementById("wave"+d.id), zoom = document.getElementById("zoom"+d.id);
  const strip = document.getElementById("strip"+d.id), wq = (s)=>wave ? wave.querySelector(s) : null;
  /* pictures still on their way to the old elements are dropped */
  d.wGen = (d.wGen||0) + 1; d.zGen = (d.zGen||0) + 1; d._wkey = ""; d._lk = ""; d.zs = d.zNext = null; d.waveDirty = true;
  const mv = { vinyl:anim(q(".vinyl"), "turn"), arm:anim(q(".arm"), "turn"), meter:anim(q(".meter i"), "fill"),
               cmeter:anim(strip ? strip.querySelector(".meter i") : null, "fill"),
               bmeter:anim(document.querySelector(`#bay [data-bch="${d.id}"] .bmeter i`), "fillY"),
               head:anim(wq(".whead"), "right"), slip:anim(wq(".wslip"), "right"), slipO:anim(wq(".wslip"), "show"),
               zoom:anim(zoom ? zoom.querySelector(".zimg") : null, "left") };
  setA(mv.arm, 16000);
  return { el, song:q(".song"), go:q(".go"), time:q(".time"), bpm:q("[data-bpm]"), wave, zoom,
           wimg:wq(".wimg"), wloop:wq(".wloop"), zimg:zoom ? zoom.querySelector(".zimg") : null, mv };
}
function paintDeck(d){
  if(!d.$ || !d.$.el.isConnected) d.$ = deckParts(d);
  if(!d.$) return;
  const el = d.$.el;
  const M = d.$.mv;                                   /* turns in tenths of a degree */
  setA(M.vinyl, STILL ? 0 : Math.round((((d.rot % 360) + 360) % 360)*10)*100);
  setA(M.arm, d.buf ? Math.round((16 + 13*Math.min(1, d.pos/d.buf.length))*10)*100 : 16000);
  if((FRAME & 1) === 0 || d.level === 0){            /* the meters, every other frame: the eye cannot tell */
    setA(M.meter, Math.round(Math.min(1, d.level*1.4)*100)*10);
    setA(M.cmeter, Math.round(Math.min(1, d.level*1.4*(d.vol*d.vol)*d.xgv)*100)*10);
    setA(M.bmeter, M.cmeter ? M.cmeter.v : Math.round(Math.min(1, d.level*1.4*(d.vol*d.vol)*d.xgv)*100)*10);
  }
  const song = d.$.song;
  if(song) setT(song, d.note || d.name || t("none"));
  const btn = d.$.go;
  if(btn) setT(btn, d.motor ? t("stop") : t("play"));
  const time = d.$.time;
  if(time) setT(time, d.buf ? (clock(d.pos/d.buf.sampleRate)+" / "+clock(d.buf.duration)) : "0:00");
  const spin = Math.abs(d.rate) > 0.02;
  if(el.classList.contains("spinning") !== spin) el.classList.toggle("spinning", spin);
  const bp = d.$.bpm;
  if(bp) setT(bp, d.bpm > 0 ? effBpm(d).toFixed(1)+" BPM"
                        : d.bpm === -1 ? t("bpmWait") : (d.buf ? t("noBeat") : ""));
  const sig = d.cues.map(c=>c==null?0:1).join("") + (d.erase?"e":"") + (d.loopOn?d.loopBeats:0) + (d.syncLock?"s":"");
  if(sig !== d._sig){
    d._sig = sig;
    el.querySelectorAll("[data-hot]").forEach(b=>{
      const i = +b.getAttribute("data-i"), set = d.cues[i] != null;
      b.classList.toggle("set", set); b.classList.toggle("erase", d.erase);
      b.style.setProperty("--pc", PADC[i]);
      b.setAttribute("aria-label", t("hot")+" "+(i+1)+(set?"":" · "+t("none").replace(/\.$/,"")));
    });
    el.querySelectorAll("[data-loop]").forEach(b=>{ const on = d.loopOn && d.loopBeats === +b.getAttribute("data-beats"); b.classList.toggle("on", on); b.setAttribute("aria-pressed", on?"true":"false"); });
    const sb = el.querySelector("[data-sync]"); if(sb){ sb.classList.toggle("on", d.syncLock); sb.setAttribute("aria-pressed", d.syncLock?"true":"false"); }
    const er = el.querySelector("[data-erase]"); if(er){ er.classList.toggle("on", d.erase); er.setAttribute("aria-pressed", d.erase?"true":"false"); }
  }
}
let EQP = null;
function drawEq(){
  const cv = document.getElementById("eqCurve");
  const cw = cv ? cssW(cv) : 0;
  if(!cw || !window.AOGEq) return;
  const cols = ["#f0c26e","#7fc7f5","#f4a3b0"], curves = [];
  decks.forEach((d,i)=>{ if(d.eq) curves.push({ filters: d.eq.filters.concat(d.lp?[d.lp, d.hp]:[]), color: cols[i], label: "DECK "+d.id, labelY: 12+i*12 }); });
  EQO.curves = curves; EQO.analyser = null; EQO.bg = "rgba(0,0,0,0)"; EQO.sampleRate = actx ? actx.sampleRate : 44100;
  /* the shared drawing code asks the canvas for its size; this hands it the size we already know */
  EQP = EQP || { getContext:(k)=>cv.getContext(k), get width(){ return cv.width; }, set width(v){ cv.width = v; }, get height(){ return cv.height; }, set height(v){ cv.height = v; } };
  EQP.clientWidth = cw; EQP.clientHeight = 110;
  AOGEq.draw(EQP, EQO);
}
const EQO = { range:26 };
/* AOG-DJ-PERF-V2 — the live sound behind the curves is a small picture of its own, one pixel per
   screen pixel (a soft shape needs no more): redrawing it while music plays costs a quarter of
   redrawing the curves, which change only when a knob moves */
let LIVE = null;
function drawLive(){
  const cv = document.getElementById("eqLive"), ref = document.getElementById("eqCurve");
  const w = Math.round(ref ? cssW(ref) : 0), h = 110;
  if(!cv || !w || !eqScope) return;
  if(cv.width !== w) cv.width = w; if(cv.height !== h) cv.height = h;
  const g = cv.getContext("2d"), bins = eqScope.frequencyBinCount;
  if(!LIVE || LIVE.length !== bins) LIVE = new Uint8Array(bins);
  eqScope.getByteFrequencyData(LIVE);
  const ny = (actx ? actx.sampleRate : 44100)/2, lo = 30, hi = 18000, k = w/Math.log(hi/lo);
  g.clearRect(0, 0, w, h);
  g.fillStyle = "rgba(127,199,245,.20)";               /* the shape and colour of the shared curve drawing */
  g.beginPath(); g.moveTo(0, h);
  for(let i=1;i<bins;i++){ const f = i/bins*ny; if(f < lo || f > hi) continue; g.lineTo(Math.log(f/lo)*k, h - (LIVE[i]/255)*h*0.92); }
  g.lineTo(w, h); g.closePath(); g.fill();
}
let lastEq = 0, lastLive = 0, eqUntil = 0, liveUntil = 0, eqDirty = true, eqSeen = true, EQIO = null;
let FRAME = 0;
function loop(){
  const now = performance.now(); FRAME++;
  syncTick(now);
  /* the curves are drawn again when a knob moves (and for a moment after, while the sound settles
     on its new setting); the live sound behind them while music plays. Neither is drawn while the
     mixer is off the screen. */
  const playing = decks.some(d=>Math.abs(d.rate) > 0.01);
  if(eqSeen){
    if(eqDirty){ eqDirty = false; eqUntil = now + 400; }
    if(eqUntil && now - lastEq > 33){ lastEq = now; if(now >= eqUntil) eqUntil = 0; try{ drawEq(); }catch(e){} }
    if(playing) liveUntil = now + 1200;
    if(now < liveUntil && now - lastLive > 80){ lastLive = now; try{ drawLive(); }catch(e){} }
  }
  try{ tickLessons(); }catch(e){}
  decks.forEach(d=>{
    if(d.buf){
      d.rot = (d.pos / d.buf.sampleRate) * DEG_PER_SEC;
      /* a held hand that stops moving is a hand holding the record still */
      if(d.held && performance.now() - d.lastMove > 55){ d.handRate *= 0.45; send(d, { t:"hand", on:true, rate:d.handRate }); d.lastMove = performance.now(); }
    }
    paintDeck(d);
    const moving = d.buf && (d.motor || Math.abs(d.rate) > 0.01 || d.held);
    if(moving || d._drawn !== d.pos){ d._drawn = d.pos; LOOPQ.at = now; drawWave(d); drawZoom(d); }
  });
  /* AOG-DJ-REST-V1 (2026-10-11, Jimmy: "SUPER MAN SPEED!"): with every record still, every hand off and the meters down,
     the page looks four times a second instead of sixty (nothing on it moves); a touch, a key or a record starting brings
     it straight back to every frame */
  if(playing || (eqSeen && (eqDirty || eqUntil || now < liveUntil)) || decks.some(d=>d.motor || d.held || (d.level||0) > 0.002)) LOOPQ.at = now;
  if(now - LOOPQ.at > 2000) LOOPQ.t = setTimeout(()=>{ LOOPQ.t = 0; loop(); }, 250);
  else requestAnimationFrame(loop);
}
const LOOPQ = {at:performance.now(), t:0};
function loopWake(){ LOOPQ.at = performance.now(); if(LOOPQ.t){ clearTimeout(LOOPQ.t); LOOPQ.t = 0; requestAnimationFrame(loop); } }
["pointerdown","keydown","wheel","input","change","touchstart"].forEach(ev=>document.addEventListener(ev, loopWake, {capture:true, passive:true}));
/* ══ AOG-DJ-DESK-V1 (2026-10-08) — two decks on the desk, the third one tap away ══════════════════════════
   The pair (A · B, A · C or B · C) puts its two decks on the desk, the first on the crossfader's left, the
   second on its right. The deck that is off the desk is only hidden: its song, cues, loop and pitch stay, and
   if it is playing it keeps playing. From 960 px the mixer bay sits between the two decks: their two volume
   faders (the same volume as the mixer's [data-vol]) and the page's one crossfader (#xf), moved into the bay. */
const PAIRS = ["AB","AC","BC"];
let PAIR = "AB";
try{ const v = localStorage.getItem("aog.decks.pair"); if(PAIRS.indexOf(v) >= 0) PAIR = v; }catch(e){}
function setPair(p, quiet){
  if(PAIRS.indexOf(p) < 0) return;
  PAIR = p;
  document.body.setAttribute("data-pair", p);
  decks.forEach(d=>{ if(d.id === p[0]) d.side = "L"; else if(d.id === p[1]) d.side = "R"; });
  if(!quiet){ try{ localStorage.setItem("aog.decks.pair", p); }catch(e){} }
  /* the side buttons on the Full bench's channel strips show the new sides */
  document.querySelectorAll("[data-side]").forEach(b=>{ const d = deckOf(b, "data-side"), on = d && d.side === b.getAttribute("data-v"); b.classList.toggle("on", !!on); b.setAttribute("aria-pressed", on?"true":"false"); });
  setMix(); paintPair();
  decks.forEach(d=>{ d.waveDirty = true; });
}
function paintPair(){
  document.querySelectorAll("[data-pair]").forEach(b=>{ if(b === document.body) return; const on = b.getAttribute("data-pair") === PAIR; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on?"true":"false"); });
  const g = document.getElementById("pairs"); if(g) g.setAttribute("aria-label", t("pairLab"));
  const off = IDS.find(x=>PAIR.indexOf(x) < 0), d = decks.find(x=>x.id === off), w = document.getElementById("waiting");
  if(w && d){ const html = esc(t("waiting").replace("%d", off)) + "<b>" + esc(d.name || t("none")) + "</b>"; if(w.innerHTML !== html) w.innerHTML = html; }
  const xl = document.querySelector("#bay .xl"), xr = document.querySelector("#bay .xr");
  if(xl) xl.textContent = PAIR[0]; if(xr) xr.textContent = PAIR[1];
}
function bayHTML(){
  return `<div class="bay" id="bay" role="group" aria-label="${t("mixer")}">
    ${decks.map(d=>`<div class="bch" data-bch="${d.id}">
      <b class="blet" aria-hidden="true">${d.id}</b>
      <div class="bfw"><span class="bticks" aria-hidden="true"></span>
        <div class="bfader" data-bfader="${d.id}" style="--v:${d.vol}"><span class="bcap"></span>
          <input type="range" min="0" max="1" step="0.01" value="${d.vol}" data-bvol="${d.id}" aria-label="${t("vol")} · ${t("channel")} ${d.id}"></div>
        <span class="bmeter" aria-hidden="true"><i></i></span></div>
    </div>`).join("")}
    <div class="bxf"><b class="xl" aria-hidden="true">${PAIR[0]}</b><b class="xr" aria-hidden="true">${PAIR[1]}</b></div>
  </div>`;
}
/* one crossfader: in the bay from 960 px, in the mixer below that */
const WIDE = window.matchMedia ? matchMedia("(min-width:960px)") : { matches:false };
function placeXf(){
  const xf = document.getElementById("xf"), home = document.querySelector("div.xfade"), bay = document.querySelector("#bay .bxf");
  if(!xf || !home) return;
  if(WIDE.matches && bay){ const xr = bay.querySelector(".xr"); if(xf.parentNode !== bay) bay.insertBefore(xf, xr); xf.setAttribute("aria-label", t("mix")); }
  else { if(xf.parentNode !== home) home.appendChild(xf); xf.removeAttribute("aria-label"); }
  /* AOG-DJ-XF-TOP-V1: from 701 to 959 px the crossfader's box sits right above the decks, so it is on the first screen */
  const dk = document.getElementById("decks"), mx = document.getElementById("mixer"), mid = MID.matches && !WIDE.matches;
  if(mid && dk && home.nextElementSibling !== dk){ dk.parentNode.insertBefore(home, dk); home.classList.add("xf-top"); }
  if(mx) mx.classList.toggle("xf-out", !!(mid && dk));
  else if(!mid && mx && home.parentNode !== mx){ const st = document.getElementById("strips"); mx.insertBefore(home, st ? st.nextSibling : null); home.classList.remove("xf-top"); }
}
const MID = window.matchMedia ? matchMedia("(min-width:701px)") : { matches:false };
if(MID.addEventListener) MID.addEventListener("change", placeXf); else if(MID.addListener) MID.addListener(placeXf);
if(WIDE.addEventListener) WIDE.addEventListener("change", placeXf); else if(WIDE.addListener) WIDE.addListener(placeXf);
function setVol(d, v){
  v = Math.max(0, Math.min(1, Math.round(v*100)/100));
  d.vol = v;
  const si = document.querySelector(`#strips [data-vol="${d.id}"]`); if(si) si.value = v;
  setMix();
}
function paintBay(){
  decks.forEach(d=>{
    const f = document.querySelector(`#bay [data-bfader="${d.id}"]`); if(!f) return;
    if(f.style.getPropertyValue("--v") !== String(d.vol)) f.style.setProperty("--v", d.vol);
    const i = f.querySelector("input"); if(i && +i.value !== d.vol) i.value = d.vol;
  });
}
function bindBay(){
  document.querySelectorAll("#bay [data-bfader]").forEach(f=>{
    const d = deckOf(f, "data-bfader"), inp = f.querySelector("input");
    const at = (ev)=>{ const r = f.getBoundingClientRect(); setVol(d, 1 - (ev.clientY - r.top - 9)/Math.max(1, r.height - 18)); };
    f.onpointerdown = (ev)=>{ if(ev.button > 0) return; ev.preventDefault(); ctx(); try{ f.setPointerCapture(ev.pointerId); }catch(e){} f._drag = true; at(ev); };
    f.onpointermove = (ev)=>{ if(f._drag) at(ev); };
    f.onpointerup = f.onpointercancel = ()=>{ f._drag = false; };
    inp.oninput = ()=>setVol(d, +inp.value);
  });
  paintBay();
}
document.querySelectorAll("#pairs [data-pair]").forEach(b=>b.onclick=()=>setPair(b.getAttribute("data-pair")));
function shell(){
  { const xf = document.getElementById("xf"), home = document.querySelector("div.xfade"); if(xf && home && xf.parentNode !== home) home.appendChild(xf); }   /* keep the crossfader out of the rebuild */
  document.getElementById("decks").innerHTML = decks.map(deckHTML).join("") + bayHTML();
  document.getElementById("strips").innerHTML = decks.map(stripHTML).join("");
  placeXf(); bindBay(); paintPair();
  decks.forEach(d=>{ d._sig = ""; d.waveDirty = true; d.$ = deckParts(d);
    if(RO && d.$){ RO.observe(d.$.wave); RO.observe(d.$.zoom); } });
  if(RO){ const eqc = document.getElementById("eqCurve"); if(eqc) RO.observe(eqc); }
  /* the live curve is drawn only while it is on screen: nobody is watching it otherwise */
  if(!EQIO && window.IntersectionObserver){ const eqc = document.getElementById("eqCurve");
    if(eqc){ EQIO = new IntersectionObserver(es=>{ es.forEach(e=>{ eqSeen = e.isIntersecting; }); if(eqSeen){ eqDirty = true; loopWake(); } }); EQIO.observe(eqc); } }
  bind();
  paintMasters(); paintStrips(); paintSides();
  decks.forEach(d=>{ paintDeck(d); drawWave(d); drawZoom(d); });
}
function deckHTML(d){
  const id = d.id;
  return `
    <section class="deck" id="deck${id}" aria-label="${t("deck")} ${id}">
      <div class="dhead">
        <h2>${t("deck")} ${id}</h2>
        <button type="button" class="tiny mst" data-master="${id}" aria-pressed="false" title="${t("masterTip")}">${t("master")}</button>
        <span class="bpm" data-bpm="${id}"></span>
      </div>
      <p class="song">${esc(d.note||d.name||t("none"))}</p>
      <div class="wave" id="wave${id}" aria-hidden="true"><img class="wimg" alt="" draggable="false"><i class="wloop"></i><i class="wslip"></i><i class="whead"></i></div>
      <div class="zoom" id="zoom${id}" aria-hidden="true"><img class="zimg" alt="" draggable="false"><i class="zhead"></i></div>
      <div class="platter-wrap">
        <div class="platter" data-deck="${id}" role="slider" aria-label="${t("drag")}" tabindex="0">
          <div class="vinyl">
            <div class="strobe"></div>
            <div class="label"></div>
          </div>
          <div class="sheen"></div>
          <div class="dome"></div>
          <div class="hole"></div>
          <div class="arm"></div>
        </div>
        <button type="button" class="ghost sm revc" data-rev="${id}">${t("rev")}</button>
      </div>
      <div class="meter" aria-hidden="true"><i></i></div>
      <div class="row">
        <button type="button" class="file" data-dock="${id}" aria-expanded="false">${t("load")}</button>
        <button type="button" class="ghost" data-eject="${id}">${t("eject")}</button>
      </div>
      <div class="dock" id="dock${id}" hidden></div>
      <div class="row">
        <button type="button" class="go" data-play="${id}">${t("play")}</button>
        <button type="button" class="ghost" data-cue="${id}">${t("cueHold")}</button>
        <button type="button" class="ghost" data-setcue="${id}">${t("setCue")}</button>
        <span class="time">0:00</span>
      </div>
      <label class="knob">${t("speed")}
        <b class="readout" data-pitchout="${id}">${pitchText(d)}</b>
        <button type="button" class="tiny${d.wide?" on":""}" data-wide="${id}">${t("wide")}</button>
        <input type="range" min="${d.wide?0.5:0.92}" max="${d.wide?1.5:1.08}" step="${d.wide?0.01:0.005}" value="${d.pitch}" data-speed="${id}"></label>
      <!-- AOG-DJ-DESK-V1 — the row Jimmy could not find, above the pads: SYNC, KEY, SLIP, Chop 8 -->
      <div class="row tr perf">
        <button type="button" class="ghost sm" data-sync="${id}" aria-pressed="false">${t("sync")}</button>
        <button type="button" class="ghost sm${d.keyOn?" on":""}" data-key="${id}" aria-pressed="${d.keyOn}">${t("key")}</button>
        <button type="button" class="ghost sm${d.slipOn?" on":""}" data-slip="${id}" aria-pressed="${d.slipOn}">${t("slip")}</button>
        <button type="button" class="ghost sm" data-chop="${id}" title="${t("chopTip")}">${t("chop")}</button>
        <button type="button" class="ghost sm" data-chopsend="${id}" title="${t("chopsTip")}">${t("chopsSend")}</button>
      </div>
      <div class="pads">
        <div class="padgrid" role="group" aria-label="${t("pads")} · ${t("deck")} ${id}">
          ${[0,1,2,3,4,5,6,7].map(i=>`<button type="button" class="pad" data-hot="${id}" data-i="${i}" style="--pc:${PADC[i]}">${i+1}</button>`).join("")}
        </div>
        <p class="chopline" id="chopLine${id}" aria-live="polite">${d.chopMsg||""}</p>
      </div>
      <!-- the rest of the deck, one tap away (open on the Full bench): Lands, Erase, loops, TAP, ½×, 2×, nudge -->
      <details class="dmore"${document.body.classList.contains("bench-simple")?"":" open"}>
        <summary>${t("more")}</summary>
        <div class="padhead">
          <label class="snap">${t("snap")} <select data-snap="${id}">${[1,0.5,0.25,0].map(v=>`<option value="${v}"${d.snap===v?" selected":""}>${t(v===1?"snap1":v===0.5?"snap2":v===0.25?"snap4":"snap0")}</option>`).join("")}</select></label>
          <button type="button" class="ghost sm" data-erase="${id}" aria-pressed="false" title="${t("eraseTip")}">${t("erase")}</button>
        </div>
        <div class="row tr loops" role="group" aria-label="${t("loop")}"><span class="dlab">${t("loop")}</span>
          ${[1,2,4,8].map(n=>`<button type="button" class="ghost sm" data-loop="${id}" data-beats="${n}" aria-pressed="false" aria-label="${t("loopN").replace("%n", n)}">${n}</button>`).join("")}
          <button type="button" class="ghost sm" data-loop="${id}" data-beats="16" aria-pressed="false" title="${t("bars4Tip")}">${t("bars4")}</button>
        </div>
        <div class="row tr">
          <button type="button" class="ghost sm" data-tap="${id}">${t("tap")}</button>
          <button type="button" class="ghost sm" data-half="${id}">½×</button>
          <button type="button" class="ghost sm" data-double="${id}">2×</button>
        </div>
        <div class="row nud">
          <button type="button" class="ghost" data-nudge="${id}" data-dir="-1">− ${t("nudge")}</button>
          <button type="button" class="ghost" data-nudge="${id}" data-dir="1">+ ${t("nudge")}</button>
          <span class="rpm" role="group" aria-label="${t("rpm")}">
            <button type="button" class="ghost rpmb${d.rpm===1?" on":""}" data-rpm="${id}" data-v="1">33⅓</button>
            <button type="button" class="ghost rpmb${d.rpm!==1?" on":""}" data-rpm="${id}" data-v="1.35">45</button>
          </span>
        </div>
      </details>
    </section>`;
}
function eqText(v){ return (v>0?"+":"") + (Math.round(v*2)/2).toFixed(v%1?1:0) + " dB"; }
/* an EQ knob turns about its middle: left takes the band down to -26 dB, right lifts it 6 dB, the middle is flat */
function vToDb(v){ return v < 0 ? 26*v : 6*v; }
function dbToV(db){ return db < 0 ? db/26 : db/6; }
function filtText(v){ if(Math.abs(v) <= 0.03) return t("off"); return (v<0?"◀ ":"") + Math.round(Math.abs(v)*100) + "%" + (v>0?" ▶":""); }
function stripHTML(d){
  const id = d.id, B = {high:"H",mid:"M",low:"L"};
  return `
    <div class="strip" id="strip${id}" role="group" aria-label="${t("channel")} ${id}">
      <div class="shead"><b class="sid">${id}</b><span class="sname" data-sname="${id}"></span></div>
      ${["high","mid","low"].map(b=>`<div class="eqk">
        <label class="knob">${t("eq"+b[0].toUpperCase()+b.slice(1))} <b class="readout" data-eqout="${id}" data-band="${b}">${eqText(d.eqv[b])}</b>
          <input type="range" min="-1" max="1" step="0.01" value="${dbToV(d.eqv[b])}" data-eq="${id}" data-band="${b}"></label>
        <button type="button" class="ghost sm kill" data-kill="${id}" data-band="${b}" aria-pressed="false">${t("kill"+B[b])}</button></div>`).join("")}
      <label class="knob flt">${t("filter")} <b class="readout" data-fout="${id}">${filtText(d.filtv)}</b>
        <input type="range" min="-1" max="1" step="0.01" value="${d.filtv}" data-filter="${id}"></label>
      <div class="fxbox">
        <div class="fxrow" role="group" aria-label="${t("fx")} · ${t("channel")} ${id}"><span class="dlab">${t("fx")}</span>
          ${["echo","reverb","flanger"].map(x=>`<button type="button" class="ghost sm${d.fxType===x?" on":""}" data-fxtype="${id}" data-v="${x}" aria-pressed="${d.fxType===x}">${t(x)}</button>`).join("")}</div>
        <label class="fxb">${t("beats")} <select data-fxbeats="${id}">${FXBEATS[d.fxType].map(v=>`<option value="${v}"${d.fxBeats[d.fxType]===v?" selected":""}>${beatsLabel(v)}</option>`).join("")}</select></label>
        <label class="knob">${t("amount")} <input type="range" min="0" max="1" step="0.01" value="${d.fxAmt}" data-fxamt="${id}"></label>
      </div>
      <button type="button" class="ghost sm" data-flat="${id}">${t("flat")}</button>
      <label class="knob">${t("vol")} <input type="range" min="0" max="1" step="0.01" value="${d.vol}" data-vol="${id}"></label>
      <div class="side" role="group" aria-label="${t("side")} · ${t("channel")} ${id}"><span class="dlab">${t("side")}</span>
        ${["L","N","R"].map(s=>`<button type="button" class="ghost sm${d.side===s?" on":""}" data-side="${id}" data-v="${s}" aria-pressed="${d.side===s}">${t("side"+s)}</button>`).join("")}</div>
      <div class="meter" aria-hidden="true"><i></i></div>
    </div>`;
}
/* AOG-DJ-RECORD-ART-V1 — the pressing and the label of the record on a deck */
function recLook(d){
  if(!d.buf) return null;
  const m = d.made && MADE.find(x=>x.id===d.made), h = m && m.hue != null ? m.hue : hueOf(d.name || "");
  return { h, style:["solid","swirl"][Math.floor(h / 15) % 2] };
}
function paintRecord(d){
  const el = document.getElementById("deck"+d.id); if(!el) return;
  const v = el.querySelector(".vinyl"), lab = el.querySelector(".label"); if(!v || !lab) return;
  const L = recLook(d), key = L ? [L.h, L.style, d.name, S.lang].join("|") : "";
  if(v._rk === key) return; v._rk = key;
  v.classList.remove("v-solid","v-swirl"); lab.classList.toggle("printed", !!L);
  if(!L){ v.style.removeProperty("--vh"); lab.style.removeProperty("--vh"); lab.innerHTML = ""; return; }
  v.classList.add("v-"+L.style); v.style.setProperty("--vh", L.h); lab.style.setProperty("--vh", L.h);
  lab.innerHTML = `<div class="rl" aria-hidden="true"><span class="rl-logo"><i>G</i><span>GRACE<small>RECORDS</small></span></span>
    <span class="rl-low"><span class="rl-name">${esc((d.name || "").replace(/\.[^.]+$/,""))}</span><span class="rl-side">${esc(t("recSide").replace("%d", d.id))}</span></span></div>`;
}
function paintStrips(){
  decks.forEach(d=>{
    const n = document.querySelector('[data-sname="'+d.id+'"]'); if(n) setT(n, d.name || t("none"));
    paintRecord(d);
  });
  paintPair();
}
/* AOG-DECKS-FILES-ONLY-V1 (2026-10-09) — Jimmy: "Can we only have upload a file. There is no point to have load a photo or
   take video here." A picker that takes video files makes an iPad offer Photo Library and Take Video; these take sound
   files only, so it goes straight to Files. (A song dragged onto a deck still loads as before.) */
function dockHTML(id){
  return `<div class="dockhd"><p class="dockh">${t("dockH")}</p><button type="button" class="dockx" data-dockclose="${id}">✕ ${t("dockClose")}</button></div>
    ${CRATE.lib.length ? `<div class="docklist">${CRATE.lib.map((r,i)=>`<button type="button" class="dsong" data-dsong="${i}" title="${esc(r.name)}"><span>${esc(r.name.replace(/\.[^.]+$/,""))}</span></button>`).join("")}</div>` : `<p class="dockempty">${t("dockNone")}</p>`}
    <div class="dockrow"><label class="file">${t("dockAdd")}<input type="file" data-dockload="${id}" accept="${AUDIO_ONLY || "audio/*,.mp3,.m4a,.m4b,.aac,.wav,.wave,.aif,.aiff,.aifc,.ogg,.oga,.opus,.flac,.caf,.amr,.wma,.mid,.midi"}"></label>
    ${CRATE.lib.length ? `<button type="button" class="ghost" data-dockedit="${id}">${t("dockEdit")}</button>` : ""}</div>
    <details class="ithelp"><summary>${t("itH")}</summary><p>${t("it1")}</p><ul><li>${t("it2")}</li><li>${t("it3")}</li><li>${t("it4")}</li></ul></details>`;
}
/* close a deck's song list; back to its Load a song button when asked */
function dockShut(id, focus){
  const box = document.getElementById("dock"+id); if(!box || box.hidden) return;
  box.hidden = true; box.classList.remove("editing");
  const tg = document.querySelector(`[data-dock="${id}"]`);
  if(tg){ tg.setAttribute("aria-expanded","false"); if(focus) tg.focus(); }
}
document.addEventListener("keydown", ev=>{
  if(ev.key !== "Escape") return;
  document.querySelectorAll(".dock:not([hidden])").forEach(box=>dockShut(box.id.slice(4), true));
});
function paintDocks(){
  document.querySelectorAll(".dock").forEach(box=>{
    const id = box.id.slice(4), editing = box.classList.contains("editing");
    box.innerHTML = dockHTML(id);
    box.querySelectorAll("[data-dsong]").forEach(b=>{
      if(editing) b.classList.add("rm");
      b.onclick = ()=>{
        const r = CRATE.lib[+b.getAttribute("data-dsong")]; if(!r) return;
        if(box.classList.contains("editing")){ CRATE.lib = CRATE.lib.filter(x=>x!==r); cratePut("lib", CRATE.lib); paintDocks(); return; }
        box.hidden = true; const tg=document.querySelector(`[data-dock="${id}"]`); if(tg) tg.setAttribute("aria-expanded","false");
        loadFile(decks.find(x=>x.id===id), crateFile(r));
      };
    });
    const cl = box.querySelector("[data-dockclose]");
    if(cl) cl.onclick = ()=>dockShut(id, true);
    const ed = box.querySelector("[data-dockedit]");
    if(ed){ ed.textContent = editing ? t("dockDone") : t("dockEdit"); ed.onclick = ()=>{ box.classList.toggle("editing"); paintDocks(); }; }
    const inp = box.querySelector("[data-dockload]");
    if(inp) inp.onchange = async ()=>{
      const file = inp.files && inp.files[0]; if(!file) return;
      box.hidden = true;
      await loadFile(decks.find(x=>x.id===id), file);
    };
  });
}
const deckOf = (el, attr)=>decks.find(x=>x.id===el.getAttribute(attr));
/* a button you HOLD (CUE, REV, nudge, a pad) answers a finger, a mouse, or the space and enter keys */
function holdable(btn, down, up){
  let on = false;
  btn.addEventListener("pointerdown", (e)=>{ if(e.button > 0) return; e.preventDefault(); try{ btn.setPointerCapture(e.pointerId); }catch(err){} on = true; down(e); });
  const rel = (e)=>{ if(!on) return; on = false; up(e); };
  btn.addEventListener("pointerup", rel); btn.addEventListener("pointercancel", rel); btn.addEventListener("lostpointercapture", rel);
  btn.addEventListener("keydown", (e)=>{ if((e.key===" "||e.key==="Enter") && !e.repeat && !on){ e.preventDefault(); on = true; down(e); } });
  btn.addEventListener("keyup", (e)=>{ if((e.key===" "||e.key==="Enter") && on){ e.preventDefault(); rel(e); } });
  btn.addEventListener("click", (e)=>{ if(e.detail === 0 && !on){ down(e); up(e); } });   /* a screen reader's click */
}
/* Start, or Stop. A deck synced to a playing MASTER does not spin up from still: it
   starts at full speed on the master's next beat, booked to the exact frame. */
async function startDeck(d, from){
  if(!d.buf) return;
  ctx(); await ensureNode(d);
  const m = masterDeck();
  if(from != null){ d.pos = from; }
  if(d.syncLock && m && m !== d && m.motor && d.bpm > 0 && Math.abs(m.rr) > 0.05){
    const r = syncRatio(d, m); setPitch(d, r.want, true);
    const sr = actx.sampleRate, F0 = nowFrame() + Math.round(0.07*sr), bl = beatLen(m), g0 = grid0(m);
    const im = (posAt(m, F0) - g0)/bl;
    const kb = Math.ceil(im - 1e-6), Fb = m.frame + ((g0 + kb*bl) - m.pos)/m.rr;
    const fm = kb - Math.floor(kb);   /* 0: the master's beat line */
    const is0 = ((from != null ? from : d.pos) - grid0(d))/beatLen(d);
    const is = (Math.round(is0*r.f - fm) + fm)/r.f;
    const P = Math.max(1, grid0(d) + is*beatLen(d));
    send(d, { t:"sched", frame:Math.round(Fb), m:{ t:"start", pos:P } });
    d._startAt = Math.round(Fb); d._aligned = performance.now() + Math.max(0, (Fb - nowFrame())/sr*1000);
    d.motor = true; LX.startPos[d.id] = P;
  } else {
    if(from != null) send(d, { t:"seek", v:from, park:true });
    d.motor = true; LX.startPos[d.id] = d.pos;
    send(d, { t:"motor", on:true, instant: from != null });
  }
  if(!masterId || !masterDeck()) setMaster(d.id);
  paintDeck(d);
}
function stopDeck(d, quiet){
  if(d._startAt != null){ send(d, { t:"unsched" }); d._startAt = null; }
  if(d.motor){ d.motor = false; send(d, { t:"motor", on:false }); }
  if(d.id === masterId){ const p = decks.find(o=>o!==d && o.motor && o.buf && o.bpm > 0); if(p) setMaster(p.id); }
  if(!quiet) paintDeck(d);
}
/* ══ AOG-DJ-PADS-V1 — eight pads a deck: a chop each ════════════════════════
   Empty pad: marks the spot (on the beat, when Lands says so). Full pad: the record
   jumps there — on a playing deck, at the next beat line, so the chops play in time.
   With SLIP on, the pad plays while it is held; let go and the song carries on
   where it would have been (a quick tap plays one step of the chop). */
function snapLen(d){ return d.snap > 0 && d.bpm > 0 ? beatLen(d)*d.snap : 0; }
function padPress(d, i){
  if(!d.buf){ deckSay(d, "sayLoad"); return; }
  d.padDown[i] = true;
  const btn = document.querySelector('[data-hot="'+d.id+'"][data-i="'+i+'"]'); if(btn) btn.classList.add("hit");
  if(d.erase){ d.cues[i] = null; d.erase = false; d._sig = ""; marksSave(d); d.waveDirty = true; paintDeck(d); drawWave(d); return; }
  if(d.cues[i] == null){
    let p = d.motor ? posAt(d, heardFrame()) : d.pos;
    const q = snapLen(d), g0 = grid0(d);
    if(q > 0) p = g0 + Math.round((p - g0)/q)*q;
    d.cues[i] = Math.max(1, Math.min(d.buf.length-4, p));
    marksSave(d); d._sig = ""; d.waveDirty = true; paintDeck(d); drawWave(d);
    LX.padSet = true; deckSay(d, "sayPadSet", i+1);
    return;
  }
  ctx();
  ensureNode(d).then(()=>{
    if(d.loopOn){ d.loopOn = false; d.loopBeats = 0; d._sig = ""; }
    if(d.motor && d._startAt == null){
      const q = snapLen(d);
      send(d, { t:"qjump", to:d.cues[i], b0:grid0(d), len:q, late: q ? Math.round(0.03*d.buf.sampleRate*Math.max(0.5,d.pitch)) : 0 });
      LX.padHit = true;
    } else {
      startDeck(d, d.cues[i]);
    }
  });
}
function padRelease(d, i){
  if(!d.padDown[i]) return;
  d.padDown[i] = false;
  const btn = document.querySelector('[data-hot="'+d.id+'"][data-i="'+i+'"]'); if(btn) btn.classList.remove("hit");
  if(d.slipOn && d.motor && d.buf) send(d, { t:"qret", b0:grid0(d), len:snapLen(d) });
}
/* the next 8 beats, from the bar the needle is in, on pads 1 to 8 */
function chop8(d){
  if(!d.buf || !(d.bpm > 0)) return;
  const bl = beatLen(d), g0 = grid0(d), p = d.motor ? posAt(d, heardFrame()) : d.pos;
  const bar0 = g0 + Math.floor((p - g0)/(4*bl) + 1e-7)*4*bl;
  for(let i=0;i<8;i++) d.cues[i] = Math.max(1, Math.min(d.buf.length-4, bar0 + i*bl));
  marksSave(d); d._sig = ""; d.waveDirty = true; paintDeck(d); drawWave(d);
  LX.padSet = true;
}
/* ══ AOG-CHOPS-TO-PADS-V1 (2026-10-09) — STUDIO-HANDOFF §9, Jimmy: "I cut this from my record. Put it on the pads." ══
   Chops to the Drum Machine takes 16 beats of the record on this deck, from the start of the bar the needle is in (or
   8 seconds from the needle when the record's tempo is not known), and sends them the way every take goes: into the
   Mixing Desk's list ("studioinbox", from "decks", named after the record) with a note on "padstake", so the Drum
   Machine puts them on its chops bank, one beat a pad (aog-handoff.js; music-pads.html takeIn). No new shelf. The
   record stays on this device: nothing is uploaded. */
function chopWav(L, R, sr){
  const n = L.length, ab = new ArrayBuffer(44 + n*4), v = new DataView(ab);
  const w = (o, s)=>{ for(let i=0;i<s.length;i++) v.setUint8(o+i, s.charCodeAt(i)); };
  w(0,"RIFF"); v.setUint32(4, 36+n*4, true); w(8,"WAVE"); w(12,"fmt "); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,2,true);
  v.setUint32(24, sr, true); v.setUint32(28, sr*4, true); v.setUint16(32,4,true); v.setUint16(34,16,true); w(36,"data"); v.setUint32(40, n*4, true);
  for(let i=0, o=44; i<n; i++, o+=4){ const l = Math.max(-1, Math.min(1, L[i])), r = Math.max(-1, Math.min(1, R[i]));
    v.setInt16(o, l<0 ? l*0x8000 : l*0x7fff, true); v.setInt16(o+2, r<0 ? r*0x8000 : r*0x7fff, true); }
  return new Blob([ab], { type:"audio/wav" });
}
function recordTitle(d){ return String(d.name||"").replace(/\.[a-z0-9]{2,5}$/i, "").replace(/[_]+/g, " ").trim().slice(0, 80) || t("deck")+" "+d.id; }
async function chopsToPads(d, btn){
  if(!d.buf) return;
  const line = document.getElementById("chopLine"+d.id), say = h=>{ d.chopMsg = h; if(line) line.innerHTML = h; };
  const sr = d.buf.sampleRate, bl = beatLen(d), p = d.motor ? posAt(d, heardFrame()) : d.pos;
  let a, n, bpm = 0;
  if(bl > 0){ const g0 = grid0(d); a = g0 + Math.floor((p - g0)/(4*bl) + 1e-7)*4*bl; if(a < 0) a += 4*bl; a = Math.round(a); n = Math.round(16*bl + 0.02*sr); bpm = 60*sr/bl; }
  else { a = Math.max(0, Math.round(p)); n = Math.round(8*sr); }
  if(a + n > d.buf.length){ if(bl > 0 || d.buf.length - a < sr){ say(esc(t("chopsEnd"))); return; } n = d.buf.length - a; }
  if(btn) btn.disabled = true;
  try{
    if(!window.AOGHandoff || !AOGHandoff.add) throw new Error("no inbox");
    const L = d.buf.getChannelData(0).subarray(a, a+n), R = (d.buf.numberOfChannels > 1 ? d.buf.getChannelData(1) : d.buf.getChannelData(0)).subarray(a, a+n);
    const nm = recordTitle(d), at = Date.now();
    const r = await AOGHandoff.add(AOGHandoff.INBOX, { from:"decks", name:{ en:nm+" · "+STR.chopsWord.en, es:nm+" · "+STR.chopsWord.es }, chops:true,
      sec:Math.round(n/sr*1000)/1000, bpm:bpm > 0 ? Math.round(bpm*1000)/1000 : 0, at:at, take:true, wav:chopWav(L, R, sr) }, { key:"chops|"+(d.trackKey||d.name)+"|"+a });
    await AOGHandoff.put("padstake", { id:r.id, from:"decks", name:nm, at:at });
    say(esc(t("chopsSent").replace("%s", nm))+` <a href="/drum-machine">${esc(t("chopsGo"))}</a>`);
  }catch(e){ say(esc(e && e.name === "QuotaExceededError" ? t("noRoom") : t("chopsFail"))); }
  if(btn) btn.disabled = false;
}
/* a loop in beats, measured on the audio thread from where the needle really is */
function deckSay(d, k, n){ const line = document.getElementById("chopLine"+d.id), h = t(k).replace("%n", n); d.chopMsg = esc(h); if(line) line.textContent = h; }
function loopPress(d, beats){
  if(!d.buf){ deckSay(d, "sayLoad"); return; }
  if(!(d.bpm > 0)){ deckSay(d, "sayNoBeat"); return; }
  ctx();
  ensureNode(d).then(()=>{
    if(d.loopOn && d.loopBeats === beats){ d.loopOn = false; d.loopBeats = 0; send(d, { t:"loop", on:false }); deckSay(d, "sayLoopOff"); }
    else {
      const keepA = d.loopOn && beats < 16 && d.loopBeats < 16;
      d.loopOn = true; d.loopBeats = beats;
      send(d, { t:"bloop", b0:grid0(d), len:beatLen(d), n:beats, align: beats >= 16 ? 4 : 1, keepA:keepA });
      deckSay(d, "sayLoop", beats);
      if(!d.motor) startDeck(d);   /* a stopped record starts, so the loop is heard */
    }
    d._sig = ""; paintDeck(d);
  });
}
function bind(){
  paintDocks();
  document.querySelectorAll("[data-dock]").forEach(b=>{
    b.onclick = ()=>{
      const box = document.getElementById("dock"+b.getAttribute("data-dock")); if(!box) return;
      box.hidden = !box.hidden; box.classList.remove("editing"); paintDocks();
      b.setAttribute("aria-expanded", box.hidden ? "false" : "true");
      if(b.getAttribute("data-dock") === "A") LX.dockA = true;
    };
  });
  document.querySelectorAll(".deck").forEach(sec=>{
    const d = decks.find(x=>("deck"+x.id)===sec.id); if(!d) return;
    const over = ev=>{ ev.preventDefault(); sec.classList.add("dragover"); };
    sec.addEventListener("dragover", over);
    sec.addEventListener("dragenter", over);
    sec.addEventListener("dragleave", ()=>sec.classList.remove("dragover"));
    sec.addEventListener("drop", ev=>{
      ev.preventDefault(); sec.classList.remove("dragover");
      const sl = ev.dataTransfer && ev.dataTransfer.getData("text/aog-sleeve");
      if(sl !== "" && sl != null){ crateTake(+sl, d); return; }
      const f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
      if(f) loadFile(d, f);
    });
  });
  /* AOG-DECKS-EJECT-V1 (2026-09-23) — Jimmy: "how do you get rid of a track?"
     You could not: a deck only ever had another record put on top of it. The
     platter empties now — the engine drops the audio, and the marks, the loop
     and the tempo go with it. */
  document.querySelectorAll("[data-eject]").forEach(btn=>{
    btn.onclick = ()=>{
      const d = deckOf(btn, "data-eject");
      if(!d) return;
      stopDeck(d, true);
      d.loopOn = false; d.loopBeats = 0; d.syncLock = false; d.held = false;
      send(d, { t:"loop", on:false, keep:true });
      send(d, { t:"rev", on:false });
      send(d, { t:"clear" });
      d.buf = null; d.peaks = null; d.zpk = null; d.bands = null; d.name = ""; d.note = ""; d.made = "";
      d.pos = 0; d.cue = 0; d.rate = 0; d.rr = 0; d.level = 0; d.rot = 0; d.bpm = 0; d.beat0 = 0;
      d.cues = [null,null,null,null,null,null,null,null]; d.trackKey = ""; d.taps = []; d._sig = ""; d.waveDirty = true;
      crateForget(d);
      if(masterId === d.id) setMaster(null);
      drawWave(d); drawZoom(d); paintDeck(d); paintStrips();
    };
  });
  document.querySelectorAll("[data-play]").forEach(btn=>{
    btn.onclick = async ()=>{
      const d = deckOf(btn, "data-play");
      if(!d.buf) return;
      if(d.motor) stopDeck(d); else await startDeck(d);
    };
  });
  /* CUE the way a deck does it: hold to hear it from the mark, let go and the
     record is back at the mark, stopped, ready to go again. */
  document.querySelectorAll("[data-cue]").forEach(btn=>{
    const deck = ()=>deckOf(btn, "data-cue");
    holdable(btn, async ()=>{
      const d = deck(); if(!d || !d.buf) return;
      ctx(); await ensureNode(d);
      d.cueHeld = true; LX.cueHeld[d.id] = true;
      d.pos = d.cue||0; send(d, { t:"seek", v:d.pos, park:true });
      d.motor = true; send(d, { t:"motor", on:true, instant:true });
      paintDeck(d);
    }, ()=>{
      const d = deck(); if(!d || !d.cueHeld) return;
      d.cueHeld = false;
      stopDeck(d, true);
      d.pos = d.cue||0; send(d, { t:"seek", v:d.pos, park:true });
      drawWave(d); drawZoom(d); paintDeck(d);
    });
  });
  document.querySelectorAll("[data-hot]").forEach(btn=>{
    const i = +btn.getAttribute("data-i");
    holdable(btn, (e)=>{ const d = deckOf(btn, "data-hot"); if(d){ if(e && e.altKey && d.cues[i]!=null){ d.erase = true; } padPress(d, i); } },
                  ()=>{ const d = deckOf(btn, "data-hot"); if(d) padRelease(d, i); });
    btn.addEventListener("keydown", (e)=>{ if(e.key==="Delete"||e.key==="Backspace"){ const d = deckOf(btn, "data-hot"); if(d && d.cues[i]!=null){ e.preventDefault(); d.cues[i] = null; marksSave(d); d._sig = ""; d.waveDirty = true; paintDeck(d); drawWave(d); } } });
  });
  document.querySelectorAll("[data-chop]").forEach(btn=>{ btn.onclick = ()=>{ const d = deckOf(btn, "data-chop"); if(d) chop8(d); }; });
  document.querySelectorAll("[data-chopsend]").forEach(btn=>{ btn.onclick = ()=>{ const d = deckOf(btn, "data-chopsend"); if(d) chopsToPads(d, btn); }; });
  document.querySelectorAll("[data-erase]").forEach(btn=>{ btn.onclick = ()=>{ const d = deckOf(btn, "data-erase"); if(d){ d.erase = !d.erase; d._sig = ""; paintDeck(d); } }; });
  document.querySelectorAll("[data-snap]").forEach(sel=>{ sel.onchange = ()=>{ const d = deckOf(sel, "data-snap"); if(d) d.snap = +sel.value; }; });
  document.querySelectorAll("[data-loop]").forEach(btn=>{ btn.onclick = ()=>{ const d = deckOf(btn, "data-loop"); if(d) loopPress(d, +btn.getAttribute("data-beats")); }; });
  document.querySelectorAll("[data-master]").forEach(btn=>{
    btn.onclick = ()=>{ const d = deckOf(btn, "data-master"); if(!d || !d.buf || !(d.bpm > 0)) return; setMaster(d.id);
      if(d.syncLock){ d.syncLock = false; d._sig = ""; send(d, { t:"bend", v:1 }); d.bend = 1; paintDeck(d); } };
  });
  /* SYNC: take the master's tempo, then land on its beat — and stay there */
  document.querySelectorAll("[data-sync]").forEach(btn=>{
    btn.onclick = async ()=>{
      const d = deckOf(btn, "data-sync");
      if(d.syncLock){ d.syncLock = false; d.bend = 1; send(d, { t:"bend", v:1 }); d._sig = ""; paintDeck(d); return; }
      d.syncLock = true; d._sig = ""; paintDeck(d);
      if(!masterId || masterId === d.id){ const other = decks.find(o=>o!==d && o.buf && o.bpm > 0 && o.motor) || decks.find(o=>o!==d && o.buf && o.bpm > 0); if(other) setMaster(other.id); }
      const m = masterDeck();
      if(!d.buf || !m || m === d || d.bpm<=0) return;
      ctx(); await ensureNode(d);
      setPitch(d, syncRatio(d, m).want, true);
      d._aligned = performance.now() - 150;   /* line the beats up once the new speed has reached the audio */
    };
  });
  /* KEY — the pitch fader stops moving the voice. It steps aside for a hand on
     the platter, because a scratch is meant to change pitch. */
  document.querySelectorAll("[data-key]").forEach(btn=>{
    btn.onclick = async ()=>{
      const d = deckOf(btn, "data-key");
      d.keyOn = !d.keyOn; ctx(); await ensureNode(d);
      send(d, { t:"key", on:d.keyOn }); btn.classList.toggle("on", d.keyOn); btn.setAttribute("aria-pressed", d.keyOn);
    };
  });
  /* SLIP — the record keeps turning under the scratch. Let go, and you are
     where the track would have been if you had never touched it. */
  document.querySelectorAll("[data-slip]").forEach(btn=>{
    btn.onclick = async ()=>{
      const d = deckOf(btn, "data-slip");
      d.slipOn = !d.slipOn; ctx(); await ensureNode(d);
      send(d, { t:"slip", on:d.slipOn }); btn.classList.toggle("on", d.slipOn); btn.setAttribute("aria-pressed", d.slipOn);
    };
  });
  /* REV — backwards while you hold it; with SLIP on, letting go puts you back
     on the beat, which is the whole trick (a DJ calls it a censor). */
  document.querySelectorAll("[data-rev]").forEach(btn=>{
    const deck = ()=>deckOf(btn, "data-rev");
    holdable(btn, async ()=>{
      const d = deck(); if(!d || !d.buf) return;
      ctx(); await ensureNode(d);
      d.revOn = true; send(d, { t:"rev", on:true }); btn.classList.add("on");
    }, ()=>{ const d = deck(); if(!d) return; d.revOn = false; send(d, { t:"rev", on:false }); btn.classList.remove("on"); });
  });
  /* TAP — four taps and the deck takes your tempo instead of its own guess */
  document.querySelectorAll("[data-tap]").forEach(btn=>{
    btn.onclick = ()=>{
      const d = deckOf(btn, "data-tap");
      if(!d) return;
      if(!d.buf){ deckSay(d, "sayLoad"); return; }
      const now = performance.now();
      if(d.taps.length && now - d.taps[d.taps.length-1] > 2200) d.taps = [];
      d.taps.push(now);
      if(d.taps.length > 5) d.taps.shift();
      if(d.taps.length >= 3){
        const span = (d.taps[d.taps.length-1] - d.taps[0]) / (d.taps.length-1);
        const bpm = 60000/span;
        if(bpm > 60 && bpm < 200){
          d.bpm = Math.round(bpm*100)/100;
          d.beat0 = Math.max(0, d.pos/(d.buf?d.buf.sampleRate:44100)) % (60/d.bpm);
          marksSave(d); d.waveDirty = true; paintDeck(d); drawWave(d); drawZoom(d); fxSend(d);
          deckSay(d, "sayTapSet", Math.round(d.bpm));
        }
      } else deckSay(d, "sayTap", d.taps.length);
    };
  });
  document.querySelectorAll("[data-half],[data-double]").forEach(btn=>{
    const half = btn.hasAttribute("data-half");
    btn.onclick = ()=>{
      const d = deckOf(btn, half?"data-half":"data-double");
      if(!d.bpm || d.bpm<=0) return;
      const b = half ? d.bpm/2 : d.bpm*2;
      if(b < 50 || b > 220) return;
      d.bpm = Math.round(b*100)/100; marksSave(d);
      d.waveDirty = true; paintDeck(d); drawWave(d); drawZoom(d); fxSend(d);
    };
  });
  /* the needle goes where you point it: click or drag either waveform */
  document.querySelectorAll(".wave, .zoom").forEach(cv=>{
    const id = cv.id.replace(/^(wave|zoom)/, "");
    const zoomed = cv.id.indexOf("zoom") === 0;
    let dragging = false;
    const place = (e)=>{
      const d = decks.find(x=>x.id===id); if(!d || !d.buf) return;
      const r = cv.getBoundingClientRect(), f = Math.max(0, Math.min(1, (e.clientX-r.left)/r.width));
      d.pos = zoomed ? Math.max(0, Math.min(d.buf.length-3, d.pos + (f-0.5)*d.buf.sampleRate*1.2))
                     : f*(d.buf.length-3);
      send(d, { t:"seek", v:d.pos });
      drawWave(d); drawZoom(d); paintDeck(d);
    };
    cv.onpointerdown = async (e)=>{
      const d = decks.find(x=>x.id===id); if(!d || !d.buf) return;
      ctx(); await ensureNode(d);
      dragging = true; try{ cv.setPointerCapture(e.pointerId); }catch(err){} place(e);
    };
    cv.onpointermove = (e)=>{ if(dragging) place(e); };
    const up = ()=>{ dragging = false; };
    cv.onpointerup = up; cv.onpointercancel = up;
    cv.style.cursor = "text";
  });
  document.querySelectorAll("[data-setcue]").forEach(btn=>{
    btn.onclick = ()=>{ const d = deckOf(btn, "data-setcue"); if(d.buf){ d.cue = d.motor ? posAt(d, heardFrame()) : d.pos; LX.setcue[d.id] = true; } };
  });
  document.querySelectorAll("[data-nudge]").forEach(btn=>{
    const deck = ()=>deckOf(btn, "data-nudge");
    const dir = btn.getAttribute("data-dir")==="1" ? 1.04 : 0.96;
    holdable(btn, ()=>{ const d=deck(); if(!d) return; send(d, { t:"pitch", v:d.pitch*dir }); },
                  ()=>{ const d=deck(); if(!d) return; send(d, { t:"pitch", v:d.pitch }); });
  });
  document.querySelectorAll("[data-rpm]").forEach(btn=>{
    btn.onclick = ()=>{
      const d = deckOf(btn, "data-rpm");
      d.rpm = +btn.getAttribute("data-v");
      send(d, { t:"rpm", v:d.rpm });
      btn.parentNode.querySelectorAll(".rpmb").forEach(b=>b.classList.toggle("on", b===btn));
      fxSend(d);
    };
  });
  /* ── the mixer ─────────────────────────────────────────────────────────── */
  document.querySelectorAll("[data-eq]").forEach(inp=>{
    inp.oninput = async ()=>{
      const d = deckOf(inp, "data-eq"), b = inp.getAttribute("data-band");
      d.eqv[b] = Math.round(vToDb(+inp.value)*2)/2;
      const o = document.querySelector('[data-eqout="'+d.id+'"][data-band="'+b+'"]'); if(o) o.textContent = eqText(d.eqv[b]);
      ctx(); await ensureNode(d); d.eq.set(b, d.eqv[b]); eqDirty = true;
    };
  });
  document.querySelectorAll("[data-kill]").forEach(btn=>{
    btn.onclick = async ()=>{
      const d = deckOf(btn, "data-kill");
      ctx(); await ensureNode(d);
      const on = d.eq.kill(btn.getAttribute("data-band"), !d.eq.killed(btn.getAttribute("data-band")));
      btn.classList.toggle("on", on); btn.setAttribute("aria-pressed", on?"true":"false"); eqDirty = true;
    };
  });
  document.querySelectorAll("[data-flat]").forEach(btn=>{
    btn.onclick = async ()=>{
      const d = deckOf(btn, "data-flat");
      ctx(); await ensureNode(d);
      d.eq.flat(); d.eqv = { high:0, mid:0, low:0 };
      document.querySelectorAll('[data-eq="'+d.id+'"]').forEach(i=>{ i.value="0"; });
      document.querySelectorAll('[data-eqout="'+d.id+'"]').forEach(o=>{ o.textContent = eqText(0); });
      document.querySelectorAll('[data-kill="'+d.id+'"]').forEach(b=>{ b.classList.remove("on"); b.setAttribute("aria-pressed","false"); });
      const f=document.querySelector('[data-filter="'+d.id+'"]');
      if(f){ f.value="0"; f.dispatchEvent(new Event("input")); }
    };
  });
  document.querySelectorAll("[data-filter]").forEach(inp=>{
    inp.oninput = async ()=>{
      const d = deckOf(inp, "data-filter");
      d.filtv = +inp.value; LX.filt[d.id] = d.filtv;
      const o = document.querySelector('[data-fout="'+d.id+'"]'); if(o) o.textContent = filtText(d.filtv);
      ctx(); await ensureNode(d); applyFilter(d); eqDirty = true;
    };
  });
  document.querySelectorAll("[data-fxtype]").forEach(btn=>{
    btn.onclick = async ()=>{
      const d = deckOf(btn, "data-fxtype"), v = btn.getAttribute("data-v");
      d.fxType = v;
      document.querySelectorAll('[data-fxtype="'+d.id+'"]').forEach(b=>{ const on = b===btn; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on?"true":"false"); });
      const sel = document.querySelector('[data-fxbeats="'+d.id+'"]');
      if(sel) sel.innerHTML = FXBEATS[v].map(x=>`<option value="${x}"${d.fxBeats[v]===x?" selected":""}>${beatsLabel(x)}</option>`).join("");
      LX.echo[d.id] = d.fxType==="echo" ? d.fxAmt : 0;
      ctx(); await ensureNode(d); fxSend(d);
    };
  });
  document.querySelectorAll("[data-fxbeats]").forEach(sel=>{
    sel.onchange = async ()=>{ const d = deckOf(sel, "data-fxbeats"); d.fxBeats[d.fxType] = +sel.value; ctx(); await ensureNode(d); fxSend(d); };
  });
  document.querySelectorAll("[data-fxamt]").forEach(inp=>{
    inp.oninput = async ()=>{
      const d = deckOf(inp, "data-fxamt");
      d.fxAmt = +inp.value; LX.echo[d.id] = d.fxType==="echo" ? d.fxAmt : 0;
      ctx(); await ensureNode(d); fxSend(d);
    };
  });
  document.querySelectorAll("[data-side]").forEach(btn=>{
    btn.onclick = ()=>{
      const d = deckOf(btn, "data-side"); d.side = btn.getAttribute("data-v");
      document.querySelectorAll('[data-side="'+d.id+'"]').forEach(b=>{ const on = b===btn; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on?"true":"false"); });
      setMix();
    };
  });
  document.querySelectorAll("[data-speed]").forEach(inp=>{
    inp.oninput = ()=>{
      const d = deckOf(inp, "data-speed");
      if(d.syncLock && d.id !== masterId){ d.syncLock = false; d.bend = 1; send(d, { t:"bend", v:1 }); d._sig = ""; }   /* moving a synced deck's pitch by hand lets go of SYNC */
      setPitch(d, +inp.value);
    };
  });
  /* WIDE opens the pitch fader from a DJ's ±8% to half speed / one and a half,
     which is where a voice actually changes character. */
  document.querySelectorAll("[data-wide]").forEach(btn=>{
    btn.onclick = ()=>{
      const d = deckOf(btn, "data-wide");
      d.wide = !d.wide;
      const inp = document.querySelector('[data-speed="'+d.id+'"]');
      if(d.wide){ inp.min="0.5"; inp.max="1.5"; inp.step="0.01"; }
      else { inp.min="0.92"; inp.max="1.08"; inp.step="0.005"; d.pitch = Math.max(0.92, Math.min(1.08, d.pitch)); send(d, { t:"pitch", v:d.pitch }); fxSend(d); }
      inp.value = String(d.pitch);
      btn.classList.toggle("on", d.wide);
      const o=document.querySelector('[data-pitchout="'+d.id+'"]'); if(o) o.textContent = pitchText(d);
    };
  });
  document.querySelectorAll("[data-vol]").forEach(inp=>{
    inp.oninput = ()=>{ deckOf(inp, "data-vol").vol = +inp.value; setMix(); };
  });

  /* ── the hand on the record ──────────────────────────────────────────────
     Angle, not pixels. Where your finger is on the circle is where the groove
     is, so a half turn is 0.9 seconds of music whichever way you go, and how
     FAST you turn is the speed the needle reads at. */
  document.querySelectorAll(".platter").forEach(p=>{
    const d = ()=> decks.find(x=>x.id===p.getAttribute("data-deck"));
    let lastAng = 0, lastT = 0, spun = 0, trail = [];
    function angleOf(e){
      const r = p.getBoundingClientRect();
      return Math.atan2(e.clientY - (r.top + r.height/2), e.clientX - (r.left + r.width/2)) * 180/Math.PI;
    }
    p.onpointerdown = async (e)=>{
      const deck = d(); if(!deck || !deck.buf) return;
      e.preventDefault();
      try{ p.setPointerCapture(e.pointerId); }catch(err){}
      ctx(); await ensureNode(deck);
      lastAng = angleOf(e); lastT = performance.now();
      spun = 0; trail = [{ t:lastT, a:0 }];
      LX.flips[deck.id] = 0; deck._sgn = 0;
      deck.held = true; deck.lastMove = lastT;
      deck.handRate = deck.rate;                    /* you catch it at the speed it is turning */
      send(deck, { t:"hand", on:true, rate:deck.handRate });
    };
    p.onpointermove = (e)=>{
      const deck = d(); if(!deck || !deck.held) return;
      /* every pointer sample the browser collected since the last frame, not just
         the last one — a fast flick is 6 or 8 of these, and dropping them is what
         made quick scratches read as one long smear. */
      const pts = (e.getCoalescedEvents && e.getCoalescedEvents().length) ? e.getCoalescedEvents() : [e];
      for(let i=0;i<pts.length;i++){
        const ev = pts[i];
        const now = (ev.timeStamp && ev.timeStamp > 0) ? ev.timeStamp : performance.now();
        let a = angleOf(ev), da = a - lastAng;
        while(da > 180) da -= 360; while(da < -180) da += 360;   /* the short way round */
        lastAng = a; lastT = now; spun += da;
        trail.push({ t:now, a:spun });
      }
      /* the speed is measured over the last ~70 ms of hand, not over the last
         single event. Event to event, a slow steady pull is mostly jitter — and
         jitter is what made a held-back vocal warble instead of drag. */
      const now = performance.now();
      while(trail.length > 2 && now - trail[0].t > 70) trail.shift();
      const first = trail[0], last = trail[trail.length-1];
      const dt = Math.max(0.012, (last.t - first.t)/1000);
      const inst = ((last.a - first.a)/dt) / DEG_PER_SEC * TOUCH[touch];
      /* slow moves are smoothed harder than fast ones: steadiness where you want
         to hear words, immediacy where you want a cut. */
      const k = Math.abs(inst) < 0.6 ? 0.45 : 0.8;
      deck.handRate = deck.handRate*(1-k) + inst*k;
      if(Math.abs(deck.handRate) > 0.25){ const sg = deck.handRate > 0 ? 1 : -1; if(deck._sgn && sg !== deck._sgn) LX.flips[deck.id]++; deck._sgn = sg; }
      if(deck.handRate > 16) deck.handRate = 16;
      if(deck.handRate < -16) deck.handRate = -16;
      deck.lastMove = now;
      send(deck, { t:"hand", on:true, rate:deck.handRate });
    };
    const up = ()=>{
      const deck = d(); if(!deck || !deck.held) return;
      deck.held = false;
      send(deck, { t:"hand", on:false, rate:0 });               /* let go: the throw carries, the motor takes over */
    };
    p.onpointerup = up; p.onpointercancel = up; p.onlostpointercapture = up;
    /* the same deck from a keyboard: space starts and stops it, the arrows walk
       the needle a tenth of a second at a time. */
    p.onkeydown = async (e)=>{
      const deck = d(); if(!deck || !deck.buf) return;
      if(e.key === " " || e.key === "Enter"){
        e.preventDefault();
        if(deck.motor) stopDeck(deck); else await startDeck(deck);
      } else if(e.key === "ArrowLeft" || e.key === "ArrowRight"){
        e.preventDefault(); ctx(); await ensureNode(deck);
        const step = deck.buf.sampleRate * 0.1 * (e.key === "ArrowRight" ? 1 : -1);
        deck.pos = Math.max(0, Math.min(deck.buf.length - 3, deck.pos + step));
        send(deck, { t:"seek", v:deck.pos });
        drawWave(deck); drawZoom(deck); paintDeck(deck);
      }
    };
  });
}
function paintChrome(){
  document.getElementById("brand").textContent = t("app");
  document.getElementById("title").textContent = t("app");
  document.getElementById("eyebrow").textContent = t("eyebrow");
  document.getElementById("tag").textContent = t("tag");
  { const tl=document.getElementById("tagLong"); if(tl) tl.textContent = t("tagLong"); }
  document.getElementById("xfLabel").textContent = t("mix");
  document.getElementById("mixH").textContent = t("mixer");
  document.getElementById("padHint").textContent = t("padHint");
  document.getElementById("keysHint").textContent = t("keysHint");
  document.getElementById("curveBtn").textContent = t("curve")+": "+(curve==="sharp"?t("sharp"):t("smooth"));
  document.getElementById("noiseBtn").textContent = noiseOn ? t("noiseOn") : t("noiseOff");
  document.getElementById("touchBtn").textContent = touchLabel();
  const cap = document.getElementById("eqCap"); if(cap) cap.textContent = t("eqTitle");
  paintBench(); paintMade();
  document.getElementById("recHint").textContent = t("recHint");
  paintTape();
  document.getElementById("langBtn").textContent = S.lang==="es"?"EN":"ES";
  document.getElementById("themeBtn").textContent = S.theme==="dark"?t("light"):t("dark");
  document.getElementById("foot").innerHTML = `<p>${t("foot")}</p><p><a href="music-pads.html">${t("drums")}</a> · <a href="music-piano.html">Piano</a> · <a href="/science">${t("sci")}</a></p>`;
  document.documentElement.setAttribute("data-theme", S.theme);
  document.documentElement.classList.toggle("dark", S.theme==="dark");
}
document.getElementById("xf").oninput = ()=>{ setMix(); lessonXf(); };
/* ══ AOG-DECKS-KEYS-V1 (Jimmy, 2026-10-09: "I want the keyboard to be able to be used for all instruments in ways that
   make sense"). Two hands, two decks, as a DJ stands: the left hand plays the deck on the left, the right hand the deck on
   the right (on a phone, the deck on the screen answers both). Q start or stop, W cue (hold), E sync; A S D F and Z X C V
   are its eight pads. P, O and I, and H J K L and N M , . are the same for the right deck. ← and → move the crossfader.
   A key presses the very button a finger would, so CUE and the pads keep their hold, SLIP and Erase. ══ */
const DK_KEYS={KeyQ:["L","play"], KeyW:["L","cue"], KeyE:["L","sync"], KeyA:["L",0], KeyS:["L",1], KeyD:["L",2], KeyF:["L",3], KeyZ:["L",4], KeyX:["L",5], KeyC:["L",6], KeyV:["L",7],
  KeyP:["R","play"], KeyO:["R","cue"], KeyI:["R","sync"], KeyH:["R",0], KeyJ:["R",1], KeyK:["R",2], KeyL:["R",3], KeyN:["R",4], KeyM:["R",5], Comma:["R",6], Period:["R",7]};
const DK_HELD=new Map();
function dkShown(){
  return IDS.map(id=>document.getElementById("deck"+id)).filter(el=>el && el.getClientRects().length && el.getBoundingClientRect().width>0)
    .sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left).map(el=>el.id.slice(4));
}
function dkBtn(code){
  const m=DK_KEYS[code]; if(!m) return null; const sh=dkShown(); if(!sh.length) return null;
  const id=m[0]==="L" ? sh[0] : sh[sh.length-1];
  if(m[1]==="play"||m[1]==="cue"||m[1]==="sync") return document.querySelector(`[data-${m[1]}="${id}"]`);
  return document.querySelector(`[data-hot="${id}"][data-i="${m[1]}"]`);
}
function dkPress(btn, type){ btn.dispatchEvent(new KeyboardEvent(type, {key:" ", code:"Space", bubbles:true, cancelable:true})); }
document.addEventListener("keydown", e=>{
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  const el=e.target, tg=el && el.tagName;
  if(tg==="SELECT"||tg==="TEXTAREA"||(tg==="INPUT" && el.type!=="range")||(el && el.isContentEditable)) return;
  if(e.code==="ArrowLeft"||e.code==="ArrowRight"){
    if(tg==="INPUT") return;   /* a slider in hand moves itself */
    const xf=document.getElementById("xf"); if(!xf) return; e.preventDefault();
    xf.value=String(Math.max(0, Math.min(1, Math.round((+xf.value+(e.code==="ArrowLeft"?-0.1:0.1))*100)/100))); xf.oninput(); return;
  }
  const b=dkBtn(e.code); if(!b) return;
  e.preventDefault(); document.documentElement.classList.add("aog-keys");
  if(e.repeat||DK_HELD.has(e.code)) return;
  const m=DK_KEYS[e.code];
  if(m[1]==="play"||m[1]==="sync"){ b.click(); return; }
  DK_HELD.set(e.code, b); dkPress(b, "keydown");
});
document.addEventListener("keyup", e=>{ const b=DK_HELD.get(e.code); if(!b) return; DK_HELD.delete(e.code); dkPress(b, "keyup"); });
window.addEventListener("blur", ()=>{ DK_HELD.forEach(b=>dkPress(b, "keyup")); DK_HELD.clear(); });
document.getElementById("recBtn").onclick = recToggle;
document.getElementById("touchBtn").onclick = ()=>{
  touch = touch==="fine" ? "normal" : touch==="normal" ? "vinyl" : "fine";
  try{ localStorage.setItem("aog.decks.touch", touch); }catch(e){}
  paintChrome();
};
document.getElementById("curveBtn").onclick = ()=>{ curve = curve==="smooth"?"sharp":"smooth"; setMix(); paintChrome(); };
document.getElementById("noiseBtn").onclick = ()=>{
  noiseOn = !noiseOn;
  decks.forEach(d=>send(d, { t:"noise", v: noiseOn?0.5:0 }));
  paintChrome();
};
document.getElementById("langBtn").onclick = ()=>{ S.lang = S.lang==="en"?"es":"en"; try{localStorage.setItem("aog.lang", S.lang);}catch(e){} document.documentElement.lang = S.lang; paintChrome(); shell(); paintCrate(); paintBars(); paintLessons(); };
document.documentElement.lang = S.lang;
document.getElementById("themeBtn").onclick = ()=>{ S.theme = S.theme==="dark"?"light":"dark"; try{localStorage.setItem("aog.interior.ws.v1.theme", S.theme);}catch(e){} paintChrome(); };
document.addEventListener("visibilitychange", ()=>{
  if(document.hidden) decks.forEach(d=>{ if(d.motor) stopDeck(d); });
});
/* AOG-DECKS-SIMPLE-V1 — the bench switch and the phone's view menu */
(function(){
  let bench="simple", tab="A";
  try{ bench=localStorage.getItem("aog.decks.bench")||"simple"; }catch(e){}
  function paintSw(){
    document.body.classList.toggle("bench-simple", bench!=="full");
    document.querySelectorAll(".dmore").forEach(x=>{ x.open = bench==="full"; });   /* AOG-DJ-DESK-V1: the Full bench opens each deck's rest */
    document.body.setAttribute("data-decktab", tab);
    document.querySelectorAll("#benchSwitch [data-bench]").forEach(b=>{ const on=b.getAttribute("data-bench")===bench; b.classList.toggle("on",on); b.setAttribute("aria-pressed",on?"true":"false"); });
    document.querySelectorAll("[data-decktab]").forEach(b=>{ const on=b.getAttribute("data-decktab")===tab; b.classList.toggle("on",on); b.setAttribute("aria-pressed",on?"true":"false"); });
    const es=S.lang==="es";
    const L={navDecks:["Bench","Mesa"],navKit:["Drum kit","Batería"],navPads:["Drum machine","Caja de ritmos"],navPiano:["Piano","Piano"],navGuitar:["Guitar","Guitarra"],navBass:["Bass","Bajo"],navBand:["Band","Banda"],navDecksTool:["Turntables","Tocadiscos"],navStudio:["Mixing desk","Mesa de mezclas"],navGuide:["Picture guide","Guía en imágenes"],navTracks:["Track list","Lista de canciones"],benchLab:["Bench","Banco"],benchSimple:["Simple bench","Banco sencillo"],benchFull:["Full bench","Banco completo"],decktabA:["Deck A","Plato A"],decktabB:["Deck B","Plato B"],decktabC:["Deck C","Plato C"],decktabMix:["Mixer","Mezclador"]};
    Object.keys(L).forEach(id=>{ const e=document.getElementById(id); if(e) e.textContent=L[id][es?1:0]; });
    const SH={navGuide:["Guide","Guía"]};   /* AOG-BENCH-SHORT-V1: the short name a phone shows (the tools are in one menu: AOG-MUSIC-TOOLS-MENU-V1) */
    Object.keys(SH).forEach(id=>{ const e=document.getElementById(id); if(e) e.innerHTML=`<span class="lg">${L[id][es?1:0]}</span><span class="sh">${SH[id][es?1:0]}</span>`; });
    decks.forEach(d=>{ d.waveDirty = true; drawWave(d); drawZoom(d); });
  }
  document.querySelectorAll("#benchSwitch [data-bench]").forEach(b=>b.onclick=()=>{ bench=b.getAttribute("data-bench"); try{ localStorage.setItem("aog.decks.bench",bench); }catch(e){} paintSw(); });
  document.querySelectorAll("[data-decktab]").forEach(b=>b.onclick=()=>{ tab=b.getAttribute("data-decktab"); paintSw(); });
  const lb=document.getElementById("langBtn"); if(lb){ const o=lb.onclick; lb.onclick=function(){ if(o) o.apply(this,arguments); paintSw(); }; }
  paintSw();
  window.addEventListener("resize", ()=>{ decks.forEach(d=>{ d.waveDirty = true; drawWave(d); drawZoom(d); }); });
})();
/* ══ AOG-DECKS-LESSONS-V1 (2026-09-27) — SEVENTEEN LESSONS ON THE BENCH ═══════
   Jimmy: "The bench tools should have their own missions or lessons with
   worksheets or things to follow. The microscope and telescope already have
   things like this … the turntables … should all get about 17 lessons."
   The same ladder the microscope carries (STAIR): each lesson is two to four
   steps read off the decks' own state, ticked as the student does them, kept
   in localStorage. One drop-down picks the lesson (the site rule), and every
   lesson links to its worksheet on decks-lessons.html and back. ═══════════ */
const LESSONS = [
  {n:1, en:"Power and a record on A", es:"Encender y un disco en A", blurb_en:"Wake the decks and put your first record on.", blurb_es:"Despierta los platos y pon tu primer disco.", steps:["l1a","l1b","l1c"]},
  {n:2, en:"Play, stop, the platter", es:"Arrancar, parar, el plato", blurb_en:"Start the motor, watch the record turn, and stop it.", blurb_es:"Arranca el motor, mira girar el disco y páralo.", steps:["l2a","l2b","l2c"]},
  {n:3, en:"The crossfader", es:"El crossfader", blurb_en:"One slider chooses which deck the room hears.", blurb_es:"Un control elige qué plato oye la sala.", steps:["l3a","l3b","l3c"]},
  {n:4, en:"Cue a record on B", es:"Prepara un disco en B", blurb_en:"Load deck B and mark the spot you want to start from.", blurb_es:"Carga el plato B y marca el punto de inicio.", steps:["l4a","l4b","l4c"]},
  {n:5, en:"What BPM is", es:"Qué es el BPM", blurb_en:"Beats per minute: how fast a song walks.", blurb_es:"Pulsos por minuto: qué tan rápido camina una canción.", steps:["l5a","l5b","l5c"]},
  {n:6, en:"The pitch fader", es:"El fader de tono", blurb_en:"Push it and the song speeds up. Pull it and the song slows down.", blurb_es:"Súbelo y la canción acelera. Bájalo y frena.", steps:["l6a","l6b","l6c"]},
  {n:7, en:"Beatmatch by ear", es:"Igualar el ritmo de oído", blurb_en:"Make B walk at A's speed, no SYNC, within 2 BPM.", blurb_es:"Haz que B camine a la velocidad de A, sin SYNC, a menos de 2 BPM.", steps:["l7a","l7b","l7c"]},
  {n:8, en:"The EQ: bass swap", es:"El EQ: cambio de graves", blurb_en:"Two songs, one bass. Cut it on one deck and give it to the other.", blurb_es:"Dos canciones, un solo grave. Córtalo en un plato y dáselo al otro.", steps:["l8a","l8b","l8c"]},
  {n:9, en:"A clean blend", es:"Una mezcla limpia", blurb_en:"Slide from A to B so slowly that nobody notices the change.", blurb_es:"Pasa de A a B tan despacio que nadie note el cambio.", steps:["l9a","l9b","l9c"]},
  {n:10, en:"The cue point and the drop", es:"El punto de cue y la entrada", blurb_en:"Start B exactly on the one, from the mark you set.", blurb_es:"Arranca B justo en el uno, desde la marca que pusiste.", steps:["l10a","l10b","l10c"]},
  {n:11, en:"The baby scratch", es:"El scratch básico", blurb_en:"Push the record forward, pull it back, on the beat.", blurb_es:"Empuja el disco hacia adelante, tira hacia atrás, al ritmo.", steps:["l11a","l11b","l11c"]},
  {n:12, en:"The cut", es:"El corte", blurb_en:"Flick the crossfader open and shut, fast.", blurb_es:"Abre y cierra el crossfader rápido.", steps:["l12a","l12b","l12c"]},
  {n:13, en:"Phrasing: 8 bars, 16 bars", es:"Fraseo: 8 compases, 16", blurb_en:"Songs move in groups of 8 bars. Count them and you know what comes next.", blurb_es:"Las canciones van en grupos de 8 compases. Cuéntalos y sabrás qué sigue.", steps:["l13a","l13b","l13c"]},
  {n:14, en:"An intro, a build, a drop", es:"Intro, subida, entrada", blurb_en:"Close the filter, add echo, then open it all up on the one.", blurb_es:"Cierra el filtro, añade eco y ábrelo todo en el uno.", steps:["l14a","l14b","l14c"]},
  {n:15, en:"Plan a 3-song set", es:"Planea un set de 3 canciones", blurb_en:"Line up three songs in the crate and decide the order.", blurb_es:"Prepara tres canciones en la caja y decide el orden.", steps:["l15a","l15b","l15c"]},
  {n:16, en:"Perform the set", es:"Toca el set", blurb_en:"Press Record and play your three songs the way you planned.", blurb_es:"Pulsa Grabar y toca tus tres canciones como lo planeaste.", steps:["l16a","l16b","l16c"]},
  {n:17, en:"Record, save, hand it in", es:"Graba, guarda, entrega", blurb_en:"Save your take as a .wav and turn in this sheet.", blurb_es:"Guarda tu toma como .wav y entrega esta hoja.", steps:["l17a","l17b","l17c"]}
];
const LSTEP = {
  l1a:{en:"Tap Load a song on deck A",es:"Toca Cargar una canción en el plato A"},
  l1b:{en:"Put a record on deck A",es:"Pon un disco en el plato A"},
  l1c:{en:"Turn the platter with your hand",es:"Gira el plato con la mano"},
  l2a:{en:"Press Start on A",es:"Pulsa Arrancar en A"},
  l2b:{en:"Let it spin for 3 seconds",es:"Déjalo girar 3 segundos"},
  l2c:{en:"Press Stop",es:"Pulsa Parar"},
  l3a:{en:"Slide the crossfader all the way to A",es:"Lleva el crossfader hasta A"},
  l3b:{en:"Slide it to the middle",es:"Ponlo en el medio"},
  l3c:{en:"Slide it all the way to B",es:"Llévalo hasta B"},
  l4a:{en:"Put a record on deck B",es:"Pon un disco en el plato B"},
  l4b:{en:"Move the needle, then press Set cue on B",es:"Mueve la aguja y pulsa Marcar cue en B"},
  l4c:{en:"Hold CUE on B, then let go",es:"Mantén CUE en B y suelta"},
  l5a:{en:"Start A and read its BPM",es:"Arranca A y lee su BPM"},
  l5b:{en:"Start B and read its BPM",es:"Arranca B y lee su BPM"},
  l5c:{en:"Tap TAP four times with A's beat",es:"Toca TAP cuatro veces con el pulso de A"},
  l6a:{en:"Push A's pitch up",es:"Sube el tono de A"},
  l6b:{en:"Pull it down below 0",es:"Bájalo por debajo de 0"},
  l6c:{en:"Put it back at 0",es:"Déjalo otra vez en 0"},
  l7a:{en:"Start both decks",es:"Arranca los dos platos"},
  l7b:{en:"SYNC off on both",es:"SYNC apagado en los dos"},
  l7c:{en:"Move B's pitch until it is within 2 BPM of A",es:"Mueve el tono de B hasta quedar a menos de 2 BPM de A"},
  l8a:{en:"Switch to the Full bench",es:"Cambia al Banco completo"},
  l8b:{en:"Cut the bass on B (KILL LOW)",es:"Corta los graves de B (CORTA GRAVES)"},
  l8c:{en:"Bring B's bass back and cut A's",es:"Devuelve los graves de B y corta los de A"},
  l9a:{en:"Set the fader to Blend",es:"Pon el fader en Mezcla"},
  l9b:{en:"Both decks playing, fader on A",es:"Los dos platos sonando, fader en A"},
  l9c:{en:"Slide from A to B slowly, 4 seconds or more",es:"Pasa de A a B despacio, 4 segundos o más"},
  l10a:{en:"Set a cue on B where the beat comes in",es:"Marca un cue en B donde entra el ritmo"},
  l10b:{en:"Hold CUE to hear it, then let go",es:"Mantén CUE para oírlo y suelta"},
  l10c:{en:"With A playing, start B from its cue",es:"Con A sonando, arranca B desde su cue"},
  l11a:{en:"Crossfader in the middle",es:"Crossfader en el medio"},
  l11b:{en:"Hold the record on A: it goes quiet",es:"Sujeta el disco en A: se calla"},
  l11c:{en:"Push forward, pull back, push forward",es:"Empuja, tira, empuja"},
  l12a:{en:"Set the fader to Cut",es:"Pon el fader en Corte"},
  l12b:{en:"Both playing, fader on A",es:"Los dos sonando, fader en A"},
  l12c:{en:"Flick the fader to B and straight back",es:"Lleva el fader a B y vuelve de golpe"},
  l13a:{en:"Start A and count 8 bars",es:"Arranca A y cuenta 8 compases"},
  l13b:{en:"Keep counting to 16 bars",es:"Sigue contando hasta 16"},
  l13c:{en:"Press the 4-bar loop on A",es:"Pulsa el bucle de 4 compases en A"},
  l14a:{en:"Close A's filter down (slide left)",es:"Cierra el filtro de A (desliza a la izquierda)"},
  l14b:{en:"Turn A's echo up",es:"Sube el eco de A"},
  l14c:{en:"Open the filter and cut the echo on the one",es:"Abre el filtro y quita el eco en el uno"},
  l15a:{en:"Put 3 songs in Up next",es:"Pon 3 canciones en Lo que sigue"},
  l15b:{en:"Send the first one to a deck from the crate",es:"Manda la primera a un plato desde la caja"},
  l15c:{en:"A record on both decks",es:"Un disco en cada plato"},
  l16a:{en:"Press Record",es:"Pulsa Grabar"},
  l16b:{en:"Blend from one deck to the other while recording",es:"Mezcla de un plato al otro mientras grabas"},
  l16c:{en:"Keep the set going for 2 minutes",es:"Mantén el set 2 minutos"},
  l17a:{en:"Stop recording: a take appears",es:"Para la grabación: aparece una toma"},
  l17b:{en:"Save the take as .wav",es:"Guarda la toma como .wav"},
  l17c:{en:"Open the worksheet and tap FINISHED",es:"Abre la hoja y toca FINISHED"}
};
const LKEY = "aog.decks.lessons.v1";
const LX = { dockA:false, setcue:{}, cueHeld:{}, transits:[], side:"", leftAt:0, from:"", crateTake:false, saved:false,
             flips:{A:0,B:0,C:0}, filt:{A:0,B:0,C:0}, echo:{A:0,B:0,C:0}, startPos:{}, lastTick:0, sig:"" };
S.lessons = {}; S.lessonSel = -1;
try{ const raw = JSON.parse(localStorage.getItem(LKEY) || "null"); if(raw){ S.lessons = raw.done || {}; if(raw.sel >= 0) S.lessonSel = raw.sel; } }catch(e){}
try{ const m = /[?&]lesson=(\d+)/.exec(location.search || ""); if(m) S.lessonSel = Math.max(0, Math.min(LESSONS.length-1, +m[1]-1)); }catch(e){}
function lessonsSave(){ try{ localStorage.setItem(LKEY, JSON.stringify({ done:S.lessons, sel:S.lessonSel })); }catch(e){} }
function lessonDone(i){ return LESSONS[i].steps.every(id=>S.lessons[id]); }
function lessonNow(){ for(let i=0;i<LESSONS.length;i++) if(!lessonDone(i)) return i; return LESSONS.length; }
function lessonCur(){ return S.lessonSel >= 0 ? S.lessonSel : Math.min(lessonNow(), LESSONS.length-1); }
function xfNow(){ const x = document.getElementById("xf"); return x ? +x.value : 0.5; }
function barsOn(d){ /* bars this deck has played without a stop, at its own tempo */
  if(!d.motor || !d.buf || !d._onAt || effBpm(d) <= 0) return 0;
  return ((performance.now() - d._onAt)/1000) / (240/effBpm(d));
}
function secsOn(d){ return (d.motor && d._onAt) ? (performance.now() - d._onAt)/1000 : 0; }
function transit(test){ return LX.transits.some(test); }
/* the crossfader's journeys: from one side to the other, how long it took, and
   whether the tape was rolling. A blend is a slow one; a cut is a fast one. */
function lessonXf(){
  const v = xfNow(), now = performance.now();
  const side = v < 0.1 ? "A" : v > 0.9 ? "B" : "";
  if(side && LX.side !== side){
    if(LX.from && LX.from !== side && LX.leftAt) LX.transits.push({ from:LX.from, to:side, dur:now-LX.leftAt, at:now, rec:TAPE.on });
    if(LX.transits.length > 12) LX.transits.shift();
    LX.side = side; LX.from = side; LX.leftAt = 0;
  } else if(!side && LX.side){ LX.leftAt = now; LX.side = ""; }
}
const A = ()=>decks[0], B = ()=>decks[1];
const LCHK = {
  l1a:()=>LX.dockA, l1b:()=>!!A().buf, l1c:()=>A().held,
  l2a:()=>A().motor, l2b:()=>secsOn(A()) >= 3, l2c:()=>!A().motor,
  l3a:()=>xfNow() <= 0.05, l3b:()=>{ const v=xfNow(); return v >= 0.44 && v <= 0.56; }, l3c:()=>xfNow() >= 0.95,
  l4a:()=>!!B().buf, l4b:()=>LX.setcue.B && B().buf && B().cue > B().buf.sampleRate*0.5, l4c:()=>LX.cueHeld.B,
  l5a:()=>A().motor && A().bpm > 0, l5b:()=>B().motor && B().bpm > 0, l5c:()=>A().taps.length >= 4,
  l6a:()=>A().pitch >= 1.02, l6b:()=>A().pitch <= 0.98, l6c:()=>Math.abs(A().pitch-1) < 0.003,
  l7a:()=>A().motor && B().motor && A().bpm > 0 && B().bpm > 0, l7b:()=>!A().syncLock && !B().syncLock,
  l7c:()=>A().motor && B().motor && !A().syncLock && !B().syncLock && Math.abs(effBpm(A())-effBpm(B())) <= 2,
  l8a:()=>!document.body.classList.contains("bench-simple"), l8b:()=>!!(B().eq && B().eq.killed("low")),
  l8c:()=>!!(A().eq && A().eq.killed("low") && B().eq && !B().eq.killed("low")),
  l9a:()=>curve === "smooth", l9b:()=>A().motor && B().motor && xfNow() < 0.1,
  l9c:()=>transit(t=>t.from === "A" && t.to === "B" && t.dur >= 4000),
  l10a:()=>B().buf && B().cue > B().buf.sampleRate, l10b:()=>LX.cueHeld.B,
  l10c:()=>A().motor && B().motor && B().buf && B().cue > B().buf.sampleRate && Math.abs((LX.startPos.B||0) - B().cue) < B().buf.sampleRate*0.5,
  l11a:()=>{ const v=xfNow(); return v >= 0.35 && v <= 0.65; }, l11b:()=>A().held, l11c:()=>LX.flips.A >= 2,
  l12a:()=>curve === "sharp", l12b:()=>A().motor && B().motor && xfNow() < 0.1,
  l12c:()=>{ const q = LX.transits.filter(t=>t.dur <= 450); return q.length >= 2 && (q[q.length-1].at - q[q.length-2].at) <= 3000; },
  l13a:()=>barsOn(A()) >= 8, l13b:()=>barsOn(A()) >= 16, l13c:()=>A().loopOn && A().loopBeats === 16,
  l14a:()=>LX.filt.A <= -0.4, l14b:()=>LX.echo.A >= 0.3, l14c:()=>Math.abs(LX.filt.A) < 0.05 && LX.echo.A < 0.05,
  l15a:()=>CRATE.next.length >= 3, l15b:()=>LX.crateTake, l15c:()=>!!(A().buf && B().buf),
  l16a:()=>TAPE.on, l16b:()=>transit(t=>t.rec), l16c:()=>TAPE.on && (performance.now()-TAPE.t0)/1000 >= 120,
  l17a:()=>TAPE.takes.length > 0, l17b:()=>LX.saved,
  l17c:()=>{ try{ return localStorage.getItem("aog.decks.lessons.handin") === "1"; }catch(e){ return false; } }
};
/* every ~150 ms: the steps of the lesson on screen, in order — a step only
   counts once the one before it is done, so "put it back at 0" cannot tick
   before the fader has moved. */
function tickLessons(){
  const now = performance.now();
  decks.forEach(d=>{ if(d.motor && !d.held){ if(!d._onAt) d._onAt = now; } else d._onAt = 0; });
  if(now - LX.lastTick < 150) return;
  LX.lastTick = now;
  const m = LESSONS[lessonCur()]; if(!m) return;
  let changed = false;
  for(const id of m.steps){
    if(S.lessons[id]) continue;
    let ok = false; try{ ok = !!LCHK[id](); }catch(e){}
    if(ok){ S.lessons[id] = true; changed = true; }
    break;
  }
  if(changed){ lessonsSave(); paintLessons(); }
}
function lessonsT(en, es){ return S.lang === "es" ? es : en; }
function paintLessons(){
  const box = document.getElementById("lessons"); if(!box) return;
  const es = S.lang === "es", cur = lessonCur(), m = LESSONS[cur], total = LESSONS.length;
  const doneN = LESSONS.filter((x,i)=>lessonDone(i)).length, all = doneN >= total;
  const row = document.getElementById("lessonRow");
  const rowHtml = LESSONS.map((x,i)=>`<button type="button" class="ghost sm${i===cur?" on":""}" data-lesson="${i}" aria-pressed="${i===cur}">${i+1}${lessonDone(i)?" ✓":""} · ${es?x.es:x.en}</button>`).join("");
  if(row.__html !== rowHtml){ row.innerHTML = rowHtml; row.__html = rowHtml;
    row.querySelectorAll("[data-lesson]").forEach(b=>{ b.onclick = ()=>{ S.lessonSel = +b.getAttribute("data-lesson"); lessonsSave(); paintLessons(); }; }); }
  document.getElementById("lKick").textContent = lessonsT("Lessons", "Lecciones") + " · " + doneN + "/" + total;
  const sheet = document.getElementById("lSheet");
  sheet.href = "decks-lessons.html#l" + (cur+1);
  sheet.textContent = lessonsT("Worksheet", "Hoja de trabajo") + " " + (cur+1);
  const steps = m.steps.map(id=>`<li class="lstep${S.lessons[id]?" ok":""}"><span class="lck" aria-hidden="true">${S.lessons[id]?"✓":""}</span><span>${es?LSTEP[id].es:LSTEP[id].en}</span></li>`).join("");
  const done = lessonDone(cur);
  const next = cur+1 < total ? `<button type="button" class="pill" id="lNext">${lessonsT("Next lesson", "Siguiente lección")} →</button>` : "";
  document.getElementById("lessonBody").innerHTML =
    `<p class="mk">${lessonsT("Lesson", "Lección")} ${cur+1} ${lessonsT("of", "de")} ${total}${done?" · ✓":""}</p>
     <h3>${es?m.es:m.en}</h3>
     <p class="lblurb">${es?m.blurb_es:m.blurb_en}</p>
     <ol class="lsteps">${steps}</ol>
     ${done ? `<p class="lok">${all ? lessonsT("All seventeen done. You can run a set.", "Las diecisiete hechas. Ya puedes tocar un set.") : lessonsT("Lesson done.", "Lección hecha.")} ${next}</p>` : ""}`;
  const nb = document.getElementById("lNext"); if(nb) nb.onclick = ()=>{ S.lessonSel = cur+1; lessonsSave(); paintLessons(); };
}
setPair(PAIR, true); paintChrome(); shell(); paintLessons(); requestAnimationFrame(loop);
checkBench();
crateOpen();
try{ AOGHandoff.listen(function(key){ if(SHELF.some(s=>s.key===key)) checkBench(); }); }catch(e){}
window.addEventListener("focus", checkBench);
