/* AOG-SOLO-V1 (2026-10-04) — Jimmy: "In guitar there should be a solo mode as well! BLOW my mind" (thinking of the great
   lead players, and of the great slap bassists).

   Solo mode on the neck of the guitar and the bass (music-guitar.html, music-bass.html, both built from
   _work/music/strings_page.html):
     · the scale of the key, lit on the frets the hand can reach: roots ringed, the blue note blue, the notes of the chord
       a little brighter (the notes that land); eight scales in a menu;
     · lead playing with a finger: a bend (push across the string, up to a whole step, and the string is drawn bent),
       vibrato (the finger's own wiggle, or Auto vibrato), slides, hammer-ons and pull-offs, two-hand tapping (Tap), a
       pinch squeal, a whammy bar (the strip at the right of the neck), a kill switch, and feedback that blooms on a held
       note through a high-gain amp;
     · a backing band that plays only when Play is pressed: a quiet rhythm guitar on its own amp, a bass line and drums
       (the drum machine's beat, or a simple one made here), in the key and at the tempo, under the lead;
     · licks to copy, each note lit as it plays; a lead sound picker;
     · on the bass: a tap is a thumb slap and a quick flick up is a pop; the root, fifth and octave shapes are lit.

   The page calls in through a few hooks, each tagged AOG-SOLO-V1: AOGSolo.paint() at the end of litNeck(), down / move /
   up from the neck's pointer handlers, and key() from its key handlers. Everything else lives here, with its own words
   (English and Spanish). Nothing plays and nothing moves on its own: sound starts only from a touch, a key or a Play. */
