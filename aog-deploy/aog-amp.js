/* AOG-AMP-V1 (2026-10-03) — Jimmy: "May the guitar and bass get a Amplifier installed on their pages. The top amp with tons
   of eq knobs and sound effects", "Build a guitar / bass amp that is the worlds best that has guitar pedals … attached to it,
   this will be a part of the two engines", "I want a metal style sounds (like Pantera / lamb of god)", and "There is NO
   distortion for the METAL guitar chords".

   One amplifier rig for the guitar and the bass pages, the same in the live engine and in every recording made offline
   (Send to the turntables, Send chords to the drum machine, Record):

     guitar ─ pickup ─ [gate · compressor · wah · octave] ─ [overdrive · distortion · fuzz] ─ AMP ─ cabinet ─ EQ
             ─ [chorus · phaser · flanger · tremolo] ─ [delay] ─ [reverb] ─ out

   The AMP is a preamp of one to four tube (or transistor) stages, the real treble–middle–bass tone stack of the amp it is
   modelled on, and a power amp that sags when it is pushed. Everything that bends the wave runs in aog-amp-worklet.js,
   four times oversampled, so the distortion is the same on an iPad as on a computer (no WaveShaper). The cabinet is a
   speaker's own response turned into an impulse (minimum phase, made here, nothing downloaded). The rest is Web Audio.

   AOGAmp.load(ctx)             → Promise; adds the worklet to that context (await it before an offline render)
   AOGAmp.create(ctx, {kind})   → rig {input, output, set(state)}; kind "guitar" or "bass"
   AOGAmp.defaults(kind)        → a state: {model, cab, k:{gain…}, bright, tight, eq:{on, db:[10]}, fx:{…}}
   AOGAmp.ui(host, opts)        → the panel: amp head, pedalboard, EQ; opts {kind, lang(), get(), set(state), reset()} */
