"use strict";
/* ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   AOG-DESK-MORE-V1 (2026-10-11) — the Mixing Desk (music-studio.html), Jimmy's picks 2, 3, 9, 11 and 12:
   2  · Effect slots on every track (AOG-DESK-FX-V1): three slots, each Empty or a Compressor, a Sweep EQ, Tape warmth,
        a Chorus, a Filter, a Doubler or a De-esser, with their own knobs, On/Off and their order. They sit in the
        track's strip after its Low, Middle, High and Punch and before the drawn Filter, the drawn volume and the fader:
        the effects hear the track as it has been shaped (as an insert on a console comes after the channel's EQ and
        dynamics), and the fader, a drawn fade and the Room and Echo sends come after them, so turning a track down never
        changes how hard its compressor or its tape warmth works, and the Room and Echo hear the effect. The same chain
        is built for the speakers and for every bounce (the mix, Send it out, the stems, My Track's backing). Empty or
        Off, the track's sound goes straight on, bit for bit as before. A compressor (and the De-esser's) holds its sound
        back 6 ms, as Punch, Glue and the limiter do; the other tracks wait as long (delay compensation), so nothing
        drifts apart.
   3  · The Echo in beats: the time is in music-studio.html (echoTime, ECHO_T); its menu is under the whole song's knobs.
   9  · Takes (AOG-DESK-TAKES-V1): a track holds more than one take of a part; each take has a lane under the track; a tap
        on a bar, or a drag along a lane, chooses that take there (Snap to the beat: on a beat; off: just where it is let
        go), with an equal-power crossfade of 10 ms at each switch. Saved, undoable, the same live and in a bounce.
   11 · Sections (AOG-DESK-SECTIONS-V1): Intro, Verse, Chorus … marked under the ruler, their edges dragged (on a bar),
        Copy this section to the end or after itself (every track's pieces, takes and drawn lines in it; what comes after
        moves along), and a clipboard for pieces (Copy, Cut, Paste on any track at the playhead or a bar).
   12 · Quick edits: Split at the playhead, Reverse a piece (AOG-DESK-REVERSE-V1), Pitch ±12 semitones keeping the speed
        (AOG-DESK-PITCH-V1, in music-studio.html), a name and a colour for each track (AOG-DESK-LOOK-V1), versions of a song
        with A/B (AOG-DESK-VERSIONS-V1), and Undo for mixer moves (AOG-DESK-MIXUNDO-V1).
   2b · (Jimmy's 4 and 6, the same slots) Duck under another track (AOG-DESK-DUCK-V1): sidechain ducking, the pad dips
        under the kick; Tune the voice (AOG-DESK-TUNE-V1): gentle pitch correction toward the song's key, made once on the
        recording itself and kept (YIN, then resampling and the desk's WSOLA), so the speakers and every bounce hear it.
   This file is loaded before the desk's own code; every name here begins with dm or DM_, and the desk calls it.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const DM_STR={
  /* the voice: Record again keeps the take you had (AOG-DESK-TAKES-V1) */
  voiceReplace:{en:"Recording again keeps this take too, as a take lane under the track, so you can choose the best bits.",es:"Grabar otra vez también conserva esta toma, como una franja bajo la pista, para que elijas lo mejor de cada una."},
  /* AOG-DESK-ECHO-SYNC-V1 */
  etLab:{en:"Echo time",es:"Tiempo del eco"},
  et_q:{en:"1/4 · one beat",es:"1/4 · un pulso"}, et_e:{en:"1/8 · half a beat",es:"1/8 · medio pulso"},
  et_d8:{en:"Dotted 1/8 · three quarters of a beat",es:"1/8 con puntillo · tres cuartos de pulso"},
  et_t8:{en:"1/8 triplet · a third of a beat",es:"Tresillo de 1/8 · un tercio de pulso"}, et_s:{en:"1/16 · a quarter of a beat",es:"1/16 · un cuarto de pulso"},
  /* more for this track */
  mtLab:{en:"More for track {n}",es:"Más para la pista {n}"}, mtClosed:{en:"Closed",es:"Cerrado"},
  mtFx0:{en:"Effects",es:"Efectos"}, mtFx1:{en:"Effects · 1 on",es:"Efectos · 1 encendido"}, mtFxN:{en:"Effects · {n} on",es:"Efectos · {n} encendidos"},
  mtTk:{en:"Takes · {n}",es:"Tomas · {n}"}, mtLook:{en:"Name and colour",es:"Nombre y color"},
  /* AOG-DESK-FX-V1 */
  fxHint:{en:"The sound goes through the slots from top to bottom, after the track's Low, Middle, High and Punch, and before its volume.",
    es:"El sonido pasa por los espacios de arriba abajo, después de Graves, Medios, Agudos y Pegada, y antes del volumen."},
  slotN:{en:"Slot {n}",es:"Espacio {n}"}, fxEmpty:{en:"Empty",es:"Vacío"},
  fx_comp:{en:"Compressor",es:"Compresor"}, fx_eq:{en:"Sweep EQ",es:"Ecualizador de barrido"}, fx_tape:{en:"Tape warmth",es:"Calidez de cinta"},
  fx_chorus:{en:"Chorus",es:"Chorus"}, fx_filter:{en:"Filter",es:"Filtro"}, fx_dbl:{en:"Doubler",es:"Doblador"}, fx_dess:{en:"De-esser (for a voice)",es:"Quita eses (para la voz)"},
  fxOn:{en:"On",es:"Encendido"}, fxOff:{en:"Off",es:"Apagado"}, fxOnAria:{en:"Slot {n} on",es:"Espacio {n} encendido"},
  fxUp:{en:"Move up",es:"Subir"}, fxDown:{en:"Move down",es:"Bajar"},
  fxUpAria:{en:"Move slot {n} up",es:"Subir el espacio {n}"}, fxDownAria:{en:"Move slot {n} down",es:"Bajar el espacio {n}"},
  k_thr:{en:"Starts at",es:"Empieza en"}, k_ratio:{en:"Strength",es:"Fuerza"}, k_atk:{en:"Grabs in",es:"Actúa en"}, k_rel:{en:"Lets go in",es:"Suelta en"}, k_mk:{en:"Turn up after",es:"Subir después"},
  k_f1:{en:"Band 1 · where",es:"Banda 1 · dónde"}, k_g1:{en:"Band 1 · up or down",es:"Banda 1 · subir o bajar"}, k_w1:{en:"Band 1 · width",es:"Banda 1 · ancho"},
  k_f2:{en:"Band 2 · where",es:"Banda 2 · dónde"}, k_g2:{en:"Band 2 · up or down",es:"Banda 2 · subir o bajar"}, k_w2:{en:"Band 2 · width",es:"Banda 2 · ancho"},
  k_drive:{en:"Warmth",es:"Calidez"}, k_lvl:{en:"Level",es:"Nivel"},
  k_rate:{en:"Speed",es:"Velocidad"}, k_depth:{en:"Depth",es:"Profundidad"}, k_mix:{en:"Mix",es:"Mezcla"},
  k_typ:{en:"Cuts",es:"Corta"}, typ_lp:{en:"the highs (low-pass)",es:"los agudos (pasa bajos)"}, typ_hp:{en:"the lows (high-pass)",es:"los graves (pasa altos)"},
  k_f:{en:"Where",es:"Dónde"}, k_res:{en:"Ring",es:"Resonancia"}, k_amt:{en:"Amount",es:"Cantidad"}, k_time:{en:"Spread",es:"Separación"},
  oct1:{en:"1 octave",es:"1 octava"}, octN:{en:"{n} octaves",es:"{n} octavas"},
  grNow:{en:"Holding back now: {n} dB",es:"Reduciendo ahora: {n} dB"}, grRest:{en:"Holding back now: —",es:"Reduciendo ahora: —"},
  /* AOG-DESK-DUCK-V1 and AOG-DESK-TUNE-V1 (Jimmy's 4 and 6) */
  fx_duck:{en:"Duck under another track",es:"Bajar bajo otra pista"}, fx_tune:{en:"Tune the voice",es:"Afinar la voz"},
  k_key:{en:"Listens to",es:"Escucha a"}, keyNone:{en:"Pick a track",es:"Elige una pista"},
  duckHint:{en:"This track dips each time the track it listens to plays, as dance music does under the kick.",es:"Esta pista baja cada vez que suena la pista que escucha, como hace la música de baile bajo el bombo."},
  k_spd:{en:"Speed",es:"Rapidez"}, spdNat:{en:"natural",es:"natural"}, spdMid:{en:"medium",es:"media"}, spdFast:{en:"fast",es:"rápida"},
  tuneHint:{en:"It tunes the recording itself toward {key}, before the track's strip.",es:"Afina la grabación misma hacia {key}, antes del canal de la pista."},
  tuneKey:{en:"the song's key, {n}",es:"la tonalidad de la canción, {n}"}, tuneNoKey:{en:"the nearest note (the song has no key yet)",es:"la nota más cercana (la canción aún no tiene tonalidad)"},
  keyMaj:{en:"{n} major",es:"{n} mayor"}, keyMin:{en:"{n} minor",es:"{n} menor"},
  tuning:{en:"Tuning your voice…",es:"Afinando tu voz…"}, tuned:{en:"Your voice is tuned.",es:"Tu voz está afinada."},
  /* AOG-DESK-TAKES-V1 */
  takeBtn:{en:"Add as another take",es:"Añadir como otra toma"},
  takeAdded:{en:"Take {n} is on track {k} and plays now. Tap a take's lane to choose.",es:"La toma {n} está en la pista {k} y suena ahora. Toca la franja de una toma para elegir."},
  takeLane:{en:"Take {n}",es:"Toma {n}"},
  takeLaneAria:{en:"Take {n} on track {k}. Tap a bar to use this take there, or drag along it.",es:"Toma {n} en la pista {k}. Toca un compás para usar esta toma ahí, o arrastra a lo largo."},
  takeChose:{en:"Take {n} plays {where}.",es:"La toma {n} suena en {where}."},
  tkBar1:{en:"bar {a}",es:"el compás {a}"}, tkBars:{en:"bars {a} to {b}",es:"los compases {a} a {b}"},
  tkNowhere:{en:"not chosen anywhere yet",es:"aún sin elegir"}, tkPlays:{en:"plays {list}",es:"suena en {list}"},
  tkHas:{en:"This track has {n} takes. Tap a bar on a take's lane to use it there, or drag along it.",es:"Esta pista tiene {n} tomas. Toca un compás en la franja de una toma para usarla ahí, o arrastra a lo largo."},
  tkOne:{en:"This track has one take. Record the same part again in its room and send it here, then press Add as another take. On track 8, Record again keeps the take you had.",
    es:"Esta pista tiene una toma. Graba la misma parte otra vez en su sala, envíala aquí y pulsa Añadir como otra toma. En la pista 8, Grabar otra vez conserva la toma que tenías."},
  tkUse:{en:"Use",es:"Usar"}, tkFrom:{en:"From bar",es:"Desde el compás"}, tkTo:{en:"To bar",es:"Hasta el compás"}, tkUseBtn:{en:"Use it there",es:"Usarla ahí"},
  tkRm:{en:"Remove take {n}",es:"Quitar la toma {n}"}, tkRmd:{en:"Take {n} is removed. Undo brings it back.",es:"La toma {n} se quitó. Deshacer la trae de vuelta."},
  tkShow:{en:"Show the take lanes",es:"Mostrar las franjas de tomas"},
  tkFull:{en:"A track keeps 8 takes. The oldest went to make room.",es:"Una pista guarda 8 tomas. La más antigua se fue para hacer lugar."},
  /* AOG-DESK-SECTIONS-V1 */
  secLab:{en:"Song sections",es:"Secciones de la canción"}, secNone:{en:"No sections yet",es:"Aún no hay secciones"}, secPick:{en:"Pick a section",es:"Elige una sección"},
  secNew:{en:"+ Mark a section",es:"+ Marcar una sección"}, secRowLab:{en:"Sections",es:"Secciones"},
  sec_intro:{en:"Intro",es:"Intro"}, sec_verse:{en:"Verse",es:"Estrofa"}, sec_chorus:{en:"Chorus",es:"Estribillo"}, sec_bridge:{en:"Bridge",es:"Puente"},
  sec_solo:{en:"Solo",es:"Solo"}, sec_outro:{en:"Outro",es:"Final"}, sec_own:{en:"Your own words…",es:"Tus propias palabras…"},
  secName:{en:"Name",es:"Nombre"}, secWords:{en:"Your words",es:"Tus palabras"},
  secEnd:{en:"Copy this section to the end",es:"Copiar esta sección al final"}, secAfter:{en:"Copy this section after itself",es:"Copiar esta sección después de sí misma"},
  secDel:{en:"Remove this section",es:"Quitar esta sección"},
  secOpt:{en:"{name} · bars {a} to {b}",es:"{name} · compases {a} a {b}"}, secAria:{en:"{name}, bars {a} to {b}",es:"{name}, compases {a} a {b}"},
  secEdgeA:{en:"Start of {name}",es:"Inicio de {name}"}, secEdgeB:{en:"End of {name}",es:"Final de {name}"},
  secMade:{en:"{name} is marked: bars {a} to {b}. Drag its edges under the ruler to change it.",es:"{name} está marcada: compases {a} a {b}. Arrastra sus bordes bajo la regla para cambiarla."},
  secCopied:{en:"{name} plays again from bar {a}. What came after it moved {n} bars later.",es:"{name} suena otra vez desde el compás {a}. Lo que venía después se movió {n} compases."},
  secAtEnd:{en:"A copy of {name} is at the end, from bar {a}.",es:"Una copia de {name} está al final, desde el compás {a}."},
  secNoRoom:{en:"There is no room for that: a song can be up to 128 bars.",es:"No hay lugar para eso: una canción puede tener hasta 128 compases."},
  secTooMany:{en:"Track {n} has too many pieces to copy that.",es:"La pista {n} tiene demasiadas partes para copiar eso."},
  secGone:{en:"Section removed. The music stays.",es:"Sección quitada. La música se queda."},
  secEdge:{en:"{name} is now bars {a} to {b}.",es:"{name} ahora va de los compases {a} a {b}."},
  /* quick edits on a piece */
  splitBtn:{en:"Split at the playhead",es:"Dividir en el cabezal"},
  splitDone:{en:"Split at {w}. Now there are {n} pieces.",es:"Dividida en {w}. Ahora hay {n} partes."},
  splitNone:{en:"The playhead is not on a piece of this track. Pick Start at bar, or play the song, then split.",es:"El cabezal no está sobre una parte de esta pista. Elige Empezar en el compás o toca la canción, y luego divide."},
  splitEdge:{en:"That is too close to the edge of the piece to split it.",es:"Eso está muy cerca del borde de la parte para dividirla."},
  revBtn:{en:"Reverse this piece",es:"Invertir esta parte"},
  revOn:{en:"Piece {n} plays backwards.",es:"La parte {n} suena al revés."}, revOff:{en:"Piece {n} plays forwards again.",es:"La parte {n} suena hacia adelante otra vez."},
  cCopy:{en:"Copy to the clipboard",es:"Copiar al portapapeles"}, cCut:{en:"Cut to the clipboard",es:"Cortar al portapapeles"},
  cCopied:{en:"Piece {n} is on the clipboard. Pick a track, then Paste.",es:"La parte {n} está en el portapapeles. Elige una pista y luego Pegar."},
  cCutDone:{en:"Piece {n} is cut to the clipboard. Undo brings it back.",es:"La parte {n} se cortó al portapapeles. Deshacer la trae de vuelta."},
  cOn:{en:"On the clipboard: {name}, piece {n}, {len}.",es:"En el portapapeles: {name}, parte {n}, {len}."},
  cAt:{en:"Paste on track {n} at",es:"Pegar en la pista {n} en"}, cPh:{en:"Where the playhead is · {w}",es:"Donde está el cabezal · {w}"},
  cPaste:{en:"Paste",es:"Pegar"}, cPasted:{en:"Pasted on track {n} at {w}.",es:"Pegado en la pista {n} en {w}."},
  cOther:{en:"Track {n} holds another recording. Paste on an empty track, or on the track the piece came from.",es:"La pista {n} tiene otra grabación. Pega en una pista vacía o en la pista de donde vino la parte."},
  cEmpty:{en:"Empty the clipboard",es:"Vaciar el portapapeles"},
  pitLab:{en:"Pitch (the speed stays)",es:"Tono (la velocidad se queda)"}, pit0:{en:"As recorded",es:"Como se grabó"},
  pitUp1:{en:"+1 semitone · higher",es:"+1 semitono · más agudo"}, pitUp:{en:"+{n} semitones · higher",es:"+{n} semitonos · más agudo"},
  pitDn1:{en:"−1 semitone · lower",es:"−1 semitono · más grave"}, pitDn:{en:"−{n} semitones · lower",es:"−{n} semitonos · más grave"},
  pitAria:{en:"Pitch of track {n}",es:"Tono de la pista {n}"},
  /* AOG-DESK-LOOK-V1 */
  lkName:{en:"Track name",es:"Nombre de la pista"}, lkCol:{en:"Colour",es:"Color"},
  /* AOG-DESK-VERSIONS-V1 */
  verH:{en:"Versions of this song",es:"Versiones de esta canción"},
  verLine:{en:"Save a version before a big change. Open one later, or play two and switch between them. They stay on this device.",es:"Guarda una versión antes de un cambio grande. Ábrela después, o toca dos y cambia entre ellas. Se quedan en este aparato."},
  verName:{en:"Version name",es:"Nombre de la versión"}, verSave:{en:"Save this version",es:"Guardar esta versión"}, verDefault:{en:"Version {n}",es:"Versión {n}"},
  verSaved:{en:"Saved on this device: {name}.",es:"Guardada en este aparato: {name}."}, verNone:{en:"No versions yet.",es:"Aún no hay versiones."},
  verList:{en:"Saved versions",es:"Versiones guardadas"}, verCmp:{en:"Compare with your song now",es:"Comparar con tu canción de ahora"},
  verA:{en:"A · Your song now",es:"A · Tu canción de ahora"}, verB:{en:"B · {name}",es:"B · {name}"}, verStop:{en:"Stop comparing",es:"Dejar de comparar"},
  verCmpOn:{en:"Press A or B to switch. The song carries on from the same spot.",es:"Pulsa A o B para cambiar. La canción sigue desde el mismo lugar."},
  verAskOpen:{en:"Open {name}? It takes the place of the song on the desk now. To keep that one, save it as a version first.",es:"¿Abrir {name}? Toma el lugar de la canción que está en la mesa. Para conservarla, guárdala primero como versión."},
  verAskDel:{en:"Remove {name} from the versions? The song on the desk stays as it is.",es:"¿Quitar {name} de las versiones? La canción en la mesa se queda como está."},
  verRemoved:{en:"{name} is out of the versions.",es:"{name} ya no está en las versiones."},
  verLost:{en:"Some sounds of that version were not found, so those tracks are empty.",es:"No se encontraron algunos sonidos de esa versión, así que esas pistas quedaron vacías."}
};
/* the palette: calm, light colours that read on the dark console (the first eight are the tracks' own) */
const DM_PAL={gold:{c:"#f0c26e",en:"Gold",es:"Dorado"}, sage:{c:"#9fd4a0",en:"Sage",es:"Salvia"}, coral:{c:"#f4a37a",en:"Coral",es:"Coral"}, sky:{c:"#7fc7f5",en:"Sky",es:"Cielo"},
  orchid:{c:"#e6a3d8",en:"Orchid",es:"Orquídea"}, lilac:{c:"#c9b8f0",en:"Lilac",es:"Lila"}, mint:{c:"#a8e0d8",en:"Mint",es:"Menta"}, sand:{c:"#f2d79a",en:"Sand",es:"Arena"},
  rose:{c:"#eeb0b4",en:"Rose",es:"Rosa"}, ice:{c:"#b8d8f8",en:"Ice",es:"Hielo"}};