(function(){
"use strict";
if(typeof NECK==="undefined" || typeof TUNING==="undefined" || typeof S==="undefined" || typeof makeVoice!=="function" || !document.getElementById("neck")) return;

const $q=id=>document.getElementById(id);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const esc=s=>String(s).replace(/[&<>"]/g, ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
const NS="http://www.w3.org/2000/svg";
const f1=v=>(+v).toFixed(1);
const smooth=x=>x<=0?0:x>=1?1:x*x*(3-2*x);

/* ══ words ══════════════════════════════════════════════════════════════════ */
const WD={
  modeGroup:{en:"How the neck plays",es:"Cómo suena el mástil"},
  chords:{en:"Chords",es:"Acordes"}, solo:{en:"Solo",es:"Solo"},
  intro:{en:"Solo mode lights the scale for your key. Every lit note fits.",es:"El modo solo ilumina la escala de tu tono. Toda nota iluminada encaja."},
  scaleLab:{en:"Scale",es:"Escala"},
  soundLab: GTR?{en:"Lead sound",es:"Sonido solista"}:{en:"Solo sound",es:"Sonido para el solo"},
  sc_minpent:{en:"Minor pentatonic",es:"Pentatónica menor"},
  sc_blues:{en:"Blues · with the blue note",es:"Blues · con la nota blue"},
  sc_majpent:{en:"Major pentatonic",es:"Pentatónica mayor"},
  sc_natmin:{en:"Natural minor",es:"Menor natural"},
  sc_major:{en:"Major",es:"Mayor"},
  sc_dorian:{en:"Dorian · minor, a little brighter",es:"Dórica · menor, un poco más brillante"},
  sc_mixo:{en:"Mixolydian · major with a bluesy 7th",es:"Mixolidia · mayor con una 7.ª de blues"},
  sc_harmin:{en:"Harmonic minor · dark and Spanish",es:"Menor armónica · oscura y española"},
  nm_minpent:{en:"minor pentatonic",es:"pentatónica menor"}, nm_blues:{en:"blues",es:"de blues"}, nm_bluesm:{en:"minor blues",es:"de blues menor"},
  nm_majpent:{en:"major pentatonic",es:"pentatónica mayor"}, nm_natmin:{en:"natural minor",es:"menor natural"}, nm_major:{en:"major",es:"mayor"},
  nm_dorian:{en:"Dorian",es:"dórica"}, nm_mixo:{en:"Mixolydian",es:"mixolidia"}, nm_harmin:{en:"harmonic minor",es:"menor armónica"},
  scaleSay:{en:"{root} {name} scale",es:"Escala {name} de {root}"},
  say:{en:"{scale}, frets {a} to {b}",es:"{scale}, trastes {a} a {b}"},
  lgRoot:{en:"{root}, the home note",es:"{root}, la nota casa"},
  lgBlue:{en:"the blue note",es:"la nota blue"},
  lgLand:{en:"fits the chord",es:"va con el acorde"},
  lgFive:{en:"root, fifth and octave",es:"raíz, quinta y octava"},
  techGroup:{en:"Lead tricks",es:"Trucos de solista"},
  tap:{en:"Tap · two hands",es:"Tapping · dos manos"},
  pinch:{en:"Pinch squeal",es:"Armónico chillón"},
  wah:{en:"Wah · talking tone",es:"Wah · tono que habla"},
  vib:{en:"Auto vibrato",es:"Vibrato automático"},
  kill:{en:"Hold to cut",es:"Mantén para cortar"},
  techHelp: GTR?{en:"Tap: every touch plays smoothly, with no pick. Squeal: the next notes whistle high. Wah: the tone talks when you play harder. Vibrato: held notes waver. Cut: silence while you hold it.",
                 es:"Tapping: cada toque suena ligado, sin púa. Chillón: las siguientes notas silban agudo. Wah: el tono habla cuando tocas más fuerte. Vibrato: las notas sostenidas ondulan. Cortar: silencio mientras lo mantienes."}
               :{en:"Tap: every touch plays smoothly, with no slap. Vibrato: held notes waver. Cut: silence while you hold it.",
                 es:"Tapping: cada toque suena ligado, sin golpe. Vibrato: las notas sostenidas ondulan. Cortar: silencio mientras lo mantienes."},
  touch: GTR?{en:"Tap a fret to play. Push up or down to bend the note. Slide along a string to glide. Add a finger higher on a ringing string to hammer on; lift it to pull off. Drag the bar on the right down to dive.",
              es:"Toca un traste para tocar. Empuja arriba o abajo para estirar la nota. Desliza por una cuerda para deslizar el sonido. Pon otro dedo más arriba en una cuerda que suena para ligar; levántalo para soltar. Baja la palanca de la derecha para hundir el sonido."}
            :{en:"Tap a string to slap it. Flick up fast to pop it. Push up or down to bend. Slide along a string to glide.",
              es:"Toca una cuerda para darle un golpe. Sube el dedo rápido para hacer pop. Empuja arriba o abajo para estirar. Desliza por una cuerda para deslizar el sonido."},
  keys: GTR?{en:"On a computer, A S D F G H J K L ; play the scale, low to high. Hold B to bend, V for vibrato, N for the whammy bar and M to cut the sound. Space starts and stops the band.",
             es:"En la computadora, A S D F G H J K L Ñ tocan la escala, de grave a aguda. Mantén B para estirar, V para el vibrato, N para la palanca y M para cortar el sonido. La barra espaciadora empieza y para la banda."}
           :{en:"On a computer, A S D F G H J K L ; play the scale, low to high; hold Shift to pop. Hold B to bend, V for vibrato and M to cut the sound. Space starts and stops the band.",
             es:"En la computadora, A S D F G H J K L Ñ tocan la escala, de grave a aguda; mantén Mayús para hacer pop. Mantén B para estirar, V para el vibrato y M para cortar el sonido. La barra espaciadora empieza y para la banda."},
  whammy:{en:"WHAMMY",es:"PALANCA"},
  whamLab:{en:"Whammy bar. Pull it down to dive.",es:"Palanca de trémolo. Bájala para hundir el sonido."},
  whamRest:{en:"at rest",es:"en reposo"},
  whamDown:{en:"down {n} half steps",es:"{n} semitonos abajo"},
  whamUp:{en:"up {n} half steps",es:"{n} semitonos arriba"},
  bandH:{en:"Play along with a band",es:"Toca con una banda"},
  bandPlay:{en:"▶ Play the band",es:"▶ Tocar la banda"},
  bandStop:{en:"■ Stop the band",es:"■ Parar la banda"},
  bandLine:{en:"The band plays {prog} in {key}, at {n} beats a minute.",es:"La banda toca {prog} en {key}, a {n} pulsos por minuto."},
  drumsUser:{en:"Drums: your beat from the drum machine.",es:"Batería: tu ritmo de la caja de ritmos."},
  drumsOwn:{en:"Drums: a simple beat made here.",es:"Batería: un ritmo sencillo hecho aquí."},
  useBeat:{en:"Play with my drum beat",es:"Tocar con mi ritmo de batería"},
  bassBand:{en:"The band is a rhythm guitar and drums. You are the bass.",es:"La banda es una guitarra rítmica y batería. Tú eres el bajo."},
  tempo:{en:"Tempo",es:"Tempo"},
  bpm:{en:"{n} beats a minute",es:"{n} pulsos por minuto"},
  major:{en:"major",es:"mayor"}, minor:{en:"minor",es:"menor"},
  lickH:{en:"Licks to try",es:"Frases para probar"},
  lickLab:{en:"Lick",es:"Frase"},
  lickPlay:{en:"▶ Play this lick",es:"▶ Tocar esta frase"},
  lickStop:{en:"■ Stop",es:"■ Parar"},
  lickNow:{en:"Watch the lit notes, then copy them.",es:"Mira las notas iluminadas y luego cópialas."},
  lk_blues:{en:"Blues box lick",es:"Frase de blues en la caja"},
  lk_double:{en:"Rock double-stop lick",es:"Frase de rock con dos cuerdas"},
  lk_tap:{en:"Two-hand tapping run",es:"Carrera de tapping a dos manos"},
  lk_shred:{en:"Shred run",es:"Carrera rápida"},
  lk_funk:{en:"Funky single-note line",es:"Línea funky de una nota"},
  lk_bend:{en:"Slow singing bend",es:"Estirón lento y cantado"},
  ld_blues:{en:"A bend on the G string, then down the box to the home note.",es:"Un estirón en la cuerda Sol y luego baja por la caja hasta la nota casa."},
  ld_double:{en:"Two strings at once, a slide, then a bend that meets the note beside it.",es:"Dos cuerdas a la vez, un deslizamiento y luego un estirón que alcanza la nota de al lado."},
  ld_tap:{en:"One hand taps high, the other holds low. Every note is smooth, with no pick.",es:"Una mano golpea arriba y la otra sostiene abajo. Cada nota sale ligada, sin púa."},
  ld_shred:{en:"Fast groups of six down the box: pick one note, pull off to the next.",es:"Grupos rápidos de seis bajando por la caja: púa en una nota y ligado a la siguiente."},
  ld_funk:{en:"Short, bouncy notes on the low strings, with soft ghost notes between.",es:"Notas cortas y saltarinas en las cuerdas graves, con notas fantasma suaves entre ellas."},
  ld_bend:{en:"Bend slowly up a whole step, hold it, and let it sing.",es:"Estira despacio un tono entero, sostenlo y deja que cante."},
  tg_b:{en:"bend",es:"estira"}, tg_h:{en:"hammer",es:"ligado"}, tg_o:{en:"pull",es:"suelta"}, tg_t:{en:"tap",es:"tapping"},
  tg_sl:{en:"slide",es:"desliza"}, tg_g:{en:"ghost",es:"fantasma"}, tg_v:{en:"vibrato",es:"vibrato"},
  playing:{en:"Playing: {name}.",es:"Sonando: {name}."}
};
function w(k, vars){ const e=WD[k]; let s=e?(e[S.lang]||e.en):k; if(vars) Object.keys(vars).forEach(v=>{ s=s.split("{"+v+"}").join(vars[v]); }); return s; }

/* ══ scales: steps above the key's own note; the blue note is the flat fifth ═══════════════════════════════════ */
const SCALES={
  minpent:{iv:[0,3,5,7,10]}, blues:{iv:[0,3,5,6,7,10], blue:6}, majpent:{iv:[0,2,4,7,9]}, natmin:{iv:[0,2,3,5,7,8,10]},
  major:{iv:[0,2,4,5,7,9,11]}, dorian:{iv:[0,2,3,5,7,9,10]}, mixo:{iv:[0,2,4,5,7,9,10]}, harmin:{iv:[0,2,3,5,7,8,11]}
};
const SC_ORDER=["minpent","blues","majpent","natmin","major","dorian","mixo","harmin"];

/* ══ licks: t = when (beats), s = string (0 = the thick one), f = fret above the box's low root, d = how long (beats);
   k = how: p pick (the usual), h hammer-on, o pull-off, t tap (no pick), g a ghost note (muted);
   b = a bend [half steps, starts at, takes, released at, takes] in beats from the note's start; v = vibrato from (beats);
   sl = a slide [to fret, starts at, takes]; home = the note the lick comes home on (in a major key it moves to the key's
   own home note). Written in the minor box; in a major key the same shapes sit where the major pentatonic is. */
function legatoGroups(groups, reps, step, t0){
  const out=[]; let t=t0;
  groups.forEach(([s, frets, kinds])=>{ for(let r=0;r<reps;r++) frets.forEach((f,j)=>{ out.push({t:+t.toFixed(4), s, f, d:step, k:kinds[j]}); t+=step; }); });
  return {notes:out, t};
}
const LICKS=(()=>{
  const L={};
  L.blues=[
    {t:0, s:3, f:2, d:1, b:[2,0.05,0.3], v:0.45},
    {t:1, s:4, f:3, d:0.5},
    {t:1.5, s:4, f:0, d:0.5, k:"o"},
    {t:2, s:3, f:2, d:0.5},
    {t:2.5, s:3, f:0, d:0.5, k:"o"},
    {t:3, s:2, f:2, d:1.5, v:0.3, home:1}];
  L.double=[
    {t:0, s:4, f:0, d:0.4}, {t:0, s:5, f:0, d:0.4},
    {t:0.5, s:4, f:0, d:0.4}, {t:0.5, s:5, f:0, d:0.4},
    {t:1, s:4, f:3, d:0.45}, {t:1, s:5, f:3, d:0.45},
    {t:1.5, s:4, f:3, d:0.9, sl:[0,0.1,0.35]}, {t:1.5, s:5, f:3, d:0.9, sl:[0,0.1,0.35]},
    {t:2.5, s:3, f:2, d:1.25, b:[2,0.05,0.35]}, {t:2.5, s:4, f:0, d:1.25},
    {t:4, s:2, f:2, d:1.5, v:0.3, home:1}];
  { const g=legatoGroups([[3,[4,0,2],["t","o","h"]],[4,[3,0,1],["t","o","h"]],[5,[3,0,2],["t","o","h"]]], 4, 1/6, 0);
    L.tap=g.notes.concat([{t:g.t, s:5, f:3, d:1/3, k:"t"}, {t:g.t+1/3, s:5, f:0, d:1.4, k:"o", v:0.25, home:1}]); }
  { const pk=["p","o"], g=[[5,[3,0],pk],[4,[3,0],pk],[3,[2,0],pk]], g2=[[4,[3,0],pk],[3,[2,0],pk],[2,[2,0],pk]], g3=[[3,[2,0],pk],[2,[2,0],pk],[1,[2,0],pk]];
    const a=legatoGroups(g.concat(g), 1, 1/6, 0), b=legatoGroups(g2.concat(g2), 1, 1/6, a.t), c=legatoGroups(g3, 1, 1/6, b.t);
    L.shred=a.notes.concat(b.notes, c.notes, [{t:c.t, s:2, f:2, d:1.5, v:0.3, home:1}]); }
  L.funk=[
    {t:0, s:0, f:0, d:0.2}, {t:0.5, s:0, f:0, d:0.08, k:"g"}, {t:0.75, s:0, f:0, d:0.2}, {t:1, s:0, f:3, d:0.2},
    {t:1.5, s:1, f:0, d:0.25}, {t:1.75, s:1, f:1, d:0.25, k:"h"}, {t:2, s:1, f:2, d:0.45, k:"h"}, {t:2.5, s:1, f:2, d:0.08, k:"g"},
    {t:2.75, s:2, f:0, d:0.22}, {t:3, s:2, f:2, d:0.25}, {t:3.25, s:2, f:0, d:0.22, k:"o"}, {t:3.5, s:1, f:2, d:0.4},
    {t:4, s:0, f:0, d:0.9, home:1}];
  L.bend=[
    {t:0, s:4, f:3, d:3.25, b:[2,0,1,2.5,0.5], v:[1.2,2.5]},
    {t:3.25, s:4, f:0, d:0.75},
    {t:4, s:3, f:2, d:2, b:[2,0,0.5], v:0.7},
    {t:6, s:2, f:2, d:2, v:0.3, home:1}];
  return L;
})();
const LICK_ORDER=["blues","double","tap","shred","funk","bend"];

/* the lead sounds this page has (another helper may add more; only the ones that are here are listed) */
const LEADS=(GTR?["lead","classic","blues","crunch","metal","modern","thrash","fuzzwall","grunge","doom"]:["slap","finger","pick","fretless","rock","metal","fuzz","octave"]).filter(id=>SOUNDS[id]);
const DEF_LEAD=LEADS[0]||S.sound;

/* ══ what is kept between visits (this browser only) ═════════════════════════ */
const PKEY="aog."+INST+".solo.v1";
const P={mode:"chords", scMin:"blues", scMaj:"majpent", tap:false, pinch:false, wah:false, vib:false, lick:"blues", prev:"", auto:"", beat:true};
try{ const r=JSON.parse(localStorage.getItem(PKEY)||"null");
  if(r && typeof r==="object"){
    if(r.mode==="solo") P.mode="solo";
    if(SCALES[r.scMin]) P.scMin=r.scMin; if(SCALES[r.scMaj]) P.scMaj=r.scMaj;
    P.tap=!!r.tap; P.pinch=!!r.pinch; P.wah=!!r.wah; P.vib=!!r.vib; if(LICKS[r.lick]) P.lick=r.lick;
    if(typeof r.prev==="string" && SOUNDS[r.prev]) P.prev=r.prev; if(typeof r.auto==="string") P.auto=r.auto; if(r.beat===false) P.beat=false;
  } }catch(e){}
function keep(){ try{ localStorage.setItem(PKEY, JSON.stringify(P)); }catch(e){} }

const SO={on:false, lang:"", sig:"", say:"", killed:false, hot:false, blooms:0, pops:0, built:false};

/* ══ the look ════════════════════════════════════════════════════════════════ */
const CSS=`
#rig .so-mode{display:flex;flex-wrap:wrap;gap:.5rem;margin:0 0 .8rem}
#rig .so-mode .pbtn{flex:0 1 9rem}
#rig .so-panel{margin:0 0 .75rem}
#rig .so-panel[hidden]{display:none!important}
#rig .so-panel .line:first-child{margin-top:0}
#rig .so-h{font:800 .74rem/1.2 var(--sans)!important;letter-spacing:.16em!important;text-transform:uppercase;color:#e3dac9;margin:1.2rem 0 .55rem}
#rig .so-sw{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.75rem}
#rig .so-sw .pbtn{flex:1 1 9.5rem}
#rig .pbtn.so-kill{border-color:#c4452a;color:#ffd0c8;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
#rig .pbtn.so-kill[aria-pressed="true"]{background:linear-gradient(#ffb1a4,#c4452a);color:#2a0c08}
#rig .so-legend{display:flex;flex-wrap:wrap;gap:.35rem 1.1rem;align-items:center}
#rig .so-legend span{display:inline-flex;align-items:center;gap:.45rem}
#rig .so-dot{width:18px;height:18px;border-radius:50%;display:inline-block;flex:none;border:1.5px solid #0c0d10;background:#9cc6d8}
#rig .so-dot.root{box-shadow:inset 0 0 0 3px #d0661f}
#rig .so-dot.blue{background:#2f63c9}
#rig .so-dot.land{background:#e6f5fb}
#rig .so-bar5{width:24px;height:4px;border-radius:2px;background:#f0c26e;display:inline-block;flex:none}
#rig .so-band{align-items:center}
#rig .so-band .pbtn.play{min-width:12rem}
@media (max-width:520px){ #rig .so-band .pbtn.play{flex:1 1 100%} }
#rig.aog-solo-on .neck .dot.fit{display:none}
#rig.aog-solo-on .neck .nk-x{display:none!important}
#rig.aog-solo-on .neck .nk-name{display:inline!important}
#rig.aog-solo-on .neck .nk-strumlab{display:none}
#rig.aog-solo-on [data-t="touchLine"],#rig.aog-solo-on [data-t="keysLine"],#rig.aog-solo-on #litLine{display:none!important}
#neck .so-c circle{fill:#9cc6d8;stroke:#0c0d10;stroke-width:1.5}
#neck .so-c text{fill:#0f2430}
#neck .so-c.land circle{fill:#e6f5fb}
#neck .so-c.blue circle{fill:#2f63c9}
#neck .so-c.blue text{fill:#ffffff}
#neck .so-c.root circle{stroke:#d0661f;stroke-width:4}
#neck .so-five{fill:none;stroke:#f0c26e;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round;opacity:.9}
#neck .so-bent{fill:none;stroke:#e8e8e8;stroke-linecap:round;stroke-linejoin:round}
#neck .so-now circle{fill:#ef9a4a;stroke:#0c0d10;stroke-width:1.5}
#neck .so-now text{fill:#1f1206}
#neck .so-tag{fill:#ffd9a8;font-weight:800;letter-spacing:.03em}
#neck .so-tagbg{fill:#15171b;opacity:.92}
#neck .so-wh{cursor:ns-resize;outline:none}
#neck .so-wh .so-wbox{fill:transparent;stroke:none}
#neck .so-wh:focus-visible .so-wbox{stroke:#F2C964;stroke-width:4}
#neck .so-wrail{stroke:#8a6a2a;stroke-width:4;stroke-linecap:round}
#neck .so-wrest{stroke:#ffd9a8;stroke-width:2}
#neck .so-wbar{fill:#d4d7dc;stroke:#0c0d10;stroke-width:1.5}
#neck .so-wlab{fill:#ffd9a8;letter-spacing:.06em}
`;

/* ══ the panel ═══════════════════════════════════════════════════════════════ */
function build(){
  const mode=$q("soloMode"), top=$q("soloTop"), bot=$q("soloBottom"); if(!mode||!top||!bot) return false;
  if(!$q("aog-solo-css")){ const st=document.createElement("style"); st.id="aog-solo-css"; st.textContent=CSS; document.head.appendChild(st); }
  mode.classList.add("so-mode"); mode.setAttribute("role","group");
  mode.innerHTML=`<button type="button" class="pbtn" data-so-mode="chords" aria-pressed="true"></button><button type="button" class="pbtn" data-so-mode="solo" aria-pressed="false"></button>`;
  top.classList.add("so-panel");
  top.innerHTML=`<p class="line" data-so="intro"></p>
    <div class="row" style="margin-top:.6rem">
      <label class="field"><span class="plab" data-so="scaleLab"></span><select id="soScaleSel"></select></label>
      <label class="field"><span class="plab" data-so="soundLab"></span><select id="soSoundSel"></select></label>
    </div>
    <p class="line" id="soSay" aria-live="polite"></p>
    <p class="line so-legend" id="soLegend"></p>`;
  bot.classList.add("so-panel");
  bot.innerHTML=`<div class="so-sw" id="soSw" role="group">
      <button type="button" class="pbtn" id="soTap" aria-pressed="false"></button>
      ${GTR?`<button type="button" class="pbtn" id="soPinch" aria-pressed="false"></button><button type="button" class="pbtn" id="soWah" aria-pressed="false"></button>`:""}
      <button type="button" class="pbtn" id="soVib" aria-pressed="false"></button>
      <button type="button" class="pbtn so-kill" id="soKill" aria-pressed="false"></button>
    </div>
    <p class="line" data-so="techHelp"></p>
    <p class="line touch-line" data-so="touch"></p>
    <p class="line keys-line" data-so="keys"></p>
    <h3 class="so-h" data-so="bandH"></h3>
    <div class="row so-band">
      <button type="button" class="pbtn play" id="soBand"></button>
      <span id="soBeatBox"></span>
    </div>
    <div class="tempo" style="margin-top:.8rem"><span class="plab" style="margin:0" data-so="tempo"></span><input type="range" id="soBpm" min="50" max="180" step="1"><b id="soBpmOut"></b></div>
    <p class="line" id="soBandLine"></p>
    <div class="prog" id="soBandProg" aria-hidden="true"></div>
    ${GTR?`<h3 class="so-h" data-so="lickH"></h3>
    <div class="row">
      <label class="field"><span class="plab" data-so="lickLab"></span><select id="soLickSel"></select></label>
      <button type="button" class="pbtn" id="soLickBtn"></button>
    </div>
    <p class="line" id="soLickLine" aria-live="polite"></p>`:""}`;
  wire();
  SO.built=true;
  return true;
}
function scaleId(){ return S.minor?P.scMin:P.scMaj; }
function scalePcs(){ return SCALES[scaleId()].iv.map(i=>(S.key+i)%12); }
function bluePc(){ const sc=SCALES[scaleId()]; return sc.blue!=null ? (S.key+sc.blue)%12 : -1; }
function keyWord(){ return KEY_NAMES[S.lang][S.key]+" "+w(S.minor?"minor":"major"); }
function scaleName(){ const id=scaleId(), nm=id==="blues"&&S.minor?"nm_bluesm":"nm_"+id;
  return w("scaleSay",{root:pcName(S.key), name:w(nm)}).replace(/^./, ch=>ch.toUpperCase()); }
function paintWords(){
  if(!SO.built) return;
  SO.lang=S.lang;
  const mode=$q("soloMode"); mode.setAttribute("aria-label", w("modeGroup"));
  mode.querySelectorAll("[data-so-mode]").forEach(b=>{ b.textContent=w(b.getAttribute("data-so-mode")); });
  document.querySelectorAll("#soloTop [data-so], #soloBottom [data-so]").forEach(el=>{ el.textContent=w(el.getAttribute("data-so")); });
  $q("soSw").setAttribute("aria-label", w("techGroup"));
  $q("soTap").textContent=w("tap"); $q("soVib").textContent=w("vib"); $q("soKill").textContent=w("kill");
  if($q("soPinch")) $q("soPinch").textContent=w("pinch");
  if($q("soWah")) $q("soWah").textContent=w("wah");
  $q("soBpm").setAttribute("aria-label", w("tempo"));
  paintScaleSel(); paintSoundSel(); paintLickSel(); paintSwitches(); paintMode(); paintLegend(); paintBand(); paintLickBtn();
  SO.say=""; sayIt();
}
function paintMode(){
  const rig=$q("rig"); if(rig) rig.classList.toggle("aog-solo-on", SO.on);
  $q("soloTop").hidden=!SO.on; $q("soloBottom").hidden=!SO.on;
  $q("soloMode").querySelectorAll("[data-so-mode]").forEach(b=>b.setAttribute("aria-pressed", String((b.getAttribute("data-so-mode")==="solo")===SO.on)));
}
function paintScaleSel(){
  const sel=$q("soScaleSel"); if(!sel) return;
  sel.innerHTML=SC_ORDER.map(id=>`<option value="${id}"${id===scaleId()?" selected":""}>${esc(w("sc_"+id))}</option>`).join("");
}
function paintSoundSel(){
  const sel=$q("soSoundSel"); if(!sel) return;
  const ids=LEADS.slice(); if(ids.indexOf(S.sound)<0 && SOUNDS[S.sound]) ids.unshift(S.sound);
  sel.innerHTML=ids.map(id=>`<option value="${id}"${id===S.sound?" selected":""}>${esc(soundName(id))}</option>`).join("");
}
function paintLickSel(){
  const sel=$q("soLickSel"); if(!sel) return;
  sel.innerHTML=LICK_ORDER.map(id=>`<option value="${id}"${id===P.lick?" selected":""}>${esc(w("lk_"+id))}</option>`).join("");
  const ln=$q("soLickLine"); if(ln && !LICK.on) ln.textContent=w("ld_"+P.lick);
}
function paintSwitches(){
  [["soTap","tap"],["soPinch","pinch"],["soWah","wah"],["soVib","vib"]].forEach(([id,k])=>{ const b=$q(id); if(b) b.setAttribute("aria-pressed", P[k]?"true":"false"); });
  const k=$q("soKill"); if(k) k.setAttribute("aria-pressed", SO.killed?"true":"false");
}
function paintLegend(){
  const el=$q("soLegend"); if(!el) return; const sc=SCALES[scaleId()];
  el.innerHTML=`<span><i class="so-dot root" aria-hidden="true"></i>${esc(w("lgRoot",{root:pcName(S.key)}))}</span>`
    +(sc.blue!=null?`<span><i class="so-dot blue" aria-hidden="true"></i>${esc(w("lgBlue"))}</span>`:"")
    +`<span><i class="so-dot land" aria-hidden="true"></i>${esc(w("lgLand"))}</span>`
    +(GTR?"":`<span><i class="so-bar5" aria-hidden="true"></i>${esc(w("lgFive"))}</span>`);
}
function sayIt(){
  if(!SO.on || !SO.built) return;
  const txt=w("say",{scale:scaleName(), a:S.fret0, b:S.fret0+NECK.n-1});
  const svg=$q("neck"); if(svg) svg.setAttribute("aria-label", (typeof t==="function"?t("neckGroup"):"")+" "+txt+".");
  if(txt!==SO.say){ SO.say=txt; $q("soSay").textContent=txt+"."; }
}
function setSoundId(id){
  const sel=$q("soundSel"); if(!sel || !SOUNDS[id] || S.sound===id) return;
  sel.value=id; if(typeof sel.onchange==="function") sel.onchange();
}
function wire(){
  $q("soloMode").querySelectorAll("[data-so-mode]").forEach(b=>b.addEventListener("click",()=>setMode(b.getAttribute("data-so-mode"))));
  $q("soScaleSel").addEventListener("change",(e)=>{ const v=e.target.value; if(!SCALES[v]) return; if(S.minor) P.scMin=v; else P.scMaj=v; keep(); SO.sig=""; paintLegend(); soPaint(); });
  $q("soSoundSel").addEventListener("change",(e)=>{ setSoundId(e.target.value); if(SO.on && P.auto && e.target.value!==P.auto) P.auto=""; keep(); });
  $q("soTap").addEventListener("click",()=>{ P.tap=!P.tap; keep(); paintSwitches(); });
  if($q("soPinch")) $q("soPinch").addEventListener("click",()=>{ P.pinch=!P.pinch; keep(); paintSwitches(); });
  if($q("soWah")) $q("soWah").addEventListener("click",()=>{ P.wah=!P.wah; keep(); paintSwitches(); wahApply(); });
  $q("soVib").addEventListener("click",()=>{ P.vib=!P.vib; keep(); paintSwitches(); if(!P.vib && ac){ const now=ac.currentTime; leadsNow().forEach(lv=>{ if(lv.vb){ lv.vb.off=Math.min(lv.vb.off, now); lv.replan(now); } }); } });
  /* the kill switch: silence while it is held, by finger, mouse or keyboard */
  const kb=$q("soKill");
  kb.addEventListener("touchstart",(e)=>{ if(e.cancelable) e.preventDefault(); },{passive:false});
  kb.addEventListener("pointerdown",(e)=>{ if(e.button>0) return; e.preventDefault(); try{ kb.setPointerCapture(e.pointerId); }catch(err){} killSet(true); });
  ["pointerup","pointercancel","lostpointercapture"].forEach(ev=>kb.addEventListener(ev,()=>{ if(SO.killed && !KEYKILL.on) killSet(false); }));
  kb.addEventListener("keydown",(e)=>{ if((e.key===" "||e.key==="Enter") && !e.repeat){ e.preventDefault(); e.stopPropagation(); killSet(true); } });
  kb.addEventListener("keyup",(e)=>{ if(e.key===" "||e.key==="Enter"){ e.preventDefault(); e.stopPropagation(); killSet(false); } });
  kb.addEventListener("click",(e)=>e.preventDefault());
  $q("soBand").addEventListener("click",()=>{ BAND.on?bandStop():bandStart(); });
  $q("soBpm").addEventListener("input",()=>{ const v=+$q("soBpm").value, pb=$q("bpm"); if(pb && !pb.disabled){ pb.value=String(v); if(typeof pb.oninput==="function") pb.oninput(); } else S.bpm=v; paintTempo(); paintBandLine(); });
  if($q("soLickSel")){
    $q("soLickSel").addEventListener("change",(e)=>{ if(LICKS[e.target.value]){ P.lick=e.target.value; keep(); if(!LICK.on) $q("soLickLine").textContent=w("ld_"+P.lick); } });
    $q("soLickBtn").addEventListener("click",()=>{ LICK.on?lickStop():playLick(P.lick); });
  }
  /* a pick from a menu gives the focus back, so Space plays the band instead of reopening the menu (as the page does) */
  ["soScaleSel","soSoundSel","soLickSel"].forEach(id=>{ const el=$q(id); if(!el) return;
    el.addEventListener("pointerdown",()=>{ el._ptr=true; });
    el.addEventListener("change",()=>{ if(el._ptr){ el._ptr=false; setTimeout(()=>el.blur(),0); } }); });
  const ss=$q("soundSel"); if(ss) ss.addEventListener("change",()=>{ paintSoundSel(); wahApply(); });
  const ab=$q("ampBox"); if(ab) ["input","click","change"].forEach(ev=>ab.addEventListener(ev,()=>{ if(P.wah && SO.on) setTimeout(wahApply, 0); }));
  const pb=$q("bpm"); if(pb) pb.addEventListener("input",()=>{ paintTempo(); paintBandLine(); });
  const mb=$q("muteBtn"); if(mb) mb.addEventListener("click",()=>{ lickStop(); });
}
function setMode(m, quiet){
  const on=m==="solo"; if(on===SO.on && !quiet) return;
  SO.on=on; P.mode=on?"solo":"chords";
  if(on){
    if(!quiet && LEADS.indexOf(S.sound)<0 && SOUNDS[DEF_LEAD]){ P.prev=S.sound; setSoundId(DEF_LEAD); P.auto=S.sound; }
    if(S.playing && typeof stop==="function") stop();
    prepBand();
  } else {
    bandStop(); lickStop(); if(SO.killed) killSet(false); if(WH.to!==0 && ac) whamTo(0, 0.04);
    FING.clear(); KEYF.clear(); SOUNDING.length=0;
    if(P.prev && P.auto && S.sound===P.auto && SOUNDS[P.prev]) setSoundId(P.prev);
    P.prev=""; P.auto="";
  }
  keep(); paintMode(); paintSoundSel(); paintBand(); wahApply(); SO.sig=""; SO.say="";
  if(typeof litNeck==="function") litNeck(); else soPaint();
}

/* ══ the lit scale (an SVG layer under the page's own dots: the orange "playing now" and the gold finger stay on top) ══ */
function visFrets(){ const out=[]; if(S.fret0<=2) out.push(0); for(let i=0;i<NECK.n;i++){ const f=S.fret0+i; if(f<=MAXF) out.push(f); } return out; }
function inWin(f){ return f===0 ? S.fret0<=2 : (f>=S.fret0 && f<=S.fret0+NECK.n-1); }
function cellXY(s, f){ const y=NECK.top+s*NECK.rowH+NECK.rowH/2, x=f===0 ? (NECK.nut-4)/2 : NECK.nut+(f-S.fret0+0.5)*NECK.cw; return [x, y]; }
function landChord(){ return (BAND.on && BAND.chord) || (typeof shapeChord==="function" && shapeChord()) || {off:0, q:S.minor?"min":"maj"}; }
function gEl(id){ const g=document.createElementNS(NS,"g"); g.setAttribute("id", id); return g; }
function soPaint(){
  const svg=$q("neck"); if(!svg || !SO.built) return;
  if(S.lang!==SO.lang) paintWords();
  if(!SO.on){ ["soScale","soBend","soTop"].forEach(id=>{ const g=svg.querySelector("#"+id); if(g) g.remove(); }); return; }
  const lc=landChord(), sig=[S.key, S.minor?1:0, scaleId(), S.fret0, NECK.n, NECK.W, NECK.H, chordPcs(lc).join("."), S.lang].join("|");
  if(!svg.querySelector("#soScale") || sig!==SO.sig){ SO.sig=sig; drawScale(svg, lc); }
  if(!svg.querySelector("#soTop")){ const g=gEl("soTop"); svg.appendChild(g); drawWham(); LICK.key=""; }
  if(!svg.querySelector("#soBend .so-bent") && SOUNDING.some(fs=>fs && fs.bend>0.02)) SOUNDING.forEach(fs=>{ if(fs && fs.bend>0.02) drawBend(fs.s, fs.f, fs.bend, fs.dir||1); });
  sayIt();
}
function drawScale(svg, lc){
  ["soScale","soBend"].forEach(id=>{ const g=svg.querySelector("#"+id); if(g) g.remove(); });
  const anchor=svg.querySelector(".nk-name")||svg.querySelector(".dot")||null;
  const bend=gEl("soBend"), g=gEl("soScale"); g.setAttribute("aria-hidden","true"); bend.setAttribute("aria-hidden","true");
  if(anchor){ svg.insertBefore(bend, anchor); svg.insertBefore(g, anchor); } else { svg.appendChild(bend); svg.appendChild(g); }
  const pcs=scalePcs(), blue=bluePc(), land=new Set(chordPcs(lc)), root=S.key%12, R0=Math.min(NECK.cw,NECK.rowH)*0.36;
  let lines="", dots="";
  const fr=visFrets();
  if(!GTR){
    /* the bass's shapes: from each root, its fifth (next string, two frets up) and its octave (two strings, two frets up) */
    for(let s=0;s<TUNING.length;s++) fr.forEach(f=>{
      if((TUNING[s]+f)%12!==root || f===0) return;
      const [x0,y0]=cellXY(s,f);
      if(s+1<TUNING.length && inWin(f+2)){ const [x1,y1]=cellXY(s+1,f+2); lines+=`<path class="so-five" d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}"/>`; }
      if(s+2<TUNING.length && inWin(f+2)){ const [x2,y2]=cellXY(s+2,f+2); lines+=`<path class="so-five" d="M${f1(x0)} ${f1(y0)}L${f1(x2)} ${f1(y2)}"/>`; }
    });
  }
  for(let s=0;s<TUNING.length;s++) fr.forEach(f=>{
    const pc=(TUNING[s]+f)%12; if(pcs.indexOf(pc)<0) return;
    const [x,y]=cellXY(s,f), nm=pcName(pc), fs=nm.length>3?10:nm.length>2?11.5:13.5;
    const cls="so-c"+(pc===blue?" blue":land.has(pc)?" land":"")+(pc===root?" root":"");
    dots+=`<g class="${cls}" data-c="${s}:${f}"><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(R0)}"/><text x="${f1(x)}" y="${f1(y)}" style="font-size:${fs}px">${nm}</text></g>`;
  });
  g.innerHTML=lines+dots;
}
/* a string pushed across the neck: drawn from the nut to the finger and on to the bridge, the page's straight one hidden */
function drawBend(s, f, semis, dir){
  const svg=$q("neck"); if(!svg) return; let g=svg.querySelector("#soBend"); if(!g) return;
  const old=g.querySelector(`[data-s="${s}"]`); if(old) old.remove();
  const strs=svg.querySelectorAll(".nk-str"), line=strs[s];
  if(!(semis>0.02)){ if(line) line.style.visibility=""; return; }
  const y=NECK.top+s*NECK.rowH+NECK.rowH/2, dy=(dir<0?-1:1)*Math.min(1,semis/2)*0.78*NECK.rowH, [fx]=cellXY(s,f);
  const sw=line ? (line.style.strokeWidth||getComputedStyle(line).strokeWidth||"2px") : "2px";
  const p=document.createElementNS(NS,"path"); p.setAttribute("class","so-bent"); p.setAttribute("data-s", s);
  p.setAttribute("d", `M${f1(NECK.nut-10)} ${f1(y)}L${f1(fx)} ${f1(y+dy)}L${f1(NECK.W)} ${f1(y)}`); p.style.strokeWidth=sw;
  g.appendChild(p); if(line) line.style.visibility="hidden";
}
function clearBend(s){ drawBend(s, 0, 0, 1); }

/* ══ a lead note: the page's own voice (makeVoice), with its own gain in front of the amp, plus what Solo mode adds
   (the squeal, the feedback). Its pitch is base + bend + vibrato + the whammy, sent as small glides. ══ */
let SOLO_IN=null;
function soloIn(){ const c=ctx(); if(!SOLO_IN || SOLO_IN.context!==c){ SOLO_IN=gainAt(c,1); SOLO_IN.connect(LIVE_CH.amp); } return SOLO_IN; }
const DYN=new Set();     /* lead notes whose pitch moves on a schedule (vibrato, a timed bend, a lick, the whammy coming back) */
const STEP=0.015;        /* seconds between the small glides */
class Lead{
  constructor(c, vc, vg, s, m, when){
    this.c=c; this.vc=vc; this.vg=vg; this.s=s; this.base=m; this.bend=0; this.bendFn=null; this.vb=null; this.fn=null;
    this.parts=[]; this.born=when; this.until=0; this.lastT=NaN; this.fb=null; this.planAll=false; this.planEnd=0;
  }
  get stopped(){ return this.vc.stopped; }
  get end(){ return this.vc.end; }
  get natural(){ return this.vc.natural; }
  get tau(){ return this.vc.tau; }
  alive(now){ return !this.vc.stopped && now < (this.vc.natural||1e9)-0.05; }
  bendAt(t){ return this.bendFn ? this.bendFn(t) : this.bend; }
  vibAt(t){ const v=this.vb; if(!v || t<v.t0) return 0;
    let k=Math.min(1,(t-v.t0)/0.3); if(t>v.off) k*=Math.max(0, 1-(t-v.off)/0.12);
    return (v.down?-1:1)*v.D*k*(1-Math.cos(2*Math.PI*v.hz*(t-v.t0)))/2; }
  core(t){ return this.fn ? this.fn(t) : this.base+this.bendAt(t)+this.vibAt(t); }
  target(t){ return this.core(t)+whamAt(t); }
  moving(t){ if(this.vb && t>this.vb.off+0.13) this.vb=null; return !!(this.fn || this.bendFn || this.vb) || whamMoving(t); }
  put(T, at){ this.vc.glide(T, at); for(const p of this.parts) p.follow(T, at); this.lastT=T; }
  /* something changed now: glide there at once, then schedule what follows */
  replan(now){ this.until=now; this.put(this.target(now), now); if(this.moving(now)){ DYN.add(this); wake(); this.plan(now); } }
  plan(now){
    const end=this.planAll ? this.planEnd : now+0.3;
    let t=Math.max(this.until, now)+STEP;
    for(; t<=end; t+=STEP){ const T=this.target(t); if(!(Math.abs(T-this.lastT)<0.002)) this.put(T, t); }
    this.until=t-STEP;
  }
  glide(m2, at){ this.base=m2; this.bend=0; this.bendFn=null; this.replan(Math.max(at, this.c.currentTime)); }   /* the page's slideTo */
  stop(t, tau){ if(this.vc.stopped) return; this.vc.stop(t, tau); for(const p of this.parts) p.stop(t, tau); this.retire(); }
  kill(t){ this.vc.kill(t); for(const p of this.parts) p.kill(t); this.retire(); }
  retire(){ if(!this.planAll) DYN.delete(this); const c=this.c, e=(this.vc.end||c.currentTime)+0.4, vg=this.vg;
    setTimeout(()=>{ try{ vg.disconnect(); }catch(err){} }, Math.max(0, e-c.currentTime)*1000+250); }
}
function makeLead(s, m, v, when, o){
  o=o||{};
  const c=ctx(); const vg=gainAt(c, o.soft?0:1); vg.connect(soloIn());
  const chx=Object.create(LIVE_CH); chx.amp=vg;          /* the page's voice, played into this note's own gain */
  const W0=whamAt(when), vc=makeVoice(c, chx, S.sound, m+W0, v, when, s);
  if(!vc){ try{ vg.disconnect(); }catch(e){} return null; }
  if(o.soft){ vg.gain.setValueAtTime(0, when); vg.gain.linearRampToValueAtTime(1, when+0.006); }   /* a tap: no pick */
  const lv=new Lead(c, vc, vg, s, m, when); lv.lastT=m+W0;
  if(o.pinch) lv.parts.push(pinchPart(c, lv, m+W0, when));
  if(o.snap) snapPart(c, lv, when);
  track(lv);
  return lv;
}
/* a string picked (or slapped) by hand: one note at a time on a string, as on the page */
function pickString(s, f, v, o){
  const c=ctx(), now=c.currentTime, old=STR_LIVE[s];
  if(old && old.vc && !old.vc.stopped) old.vc.stop(now, o&&o.soft?0.02:((SOUNDS[S.sound]&&SOUNDS[S.sound].damp)||0.03));
  const lv=makeLead(s, TUNING[s]+f, v, now, o); if(!lv) return null;
  STR_LIVE[s]={vc:lv, m:TUNING[s]+f, f:f}; prune();
  return lv;
}
/* the pinch squeal: a high harmonic of the note (about 1 to 2.4 kHz), into the amp, following every bend */
function pinchPart(c, lv, m, when){
  const f0=mtof(m); let h=8; for(const k of [8,6,5,4,3]){ h=k; if(f0*k<=2400) break; }
  const o=c.createOscillator(); o.type="sine"; o.frequency.value=f0*h;
  const g=gainAt(c,0); o.connect(g); g.connect(lv.vg);
  const A=0.13; g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(A, when+0.005); g.gain.setTargetAtTime(A*0.4, when+0.005, 0.5);
  o.start(when); SO.pinches=(SO.pinches||0)+1;
  const part={h, kind:"pinch",
    follow(T,at){ try{ o.frequency.cancelScheduledValues(at); o.frequency.setTargetAtTime(mtof(T)*h, at, 0.012); }catch(e){} },
    stop(t,tau){ try{ const tt=Math.max(0.01,tau||0.03); g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0, t, tt); o.stop(t+tt*8+0.05); }catch(e){} },
    kill(t){ part.stop(t, 0.01); }};
  return part;
}
/* feedback: a held note on a high-gain amp blooms into a harmonic (the octave; the twelfth on a low note; the note itself
   up high) with a slow vibrato. Quiet into the amp: the amp's own gain makes it sing, so it never shrieks. */
function fbPart(c, lv, at){
  const T=lv.target(at), h=T<50?3:(T>=76?1:2);
  const o=c.createOscillator(); o.type="sine"; o.frequency.value=mtof(T)*h;
  const lfo=c.createOscillator(); lfo.frequency.value=4.6; const lg=gainAt(c,0); lfo.connect(lg); lg.connect(o.detune);
  lg.gain.setValueAtTime(0, at); lg.gain.linearRampToValueAtTime(16, at+1.8);
  const g=gainAt(c,0); o.connect(g); g.connect(lv.vg);
  g.gain.setValueAtTime(0, at); g.gain.setTargetAtTime(0.045, at, 0.5);
  o.start(at); lfo.start(at);
  let done=false;
  const part={h, kind:"fb", g:g,
    off(t){ if(done) return; done=true; try{ g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0, t, 0.12); o.stop(t+1.2); lfo.stop(t+1.2); }catch(e){} },
    follow(T2,at2){ if(done) return; try{ o.frequency.cancelScheduledValues(at2); o.frequency.setTargetAtTime(mtof(T2)*h, at2, 0.012); }catch(e){} },
    stop(t){ part.off(t); }, kill(t){ part.off(t); }};
  return part;
}
function hotAmp(){
  if(!GTR) return false;
  let st=null; try{ st=rigFor(S.sound); }catch(e){ return false; }
  const g=+((st.k&&st.k.gain)||0), fx=st.fx||{};
  if(["lead","high","groove"].indexOf(st.model)>=0) return true;
  if(st.model==="crunch" && g>=6.5) return true;
  if((fx.ds&&fx.ds.on) || (fx.fz&&fx.fz.on) || (fx.od&&fx.od.on && g>=6)) return true;
  return !!(AOGAmp.MODELS && !AOGAmp.MODELS[st.model] && g>=7);
}
/* the pop's snap: a few thousandths of a second of bright noise, the string hitting the frets */
let SNAP=null;
function snapBuf(c){
  if(SNAP && SNAP.sampleRate===c.sampleRate) return SNAP;
  const sr=c.sampleRate, n=Math.floor(sr*0.014), d=new Float32Array(n), r=seeded(0x77a1); let p=0;
  for(let i=0;i<n;i++){ const x=r(), hp=x-p; p=x; d[i]=hp*Math.exp(-i/(sr*0.0028))*Math.min(1, i/(sr*0.0004)); }
  SNAP=makeBuffer(d, sr); return SNAP;
}
function snapPart(c, lv, when){
  const b=c.createBufferSource(); b.buffer=snapBuf(c);
  const f=c.createBiquadFilter(); f.type="bandpass"; f.frequency.value=3000; f.Q.value=0.8;
  const g=gainAt(c,0.55); b.connect(f); f.connect(g); g.connect(lv.vg); b.start(when);
}

/* ══ the whammy bar: every ringing lead note dives with it, and comes back when it is let go ══ */
const WH={from:0, to:0, t0:0, tau:0};
function whamAt(t){ if(!WH.tau) return WH.to; return WH.to+(WH.from-WH.to)*Math.exp(-Math.max(0,t-WH.t0)/WH.tau); }
function whamMoving(t){ return !!WH.tau && Math.abs(whamAt(t)-WH.to)>0.003; }
function leadsNow(){
  const out=[]; const now=ac?ac.currentTime:0;
  STR_LIVE.forEach(L=>{ if(L && L.vc instanceof Lead && !L.vc.stopped) out.push(L.vc); });
  LICK.voices.forEach(v=>{ if(v.lv && (v.lv.vc.end||1e9)>now && out.indexOf(v.lv)<0) out.push(v.lv); });
  return out;
}
function whamTo(to, tau){
  const c=ctx(), now=c.currentTime;
  WH.from=whamAt(now); WH.to=clamp(to,-12,2); WH.t0=now; WH.tau=tau||0;
  leadsNow().forEach(lv=>{ if(lv.planAll){ lv.until=now; lv.put(lv.target(now), now); lv.plan(now); } else lv.replan(now); });
  drawWham(); wake();
}
function whamBox(){ const x0=NECK.nut+NECK.n*NECK.cw+6, w2=NECK.W-x0-1, y=NECK.top, h=NECK.rows*NECK.rowH; return {x0, w:w2, y, h, yUp:y+0.06*h, yDn:y+0.94*h}; }
function whamY(W){ const b=whamBox(); return b.yUp+(2-W)/14*(b.yDn-b.yUp); }
function whamText(W){ const n=Math.round(Math.abs(W)); return n===0?w("whamRest"):w(W<0?"whamDown":"whamUp",{n}); }
function drawWham(){
  if(!GTR || !SO.on) return; const svg=$q("neck"); if(!svg) return; const top=svg.querySelector("#soTop"); if(!top) return;
  const b=whamBox(); if(b.w<20) return;
  let g=top.querySelector("#soWham");
  const W=WH.to, yb=whamY(W), cx=b.x0+b.w/2, bw=Math.max(18, b.w-12);
  const html=`<rect class="so-wbox" x="${f1(b.x0+1)}" y="${f1(b.y+1)}" width="${f1(b.w-2)}" height="${f1(b.h-2)}" rx="9"/>
    <line class="so-wrail" x1="${f1(cx)}" y1="${f1(b.yUp)}" x2="${f1(cx)}" y2="${f1(b.yDn)}"/>
    <line class="so-wrest" x1="${f1(b.x0+5)}" y1="${f1(whamY(0))}" x2="${f1(b.x0+b.w-5)}" y2="${f1(whamY(0))}"/>
    <rect class="so-wbar" x="${f1(cx-bw/2)}" y="${f1(yb-7)}" width="${f1(bw)}" height="14" rx="7"/>
    <text class="so-wlab" x="${f1(cx)}" y="${f1(b.y+b.h+16)}" style="font-size:${b.w<70?10:12}px">${w("whammy")}</text>`;
  if(!g){ g=document.createElementNS(NS,"g"); g.setAttribute("id","soWham"); g.setAttribute("class","so-wh"); g.setAttribute("tabindex","0"); g.setAttribute("role","slider");
    g.setAttribute("aria-orientation","vertical"); g.setAttribute("aria-valuemin","-12"); g.setAttribute("aria-valuemax","2"); top.insertBefore(g, top.firstChild); }
  g.innerHTML=html; g.setAttribute("aria-label", w("whamLab")); g.setAttribute("aria-valuenow", String(Math.round(W))); g.setAttribute("aria-valuetext", whamText(W));
}

/* ══ the wah (Jimi's talking tone): the amp's own touch-wah, on the live rig only, while Solo mode and Wah are on ══ */
function wahApply(){
  if(!GTR || !ac || !LIVE_CH) return; let st=null; try{ st=rigFor(S.sound); }catch(e){ return; }
  if(SO.on && P.wah && st.fx && st.fx.wah){ Object.assign(st.fx.wah, {on:true, mode:"touch", sens:6.5, q:6, pos:3}); }
  try{ LIVE_CH.rig.set(st); }catch(e){} SO.wahCh=LIVE_CH;
}

/* ══ the kill switch: the lead's sound cut after the amp (a crisp stutter), with a 3 ms edge so it never clicks ══ */
const KEYKILL={on:false};
function killSet(on){
  if(!on && !SO.killed) return;
  const c=ctx(), now=c.currentTime, g=LIVE_CH.post.gain, out=(SOUNDS[S.sound]&&SOUNDS[S.sound].out)||1;
  SO.killed=on;
  try{ if(g.cancelAndHoldAtTime) g.cancelAndHoldAtTime(now); else g.cancelScheduledValues(now); }catch(e){}
  g.setTargetAtTime(on?0:out, now, 0.003);
  paintSwitches();
}

/* ══ the clock: small glides scheduled a little ahead, the feedback and vibrato on held notes, and the band ══ */
let TICK=0;
function wake(){ if(!TICK) TICK=setInterval(tick, 25); }
function tick(){
  if(!ac){ return; }
  const now=ac.currentTime; let busy=false;
  DYN.forEach(lv=>{
    if(lv.planAll){ if((lv.vc.end||0)<now) DYN.delete(lv); else busy=true; return; }
    if(lv.stopped || !lv.moving(now)){ DYN.delete(lv); return; }
    lv.plan(now); busy=true; });
  FING.forEach(fs=>{ busy=true; if(!fs.wham) held(fs, now); });
  KEYF.forEach(fs=>{ busy=true; held(fs, now); });
  if(whamMoving(now)) busy=true;
  if(BAND.on){ bandTick(now); busy=true; }
  if(LICK.on) busy=true;
  if(!busy){ clearInterval(TICK); TICK=0; }
}
function held(fs, now){
  const lv=fs.lv; if(!lv || SOUNDING[fs.s]!==fs || lv.stopped) return;
  if((P.vib || fs.vibKey) && !lv.vb && now-fs.since>(fs.vibKey?0.02:0.25)){ lv.vb={D:0.3, hz:5.2, t0:now, off:1e9, down:Math.abs(fs.bend)>1}; lv.replan(now); }
  if(!lv.fb && SO.hot && now-fs.since>=1.5){ lv.fb=fbPart(lv.c, lv, now); lv.parts.push(lv.fb); SO.blooms++; }
}

/* ══ fingers on the neck in Solo mode ═══════════════════════════════════════════════════════════════════════════
   The pitch of a string is set by the highest finger on it, as on a guitar: a second finger above a ringing note is a
   hammer-on (no new pick), and lifting it pulls off to the finger below. With Tap on, every touch is played that way. */
const FING=new Map();       /* pointer → its finger */
const KEYF=new Map();       /* computer key held → its finger */
const SOUNDING=[];          /* string → the finger that sets its pitch now */
let LAST=null;              /* the lead note played last (the B and V keys work on it) */
function fingersOn(s, except){ const out=[]; FING.forEach(f=>{ if(f!==except && !f.wham && f.s===s) out.push(f); }); KEYF.forEach(f=>{ if(f!==except && f.s===s) out.push(f); }); return out; }
function strike(fs, o){
  o=o||{};
  const c=ctx(), now=c.currentTime, s=fs.s, f=fs.f, L=STR_LIVE[s], lv=(L && L.vc instanceof Lead) ? L.vc : null;
  const others=fingersOn(s, fs), top=others.reduce((a,x)=>x.f>a?x.f:a, -1), live=!!(lv && lv.alive(now));
  fs.since=now; fs.bend=0; fs.lv=null; SO.hot=hotAmp(); if(P.wah && SO.wahCh!==LIVE_CH) wahApply();
  if(top>f && live) return;                                        /* below the finger that sounds: ready to pull off to */
  if(P.tap){
    if(live && now-lv.born<1.6){ legato(lv, fs, "h"); return; }
    fs.lv=pickString(s, f, GTR?0.62:0.66, {soft:true}); SOUNDING[s]=fs; LAST=fs.lv; return;
  }
  if(others.length && live){ legato(lv, fs, "h"); return; }
  const v=o.pop?1:(GTR?(P.pinch?0.62:0.76):0.82);
  fs.lv=pickString(s, f, v, {pinch:GTR&&P.pinch, snap:!!o.pop}); SOUNDING[s]=fs; LAST=fs.lv;
  if(o.pop){ fs.popped=true; SO.pops++; }
}
function legato(lv, fs, kind){
  const now=lv.c.currentTime; lv.base=TUNING[fs.s]+fs.f; lv.bend=0; lv.bendFn=null; fs.lv=lv; fs.since=now; SOUNDING[fs.s]=fs; LAST=lv;
  const L=STR_LIVE[fs.s]; if(L){ L.f=fs.f; L.m=lv.base; }
  if(kind==="o"){ const g=lv.vg.gain; try{ g.cancelScheduledValues(now); g.setTargetAtTime(1.3, now, 0.004); g.setTargetAtTime(1, now+0.03, 0.25); }catch(e){} }
  SO.legatos=(SO.legatos||0)+1;
  lv.replan(now); clearBend(fs.s);
}
function release(fs){
  if(!ac) return; const now=ac.currentTime, s=fs.s;
  if(SOUNDING[s]!==fs) return;
  const lv=fs.lv; SOUNDING[s]=null;
  const L=STR_LIVE[s]; if(!lv || !L || L.vc!==lv || lv.stopped){ clearBend(s); return; }
  if(lv.fb){ lv.fb.off(now); lv.parts.splice(lv.parts.indexOf(lv.fb),1); lv.fb=null; }
  const others=fingersOn(s, fs);
  if(others.length){ const top=others.reduce((a,x)=>x.f>a.f?x:a); legato(lv, top, "o"); return; }
  if(lv.vb){ lv.vb.off=now; }
  if(Math.abs(fs.bend)>0.08){ lv.stop(now, 0.05); clearBend(s); return; }   /* a bent string let go: the finger mutes it */
  if(lv.vb) lv.replan(now);
}
/* how far a push across the string bends it: a whole step at about four fifths of the space between two strings, never
   more; near a half step or a whole step it settles on the note (in tune), and a small wiggle still moves it a little */
function bendFrom(dy){
  const span=0.8*NECK.rowH; let b=2*Math.abs(dy)/span; if(b>=2) return 2;
  for(const [T,z] of [[2,0.4],[1,0.14]]){ const x=b-T; if(Math.abs(x)<z) return T+x*Math.abs(x)/z; }
  return b;
}
function down(e, h){
  if(!SO.on || !h) return false;
  ctx();
  if(h.zone==="strum"){ if(!GTR) return false; FING.set(e.pointerId, {wham:true, y0:e.clientY, w0:WH.to}); wake(); return true; }
  const fs={s:h.s, f:h.f, y0:e.clientY, t0:performance.now(), since:0, bend:0, engaged:false, lv:null, popped:false, dir:1};
  FING.set(e.pointerId, fs);
  strike(fs);
  wake();
  return true;
}
function move(e, p, h){
  if(!SO.on) return false;
  const fs=FING.get(e.pointerId); if(!fs) return true;
  const svg=$q("neck"), r=svg.getBoundingClientRect(), k=NECK.H/(r.height||1), now=ac?ac.currentTime:0;
  if(fs.wham){ const b=whamBox(), dy=(e.clientY-fs.y0)*k; whamTo(fs.w0-dy/(b.yDn-b.yUp)*14, 0); return true; }
  const dyCss=e.clientY-fs.y0;
  /* the bass: a quick flick up, just after the finger lands, pops the string */
  if(!GTR && !P.tap && !fs.popped && SOUNDING[fs.s]===fs && performance.now()-fs.t0<180 && dyCss<-10){
    if(fs.lv) fs.lv.stop(now, 0.004);
    strike(fs, {pop:true}); fs.y0=e.clientY; return true;
  }
  const sounding=SOUNDING[fs.s]===fs && fs.lv && !fs.lv.stopped;
  if(h && h.zone==="fret" && h.f!==fs.f){                           /* along the string: a slide */
    fs.f=h.f; if(p) p.f=h.f;
    if(sounding){ const lv=fs.lv; lv.base=TUNING[fs.s]+fs.f; const L=STR_LIVE[fs.s]; if(L){ L.f=fs.f; L.m=lv.base; } fs.since=now; lv.replan(now); if(fs.bend>0.02) drawBend(fs.s, fs.f, fs.bend, fs.dir); }
    litNeck();
  }
  if(sounding){                                                     /* across the string: a bend */
    const dy=dyCss*k; if(!fs.engaged && Math.abs(dy)>3) fs.engaged=true;
    if(fs.engaged){ const b=bendFrom(dy); fs.dir=dy<0?-1:1;
      if(Math.abs(b-fs.bend)>0.004){ fs.bend=b; fs.lv.bend=b; if(fs.lv.vb) fs.lv.vb.down=b>1; fs.lv.replan(now); drawBend(fs.s, fs.f, b, fs.dir); } }
  }
  return true;
}
function up(e){
  const fs=FING.get(e.pointerId); if(!fs) return; FING.delete(e.pointerId);
  if(fs.wham){ whamTo(0, 0.04); return; }
  release(fs);
}

/* ══ the computer keys in Solo mode ══════════════════════════════════════════ */
const SCALE_KEYS=["KeyA","KeyS","KeyD","KeyF","KeyG","KeyH","KeyJ","KeyK","KeyL","Semicolon"];
function keyCells(){
  const pcs=scalePcs(), by=new Map();
  TUNING.forEach((o,s)=>visFrets().forEach(f=>{ const m=o+f; if(pcs.indexOf(m%12)<0) return; const b=by.get(m); if(!b || s>b.s) by.set(m, {s, f, m}); }));
  return [...by.values()].sort((a,b)=>a.m-b.m);
}
function keyBend(on){
  const lv=LAST; if(!lv || lv.stopped || !ac) return; const now=ac.currentTime, from=lv.bendAt(now), to=on?2:0, dur=on?0.16:0.12;
  lv.bendFn=(t)=>t>=now+dur ? to : from+(to-from)*smooth((t-now)/dur);
  if(!on) setTimeout(()=>{ if(lv.bendFn && ac && ac.currentTime>=now+dur){ lv.bendFn=null; lv.bend=0; } }, (dur+0.05)*1000);
  else lv.bend=2;
  const fs=SOUNDING[lv.s]; if(fs){ fs.bend=on?2:0; fs.dir=1; drawBend(lv.s, fs.f, fs.bend, 1); }
  lv.replan(now);
}
function key(e, isDown){
  if(!SO.on) return false;
  const code=e.code;
  if(isDown && e.target && e.target.closest && e.target.closest("#soWham") && /^Arrow(Up|Down)$|^(Home|End|PageDown|PageUp)$/.test(e.key)){
    e.preventDefault(); const st={ArrowDown:-1, ArrowUp:1, PageDown:-5, PageUp:5}[e.key];
    whamTo(e.key==="Home"?0:e.key==="End"?-12:WH.to+st, 0.02); return true;
  }
  if(!isDown && e.target && e.target.closest && e.target.closest("#soWham") && /^Arrow(Up|Down)$|^(PageDown|PageUp)$/.test(e.key)){ whamTo(0, 0.04); return true; }
  const si=SCALE_KEYS.indexOf(code);
  if(si>=0){
    e.preventDefault();
    if(isDown){
      if(e.repeat || KEYF.has(code)) return true;
      const cell=keyCells()[si]; if(!cell) return true;
      const fs={s:cell.s, f:cell.f, since:0, bend:0, lv:null, dir:1, key:true};
      KEYF.set(code, fs); strike(fs, {pop:!GTR && e.shiftKey && !P.tap}); wake();
      if(typeof KEYCELLS!=="undefined") KEYCELLS.set(code, cell.s+":"+cell.f);
    } else {
      const fs=KEYF.get(code); if(fs){ KEYF.delete(code); release(fs); }
      if(typeof KEYCELLS!=="undefined") KEYCELLS.delete(code);
    }
    litNeck(); return true;
  }
  if(code==="KeyB"){ e.preventDefault(); if(!e.repeat) keyBend(isDown); return true; }
  if(code==="KeyV"){ e.preventDefault(); if(e.repeat) return true;
    const lv=LAST, fs=lv?SOUNDING[lv.s]:null; if(fs){ fs.vibKey=isDown; if(!isDown && lv.vb && !P.vib && ac){ lv.vb.off=ac.currentTime; lv.replan(ac.currentTime); } }
    else if(lv && !lv.stopped && ac && isDown){ lv.vb={D:0.3, hz:5.2, t0:ac.currentTime, off:1e9, down:false}; lv.replan(ac.currentTime); }
    else if(lv && lv.vb && ac && !isDown){ lv.vb.off=ac.currentTime; lv.replan(ac.currentTime); }
    wake(); return true; }
  if(code==="KeyN" && GTR){ e.preventDefault(); if(!e.repeat) whamTo(isDown?-5:0, isDown?0.22:0.06); return true; }
  if(code==="KeyM"){ e.preventDefault(); if(!e.repeat){ KEYKILL.on=isDown; killSet(isDown); } return true; }
  if(code==="Space"){
    if(!isDown) return false;
    const b=e.target && e.target.closest && e.target.closest("button,a,summary,[role=button],select");
    if(b && b.id!=="soBand") return false;
    e.preventDefault(); if(!e.repeat){ BAND.on?bandStop():bandStart(); } return true;
  }
  return false;
}
function releaseAll(){
  KEYF.forEach(fs=>release(fs)); KEYF.clear();
  if(typeof KEYCELLS!=="undefined") KEYCELLS.clear();
  if(KEYKILL.on || SO.killed){ KEYKILL.on=false; killSet(false); }
  if(WH.to!==0 && ac) whamTo(0, 0.05);
  if(LAST && LAST.bendFn && ac){ LAST.bendFn=null; LAST.bend=0; LAST.replan(ac.currentTime); }
}

/* ══ the band ════════════════════════════════════════════════════════════════════════════════════════════════════
   A rhythm guitar on its own chain and amp (makeChain, a crunch or clean rig), a bass (guitar page only: on the bass page
   you are the bass), drums: the drum machine's beat when there is one, else a simple beat made here. Its notes are its
   own: renderNote with its own strings, made once and kept. The band goes into the lead's limiter, so Volume and Record
   take both; it sits about 6 dB under the lead. */
const BAND={on:false, c:null, ch:null, mix:null, bass:null, drums:null, t0:0, bar:0, barSec:2.5, bpm:90, voices:[], loop:null, cur:-1, chord:null, log:[], style:"straight", swing:0.5, beat:false};
const BAND_LVL=0.5;
function firstPluck(){ for(const id in SOUNDS){ if(SOUNDS[id].kind==="pluck" && SOUNDS[id].s) return SOUNDS[id].s; } return {}; }
function gtrP(){ return Object.assign({}, firstPluck(), {sr:32000, T0:9, fref:82, Texp:0.5, Tmin:1.6, Tmax:10, Thf:0.45, Thmax:0.8, pos:0.13, bright:0.62, soft:0.5, noise:0.25, pol2:0.25, atk:0.05, atkLp:0.5, pick:0.15, durMax:2.4, body:[["highpass",80,0.7,0]]}); }
function bassP(){ return Object.assign({}, firstPluck(), {sr:22050, T0:7, fref:41, Texp:0.5, Tmin:2, Tmax:8, Thf:0.15, Thmax:0.25, pos:0.2, bright:0.32, soft:0.2, noise:0.08, pol2:0.25, atk:0.06, atkLp:0.15, pick:0.2, durMax:2.2, body:[["highpass",30,0.7,0]]}); }
const BS={gtr:{}, bass:{}, drums:null, job:0};
const BS_NOTES={gtr:[], bass:[]};
for(let m=40;m<=79;m+=3) BS_NOTES.gtr.push(m);
for(let m=28;m<=55;m+=3) BS_NOTES.bass.push(m);
function bsNearest(kind, m){ let best=BS_NOTES[kind][0]; BS_NOTES[kind].forEach(n=>{ if(Math.abs(n-m)<Math.abs(best-m)) best=n; }); return best; }
function bsMake(kind, n){
  if(BS[kind][n]) return BS[kind][n];
  const P2=kind==="gtr"?gtrP():bassP(); let d=null;
  try{ d=renderNote(n, P2, (n*104729)^0x5a17); }catch(e){ d=null; }
  if(!d || !d.length || d[100]!==d[100]){ const sr=P2.sr, len=Math.floor(sr*1.6), per=sr/mtof(n); d=new Float32Array(len); const r=seeded(n*31+7);
    const N=Math.max(2,Math.round(per)), dl=new Float32Array(N); for(let i=0;i<N;i++) dl[i]=r()*0.5; let idx=0, prev=0;
    for(let i=0;i<len;i++){ const x=dl[idx]; d[i]=x; const y=0.996*(0.5*x+0.5*prev); prev=x; dl[idx]=y; if(++idx===N) idx=0; } }
  BS[kind][n]=makeBuffer(d, P2.sr); return BS[kind][n];
}
function bsBuf(kind, m){ const n=bsNearest(kind, m); return [bsMake(kind, n), Math.pow(2,(m-n)/12)]; }
/* made a few at a time once Solo mode is open, so Play starts at once */
function prepBand(){
  clearTimeout(BS.job);
  const todo=[]; BS_NOTES.gtr.forEach(n=>{ if(!BS.gtr[n]) todo.push(["gtr",n]); }); if(GTR) BS_NOTES.bass.forEach(n=>{ if(!BS.bass[n]) todo.push(["bass",n]); });
  const step=()=>{ const t0=performance.now(); while(todo.length && performance.now()-t0<10){ const [k,n]=todo.shift(); bsMake(k,n); } if(todo.length) BS.job=setTimeout(step, 30); };
  BS.job=setTimeout(step, 900);
}
function drumBufs(c){
  if(BS.drums && BS.drums.sr===c.sampleRate) return BS.drums;
  const sr=c.sampleRate, r=seeded(0x1d3a57), mk=(sec, fn)=>{ const n=Math.floor(sec*sr), d=new Float32Array(n); fn(d, n); return makeBuffer(d, sr); };
  const kick=mk(0.45,(d,n)=>{ let ph=0; for(let i=0;i<n;i++){ const t=i/sr, f=46+96*Math.exp(-t/0.032); ph+=2*Math.PI*f/sr;
    d[i]=Math.sin(ph)*Math.exp(-t/0.17)*0.95*Math.min(1,i/(sr*0.0006)) + (t<0.003 ? r()*0.35*(1-t/0.003) : 0); } });
  const snare=mk(0.32,(d,n)=>{ let lp=0, ph=0; for(let i=0;i<n;i++){ const t=i/sr, x=r(); lp+=(x-lp)*0.45; ph+=2*Math.PI*188/sr;
    d[i]=((x-lp)*0.75*Math.exp(-t/0.075) + Math.sin(ph)*0.5*Math.exp(-t/0.04))*Math.min(1,i/(sr*0.0005)); } });
  const hat=mk(0.09,(d,n)=>{ let p1=0, p2=0; for(let i=0;i<n;i++){ const t=i/sr, x=r(), h1=x-p1; p1=x; const h2=h1-p2; p2=h1; d[i]=h2*0.22*Math.exp(-t/0.016); } });
  const crash=mk(1.5,(d,n)=>{ let p1=0, p2=0; for(let i=0;i<n;i++){ const t=i/sr, x=r(), h1=x-p1; p1=x; const h2=h1-p2; p2=h1; d[i]=h2*0.16*Math.exp(-t/0.5)*Math.min(1,t/0.002); } });
  BS.drums={sr, kick, snare, hat, crash}; return BS.drums;
}
/* the chord pattern the band plays: yours, or the first of the page's patterns that fits the key */
function bandProg(){
  if(S.prog && S.prog.length){ const pr=S.preset && PRESETS.find(p=>p.id===S.preset);
    return {chords:S.prog, id:pr?pr.id:"", name:pr?(S.lang==="es"?pr.es:pr.en):(typeof t==="function"?t("myOwn"):"")}; }
  const pr=PRESETS.find(p=>p.minor===S.minor)||PRESETS[0];
  return {chords:pr.chords, id:pr.id, name:S.lang==="es"?pr.es:pr.en};
}
function bandStyle(pr){
  if(pr.id==="blues" || (pr.chords.length>=8 && pr.chords.every(c=>c.q==="dom7"))) return "boogie";
  if(pr.id==="mblues") return "mblues";
  return S.minor ? "minor" : "straight";
}
function bandBpm(){ return BAND.beat && DRUM.take ? DRUM.take.bpm : S.bpm; }
function bandRigState(style){
  const crunchy=style==="boogie" || style==="mblues";
  const st=crunchy ? R("crunch","green412",{gain:4, bass:5, mid:6.5, treble:5.5, master:5})
                   : R("clean","open212",{gain:3, bass:5, mid:5, treble:6, presence:5.5}, {bright:true, fx:{chorus:{on:true, rate:2, depth:3, mix:3}}});
  const o=AOGAmp.normalize(st, GTR?"guitar":"bass"); o.pickup=crunchy?PU.humb:PU.single; return o;
}
/* the band's own chain: makeChain on the same context, its master into dest (the lead's limiter, live) */
function bandParts(c, B, dest){
  const ch=makeChain(c); try{ ch.master.disconnect(); }catch(e){}
  B.mix=gainAt(c, BAND_LVL); ch.master.gain.value=1; ch.master.connect(B.mix); B.mix.connect(dest);
  ch.send.gain.value=0.07;
  try{ setEra(ch, S.era, 0); }catch(e){}
  B.bass=gainAt(c, 0.85); const blp=c.createBiquadFilter(); blp.type="lowpass"; blp.frequency.value=2000; blp.Q.value=0.6; B.bass.connect(blp); blp.connect(ch.pre);
  B.drums=gainAt(c, 0.75); B.drums.connect(ch.pre);
  B.ch=ch; B.c=c; return ch;
}
function bandSetup(B){ B.ch.rig.set(bandRigState(B.style)); B.ch.post.gain.value=B.style==="boogie"||B.style==="mblues"?0.784:0.705; }
function strumNotes(chord){
  const pc=((S.key+chord.off)%12+12)%12, r=40+((pc-4+12)%12), q=chord.q, third=(q==="min"||q==="m7")?3:4, sev=q==="dom7"||q==="m7"?10:q==="maj7"?11:-1;
  const n=[r, r+7, r+12, r+12+third]; n.push(sev>=0 ? r+12+sev : r+19); return n;
}
function bandNote(c, B, kind, m, v, when, end, tau){
  const [buf, rate]=bsBuf(kind, m); if(!buf) return null;
  const src=c.createBufferSource(); src.buffer=buf; src.playbackRate.value=rate;
  const g=gainAt(c, v); src.connect(g); g.connect(kind==="gtr"?B.ch.amp:B.bass);
  const tt=tau||0.04; src.start(when); g.gain.setValueAtTime(v, end); g.gain.setTargetAtTime(0, end, tt);
  try{ src.stop(end+tt*8+0.02); }catch(e){}
  const vo={end:end+tt*8, kill(t){ try{ g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0,t,0.012); src.stop(t+0.12); }catch(e){} }};
  B.voices.push(vo); return vo;
}
function drumHit(c, B, which, when, v){
  const D=drumBufs(c), b=c.createBufferSource(); b.buffer=D[which]; const g=gainAt(c, v); b.connect(g); g.connect(B.drums); b.start(when);
  B.voices.push({end:when+b.buffer.duration, kill(t){ try{ g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0,t,0.01); b.stop(t+0.08); }catch(e){} }});
}
function blog(B, p, t, m){ B.log.push({p, t:+t.toFixed(4), m}); if(B.log.length>600) B.log.splice(0, 100); }
/* one bar of the band, on any context (live, or offline in a test) */
function bandBar(c, B, k, t0, barSec){
  const pr=bandProg(), chords=pr.chords, chord=chords[k%chords.length], next=chords[(k+1)%chords.length]; if(!chord) return;
  const beat=barSec/4, lean=x=>(Math.abs((x%1)-0.5)<1e-6)?(B.swing-0.5)*beat:0, at=x=>t0+x*beat+lean(x);
  const st=B.style, pc=((S.key+chord.off)%12+12)%12, gr=40+((pc-4+12)%12);
  /* the rhythm guitar */
  if(st==="boogie"){
    for(let i=0;i<8;i++){ const x=i/2, six=((i>>1)%2)===1, dy=[gr, gr+(six?9:7)];
      dy.forEach((m,j)=>{ const w0=at(x)+j*0.006; bandNote(c, B, "gtr", m, i%2?0.42:0.52, w0, w0+0.42*beat, 0.02); blog(B,"gtr",w0,m); }); }
  } else {
    const notes=strumNotes(chord), pat=st==="mblues"
      ? [[0,"d",1.2,.5],[1.5,"u",.3,.34],[2.5,"d",.4,.44],[3.5,"u",.3,.34]]
      : st==="minor" ? [[0,"d",1.5,.52],[1.5,"u",.4,.36],[2,"d",.9,.46],[3,"d",.4,.42],[3.5,"u",.4,.34]]
      : [[0,"d",1.5,.55],[1.5,"u",.5,.36],[2,"d",.5,.46],[2.5,"u",.5,.36],[3,"d",.5,.46],[3.5,"u",.5,.34]];
    pat.forEach(([x,dir,d,v])=>{ const ns=dir==="d"?notes:notes.slice(-3).reverse(), sp=dir==="d"?0.009:0.007;
      ns.forEach((m,j)=>{ const w0=at(x)+j*sp; bandNote(c, B, "gtr", m, v*(1-0.04*j), w0, at(x)+d*beat, d<0.45?0.02:0.05); blog(B,"gtr",w0,m); }); });
  }
  /* the bass (on the guitar page) */
  if(GTR){
    const br=28+((pc-4+12)%12), npc=((S.key+next.off)%12+12)%12, nb=28+((npc-4+12)%12), minor=chord.q==="min"||chord.q==="m7";
    const line = st==="boogie" ? [0,4,7,9,10,9,7,4].map((iv,i)=>[i/2, br+iv, 0.45, i%2?0.62:0.74])
      : (st==="mblues"||st==="minor") ? [[0,br,1.4,.78],[1.5,br,.45,.62],[2,br+7,.9,.7],[3,br+(minor?10:10),.45,.62],[3.5,br+12,.45,.66]]
      : [[0,br,.9,.78],[1,br,.45,.62],[1.5,br,.45,.66],[2,br,.9,.72],[3,br+7,.45,.64],[3.5,nb>br?nb-1:nb+1,.45,.6]];
    line.forEach(([x,m,d,v])=>{ const w0=at(x); bandNote(c, B, "bass", m, v, w0, w0+d*beat, 0.04); blog(B,"bass",w0,m); });
  }
  /* the drums made here (the drum machine's beat loops on its own) */
  if(!B.beat){
    const kick=st==="boogie"||st==="mblues"?[0,2]:[0,2,2.5], snare=[1,3];
    if(k%chords.length===0){ drumHit(c, B, "crash", at(0), 0.5); blog(B,"crash",at(0)); }
    kick.forEach(x=>{ drumHit(c, B, "kick", at(x), 0.95); blog(B,"kick",at(x)); });
    snare.forEach(x=>{ drumHit(c, B, "snare", at(x), 0.62); blog(B,"snare",at(x)); });
    for(let i=0;i<8;i++){ const x=i/2; drumHit(c, B, "hat", at(x), i%2?0.32:0.46); blog(B,"hat",at(x)); }
  }
}
async function bandStart(){
  if(BAND.on) return;
  const c=ctx();
  if(!BAND.ch || BAND.c!==c) bandParts(c, BAND, LIVE_CH.lim);
  BAND.beat=!!(P.beat && DRUM.take && DRUM.take.wav && DRUM.take.bpm);
  if(BAND.beat && !DRUM.buf){ try{ DRUM.buf=await decodeWith(c, await DRUM.take.wav.arrayBuffer()); }catch(e){ DRUM.buf=null; } if(!DRUM.buf) BAND.beat=false; }
  if(BAND.on) return;
  const pr=bandProg(); BAND.style=bandStyle(pr);
  BAND.swing=BAND.beat ? ((typeof DRUM.take.swing==="number")?DRUM.take.swing:0.5) : ((BAND.style==="boogie"||BAND.style==="mblues")?0.64:0.5);
  bandSetup(BAND);
  BS_NOTES.gtr.forEach(n=>bsMake("gtr",n)); if(GTR) BS_NOTES.bass.forEach(n=>bsMake("bass",n)); drumBufs(c);
  BAND.bpm=bandBpm(); BAND.barSec=240/BAND.bpm; BAND.bar=0; BAND.cur=-1; BAND.chord=null; BAND.voices=[]; BAND.log=[];
  try{ BAND.mix.gain.cancelScheduledValues(c.currentTime); BAND.mix.gain.setValueAtTime(BAND_LVL, c.currentTime); }catch(e){}
  const T=c.currentTime+0.15;
  if(BAND.beat){
    const d=DRUM.take, off=(typeof d.offset==="number")?d.offset:0.03, s=c.createBufferSource(); s.buffer=DRUM.buf; s.loop=true;
    const pass=(d.passSec && d.loops) ? d.passSec*d.loops : (d.bars||8)*BAND.barSec;
    s.loopStart=off; s.loopEnd=Math.min(DRUM.buf.duration, off+pass);
    const g=gainAt(c, 0.9); s.connect(g); g.connect(BAND.ch.pre); s.start(T); BAND.loop={src:s, g}; BAND.t0=T+off; blog(BAND,"loop",T);
  } else BAND.t0=T;
  BAND.on=true; BAND.started=T;
  bandTick(c.currentTime); wake(); paintBand();
}
function bandStop(){
  if(!BAND.on) return;
  BAND.on=false; const now=BAND.c?BAND.c.currentTime:0;
  BAND.voices.forEach(v=>v.kill(now)); BAND.voices=[];
  if(BAND.loop){ try{ BAND.loop.g.gain.setTargetAtTime(0, now, 0.01); BAND.loop.src.stop(now+0.1); }catch(e){} BAND.loop=null; }
  BAND.stopped=now; BAND.cur=-1; BAND.chord=null; paintBand(); SO.sig=""; soPaint();
}
function bandTick(now){
  if(!BAND.beat && S.bpm!==BAND.bpm){ const next=BAND.t0+BAND.bar*BAND.barSec, nb=240/S.bpm; BAND.t0=next-BAND.bar*nb; BAND.barSec=nb; BAND.bpm=S.bpm; paintBandLine(); }
  while(BAND.t0+BAND.bar*BAND.barSec < now+0.5){ bandBar(BAND.c, BAND, BAND.bar, BAND.t0+BAND.bar*BAND.barSec, BAND.barSec); BAND.bar++; }
  const cur=Math.floor((now-BAND.t0)/BAND.barSec);
  if(cur>=0 && cur!==BAND.cur){ BAND.cur=cur; const ch=bandProg().chords; BAND.chord=ch[cur%ch.length]; paintBandProg(); SO.sig=""; soPaint(); }
  if(BAND.voices.length>240) BAND.voices=BAND.voices.filter(v=>v.end>now);
}
function paintTempo(){
  const r=$q("soBpm"); if(!r) return; const locked=!!(P.beat && DRUM.take && DRUM.take.bpm);
  const bpm=locked?Math.round(DRUM.take.bpm):S.bpm; r.value=String(bpm); r.disabled=locked;
  $q("soBpmOut").textContent=w("bpm",{n:bpm}); r.setAttribute("aria-valuetext", w("bpm",{n:bpm}));
}
function paintBandLine(){
  const el=$q("soBandLine"); if(!el) return; const pr=bandProg(), locked=!!(P.beat && DRUM.take && DRUM.take.bpm);
  const bpm=locked?Math.round(DRUM.take.bpm):S.bpm;
  el.textContent=w("bandLine",{prog:pr.name, key:keyWord(), n:bpm})+" "+w(locked?"drumsUser":"drumsOwn")+(GTR?"":" "+w("bassBand"));
}
function paintBandProg(){
  const box=$q("soBandProg"); if(!box) return; const pr=bandProg(), k=BAND.on && BAND.cur>=0 ? BAND.cur%pr.chords.length : -1;
  const html=pr.chords.map((c,i)=>`<span class="slot${i===k?" now":""}">${esc(chordName(c))}</span>`).join("");
  if(box.innerHTML!==html) box.innerHTML=html;
}
function paintBand(){
  if(!SO.built) return;
  const b=$q("soBand"); b.textContent=w(BAND.on?"bandStop":"bandPlay"); b.classList.toggle("go", BAND.on);
  const bx=$q("soBeatBox");
  if(DRUM.take && DRUM.take.wav){ bx.innerHTML=`<button type="button" class="pbtn" id="soBeat" aria-pressed="${P.beat?"true":"false"}">${esc(w("useBeat"))}</button>`;
    $q("soBeat").onclick=()=>{ P.beat=!P.beat; keep(); const was=BAND.on; if(was) bandStop(); paintBand(); if(was) bandStart(); }; }
  else bx.innerHTML="";
  paintTempo(); paintBandLine(); paintBandProg();
}

