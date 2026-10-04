/* AOG-AMP-V1 (2026-10-03) — Jimmy: "May the guitar and bass get an Amplifier installed on their pages. The top amp with tons
   of EQ knobs and sound effects … that has guitar pedals … this will be a part of the two engines", and "There is NO
   distortion for the METAL guitar chords".

   The part of the amplifier that bends the wave. The drive pedals, the preamp's tubes, the tone stack between them and the
   power amp with its sag all run here, on the audio thread. They run four times faster than the page's rate, so the bent wave
   stays clean (no aliasing), and they sound the same in every browser: no WaveShaper, no browser's own oversampling.
   The rest of the rig (cabinet, EQ, chorus, phaser, flanger, tremolo, delay, reverb) is Web Audio nodes, in aog-amp.js,
   which also turns the knobs into the numbers this file uses (P, below).

   Loaded with audioWorklet.addModule("/aog-amp-worklet.js"). In Node (the tests) it exports AOGAmpCore instead. */
(function(G){
"use strict";
const TAU=2*Math.PI;

/* ── pieces ───────────────────────────────────────────────────────────────── */
/* RBJ biquad, transposed direct form II */
function Biquad(){ this.b0=1; this.b1=0; this.b2=0; this.a1=0; this.a2=0; this.z1=0; this.z2=0; }
Biquad.prototype.set=function(type, f, Q, dB, fs){
  f=Math.max(5, Math.min(f, fs*0.49));
  const w=TAU*f/fs, cw=Math.cos(w), sw=Math.sin(w), al=sw/(2*Q), A=Math.pow(10,(dB||0)/40);
  let b0,b1,b2,a0,a1,a2;
  if(type==="lp"){ b0=(1-cw)/2; b1=1-cw; b2=(1-cw)/2; a0=1+al; a1=-2*cw; a2=1-al; }
  else if(type==="hp"){ b0=(1+cw)/2; b1=-(1+cw); b2=(1+cw)/2; a0=1+al; a1=-2*cw; a2=1-al; }
  else if(type==="bp"){ b0=al; b1=0; b2=-al; a0=1+al; a1=-2*cw; a2=1-al; }
  else if(type==="peak"){ b0=1+al*A; b1=-2*cw; b2=1-al*A; a0=1+al/A; a1=-2*cw; a2=1-al/A; }
  else if(type==="ls"){ const sq=2*Math.sqrt(A)*al; b0=A*((A+1)-(A-1)*cw+sq); b1=2*A*((A-1)-(A+1)*cw); b2=A*((A+1)-(A-1)*cw-sq); a0=(A+1)+(A-1)*cw+sq; a1=-2*((A-1)+(A+1)*cw); a2=(A+1)+(A-1)*cw-sq; }
  else if(type==="hs"){ const sq=2*Math.sqrt(A)*al; b0=A*((A+1)+(A-1)*cw+sq); b1=-2*A*((A-1)+(A+1)*cw); b2=A*((A+1)+(A-1)*cw-sq); a0=(A+1)-(A-1)*cw+sq; a1=2*((A-1)-(A+1)*cw); a2=(A+1)-(A-1)*cw-sq; }
  else { b0=1; b1=0; b2=0; a0=1; a1=0; a2=0; }
  this.b0=b0/a0; this.b1=b1/a0; this.b2=b2/a0; this.a1=a1/a0; this.a2=a2/a0;
  return this;
};
Biquad.prototype.flat=function(){ this.b0=1; this.b1=this.b2=this.a1=this.a2=0; return this; };
Biquad.prototype.run=function(x){ const y=this.b0*x+this.z1; this.z1=this.b1*x-this.a1*y+this.z2; this.z2=this.b2*x-this.a2*y; return y; };

/* first order, bilinear: a coupling capacitor (high-pass) or a capacitor across a load (low-pass) */
function Pole(){ this.b0=1; this.b1=0; this.a1=0; this.x1=0; this.y1=0; }
Pole.prototype.lp=function(f, fs){ const k=Math.tan(Math.PI*Math.min(f, fs*0.49)/fs); this.b0=this.b1=k/(1+k); this.a1=(k-1)/(1+k); return this; };
Pole.prototype.hp=function(f, fs){ const k=Math.tan(Math.PI*Math.min(f, fs*0.49)/fs); this.b0=1/(1+k); this.b1=-1/(1+k); this.a1=(k-1)/(1+k); return this; };
Pole.prototype.run=function(x){ const y=this.b0*x+this.b1*this.x1-this.a1*this.y1; this.x1=x; this.y1=y; return y; };

/* the treble–middle–bass tone stack of Fender and Marshall amps: the passive circuit itself (three capacitors, the three
   pots and the slope resistor), solved by nodal analysis and checked against Yeh & Smith (2006). t, m, l go 0 to 1. */
function ToneStack(){ this.b=[1,0,0,0]; this.a=[1,0,0,0]; this.z1=0; this.z2=0; this.z3=0; }
ToneStack.prototype.set=function(k, t, m, l, fs){
  t=Math.max(0.001,Math.min(0.999,t)); m=Math.max(0.001,Math.min(0.999,m)); l=Math.max(0.001,Math.min(0.999,l));
  const C1=k.C1, C2=k.C2, C3=k.C3, R1=k.R1, R2=k.R2, R3=k.R3, R4=k.R4;
  const b1=C1*R1*t + C1*R2*l + C1*R3*m + C2*R2*l + C2*R3*m + C3*R3*m;
  const b2=C1*C2*R1*R2*l + C1*C2*R1*R3*m + C1*C2*R1*R4*t + C1*C2*R2*R4*l + C1*C2*R3*R4*m + C1*C3*R1*R3*m + C1*C3*R1*R4*t + C1*C3*R2*R3*l*m + C1*C3*R2*R4*l + C1*C3*R3*R4*m + C2*C3*R2*R3*l*m;
  const b3=C1*C2*C3*R2*l*(R1*R3*m + R1*R4*t + R3*R4*m);
  const a1=C1*R1 + C1*R2*l + C1*R3*m + C2*R2*l + C2*R3*m + C2*R4 + C3*R3*m + C3*R4;
  const a2=C1*C2*R1*R2*l + C1*C2*R1*R3*m + C1*C2*R1*R4 + C1*C2*R2*R4*l + C1*C2*R3*R4*m + C1*C3*R1*R3*m + C1*C3*R1*R4 + C1*C3*R2*R3*l*m + C1*C3*R2*R4*l + C1*C3*R3*R4*m + C2*C3*R2*R3*l*m + C2*C3*R2*R4*l;
  const a3=C1*C2*C3*R2*l*(R1*R3*m + R1*R4 + R3*R4*m);
  const c=2*fs, c2=c*c, c3=c2*c;
  const B0=b1*c+b2*c2+b3*c3, B1=b1*c-b2*c2-3*b3*c3, B2=-b1*c-b2*c2+3*b3*c3, B3=-b1*c+b2*c2-b3*c3;
  const A0=1+a1*c+a2*c2+a3*c3, A1=3+a1*c-a2*c2-3*a3*c3, A2=3-a1*c-a2*c2+3*a3*c3, A3=1-a1*c+a2*c2-a3*c3;
  this.b=[B0/A0, B1/A0, B2/A0, B3/A0]; this.a=[1, A1/A0, A2/A0, A3/A0];
  return this;
};
ToneStack.prototype.run=function(x){
  const b=this.b, a=this.a, y=b[0]*x+this.z1;
  this.z1=b[1]*x-a[1]*y+this.z2; this.z2=b[2]*x-a[2]*y+this.z3; this.z3=b[3]*x-a[3]*y;
  return y;
};

/* four times the rate and back: a 64-tap Kaiser-windowed low-pass, split into four 16-tap phases */
function I0(x){ let s=1, t=1; for(let k=1;k<40;k++){ t*=(x/(2*k))*(x/(2*k)); s+=t; if(t<1e-12*s) break; } return s; }
function Over4(){
  const N=64, M=N-1, fc=0.5*0.9/4, beta=8, h=new Float64Array(N); let sum=0;
  for(let n=0;n<N;n++){ const x=n-M/2, r=2*n/M-1; h[n]=Math.sin(TAU*fc*x)/(Math.PI*x)*I0(beta*Math.sqrt(Math.max(0,1-r*r)))/I0(beta); sum+=h[n]; }
  for(let n=0;n<N;n++) h[n]/=sum;
  this.h=h; this.up=[0,1,2,3].map(p=>{ const a=new Float64Array(16); for(let j=0;j<16;j++) a[j]=4*h[4*j+p]; return a; });
  this.xi=new Float64Array(32); this.xp=0;          /* the last 16 input samples, written twice so a run never wraps */
  this.zi=new Float64Array(128); this.zp=0;         /* the last 64 fast samples, the same way */
}
Over4.prototype.upsample=function(x, out){
  const xi=this.xi; let p=this.xp-1; if(p<0) p=15; this.xp=p; xi[p]=x; xi[p+16]=x;
  for(let ph=0; ph<4; ph++){ const c=this.up[ph]; let s=0; for(let j=0;j<16;j++) s+=c[j]*xi[p+j]; out[ph]=s; }
};
Over4.prototype.push=function(v){ const z=this.zi; let p=this.zp-1; if(p<0) p=63; this.zp=p; z[p]=v; z[p+64]=v; };
Over4.prototype.downsample=function(){ const z=this.zi, h=this.h, p=this.zp; let s=0; for(let k=0;k<64;k++) s+=h[k]*z[p+k]; return s; };

/* ── how a stage bends the wave ─────────────────────────────────────────────
   soft: a triode, x/√(1+x²); the side that runs into the grid current bends sooner than the side that runs to cut-off
   (asym), which gives the even harmonics of a tube; bias moves the resting point (a cold stage clips one side first).
   hard: diodes or a solid-state stage, x/(1+x⁴)^¼, a shorter knee. */
function soft(x){ return x/Math.sqrt(1+x*x); }
function hard(x){ const x2=x*x; return x/Math.sqrt(Math.sqrt(1+x2*x2)); }
function tube(x, asym){ return x>0 ? soft(x) : (asym>0 ? -asym*soft(-x/asym) : soft(x)); }

/* ── the amp ────────────────────────────────────────────────────────────── */
function AmpCore(fs){
  this.fs=fs; this.fo=fs*4; this.ov=new Over4(); this.u=new Float64Array(4);
  /* at the page's rate, before the fast part */
  this.pick=new Biquad(); this.gate={env:0, g:1, open:false}; this.comp={env:0};
  this.wah={ic1:0, ic2:0, env:0, pos:0}; this.oct={lp1:new Biquad(), lp2:new Biquad(), sm:new Pole(), ff:1, st:0, env:0};
  /* fast: the drive pedals */
  this.od={hp:new Pole(), lp:new Pole(), out:new Pole()};
  this.ds={pre:new Biquad(), hp:new Pole(), slew:new Pole(), filt:new Pole()};
  this.fz={hp:new Pole(), lp1:new Pole(), hp2:new Pole(), toneL:new Pole(), toneH:new Pole()};
  /* fast: the amp */
  this.inHp=new Biquad(); this.inHp2=new Biquad(); this.bright=new Biquad();
  this.st=[0,1,2,3].map(()=>({pre:new Biquad(), hp:new Pole(), lp:new Pole()}));
  this.stack=new ToneStack(); this.bax=[new Biquad(), new Biquad(), new Biquad()];
  this.clean={lp:new Biquad()};
  this.pw={env:0, hp:new Pole()};
  /* at the page's rate, after */
  this.pres=new Biquad(); this.depth=new Biquad(); this.dc=new Pole();
  /* the gains a knob moves glide, so a turn never clicks */
  this.sm={lvl:0, drive:0, g0:0}; this.first=true;
  this.P=null;
}
AmpCore.prototype.set=function(P){
  const fs=this.fs, fo=this.fo; this.P=P;
  const a=P.amp||{};
  if(a.pick) this.pick.set("peak", a.pick.f, a.pick.q, a.pick.db, fs); else this.pick.flat();
  if(P.wah && P.wah.on){ this.wahK=1/Math.max(0.5,P.wah.q); }
  if(P.oct && P.oct.on){ const f=P.oct.f||220; this.oct.lp1.set("lp", f, 0.7, 0, fs); this.oct.lp2.set("lp", f, 0.7, 0, fs); this.oct.sm.lp(f*1.6, fs); }
  if(P.od && P.od.on){ this.od.hp.hp(720, fo); this.od.lp.lp(P.od.tone, fo); this.od.out.hp(30, fo); }
  if(P.ds && P.ds.on){ this.ds.pre.set("hs", 1500, 0.7, 9, fo); this.ds.hp.hp(70, fo); this.ds.slew.lp(Math.min(18000, 1.2e6/Math.max(1,P.ds.gain)), fo); this.ds.filt.lp(P.ds.filter, fo); }
  if(P.fz && P.fz.on){ this.fz.hp.hp(90, fo); this.fz.lp1.lp(4500, fo); this.fz.hp2.hp(60, fo); this.fz.toneL.lp(700, fo); this.fz.toneH.hp(1200, fo); }
  if(a.on){
    this.inHp.set("hp", a.inHp||20, 0.7, 0, fo); this.inHp2.set("hp", a.inHp||20, 0.55, 0, fo);
    this.bright.set("hs", a.brightF||2000, 0.7, a.brightDb||0, fo);
    (a.stages||[]).forEach((s,i)=>{ const S=this.st[i];
      if(s.cut) S.pre.set("ls", s.cutF||250, 0.7, -s.cut, fo); else S.pre.flat();
      S.hp.hp(s.hp||15, fo); S.lp.lp(s.lp||14000, fo); });
    if(a.stack) this.stack.set(a.stack, a.t, a.m, a.l, fo);
    if(a.bax){ this.bax[0].set("ls", a.bax.lowF||80, 0.7, a.bax.low||0, fo); this.bax[1].set("peak", a.bax.midF||500, a.bax.midQ||0.8, a.bax.mid||0, fo); this.bax[2].set("hs", a.bax.highF||3000, 0.7, a.bax.high||0, fo); }
    if(a.blend!=null) this.clean.lp.set("lp", a.cleanF||180, 0.7, 0, fo);
    this.pw.hp.hp(25, fo);
  }
  this.pres.set("hs", a.presF||3500, 0.7, a.presDb||0, fs);
  this.depth.set("peak", a.depthF||90, 1.0, a.depthDb||0, fs);
  this.dc.hp(12, fs);
  if(this.first){ this.sm.lvl=P.level||1; this.sm.drive=(a.power&&a.power.drive)||1; this.sm.g0=(a.stages&&a.stages[0]&&a.stages[0].g)||1; this.first=false; }
  this.fast=!!((P.od&&P.od.on)||(P.ds&&P.ds.on)||(P.fz&&P.fz.on)||a.on);
};
/* one block: inp → out, n samples, mono */
AmpCore.prototype.process=function(inp, out, n){
  const P=this.P; if(!P){ for(let i=0;i<n;i++) out[i]=inp?inp[i]:0; return; }
  const fs=this.fs, a=P.amp||{}, u=this.u, ov=this.ov;
  const gate=P.gate&&P.gate.on ? P.gate : null, comp=P.comp&&P.comp.on ? P.comp : null, wah=P.wah&&P.wah.on ? P.wah : null, oct=P.oct&&P.oct.on ? P.oct : null;
  const od=P.od&&P.od.on ? P.od : null, ds=P.ds&&P.ds.on ? P.ds : null, fz=P.fz&&P.fz.on ? P.fz : null;
  const stages=a.on ? (a.stages||[]) : [], pw=a.on ? (a.power||null) : null, ns=stages.length;
  /* smoothing constants at the page's rate: about 20 ms for a knob, the gate's and the compressor's own times */
  const kSm=Math.exp(-1/(0.02*fs));
  const gA=Math.exp(-1/(0.0005*fs)), gR=Math.exp(-1/(0.03*fs)), gOpen=Math.exp(-1/(0.0008*fs)), gClose=gate?Math.exp(-1/(Math.max(0.005,gate.rel)*fs)):0;
  const cA=comp?Math.exp(-1/(Math.max(0.0005,comp.att)*fs)):0, cR=comp?Math.exp(-1/(Math.max(0.01,comp.rel)*fs)):0;
  const wA=Math.exp(-1/(0.004*fs)), wR=Math.exp(-1/(0.12*fs));
  const sagA=Math.exp(-1/(0.012*this.fo)), sagR=Math.exp(-1/(0.18*this.fo));
  const lvlT=P.level||1, drvT=pw?pw.drive:1, g0T=ns?stages[0].g:1;
  let lvl=this.sm.lvl, drv=this.sm.drive, g0=this.sm.g0;
  for(let i=0;i<n;i++){
    let x=(inp?inp[i]:0)+1e-15;
    lvl=lvlT+(lvl-lvlT)*kSm; drv=drvT+(drv-drvT)*kSm; g0=g0T+(g0-g0T)*kSm;
    /* the guitar's pickup */
    x=this.pick.run(x);
    /* noise gate: listens to the guitar itself, closes the amp's output when the strings fall quiet (a tight stop
       between chugs); opens in under a millisecond */
    if(gate){ const G2=this.gate, ax=Math.abs(x); G2.env = ax>G2.env ? ax+(G2.env-ax)*gA : ax+(G2.env-ax)*gR;
      if(G2.env>gate.thr) G2.open=true; else if(G2.env<gate.thr*0.5) G2.open=false; }
    /* compressor: evens out the notes and makes them ring longer */
    if(comp){ const C=this.comp, ax=Math.abs(x); C.env = ax>C.env ? ax+(C.env-ax)*cA : ax+(C.env-ax)*cR;
      const db=20*Math.log10(C.env+1e-9), over=db-comp.thr, k=comp.knee||6;
      let gr = over<=-k/2 ? 0 : over>=k/2 ? over*(1-1/comp.ratio) : (1-1/comp.ratio)*(over+k/2)*(over+k/2)/(2*k);
      x*=Math.pow(10,(comp.makeup-gr)/20); }
    /* wah: a resonant band-pass that sweeps (fixed where you leave it, or opened by how hard you play) */
    if(wah){ const W=this.wah, ax=Math.abs(x); W.env = ax>W.env ? ax+(W.env-ax)*wA : ax+(W.env-ax)*wR;
      const pos = wah.mode==="touch" ? Math.min(1, W.env*wah.sens) : wah.pos;
      const f=wah.f0*Math.pow(wah.f1/wah.f0, pos), g=Math.tan(Math.PI*Math.min(f, fs*0.45)/fs), k=this.wahK||0.2;
      const a1=1/(1+g*(g+k)), a2=g*a1, a3=g*a2, v3=x-W.ic2, v1=a1*W.ic1+a2*v3, v2=W.ic2+a2*W.ic1+a3*v3;
      W.ic1=2*v1-W.ic1; W.ic2=2*v2-W.ic2;
      x = x*(1-wah.mix) + (v1*k*2.2 + v2*0.25)*wah.mix; }
    /* octave down: the note's own swing, counted every other time round, and given the note's loudness */
    if(oct){ const O=this.oct, l=O.lp2.run(O.lp1.run(x)), al=Math.abs(l);
      O.env = al>O.env ? al+(O.env-al)*0.99 : al+(O.env-al)*0.9995;
      if(O.st<=0 && l>O.env*0.12){ O.st=1; O.ff=-O.ff; } else if(O.st>0 && l<-O.env*0.12){ O.st=-1; }
      const sub=O.sm.run(O.ff*O.env*1.6); x = x*oct.dry + sub*oct.sub; }
    let y;
    if(this.fast){
      ov.upsample(x, u);
      for(let q=0;q<4;q++){
        let v=u[q];
        /* overdrive (the green one): only the middle is driven, and soft diodes round it off; the rest passes clean */
        if(od){ const h=this.od.hp.run(v); v = v + 0.55*soft(od.gain*h/0.55); v=this.od.out.run(this.od.lp.run(v))*od.level; }
        /* distortion: a lot of gain, more of it up high, an op-amp that cannot keep up, two hard diodes, a filter */
        if(ds){ let w=this.ds.pre.run(this.ds.hp.run(v))*ds.gain; w=this.ds.slew.run(w); w=0.7*hard(w/0.7); v=this.ds.filt.run(w)*ds.level; }
        /* fuzz: two stages driven flat out, then a tone that scoops the middle */
        if(fz){ let w=this.fz.hp.run(v)*fz.gain; w=0.6*soft(w/0.6+0.13)-0.6*soft(0.13); w=this.fz.lp1.run(w); w=this.fz.hp2.run(w)*fz.gain2; w=0.6*soft(w/0.6);
          v=(this.fz.toneL.run(w)*(1-fz.tone)+this.fz.toneH.run(w)*fz.tone)*fz.level; }
        /* the amp: tight input, bright cap, the gain stages, the tone stack, the power amp and its sag */
        if(a.on){
          const dry=v;
          v=this.bright.run(this.inHp2.run(this.inHp.run(v)));
          /* the tone stack sits after stage stackAt (a Fender's after the first, a Marshall's after the last) */
          const sa=a.stackAt==null ? ns-1 : a.stackAt;
          if(a.stack && sa<0) v=this.stack.run(v)*(a.stackGain||1);
          for(let s=0;s<ns;s++){ const S=stages[s], T=this.st[s], hd=S.head||1, b=S.bias||0;
            let w=T.pre.run(v)*(s===0?g0:S.g);
            w = S.hard ? hd*hard(w/hd+b)-hd*hard(b) : hd*tube(w/hd+b, S.asym||0)-hd*tube(b, S.asym||0);
            v=T.lp.run(T.hp.run(w))*(S.out||1);
            if(a.stack && s===sa) v=this.stack.run(v)*(a.stackGain||1); }
          if(a.bax){ v=this.bax[2].run(this.bax[1].run(this.bax[0].run(v))); }
          if(a.blend!=null) v = v*a.blend + this.clean.lp.run(dry)*(1-a.blend)*(a.cleanGain||1);
          if(pw){ const W=this.pw, hd=pw.head||1, sg=1/(1+pw.sag*W.env);
            let w=v*drv*sg; w = pw.hard ? hd*hard(w/hd) : hd*soft(w/hd);
            const aw=Math.abs(w)/hd; W.env = aw>W.env ? aw+(W.env-aw)*sagA : aw+(W.env-aw)*sagR;
            v=this.pw.hp.run(w)*(pw.out||1); }
        }
        ov.push(v);
      }
      y=ov.downsample();
    } else y=x;
    if(a.on){ y=this.depth.run(this.pres.run(y)); }
    y=this.dc.run(y);
    if(gate){ const G2=this.gate; G2.g = G2.open ? 1+(G2.g-1)*gOpen : G2.g*gClose; y*=G2.g; }
    out[i]=y*lvl;
  }
  this.sm.lvl=lvl; this.sm.drive=drv; this.sm.g0=g0;
};

G.AOGAmpCore=AmpCore;
if(typeof G.registerProcessor==="function" && typeof G.AudioWorkletProcessor==="function"){
  class AogAmp extends G.AudioWorkletProcessor{
    constructor(o){ super(); this.core=new AmpCore(G.sampleRate); const p=o&&o.processorOptions&&o.processorOptions.p; if(p) this.core.set(p);
      this.port.onmessage=e=>{ const d=e.data||{}; if(d.p) this.core.set(d.p); }; }
    process(inputs, outputs){
      const inp=inputs[0]&&inputs[0][0], out=outputs[0]&&outputs[0][0]; if(!out) return true;
      this.core.process(inp||null, out, out.length);
      for(let c=1;c<outputs[0].length;c++) outputs[0][c].set(out);
      return true;
    }
  }
  G.registerProcessor("aog-amp", AogAmp);
}
if(typeof module!=="undefined" && module.exports) module.exports={AmpCore:AmpCore, ToneStack:ToneStack, Over4:Over4, Biquad:Biquad};
})(typeof globalThis!=="undefined"?globalThis:this);