(function(G){
"use strict";

/* ── words (plain, English and Spanish) ── */
const WORDS={
  amp:{en:"Amp",es:"Amplificador"}, cab:{en:"Speaker cabinet",es:"Bafle"},
  gain:{en:"Gain",es:"Ganancia"}, bass:{en:"Bass",es:"Graves"}, mid:{en:"Middle",es:"Medios"}, treble:{en:"Treble",es:"Agudos"},
  presence:{en:"Presence",es:"Presencia"}, depth:{en:"Depth",es:"Profundidad"}, master:{en:"Master",es:"Master"}, blend:{en:"Blend",es:"Mezcla"},
  bright:{en:"Bright",es:"Brillo"}, tight:{en:"Tight",es:"Ajustado"},
  pedals:{en:"Pedals",es:"Pedales"}, eq:{en:"EQ · ten bands",es:"Ecualizador · diez bandas"},
  on:{en:"On",es:"Encendido"}, off:{en:"Off",es:"Apagado"}, flat:{en:"Flat",es:"Plano"},
  eqUse:{en:"Use the EQ",es:"Usar el ecualizador"},
  back:{en:"Put this sound back",es:"Volver a este sonido"},
  backDone:{en:"Back to how this sound came.",es:"Volvió a como venía este sonido."},
  kept:{en:"Your settings stay with this sound.",es:"Tus ajustes se quedan con este sonido."},
  ampHelp:{en:"Gain adds grit. Bass, Middle and Treble shape the tone. Master is how hard the power tubes work.",
           es:"La ganancia añade aspereza. Graves, Medios y Agudos dan forma al tono. Master es cuánto trabajan las válvulas de potencia."},
  brightHelp:{en:"Bright adds sparkle. Tight keeps low notes firm when the gain is high.",es:"Brillo añade chispa. Ajustado mantiene firmes las notas graves con mucha ganancia."},
  pedalHelp:{en:"Press On to use a pedal. Its knobs appear when it is on.",es:"Pulsa Encendido para usar un pedal. Sus perillas aparecen cuando está encendido."},
  before:{en:"Before the amp",es:"Antes del amplificador"}, after:{en:"After the amp",es:"Después del amplificador"},
  mode:{en:"Mode",es:"Modo"}, type:{en:"Type",es:"Tipo"},
  touch:{en:"Touch",es:"Toque"}, fixed:{en:"Fixed",es:"Fijo"}, sine:{en:"Smooth",es:"Suave"}, square:{en:"Choppy",es:"Cortado"},
  spring:{en:"Spring",es:"Muelle"}, room:{en:"Room",es:"Sala"}, hall:{en:"Hall",es:"Auditorio"}, plate:{en:"Plate",es:"Placa"},
  db:{en:"dB",es:"dB"}, ms:{en:"ms",es:"ms"}
};

/* ── knobs ── */
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const n10=v=>clamp(+v||0,0,10)/10;
const lg=n=>(Math.exp(3*n)-1)/(Math.exp(3)-1);          /* an audio-taper pot: half way round is about a tenth */
const dbl=d=>Math.pow(10,d/20);

/* ══ the amps ══════════════════════════════════════════════════════════════
   Each turns the knobs (0 to 10, as on an amp) into the numbers aog-amp-worklet.js runs: the stages (gain, how much
   headroom before the wave bends, which side bends first, the coupling capacitor and the Miller roll-off), the tone stack
   and where it sits, and the power amp. lvl evens out the loudness as Gain turns (measured, AOG-AMP-V1). */
const STACKS={
  fender:  {C1:250e-12, C2:100e-9, C3:47e-9, R1:250e3, R2:250e3, R3:10e3, R4:100e3},   /* blackface Twin */
  tweed:   {C1:250e-12, C2:20e-9,  C3:20e-9, R1:250e3, R2:1e6,   R3:25e3, R4:56e3},    /* '59 Bassman */
  marshall:{C1:470e-12, C2:22e-9,  C3:22e-9, R1:220e3, R2:1e6,   R3:22e3, R4:33e3},    /* JCM800 / Plexi */
  modern:  {C1:250e-12, C2:47e-9,  C3:22e-9, R1:250e3, R2:1e6,   R3:25e3, R4:47e3},    /* a modern high-gain head */
  chime:   {C1:220e-12, C2:22e-9,  C3:47e-9, R1:1e6,   R2:1e6,   R3:10e3, R4:100e3}    /* bright and open, for jangle */
};
function pd(k){ return {presDb:(n10(k.presence)-0.5)*14, depthDb:(n10(k.depth)-0.5)*12}; }
const MODELS={
  none:{kind:"both", en:"No amp · straight in", es:"Sin amplificador · directo", cab:"off", out:1, lvl:[0,0,0,0,0]},
  clean:{kind:"guitar", en:"Clean · American", es:"Limpio · americano", cab:"open212", out:0.370, lvl:[-3.8,-2,0,1.7,2.9],
    make:(k,sw)=>Object.assign({inHp:sw.tight?150:45, brightDb:sw.bright?8*(1-0.7*n10(k.gain)):0, brightF:1400,
      stages:[{g:1.4+11*lg(n10(k.gain)), head:4.5, asym:1.25, bias:0.05, hp:18, lp:13000},
              {g:2.6, head:4.0, asym:1.2, bias:0.04, hp:22, lp:12000}],
      stackAt:0, stack:STACKS.fender, stackGain:3.2,
      power:{drive:0.3+0.8*n10(k.master), head:2.0, sag:0.12}, presF:3800, depthF:95}, pd(k))},
  blues:{kind:"guitar", en:"Blues · tweed", es:"Blues · tweed", cab:"open112", out:0.422, lvl:[-4.1,-1.4,0,0.8,1.2],
    make:(k,sw)=>Object.assign({inHp:sw.tight?150:40, brightDb:sw.bright?5*(1-0.6*n10(k.gain)):0, brightF:1800,
      stages:[{g:1+24*lg(n10(k.gain)), head:1.7, asym:1.4, bias:0.1, hp:20, lp:10000},
              {g:2.0, head:1.8, asym:1.3, bias:0.12, hp:30, lp:9000}],
      stackAt:0, stack:STACKS.tweed, stackGain:3.4,
      power:{drive:0.35+1.1*n10(k.master), head:1.3, sag:0.45}, presF:3200, depthF:100}, pd(k))},
  chime:{kind:"guitar", en:"Chime · British jangle", es:"Campana · brillo británico", cab:"blue212", out:0.377, lvl:[-3.2,-1.1,0,0.6,0.8],
    make:(k,sw)=>Object.assign({inHp:sw.tight?150:55, brightDb:sw.bright?7:3, brightF:2600,
      stages:[{g:1+20*lg(n10(k.gain)), head:1.7, asym:1.3, bias:0.08, hp:30, lp:12000},
              {g:2.0, head:2.0, asym:1.25, bias:0.06, hp:45, lp:11000}],
      stackAt:1, stack:STACKS.chime, stackGain:3.6,
      power:{drive:0.45+1.1*n10(k.master), head:1.1, sag:0.35}, presF:4200, depthF:110}, pd(k))},
  crunch:{kind:"guitar", en:"Crunch · British rock", es:"Crujiente · rock británico", cab:"green412", out:0.345, lvl:[-3,-0.8,0,0.4,0.5],
    make:(k,sw)=>Object.assign({inHp:sw.tight?160:35, brightDb:sw.bright?6*(1-0.5*n10(k.gain)):2, brightF:3000,
      stages:[{g:1+34*lg(n10(k.gain)), head:1.5, asym:1.35, bias:0.1, hp:30, lp:12000, cut:5, cutF:300},
              {g:4, head:1.4, asym:1.6, bias:0.25, hp:60, lp:9000}],
      stack:STACKS.marshall, stackGain:3.0,
      power:{drive:0.45+0.9*n10(k.master), head:1.2, sag:0.3}, presF:3500, depthF:100}, pd(k))},
  lead:{kind:"guitar", en:"Lead · smooth and singing", es:"Solista · suave y cantante", cab:"v30_412", out:0.339, lvl:[-1,-0.3,0,0.1,0.2],
    make:(k,sw)=>Object.assign({inHp:sw.tight?160:60, brightDb:sw.bright?5:0, brightF:2500,
      stages:[{g:1.2+40*lg(n10(k.gain)), head:1.4, asym:1.4, bias:0.1, hp:30, lp:9000},
              {g:5, head:1.2, asym:1.5, bias:0.2, hp:120, lp:7000, cut:4, cutF:220},
              {g:2.5, head:1.2, asym:1.3, bias:0.1, hp:40, lp:6500}],
      stack:STACKS.marshall, stackGain:3.0,
      power:{drive:0.45+0.8*n10(k.master), head:1.2, sag:0.25}, presF:3300, depthF:95}, pd(k))},
  high:{kind:"guitar", en:"High gain · modern metal", es:"Alta ganancia · metal moderno", cab:"v30_412", out:0.380, lvl:[-0.2,0,0,0,0],
    make:(k,sw)=>Object.assign({inHp:sw.tight?170:100, brightDb:sw.bright?5:1, brightF:2800,
      stages:[{g:1.5+70*lg(n10(k.gain)), head:1.3, asym:1.4, bias:0.1, hp:30, lp:12000},
              {g:7, head:1.1, asym:1.6, bias:0.2, hp:120, lp:8000, cut:8, cutF:280},
              {g:5, head:1.0, asym:1.8, bias:0.3, hp:60, lp:7000},
              {g:2, head:1.2, asym:1.3, bias:0.05, hp:40, lp:6500}],
      stack:STACKS.modern, stackGain:3.0,
      power:{drive:0.45+0.7*n10(k.master), head:1.2, sag:0.22}, presF:3400, depthF:90}, pd(k))},
  groove:{kind:"guitar", en:"Groove metal · solid state", es:"Metal groove · transistores", cab:"v30_412", out:0.385, lvl:[-0.3,0,0,0,0],
    make:(k,sw)=>Object.assign({inHp:sw.tight?170:110, brightDb:sw.bright?5:2, brightF:3000,
      stages:[{g:4+200*lg(n10(k.gain)), head:0.7, hard:true, hp:60, lp:6500},
              {g:4, head:0.7, hard:true, hp:100, lp:5500, cut:6, cutF:250}],
      stack:STACKS.marshall, stackGain:2.6,
      power:{drive:0.7+0.6*n10(k.master), head:1.0, sag:0.04, hard:true}, presF:3600, depthF:85}, pd(k))},
  /* the bass amps: a bass player's tone controls (low shelf, a middle, a high shelf) in place of the guitar stack */
  btube:{kind:"bass", en:"Bass · classic tube", es:"Bajo · válvulas clásico", cab:"b810", out:0.306, lvl:[-4.6,-2.5,0,2.3,4.2],
    make:(k,sw)=>Object.assign({inHp:sw.tight?60:22, brightDb:sw.bright?6:0, brightF:2500,
      stages:[{g:1+8*lg(n10(k.gain)), head:3.0, asym:1.2, bias:0.05, hp:12, lp:9000},
              {g:1.8, head:2.8, asym:1.2, bias:0.05, hp:15, lp:8000}],
      bax:{low:(n10(k.bass)-0.5)*24, lowF:60, mid:(n10(k.mid)-0.5)*20, midF:500, midQ:0.8, high:(n10(k.treble)-0.5)*24, highF:3000},
      power:{drive:0.35+0.9*n10(k.master), head:1.5, sag:0.3}, presF:5000, depthF:55}, pd(k))},
  bclean:{kind:"bass", en:"Bass · modern clean", es:"Bajo · limpio moderno", cab:"b410", out:0.646, lvl:[-4.2,-2.5,0,3.3,6.8],
    make:(k,sw)=>Object.assign({inHp:sw.tight?60:20, brightDb:sw.bright?7:0, brightF:3500,
      stages:[{g:1+5*lg(n10(k.gain)), head:3.0, hard:true, hp:10, lp:16000}],
      bax:{low:(n10(k.bass)-0.5)*24, lowF:70, mid:(n10(k.mid)-0.5)*20, midF:800, midQ:0.7, high:(n10(k.treble)-0.5)*24, highF:4000},
      power:{drive:0.4+0.6*n10(k.master), head:1.6, sag:0.02, hard:true}, presF:6000, depthF:50}, pd(k))},
  bdrive:{kind:"bass", en:"Bass · drive with clean lows", es:"Bajo · saturado con graves limpios", cab:"b410", out:0.379, lvl:[-3.5,-1.3,0,0.7,1.2],
    make:(k,sw)=>Object.assign({inHp:sw.tight?320:240, brightDb:sw.bright?6:2, brightF:2500,
      stages:[{g:6+140*lg(n10(k.gain)), head:0.6, hard:true, hp:120, lp:5000},
              {g:2, head:0.9, asym:1.2, bias:0.05, hp:80, lp:4500}],
      bax:{low:(n10(k.bass)-0.5)*24, lowF:80, mid:(n10(k.mid)-0.5)*20, midF:700, midQ:0.7, high:(n10(k.treble)-0.5)*24, highF:3000},
      blend:0.25+0.7*n10(k.blend==null?6:k.blend), cleanF:200, cleanGain:2.2,
      power:{drive:0.5+0.6*n10(k.master), head:1.2, sag:0.08}, presF:4000, depthF:60}, pd(k))},
  bvint:{kind:"bass", en:"Bass · vintage, warm", es:"Bajo · vintage, cálido", cab:"b115", out:0.334, lvl:[-6.3,-3.2,0,2.7,4.8],
    make:(k,sw)=>Object.assign({inHp:sw.tight?60:25, brightDb:sw.bright?5:0, brightF:2000,
      stages:[{g:1+12*lg(n10(k.gain)), head:2.6, asym:1.3, bias:0.08, hp:15, lp:5500}],
      bax:{low:(n10(k.bass)-0.5)*20, lowF:70, mid:(n10(k.mid)-0.5)*14, midF:400, midQ:0.8, high:(n10(k.treble)-0.5)*20, highF:2200},
      power:{drive:0.4+1.0*n10(k.master), head:1.3, sag:0.4}, presF:3500, depthF:60}, pd(k))}
};

/* ══ the speaker cabinets ═══════════════════════════════════════════════════
   A speaker's response, as a curve: the cabinet's low resonance, the cone's peaks and dips, how steeply it falls above a
   few kilohertz, and the small ripples a real cone has. Turned into an impulse with the phase a real speaker has
   (minimum phase), at the context's own rate. */
const CABS={
  off:     {kind:"both",   en:"None · straight to the desk", es:"Ninguno · directo a la mesa"},
  open112: {kind:"guitar", en:"1×12 open back · warm",        es:"1×12 abierto · cálido",       hp:[95,0.8], lp:[5200,2], peaks:[[900,1,-1.5],[2200,1.4,3],[3800,2,2]], seed:11},
  open212: {kind:"guitar", en:"2×12 open back · sparkling",   es:"2×12 abierto · chispeante",   hp:[85,0.9], lp:[6200,2], peaks:[[500,1,-1],[1800,1.2,2],[3500,1.6,3]], seed:12},
  blue212: {kind:"guitar", en:"2×12 British · bright",        es:"2×12 británico · brillante",  hp:[95,1.0], lp:[6800,2], peaks:[[1000,1.2,1.5],[2600,1.5,4],[4200,2,3]], seed:13},
  green412:{kind:"guitar", en:"4×12 British · warm and thick",es:"4×12 británico · cálido y grueso", hp:[78,1.3], lp:[4800,3], peaks:[[120,1.2,2],[700,1.2,-1],[1500,1.0,2.5],[2500,1.5,1.5]], seed:14},
  v30_412: {kind:"guitar", en:"4×12 modern · tight and heavy",es:"4×12 moderno · firme y pesado", hp:[82,1.4], lp:[5400,3], peaks:[[110,1.4,3],[480,1.0,-3],[2400,1.6,5],[4000,2.5,3]], seed:15},
  b810:    {kind:"bass",   en:"8×10 · big and punchy",        es:"8×10 · grande y con pegada",  hp:[42,1.2], lp:[4200,3], peaks:[[90,1,3],[800,1,-2],[2400,1.2,2]], seed:21},
  b410:    {kind:"bass",   en:"4×10 with tweeter · clear",    es:"4×10 con tweeter · claro",    hp:[40,1.0], lp:[9000,1], peaks:[[100,1,2],[600,1,-2],[3500,1.2,2]], seed:22},
  b115:    {kind:"bass",   en:"1×15 · round and deep",        es:"1×15 · redondo y profundo",   hp:[36,1.4], lp:[2600,3], peaks:[[80,1.3,3],[1200,1,-2]], seed:23}
};
function fft(re, im, inv){
  const n=re.length;
  for(let i=1,j=0;i<n;i++){ let bit=n>>1; for(;j&bit;bit>>=1) j^=bit; j^=bit; if(i<j){ let t=re[i]; re[i]=re[j]; re[j]=t; t=im[i]; im[i]=im[j]; im[j]=t; } }
  for(let len=2;len<=n;len<<=1){ const ang=(inv?2:-2)*Math.PI/len, wr=Math.cos(ang), wi=Math.sin(ang);
    for(let i=0;i<n;i+=len){ let cr=1, ci=0; for(let j=0;j<len/2;j++){ const a=i+j, b=a+len/2, vr=re[b]*cr-im[b]*ci, vi=re[b]*ci+im[b]*cr;
      re[b]=re[a]-vr; im[b]=im[a]-vi; re[a]+=vr; im[a]+=vi; const t=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=t; } } }
  if(inv) for(let i=0;i<n;i++){ re[i]/=n; im[i]/=n; }
}
function seeded(seed){ let x=(seed|0)||0x2f6b1a3d; return ()=>{ x^=x<<13; x^=x>>>17; x^=x<<5; return (x>>>0)/4294967296; }; }
/* |H(f)| of a biquad (analogue prototype), for the curve */
function magHP(f, f0, q){ const r=f/f0, re=1-1/(r*r), im=1/(q*r); return 1/Math.sqrt(re*re+im*im); }
function magLP(f, f0, q){ const r=f/f0, re=1-r*r, im=r/q; return 1/Math.sqrt(re*re+im*im); }
function magPeak(f, f0, q, dB){ const A=Math.pow(10,dB/40), r=f/f0, u=(1-r*r)*(1-r*r); return Math.sqrt((u+(r*A/q)*(r*A/q))/(u+(r/(A*q))*(r/(A*q)))); }
function cabCurve(c, f){
  let m=magHP(f, c.hp[0], c.hp[1]);
  for(let i=0;i<c.lp[1];i++) m*=magLP(f, c.lp[0]*(1+0.18*i), 0.72);
  c.peaks.forEach(p=>{ m*=magPeak(f, p[0], p[1], p[2]); });
  m*=magLP(f, Math.min(16000, c.lp[0]*2.4), 0.6);
  return m;
}
function ripples(c){ const r=seeded(c.seed), out=[]; for(let i=0;i<7;i++) out.push([1400*Math.pow(4.6, r()), 5+5*r(), (r()-0.5)*4.4]); return out; }
const IRS=new WeakMap();
function cabIR(ctx, id){
  const c=CABS[id]; if(!c || !c.hp) return null;
  let per=IRS.get(ctx); if(!per){ per={}; IRS.set(ctx, per); } if(per[id]) return per[id];
  const sr=ctx.sampleRate, N=4096, re=new Float64Array(N), im=new Float64Array(N), rip=ripples(c);
  const cc=Object.assign({}, c, {peaks:c.peaks.concat(rip)});
  for(let k=0;k<=N/2;k++){ const f=Math.max(1, k*sr/N); re[k]=Math.log(Math.max(1e-5, cabCurve(cc, f))); }
  for(let k=N/2+1;k<N;k++) re[k]=re[N-k];
  fft(re, im, true);                                         /* the real cepstrum */
  for(let n=1;n<N/2;n++){ re[n]*=2; im[n]*=2; } for(let n=N/2+1;n<N;n++){ re[n]=0; im[n]=0; }
  fft(re, im, false);
  for(let k=0;k<N;k++){ const e=Math.exp(re[k]), ph=im[k]; re[k]=e*Math.cos(ph); im[k]=e*Math.sin(ph); }
  fft(re, im, true);
  const L=Math.min(N, Math.round(sr*0.024)), fade=Math.round(L*0.3), ir=new Float32Array(L);
  for(let n=0;n<L;n++){ let w=1; if(n>L-fade) w=0.5+0.5*Math.cos(Math.PI*(n-(L-fade))/fade); ir[n]=re[n]*w; }
  /* level: the curve's own gain between 300 Hz and 3 kHz, on average, is 1 */
  let s=0, cnt=0; for(let f=300; f<=3000; f*=1.06){ s+=cabCurve(cc,f)*cabCurve(cc,f); cnt++; }
  const g=1/Math.sqrt(s/cnt); for(let n=0;n<L;n++) ir[n]*=g;
  const buf=ctx.createBuffer(1, L, sr); buf.getChannelData(0).set(ir);
  per[id]=buf; return buf;
}

/* ══ the pedals ════════════════════════════════════════════════════════════ */
const PEDALS=[
  {id:"gate", en:"Noise gate", es:"Puerta de ruido", col:["#2b2f36","#f2f2f2"],
   d:{en:"Stops the sound the moment you stop. For tight metal stops.",es:"Corta el sonido en cuanto paras. Para paradas secas de metal."},
   knobs:[["thr",{en:"Threshold",es:"Umbral"},4],["rel",{en:"Release",es:"Cierre"},3]]},
  {id:"comp", en:"Compressor", es:"Compresor", col:["#2f6db5","#ffffff"],
   d:{en:"Evens out soft and loud notes. Notes ring longer.",es:"Iguala las notas suaves y fuertes. Las notas suenan más tiempo."},
   knobs:[["sus",{en:"Sustain",es:"Sostén"},5],["att",{en:"Attack",es:"Ataque"},4],["lvl",{en:"Level",es:"Nivel"},5]]},
  {id:"wah", en:"Wah", es:"Wah", col:["#1f1f1f","#f5f5f5"], modes:["touch","fixed"],
   d:{en:"A talking, sweeping tone. Touch opens it when you play harder.",es:"Un tono que habla y barre. Toque lo abre cuando tocas más fuerte."},
   knobs:[["pos",{en:"Position",es:"Posición"},5],["sens",{en:"Sensitivity",es:"Sensibilidad"},5],["q",{en:"Peak",es:"Pico"},5]]},
  {id:"oct", en:"Octave down", es:"Octava abajo", col:["#7a7f87","#111111"],
   d:{en:"Adds a note an octave lower. Best on one note at a time.",es:"Añade una nota una octava más grave. Mejor con una nota a la vez."},
   knobs:[["sub",{en:"Low note",es:"Nota grave"},6],["dry",{en:"Your note",es:"Tu nota"},7]]},
  {id:"od", en:"Overdrive", es:"Overdrive", col:["#2f7a40","#ffffff"],
   d:{en:"A warm push. With Drive low it makes the amp bite harder.",es:"Un empuje cálido. Con poco Drive hace que el amplificador muerda más."},
   knobs:[["drive",{en:"Drive",es:"Drive"},4],["tone",{en:"Tone",es:"Tono"},5],["lvl",{en:"Level",es:"Nivel"},6]]},
  {id:"ds", en:"Distortion", es:"Distorsión", col:["#d7742a","#111111"],
   d:{en:"Hard, buzzing grit, for rock and punk.",es:"Aspereza dura y zumbante, para rock y punk."},
   knobs:[["dist",{en:"Distortion",es:"Distorsión"},6],["tone",{en:"Tone",es:"Tono"},5],["lvl",{en:"Level",es:"Nivel"},5]]},
  {id:"fz", en:"Fuzz", es:"Fuzz", col:["#6d3fa0","#ffffff"],
   d:{en:"A thick, woolly wall of sound.",es:"Un muro de sonido grueso y lanudo."},
   knobs:[["sus",{en:"Sustain",es:"Sostén"},7],["tone",{en:"Tone",es:"Tono"},5],["lvl",{en:"Level",es:"Nivel"},5]]},
  {id:"chorus", en:"Chorus", es:"Chorus", col:["#7fc6d9","#111111"],
   d:{en:"Shimmer, as if two guitars played together.",es:"Brillo, como si tocaran dos guitarras juntas."},
   knobs:[["rate",{en:"Speed",es:"Velocidad"},3],["depth",{en:"Depth",es:"Profundidad"},5],["mix",{en:"Mix",es:"Mezcla"},5]]},
  {id:"phaser", en:"Phaser", es:"Phaser", col:["#e2a531","#111111"],
   d:{en:"A slow, watery swirl.",es:"Un remolino lento y acuoso."},
   knobs:[["rate",{en:"Speed",es:"Velocidad"},3],["depth",{en:"Depth",es:"Profundidad"},6],["mix",{en:"Mix",es:"Mezcla"},5]]},
  {id:"flanger", en:"Flanger", es:"Flanger", col:["#4a5d78","#ffffff"],
   d:{en:"A jet-plane whoosh.",es:"Un silbido de avión a reacción."},
   knobs:[["rate",{en:"Speed",es:"Velocidad"},2],["depth",{en:"Depth",es:"Profundidad"},6],["fb",{en:"Ring",es:"Resonancia"},5],["mix",{en:"Mix",es:"Mezcla"},5]]},
  {id:"trem", en:"Tremolo", es:"Trémolo", col:["#b23b3b","#ffffff"], modes:["sine","square"],
   d:{en:"The volume pulses up and down.",es:"El volumen sube y baja en pulsos."},
   knobs:[["rate",{en:"Speed",es:"Velocidad"},5],["depth",{en:"Depth",es:"Profundidad"},6]]},
  {id:"delay", en:"Delay", es:"Delay", col:["#cfd5da","#111111"],
   d:{en:"Echoes of what you play.",es:"Ecos de lo que tocas."},
   knobs:[["time",{en:"Time",es:"Tiempo"},4],["fb",{en:"Repeats",es:"Repeticiones"},4],["mix",{en:"Mix",es:"Mezcla"},4],["tone",{en:"Tone",es:"Tono"},5]]},
  {id:"reverb", en:"Reverb", es:"Reverb", col:["#244a66","#ffffff"], types:["spring","room","hall","plate"],
   d:{en:"The sound of a room, a hall or a spring.",es:"El sonido de una sala, un auditorio o un muelle."},
   knobs:[["decay",{en:"Decay",es:"Duración"},5],["mix",{en:"Mix",es:"Mezcla"},4],["tone",{en:"Tone",es:"Tono"},6]]}
];
const PED=Object.fromEntries(PEDALS.map(p=>[p.id,p]));
const PRE=["gate","comp","wah","oct","od","ds","fz"];          /* the pedals before the amp; the rest sit after it */
const EQ_F=[31,63,125,250,500,1000,2000,4000,8000,16000];
const AMP_KNOBS=["gain","bass","mid","treble","presence","depth","master"];
function delayMs(v){ return Math.round(40*Math.pow(30, n10(v))); }        /* 40 ms to 1.2 s */

/* ══ a state: what the knobs say ══ */
function defaults(kind){
  const fx={}; PEDALS.forEach(p=>{ const o={on:false}; p.knobs.forEach(k=>o[k[0]]=k[2]); if(p.modes) o.mode=p.modes[0]; if(p.types) o.type=p.types[0]; fx[p.id]=o; });
  return {model:kind==="bass"?"btube":"clean", cab:kind==="bass"?"b810":"open212",
          k:{gain:4, bass:5, mid:5, treble:5, presence:5, depth:5, master:5, blend:6}, bright:false, tight:false,
          eq:{on:false, db:EQ_F.map(()=>0)}, fx:fx};
}
/* fill in whatever a saved or preset state leaves out, so an old save never breaks the rig */
function normalize(st, kind){
  const d=defaults(kind), s=st&&typeof st==="object"?st:{};
  const o={model:MODELS[s.model]?s.model:d.model, cab:CABS[s.cab]?s.cab:d.cab, k:Object.assign({}, d.k, s.k||{}),
           bright:!!s.bright, tight:!!s.tight, eq:{on:!!(s.eq&&s.eq.on), db:d.eq.db.map((x,i)=>clamp(+((s.eq&&s.eq.db&&s.eq.db[i])||0),-12,12))}, fx:{}};
  PEDALS.forEach(p=>{ o.fx[p.id]=Object.assign({}, d.fx[p.id], (s.fx&&s.fx[p.id])||{}); o.fx[p.id].on=!!o.fx[p.id].on; });
  if(s.pickup) o.pickup=s.pickup;
  return o;
}
/* the numbers the worklet runs */
function coreParams(st, kind){
  const fx=st.fx, M=MODELS[st.model]||MODELS.none, bass=kind==="bass", P={};
  const g=fx.gate; P.gate={on:g.on, thr:dbl(-70+5*clamp(+g.thr,0,10)), rel:0.02+0.03*clamp(+g.rel,0,10)};
  const c=fx.comp, cthr=-8-3.2*clamp(+c.sus,0,10), crat=2+0.6*clamp(+c.sus,0,10);
  P.comp={on:c.on, thr:cthr, ratio:crat, att:0.0005+0.0035*clamp(+c.att,0,10), rel:0.18, knee:6, makeup:(-cthr-12)*(1-1/crat)*0.6+(n10(c.lvl)-0.5)*12};
  const w=fx.wah; P.wah={on:w.on, mode:w.mode==="fixed"?"fixed":"touch", pos:n10(w.pos), sens:2+1.6*clamp(+w.sens,0,10), q:2+0.8*clamp(+w.q,0,10), f0:bass?180:350, f1:bass?1400:2300, mix:1};
  const o=fx.oct; P.oct={on:o.on, sub:n10(o.sub)*1.5, dry:n10(o.dry), f:bass?170:260};
  const od=fx.od; P.od={on:od.on, gain:3+110*lg(n10(od.drive)), tone:700*Math.pow(8.5, n10(od.tone)), level:0.2+1.6*n10(od.lvl)};
  const ds=fx.ds; P.ds={on:ds.on, gain:2+900*lg(n10(ds.dist)), filter:600*Math.pow(28, n10(ds.tone)), level:0.12+1.2*n10(ds.lvl)};
  const fz=fx.fz; P.fz={on:fz.on, gain:2+70*lg(n10(fz.sus)), gain2:8, tone:n10(fz.tone), level:0.15+1.4*n10(fz.lvl)};
  const k=st.k, sw={bright:st.bright, tight:st.tight};
  if(M.make){ P.amp=M.make(k, sw); P.amp.on=true;
    /* the tone stack's three pots: treble and middle turn evenly, bass is an audio-taper pot */
    if(P.amp.stack){ P.amp.t=n10(k.treble); P.amp.m=n10(k.mid); P.amp.l=lg(n10(k.bass)); } } else P.amp={on:false};
  if(st.pickup) P.amp.pick=st.pickup;
  /* loudness: the model's own level, evened out as Gain turns, and Master's share (±4 dB: the page has its own Volume) */
  const gi=n10(k.gain)*4, i0=Math.min(3, Math.floor(gi)), fr=gi-i0, lv=M.lvl||[0,0,0,0,0];
  const lvlDb=-(lv[i0]*(1-fr)+lv[i0+1]*fr)+(n10(k.master)-0.5)*8;
  P.level=(M.out||1)*dbl(M.make?lvlDb:0);
  return P;
}

/* ══ the rig, in Web Audio ═════════════════════════════════════════════════ */
const URL_DEFAULT="/aog-amp-worklet.js";
const LOADS=new WeakMap();
function load(ctx){
  if(LOADS.has(ctx)) return LOADS.get(ctx);
  const p=(async()=>{ try{ if(!ctx.audioWorklet || typeof AudioWorkletNode==="undefined") return false; await ctx.audioWorklet.addModule(AOGAmp.workletURL||URL_DEFAULT); ctx.__aogAmpOk=true; return true; }catch(e){ return false; } })();
  LOADS.set(ctx, p); return p;
}
function gainNode(c, v){ const g=c.createGain(); g.gain.value=v; return g; }
function biq(c, type, f, q, dB){ const b=c.createBiquadFilter(); b.type=type; b.frequency.value=f; b.Q.value=q||0.707; if(dB!=null) b.gain.value=dB; return b; }
/* the fallback core, for a browser without AudioWorklet: the same plan with Web Audio's own wave shapers */
function shaperCurve(kind){ const n=2048, a=new Float32Array(n); for(let i=0;i<n;i++){ const x=(i/(n-1)*2-1)*4; a[i]=kind==="hard" ? x/Math.sqrt(Math.sqrt(1+x*x*x*x)) : x/Math.sqrt(1+x*x); } return a; }
function fallbackCore(c){
  const inp=gainNode(c,1), out=gainNode(c,1), pre=gainNode(c,1), lo=biq(c,"lowshelf",120,0.7,0), mid=biq(c,"peaking",650,0.8,0), hi=biq(c,"highshelf",2800,0.7,0);
  const hp=biq(c,"highpass",80,0.7), sh1=c.createWaveShaper(), g2=gainNode(c,1), sh2=c.createWaveShaper(), post=gainNode(c,1), bypass=gainNode(c,0), wet=gainNode(c,1);
  sh1.curve=shaperCurve("soft"); sh2.curve=shaperCurve("soft"); try{ sh1.oversample="4x"; sh2.oversample="4x"; }catch(e){}
  inp.connect(hp); hp.connect(pre); pre.connect(sh1); sh1.connect(lo); lo.connect(mid); mid.connect(hi); hi.connect(g2); g2.connect(sh2); sh2.connect(post); post.connect(wet); wet.connect(out);
  inp.connect(bypass); bypass.connect(out);
  return {input:inp, output:out, set(P){ const a=P.amp||{}, on=!!a.on;
    wet.gain.value=on?1:0; bypass.gain.value=on?0:1;
    if(!on) return;
    const gsum=(a.stages||[]).reduce((m,s,i)=>m*(i===0?s.g:Math.sqrt(s.g)),1)*(P.od&&P.od.on?P.od.gain*0.1:1)*(P.ds&&P.ds.on?P.ds.gain*0.05:1)*(P.fz&&P.fz.on?P.fz.gain*0.2:1);
    pre.gain.value=Math.min(400, gsum)/4; hp.frequency.value=a.inHp||40;
    sh1.curve=shaperCurve((a.stages||[]).some(s=>s.hard)?"hard":"soft");
    const t=a.stack?a.t:0.5, m=a.stack?a.m:0.5, l=a.stack?a.l:0.5;
    lo.gain.value=a.bax?a.bax.low:(l-0.3)*20; mid.gain.value=a.bax?a.bax.mid:(m-0.5)*18-4; hi.gain.value=a.bax?a.bax.high:(t-0.5)*20;
    g2.gain.value=(a.power?a.power.drive:1)*1.5; post.gain.value=0.5*(P.level||1); }};
}
function create(c, opt){
  opt=opt||{}; const kind=opt.kind==="bass"?"bass":"guitar";
  const rig={kind:kind, c:c, state:normalize(opt.state, kind)};
  rig.input=gainNode(c,1); rig.output=gainNode(c,1);
  rig.coreOut=gainNode(c,1);
  /* the core: the worklet when it is in, the fallback until then (a live page: the swap happens once, at the start) */
  function useWorklet(){
    try{
      const n=new AudioWorkletNode(c,"aog-amp",{numberOfInputs:1, numberOfOutputs:1, outputChannelCount:[1], channelCount:1, channelCountMode:"explicit", channelInterpretation:"speakers",
        processorOptions:{p:coreParams(rig.state, kind)}});
      if(rig.core){ try{ rig.input.disconnect(rig.core.input||rig.core); }catch(e){} try{ (rig.core.output||rig.core).disconnect(); }catch(e){} }
      rig.core=n; rig.worklet=true; rig.input.connect(n); n.connect(rig.coreOut); return true;
    }catch(e){ return false; }
  }
  if(!(c.__aogAmpOk && useWorklet())){
    rig.core=fallbackCore(c); rig.worklet=false; rig.input.connect(rig.core.input); rig.core.output.connect(rig.coreOut); rig.core.set(coreParams(rig.state, kind));
    load(c).then(ok=>{ if(ok && !rig.worklet) useWorklet(); });
  }
  /* the cabinet, the EQ and the effects after the amp: built once, wired in when on */
  const cab=c.createConvolver(); cab.normalize=false;
  const eq=EQ_F.map((f,i)=>biq(c, i===0?"lowshelf":i===EQ_F.length-1?"highshelf":"peaking", f, 1.4, 0));
  for(let i=0;i<eq.length-1;i++) eq[i].connect(eq[i+1]);
  const FX={};
  FX.chorus=(()=>{ const i=gainNode(c,1), o=gainNode(c,1), dry=gainNode(c,1), wet=gainNode(c,0.7), m=c.createChannelMerger(2), dl=c.createDelay(0.05), dr=c.createDelay(0.05);
    const lfo=c.createOscillator(), lfo2=c.createOscillator(), dg=gainNode(c,0.002), dg2=gainNode(c,0.002); lfo.type="sine";
    try{ lfo2.setPeriodicWave(c.createPeriodicWave(new Float32Array([0,1]), new Float32Array([0,0]))); }catch(e){ lfo2.type="triangle"; }
    dl.delayTime.value=0.008; dr.delayTime.value=0.0095; lfo.connect(dg); dg.connect(dl.delayTime); lfo2.connect(dg2); dg2.connect(dr.delayTime);
    i.connect(dry); dry.connect(o); i.connect(dl); i.connect(dr); dl.connect(wet); dr.connect(m,0,1); wet.connect(m,0,0); const wr=gainNode(c,0.7); dr.disconnect(); dr.connect(wr); wr.connect(m,0,1); m.connect(o);
    lfo.start(); lfo2.start();
    return {in:i, out:o, set(p){ const r=0.1*Math.pow(30,n10(p.rate)), d=0.0005+0.0045*n10(p.depth), w=0.9*n10(p.mix);
      lfo.frequency.value=r; lfo2.frequency.value=r; dg.gain.value=d; dg2.gain.value=d; wet.gain.value=w; wr.gain.value=w; dry.gain.value=1-0.3*n10(p.mix); }}; })();
  FX.phaser=(()=>{ const i=gainNode(c,1), o=gainNode(c,1), dry=gainNode(c,1), wet=gainNode(c,0.7), lfo=c.createOscillator(), dg=gainNode(c,500), aps=[];
    let prev=i; for(let k=0;k<6;k++){ const ap=biq(c,"allpass",700,0.55); dg.connect(ap.frequency); prev.connect(ap); prev=ap; aps.push(ap); }
    prev.connect(wet); wet.connect(o); i.connect(dry); dry.connect(o); lfo.connect(dg); lfo.start();
    return {in:i, out:o, set(p){ const r=0.05*Math.pow(60,n10(p.rate)), d=n10(p.depth); lfo.frequency.value=r; aps.forEach(a=>a.frequency.value=380+620*d); dg.gain.value=300+520*d;
      const w=n10(p.mix); wet.gain.value=w; dry.gain.value=1-0.35*w; }}; })();
  FX.flanger=(()=>{ const i=gainNode(c,1), o=gainNode(c,1), dry=gainNode(c,1), wet=gainNode(c,0.7), dl=c.createDelay(0.03), fb=gainNode(c,0.5), lfo=c.createOscillator(), dg=gainNode(c,0.001);
    dl.delayTime.value=0.003; lfo.connect(dg); dg.connect(dl.delayTime); i.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(o); i.connect(dry); dry.connect(o); lfo.start();
    return {in:i, out:o, set(p){ const r=0.05*Math.pow(40,n10(p.rate)), d=0.0002+0.0026*n10(p.depth); lfo.frequency.value=r; dl.delayTime.value=0.0006+d; dg.gain.value=d*0.9;
      fb.gain.value=0.85*n10(p.fb); const w=n10(p.mix); wet.gain.value=w*0.85; dry.gain.value=1-0.3*w; }}; })();
  FX.trem=(()=>{ const i=gainNode(c,1), o=gainNode(c,1), vca=gainNode(c,1), lfo=c.createOscillator(), sm=biq(c,"lowpass",40,0.7), dg=gainNode(c,0.3);
    i.connect(vca); vca.connect(o); lfo.connect(sm); sm.connect(dg); dg.connect(vca.gain); lfo.start();
    return {in:i, out:o, set(p){ const r=1+11*n10(p.rate)*n10(p.rate)+0.0, d=n10(p.depth); lfo.type=p.mode==="square"?"square":"sine"; lfo.frequency.value=r; dg.gain.value=d*0.5; vca.gain.value=1-d*0.5; }}; })();
  FX.delay=(()=>{ const i=gainNode(c,1), o=gainNode(c,1), dry=gainNode(c,1), wet=gainNode(c,0.4), dl=c.createDelay(2.0), fb=gainNode(c,0.35), tone=biq(c,"lowpass",4000,0.6), hp=biq(c,"highpass",120,0.6);
    i.connect(dry); dry.connect(o); i.connect(dl); dl.connect(tone); tone.connect(hp); hp.connect(fb); fb.connect(dl); hp.connect(wet); wet.connect(o);
    return {in:i, out:o, set(p){ const t=delayMs(p.time)/1000; try{ dl.delayTime.setTargetAtTime(t, c.currentTime, 0.03); }catch(e){ dl.delayTime.value=t; }
      fb.gain.value=0.85*n10(p.fb); wet.gain.value=0.75*n10(p.mix); tone.frequency.value=1500*Math.pow(6,n10(p.tone)); }}; })();
  FX.reverb=(()=>{ const i=gainNode(c,1), o=gainNode(c,1), dry=gainNode(c,1), wet=gainNode(c,0.3), cv=c.createConvolver(), tone=biq(c,"lowpass",8000,0.6); let key="";
    i.connect(dry); dry.connect(o); i.connect(cv); cv.connect(tone); tone.connect(wet); wet.connect(o);
    return {in:i, out:o, set(p){ const k=(p.type||"spring")+":"+Math.round(+p.decay*2)/2; if(k!==key){ key=k; cv.buffer=reverbIR(c, p.type||"spring", n10(p.decay)); }
      wet.gain.value=0.9*n10(p.mix); dry.gain.value=1-0.25*n10(p.mix); tone.frequency.value=2000*Math.pow(6,n10(p.tone)); }}; })();
  const ORDER=["chorus","phaser","flanger","trem","delay","reverb"];
  let wiring="";
  function rewire(st){
    const on=ORDER.filter(id=>st.fx[id].on), useCab=st.cab!=="off" && CABS[st.cab] && CABS[st.cab].hp, key=[st.cab, st.eq.on?1:0].concat(on).join(",");
    if(key===wiring) return; wiring=key;
    [rig.coreOut, cab, eq[eq.length-1]].concat(ORDER.map(id=>FX[id].out)).forEach(n=>{ try{ n.disconnect(); }catch(e){} });
    let tail=rig.coreOut;
    if(useCab){ cab.buffer=cabIR(c, st.cab); tail.connect(cab); tail=cab; }
    if(st.eq.on){ tail.connect(eq[0]); tail=eq[eq.length-1]; }
    on.forEach(id=>{ tail.connect(FX[id].in); tail=FX[id].out; });
    tail.connect(rig.output);
  }
  rig.set=function(st){
    rig.state=normalize(st, kind);
    const s=rig.state, P=coreParams(s, kind);
    if(rig.worklet) rig.core.port.postMessage({p:P}); else rig.core.set(P);
    s.eq.db.forEach((d,i)=>{ eq[i].gain.value=d; });
    ORDER.forEach(id=>{ if(s.fx[id].on) FX[id].set(s.fx[id]); });
    rewire(s);
  };
  rig.set(rig.state);
  return rig;
}
/* reverbs: a spring (drips, a little boing), a room, a hall, a plate; stereo noise that dies away, darker as it goes */
const VERBS=new WeakMap();
function reverbIR(c, type, d){
  let per=VERBS.get(c); if(!per){ per={}; VERBS.set(c, per); } const key=type+":"+d.toFixed(2); if(per[key]) return per[key];
  const sr=c.sampleRate, T=type==="hall"?1.4+3.2*d : type==="plate"?0.9+2.2*d : type==="room"?0.35+1.1*d : 1.2+2.4*d;
  const pre=type==="hall"?0.024:type==="room"?0.006:type==="plate"?0.002:0.012, len=Math.ceil((pre+T*1.1)*sr), ir=c.createBuffer(2, len, sr);
  for(let ch=0; ch<2; ch++){
    const a=ir.getChannelData(ch), r=seeded(type.length*7919+ch*104729+Math.round(d*100)), p0=Math.floor(pre*sr); let lp=0, lp2=0;
    const bright=type==="plate"?0.75:type==="spring"?0.55:type==="hall"?0.45:0.4;
    for(let i=p0;i<len;i++){ const t=(i-p0)/sr, k=bright*Math.exp(-t/(T*0.6)); lp+=((r()*2-1)-lp)*Math.max(0.04,k); lp2+=(lp-lp2)*Math.max(0.05,k*1.2);
      let v=lp2*Math.exp(-6.9*t/T);
      if(type==="spring"){ const per2=0.033+0.004*ch; const ph=(t%per2)/per2; v*=0.55+0.45*Math.exp(-ph*9); }
      a[i]=v; }
    if(type==="room") for(let e=0;e<6;e++){ const at=Math.floor((0.004+0.003*e+0.002*r())*sr)+p0; if(at<len) a[at]+=(r()-0.5)*0.7*Math.exp(-e*0.3); }
  }
  /* even level whatever the length */
  let s=0; for(let ch=0;ch<2;ch++){ const a=ir.getChannelData(ch); for(let i=0;i<len;i++) s+=a[i]*a[i]; }
  const g=0.6/Math.sqrt(s/2+1e-9); for(let ch=0;ch<2;ch++){ const a=ir.getChannelData(ch); for(let i=0;i<len;i++) a[i]*=g; }
  per[key]=ir; return ir;
}

/* ══ the panel ═════════════════════════════════════════════════════════════
   The amp head (its two menus, seven knobs, two switches), the pedalboard (each pedal shows its knobs once it is on) and
   the EQ. Every knob is a labelled slider a finger, a mouse and a keyboard can all use; the round dial above it is only a
   picture of where it sits. Nothing moves on its own. */
const CSS=`
.aogamp{--aa-gap:.6rem;display:grid;gap:.9rem}
.aogamp .aa-head{background:#1d1b19;color:#f3ead7;border-radius:14px;padding:.9rem .9rem 1rem;border:3px solid #3a352f;box-shadow:inset 0 0 0 2px #0e0d0c}
.aogamp .aa-top{display:flex;flex-wrap:wrap;gap:.6rem 1rem;align-items:flex-end;margin-bottom:.8rem}
.aogamp .aa-sel{display:grid;gap:.25rem;flex:1 1 15rem;min-width:0}
.aogamp .aa-sel span{font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#f3ead7}
.aogamp select{font-size:16px;min-height:44px;border-radius:10px;border:1px solid #6b6255;background:#2a2622;color:#f3ead7;padding:0 .6rem;max-width:100%}
.aogamp .aa-plate{background:#d8b45a;color:#1b1814;border-radius:10px;padding:.7rem .5rem .5rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(5.6rem,1fr));gap:.4rem .3rem}
.aogamp .aa-knob{display:grid;justify-items:center;gap:.15rem;text-align:center;min-width:0}
.aogamp .aa-dial{width:44px;height:44px;border-radius:50%;background:radial-gradient(circle at 50% 40%,#3b3631,#141210 70%);border:2px solid #0d0c0b;position:relative}
.aogamp .aa-dial::after{content:"";position:absolute;left:50%;top:4px;width:3px;height:16px;margin-left:-1.5px;background:#f3ead7;border-radius:2px;transform-origin:50% 18px;transform:rotate(var(--r,0deg))}
.aogamp .aa-kl{font-size:.82rem;font-weight:700;line-height:1.15}
.aogamp .aa-knob input[type=range]{width:100%;max-width:6.5rem;font-size:16px;margin:0;accent-color:currentColor;min-height:28px}
.aogamp .aa-knob output{font-size:.82rem;font-variant-numeric:tabular-nums;font-weight:600}
.aogamp .aa-sw{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.7rem;align-items:center}
.aogamp .aa-btn{min-height:44px;border-radius:999px;border:2px solid #6b6255;background:#2a2622;color:#f3ead7;font:inherit;font-weight:700;padding:0 1rem;cursor:pointer}
.aogamp .aa-btn[aria-pressed="true"]{background:#f3ead7;color:#1b1814;border-color:#f3ead7}
.aogamp .aa-help{margin:.6rem 0 0;font-size:.9rem;color:#e9dfc8;max-width:62ch}
.aogamp .aa-board{background:#2b2926;border-radius:14px;padding:.8rem;display:grid;gap:.7rem}
.aogamp .aa-board > p{margin:0;color:#f3ead7;font-size:.9rem}
.aogamp .aa-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(15rem,1fr));gap:.7rem;align-items:start}
.aogamp .aa-rowh{margin:.2rem 0 0;color:#f3ead7;font-size:.82rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.aogamp .aa-ped{background:var(--pc);color:var(--pi);border-radius:12px;padding:.7rem .7rem .6rem;border:2px solid rgba(0,0,0,.35);display:grid;gap:.45rem;align-content:start}
.aogamp .aa-pt{display:flex;justify-content:space-between;gap:.5rem;align-items:flex-start}
.aogamp .aa-pt b{font-size:1.02rem;line-height:1.2}
.aogamp .aa-pd{font-size:.86rem;line-height:1.35;margin:0;color:var(--pi)}
.aogamp .aa-fs{min-height:44px;min-width:4.6rem;border-radius:10px;border:2px solid var(--pi);background:transparent;color:var(--pi);font:inherit;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;padding:0 .7rem}
.aogamp .aa-fs i{width:10px;height:10px;border-radius:50%;border:2px solid var(--pi);display:inline-block}
.aogamp .aa-fs[aria-pressed="true"] i{background:#e3342f;border-color:#e3342f}
.aogamp .aa-pk{display:grid;grid-template-columns:repeat(auto-fill,minmax(4.8rem,1fr));gap:.3rem}
.aogamp .aa-pk[hidden]{display:none}
.aogamp .aa-ped .aa-dial{background:radial-gradient(circle at 50% 40%,#f5f2ec,#cfc9bf 70%);border-color:rgba(0,0,0,.45)}
.aogamp .aa-ped .aa-dial::after{background:#141210}
.aogamp .aa-modes{display:flex;gap:.4rem;flex-wrap:wrap}
.aogamp .aa-modes button{min-height:40px;border-radius:999px;border:2px solid var(--pi);background:transparent;color:var(--pi);font:inherit;font-weight:700;padding:0 .8rem;cursor:pointer}
.aogamp .aa-modes button[aria-pressed="true"]{background:var(--pi);color:var(--pc)}
.aogamp .aa-ped select{background:rgba(0,0,0,.25);color:var(--pi);border-color:var(--pi)}
.aogamp .aa-eq{background:#24303a;color:#eef3f6;border-radius:14px;padding:.8rem}
.aogamp .aa-eqh{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;justify-content:space-between;margin-bottom:.5rem}
.aogamp .aa-eqh b{font-size:1rem}
.aogamp .aa-eq .aa-btn{background:#33414d;color:#eef3f6;border-color:#6d8293}
.aogamp .aa-eq .aa-btn[aria-pressed="true"]{background:#eef3f6;color:#1b252e;border-color:#eef3f6}
.aogamp .aa-bands{display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:.15rem;align-items:end;max-width:40rem}
.aogamp .aa-band{display:flex;flex-direction:column;align-items:center;gap:.3rem;min-width:0}
.aogamp .aa-band span{order:3;font-size:.8rem;font-weight:700}
.aogamp .aa-band input{order:2;writing-mode:vertical-lr;direction:rtl;width:34px;height:150px;font-size:16px;margin:0;accent-color:#9fd1ef}
.aogamp .aa-band output{order:1;font-size:.74rem;font-variant-numeric:tabular-nums;white-space:nowrap}
.aogamp.aa-flat .aa-bands{grid-template-columns:repeat(auto-fill,minmax(15rem,1fr));gap:.2rem .9rem;max-width:none}
.aogamp.aa-flat .aa-band{display:grid;grid-template-columns:3.2rem 1fr 3.8rem;align-items:center;gap:.4rem}
.aogamp.aa-flat .aa-band span{order:0;font-size:.86rem}
.aogamp.aa-flat .aa-band input{order:0;writing-mode:horizontal-tb;direction:ltr;width:100%;height:auto;min-height:32px}
.aogamp.aa-flat .aa-band output{order:0;font-size:.82rem;text-align:right}
.aogamp .aa-bands[data-off="1"]{opacity:.62}
.aogamp .aa-foot{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center}
.aogamp .aa-foot .aa-btn{background:var(--card,#fffcf7);color:var(--ink,#1a232c);border-color:var(--line,#ddd8cc)}
.aogamp .aa-note{font-size:.9rem;color:var(--muted,#5c6670);margin:0}
.aogamp :focus-visible{outline:3px solid #ffbf47;outline-offset:2px}
@media (min-width:760px){ .aogamp .aa-plate{grid-template-columns:repeat(7,1fr)} }
`;
/* can this browser stand a slider up (writing-mode on a range, Safari 17.4 and later, every current browser)? */
let VERT=null;
function vertOK(){ if(VERT!=null) return VERT; try{ const i=document.createElement("input"); i.type="range"; i.style.cssText="writing-mode:vertical-lr;position:absolute;left:-9999px;top:0;width:auto;height:auto"; document.body.appendChild(i); const r=i.getBoundingClientRect(); VERT=r.height>r.width; i.remove(); }catch(e){ VERT=false; } return VERT; }
function word(k, lang){ const w=WORDS[k]; return w ? (w[lang]||w.en) : k; }
function esc(s){ return String(s).replace(/[&<>"]/g, ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch])); }
function dialDeg(v){ return Math.round(-135+27*clamp(+v,0,10)); }
function knobHtml(scope, id, label, v, extra){
  const val=(+v).toFixed(1);
  return `<div class="aa-knob"><span class="aa-dial" aria-hidden="true" style="--r:${dialDeg(v)}deg"></span>
    <label><span class="aa-kl">${esc(label)}</span><br><input type="range" min="0" max="10" step="0.1" value="${val}" data-scope="${scope}" data-k="${id}"${extra||""}></label>
    <output>${esc(extra&&/data-ms/.test(extra)?delayMs(v)+" ms":val)}</output></div>`;
}
function ui(host, opt){
  if(!document.getElementById("aogamp-css")){ const st=document.createElement("style"); st.id="aogamp-css"; st.textContent=CSS; document.head.appendChild(st); }
  const kind=opt.kind==="bass"?"bass":"guitar";
  const L=()=>(opt.lang&&opt.lang())==="es"?"es":"en";
  let note="";
  function paint(){
    const lang=L(), st=normalize(opt.get(), kind), M=MODELS[st.model];
    const models=Object.keys(MODELS).filter(id=>MODELS[id].kind===kind||MODELS[id].kind==="both");
    const cabs=Object.keys(CABS).filter(id=>CABS[id].kind===kind||CABS[id].kind==="both");
    const knobs=AMP_KNOBS.concat(st.model==="bdrive"?["blend"]:[]);
    const amped=st.model!=="none";
    const pedals=PEDALS;
    const pedal=p=>{ const f=st.fx[p.id];
          const modes=p.modes?`<div class="aa-modes" role="group" aria-label="${esc(word("mode",lang))}">${p.modes.map(m=>`<button type="button" data-ped="${p.id}" data-mode="${m}" aria-pressed="${f.mode===m}">${word(m,lang)}</button>`).join("")}</div>`:"";
          const types=p.types?`<label class="aa-sel"><span style="color:var(--pi)">${word("type",lang)}</span><select data-ped="${p.id}" data-type="1">${p.types.map(t=>`<option value="${t}"${f.type===t?" selected":""}>${word(t,lang)}</option>`).join("")}</select></label>`:"";
          return `<div class="aa-ped" data-p="${p.id}" style="--pc:${p.col[0]};--pi:${p.col[1]}">
            <div class="aa-pt"><b>${esc(p[lang])}</b><button type="button" class="aa-fs" data-fs="${p.id}" aria-pressed="${f.on}" aria-label="${esc(p[lang]+" · "+word(f.on?"on":"off",lang))}"><i aria-hidden="true"></i>${word(f.on?"on":"off",lang)}</button></div>
            <p class="aa-pd">${esc(p.d[lang])}</p>
            <div class="aa-pk"${f.on?"":" hidden"}>${modes}${types}${p.knobs.map(k=>knobHtml("ped:"+p.id, k[0], k[1][lang], f[k[0]], p.id==="delay"&&k[0]==="time"?' data-ms="1"':"")).join("")}</div>
          </div>`; };
    const pre=pedals.filter(p=>PRE.indexOf(p.id)>=0), post=pedals.filter(p=>PRE.indexOf(p.id)<0);
    host.innerHTML=`<div class="aogamp${vertOK()?"":" aa-flat"}" data-kind="${kind}">
      <div class="aa-head">
        <div class="aa-top">
          <label class="aa-sel"><span>${word("amp",lang)}</span><select data-aa="model">${models.map(id=>`<option value="${id}"${id===st.model?" selected":""}>${esc(MODELS[id][lang])}</option>`).join("")}</select></label>
          <label class="aa-sel"><span>${word("cab",lang)}</span><select data-aa="cab">${cabs.map(id=>`<option value="${id}"${id===st.cab?" selected":""}>${esc(CABS[id][lang])}</option>`).join("")}</select></label>
        </div>
        ${amped?`<div class="aa-plate">${knobs.map(k=>knobHtml("amp", k, word(k,lang), st.k[k])).join("")}</div>
        <div class="aa-sw"><button type="button" class="aa-btn" data-sw="bright" aria-pressed="${st.bright}">${word("bright",lang)}</button><button type="button" class="aa-btn" data-sw="tight" aria-pressed="${st.tight}">${word("tight",lang)}</button></div>
        <p class="aa-help">${word("ampHelp",lang)} ${word("brightHelp",lang)}</p>`:""}
      </div>
      <div class="aa-board" role="group" aria-label="${esc(word("pedals",lang))}"><p>${word("pedalHelp",lang)}</p>
        <h3 class="aa-rowh">${word("before",lang)}</h3><div class="aa-row">${pre.map(pedal).join("")}</div>
        <h3 class="aa-rowh">${word("after",lang)}</h3><div class="aa-row">${post.map(pedal).join("")}</div>
      </div>
      <div class="aa-eq">
        <div class="aa-eqh"><b>${word("eq",lang)} · dB</b><span><button type="button" class="aa-btn" data-eq="on" aria-pressed="${st.eq.on}">${word("eqUse",lang)}</button> <button type="button" class="aa-btn" data-eq="flat">${word("flat",lang)}</button></span></div>
        <div class="aa-bands" data-off="${st.eq.on?0:1}">${EQ_F.map((f,i)=>`<label class="aa-band"><span>${f>=1000?(f/1000)+"k":f}</span><input type="range" min="-12" max="12" step="0.5" value="${st.eq.db[i]}" data-band="${i}" aria-label="${f>=1000?(f/1000)+" kHz":f+" Hz"}" aria-valuetext="${(st.eq.db[i]>0?"+":"")+st.eq.db[i]} dB"><output>${(st.eq.db[i]>0?"+":"")+st.eq.db[i]}</output></label>`).join("")}</div>
      </div>
      <div class="aa-foot"><button type="button" class="aa-btn" data-aa="back">${word("back",lang)}</button><p class="aa-note" aria-live="polite">${note?word(note,lang):word("kept",lang)}</p></div>
    </div>`;
    wire();
  }
  function change(fn, repaint){ const st=normalize(opt.get(), kind); fn(st); note=""; opt.set(st); if(repaint) paint(); }
  function wire(){
    host.querySelectorAll('select[data-aa="model"]').forEach(s=>s.onchange=()=>change(st=>{ st.model=s.value; const cab=MODELS[s.value].cab; if(cab) st.cab=cab; }, true));
    host.querySelectorAll('select[data-aa="cab"]').forEach(s=>s.onchange=()=>change(st=>{ st.cab=s.value; }, false));
    host.querySelectorAll("input[data-k]").forEach(inp=>{
      const show=()=>{ const kn=inp.closest(".aa-knob"); kn.querySelector(".aa-dial").style.setProperty("--r", dialDeg(inp.value)+"deg");
        kn.querySelector("output").textContent=inp.hasAttribute("data-ms")?delayMs(inp.value)+" ms":(+inp.value).toFixed(1); };
      inp.oninput=()=>{ show(); change(st=>{ const sc=inp.dataset.scope, k=inp.dataset.k, v=+inp.value; if(sc==="amp") st.k[k]=v; else st.fx[sc.slice(4)][k]=v; }, false); };
    });
    host.querySelectorAll("button[data-sw]").forEach(b=>b.onclick=()=>change(st=>{ st[b.dataset.sw]=!st[b.dataset.sw]; }, true));
    host.querySelectorAll("button[data-fs]").forEach(b=>b.onclick=()=>{ const id=b.dataset.fs; change(st=>{ st.fx[id].on=!st.fx[id].on; }, true);
      const again=host.querySelector('button[data-fs="'+id+'"]'); if(again) again.focus(); });
    host.querySelectorAll("button[data-mode]").forEach(b=>b.onclick=()=>change(st=>{ st.fx[b.dataset.ped].mode=b.dataset.mode; }, true));
    host.querySelectorAll("select[data-type]").forEach(s=>s.onchange=()=>change(st=>{ st.fx[s.dataset.ped].type=s.value; }, false));
    host.querySelectorAll("input[data-band]").forEach(inp=>inp.oninput=()=>{ const v=+inp.value; inp.nextElementSibling.textContent=(v>0?"+":"")+v; inp.setAttribute("aria-valuetext", (v>0?"+":"")+v+" dB");
      change(st=>{ st.eq.db[+inp.dataset.band]=v; if(!st.eq.on){ st.eq.on=true; const b=host.querySelector('button[data-eq="on"]'); if(b) b.setAttribute("aria-pressed","true"); host.querySelector(".aa-bands").dataset.off="0"; } }, false); });
    host.querySelectorAll('button[data-eq="on"]').forEach(b=>b.onclick=()=>change(st=>{ st.eq.on=!st.eq.on; }, true));
    host.querySelectorAll('button[data-eq="flat"]').forEach(b=>b.onclick=()=>change(st=>{ st.eq.db=st.eq.db.map(()=>0); }, true));
    host.querySelectorAll('button[data-aa="back"]').forEach(b=>b.onclick=()=>{ if(opt.reset) opt.reset(); note="backDone"; paint(); const nb=host.querySelector('button[data-aa="back"]'); if(nb) nb.focus(); });
  }
  paint();
  return {paint:paint};
}

const AOGAmp={load:load, create:create, defaults:defaults, normalize:normalize, coreParams:coreParams, ui:ui, cabIR:cabIR, reverbIR:reverbIR,
  MODELS:MODELS, CABS:CABS, PEDALS:PEDALS, STACKS:STACKS, EQ_F:EQ_F, WORDS:WORDS, delayMs:delayMs, workletURL:null, _cabCurve:cabCurve};
G.AOGAmp=AOGAmp;
if(typeof module!=="undefined" && module.exports) module.exports=AOGAmp;
})(typeof window!=="undefined"?window:globalThis);