const DM_PAL_KEYS=Object.keys(DM_PAL);
const DM_MAX_TAKES=7;              /* takes kept besides the one in its place: 8 in all */
const DM_NSLOT=3, DM_XF=0.01;     /* three slots a track; a 10 ms crossfade where the chosen take changes */
const DM_SEC_KEYS=["intro","verse","chorus","bridge","solo","outro"];
const DM={tuning:0, clip:null, sec:-1, secDrag:null, tk:null, vers:[], cmp:null, ask:null, more:"", wasLook:null, grAt:0, msg:""};
try{ const v=localStorage.getItem("aog.studio.more.v1"); if(v==="fx"||v==="tk"||v==="look") DM.more=v; }catch(e){}

/* ══ AOG-DESK-FX-V1 · the effects ══ */
/* a knob: [key, lowest, highest, step, at first, kind]; kinds: db (−24 dB), dbs (+3 dB), r (4:1), ms, hz (a log slider),
   oct (octaves), n (0–100), hzl (a slow speed in Hz) */
const DM_FX={
  comp:{nComp:1, knobs:[["thr",-60,0,1,-24,"db"],["ratio",1,20,0.5,4,"r"],["atk",1,100,1,10,"ms"],["rel",20,1000,10,200,"ms"],["mk",0,24,0.5,0,"dbs"]], make:dmMakeComp},
  eq:{knobs:[["f1",40,16000,0,250,"hz"],["g1",-15,15,0.5,0,"dbs"],["w1",0.25,4,0.25,1,"oct"],["f2",40,16000,0,3000,"hz"],["g2",-15,15,0.5,0,"dbs"],["w2",0.25,4,0.25,1,"oct"]], make:dmMakeEq},
  tape:{knobs:[["drive",0,100,1,40,"n"],["lvl",-12,6,0.5,0,"dbs"]], make:dmMakeTape},
  chorus:{lfo:true, knobs:[["rate",0.1,3,0.05,0.8,"hzl"],["depth",0,100,1,50,"n"],["mix",0,100,1,50,"n"]], make:dmMakeChorus},
  filter:{knobs:[["typ","lp","hp"],["f",40,18000,0,1200,"hz"],["res",0,100,1,0,"n"]], make:dmMakeFilter},
  dbl:{lfo:true, knobs:[["amt",0,100,1,60,"n"],["time",8,40,1,18,"ms"]], make:dmMakeDbl},
  dess:{nComp:1, knobs:[["f",4000,10000,0,7000,"hz"],["thr",-60,0,1,-30,"db"]], make:dmMakeDess},
  duck:{knobs:[["key","track"],["depth",-24,0,1,-8,"dbs"],["atk",1,50,1,5,"ms"],["rel",20,800,10,150,"ms"]], make:dmMakeDuck},
  tune:{noNode:true, knobs:[["amt",0,100,1,70,"pct"],["spd",0,100,1,50,"spd"]]}
};
const DM_FX_KEYS=Object.keys(DM_FX);
function dmDefaults(t){ const p={}; DM_FX[t].knobs.forEach(K=>{ p[K[0]]=K[1]==="track" ? -1 : K.length===3 ? K[1] : K[4]; }); return p; }
function dmCleanFx(a){
  if(!Array.isArray(a)) return null;
  const out=[]; let any=false;
  for(let k=0;k<DM_NSLOT;k++){ const s=a[k];
    if(!s || typeof s!=="object" || !DM_FX[s.t]){ out.push(null); continue; }
    const p={}, q=s.p && typeof s.p==="object" ? s.p : {};
    DM_FX[s.t].knobs.forEach(K=>{ if(K[1]==="track"){ p[K[0]]=Math.round(num(q[K[0]], -1, NT-1, -1)); return; }
      if(K.length===3){ p[K[0]]=K.slice(1).indexOf(q[K[0]])>=0 ? q[K[0]] : K[1]; return; }
      const v=num(q[K[0]], K[1], K[2], K[4]); p[K[0]]=K[3]>0 ? Math.round(v/K[3])*K[3] : Math.round(v); p[K[0]]=Math.round(p[K[0]]*1000)/1000; });
    out.push({t:s.t, on:s.on!==false, p:p}); any=true; }
  return any ? out : null;
}
function dmFxOn(x){ return (x.fx||[]).filter(s=>s && s.on!==false && DM_FX[s.t]); }
/* what goes into the track's chain: not Tune the voice (it works on the recording itself), and a Duck only with a track to
   listen to that does not, in turn, listen to this one (a loop the browser would turn to silence) */
function dmDuckReach(a, to, n){ if(n>NT) return true; return dmFxOn(SONG.tracks[a]).some(s=>s.t==="duck" && s.p.key>=0 && s.p.key<NT && s.p.key!==a && (s.p.key===to || dmDuckReach(s.p.key, to, n+1))); }
function dmDuckOk(i, k){ return k>=0 && k<NT && k!==i && !dmDuckReach(k, i, 0); }
function dmFxChain(x, i){ return dmFxOn(x).filter(s=>!DM_FX[s.t].noNode && (s.t!=="duck" || dmDuckOk(i, s.p.key))); }
/* a compressor hands its sound on 6 ms late (it looks ahead): in frames of a sample rate, as the desk measured it */
function dmCompFr(sr){ return (sr===MIX_SR && LAT!=null && LAT%NCOMP===0) ? LAT/NCOMP : Math.floor(0.006*sr); }
function dmLagFrames(sr){ let m=0; SONG.tracks.forEach(x=>{ let n=0; dmFxOn(x).forEach(s=>{ n+=DM_FX[s.t].nComp||0; }); m=Math.max(m, n); }); return m*dmCompFr(sr); }
function dmPut(E, prm, v, fresh){ if(fresh) prm.value=v; else setP(E, prm, v); }
function dmMakeComp(c){
  const d=c.createDynamicsCompressor(), g=c.createGain(); d.knee.value=0; d.connect(g);
  return {in:d, out:g, nodes:[d,g], comp:d, set(E,p,f){ dmPut(E,d.threshold,p.thr,f); dmPut(E,d.ratio,p.ratio,f); dmPut(E,d.attack,p.atk/1000,f); dmPut(E,d.release,p.rel/1000,f);
    /* the node's own make-up gain is taken away again (see autoMakeupDb); only "Turn up after" is added */
    dmPut(E, g.gain, dbGain(-autoMakeupDb(p.thr, p.ratio)+p.mk), f); }};
}
function dmOctQ(n){ const k=Math.pow(2, n); return Math.sqrt(k)/(k-1); }
function dmMakeEq(c){
  const a=c.createBiquadFilter(), b=c.createBiquadFilter(); a.type="peaking"; b.type="peaking"; a.connect(b);
  return {in:a, out:b, nodes:[a,b], set(E,p,f){ dmPut(E,a.frequency,p.f1,f); dmPut(E,a.gain,p.g1,f); dmPut(E,a.Q,dmOctQ(p.w1),f);
    dmPut(E,b.frequency,p.f2,f); dmPut(E,b.gain,p.g2,f); dmPut(E,b.Q,dmOctQ(p.w2),f); }};
}
/* tape warmth: a soft tanh curve, run at four times the sample rate (oversample 4x), so its new harmonics above the top of
   hearing are filtered away instead of folding back down as harsh tones. Quiet sounds pass at their own level; loud ones round off. */
let DM_TANH=null;
function dmTanh(){ if(DM_TANH) return DM_TANH; const n=8193, c=new Float32Array(n); for(let i=0;i<n;i++) c[i]=Math.tanh(8*(2*i/(n-1)-1)); return (DM_TANH=c); }
function dmMakeTape(c){
  const pre=c.createGain(), sh=c.createWaveShaper(), post=c.createGain(); sh.curve=dmTanh(); sh.oversample="4x"; pre.connect(sh); sh.connect(post);
  return {in:pre, out:post, nodes:[pre,sh,post], set(E,p,f){ const d=dbGain(p.drive*0.18); dmPut(E,pre.gain,d/8,f); dmPut(E,post.gain,dbGain(p.lvl)/d,f); }};
}
/* two short delays, left and right, each swayed by a slow wave (dmFxSched starts the waves with the song's own time, so
   the speakers and a bounce sway alike), the dry sound in the middle */
function dmModDelay(c){
  const up=c.createGain(); up.channelCount=2; up.channelCountMode="explicit"; up.channelInterpretation="speakers";
  const sp=c.createChannelSplitter(2), mg=c.createChannelMerger(2), wet=c.createGain(), dry=c.createGain(), out=c.createGain();
  const dl=[c.createDelay(0.1), c.createDelay(0.1)], dep=[c.createGain(), c.createGain()];
  up.connect(sp); sp.connect(dl[0], 0); sp.connect(dl[1], 1); dl[0].connect(mg, 0, 0); dl[1].connect(mg, 0, 1); mg.connect(wet); wet.connect(out);
  up.connect(dry); dry.connect(out); dep[0].connect(dl[0].delayTime); dep[1].connect(dl[1].delayTime);
  return {in:up, out:out, nodes:[up,sp,mg,wet,dry,out,dl[0],dl[1],dep[0],dep[1]], dl:dl, dep:dep, wet:wet, dry:dry, lfo:[]};
}
function dmMakeChorus(c){
  const u=dmModDelay(c);
  u.set=(E,p,f)=>{ u.dl.forEach(d=>dmPut(E,d.delayTime,0.015,f)); u.dep.forEach(g=>dmPut(E,g.gain,p.depth/100*0.005,f));
    dmPut(E,u.wet.gain,0.7*p.mix/100,f); dmPut(E,u.dry.gain,1-0.35*p.mix/100,f); u.lfo=[{k:0, rate:p.rate, ph:0},{k:1, rate:p.rate, ph:Math.PI/2}]; };
  return u;
}
function dmMakeDbl(c){
  const u=dmModDelay(c);
  u.set=(E,p,f)=>{ dmPut(E,u.dl[0].delayTime,p.time/1000,f); dmPut(E,u.dl[1].delayTime,p.time*1.6/1000,f); u.dep.forEach(g=>dmPut(E,g.gain,0.0006,f));
    dmPut(E,u.wet.gain,0.8*p.amt/100,f); dmPut(E,u.dry.gain,1-0.3*p.amt/100,f); u.lfo=[{k:0, rate:0.23, ph:0},{k:1, rate:0.31, ph:1.1}]; };
  return u;
}
function dmMakeFilter(c){
  const b=c.createBiquadFilter();
  /* a low-pass's or high-pass's Q is its resonance in dB: −3 dB is flat (no ring), up to 18 dB */
  return {in:b, out:b, nodes:[b], set(E,p,f){ const ty=p.typ==="hp" ? "highpass" : "lowpass"; if(b.type!==ty) b.type=ty; dmPut(E,b.frequency,p.f,f); dmPut(E,b.Q,-3.0103+21*p.res/100,f); }};
}
/* the De-esser: the band around 5–9 kHz is split off (a band-pass), squeezed by its own compressor and put back; the
   rest goes on untouched. out = x − band + squeezed band, all 6 ms late together (as the compressor is), so with nothing
   to squeeze it is the sound itself. */