/* ══ licks: played into the lead's own chain with the same notes a finger makes, each note lit as it plays ══ */
const LICK={on:false, voices:[], lights:[], end:0, raf:0, id:"", key:""};
function boxRoot(){ const pc=S.minor?S.key:(S.key+9)%12; return (pc-4+12)%12; }
function lickNotes(id){
  const r=boxRoot(), out=(LICKS[id]||[]).map(e=>Object.assign({}, e, {f:r+e.f, sl:e.sl?[r+e.sl[0], e.sl[1], e.sl[2]]:null}));
  if(!S.minor){
    /* in a major key the lick comes home to the key's own note: the nearest one in the box */
    const home=out.filter(n=>n.home).pop(), want=S.key%12;
    if(home){ let best=null, bs=1e9;
      for(let s=0;s<TUNING.length;s++) for(let f=r;f<=r+4;f++){ if((TUNING[s]+f)%12!==want) continue; const sc=Math.abs(s-home.s)*2+Math.abs(f-home.f)+(s<home.s?0.5:0); if(sc<bs){ bs=sc; best={s,f}; } }
      if(best){ home.s=best.s; home.f=best.f; } }
  }
  return out.sort((a,b)=>a.t-b.t || a.s-b.s);
}
function lickVib(n){ return n.v==null ? null : Array.isArray(n.v) ? n.v : [n.v, 1e9]; }
/* the pitch of one string's voice over the lick: the note sounding, its bend, its slide, its vibrato */
function lickFn(list, beat){
  return (t)=>{
    let cur=list[0]; for(const x of list){ if(x.at<=t+1e-6) cur=x; else break; }
    const n=cur.n, rel=(t-cur.at)/beat; let m=cur.m, bend=0;
    if(n.sl){ const to=TUNING[n.s]+n.sl[0], p=clamp((rel-n.sl[1])/n.sl[2],0,1); m=cur.m+Math.round((to-cur.m)*p); }
    if(n.b){ const [amt, a, d, ra, rd]=n.b; bend=amt*smooth((rel-a)/d); if(ra!=null) bend-=amt*smooth((rel-ra)/rd); }
    const vv=lickVib(n); let vib=0;
    if(vv && rel>=vv[0] && rel<vv[1]+0.5){ const tt=(rel-vv[0])*beat, k=Math.min(1,tt/0.15)*(rel>vv[1]?Math.max(0,1-(rel-vv[1])*beat/0.12):1);
      vib=(bend>1?-1:1)*0.32*k*(1-Math.cos(2*Math.PI*5.5*tt))/2; }
    return m+bend+vib;
  };
}
function playLick(id){
  lickStop();
  const ev=LICKS[id]; if(!ev || !GTR) return;
  const c=ctx(), r=boxRoot(), want=Math.max(1, r);
  if(S.fret0!==want){ S.fret0=want; buildNeck(); if(typeof save==="function") save(); }
  const bpm=clamp(BAND.on?BAND.bpm:curBpm(), 60, 132), beat=60/bpm;
  let T0=c.currentTime+0.12;
  if(BAND.on){ const k=Math.ceil((T0-BAND.t0)/BAND.barSec-1e-6); T0=BAND.t0+k*BAND.barSec; }
  const notes=lickNotes(id), cur={}, lights=[], voices=[];
  notes.forEach(n=>{
    const at=T0+n.t*beat, end=at+n.d*beat, m=TUNING[n.s]+n.f, k=n.k||"p";
    let v=cur[n.s];
    const legato=(k==="h"||k==="o"||(k==="t" && v)) && v && v.lv && at<=v.end+0.08;
    if(legato){ v.list.push({at, m, n}); v.end=Math.max(v.end, end); }
    else {
      if(v) v.cut=at;
      const lv=makeLead(n.s, m, k==="g"?0.32:(P.pinch?0.62:0.74), at, {soft:k==="t", pinch:P.pinch && k!=="g"});
      v=cur[n.s]={lv, list:[{at, m, n}], end:k==="g"?at+0.035:end, cut:null, ghost:k==="g"};
      if(lv) voices.push(v);
    }
    lights.push({t0:at, t1:k==="g"?at+0.09:end, s:n.s, n, beat, at});
  });
  /* each light ends when the next note on its string begins */
  lights.forEach(L=>{ const nx=lights.find(M=>M!==L && M.s===L.s && M.t0>L.t0+1e-6); if(nx) L.t1=Math.min(L.t1, nx.t0); });
  voices.forEach(v=>{ const lv=v.lv, stopAt=v.cut!=null?Math.min(v.cut, v.end):v.end;
    lv.fn=lickFn(v.list, beat); lv.planAll=true; lv.planEnd=stopAt; lv.until=lv.born-STEP; lv.lastT=NaN; lv.plan(c.currentTime);
    DYN.add(lv); lv.stop(stopAt, v.ghost?0.012:(v.cut!=null?0.02:((SOUNDS[S.sound]&&SOUNDS[S.sound].damp)||0.04)*1.5)); });
  LICK.voices=voices; LICK.lights=lights; LICK.end=Math.max.apply(null, lights.map(L=>L.t1)); LICK.on=true; LICK.id=id; LICK.key=""; LICK.t0=T0;
  LICK.log=notes.map(n=>({t:+(T0+n.t*beat).toFixed(4), s:n.s, f:n.f, m:TUNING[n.s]+n.f, k:n.k||"p"}));
  const ln=$q("soLickLine"); if(ln) ln.textContent=w("playing",{name:w("lk_"+id)})+" "+w("lickNow");
  paintLickBtn(); wake();
  LICK.raf=requestAnimationFrame(lickFrame);
}
function lickState(L, now){
  const v=LICK.voices.find(x=>x.list.some(e=>e.n===L.n)); const fn=v&&v.lv&&v.lv.fn;
  let m=TUNING[L.s]+L.n.f, bend=0;
  if(fn){ const T=fn(now); const n=L.n; let b=0; if(n.b){ const rel=(now-L.at)/L.beat, [amt,a,d,ra,rd]=n.b; b=amt*smooth((rel-a)/d); if(ra!=null) b-=amt*smooth((rel-ra)/rd); }
    bend=b; m=Math.round(T-b); }
  const k=L.n.k||"p", tag=L.n.b&&bend>0.05?"b":L.n.sl&&m!==TUNING[L.s]+L.n.f?"sl":(k!=="p"?k:(lickVib(L.n)&&(now-L.at)/L.beat>=lickVib(L.n)[0]?"v":""));
  return {f:m-TUNING[L.s], bend, tag};
}
function lickFrame(){
  if(!LICK.on || !ac) return;
  const now=ac.currentTime;
  if(now>LICK.end+0.06){ lickStop(true); return; }
  const act=[]; LICK.lights.forEach(L=>{ if(now>=L.t0 && now<L.t1){ const st=lickState(L, now); act.push({s:L.s, f:st.f, bend:st.bend, tag:st.tag}); } });
  const key=act.map(a=>a.s+":"+a.f+":"+a.tag+":"+Math.round(a.bend*24)).join("|");
  if(key!==LICK.key){ LICK.key=key; drawLickNow(act); }
  LICK.raf=requestAnimationFrame(lickFrame);
}
function drawLickNow(act){
  const svg=$q("neck"); if(!svg) return; const top=svg.querySelector("#soTop"); if(!top) return;
  let g=top.querySelector("#soLick"); if(!g){ g=gEl("soLick"); g.setAttribute("aria-hidden","true"); top.appendChild(g); }
  const R0=Math.min(NECK.cw,NECK.rowH)*0.36; let html="";
  const bentNow=new Set();
  act.forEach(a=>{
    if(!inWin(a.f)) return;
    const [x,y]=cellXY(a.s, a.f), nm=pcName(TUNING[a.s]+a.f), fs=nm.length>3?10:nm.length>2?11.5:13.5;
    html+=`<g class="so-now" data-c="${a.s}:${a.f}"><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(R0)}"/><text x="${f1(x)}" y="${f1(y)}" style="font-size:${fs}px">${nm}</text></g>`;
    if(a.tag){ const tw=w("tg_"+a.tag), ty=y-R0-8>NECK.top+4 ? y-R0-8 : y+R0+9, wd=tw.length*6.4+10;
      html+=`<rect class="so-tagbg" x="${f1(x-wd/2)}" y="${f1(ty-8)}" width="${f1(wd)}" height="16" rx="5"/><text class="so-tag" x="${f1(x)}" y="${f1(ty)}" style="font-size:11px">${esc(tw)}</text>`; }
    if(a.bend>0.03){ bentNow.add(a.s); drawBend(a.s, a.f, a.bend, -1); }
  });
  g.innerHTML=html;
  for(let s=0;s<TUNING.length;s++) if(!bentNow.has(s) && !(SOUNDING[s] && SOUNDING[s].bend>0.02)) clearBend(s);
}
function lickStop(natural){
  if(!LICK.on) return;
  LICK.on=false; if(LICK.raf) cancelAnimationFrame(LICK.raf); LICK.raf=0;
  if(!natural && ac){ const now=ac.currentTime; LICK.voices.forEach(v=>{ if(v.lv){ try{ v.lv.vc.kill(now); v.lv.parts.forEach(p=>p.kill(now)); }catch(e){} DYN.delete(v.lv); } }); }
  LICK.voices.forEach(v=>{ if(v.lv) DYN.delete(v.lv); });
  LICK.voices=[]; LICK.lights=[]; LICK.key="";
  const svg=$q("neck"), g=svg && svg.querySelector("#soLick"); if(g) g.innerHTML="";
  for(let s=0;s<TUNING.length;s++) if(!(SOUNDING[s] && SOUNDING[s].bend>0.02)) clearBend(s);
  const ln=$q("soLickLine"); if(ln) ln.textContent=w("ld_"+P.lick);
  paintLickBtn();
}
function paintLickBtn(){ const b=$q("soLickBtn"); if(b){ b.textContent=w(LICK.on?"lickStop":"lickPlay"); b.setAttribute("aria-pressed", LICK.on?"true":"false"); } }