function dmMakeDess(c){
  const L=dmCompFr(c.sampleRate)/c.sampleRate;
  const inp=c.createGain(), d1=c.createDelay(0.05), bp=c.createBiquadFilter(), d2=c.createDelay(0.05), neg=c.createGain(), cp=c.createDynamicsCompressor(), tr=c.createGain(), out=c.createGain();
  d1.delayTime.value=L; d2.delayTime.value=L; neg.gain.value=-1; bp.type="bandpass"; bp.Q.value=2;
  cp.knee.value=0; cp.ratio.value=6; cp.attack.value=0.001; cp.release.value=0.08;
  inp.connect(d1); d1.connect(out); inp.connect(bp); bp.connect(d2); d2.connect(neg); neg.connect(out); bp.connect(cp); cp.connect(tr); tr.connect(out);
  return {in:inp, out:out, nodes:[inp,d1,bp,d2,neg,cp,tr,out], comp:cp, set(E,p,f){ dmPut(E,bp.frequency,p.f,f); dmPut(E,cp.threshold,p.thr,f); dmPut(E,tr.gain,dbGain(-autoMakeupDb(p.thr,6)),f); }};
}
/* the slots reach the engine: the chain is built again only when the effects in it change; the knobs are set each time */
function dmFxApply(E, i){
  const T=E.tr[i], on=dmFxChain(SONG.tracks[i], i), sig=on.map(s=>s.t+(s.t==="duck" ? ":"+s.p.key+(E.c._dmDuck ? "" : "~") : "")).join(",");
  let fresh=E.fresh || !E.live;
  if(T.fxSig!==sig){
    T.fxN.forEach(u=>{ if(u.dispose) u.dispose(); u.nodes.forEach(n=>{ try{ n.disconnect(); }catch(e){} }); });
    try{ T.trim.disconnect(); }catch(e){}
    let node=T.trim, n=0; T.fxN=[];
    on.forEach(s=>{ const u=DM_FX[s.t].make(E.c, s, E, i); node.connect(u.in); node=u.out; T.fxN.push(u); n+=DM_FX[s.t].nComp||0; });
    T.tail=node; T.fxSig=sig; T.fOn=null; T.fSrc=null;   /* autoRoute joins the tail to the drawn Filter or the volume */
    E.fxLat[i]=n*dmCompFr(E.c.sampleRate)/E.c.sampleRate;
    fresh=true;
  }
  on.forEach((s,k)=>T.fxN[k].set(E, s.p, fresh));
  E.lag=Math.max(0, ...E.fxLat);
}
/* the Chorus's and the Doubler's slow waves for one stretch of the song: each starts at the phase the song's time gives it */
function dmFxSched(E, i, from, to, at, out){
  const T=E.tr[i]; if(!T.fxN || !T.fxN.length) return;
  const c=E.c, dur=to-from; if(!(dur>0)) return;
  T.fxN.forEach(u=>{ (u.lfo||[]).forEach(L=>{
    const ph=L.ph+2*Math.PI*L.rate*from, o=c.createOscillator(), env=c.createGain();
    o.setPeriodicWave(c.createPeriodicWave(new Float32Array([0, Math.sin(ph)]), new Float32Array([0, Math.cos(ph)]), {disableNormalization:true}));
    o.frequency.value=L.rate; o.connect(env); env.connect(u.dep[L.k]);
    o.start(at); o.stop(at+dur); out.push({src:o, env:env, end:at+dur}); }); });
}
/* how much the open track's compressors hold back, while the song plays: a number, twice a second */
function dmFxTick(rest){
  const now=performance.now(); if(!rest && now-DM.grAt<500) return; DM.grAt=now;
  const i=SONG.sel, on=dmFxChain(SONG.tracks[i], i);
  (SONG.tracks[i].fx||[]).forEach((s,k)=>{ const el=document.getElementById("gr"+k); if(!el) return;
    let w=t("grRest");
    if(!rest && PLAY.on && LIVE && s && s.on!==false){ const u=LIVE.tr[i].fxN[on.indexOf(s)]; if(u && u.comp) w=t("grNow",{n:dmNum(Math.abs(u.comp.reduction), 1)}); }
    if(el.textContent!==w) el.textContent=w; });
}
function dmNum(v, d){ const s=(+v).toFixed(d); return S.lang==="es" ? s.replace(".", ",") : s; }
function dmKnobWords(K, v){
  const u=K[5];
  if(u==="db") return (v<0 ? "−"+dmNum(-v, v%1 ? 1 : 0) : dmNum(v, 0))+" dB";
  if(u==="dbs") return (v>0 ? "+" : v<0 ? "−" : "")+dmNum(Math.abs(v), v%1 ? 1 : 0)+" dB";
  if(u==="r") return dmNum(v, v%1 ? 1 : 0)+":1";
  if(u==="ms") return Math.round(v)+" ms";
  if(u==="hz") return hzWords(v);
  if(u==="oct") return v===1 ? t("oct1") : t("octN",{n:dmNum(v, v%1 ? (v*4%2 ? 2 : 1) : 0)});
  if(u==="hzl") return dmNum(v, 2).replace(/0$/, "")+" Hz";
  if(u==="pct") return Math.round(v)+" %";
  if(u==="spd") return Math.round(v)+" · "+t(v<34 ? "spdNat" : v<67 ? "spdMid" : "spdFast");
  return String(Math.round(v));
}
/* a log slider for the frequencies (0 to 1000) */
function dmHzPos(K, v){ return Math.round(1000*Math.log(v/K[1])/Math.log(K[2]/K[1])); }
function dmPosHz(K, p){ const v=K[1]*Math.pow(K[2]/K[1], p/1000); return v<1000 ? Math.round(v) : Math.round(v/10)*10; }

/* ══ AOG-DESK-DUCK-V1 (Jimmy's 4: "Ducking (pumping): pads or bass dip under each kick, the dance-music bounce") ══
   The slot listens to another track (its sound after its own slots and its drawn volume, before its fader: a muted or
   faded kick still pumps) and turns this track down under it: a small processor (an AudioWorklet, the same one for the
   speakers and every bounce) follows the other track's level sample by sample (its peak, held 10 ms so a low note's
   zero crossings do not let go): from −50 dBFS nothing, from −30 dBFS and louder the whole Depth; the dip comes in over
   Grabs in and goes back over Lets go in. No track picked: the slot is not in the chain at all. */
const DM_DUCK_WK=`class AogDuck extends AudioWorkletProcessor{
static get parameterDescriptors(){return[{name:"depth",defaultValue:-8,automationRate:"k-rate"},{name:"atk",defaultValue:5,automationRate:"k-rate"},{name:"rel",defaultValue:150,automationRate:"k-rate"}];}
constructor(){super();this.pk=0;this.g=0;}
process(ins,outs,P){const x=ins[0],k=ins[1],y=outs[0],n=y[0].length,sr=sampleRate,depth=P.depth[0],ca=Math.exp(-1/(Math.max(0.1,P.atk[0])*0.001*sr)),cr=Math.exp(-1/(Math.max(1,P.rel[0])*0.001*sr)),ch=Math.exp(-1/(0.01*sr));
let pk=this.pk,g=this.g;const kl=k?k.length:0,xl=x?x.length:0;
for(let i=0;i<n;i++){let a=0;for(let c=0;c<kl;c++){const v=Math.abs(k[c][i]);if(v>a)a=v;}
pk=a>pk?a:pk*ch;const db=pk>1e-9?20*Math.log10(pk):-200,amt=Math.max(0,Math.min(1,(db+50)/20)),tg=depth*amt;
g=tg<g?tg+(g-tg)*ca:tg+(g-tg)*cr;const m=Math.pow(10,g/20);
for(let c=0;c<y.length;c++)y[c][i]=xl?x[Math.min(c,xl-1)][i]*m:0;}
this.pk=pk;this.g=g;return true;}}
registerProcessor("aog-duck",AogDuck);`;
let DM_DUCK_URL=null;
/* the processor is fetched once for each audio context, before a bounce; on the speakers the slot passes the sound on
   until it is ready, then the chain is built again */
function dmFxReady(c){
  if(c._dmDuck===true || !c.audioWorklet) return Promise.resolve();
  if(!SONG.tracks.some(x=>dmFxOn(x).some(s=>s.t==="duck"))) return Promise.resolve();
  if(!c._dmDuckP){ try{ DM_DUCK_URL=DM_DUCK_URL||URL.createObjectURL(new Blob([DM_DUCK_WK], {type:"text/javascript"})); }catch(e){ return Promise.resolve(); }
    c._dmDuckP=c.audioWorklet.addModule(DM_DUCK_URL).then(()=>{ c._dmDuck=true; if(LIVE && LIVE.c===c){ liveApply(applyAll); reschedule(); } }, ()=>{}); }
  return c._dmDuckP;
}
function dmMakeDuck(c, s, E, i){
  const inp=c.createGain();
  if(!c._dmDuck){ dmFxReady(c); return {in:inp, out:inp, nodes:[inp], set(){}}; }
  const wk=new AudioWorkletNode(c, "aog-duck", {numberOfInputs:2, numberOfOutputs:1, outputChannelCount:[2]}), key=E.tr[s.p.key].av;
  inp.connect(wk, 0, 0); key.connect(wk, 0, 1);
  return {in:inp, out:wk, nodes:[inp,wk], dispose(){ try{ key.disconnect(wk); }catch(e){} },
    set(E2,p,f){ dmPut(E2, wk.parameters.get("depth"), p.depth, f); dmPut(E2, wk.parameters.get("atk"), p.atk, f); dmPut(E2, wk.parameters.get("rel"), p.rel, f); }};
}
/* the track a new Duck listens to: the first with drums on it, else none */
function dmGuessKey(i){ const k=SONG.tracks.findIndex((x,j)=>j!==i && x.clip && /^(pads|drums)/.test(layerOfClip(x.clip))); return k; }

/* ══ AOG-DESK-TUNE-V1 (Jimmy's 6: "Vocal polish: gentle pitch correction") — Tune the voice works on the recording itself,
   once, off the main thread's busy moments (a little at a time), and the tuned copy is kept like a speed (STRETCH): its
   pitch is found every 10 ms (YIN, on a quarter-rate copy, then exactly on the sound itself), each sung note is pulled
   toward the nearest note of the song's key (major or minor; every note when the song has no key) by Amount, as fast as
   Speed says (natural: about 0.2 s; fast: 5 ms); the sound is read faster or slower by that much (the pitch moves), then
   put back on its own clock with the desk's WSOLA (the timing stays, to the sample in length). Amount 0: the recording
   as it is. ══ */
const DM_TUNE=new Map(), DM_TJOB=new Map(), DM_NOTE={en:["C","C♯","D","E♭","E","F","F♯","G","A♭","A","B♭","B"], es:["Do","Do♯","Re","Mi♭","Mi","Fa","Fa♯","Sol","La♭","La","Si♭","Si"]};
function dmSongKey(){ try{ const g=window.AOGSong && AOGSong.get(); return g && g.hasKey ? {key:g.key, minor:!!g.minor} : null; }catch(e){ return null; } }
function dmKeyWords(){ const k=dmSongKey(); return k ? t("tuneKey",{n:t(k.minor ? "keyMin" : "keyMaj",{n:(DM_NOTE[S.lang]||DM_NOTE.en)[k.key]})}) : t("tuneNoKey"); }
function dmTuneOf(i){ const x=SONG.tracks[i], s=x && dmFxOn(x).find(q=>q.t==="tune"); if(!s || !(s.p.amt>0)) return ""; const k=dmSongKey(); return [s.p.amt, s.p.spd, k ? k.key : -1, k && k.minor ? 1 : 0].join("|"); }
function dmTrackOf(cl){ return SONG.tracks.findIndex(x=>x.clip===cl || (x.takes||[]).indexOf(cl)>=0); }
function dmBase(cl){ const b=BUF.get(cl.id); if(!b) return null; const i=dmTrackOf(cl), sg=i>=0 ? dmTuneOf(i) : ""; if(!sg) return b;
  const e=DM_TUNE.get(cl.id); return e && e.sig===sg && e.src===b ? e.buf : b; }