/* ══ an offline render of the band (and a lead note over it), for the tests: what it costs and how loud ══ */
async function renderBand(bars, o){
  o=o||{};
  const sr=44100, B={voices:[], log:[], beat:false}, pr=bandProg(); B.style=bandStyle(pr); B.swing=(B.style==="boogie"||B.style==="mblues")?0.64:0.5;
  const bpm=S.bpm, barSec=240/bpm, dur=bars*barSec+1.2;
  const oc=new OfflineAudioContext(2, Math.ceil(dur*sr), sr); await AOGAmp.load(oc);
  const lead=makeChain(oc); setSound(lead, S.sound); lead.master.gain.value=volGain(S.vol); setEra(lead, 0, 0);
  if(o.band!==false){ bandParts(oc, B, lead.lim); bandSetup(B); BS_NOTES.gtr.forEach(n=>bsMake("gtr",n)); if(GTR) BS_NOTES.bass.forEach(n=>bsMake("bass",n));
    for(let k=0;k<bars;k++) bandBar(oc, B, k, 0.1+k*barSec, barSec); }
  if(o.lead){ const m=o.lead, s=TUNING.reduce((b,x,i)=>(m-x>=0 && m-x<=MAXF)?i:b, 0); const vc=makeVoice(oc, lead, S.sound, m, 0.76, 0.2, s); if(vc) vc.stop(dur-0.6, 0.05); }
  const t0=performance.now(); const buf=await oc.startRendering();
  return {ms:performance.now()-t0, dur, buf, log:B.log};
}