function dmTuneSay(){ const w=DM.tuning ? t("tuning") : ""; document.querySelectorAll('#moreBox [id^="tuneSay"]').forEach(el=>{ if(el.textContent!==w) el.textContent=w; }); }
function dmTuneAll(){ const jobs=[]; SONG.tracks.forEach((x,i)=>{ const sg=dmTuneOf(i); if(sg) [x.clip].concat(x.takes||[]).filter(Boolean).forEach(c=>jobs.push(dmTuneJob(c, sg))); }); return Promise.all(jobs); }
function dmTuneJob(c, sg){
  const b=BUF.get(c.id); if(!b) return Promise.resolve();
  const e=DM_TUNE.get(c.id); if(e && e.sig===sg && e.src===b) return Promise.resolve();
  const key=c.id+"|"+sg, run=DM_TJOB.get(c.id); if(run && run.key===key) return run.p;
  const job={key:key}; DM.tuning++; dmTuneSay();
  job.p=(async()=>{
    try{ const P=sg.split("|").map(Number), out=await dmTune(b, {amt:P[0], spd:P[1], key:P[2], minor:!!P[3]}, ()=>DM_TJOB.get(c.id)!==job);
      if(out && DM_TJOB.get(c.id)===job) DM_TUNE.set(c.id, {sig:sg, src:b, buf:out}); }catch(err){}
    if(DM_TJOB.get(c.id)===job) DM_TJOB.delete(c.id);
    DM.tuning--; dmTuneSay(); reschedule(); ensureStretch(c);
  })();
  DM_TJOB.set(c.id, job); return job.p;
}
async function dmTune(buf, o, cancelled){
  const sr=buf.sampleRate, nch=buf.numberOfChannels, n=buf.length, X=[]; for(let ch=0;ch<nch;ch++) X.push(buf.getChannelData(ch));
  const M1=new Float32Array(n); for(let ch=0;ch<nch;ch++){ const x=X[ch]; for(let i=0;i<n;i++) M1[i]+=x[i]/nch; }
  const Q=4, nd=Math.floor(n/Q), D=new Float32Array(nd); for(let i=0;i<nd;i++){ const k=i*Q; D[i]=(M1[k]+M1[k+1]+M1[k+2]+M1[k+3])/4; }
  const dsr=sr/Q, W=Math.round(0.03*dsr), tmin=Math.max(2, Math.floor(dsr/1000)), tmax=Math.ceil(dsr/70), hop=Math.round(0.01*sr), WF=W*Q;
  const F=Math.floor((n-(W+tmax+2)*Q-2*Q)/hop); if(F<2) return buf;
  const sc=o.key<0 ? [0,1,2,3,4,5,6,7,8,9,10,11] : (o.minor ? [0,2,3,5,7,8,10] : [0,2,4,5,7,9,11]).map(v=>(v+o.key)%12);
  const want=new Float32Array(F), voiced=new Uint8Array(F), d=new Float64Array(tmax+2), dn=new Float64Array(tmax+2);
  for(let f=0;f<F;f++){
    const a=Math.floor(f*hop/Q); let e=0; for(let j=0;j<W;j++) e+=D[a+j]*D[a+j]; if(e/W<1e-7) continue;
    let run=0, tau=-1;
    for(let tt=1;tt<=tmax;tt++){ let s=0; for(let j=0;j<W;j++){ const v=D[a+j]-D[a+j+tt]; s+=v*v; } d[tt]=s; run+=s; dn[tt]=run>0 ? s*tt/run : 1; }
    for(let tt=tmin;tt<=tmax;tt++) if(dn[tt]<0.15){ while(tt+1<=tmax && dn[tt+1]<dn[tt]) tt++; tau=tt; break; }
    if(tau<0) continue;
    /* the period, exactly, on the sound itself */
    const af=f*hop, c0=Math.max(2, tau*Q-Q-1), c1=Math.min(tmax*Q+Q, tau*Q+Q+1), df=[]; let best=Infinity, bl=-1;
    for(let L=c0-1;L<=c1+1;L++){ let s=0; for(let j=0;j<WF;j+=2){ const v=M1[af+j]-M1[af+j+L]; s+=v*v; } df[L]=s; if(L>=c0 && L<=c1 && s<best){ best=s; bl=L; } }
    if(bl<0) continue;
    const y0=df[bl-1], y1=df[bl], y2=df[bl+1], den=y0-2*y1+y2, per=bl+(den>0 ? 0.5*(y0-y2)/den : 0);
    const midi=69+12*Math.log2(sr/per/440);
    let tgt=Math.round(midi), bestD=Infinity; for(let m=Math.round(midi)-2;m<=Math.round(midi)+2;m++){ if(sc.indexOf(((m%12)+12)%12)<0) continue; const dd=Math.abs(midi-m); if(dd<bestD){ bestD=dd; tgt=m; } }
    want[f]=-(midi-tgt)*100*o.amt/100; voiced[f]=1;
    if((f&63)===63){ await new Promise(r=>setTimeout(r, 0)); if(cancelled()) return null; }
  }
  /* the pull, as fast as Speed says; nothing where there is no note */
  const tau=0.005+0.2*(1-o.spd/100), al=1-Math.exp(-(hop/sr)/tau), sm=new Float32Array(F); let cc=0;
  for(let f=0;f<F;f++){ cc+=al*((voiced[f] ? want[f] : 0)-cc); sm[f]=cc; }
  if(!sm.some(v=>Math.abs(v)>0.5)) return buf;   /* already in tune: the recording as it is */
  const half=WF/2, rAt=pos=>{ let fp=(pos-half)/hop; if(fp<0) fp=0; if(fp>F-1) fp=F-1; const f0=Math.floor(fp), f1=Math.min(F-1, f0+1), w=fp-f0; return Math.pow(2, (sm[f0]+(sm[f1]-sm[f0])*w)/1200); };
  /* read the sound that much faster or slower: the pitch moves, and where each moment of it went is kept */
  const cap=Math.ceil(n*1.1)+16, Y=X.map(()=>new Float32Array(cap)), PO=new Float64Array(cap); let pos=0, m=0;
  while(pos<n-1 && m<cap){ const i=Math.floor(pos), fr=pos-i; for(let ch=0;ch<nch;ch++){ const x=X[ch]; Y[ch][m]=x[i]+(x[i+1]-x[i])*fr; } PO[m]=pos; m++; pos+=rAt(pos);
    if((m&65535)===0){ await new Promise(r=>setTimeout(r, 0)); if(cancelled()) return null; } }
  const NY=m;
  /* then back on the recording's own clock: WSOLA (as the desk's speed), each window taken from where that moment went */
  const H=Math.max(64, Math.round(0.02*sr)), N=2*H, tol=Math.round(0.012*sr), Z=X.map(()=>new Float32Array(n+N));
  const Wn=new Float32Array(N); for(let j=0;j<N;j++) Wn[j]=0.5-0.5*Math.cos(2*Math.PI*j/N);
  const mq=Math.floor(NY/Q), DY=new Float32Array(mq+1); for(let i=0;i<mq;i++){ let v=0; const o2=i*Q; for(let ch=0;ch<nch;ch++){ const y=Y[ch]; v+=y[o2]+y[o2+1]+y[o2+2]+y[o2+3]; } DY[i]=v; }
  const Hq=Math.floor(H/Q), tq=Math.floor(tol/Q);
  let prev=0, ptr=0, k=0;
  for(let op=0; op<n; op+=H, k++){
    while(ptr<NY-1 && PO[ptr]<op) ptr++;
    const nom=ptr; let p0;
    if(k===0) p0=0;
    else { const tg=prev+H;
      if(tg+N>=NY || nom+tol+N>=NY) p0=Math.max(0, Math.min(nom, NY-N));
      else if((()=>{ const tgq=Math.floor(tg/Q); let te=0; for(let j=0;j<Hq;j++) te+=DY[tgq+j]*DY[tgq+j]; return te<Hq*Math.pow(0.001*Q*nch, 2); })()) p0=nom;   /* near silence (a breath, before a note): nothing to match, so it stays on time */
      else { const tgq=Math.floor(tg/Q), lo=Math.max(0, Math.floor(nom/Q)-tq), hi=Math.min(mq-Hq-1, Math.floor(nom/Q)+tq); let bv=-Infinity, bq=Math.floor(nom/Q);
        for(let q=lo;q<=hi;q++){ let v=0; for(let j=0;j<Hq;j++) v+=DY[tgq+j]*DY[q+j]; if(v>bv){ bv=v; bq=q; } }
        let fb=-Infinity, fp=Math.max(0, Math.min(NY-N-1, bq*Q));
        for(let q=Math.max(0, bq*Q-Q); q<=Math.min(NY-N-1, bq*Q+Q); q++){ let v=0; for(let j=0;j<H;j+=2){ let aa=0, bb=0; for(let ch=0;ch<nch;ch++){ aa+=Y[ch][tg+j]; bb+=Y[ch][q+j]; } v+=aa*bb; } if(v>fb){ fb=v; fp=q; } }
        p0=fp; } }
    for(let ch=0;ch<nch;ch++){ const y=Y[ch], z=Z[ch], L2=Math.min(N, NY-p0); if(k===0){ for(let j=0;j<L2;j++) z[op+j]+=y[p0+j]*(j<H ? 1 : Wn[j]); } else for(let j=0;j<L2;j++) z[op+j]+=y[p0+j]*Wn[j]; }
    prev=p0;
    if((k&127)===127){ await new Promise(r=>setTimeout(r, 0)); if(cancelled()) return null; }
  }
  const out=newBuf(nch, n, sr); for(let ch=0;ch<nch;ch++) out.getChannelData(ch).set(Z[ch].subarray(0, n));
  return out;
}

/* ══ AOG-DESK-TAKES-V1 · takes ══ */
function dmAllClips(){ const o=[]; SONG.tracks.forEach(x=>{ if(x.clip) o.push(x.clip); (x.takes||[]).forEach(c=>o.push(c)); }); return o; }
function dmSongClips(sg){ const o=[]; (sg && sg.tracks || []).forEach(x=>{ if(x.clip) o.push(x.clip); (x.takes||[]).forEach(c=>o.push(c)); }); return o; }
function dmTakeRefs(){ const o=[]; SONG.tracks.forEach((x,i)=>(x.takes||[]).forEach(c=>o.push({i:i, c:c, take:true}))); return o; }
function dmTakesTidy(x){
  if(x.takes && !x.takes.length) delete x.takes;
  const ids=new Set((x.takes||[]).map(c=>c.id));
  if(x.comp){ x.comp=x.comp.filter(r=>ids.has(r[2])); if(!x.comp.length) delete x.comp; }
  if(!x.takes){ delete x.comp; delete x.tkHide; }
}
function dmTakeLost(i, id){ const x=SONG.tracks[i]; x.takes=(x.takes||[]).filter(c=>c.id!==id); dmTakesTidy(x); }
function dmPromoteTake(x){ if(!x.clip && x.takes && x.takes.length) x.clip=x.takes.shift(); dmTakesTidy(x); }
function dmTakesHave(x, wavs){ if(x.takes) x.takes=x.takes.filter(c=>wavs.has(c.id)); dmPromoteTake(x); }
/* the take that was in place stays on the track, as a take lane; the newest plays */
function dmKeepAsTake(x, old){
  x.takes=(x.takes||[]).filter(c=>c.id!==old.id).concat([old]); delete x.tkHide;
  while(x.takes.length>DM_MAX_TAKES){ const g=x.takes.shift(); DM.msg=t("tkFull"); dmTakesTidy(x); dropClip(g.id); }
  dmTakesTidy(x);
}
function dmInUse(id){
  const has=sg=>(sg && sg.tracks || []).some(x=>(x.clip && x.clip.id===id) || (x.takes||[]).some(c=>c.id===id));
  return has(SONG) || !!(DM.cmp && (has(DM.cmp.a) || has(DM.cmp.b)));
}
/* the takes in the order they were made, numbered from 1 */
function dmTakeList(x){ return [x.clip].concat(x.takes||[]).filter(Boolean).slice().sort((a,b)=>(a.at||0)-(b.at||0)); }
function dmTakeNo(x, id){ return dmTakeList(x).findIndex(c=>c.id===id)+1; }
/* where each take is chosen, in beats of the song: the one in place everywhere the others are not */
function dmOnBeats(x){
  const out=new Map(); if(!x.clip) return out;
  (x.takes||[]).forEach(c=>out.set(c.id, []));
  (x.comp||[]).forEach(r=>{ if(out.has(r[2])) out.get(r[2]).push([r[0], r[1]]); });
  const used=[].concat(...[...out.values()]).sort((p,q)=>p[0]-q[0]), main=[]; let cur=-Infinity;
  used.forEach(([a,b])=>{ if(a>cur+1e-9) main.push([cur,a]); cur=Math.max(cur,b); }); main.push([cur, Infinity]);
  out.set(x.clip.id, main.filter(([a,b])=>b-a>1e-9));
  return out;
}
/* for schedule(): each take, the stretches of song time where it plays, and the crossfade at each switch */
function dmGates(x){
  if(!x.takes || !x.takes.length || !x.clip) return null;
  const sb=songBeat(), on=dmOnBeats(x); let X=DM_XF;
  const G=dmTakeList(x).map(c=>{ const iv=(on.get(c.id)||[]).map(([a,b])=>[a*sb, b*sb]);
    iv.forEach(([u0,u1])=>{ if(isFinite(u0) && isFinite(u1)) X=Math.min(X, (u1-u0)/2); }); return {cl:c, on:iv}; });
  return G.filter(g=>g.on.length).map(g=>Object.assign(g, {X:Math.max(1e-4, X)}));
}
function dmGateAt(G, t){
  const h=G.X/2;
  for(const [u0,u1] of G.on){ if(t<u0-h || t>u1+h) continue; let g=1;
    if(isFinite(u0)) g*=Math.sin(Math.PI/2*Math.max(0, Math.min(1, (t-(u0-h))/G.X)));
    if(isFinite(u1)) g*=Math.sin(Math.PI/2*Math.max(0, Math.min(1, ((u1+h)-t)/G.X)));
    return g; }
  return 0;
}
function dmGateSpans(G, A0, A1){ const h=G.X/2, o=[]; G.on.forEach(([u0,u1])=>{ const a=Math.max(A0, u0-h), b=Math.min(A1, u1+h); if(b>a) o.push([a,b]); }); return o; }
function dmGatePts(G, a0, e1, pts){ const h=G.X/2;
  G.on.forEach(([u0,u1])=>[u0,u1].forEach(u=>{ if(!isFinite(u) || u+h<a0 || u-h>e1) return; for(let s=0;s<=24;s++) pts.push(u-h+G.X*s/24); })); }
/* choose take id for beats a to b (the one in place: give those beats back to it) */
function dmSetRegion(x, a, b, id){
  let R=[];
  (x.comp||[]).forEach(r=>{ if(r[1]<=a+1e-9 || r[0]>=b-1e-9){ R.push(r); return; } if(r[0]<a-1e-9) R.push([r[0], a, r[2]]); if(r[1]>b+1e-9) R.push([b, r[1], r[2]]); });
  if(id!==x.clip.id) R.push([a, b, id]);
  R=R.filter(r=>r[1]-r[0]>=0.25-1e-9).sort((p,q)=>p[0]-q[0]);
  const M=[]; R.forEach(r=>{ const l=M[M.length-1]; if(l && l[2]===r[2] && Math.abs(l[1]-r[0])<1e-9) l[1]=r[1]; else M.push(r.slice()); });
  if(M.length) x.comp=M; else delete x.comp;
}
function dmCleanClip(c){ const o=cleanClip(c); if(o && c && c.pitch){ const v=Math.round(num(c.pitch,-12,12,0)); if(v) o.pitch=v; } return o; }   /* AOG-DESK-PITCH-V1 */
function dmSongEnd(tail){
  let e=0;
  SONG.tracks.forEach(x=>{ if(!x.clip) return; e=Math.max(e, clipEnd(x.clip, tail));
    if(!x.takes) return; const on=dmOnBeats(x), sb=songBeat();
    x.takes.forEach(c=>{ const iv=on.get(c.id)||[]; if(!iv.length) return; const last=Math.max(...iv.map(r=>r[1]))*sb;
      e=Math.max(e, Math.min(clipEnd(c, tail), last+(tail ? clipEnd(c,true)-clipEnd(c,false) : 0))); }); });
  return e;
}
function dmCleanTrack(x, d){
  if(typeof x.name==="string"){ const n=x.name.replace(/[\u0000-\u001f]/g,"").trim().slice(0,24); if(n) d.name=n; }
  if(DM_PAL[x.col]) d.col=x.col;
  const fx=dmCleanFx(x.fx); if(fx) d.fx=fx;
  if(Array.isArray(x.takes) && !d.clip){ const k=x.takes.findIndex(c=>dmCleanClip(c)); if(k>=0){ d.clip=dmCleanClip(x.takes[k]); x={takes:x.takes.slice(k+1), comp:x.comp, tkHide:x.tkHide}; } }
  if(Array.isArray(x.takes) && d.clip){ const seen=new Set([d.clip.id]), T=[];
    x.takes.slice(0, DM_MAX_TAKES).forEach(c=>{ const o=dmCleanClip(c); if(o && !seen.has(o.id)){ seen.add(o.id); T.push(o); } });
    if(T.length){ d.takes=T;
      if(Array.isArray(x.comp)){ const ids=new Set(T.map(c=>c.id)), R=[];
        x.comp.slice(0, 256).forEach(r=>{ if(!Array.isArray(r) || !ids.has(r[2])) return; const a=num(r[0],0,MAX_BARS*4,0), b=num(r[1],0,MAX_BARS*4,0); if(b-a>=0.25-1e-9) R.push([a,b,r[2]]); });
        R.sort((p,q)=>p[0]-q[0]); const M=[]; R.forEach(r=>{ const l=M[M.length-1]; if(!l || r[0]>=l[1]-1e-9) M.push(r); });
        if(M.length) d.comp=M; }
      if(x.tkHide) d.tkHide=true; } }
}
function dmCleanSecs(a){
  if(!Array.isArray(a)) return null;
  const out=[];
  a.slice(0, 64).forEach(s=>{ if(!s || typeof s!=="object") return;
    const A=Math.round(num(s.a,0,MAX_BARS*4,0)/4)*4, B=Math.round(num(s.b,0,MAX_BARS*4,0)/4)*4; if(B-A<4) return;
    const o={a:A, b:B}; if(DM_SEC_KEYS.indexOf(s.n)>=0) o.n=s.n; else { const w=String(typeof s.w==="string" ? s.w : "").replace(/[\u0000-\u001f]/g,"").trim().slice(0,24); if(w) o.w=w; else o.n="verse"; }
    out.push(o); });
  out.sort((p,q)=>p.a-q.a); const M=[]; out.forEach(s=>{ const l=M[M.length-1]; if(!l || s.a>=l.b) M.push(s); });
  return M.length ? M : null;
}
function dmCleanSong(r, s){ const sc=dmCleanSecs(r.sections); if(sc) s.sections=sc; }
/* ══ AOG-DESK-REVERSE-V1 · the whole recording, backwards, made once for each sound it is asked of ══ */
const DM_REV=new WeakMap();
function dmRev(b){ let r=DM_REV.get(b); if(r) return r;
  r=newBuf(b.numberOfChannels, b.length, b.sampleRate);
  for(let ch=0;ch<b.numberOfChannels;ch++){ const s=b.getChannelData(ch), d=r.getChannelData(ch), n=s.length; for(let i=0;i<n;i++) d[i]=s[n-1-i]; }
  DM_REV.set(b, r); return r; }

/* ══ undo: snapshots for the mixer, a track's takes, effects and look, and the whole arrangement (sections) ══ */
const DM_MIXK=["vol","pan","mute","solo","low","mid","high","punch","room","echo"];
const DM_SNAPS={
  mix:{get:()=>JSON.stringify({t:SONG.tracks.map(x=>DM_MIXK.map(k=>x[k])), m:SONG.master}),
    set:j=>{ const o=JSON.parse(j); o.t.forEach((v,i)=>DM_MIXK.forEach((k,n)=>{ SONG.tracks[i][k]=v[n]; })); const m=Object.assign({}, o.m); SONG.master=m; }},
  trk:{get:i=>{ const x=SONG.tracks[i]; return JSON.stringify({clip:x.clip, takes:x.takes||null, comp:x.comp||null, tkHide:!!x.tkHide}); },
    set:(j,i)=>{ const o=JSON.parse(j), x=SONG.tracks[i]; x.clip=dmCleanClip(o.clip); delete x.takes; delete x.comp; delete x.tkHide;
      const d={clip:x.clip}; dmCleanTrack({takes:o.takes, comp:o.comp, tkHide:o.tkHide}, d); ["takes","comp","tkHide"].forEach(k=>{ if(d[k]) x[k]=d[k]; }); }},
  fx:{get:i=>JSON.stringify(SONG.tracks[i].fx||null), set:(j,i)=>{ const v=dmCleanFx(JSON.parse(j)); if(v) SONG.tracks[i].fx=v; else delete SONG.tracks[i].fx; }},
  look:{get:i=>JSON.stringify({name:SONG.tracks[i].name||"", col:SONG.tracks[i].col||""}),
    set:(j,i)=>{ const o=JSON.parse(j), x=SONG.tracks[i]; if(o.name) x.name=o.name; else delete x.name; if(o.col) x.col=o.col; else delete x.col; }},
  song:{get:()=>JSON.stringify({tr:SONG.tracks.map(x=>({clip:x.clip, takes:x.takes||null, comp:x.comp||null, lines:x.lines||null})), sec:SONG.sections||null}),
    set:j=>{ const o=JSON.parse(j);
      o.tr.forEach((y,i)=>{ const x=SONG.tracks[i]; x.clip=dmCleanClip(y.clip); delete x.takes; delete x.comp;
        const d={clip:x.clip}; dmCleanTrack({takes:y.takes, comp:y.comp, tkHide:x.tkHide}, d); if(d.takes) x.takes=d.takes; if(d.comp) x.comp=d.comp;
        const ln=cleanLines(y.lines); if(ln) x.lines=ln; else delete x.lines; });
      const sc=dmCleanSecs(o.sec); if(sc) SONG.sections=sc; else delete SONG.sections; if(DM.sec>=(SONG.sections||[]).length) DM.sec=-1; }}
};
function dmRemember(what, i, tag, was){
  const last=UNDO[UNDO.length-1], now=Date.now(); REDO.length=0;
  if(tag && last && last.k==="snap" && last.what===what && last.tag===tag && last.i===i && now-last.t<1500){ last.t=now; return; }
  UNDO.push({i:i, k:"snap", what:what, g:++UG, j:was!=null ? was : DM_SNAPS[what].get(i), tag:tag||"", t:now}); if(UNDO.length>60) UNDO.shift();
  const c=SONG.tracks[i] && SONG.tracks[i].clip; if(c && what!=="mix" && what!=="look") c.auto=false;   /* a take you change is yours (AOG-STUDIO-LISTEN-V1) */
  try{ paintTools(); }catch(e){}
}

/* ══ the playhead, in beats of the song: where the song is while it plays; stopped, where it starts ══ */
function dmPlayBeat(){
  if(PLAY.on && ac){ const s=songPos(ac.currentTime); if(s!=null) return s/songBeat(); }
  return SONG.loopOn ? (SONG.loopFrom-1)*4 : (SONG.startBar-1)*4;
}
/* a piece (one or more times through) cut at song beat t; a piece played backwards is cut where it is heard */
function dmCutAt(c, q, t){
  const r=ratio(c), len=(q.b-q.a)*r, s=q.at, e=s+q.n*len;
  if(!(t>s+1e-6 && t<e-1e-6)) return [q];
  const m=Math.min(q.n-1, Math.floor((t-s)/len+1e-9)), u=t-(s+m*len), x={}; if(q.g) x.g=q.g; if(q.rev) x.rev=1;
  const out=[];
  if(m>0) out.push(Object.assign({a:q.a, b:q.b, at:s, n:m}, x));
  if(u>1e-6 && len-u>1e-6){
    const kk=q.rev ? q.b-u/r : q.a+u/r;
    if(q.rev){ out.push(Object.assign({a:kk, b:q.b, at:s+m*len, n:1}, x)); out.push(Object.assign({a:q.a, b:kk, at:t, n:1}, x)); }
    else { out.push(Object.assign({a:q.a, b:kk, at:s+m*len, n:1}, x)); out.push(Object.assign({a:kk, b:q.b, at:t, n:1}, x)); }
    if(q.n-m-1>0) out.push(Object.assign({a:q.a, b:q.b, at:s+(m+1)*len, n:q.n-m-1}, x));
  } else out.push(Object.assign({a:q.a, b:q.b, at:s+m*len, n:q.n-m}, x));
  return out;
}
function dmPieceEnd(c, q){ return q.at+q.n*(q.b-q.a)*ratio(c); }
function dmSplit(){
  const i=SONG.sel, c=SONG.tracks[i].clip; if(!c) return;
  let pos=dmPlayBeat(); pos=VIEW.snap ? Math.round(pos) : Math.round(pos*1e6)/1e6;
  const P=pcs(c), j=P.findIndex(q=>pos>q.at+1e-6 && pos<dmPieceEnd(c,q)-1e-6);
  if(j<0){ S.edMsg=t("splitNone"); S.edAt="cut"; paintEditLine(); return; }
  const parts=dmCutAt(c, P[j], pos);
  if(parts.length<2 || parts.some(q=>q.b-q.a<0.25)){ S.edMsg=t("splitEdge"); S.edAt="cut"; paintEditLine(); return; }
  remember(i, ++UG); const P2=own(c); P2.splice(j, 1, ...parts);
  const right=parts.find(q=>Math.abs(q.at-pos)<1e-9); c.psel=Math.max(0, P2.indexOf(right)); tidyPieces(c);
  S.edMsg=t("splitDone",{w:posFine(pos), n:P2.length}); S.edAt="cut";
  songChanged(); stretchAll();
}
function dmReverse(){
  const i=SONG.sel, c=SONG.tracks[i].clip; if(!c) return;
  remember(i, ++UG); const k=pSel(c), p=own(c)[k]; if(p.rev) delete p.rev; else p.rev=1;
  S.edMsg=t(p.rev ? "revOn" : "revOff",{n:k+1}); S.edAt="cut"; songChanged();
}
/* the clipboard: one piece, with its recording, ready to paste on any track */
function dmCopy(cut){
  const i=SONG.sel, x=SONG.tracks[i], c=x.clip; if(!c) return;
  const P=pcs(c), k=pSel(c), p=P[k];
  DM.clip={src:JSON.parse(JSON.stringify(c)), piece:Object.assign({}, p), id:c.id, buf:BUF.get(c.id), wav:null, name:trackName(i), n:k+1, len:p.n*pLen(c,p)};
  const cb=DM.clip; sget(c.id).then(v=>{ if(v && v.wav) cb.wav=v.wav; }, ()=>{});
  if(cut){ dmRemember("trk", i, "");
    if(P.length>1){ const P2=own(c); P2.splice(k, 1); c.psel=Math.min(k, P2.length-1); tidyPieces(c); }
    else { x.clip=null; dmPromoteTake(x); }   /* its sound stays with the clipboard (and Undo) */
    S.edMsg=t("cCutDone",{n:k+1}); S.edAt="cut"; DM.msg=t("cCutDone",{n:k+1}); songChanged(); return; }
  S.edMsg=t("cCopied",{n:k+1}); S.edAt="cut"; paintEditLine(); dmPaintMore(true);
}
async function dmPaste(){
  const cb=DM.clip; if(!cb) return;
  const i=SONG.sel, x=SONG.tracks[i], el=document.getElementById("pasteAt");
  let at=el && el.value!=="" ? +el.value : dmPlayBeat(); at=VIEW.snap || (el && el.value!=="") ? Math.round(at) : Math.round(at*1e6)/1e6;
  at=Math.max(0, Math.min((MAX_BARS-1)*4, at));
  const q=Object.assign({}, cb.piece, {at:at}), w=posFine(at);
  if(x.clip && x.clip.id===cb.id){ dmRemember("trk", i, ""); const P=own(x.clip); P.push(q); x.clip.psel=P.length-1; tidyPieces(x.clip); }
  else if(!x.clip){
    const buf=cb.buf || BUF.get(cb.id); let wav=cb.wav; if(!wav){ try{ const v=await sget(cb.id); wav=v && v.wav; }catch(e){} }
    if(!buf || !wav){ DM.msg=t("fail"); dmPaintMore(true); return; }
    const id="c"+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
    await sput(id, {wav:wav}); BUF.set(id, buf);
    dmRemember("trk", i, "");
    const nc=dmCleanClip(Object.assign({}, cb.src, {id:id, pieces:[q], psel:0, fadeIn:0, fadeOut:0, auto:false, lead:false, voice:i===VOICE_T && !!cb.src.voice}));
    if(!nc){ DM.msg=t("fail"); dmPaintMore(true); return; }
    delete nc.xf; x.clip=nc;
  } else { DM.msg=t("cOther",{n:i+1}); dmPaintMore(true); return; }
  DM.msg=t("cPasted",{n:i+1, w:w}); songChanged(); stretchAll();
}

/* ══ AOG-DESK-SECTIONS-V1 · sections ══ */
function dmSecName(s){ return s.w ? s.w : t("sec_"+(s.n||"verse")); }
function dmSecBars(){ const L=SONG.sections; return L && L.length ? Math.ceil(L[L.length-1].b/4) : 0; }
function dmSecRow(){
  const L=SONG.sections; if(!L || !L.length) return "";
  const W=tlBars()*4;
  return `<div class="st-secr"><span class="st-ln st-secn"><span>${esc(t("secRowLab"))}</span></span><span class="st-sect" id="secStrip">`+L.map((s,k)=>{
    const l=Math.min(100, s.a/W*100), w=Math.max(0.5, Math.min(100-l, (s.b-s.a)/W*100)), nm=dmSecName(s), a=s.a/4+1, b=s.b/4;
    return `<span class="st-sec${k===DM.sec?" on":""}" data-sec="${k}" style="left:${l.toFixed(4)}%;width:${w.toFixed(4)}%" role="button" tabindex="0" aria-pressed="${k===DM.sec}" aria-label="${esc(t("secAria",{name:nm, a:a, b:b}))}">`+
      `<i class="st-seh a" data-edge="a" aria-hidden="true"></i><b>${esc(nm)}</b><i class="st-seh b" data-edge="b" aria-hidden="true"></i></span>`; }).join("")+`</span></div>`;
}
function dmBarOpts(lo, hi, sel){ let h=""; for(let b=lo;b<=hi;b++) h+=`<option value="${b}"${b===sel?" selected":""}>${esc(t("barN",{n:b}))}</option>`; return h; }
function dmPaintSec(){
  const box=document.getElementById("secTools"); if(!box) return;
  const L=SONG.sections||[]; if(DM.sec>=L.length) DM.sec=-1;
  const s=L[DM.sec], k=DM.sec;
  const sig=JSON.stringify([S.lang, L, k]); if(box._sig===sig) return; box._sig=sig;
  const fa=document.activeElement, keep=fa && box.contains(fa) ? fa.id : "";
  let h=`<label class="st-field st-drw"><span class="st-lab">${esc(t("secLab"))}</span><select id="secSel"><option value=""${k<0?" selected":""}>${esc(t(L.length ? "secPick" : "secNone"))}</option>`+
    L.map((q,j)=>`<option value="${j}"${j===k?" selected":""}>${esc(t("secOpt",{name:dmSecName(q), a:q.a/4+1, b:q.b/4}))}</option>`).join("")+`<option value="new">${esc(t("secNew"))}</option></select></label>`;
  if(s){
    const prev=L[k-1], next=L[k+1], lo=prev ? prev.b/4+1 : 1, hi=next ? next.a/4 : MAX_BARS;
    h+=`<label class="st-field"><span class="st-lab">${esc(t("secName"))}</span><select id="secName">`+DM_SEC_KEYS.concat(["own"]).map(n=>`<option value="${n}"${(s.w ? "own" : s.n)===n?" selected":""}>${esc(t("sec_"+n))}</option>`).join("")+`</select></label>`+
      (s.w || DM.secOwn===k ? `<label class="st-field"><span class="st-lab">${esc(t("secWords"))}</span><input type="text" id="secWords" maxlength="24" autocomplete="off" enterkeyhint="done" value="${esc(s.w||"")}"></label>` : "")+
      `<label class="st-field"><span class="st-lab">${esc(t("tkFrom"))}</span><select id="secFrom">${dmBarOpts(lo, s.b/4, s.a/4+1)}</select></label>`+
      `<label class="st-field"><span class="st-lab">${esc(t("tkTo"))}</span><select id="secTo">${dmBarOpts(s.a/4+1, hi, s.b/4)}</select></label>`+
      `<button type="button" class="st-hw" id="secEnd">${esc(t("secEnd"))}</button><button type="button" class="st-hw" id="secAfter">${esc(t("secAfter"))}</button><button type="button" class="st-hw" id="secDel">${esc(t("secDel"))}</button>`;
  }
  box.innerHTML=h;
  if(keep){ const el=document.getElementById(keep)||document.getElementById("secSel"); if(el) try{ el.focus({preventScroll:true}); }catch(e){ el.focus(); } }
}
function dmSecSay(w){ const el=document.getElementById("secLine"); if(el && el.textContent!==w) el.textContent=w; }
function dmSecChanged(){ save(); paintTransport(); paintTimeline(); }
function dmSecNew(){
  const L=SONG.sections ? SONG.sections.slice() : [];
  let a=L.length ? L[L.length-1].b : 0; if(!L.length) a=Math.max(0, (SONG.startBar-1)*4);
  if(a+4>MAX_BARS*4){ dmSecSay(t("secNoRoom")); return; }
  const b=Math.min(MAX_BARS*4, a+16), n=["verse","chorus"][L.length%2];
  dmRemember("song", SONG.sel, ""); L.push({a:a, b:b, n:n}); SONG.sections=dmCleanSecs(L); DM.sec=SONG.sections.findIndex(s=>s.a===a);
  dmSecSay(t("secMade",{name:t("sec_"+n), a:a/4+1, b:b/4})); dmSecChanged();
}
/* the end of the song, on a bar line: after the last music and the last section */
function dmEndBeat(){ return Math.max(Math.ceil(songEndMusic()/barSec()-1e-6)*4, (SONG.sections||[]).reduce((m,s)=>Math.max(m, s.b), 0)); }
/* the pieces of a recording within beats A to B, moved to start at P */
function dmPiecesIn(c, A, B, P){
  const out=[];
  pcs(c).forEach(q=>{ dmCutAt(c, Object.assign({}, q), A).forEach(u=>{ if(u.at<A-1e-6) return;
    dmCutAt(c, u, B).forEach(v=>{ if(dmPieceEnd(c,v)>B+1e-6) return; out.push(Object.assign({}, v, {at:v.at+(P-A)})); }); }); });
  return out;
}
/* a line, with beats A to B copied in at P: as it was before P, the copy, then the rest of it L later */
function dmLineInsert(Ln, A, B, P){
  const L=B-A, f=b=>Math.round(drawnAt(Ln, b)), fl=b=>Math.round(drawnAt(Ln, b-1e-7)), out=[];   /* (a line holds whole values, as cleanLines keeps them) */
  Ln.forEach(p=>{ if(p[0]<P-1e-9) out.push(p.slice()); });
  out.push([P, fl(P)], [P, f(A)]);
  Ln.forEach(p=>{ if(p[0]>A+1e-9 && p[0]<B-1e-9) out.push([p[0]+P-A, p[1]]); });
  out.push([P+L, fl(B)], [P+L, f(P)]);
  Ln.forEach(p=>{ if(p[0]>=P-1e-9) out.push([p[0]+L, p[1]]); });
  const M=[]; out.forEach(p=>{ const l=M[M.length-1]; if(l && Math.abs(l[0]-p[0])<1e-9 && l[1]===p[1]) return; M.push(p); });
  return M;
}
function dmRegionsInsert(R, A, B, P){
  const L=B-A, out=[];
  R.forEach(r=>{ if(r[1]<=P+1e-9) out.push(r.slice()); else if(r[0]>=P-1e-9) out.push([r[0]+L, r[1]+L, r[2]]); else { out.push([r[0], P, r[2]]); out.push([P+L, r[1]+L, r[2]]); }
    const a=Math.max(A, r[0]), b=Math.min(B, r[1]); if(b-a>1e-9) out.push([a+P-A, b+P-A, r[2]]); });
  return out.sort((p,q)=>p[0]-q[0]);
}
function dmSecCopy(toEnd){
  const L=SONG.sections||[], s=L[DM.sec]; if(!s) return;
  const A=s.a, B=s.b, Ln=B-A, P=toEnd ? dmEndBeat() : B;
  if(P+Ln>MAX_BARS*4){ dmSecSay(t("secNoRoom")); return; }
  /* first, the new pieces of every recording, so nothing is changed if one track has too many */
  const plan=[];
  for(let i=0;i<NT;i++){ const x=SONG.tracks[i];
    for(const c of [x.clip].concat(x.takes||[]).filter(Boolean)){
      let keep=[]; pcs(c).forEach(q=>{ dmCutAt(c, Object.assign({}, q), P).forEach(u=>keep.push(u.at>=P-1e-6 ? Object.assign({}, u, {at:u.at+Ln}) : u)); });
      const all=cleanPieces(keep.concat(dmPiecesIn(c, A, B, P))) || [];
      if(all.length>64 || keep.length+dmPiecesIn(c, A, B, P).length>64){ dmSecSay(t("secTooMany",{n:i+1})); return; }
      plan.push({c:c, P:all}); } }
  dmRemember("song", SONG.sel, "");
  plan.forEach(o=>{ o.c.pieces=o.P.length ? o.P : o.c.pieces; o.c.psel=0; tidyPieces(o.c); });
  SONG.tracks.forEach(x=>{
    if(x.lines) AUTO_KEYS.forEach(k=>{ const Lk=x.lines[k]; if(Lk && Lk.length) x.lines[k]=dmLineInsert(Lk, A, B, P); });
    if(x.lines){ const c=cleanLines(x.lines); if(c) x.lines=c; else delete x.lines; }
    if(x.comp) x.comp=dmRegionsInsert(x.comp, A, B, P); });
  const S2=L.map(q=>q.a>=P ? Object.assign({}, q, {a:q.a+Ln, b:q.b+Ln}) : Object.assign({}, q)); S2.push(Object.assign({}, s, {a:P, b:P+Ln}));
  SONG.sections=dmCleanSecs(S2); DM.sec=SONG.sections.findIndex(q=>q.a===P);
  dmSecSay(toEnd ? t("secAtEnd",{name:dmSecName(s), a:P/4+1}) : t("secCopied",{name:dmSecName(s), a:P/4+1, n:Ln/4}));
  songChanged(); stretchAll();
}
function dmSecSet(k, a, b){
  const L=SONG.sections, s=L && L[k]; if(!s) return;
  dmRemember("song", SONG.sel, "secedge"+k); s.a=a; s.b=b; SONG.sections=dmCleanSecs(L)||undefined; if(!SONG.sections) delete SONG.sections;
  dmSecSay(t("secEdge",{name:dmSecName(s), a:a/4+1, b:b/4})); dmSecChanged();
}