/* ══ the page's way in ══════════════════════════════════════════════════════ */
function init(){
  if(!build()) return;
  SO.on=P.mode==="solo";
  paintWords();
  if(SO.on){ setMode("solo", true); }
  document.addEventListener("visibilitychange",()=>{ if(document.hidden){ bandStop(); lickStop(); releaseAll(); } });
  window.addEventListener("pagehide",()=>{ bandStop(); lickStop(); });
  window.addEventListener("blur",()=>{ if(SO.on) releaseAll(); });
  window.addEventListener("focus",()=>{ if(SO.on) paintBand(); });
  try{ AOGHandoff.listen(function(k){ if(k==="drumbench") setTimeout(()=>{ if(SO.built) paintBand(); }, 300); }); }catch(e){}
  setTimeout(()=>{ if(SO.built) paintBand(); }, 1200);           /* the drum machine's beat is looked up when the page opens */
}
window.AOGSolo={
  paint:soPaint, down:down, move:move, up:up, key:key,
  setMode:setMode, isOn:()=>SO.on,
  _t:{P, SO, BAND, LICK, LICKS, FING, KEYF, SOUNDING, WH, Lead, bendFrom, boxRoot, keyCells, lickNotes, renderBand, scalePcs, bluePc,
      leadsNow, whamTo, killSet, playLick, lickStop, bandStart, bandStop, strumNotes, hotAmp, landChord, get LAST(){ return LAST; }}
};
init();
})();