/* ══ the take lanes, under a track ══ */
function dmTakeRows(i){
  const x=SONG.tracks[i]; if(!x.clip || !x.takes || !x.takes.length || x.tkHide) return "";
  const n=tlBars(), bs=barSec(), W=n*4, on=dmOnBeats(x), z=VIEW.zoom;
  return dmTakeList(x).map((c,k)=>{
    const blocks=pcs(c).map(p=>{ const st=pAt(p)/bs, len=p.n*pLen(c,p)/bs, l=Math.min(100, st/n*100), w=Math.max(0.6, Math.min(100-l, len/n*100));
      return `<span class="st-tkb" style="left:${l.toFixed(4)}%;width:${w.toFixed(4)}%">${waveSvg(c, p, Math.min(3000, Math.max(16, Math.round(w*2.4*z))))}</span>`; }).join("");
    const cs=clipStart(c)/songBeat(), ce=clipEnd(c,false)/songBeat();
    const lit=(on.get(c.id)||[]).map(([a,b])=>{ a=Math.max(a, cs); b=Math.min(b, ce, W); if(!(b>a)) return ""; return `<span class="st-tkon" style="left:${(a/W*100).toFixed(4)}%;width:${((b-a)/W*100).toFixed(4)}%"></span>`; }).join("");
    return `<div class="st-tkr" data-tkr="${i}" style="--c:${colOf(i)}"><span class="st-ln st-tkn">${esc(t("takeLane",{n:k+1}))}</span>`+
      `<span class="st-tkt" data-tkt="${i}" data-tk="${c.id}" role="group" aria-label="${esc(t("takeLaneAria",{n:k+1, k:i+1}))}">${blocks}${lit}</span></div>`; }).join("");
}
/* where a take plays, in words: "bars 1 to 2 and 5 to 8" */
function dmWhere(iv){
  const parts=iv.map(([a,b])=>{ const A=Math.floor(a/4+1e-6)+1, B=Math.max(A, Math.ceil(b/4-1e-6)); return A===B ? t("tkBar1",{a:A}) : t("tkBars",{a:A, b:B}); });
  return parts.length ? andList(parts) : t("tkNowhere");
}
function dmTakePlays(x, c){ const on=dmOnBeats(x), cs=clipStart(c)/songBeat(), ce=clipEnd(c,false)/songBeat();
  return (on.get(c.id)||[]).map(([a,b])=>[Math.max(a,cs), Math.min(b,ce)]).filter(([a,b])=>b-a>1e-6); }
function dmChoose(i, id, a, b){
  const x=SONG.tracks[i]; if(!x.clip) return;
  dmRemember("trk", i, ""); dmSetRegion(x, a, b, id);
  const c=dmTakeList(x).find(q=>q.id===id); DM.msg=t("takeChose",{n:dmTakeNo(x, id), where:dmWhere(dmTakePlays(x, c))});
  if(SONG.sel!==i) SONG.sel=i;
  songChanged();
}
function dmTakeBtn(o, i){
  const b=document.getElementById("takeBtn"); if(!b) return;
  const x=SONG.tracks[i], c=x.clip, k=o ? layerOfSrc(o) : "", kc=c ? layerOfClip(c) : "";
  const same=!!(c && !c.voice && k && kc && k.split(":")[0]===kc.split(":")[0] && !(o.kind==="take" ? (c.src===INBOX_KEY && c.tid===o.x.id) : (c.src===o.s.key && c.at===(o.v.rec.at||0))));
  b.hidden=!same; b.textContent=t("takeBtn"); b.setAttribute("data-take", o ? o.id : ""); b.disabled=!!S.busy;
}
/* Add as another take: the take in place stays as a take lane; the new one goes on, on the same bars, and plays */
async function dmAddTake(srcId, ti, atBar){
  const x=SONG.tracks[ti], old=x.clip; if(!old || S.busy) return;
  const was=DM_SNAPS.trk.get(ti);
  x.takes=(x.takes||[]).concat([old]);   /* first, so putOn's drop keeps the take's sound */
  await putOn(srcId, ti, atBar); /* AOG-DESK-ARM-V1 */
  if(x.clip===old || !x.clip){ x.takes=x.takes.filter(c=>c.id!==old.id); dmTakesTidy(x); songChanged(); return; }
  x.takes=x.takes.filter(c=>c.id!==x.clip.id); delete x.tkHide;
  while(x.takes.length>DM_MAX_TAKES){ const g=x.takes.shift(); DM.msg=t("tkFull"); dmTakesTidy(x); dropClip(g.id); }
  dmTakesTidy(x);
  dmRemember("trk", ti, "", was);
  DM.msg=t("takeAdded",{n:dmTakeNo(x, x.clip.id), k:ti+1}); DM.more="tk"; dmMoreSave();
  songChanged(); stretchAll();
}
function dmTakeRemove(i, id){
  const x=SONG.tracks[i]; if(!x.clip) return;
  const n=dmTakeNo(x, id); dmRemember("trk", i, "");
  if(x.clip.id===id){ x.clip=null; dmPromoteTake(x); } else { x.takes=(x.takes||[]).filter(c=>c.id!==id); dmTakesTidy(x); }
  DM.msg=t("tkRmd",{n:n}); songChanged();   /* its sound stays until the page is opened again, so Undo can bring it back */
}

/* ══ more for this track: the menu, the effects, the takes, the name and colour, the clipboard ══ */
function dmMoreSave(){ try{ localStorage.setItem("aog.studio.more.v1", DM.more||""); }catch(e){} }
function dmSlHtml(k, K, v){
  const id="fx"+k+"-"+K[0];
  if(K[1]==="track") return `<label class="st-field"><span class="st-lab">${esc(t("k_key"))}</span><select id="${id}" data-slot="${k}" data-fxk="${K[0]}">`+
    `<option value="-1"${v<0?" selected":""}>${esc(t("keyNone"))}</option>`+SONG.tracks.map((x,j)=>j===SONG.sel ? "" : `<option value="${j}"${j===v?" selected":""}>${esc(t("trackN",{n:j+1})+" · "+laneName(j))}</option>`).join("")+`</select></label>`;
  if(K.length===3) return `<label class="st-field"><span class="st-lab">${esc(t("k_typ"))}</span><select id="${id}" data-slot="${k}" data-fxk="${K[0]}">`+K.slice(1).map(o=>`<option value="${o}"${o===v?" selected":""}>${esc(t("typ_"+o))}</option>`).join("")+`</select></label>`;
  const hz=K[5]==="hz", lo=hz ? 0 : K[1], hi=hz ? 1000 : K[2], st=hz ? 1 : K[3], val=hz ? dmHzPos(K, v) : v, w=dmKnobWords(K, v);
  return `<label class="st-sl fx" for="${id}"><span class="st-lab">${esc(t("k_"+K[0]))}</span><output id="${id}-o">${esc(w)}</output>`+
    `<input type="range" id="${id}" data-slot="${k}" data-fxk="${K[0]}" min="${lo}" max="${hi}" step="${st}" value="${val}" aria-valuetext="${esc(w)}"></label>`;
}
function dmFxHtml(i){
  const x=SONG.tracks[i], F=x.fx||[];
  let h=`<p class="st-line" style="margin:0">${esc(t("fxHint"))}</p>`;
  for(let k=0;k<DM_NSLOT;k++){ const s=F[k];
    h+=`<div class="st-fxs" data-fxslot="${k}"><div class="st-fxh"><label class="st-field"><span class="st-lab">${esc(t("slotN",{n:k+1}))}</span><select id="fxt${k}" data-fxt="${k}">`+
      [""].concat(DM_FX_KEYS).map(q=>`<option value="${q}"${(s ? s.t : "")===q?" selected":""}>${esc(q ? t("fx_"+q) : t("fxEmpty"))}</option>`).join("")+`</select></label>`;
    if(s) h+=`<button type="button" class="st-btn" data-fxa="on" data-slot="${k}" aria-pressed="${s.on!==false}" aria-label="${esc(t("fxOnAria",{n:k+1}))}">${esc(t(s.on!==false ? "fxOn" : "fxOff"))}</button>`+
      `<button type="button" class="st-btn" data-fxa="up" data-slot="${k}" aria-label="${esc(t("fxUpAria",{n:k+1}))}"${k===0?" disabled":""}>${esc(t("fxUp"))}</button>`+
      `<button type="button" class="st-btn" data-fxa="down" data-slot="${k}" aria-label="${esc(t("fxDownAria",{n:k+1}))}"${k===DM_NSLOT-1?" disabled":""}>${esc(t("fxDown"))}</button>`;
    h+=`</div>`;
    if(s){ h+=`<div class="st-fxk">${DM_FX[s.t].knobs.map(K=>dmSlHtml(k, K, s.p[K[0]])).join("")}</div>`;
      if(DM_FX[s.t].nComp) h+=`<p class="st-gr" id="gr${k}" aria-live="off">${esc(t("grRest"))}</p>`;
      if(s.t==="duck") h+=`<p class="st-line" style="margin:0">${esc(t("duckHint"))}</p>`;
      if(s.t==="tune") h+=`<p class="st-line" style="margin:0">${esc(t("tuneHint",{key:dmKeyWords()}))}</p><p class="st-gr" id="tuneSay${k}" aria-live="polite">${esc(DM.tuning ? t("tuning") : "")}</p>`; }
    h+=`</div>`; }
  return h;
}
function dmTkHtml(i){
  const x=SONG.tracks[i], L=x.clip ? dmTakeList(x) : [];
  if(L.length<2) return `<p class="st-line" style="margin:0">${esc(t("tkOne"))}</p>`;
  const n=tlBars();
  return `<p class="st-line" style="margin:0">${esc(t("tkHas",{n:L.length}))}</p><div class="st-tkl">`+L.map((c,k)=>{
      const nm=c.voice ? t("voiceN",{n:c.vn||1}) : c.src===INBOX_KEY ? takeLabel({from:c.from, n:c.tn, name:c.name}) : (c.name||"");
      return `<div class="st-rec"><div class="st-rtx"><b>${esc(t("takeLane",{n:k+1}))}</b><span class="st-cn">${esc([nm, clockLen(c.sec), t("tkPlays",{list:dmWhere(dmTakePlays(x,c))})].filter(Boolean).join(" · "))}</span></div>`+
        `<button type="button" class="st-btn st-clear" data-dmt="rm" data-tk="${esc(c.id)}">${esc(t("tkRm",{n:k+1}))}</button></div>`; }).join("")+`</div>`+
    `<div class="st-row"><label class="st-field"><span class="st-lab">${esc(t("tkUse"))}</span><select id="tkUse">${L.map((c,k)=>`<option value="${esc(c.id)}">${esc(t("takeLane",{n:k+1}))}</option>`).join("")}</select></label>`+
    `<label class="st-field"><span class="st-lab">${esc(t("tkFrom"))}</span><select id="tkFrom">${dmBarOpts(1, n, 1)}</select></label>`+
    `<label class="st-field"><span class="st-lab">${esc(t("tkTo"))}</span><select id="tkTo">${dmBarOpts(1, n, 1)}</select></label>`+
    `<button type="button" class="st-btn st-go" data-dmt="use">${esc(t("tkUseBtn"))}</button></div>`+
    `<div class="st-row"><button type="button" class="st-btn" data-dmt="lanes" aria-pressed="${!x.tkHide}">${esc(t("tkShow"))}</button></div>`;
}
function dmLookHtml(i){
  const x=SONG.tracks[i], cur=x.col || DM_PAL_KEYS[i];
  return `<div class="st-row"><label class="st-field st-name"><span class="st-lab">${esc(t("lkName"))}</span><input type="text" id="tkName" maxlength="24" autocomplete="off" enterkeyhint="done"></label>`+
    `<label class="st-field"><span class="st-lab">${esc(t("lkCol"))}</span><select id="tkCol">`+DM_PAL_KEYS.map(k=>`<option value="${k}"${k===cur?" selected":""}>${esc(L(DM_PAL[k]))}</option>`).join("")+`</select></label>`+
    `<span class="st-sw" style="--c:${colOf(i)}" aria-hidden="true"></span></div>`;
}
function dmPaintMore(force){
  const box=document.getElementById("moreBox"); if(!box) return;
  const i=SONG.sel, x=SONG.tracks[i], nOn=dmFxOn(x).length, nT=x.clip ? dmTakeList(x).length : 0, v=DM.more;
  let h=`<div class="st-mt">`;
  const cb=DM.clip;
  if(cb){ const cur=dmPlayBeat();
    h+=`<div class="st-clipb"><p class="st-info">${esc(t("cOn",{name:cb.name, n:cb.n, len:clockLen(cb.len)}))}</p><div class="st-row">`+
      `<label class="st-field"><span class="st-lab">${esc(t("cAt",{n:i+1}))}</span><select id="pasteAt"><option value="">${esc(t("cPh",{w:posFine(VIEW.snap ? Math.round(cur) : cur)}))}</option>`+
      Array.from({length:MAX_BARS}, (_,b)=>`<option value="${b*4}">${esc(t("barN",{n:b+1}))}</option>`).join("")+`</select></label>`+
      `<button type="button" class="st-btn st-go" id="pasteBtn">${esc(t("cPaste"))}</button><button type="button" class="st-btn" id="clipClear">${esc(t("cEmpty"))}</button></div></div>`; }
  h+=`<label class="st-field st-pick"><span class="st-lab">${esc(t("mtLab",{n:i+1}))}</span><select id="mtSel">`+
    `<option value=""${v===""?" selected":""}>${esc(t("mtClosed"))}</option>`+
    `<option value="fx"${v==="fx"?" selected":""}>${esc(nOn ? t(nOn===1 ? "mtFx1" : "mtFxN",{n:nOn}) : t("mtFx0"))}</option>`+
    `<option value="tk"${v==="tk"?" selected":""}>${esc(t("mtTk",{n:Math.max(1, nT)}))}</option>`+
    `<option value="look"${v==="look"?" selected":""}>${esc(t("mtLook"))}</option></select></label>`;
  if(v==="fx") h+=dmFxHtml(i); else if(v==="tk") h+=dmTkHtml(i); else if(v==="look") h+=dmLookHtml(i);
  h+=`<p class="st-line" id="mtLine" aria-live="polite">${esc(DM.msg)}</p></div>`;
  const pa=document.getElementById("pasteAt"), paV=pa ? pa.value : "";
  if(!force && box._h===h) return;
  const fa=document.activeElement, keep=fa && box.contains(fa) ? (fa.id || "") : "";
  box._h=h; box.innerHTML=h;
  const pa2=document.getElementById("pasteAt"); if(pa2 && paV) pa2.value=paV;
  const nm=document.getElementById("tkName"); if(nm){ nm.value=x.name||""; nm.placeholder=dmLaneDefault(i); }
  if(keep){ const el=document.getElementById(keep); if(el && !el.disabled) try{ el.focus({preventScroll:true}); }catch(e){ el.focus(); } }
}
function dmLaneDefault(i){ const x=SONG.tracks[i], n=x.name; delete x.name; const d=laneName(i); if(n) x.name=n; return d; }
function dmPieceRow(c, p){
  return `<div class="st-row st-pr"><button type="button" class="st-btn" data-dm="split">${esc(t("splitBtn"))}</button>`+
    `<button type="button" class="st-btn" data-dm="rev" aria-pressed="${p.rev ? "true" : "false"}">${esc(t("revBtn"))}</button>`+
    `<button type="button" class="st-btn" data-dm="ccopy">${esc(t("cCopy"))}</button><button type="button" class="st-btn" data-dm="ccut">${esc(t("cCut"))}</button></div>`;
}
function dmPitchWords(v){ return !v ? t("pit0") : v>0 ? t(v===1 ? "pitUp1" : "pitUp",{n:v}) : t(v===-1 ? "pitDn1" : "pitDn",{n:-v}); }
function dmPitchRow(c){
  const v=c.pitch||0, w=dmPitchWords(v);
  return `<div class="st-pit"><label class="st-lab" for="ptR">${esc(t("pitLab"))}</label><input type="range" id="ptR" min="-12" max="12" step="1" value="${v}" aria-label="${esc(t("pitAria",{n:SONG.sel+1}))}" aria-valuetext="${esc(w)}"><output id="ptOut" for="ptR">${esc(w)}</output></div>`;
}
/* AOG-DESK-ECHO-SYNC-V1: the Echo's time, under the whole song's knobs */
function dmEchoHtml(){
  const v=SONG.master.et||"d8";
  return `<label class="st-field st-et"><span class="st-lab">${esc(t("etLab"))}</span><select id="etSel">`+ECHO_KEYS.map(k=>`<option value="${k}"${k===v?" selected":""}>${esc(t("et_"+k))}</option>`).join("")+`</select></label>`;
}

/* ══ AOG-DESK-VERSIONS-V1 · versions of a song, on this device ══
   The arrangement of each version is kept in this browser's IndexedDB (the desk's own store, as "ver:<id>"); its
   recordings are the very copies the song uses, never made again. The list (names and times) is in localStorage. */
const DM_VKEY="aog.studio.versions.v1", DM_VMAX=20;
function dmVerLoadList(){ try{ const a=JSON.parse(localStorage.getItem(DM_VKEY)||"[]"); DM.vers=Array.isArray(a) ? a.filter(v=>v && /^v[a-z0-9]{4,40}$/.test(v.id) && Array.isArray(v.ids)).slice(0, DM_VMAX) : []; }catch(e){ DM.vers=[]; } }
function dmVerSaveList(){ try{ localStorage.setItem(DM_VKEY, JSON.stringify(DM.vers)); }catch(e){} }
function dmVerUses(id){ return DM.vers.some(v=>v.ids.indexOf(id)>=0); }
function dmKeepIds(keep){
  dmTakeRefs().forEach(r=>keep.add(r.c.id));
  DM.vers.forEach(v=>{ keep.add("ver:"+v.id); v.ids.forEach(id=>keep.add(id)); });
  if(DM.cmp) [DM.cmp.a, DM.cmp.b].forEach(sg=>dmSongClips(sg).forEach(c=>keep.add(c.id)));
}
function dmNoSave(){ return !!(DM.cmp && SONG===DM.cmp.b); }
function dmVerSay(w){ const el=document.getElementById("verMsg"); if(el) el.textContent=w; }
async function dmVerSave(){
  const nmEl=document.getElementById("verName"), name=(nmEl.value||"").replace(/[\u0000-\u001f]/g,"").trim().slice(0,40) || t("verDefault",{n:DM.vers.length+1});
  if(DM.cmp) dmCmpEnd();
  const id="v"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  try{ await sput("ver:"+id, {song:JSON.parse(JSON.stringify(SONG)), bpm:songBpm()}); }catch(e){ dmVerSay(t("fail")); return; }
  DM.vers.unshift({id:id, name:name, at:Date.now(), ids:dmAllClips().map(c=>c.id)});
  while(DM.vers.length>DM_VMAX){ const o=DM.vers.pop(); sdel("ver:"+o.id); }
  dmVerSaveList(); nmEl.value=""; dmVerSay(t("verSaved",{name:name})); dmPaintVer();
}
/* a version's arrangement, with every recording it needs ready to play */
async function dmVerLoad(id){
  const r=await sget("ver:"+id); if(!r || !r.song) return null;
  const sg=cleanSong(r.song); let lost=false;
  for(const c of dmSongClips(sg)){
    if(BUF.has(c.id)) continue;
    try{ const v=await sget(c.id); if(!v || !v.wav) throw new Error("gone"); const info=await wavInfo(v.wav); BUF.set(c.id, await decodeWav(v.wav, info ? info.sr : MIX_SR)); }
    catch(e){ lost=true; sg.tracks.forEach(x=>{ if(x.clip && x.clip.id===c.id) x.clip=null; if(x.takes) x.takes=x.takes.filter(q=>q.id!==c.id); }); }
  }
  sg.tracks.forEach(x=>dmPromoteTake(x));
  return {song:sg, bpm:r.bpm, lost:lost};
}
async function dmVerOpen(id){
  const v=DM.vers.find(q=>q.id===id); if(!v) return;
  dmCmpEnd(); stop();
  const r=await dmVerLoad(id); if(!r){ dmVerSay(t("fail")); return; }
  SONG=r.song; UNDO.length=0; REDO.length=0; S.edMsg=""; DM.sec=-1; save();
  try{ if(r.bpm>0 && window.AOGSong && Math.abs(r.bpm-songBpm())>0.01) AOGSong.set({bpm:r.bpm}); }catch(e){}
  liveApply(applyAll); paintAll(); stretchAll();
  dmVerSay(t(r.lost ? "verLost" : "opened",{name:v.name}));
}
async function dmCmpStart(id){
  const v=DM.vers.find(q=>q.id===id); if(!v) return;
  dmCmpEnd();
  const r=await dmVerLoad(id); if(!r){ dmVerSay(t("fail")); return; }
  DM.cmp={a:SONG, b:r.song, on:"a", name:v.name, id:id};
  dmVerSay(t("verCmpOn")); dmPaintVer();
}
function dmCmpShow(){ liveApply(applyAll); reschedule(); paintTransport(); paintTimeline(); paintTrack(); paintMixer(true); stretchAll(); dmPaintVer(); }
function dmCmpPick(w){ const C=DM.cmp; if(!C || C.on===w) return; C.on=w; SONG=w==="b" ? C.b : C.a; dmCmpShow(); }
function dmCmpEnd(){ const C=DM.cmp; if(!C) return; DM.cmp=null; if(SONG!==C.a){ SONG=C.a; dmCmpShow(); } else dmPaintVer(); }
function dmPaintVer(){
  const sv=document.getElementById("verSave"); if(!sv) return;
  sv.textContent=t("verSave"); document.getElementById("verName").placeholder=t("verDefault",{n:DM.vers.length+1});
  const box=document.getElementById("verList"), C=DM.cmp;
  const fa=document.activeElement, keep=fa && box.contains(fa) ? fa.id : "", selV=document.getElementById("verSel") ? document.getElementById("verSel").value : "";
  if(!DM.vers.length){ box.innerHTML=`<p class="st-info">${esc(t("verNone"))}</p>`; return; }
  box.innerHTML=`<div class="st-row"><label class="st-field"><span class="st-lab">${esc(t("verList"))}</span><select id="verSel">`+DM.vers.map(v=>`<option value="${esc(v.id)}">${esc(v.name+" · "+whenShort(v.at))}</option>`).join("")+`</select></label>`+
    `<button type="button" class="st-btn" id="verOpen">${esc(t("open"))}</button><button type="button" class="st-btn" id="verCmp">${esc(t("verCmp"))}</button><button type="button" class="st-btn st-clear" id="verDel">${esc(t("remove"))}</button></div>`+
    (C ? `<div class="st-vab" role="group" aria-label="${esc(t("verCmp"))}"><button type="button" class="st-btn" id="verA" aria-pressed="${C.on==="a"}">${esc(t("verA"))}</button>`+
      `<button type="button" class="st-btn" id="verB" aria-pressed="${C.on==="b"}">${esc(t("verB",{name:C.name}))}</button><button type="button" class="st-btn" id="verStop">${esc(t("verStop"))}</button></div>` : "");
  const sel=document.getElementById("verSel"); if(selV && DM.vers.some(v=>v.id===selV)) sel.value=selV; else if(C) sel.value=C.id;
  if(keep){ const el=document.getElementById(keep); if(el) try{ el.focus({preventScroll:true}); }catch(e){ el.focus(); } }
}
function dmVerAsk(text, go){
  DM.ask=go; document.getElementById("verAskT").textContent=text;
  document.getElementById("verYes").textContent=t(go.del ? "removeYes" : "openYes"); document.getElementById("verNo").textContent=t(go.del ? "removeNo" : "openNo");
  document.getElementById("verAsk").hidden=false; document.getElementById("verNo").focus();
}

/* ══ wiring ══ */
function dmInit(){
  dmVerLoadList();
  try{ if(window.AOGSong) AOGSong.on(()=>{ try{ stretchAll(); dmPaintMore(true); }catch(e){} }); }catch(e){}   /* AOG-DESK-TUNE-V1: a new key, a new tuning */
  try{ chainLatency(); }catch(e){}   /* the compressors' 6 ms, measured once, early */
  const $$=id=>document.getElementById(id);
  /* the piece's quick edits and the pitch, in the track's panel */
  $$("clipBox").addEventListener("click", e=>{ const b=e.target.closest && e.target.closest("[data-dm]"); if(!b || b.disabled) return; const a=b.getAttribute("data-dm");
    if(a==="split") dmSplit(); else if(a==="rev") dmReverse(); else if(a==="ccopy") dmCopy(false); else if(a==="ccut") dmCopy(true); });
  $$("clipBox").addEventListener("input", e=>{ if(e.target.id!=="ptR") return; const w=dmPitchWords(+e.target.value), o=$$("ptOut"); if(o) o.textContent=w; e.target.setAttribute("aria-valuetext", w); });
  $$("clipBox").addEventListener("change", e=>{ if(e.target.id!=="ptR") return; const i=SONG.sel, c=SONG.tracks[i].clip; if(!c) return;
    const v=Math.round(num(+e.target.value,-12,12,0)); if(v===(c.pitch||0)) return; remember(i, ++UG); if(v) c.pitch=v; else delete c.pitch; S.edMsg=""; S.edAt="spd"; songChanged(); stretchAll(); });
  /* Add as another take */
  $$("recs").addEventListener("click", e=>{ const b=e.target.closest && e.target.closest("#takeBtn"); if(b && !b.disabled) dmAddTake(b.getAttribute("data-take"), SONG.sel); });
  /* more for this track */
  const mb=$$("moreBox");
  mb.addEventListener("change", e=>{ const el=e.target, i=SONG.sel, x=SONG.tracks[i];
    if(el.id==="mtSel"){ DM.more=el.value; DM.msg=""; dmMoreSave(); dmPaintMore(); return; }
    if(el.hasAttribute("data-fxt")){ const k=+el.getAttribute("data-fxt"), v=el.value; dmRemember("fx", i, "");
      const F=(x.fx||[null,null,null]).slice(); while(F.length<DM_NSLOT) F.push(null);
      F[k]=DM_FX[v] ? {t:v, on:true, p:dmDefaults(v)} : null; if(v==="duck") F[k].p.key=dmGuessKey(i);
      const c=dmCleanFx(F); if(c) x.fx=c; else delete x.fx; DM.msg=""; songChanged(); stretchAll(); return; }
    if(el.hasAttribute("data-fxk")){ const k=+el.getAttribute("data-slot"), s=x.fx && x.fx[k]; if(!s) return;
      if(el.tagName==="SELECT"){ dmRemember("fx", i, ""); const fk=el.getAttribute("data-fxk"), K=DM_FX[s.t].knobs.find(q=>q[0]===fk);
        s.p[fk]=K && K[1]==="track" ? Math.round(num(+el.value, -1, NT-1, -1)) : el.value;
        if(K && K[1]==="track"){ DM.msg=""; songChanged(); return; } save(); liveApply(E=>applyTrack(E,i)); return; }
      if(DM_FX[s.t].lfo) reschedule();   /* a new speed for the Chorus's or the Doubler's waves */
      if(s.t==="tune"){ save(); stretchAll(); }   /* the tuned copy is made again */
      return; }
    if(el.id==="tkCol"){ dmRemember("look", i, ""); if(el.value===DM_PAL_KEYS[i] || !DM_PAL[el.value]) delete x.col; else x.col=el.value; save(); paintTimeline(); paintMixer(); dmPaintMore(true); return; }
    if(el.id==="tkName" && DM.wasLook!=null){ const w=DM.wasLook; DM.wasLook=null; if(w!==DM_SNAPS.look.get(i)) dmRemember("look", i, "", w); return; }
  });
  mb.addEventListener("focusin", e=>{ if(e.target.id==="tkName") DM.wasLook=DM_SNAPS.look.get(SONG.sel); });
  mb.addEventListener("input", e=>{ const el=e.target, i=SONG.sel, x=SONG.tracks[i];
    if(el.id==="tkName"){ const n=String(el.value||"").replace(/[\u0000-\u001f]/g,"").trim().slice(0,24); if(n) x.name=n; else delete x.name; saveSoon(); paintTimeline(); paintMixer(); return; }
    if(!el.hasAttribute("data-fxk") || el.tagName==="SELECT") return;
    const k=+el.getAttribute("data-slot"), s=x.fx && x.fx[k]; if(!s) return;
    const key=el.getAttribute("data-fxk"), K=DM_FX[s.t].knobs.find(q=>q[0]===key); if(!K) return;
    let v=K[5]==="hz" ? dmPosHz(K, +el.value) : +el.value; v=Math.max(K[1], Math.min(K[2], v)); if(v===s.p[key]) return;
    dmRemember("fx", i, "fx|"+i+"|"+k+"|"+key); s.p[key]=v;
    const w=dmKnobWords(K, v), o=$$(el.id+"-o"); if(o) o.textContent=w; el.setAttribute("aria-valuetext", w);
    liveApply(E=>applyTrack(E,i)); saveSoon();
  });
  mb.addEventListener("keydown", e=>{ if(e.key==="Enter" && e.target.id==="tkName") e.target.blur(); });
  mb.addEventListener("click", e=>{ const b=e.target.closest && e.target.closest("button"); if(!b || b.disabled) return; const i=SONG.sel, x=SONG.tracks[i];
    if(b.id==="pasteBtn"){ dmPaste(); return; }
    if(b.id==="clipClear"){ DM.clip=null; DM.msg=""; dmPaintMore(true); const s=$$("mtSel"); if(s) s.focus(); return; }
    const fa=b.getAttribute("data-fxa");
    if(fa){ const k=+b.getAttribute("data-slot"), F=(x.fx||[]).slice(); while(F.length<DM_NSLOT) F.push(null); if(!F[k]) return; dmRemember("fx", i, "");
      if(fa==="on") F[k]=Object.assign({}, F[k], {on:F[k].on===false});
      else { const j=fa==="up" ? k-1 : k+1; if(j<0 || j>=DM_NSLOT) return; const tmp=F[j]; F[j]=F[k]; F[k]=tmp; }
      const c=dmCleanFx(F); if(c) x.fx=c; else delete x.fx; DM.msg=""; songChanged(); stretchAll();
      if(fa!=="on"){ const j=fa==="up" ? k-1 : k+1, nb=document.querySelector(`#moreBox [data-fxa="${fa}"][data-slot="${j}"]`)||$$("fxt"+j); if(nb) try{ (nb.disabled ? $$("fxt"+j) : nb).focus({preventScroll:true}); }catch(er){} }
      return; }
    const ta=b.getAttribute("data-dmt");
    if(ta==="rm") dmTakeRemove(i, b.getAttribute("data-tk"));
    else if(ta==="use"){ const id=$$("tkUse").value, a=(+$$("tkFrom").value-1)*4, z=(+$$("tkTo").value)*4; if(z>a) dmChoose(i, id, a, z); }
    else if(ta==="lanes"){ dmRemember("trk", i, ""); if(x.tkHide) delete x.tkHide; else x.tkHide=true; save(); paintTimeline(); dmPaintMore(true); }
  });
  /* the mixer's moves are Undo steps too: taken just before the mixer's own handler changes the song (capture) */
  const mixWas=(i, k, v)=>!lineOf(i, k) && SONG.tracks[i] && SONG.tracks[i][k]!==v;
  $$("mixer").addEventListener("input", e=>{ const r=e.target; if(!r.matches || !r.matches("input[type=range]")) return; const st=r.closest(".st-strip"); if(!st) return;
    const i=+st.getAttribute("data-tr"), k=r.getAttribute("data-k"); if(mixWas(i, k, +r.value)) dmRemember("mix", SONG.sel, "mix|"+i+"|"+k); }, true);
  $$("mixer").addEventListener("click", e=>{ if(e.target.closest && e.target.closest("[data-ms]")) dmRemember("mix", SONG.sel, ""); }, true);
  $$("master").addEventListener("input", e=>{ const r=e.target; if(!r.matches || !r.matches("input[type=range]")) return; const k=r.getAttribute("data-k");
    if(SONG.master[k]!==+r.value) dmRemember("mix", SONG.sel, "m|"+k); }, true);
  $$("master").addEventListener("change", e=>{ if(e.target.id!=="etSel") return; const v=e.target.value; if(ECHO_T[v]==null || v===(SONG.master.et||"d8")) return;
    dmRemember("mix", SONG.sel, ""); if(v==="d8") delete SONG.master.et; else SONG.master.et=v; save(); liveApply(applyMaster); });
  /* the take lanes and the sections, on the song */
  const tl=$$("timeline");
  const beatOfX=(el, cx)=>{ const r=el.getBoundingClientRect(); return Math.max(0, Math.min(tlBars()*4, (cx-r.left)/Math.max(1, r.width)*tlBars()*4)); };
  tl.addEventListener("pointerdown", e=>{
    const tk=e.target.closest && e.target.closest(".st-tkt[data-tkt]");
    if(tk && !(e.pointerType==="mouse" && e.button!==0)){ DM.tk={el:tk, i:+tk.getAttribute("data-tkt"), id:tk.getAttribute("data-tk"), x0:e.clientX, b0:beatOfX(tk, e.clientX), pid:e.pointerId, moved:false, band:null}; return; }
    const eh=e.target.closest && e.target.closest(".st-seh");
    if(eh && !(e.pointerType==="mouse" && e.button!==0)){ const sc=eh.closest("[data-sec]"), k=+sc.getAttribute("data-sec"), s=SONG.sections[k];
      DM.secDrag={k:k, edge:eh.getAttribute("data-edge"), el:sc, strip:sc.parentNode, pid:e.pointerId, a:s.a, b:s.b, moved:false};
      e.preventDefault(); try{ eh.setPointerCapture(e.pointerId); }catch(er){} }
  });
  tl.addEventListener("pointermove", e=>{
    const d=DM.tk;
    if(d && e.pointerId===d.pid){
      if(!d.moved){ if(Math.abs(e.clientX-d.x0)<6) return; d.moved=true; try{ d.el.setPointerCapture(e.pointerId); }catch(er){} d.band=document.createElement("span"); d.band.className="st-tksel"; d.el.appendChild(d.band); }
      e.preventDefault(); const b=beatOfX(d.el, e.clientX), W=tlBars()*4, lo=Math.min(d.b0, b), hi=Math.max(d.b0, b);
      d.band.style.left=(lo/W*100).toFixed(3)+"%"; d.band.style.width=((hi-lo)/W*100).toFixed(3)+"%"; d.b1=b; return; }
    const s=DM.secDrag;
    if(s && e.pointerId===s.pid){ e.preventDefault(); s.moved=true;
      const L=SONG.sections, k=s.k, prev=L[k-1], next=L[k+1], bar=Math.round(beatOfX(s.strip, e.clientX)/4)*4, W=tlBars()*4;
      if(s.edge==="a") s.a=Math.max(prev ? prev.b : 0, Math.min(L[k].b-4, bar)); else s.b=Math.min(next ? next.a : MAX_BARS*4, Math.max(L[k].a+4, bar));
      const A=s.edge==="a" ? s.a : L[k].a, B=s.edge==="b" ? s.b : L[k].b;
      s.el.style.left=(A/W*100).toFixed(4)+"%"; s.el.style.width=((B-A)/W*100).toFixed(4)+"%"; }
  });
  const up=e=>{
    const d=DM.tk;
    if(d && e.pointerId===d.pid){ DM.tk=null; if(e.type==="pointercancel"){ if(d.band) d.band.remove(); return; }
      let a, b;
      if(!d.moved){ a=Math.floor(d.b0/4)*4; b=a+4; }
      else { a=Math.min(d.b0, d.b1); b=Math.max(d.b0, d.b1); if(VIEW.snap){ a=Math.round(a); b=Math.round(b); } else { a=Math.round(a*1e6)/1e6; b=Math.round(b*1e6)/1e6; } }
      if(d.band) d.band.remove();
      if(b-a>=0.25) dmChoose(d.i, d.id, a, b); else paintTimeline();
      return; }
    const s=DM.secDrag;
    if(s && e.pointerId===s.pid){ DM.secDrag=null; const sc=SONG.sections[s.k];
      if(e.type==="pointercancel" || !sc || (s.a===sc.a && s.b===sc.b)){ paintTimeline(); return; }
      DM.sec=s.k; dmSecSet(s.k, s.edge==="a" ? s.a : sc.a, s.edge==="b" ? s.b : sc.b); }
  };
  tl.addEventListener("pointerup", up); tl.addEventListener("pointercancel", up);
  tl.addEventListener("click", e=>{ const sc=e.target.closest && e.target.closest(".st-sec[data-sec]"); if(!sc || e.target.closest(".st-seh")) return;
    DM.sec=+sc.getAttribute("data-sec"); paintTimeline(); });
  tl.addEventListener("keydown", e=>{ const sc=e.target.closest && e.target.closest(".st-sec[data-sec]"); if(!sc || (e.key!=="Enter" && e.key!==" ")) return;
    e.preventDefault(); e.stopPropagation(); DM.sec=+sc.getAttribute("data-sec"); paintTimeline(); const s=$$("secName"); if(s) s.focus(); });
  /* the sections' menu and buttons */
  const st=$$("secTools");
  st.addEventListener("change", e=>{ const el=e.target, L=SONG.sections||[], s=L[DM.sec];
    if(el.id==="secSel"){ if(el.value==="new") dmSecNew(); else { DM.sec=el.value==="" ? -1 : +el.value; dmSecSay(""); paintTimeline(); } return; }
    if(!s) return;
    if(el.id==="secName"){ dmRemember("song", SONG.sel, "");
      if(el.value==="own"){ DM.secOwn=DM.sec; if(!s.w){ s.w=dmSecName(s); delete s.n; } } else { delete s.w; s.n=el.value; DM.secOwn=-1; }
      dmSecChanged(); if(el.value==="own"){ const w=$$("secWords"); if(w){ w.focus(); w.select(); } } return; }
    if(el.id==="secFrom" || el.id==="secTo"){ const a=el.id==="secFrom" ? (+el.value-1)*4 : s.a, b=el.id==="secTo" ? (+el.value)*4 : s.b; if(b-a>=4) dmSecSet(DM.sec, a, b); return; }
    if(el.id==="secWords"){ dmSecChanged(); }
  });
  st.addEventListener("focusin", e=>{ if(e.target.id==="secWords") DM.wasSec=DM_SNAPS.song.get(); });
  st.addEventListener("input", e=>{ if(e.target.id!=="secWords") return; const s=(SONG.sections||[])[DM.sec]; if(!s) return;
    if(DM.wasSec){ dmRemember("song", SONG.sel, "", DM.wasSec); DM.wasSec=null; }
    const w=String(e.target.value||"").replace(/[\u0000-\u001f]/g,"").trim().slice(0,24); if(w){ s.w=w; delete s.n; } saveSoon();
    const strip=document.querySelector(`#secStrip [data-sec="${DM.sec}"] b`); if(strip) strip.textContent=dmSecName(s); });
  st.addEventListener("keydown", e=>{ if(e.key==="Enter" && e.target.id==="secWords") e.target.blur(); });
  st.addEventListener("click", e=>{ const b=e.target.closest && e.target.closest("button"); if(!b || b.disabled) return;
    if(b.id==="secEnd") dmSecCopy(true); else if(b.id==="secAfter") dmSecCopy(false);
    else if(b.id==="secDel"){ const L=SONG.sections||[]; if(!L[DM.sec]) return; dmRemember("song", SONG.sel, ""); L.splice(DM.sec, 1); if(L.length) SONG.sections=L; else delete SONG.sections; DM.sec=-1; dmSecSay(t("secGone")); dmSecChanged(); const s=$$("secSel"); if(s) s.focus(); } });
  /* versions */
  $$("verSave").addEventListener("click", dmVerSave);
  $$("verName").addEventListener("keydown", e=>{ if(e.key==="Enter"){ e.preventDefault(); dmVerSave(); } });
  $$("verList").addEventListener("click", e=>{ const b=e.target.closest && e.target.closest("button"); if(!b) return; const id=$$("verSel") ? $$("verSel").value : "", v=DM.vers.find(q=>q.id===id);
    if(b.id==="verOpen" && v) dmVerAsk(t("verAskOpen",{name:v.name}), {run:()=>dmVerOpen(id)});
    else if(b.id==="verDel" && v) dmVerAsk(t("verAskDel",{name:v.name}), {del:true, run:()=>{ if(DM.cmp && DM.cmp.id===id) dmCmpEnd(); DM.vers=DM.vers.filter(q=>q.id!==id); dmVerSaveList(); sdel("ver:"+id); dmVerSay(t("verRemoved",{name:v.name})); dmPaintVer(); }});
    else if(b.id==="verCmp" && v) dmCmpStart(id);
    else if(b.id==="verA") dmCmpPick("a"); else if(b.id==="verB") dmCmpPick("b");
    else if(b.id==="verStop"){ dmCmpEnd(); dmVerSay(""); const s=$$("verCmp"); if(s) s.focus(); } });
  $$("verNo").addEventListener("click", ()=>{ DM.ask=null; $$("verAsk").hidden=true; const o=$$("verOpen"); if(o) o.focus(); });
  $$("verYes").addEventListener("click", ()=>{ const go=DM.ask; DM.ask=null; $$("verAsk").hidden=true; if(go) go.run(); });
}
/* for the tests (music-handoff/tests/studio/more.js, more2.js) */
window.__aogDeskMore={ DM:DM, DM_TUNE:DM_TUNE, dmTuneAll:dmTuneAll, dmBase:dmBase, dmFxChain:dmFxChain, dmTune:dmTune, DM_FX:DM_FX, dmGates:dmGates, dmGateAt:dmGateAt, dmOnBeats:dmOnBeats, dmSetRegion:dmSetRegion, dmCutAt:dmCutAt, dmSplit:dmSplit, dmPlayBeat:dmPlayBeat,
  dmSecCopy:dmSecCopy, dmLineInsert:dmLineInsert, dmCompFr:dmCompFr, dmLagFrames:dmLagFrames, dmRev:dmRev, DM_REV:DM_REV, dmVerSave:dmVerSave, dmVerOpen:dmVerOpen,
  dmCmpStart:dmCmpStart, dmCmpPick:dmCmpPick, dmCmpEnd:dmCmpEnd, dmCleanFx:dmCleanFx, dmDefaults:dmDefaults, dmTakeList:dmTakeList, dmChoose:dmChoose, dmEndBeat:dmEndBeat };
