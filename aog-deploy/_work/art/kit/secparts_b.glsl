/* AOG render kit — secparts_b.glsl: objects for the Secret Societies, K–12 (sec) pencil still lifes,
   units 10–17 and the course hub (batch secB; units 1–9 live in secparts_a.glsl). Objects only: no
   people, no faces, no symbols of hate, no flags, no readable writing (hint-lines only). Include after
   lib.glsl, studio.glsl and sptmar.glsl (it uses eD, slab and o_pencil from sptmar.glsl). Each object
   rests on y=0 in its own frame, front toward -z, sizes in metres. s_<name>(q) is the distance,
   ts_<name>(q) the grey tone (0 dark .. 1 paper). */
float hs1(float x){ return fract(sin(x*127.1+11.3)*43758.5453); }
float hs2(vec2 x){ return fract(sin(dot(x,vec2(127.1,311.7)))*43758.5453); }
float bnd(vec3 q,vec3 c,vec3 h){ return sdBox(q-c,h); }
/* text-like hint lines inside a box: rows of pitch pt, ragged right end, returns 1 on a line */
float hl(vec2 u,vec2 lo,vec2 hi,float pt,float fill,float seed){
  if(u.x<lo.x||u.x>hi.x||u.y<lo.y||u.y>hi.y) return 0.;
  float row=floor((u.y-lo.y)/pt); float end=hi.x-(hi.x-lo.x)*.35*hs1(row+seed);
  if(u.x>end) return 0.; return step(fract((u.y-lo.y)/pt),fill); }

/* ================= u10: tin lantern, composing stick, folded broadside ================= */
float s_lantern(vec3 q){ float bb=bnd(q,vec3(0.,.155,0.),vec3(.075,.16,.075)); if(bb>.2) return bb;
  float body=sdCylY(q-vec3(0.,.095,0.),.056,.08)-.001;
  float foot=sdCylY(q-vec3(0.,.006,0.),.058,.006)-.0015; float rim=sdTorus(q-vec3(0.,.016,0.),.057,.0035);
  float band=sdTorus(q-vec3(0.,.176,0.),.058,.0035);
  float roof=sdCone(q-vec3(0.,.216,0.),.061,.014,.04)-.001;
  float cap=sdCylY(q-vec3(0.,.259,0.),.017,.005)-.0015;
  vec3 h=q-vec3(0.,.288,0.); float ring=length(vec2(length(h.xy)-.024,h.z))-.0032; ring=max(ring,-h.y-.02);
  float latch=sdRBox(q-vec3(.03,.1,-.057),vec3(.004,.012,.004),.0015);
  float hg=min(sdCylY(q-vec3(-.03,.06,-.056),.004,.01),sdCylY(q-vec3(-.03,.135,-.056),.004,.01));
  return min(min(min(body,foot),min(rim,band)),min(min(roof,cap),min(ring,min(latch,hg)))); }
float ts_lantern(vec3 q){ float a=atan(q.z,q.x);
  if(q.y<.02) return .4+.1*vn(q.xz*400.);
  if(q.y>.172&&q.y<.181) return .38;
  if(q.y>.25) return .4;
  if(q.y>.18){ float s=fract(a*8./6.2832); if(s<.05) return .3;         /* roof seams, punched dots */
    vec2 c=vec2(fract(a*48./6.2832)-.5,fract((q.y-.18)/.011)-.5); if(q.y<.24&&length(c*vec2(1.,1.3))<.2) return .15; return .6+.08*vn(vec2(a*20.,q.y*300.)); }
  /* body: the door outline, then a punched pattern of dots in a ring-and-diamond motif */
  vec2 u=vec2(a*.056,q.y-.095); vec2 d=vec2(u.x+.056*1.5708,u.y);   /* front (-z) is a=-pi/2 */
  if(abs(max(abs(d.x)-.03,abs(d.y+.005)-.06))<.0016) return .3;
  float pw=.056*6.2832/6.; vec2 v=vec2(mod(u.x,pw)-pw*.5,u.y);
  float m=min(abs(length(v)-.019),abs(abs(v.x)+abs(v.y*.8)-.036)); m=min(m,length(v)-.004);
  m=min(m,abs(abs(v.y)-.062));
  vec2 g=fract(u/.0058)-.5; if(m<.0028&&length(g)<.24) return .12;
  return .62+.08*vn(u*900.); }

float s_stick(vec3 q){ float bb=bnd(q,vec3(0.,.016,0.),vec3(.13,.02,.075)); if(bb>.2) return bb;
  float base=sdRBox(q-vec3(0.,.0016,0.),vec3(.122,.0016,.03),.001);
  float back=sdRBox(q-vec3(0.,.013,.0285),vec3(.122,.013,.0017),.0008);
  float knee=sdRBox(q-vec3(-.1195,.013,0.),vec3(.0025,.013,.03),.0008);
  float mk=sdRBox(q-vec3(.058,.011,-.001),vec3(.0022,.0105,.0285),.0007);
  float tab=sdRBox(q-vec3(.058,.01,.035),vec3(.007,.006,.006),.002);
  float kn=sdCylZ(q-vec3(.058,.01,.046),.008,.003)-.001;
  float d=min(min(base,back),min(min(knee,mk),min(tab,kn)));
  /* three lines of type standing face-up; every sort its own piece, a few low spaces */
  vec3 t=q-vec3(-.0305,.0032,.009); float blk=sdBox(t-vec3(0.,.0118,0.),vec3(.0865,.0118,.018));
  if(blk<.01){ float p=.0068; float i=floor((t.x+.0865)/p); float j=floor((t.z+.018)/.0072);
    float fx=fract((t.x+.0865)/p); float fz=fract((t.z+.018)/.0072);
    float gap=min(fx,1.-fx)*p-.0003; float gz=min(fz,1.-fz)*.0072-.0003;
    float low=hs2(vec2(i,j))<.14?.007:0.; float top=.0236-low;
    float sorts=max(blk,t.y-top); float g=min(gap,gz);
    sorts=max(sorts,-max(g,top-.005-t.y)); d=min(d,sorts); }
  else d=min(d,blk);
  /* two loose sorts on the table in front */
  vec3 l1=q-vec3(.09,.0035,-.058); l1.xz=rot(.5)*l1.xz; d=min(d,sdRBox(l1,vec3(.012,.0035,.0035),.0006));
  vec3 l2=q-vec3(.112,.0035,-.042); l2.xz=rot(-.3)*l2.xz; d=min(d,sdRBox(l2,vec3(.012,.0035,.003),.0006));
  return d; }
float ts_stick(vec3 q){ vec3 t=q-vec3(-.0305,.0032,.009);
  if(abs(t.x)<.0868&&abs(t.z)<.0183&&t.y>0.){ float p=.0068; float i=floor((t.x+.0865)/p); float j=floor((t.z+.018)/.0072);
    float low=hs2(vec2(i,j))<.14?.007:0.;
    if(t.y>.0233-low){ if(low>0.) return .35; vec2 c=vec2(fract((t.x+.0865)/p)-.5,fract((t.z+.018)/.0072)-.5);
      float w=.18+.12*hs2(vec2(i+3.,j)); float hh=.2+.1*hs2(vec2(i,j+7.));
      if(abs(c.x)<w&&abs(c.y)<hh&&!(abs(c.x)<w*.45&&abs(c.y)<hh*.45&&hs2(vec2(j,i))>.5)) return .12; return .55; }
    return fract(t.y/.004)<.2?.35:.48; }
  if(q.z<-.045&&q.y<.008) return .42;
  return .7+.12*fract(q.x*900.+vn(q.xz*500.)); }

float s_broadside(vec3 q){ float bb=bnd(q,vec3(0.,.02,0.),vec3(.12,.05,.1)); if(bb>.2) return bb;
  float a=slab(q,vec2(.105,.075),.0006,.002);
  vec3 u=q-vec3(0.,.0014,-.075); u.yz=rot(-.2)*u.yz;
  float b=slab(u-vec3(0.,0.,.074),vec2(.103,.074),.0006,.002);
  float c=sdCylX(q-vec3(0.,.0014,-.075),.0014,.103);
  return min(min(a,b),c); }
float ts_broadside(vec3 q){ vec3 u=q-vec3(0.,.0014,-.075); u.yz=rot(-.2)*u.yz; vec2 s;
  if(u.y>-.0004&&u.z>.0){ s=vec2(u.x,u.z-.074); }   /* upper leaf, s.y from -.074 (fold) to .074 (far edge) */
  else { s=vec2(q.x,q.z); if(abs(s.x)<.095&&s.y<-.03&&s.y>-.07) return hl(s,vec2(-.09,-.068),vec2(.09,-.032),.0065,.33,5.)>.5?.55:.95; return .95; }
  if(abs(max(abs(s.x)-.094,abs(s.y)-.066))<.0012) return .4;                       /* printed border */
  if(s.y>.034&&s.y<.058&&abs(s.x)<.08){ float k=fract((s.x+.08)/.0105); return (k<.72&&abs(s.y-.046)<.009)?.18:.95; }  /* heading blocks */
  if(abs(s.y-.028)<.0012&&abs(s.x)<.088) return .3; if(abs(s.y-.024)<.0006&&abs(s.x)<.088) return .45;
  if(s.x>.012&&s.x<.086&&s.y>-.02&&s.y<.018){ if(abs(max(abs(s.x-.049)-.037,abs(s.y+.001)-.019))<.0012) return .3;
    return fract((s.x-s.y)/.004)<.35?.45:.85; }                                     /* a woodcut box */
  if(hl(s,vec2(-.088,-.06),vec2(.004,.018),.0062,.33,1.)>.5) return .5;
  if(hl(s,vec2(.012,-.06),vec2(.088,-.026),.0062,.33,9.)>.5) return .5;
  return .95; }

/* ================= u11: ledger, banker's lamp, coin stacks ================= */
float s_ledger(vec3 q){ float bb=bnd(q,vec3(0.,.02,0.),vec3(.18,.04,.13)); if(bb>.2) return bb;
  float cover=sdRBox(q-vec3(0.,.003,0.),vec3(.168,.003,.122),.0015);
  float x=abs(q.x); float lift=.016*sin(clamp(x/.16,0.,1.)*1.75)-.006*exp(-x*80.);
  float pages=sdBox(vec3(x-.083,q.y-.0065-lift*.5,q.z),vec3(.079,max(.0045+lift*.5,.003),.114))-.001;
  vec3 r=q-vec3(.03,.0,-.12); float rib=sdRBox(r-vec3(0.,.004,-.012),vec3(.004,.0005,.016),.0003);
  return min(cover,min(pages*.9,rib)); }
float ts_ledger(vec3 q){ if(q.y<.0058) return (abs(abs(q.x)-.16)<.012||q.x<-.155)?.18:.28;
  if(q.z<-.124) return .3;                                                          /* ribbon */
  float x=abs(q.x); if(x<.004) return .5;
  vec2 u=vec2(x-.083,q.z); if(abs(u.y)>.109||abs(u.x)>.075) return fract(q.y/.0012)<.35?.7:.92;
  if(u.y>.092){ if(abs(u.y-.1)<.004&&u.x<.02) return .35; return .95; }             /* heading bar */
  float cx=u.x; if(q.x<0.) cx=-cx;
  if(abs(cx-.03)<.0007||abs(cx-.05)<.0007||abs(cx+.05)<.0007) return .35;           /* ruled columns */
  if(abs(cx-.0316)<.0005) return .5;                                                /* the double rule */
  float row=floor((u.y+.109)/.0085); float f=fract((u.y+.109)/.0085);
  if(f<.08) return .72;
  if(f>.3&&f<.62){ float h=hs2(vec2(row,sign(q.x)));
    if(cx>-.068&&cx<-.055&&h<.8) return .45;                                         /* dates */
    if(cx>-.046&&cx<-.046+.07*h&&cx<.026) return .5;                                 /* entries */
    if(cx>.035&&cx<.047&&h>.2&&fract(cx/.0028)<.7) return .45;                       /* figures */
    if(cx>.054&&cx<.07&&h>.35&&fract(cx/.0028)<.7) return .45; }
  return .95; }

float s_banker(vec3 q){ float bb=bnd(q,vec3(0.,.16,0.),vec3(.15,.19,.1)); if(bb>.2) return bb;
  float b1=sdRBox(q-vec3(0.,.011,.02),vec3(.085,.011,.055),.012);
  float b2=sdRBox(q-vec3(0.,.027,.025),vec3(.06,.006,.038),.006);
  float st=sdCapsule(q,vec3(0.,.03,.03),vec3(0.,.19,.03),.0065);
  float col=min(sdCylY(q-vec3(0.,.04,.03),.011,.007)-.001,sdTorus(q-vec3(0.,.12,.03),.008,.003));
  float arm=sdCapsule(q,vec3(0.,.19,.03),vec3(0.,.205,.0),.005);
  vec3 s=q-vec3(0.,.215,-.005); s.yz=rot(-.3)*s.yz;
  float cyl=abs(length(s.yz)-.062)-.0022; cyl=max(cyl,abs(s.x)-.135); cyl=max(cyl,-s.y-.012);
  float caps=max(max(length(s.yz)-.062,abs(abs(s.x)-.135)-.0022),-s.y-.012);
  float lip=min(sdCapsule(s,vec3(-.137,-.012,-.061),vec3(.137,-.012,-.061),.0035),sdCapsule(s,vec3(-.137,-.012,.061),vec3(.137,-.012,.061),.0035));
  float knob=sdCylY(s-vec3(0.,.065,0.),.009,.004)-.001;
  /* pull chain of beads hanging from under the shade */
  vec3 c=q-vec3(.07,.0,-.045); float bead=length(vec3(c.x,mod(c.y+.002,.0055)-.00275,c.z))-.0019;
  bead=max(bead,abs(c.y-.1475)-.028); float pull=sdCapsule(c,vec3(0.,.108,0.),vec3(0.,.118,0.),.0035);
  return min(min(min(b1,b2),min(st,col)),min(min(arm,min(cyl,caps)),min(min(lip,knob),min(bead,pull)))); }
float ts_banker(vec3 q){ vec3 s=q-vec3(0.,.215,-.005); s.yz=rot(-.3)*s.yz;
  if(q.y>.14&&abs(s.x)<.14&&length(s.yz)>.055&&length(s.yz)<.07&&s.y>-.02){
    if(s.y<-.008) return .6;                                                        /* brass lip */
    float rin=length(s.yz); if(rin<.0605) return .9;                                 /* white inside */
    if(abs(abs(s.x)-.1)<.002) return .25; return .32+.06*vn(s.xz*300.); }            /* dark green glass */
  if(q.y>.14&&abs(s.x)>.13&&length(s.yz)<.066) return .3;
  if(q.y<.034) return .5+.12*grain(q,70.)*.6;
  return .66+.12*step(.7,fract(q.y*60.)); }

float s_coins(vec3 q){ float bb=bnd(q,vec3(.02,.02,.0),vec3(.07,.03,.05)); if(bb>.2) return bb;
  float t=.0023, r=.016;
  float s1=sdCylY(q-vec3(0.,9.*t*.5,0.),r,9.*t*.5)-.0004;
  float s2=sdCylY(q-vec3(.036,5.*t*.5,.012),r,5.*t*.5)-.0004;
  float s3=sdCylY(q-vec3(.012,12.*t*.5,.04),r,12.*t*.5)-.0004;
  float top=sdCylY(q-vec3(.004,9.*t+t*.5,.003),r,t*.5)-.0004;                           /* the top coin sits a little off */
  vec3 l=q-vec3(-.03,0.,-.032); l.yz=rot(-.12)*l.yz; float lie=sdCylY(l-vec3(0.,t*.5+.001,0.),r,t*.5)-.0004;
  return min(min(min(s1,s2),min(s3,top)),lie); }
float ts_coins(vec3 q){ vec2 cs[5]; cs[0]=vec2(0.,0.); cs[1]=vec2(.036,.012); cs[2]=vec2(.012,.04); cs[3]=vec2(.004,.003); cs[4]=vec2(-.03,-.032);
  float best=1e3; vec2 c=vec2(0.); for(int i=0;i<5;i++){ float d=abs(length(q.xz-cs[i])-.016); if(d<best){ best=d; c=cs[i]; } }
  vec2 v=q.xz-c; float r=length(v);
  if(r>.0155){ float a=atan(v.y,v.x); if(fract(q.y/.0023)<.2) return .28; return fract(a*50./6.2832)<.45?.45:.72; }   /* milled edges */
  if(abs(r-.0135)<.0007) return .45; if(r<.008&&vn(v*900.)>.62) return .5; return .78; }

/* ================= u12: letter bundle, ribbon, seal stamp and wax, inkwell and quill ================= */
float s_letters(vec3 q){ float bb=bnd(q,vec3(0.,.012,0.),vec3(.09,.02,.065)); if(bb>.2) return bb;
  float d=1e3;
  for(int i=0;i<5;i++){ float fi=float(i); vec3 e=q-vec3(.004*sin(fi*2.1),.0013+fi*.0027,.004*cos(fi*1.7)); e.xz=rot(.05*sin(fi*2.7+.4))*e.xz;
    d=min(d,sdRBox(e,vec3(.078,.0012,.049),.0008)); }
  return d; }
float ts_letters(vec3 q){ if(q.y<.0127) return fract(q.y/.0027)<.2?.5:.86;
  vec3 e=q-vec3(.004*sin(4.*2.1),0.,.004*cos(4.*1.7)); e.xz=rot(.05*sin(4.*2.7+.4))*e.xz; vec2 u=e.xz;
  if(abs(max(abs(u.x)-.074,abs(u.y)-.045))<.0008) return .55;
  if(u.x>.048&&u.x<.068&&u.y>.018&&u.y<.04){ vec2 c=u-vec2(.058,.029); if(abs(max(abs(c.x)-.009,abs(c.y)-.0105))<.0012) return .35;
    return fract((c.x+c.y)/.003)<.4?.55:.85; }                                                      /* postage stamp */
  if(hl(u,vec2(-.028,-.03),vec2(.034,.0),.0075,.35,3.)>.5) return .45;
  return .88; }
float s_ribbon(vec3 q){ float bb=bnd(q,vec3(0.,.02,0.),vec3(.09,.03,.065)); if(bb>.2) return bb;
  float H=.0145; float shell=abs(sdRBox(q-vec3(0.,H*.5,0.),vec3(.081,H*.5+.0008,.052),.002))-.0009;
  float b1=max(shell,abs(q.x-.02)-.006); float b2=max(shell,abs(q.z+.006)-.006);
  vec3 k=q-vec3(.02,H+.004,-.006); float knot=eD(k,vec3(.008,.0045,.0065));
  vec3 l1=k-vec3(-.014,.006,0.); l1.xy=rot(.45)*l1.xy; float lp1=length(vec2(length(l1.xy*vec2(1.,1.7))-.013,l1.z))-.0024;
  vec3 l2=k-vec3(.014,.006,0.); l2.xy=rot(-.45)*l2.xy; float lp2=length(vec2(length(l2.xy*vec2(1.,1.7))-.013,l2.z))-.0024;
  float t1=sdRBox(vec3(rot(.6)*(q.xz-vec2(.0,-.04)),q.y-H-.001).xzy,vec3(.005,.0009,.03),.0006);
  float t2=sdRBox(vec3(rot(-.35)*(q.xz-vec2(.045,-.045)),q.y-H-.001).xzy,vec3(.005,.0009,.032),.0006);
  return min(min(min(b1,b2),knot),min(min(lp1,lp2),min(t1,t2))); }
float ts_ribbon(vec3 q){ return .5+.3*step(.7,fract((q.x+q.z)*140.)); }
float s_seal(vec3 q){ float bb=bnd(q,vec3(0.,.055,0.),vec3(.03,.06,.03)); if(bb>.2) return bb;
  float base=sdCylY(q-vec3(0.,.008,0.),.0165,.008)-.001;
  float fl=sdCone(q-vec3(0.,.02,0.),.017,.011,.004);
  float col=sdTorus(q-vec3(0.,.026,0.),.011,.0025);
  float neck=sdCone(q-vec3(0.,.042,0.),.011,.0075,.016);
  float bulb=eD(q-vec3(0.,.074,0.),vec3(.017,.022,.017));
  float fin=length(q-vec3(0.,.1,0.))-.0065;
  return min(min(base,smin(fl,col,.003)),smin(smin(neck,bulb,.008),fin,.004)); }
float ts_seal(vec3 q){ if(q.y<.017){ if(q.y<.0015) return .25; return .62+.2*step(.8,fract(atan(q.z,q.x)*3.)); }
  if(q.y<.03) return .5; return .38+.14*grain(q.xzy,60.); }
float s_wax(vec3 q){ float bb=bnd(q,vec3(0.,.008,0.),vec3(.06,.01,.015)); if(bb>.2) return bb;
  float s=sdRBox(q-vec3(0.,.0065,0.),vec3(.05,.0065,.0065),.0022);
  float melt=length(q-vec3(.052,.0065,0.))-.0072; return smin(s,melt,.003); }
float ts_wax(vec3 q){ if(q.x>.047) return .15; if(fract(q.x/.012)<.04) return .2; return .3+.05*vn(q.xz*500.); }
float s_inkwell(vec3 q){ float bb=bnd(q,vec3(0.,.04,0.),vec3(.04,.045,.04)); if(bb>.2) return bb;
  float g=sdRBox(q-vec3(0.,.026,0.),vec3(.03,.026,.03),.007); g=max(g,-sdRBox(q-vec3(0.,.03,0.),vec3(.024,.028,.024),.005));
  float neck=sdCylY(q-vec3(0.,.057,0.),.014,.006)-.0015; neck=max(neck,-sdCylY(q-vec3(0.,.06,0.),.0095,.02));
  float ink=sdCylY(q-vec3(0.,.035,0.),.023,.001);
  return min(g,min(neck,ink)); }
float ts_inkwell(vec3 q){ if(q.y>.05) return .45; if(length(q.xz)<.012&&q.y<.04) return .1;
  float f=max(abs(q.x),abs(q.z)); if(f>.028&&q.y>.006&&q.y<.048){ float e=min(abs(q.x),abs(q.z)); if(e>.024) return .5; }
  return .82-.3*step(.8,fract((q.y+q.x*.3)/.012)); }
/* a quill: a straight shaft along its own axis with a curved feather vane */
vec3 quillF(vec3 q){ vec3 a=q-vec3(0.,.034,0.); a.xy=rot(.52)*a.xy; a.zy=rot(-.28)*a.zy; return a; }   /* the shaft runs along +y */
float s_quill(vec3 q){ float bb=bnd(q,vec3(-.07,.17,.04),vec3(.12,.17,.08)); if(bb>.2) return bb;
  vec3 a=quillF(q); float L=.27; float t=clamp(a.y,0.,L);
  float bend=.014*(t/L)*(t/L); vec3 b=a-vec3(bend,0.,0.);
  float shaft=length(b.xz)-mix(.0022,.0008,t/L); shaft=max(shaft,max(-a.y,a.y-L));
  float s=(t-.07)/(L-.07); float w=s<0.?-1.:.02*pow(sin(3.1416*min(s,1.)),.7)*(1.-.35*s);
  float off=.004*sin(s*3.)+.002;
  float vane=max(abs(b.z)-.0007-.0012*(1.-abs(b.x-off)/max(w,.001)),abs(b.x-off)-w); vane=max(vane,max(-a.y+.07,a.y-L));
  return min(shaft,vane*.7); }
float ts_quill(vec3 q){ vec3 a=quillF(q); float L=.27; float t=a.y; float bend=.014*(t/L)*(t/L); float x=a.x-bend;
  if(t<.07) return t<.012?.12:.7;
  if(abs(x-.002)<.0012) return .55;
  float br=fract((t*1.3-abs(x)*.9)/.0045); return br<.28?.5:.9; }

/* ================= u13: bound volumes, gavel on its block, folded newspaper ================= */
/* a thick bound volume lying flat, rounded spine toward -z, raised bands, panels on the spine */
float tome(vec3 q,vec3 h){ float pg=sdRBox(q-vec3(.003,0.,.004),vec3(h.x-.004,h.y-.004,h.z-.004),.001);
  float cv=min(sdRBox(q-vec3(0.,h.y-.0017,0.),vec3(h.x,.0017,h.z),.0012),sdRBox(q-vec3(0.,-h.y+.0017,0.),vec3(h.x,.0017,h.z),.0012));
  float sp=max(length(vec2(q.y,(q.z+h.z-h.y*.6)*1.2))-h.y,abs(q.x)-h.x); sp=max(sp,q.z+h.z-h.y*.6);
  float bands=1e3; for(int i=0;i<4;i++){ float x=-h.x*.62+float(i)*h.x*.413;
    bands=min(bands,max(length(vec2(q.y,(q.z+h.z-h.y*.6)*1.2))-h.y-.0022,abs(q.x-x)-.0035)); }
  bands=max(bands,q.z+h.z-h.y*.6);
  return min(min(pg,cv),min(sp,bands)); }
float ttome(vec3 q,vec3 h,float seed){
  if(q.z<-h.z+h.y*.6+.001){ /* spine */
    float x=q.x/h.x; if(abs(q.y)>h.y-.001) return .3;
    for(int i=0;i<4;i++){ float bx=-.62+float(i)*.413; if(abs(x-bx)<.04) return .22; }
    if(x>-.6&&x<-.21&&abs(q.y)<h.y*.55){ if(abs(q.y)<h.y*.12&&abs(x+.4)<.13) return .8; return .15; }   /* dark label, blank bar */
    if(x>.23&&x<.59&&abs(q.y)<h.y*.35) return .5;
    return .34+.06*vn(q.xy*300.); }
  if(abs(q.y)<h.y-.0034&&(q.x>h.x-.006||q.x<-h.x+.004||q.z>h.z-.006)) return fract(q.y/.0011)<.3?.72:.93;  /* page edges */
  if(q.y>h.y-.004){ vec2 u=q.xz; if(abs(max(abs(u.x)-h.x+.012,abs(u.y)-h.z+.012))<.0012) return .2; }
  return .36+.06*vn(q.xz*250.+seed); }
float s_tomes(vec3 q){ float bb=bnd(q,vec3(0.,.08,0.),vec3(.14,.09,.18)); if(bb>.2) return bb;
  vec3 a=q-vec3(0.,.026,0.); a.xz=rot(-.05)*a.xz;
  vec3 b=q-vec3(.008,.079,.004); b.xz=rot(.08)*b.xz;
  vec3 c=q-vec3(-.004,.126,.002); c.xz=rot(-.1)*c.xz;
  return min(tome(a,vec3(.11,.026,.152)),min(tome(b,vec3(.103,.027,.146)),tome(c,vec3(.096,.02,.14)))); }
float ts_tomes(vec3 q){
  if(q.y<.052){ vec3 a=q-vec3(0.,.026,0.); a.xz=rot(-.05)*a.xz; return ttome(a,vec3(.11,.026,.152),0.); }
  if(q.y<.106){ vec3 b=q-vec3(.008,.079,.004); b.xz=rot(.08)*b.xz; return ttome(b,vec3(.103,.027,.146),3.); }
  vec3 c=q-vec3(-.004,.126,.002); c.xz=rot(-.1)*c.xz; return ttome(c,vec3(.096,.02,.14),7.); }
float s_gavel(vec3 q){ float bb=bnd(q,vec3(.02,.04,-.06),vec3(.1,.05,.16)); if(bb>.2) return bb;
  float blk=sdCylY(q-vec3(0.,.012,0.),.066,.012)-.003; blk=max(blk,-sdTorus(q-vec3(0.,.024,0.),.066,.003));
  vec3 h=q-vec3(0.,.049,.0);
  float hd=sdCylX(h,.022,.048)-.003; hd=max(hd,-max(abs(abs(h.x)-.03)-.0022,-(length(h.yz)-.02)));
  float nk=max(length(h.yz)-.0245,abs(h.x)-.009);
  float hn=sdCapsule(q,vec3(.004,.048,-.02),vec3(.07,.022,-.205),.0075);
  float kn=length(q-vec3(.074,.021,-.217))-.012;
  return min(blk,min(min(hd,nk),min(hn,kn))); }
float ts_gavel(vec3 q){ if(q.y<.026&&length(q.xz)<.07) return .52+.18*grain(q,55.)*.6;
  vec3 h=q-vec3(0.,.049,.0); if(abs(h.x)<.052&&length(h.yz)<.027){ if(abs(abs(h.x)-.03)<.003) return .2; if(abs(h.x)>.049) return .55; return .4+.14*grain(h.zyx,70.); }
  return .45+.16*grain(q.zyx,90.); }
float s_paper(vec3 q){ float bb=bnd(q,vec3(0.,.008,0.),vec3(.11,.02,.14)); if(bb>.2) return bb;
  float c=.003*sin(q.z*18.+.4)+.0025*smoothstep(.05,.1,q.x);
  return slab(q-vec3(0.,c,0.),vec2(.1,.13),.0022,.003); }
float ts_paper(vec3 q){ vec2 u=q.xz; if(q.y<.0035+.003*sin(q.z*18.+.4)) return fract(q.y/.0009)<.35?.65:.9;
  if(u.y>.1&&u.y<.123&&abs(u.x)<.09){ return (abs(u.y-.1115)<.007&&fract((u.x+.09)/.012)<.78)?.2:.95; }
  if(abs(u.y-.095)<.0011&&abs(u.x)<.09) return .3; if(abs(u.y-.091)<.0006&&abs(u.x)<.09) return .5;
  if(u.x>-.09&&u.x<-.005&&u.y>.035&&u.y<.085){ if(abs(max(abs(u.x+.0475)-.0425,abs(u.y-.06)-.025))<.0012) return .3; return .62; }
  float col=fract((u.x+.09)/.06); if(col>.92) return .95;
  if(u.y>.035&&u.x<0.) return .95;
  if(u.y>.078&&u.y<.086&&u.x>0.) return .35;
  if(abs(u.x)<.09&&u.y>-.12&&u.y<.074&&fract(u.y/.0062)<.34) return .5; return .95; }

/* ================= u14: desk microphone, water pitcher, tumbler, blank nameplate ================= */
float s_mic(vec3 q){ float bb=bnd(q,vec3(.1,.13,.05),vec3(.2,.14,.12)); if(bb>.2) return bb;
  float base=sdCylY(q-vec3(0.,.008,0.),.062,.007)-.003; float dome=eD(q-vec3(0.,.016,0.),vec3(.04,.014,.04)); dome=max(dome,-q.y+.01);
  float rod=sdCapsule(q,vec3(0.,.02,0.),vec3(0.,.16,0.),.0055); float col=sdCylY(q-vec3(0.,.1,0.),.009,.006)-.001;
  vec3 m=q-vec3(0.,.205,0.); m.yz=rot(.22)*m.yz;
  float yoke=length(vec2(length(m.xy)-.047,m.z))-.004; yoke=max(yoke,m.y+.005);
  float yb=sdCapsule(q,vec3(0.,.16,0.),vec3(0.,.165,0.),.007);
  float body=eD(m,vec3(.034,.052,.03)); body=body-.002*step(.5,fract(m.y/.006))*step(abs(m.x),.03);
  float spine=sdRBox(m-vec3(0.,0.,-.026),vec3(.006,.048,.006),.003);
  float piv=sdCylX(m,.008,.05)-.001;
  /* cable across the table to the right */
  float cb=min(min(sdCapsule(q,vec3(.03,.005,.05),vec3(.12,.005,.09),.0045),sdCapsule(q,vec3(.12,.005,.09),vec3(.2,.005,.05),.0045)),sdCapsule(q,vec3(.2,.005,.05),vec3(.26,.005,.1),.0045));
  return min(min(min(base,dome),min(rod,col)),min(min(min(yoke,yb),min(body*.8,spine)),min(piv,cb))); }
float ts_mic(vec3 q){ if(q.y<.008) return .32; if(q.y<.032) return .5;
  vec3 m=q-vec3(0.,.205,0.); m.yz=rot(.22)*m.yz;
  if(q.y>.14&&length(m/vec3(.034,.052,.03))<1.1){ if(m.z<-.02&&abs(m.x)<.008) return .75; if(fract(m.y/.006)<.45) return .22; return .78; }
  return .62+.2*step(.75,fract(q.y*40.)); }
float pitR(float y){ float r=.041+.018*sin(3.1416*clamp((y-.005)/.17,0.,1.))*(1.-.2*y/.2); r+=.01*smoothstep(.165,.2,y); return r; }
float s_pitcher(vec3 q){ float bb=bnd(q,vec3(.01,.1,0.),vec3(.1,.11,.08)); if(bb>.2) return bb;
  float a=atan(q.z,q.x); float y=clamp(q.y,0.,.2);
  float sp=pow(max(cos(a-2.5),0.),10.)*.022*smoothstep(.13,.2,y);                 /* the spout, toward the back-left */
  float d=(length(q.xz)-pitR(y)-sp)*.7; float sh=max(abs(d)-.0025,max(-q.y,q.y-.2));
  sh=min(sh,max(d,max(-q.y,q.y-.006)));                                           /* solid bottom */
  float water=max(d,abs(q.y-.15)-.0005);
  vec3 h=q-vec3(.06,.105,0.); float ha=length(vec2(length(h.xy*vec2(1.,.8))-.045,h.z))-.0065; ha=max(ha,-h.x);
  return min(sh,min(water,ha)); }
float ts_pitcher(vec3 q){ if(q.y>.149&&q.y<.152&&length(q.xz)<pitR(.15)-.002) return .55;
  if(q.x>.06) return .55; if(q.y<.006) return .45; float a=atan(q.z,q.x);
  if(abs(q.y-.02)<.0015||abs(q.y-.185)<.0015) return .35;
  return .75+.2*step(.85,fract(a*1.2+.3)); }
float s_glass(vec3 q){ float bb=bnd(q,vec3(0.,.05,0.),vec3(.04,.055,.04)); if(bb>.2) return bb;
  float r=.028+.006*q.y/.1; float d=length(q.xz)-r; float sh=max(abs(d)-.0018,max(-q.y,q.y-.1));
  float bot=max(d,max(-q.y,q.y-.008)); float w=max(d,abs(q.y-.07)-.0005); return min(min(sh,bot),w); }
float ts_glass(vec3 q){ if(q.y>.068&&q.y<.072) return .5; float a=atan(q.z,q.x); if(q.y<.009) return .6;
  return fract(a*10./6.2832)<.06?.6:.9; }
float s_plate(vec3 q){ float bb=bnd(q,vec3(0.,.03,0.),vec3(.12,.04,.04)); if(bb>.2) return bb;
  vec2 n1=normalize(vec2(.028,.055)); float tri=max(max(-q.y,dot(vec2(q.y,-q.z),vec2(n1.y,n1.x))-.012),dot(vec2(q.y,q.z),vec2(n1.y,n1.x))-.012);
  tri=max(tri,q.y-.05);
  return max(tri,abs(q.x)-.11)-.0015; }
float ts_plate(vec3 q){ if(q.z<-.002&&q.y>.006&&q.y<.044&&abs(q.x)<.1){
    float s=q.y; if(abs(q.x)<.092&&s>.012&&s<.038){ if(abs(max(abs(q.x)-.088,abs(s-.025)-.011))<.0012) return .4; return .9; }
    return .45+.14*grain(q.zyx,40.); }
  return .42+.12*grain(q,50.); }

/* ================= u15: two open books on stands, a magnifying glass ================= */
float openbook(vec3 q){ float cover=sdRBox(q-vec3(0.,.002,0.),vec3(.133,.002,.093),.0012);
  float x=abs(q.x); float lift=.018*sin(clamp(x/.13,0.,1.)*1.8)-.009*exp(-x*70.);
  float pages=sdBox(vec3(x-.065,q.y-.005-lift*.5,q.z),vec3(.062,max(.003+lift*.5,.002),.086))-.001; return min(cover,pages*.9); }
float topenbook(vec3 q,float kind){ if(q.y<.0042) return .3; float x=abs(q.x); if(x<.003) return .45;
  vec2 u=vec2(x-.065,q.z); if(abs(u.x)>.0615||abs(u.y)>.0855) return fract(q.y/.0011)<.35?.7:.93;
  if(q.x<0.){ vec2 f=u-vec2(0.,.042+.004*kind); if(abs(max(abs(f.x)-.04,abs(f.y)-.026))<.0014) return .3;
    if(abs(f.x)<.04&&abs(f.y)<.026){ float c=length(f-vec2(.004*kind,.0))-.014; if(abs(c)<.0014) return .3; return fract((f.x+f.y)/.004)<.3?.6:.9; }
    if(hl(u,vec2(-.048,-.075),vec2(.048,.008),.0068,.32,2.+kind)>.5) return .5; }
  else { if(abs(u.y-.066)<.0045&&abs(u.x)<.03) return .35;
    if(hl(u,vec2(-.048,-.075),vec2(.048,.054),.0068,.32,6.+kind*3.)>.5) return .5; }
  return .95; }
vec3 bookF(vec3 q){ vec3 a=q-vec3(0.,.012,.03); a.yz=rot(-.42)*a.yz; return a; }
float s_bookstand(vec3 q){ float bb=bnd(q,vec3(0.,.05,0.),vec3(.16,.09,.12)); if(bb>.2) return bb;
  vec3 a=bookF(q); float board=sdRBox(a-vec3(0.,-.005,0.),vec3(.14,.004,.1),.002);
  float lip=sdRBox(a-vec3(0.,.006,-.1),vec3(.14,.009,.0045),.0015);
  vec3 s=q-vec3(0.,0.,.09); float leg=sdRBox(s-vec3(0.,.035,0.),vec3(.1,.035,.004),.002);
  leg=max(leg,a.y+.004);
  float foot=sdRBox(q-vec3(0.,.005,.02),vec3(.13,.005,.09),.002); foot=max(foot,-sdRBox(q-vec3(0.,.005,.02),vec3(.11,.01,.07),.002));
  return min(min(board,lip),min(leg,foot)); }
float ts_bookstand(vec3 q){ return .42+.18*grain(q.zyx,45.)*.7; }
float s_obook(vec3 q){ vec3 a=bookF(q); float bb=bnd(a,vec3(0.,.01,0.),vec3(.15,.03,.1)); if(bb>.2) return bb; return openbook(a); }
float ts_obook(vec3 q,float kind){ return topenbook(bookF(q),kind); }
float s_lens(vec3 q){ float bb=bnd(q,vec3(.06,.01,0.),vec3(.14,.02,.06)); if(bb>.2) return bb;
  vec3 c=q-vec3(0.,.012,0.); c.xy=rot(.08)*c.xy;
  float rim=sdTorus(c,.052,.0055); rim=min(rim,max(abs(length(c.xz)-.052)-.004,abs(c.y)-.0065));
  float lens=eD(c,vec3(.05,.004,.05));
  float fer=sdCylX(c-vec3(.068,0.,0.),.0085,.012)-.001; float hn=sdCapsule(c,vec3(.08,0.,0.),vec3(.18,-.006,0.),.0095);
  float end=length(c-vec3(.186,-.006,0.))-.011;
  return min(min(rim,lens),min(fer,min(hn,end))); }
float ts_lens(vec3 q){ vec3 c=q-vec3(0.,.012,0.); c.xy=rot(.08)*c.xy; float r=length(c.xz);
  if(r<.047) return .95-.3*step(.85,fract((c.x-c.z)*25.)); if(r<.059) return .5;
  if(c.x<.081) return .6+.25*step(.6,fract(c.x*400.)); return .38+.16*grain(c.zyx,40.); }

/* ================= u16: document box with files, folder, rubber stamp, paper clip ================= */
float s_docbox(vec3 q){ float bb=bnd(q,vec3(0.,.09,0.),vec3(.17,.1,.12)); if(bb>.2) return bb;
  vec3 h=vec3(.15,.065,.1); float o=sdRBox(q-vec3(0.,h.y,0.),h,.004);
  float i=sdBox(q-vec3(0.,h.y+.006,0.),h-vec3(.004,0.,.004));
  float box=max(o,-i);
  vec3 f=q-vec3(-.15,.1,0.); float hole=sdCapsule(f,vec3(0.,0.,-.022),vec3(0.,0.,.022),.009); box=max(box,-max(hole,abs(f.x)-.01));   /* hand hole */
  /* standing files inside, tabs at staggered places */
  float fl=1e3; for(int k=0;k<6;k++){ float z=-.08+float(k)*.03; float tx=-.11+mod(float(k)*.087,.2);
    vec3 p=q-vec3(0.,0.,z); p.yz=rot(-.06)*p.yz;
    float sh=sdRBox(p-vec3(0.,.07,0.),vec3(.142,.062,.004),.0015);
    float tab=sdRBox(p-vec3(tx,.135,0.),vec3(.025,.008,.004),.0025);
    fl=min(fl,min(sh,tab)); }
  return min(box,fl); }
float ts_docbox(vec3 q){ vec3 h=vec3(.15,.065,.1);
  if(q.z<-h.z+.001&&q.y<.128){ vec2 u=q.xy-vec2(.01,.07);          /* front: label holder with hint-lines */
    if(abs(max(abs(u.x)-.06,abs(u.y)-.025))<.0016) return .25;
    if(abs(u.x)<.06&&abs(u.y)<.025){ if(hl(u,vec2(-.045,-.014),vec2(.045,.015),.0085,.3,4.)>.5) return .45; return .95; }
    if(abs(q.y-.12)<.003) return .45; return .72+.05*vn(q.xy*400.); }
  if(q.x<-h.x+.001&&q.y<.128) return .66+.05*vn(q.zy*400.);
  if(q.y>.128&&max(abs(q.x)-h.x+.005,abs(q.z)-h.z+.005)>0.) return .6;
  float z=q.z+.08; float k=floor((z+.015)/.03); float tx=-.11+mod(k*.087,.2);
  if(q.y>.126&&abs(q.x-tx)<.022){ if(abs(q.y-.136)<.0015&&abs(q.x-tx)<.014) return .4; return .7; }
  return .78+.1*step(.5,fract(z/.03+.5)); }
float s_folder(vec3 q){ float bb=bnd(q,vec3(0.,.008,0.),vec3(.14,.02,.1)); if(bb>.2) return bb;
  float back=slab(q,vec2(.12,.085),.0009,.003); float tab=slab(q-vec3(-.05,0.,.093),vec2(.035,.01),.0009,.003);
  float pap=slab(q-vec3(.006,.0018,.004),vec2(.113,.083),.0007,.001);
  float front=slab(q-vec3(0.,.0032,-.004),vec2(.12,.081),.0009,.003);
  return min(min(back,tab),min(pap,front)); }
float ts_folder(vec3 q){ vec2 u=q.xz; if(q.y>.0045){ if(u.x<.09&&u.x>-.06&&abs(u.y-.035)<.022){ if(abs(max(abs(u.x-.015)-.075,abs(u.y-.035)-.022))<.0012) return .4;
      if(hl(u,vec2(-.05,.02),vec2(.08,.052),.0095,.3,8.)>.5) return .45; return .92; }
    return .72+.05*vn(u*300.); }
  if(u.y>.086){ if(abs(u.y-.093)<.0028&&u.x>-.075&&u.x<-.03) return .4; return .72; }
  if(q.y>.0022&&q.y<.0035) return .95; return .7; }
float s_rstamp(vec3 q){ float bb=bnd(q,vec3(0.,.04,0.),vec3(.04,.045,.03)); if(bb>.2) return bb;
  float pad=sdRBox(q-vec3(0.,.0025,0.),vec3(.03,.0025,.018),.001);
  float blk=sdRBox(q-vec3(0.,.012,0.),vec3(.032,.007,.02),.003);
  float neck=sdCone(q-vec3(0.,.03,0.),.012,.007,.012); float knob=eD(q-vec3(0.,.056,0.),vec3(.017,.015,.017));
  return min(min(pad,blk),smin(neck,knob,.006)); }
float ts_rstamp(vec3 q){ if(q.y<.005) return .2; if(q.y<.019) return .55+.15*grain(q,60.)*.6; return .4+.15*grain(q.xzy,50.); }
float s_clip(vec3 q){ vec2 p=q.xz; float bb=bnd(q,vec3(0.,.002,0.),vec3(.04,.006,.015)); if(bb>.2) return bb;
  float o1=abs(length(vec2(max(abs(p.x)-.018,0.),p.y))-.0065);
  vec2 p2=p-vec2(.003,0.); float o2=abs(length(vec2(max(abs(p2.x)-.014,0.),p2.y))-.0036);
  return length(vec2(min(o1,o2),q.y-.0012))-.0009; }
float ts_clip(vec3 q){ return .7; }

/* ================= u17: shortwave radio, headphones, notebook with checkmarks ================= */
float s_swradio(vec3 q){ float bb=bnd(q,vec3(-.02,.22,.02),vec3(.19,.23,.1)); if(bb>.2) return bb;
  vec3 h=vec3(.15,.095,.055); float b=sdRBox(q-vec3(0.,h.y,0.),h,.012);
  float win=sdRBox(q-vec3(.0,.14,-h.z),vec3(.12,.032,.004),.004); b=max(b,-win);        /* recessed dial window */
  float glass=sdBox(q-vec3(0.,.14,-h.z+.002),vec3(.12,.032,.001));
  float gr=sdRBox(q-vec3(-.07,.058,-h.z),vec3(.07,.042,.002),.006);                        /* speaker grille plate */
  float kn=1e3; for(int i=0;i<3;i++){ float x=.04+float(i)*.042; float r=i==2?.017:.012; kn=min(kn,sdCylZ(q-vec3(x,.06,-h.z-.007),r,.007)-.0015); }
  float hd=sdCapsule(q,vec3(-.09,.232,0.),vec3(.09,.232,0.),.009);
  float hp=min(sdCapsule(q,vec3(-.1,.19,0.),vec3(-.09,.232,0.),.008),sdCapsule(q,vec3(.1,.19,0.),vec3(.09,.232,0.),.008));
  vec3 a0=vec3(.12,.19,.03), a1=vec3(-.03,.44,.07); float an=1e3;
  for(int i=0;i<3;i++){ float t0=float(i)/3., t1=float(i+1)/3.; an=min(an,sdCapsule(q,mix(a0,a1,t0),mix(a0,a1,t1),.0042-.0011*float(i))); }
  an=min(an,length(q-a1)-.005); an=min(an,sdCylY(q-a0+vec3(0.,.005,0.),.008,.006));
  return min(min(min(b,glass),min(gr,kn)),min(min(hd,hp),an)); }
float ts_swradio(vec3 q){ vec3 h=vec3(.15,.095,.055);
  if(q.z<-h.z+.004){
    if(abs(q.y-.14)<.032&&abs(q.x)<.12){ vec2 u=q.xy-vec2(0.,.14);           /* dial: rows of ticks and a pointer */
      if(abs(u.x-.028)<.0012) return .1;
      for(int r=0;r<3;r++){ float y=.018-float(r)*.016; if(abs(u.y-y)<.0006&&abs(u.x)<.108) return .35;
        if(u.y>y&&u.y<y+.0045+.003*step(.8,fract(u.x/.02+.1))&&fract(u.x/.008+float(r)*.3)<.18&&abs(u.x)<.108) return .3; }
      return .92; }
    if(abs(q.x+.07)<.07&&abs(q.y-.058)<.042){ if(abs(max(abs(q.x+.07)-.066,abs(q.y-.058)-.038))<.0015) return .3; return fract(q.y/.0065)<.4?.25:.6; }
    if(q.x>.02&&q.y<.09&&q.z<-h.z-.002){ float cx=q.x<.061?.04:(q.x<.103?.082:.124); float a=atan(q.y-.06,q.x-cx); return fract(a*4.)<.4?.3:.55; } }
  if(q.y>.2) return .5+.25*step(.6,fract(q.y*120.));
  return .5+.1*grain(q.zyx,30.)*.6; }
float s_phones(vec3 q){ float bb=bnd(q,vec3(0.,.03,0.),vec3(.14,.05,.13)); if(bb>.2) return bb;
  vec3 b=q-vec3(0.,.012,.02); float band=length(vec2(length(b.xz*vec2(1.,1.25))-.085,b.y))-.0055; band=max(band,-b.z);
  float cups=1e3; for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 c=q-vec3(s*.085,.0,.012); c.xy=rot(s*.15)*c.xy;
    float cup=sdCylY(c-vec3(0.,.017,0.),.034,.011)-.004; float cush=sdTorus(c-vec3(0.,.031,0.),.026,.0065);
    float yoke=length(vec2(length(c.xz)-.039,c.y-.018))-.003; yoke=max(yoke,c.z);
    cups=min(cups,min(min(cup,cush),yoke)); }
  float cord=min(sdCapsule(q,vec3(.1,.006,-.01),vec3(.13,.004,-.07),.003),sdCapsule(q,vec3(.13,.004,-.07),vec3(.1,.004,-.13),.003));
  return min(band,min(cups,cord)); }
float ts_phones(vec3 q){ if(q.y>.025&&q.y<.04) return .25+.08*vn(q.xz*500.); if(q.y<.03&&q.z>.03) return .35+.25*step(.7,fract(q.x*90.)); return .42; }
float s_notebook(vec3 q){ float bb=bnd(q,vec3(0.,.01,0.),vec3(.13,.02,.11)); if(bb>.2) return bb;
  float cov=sdRBox(q-vec3(.0,.0015,0.),vec3(.112,.0015,.09),.001);
  float pg=sdRBox(q-vec3(.003,.0046,0.),vec3(.106,.0016,.086),.0008);
  float ci=clamp(floor((q.z+.084)/.0092+.5),0.,18.); vec3 r=q-vec3(-.106,.006,-.084+ci*.0092);
  float rings=length(vec2(length(r.xy)-.006,r.z))-.0011;
  return min(min(cov,pg),rings); }
float ts_notebook(vec3 q){ if(q.y<.0032) return .35; if(q.x<-.1) return q.y>.007?.2:.6;
  vec2 u=q.xz; if(abs(u.x+.07)<.0006) return .55;                                    /* margin */
  float row=floor((u.y+.08)/.013); float f=fract((u.y+.08)/.013);
  if(u.y>-.08&&u.y<.074){ if(f<.06&&u.x>-.1) return .7;
    vec2 c=vec2(u.x+.084,(f-.5)*.013);
    if(row<10.&&hs2(vec2(row,2.))<.8){ float ck=min(sdSeg2(c,vec2(-.004,.0),vec2(-.001,-.0035)),sdSeg2(c,vec2(-.001,-.0035),vec2(.005,.0045)));
      if(ck<.00075) return .12; }
    else if(abs(max(abs(c.x),abs(c.y))-.0032)<.0005) return .35;
    if(u.x>-.064&&u.x<.02+.07*hs2(vec2(row,5.))&&abs(f-.5)<.14) return .5; }
  return .95; }

/* ================= hub: skeleton key, sealed envelope, square, bow compass ================= */
float s_skey(vec3 q){ float bb=bnd(q,vec3(.02,.006,0.),vec3(.1,.012,.05)); if(bb>.2) return bb;
  float ring=sdTorus(q-vec3(-.035,.005,0.),.02,.0042);
  float lobes=1e3; for(int i=0;i<3;i++){ float a=2.094*float(i)+3.1416; vec2 c=vec2(-.035,0.)+.026*vec2(cos(a),sin(a));
    lobes=min(lobes,sdTorus(q-vec3(c.x,.005,c.y),.009,.003)); }
  float sh=sdCylX(q-vec3(.03,.005,0.),.0048,.045);
  float col=min(sdCylX(q-vec3(-.007,.005,0.),.0068,.004)-.001,sdCylX(q-vec3(.004,.005,0.),.006,.0025)-.001);
  float bit=sdRBox(q-vec3(.062,.005,.016),vec3(.011,.0035,.014),.001);
  bit=max(bit,-sdBox(q-vec3(.062,.005,.024),vec3(.0028,.01,.007))); bit=max(bit,-sdBox(q-vec3(.068,.005,.013),vec3(.0025,.01,.004)));
  return min(min(ring,lobes),min(min(sh,col),bit)); }
float ts_skey(vec3 q){ return .55+.25*step(.7,fract(q.x*60.+q.z*30.)); }
float s_envelope(vec3 q){ float bb=bnd(q,vec3(0.,.006,0.),vec3(.12,.015,.08)); if(bb>.2) return bb;
  float body=sdRBox(q-vec3(0.,.002,0.),vec3(.1,.002,.063),.001);
  vec2 f=q.xz-vec2(0.,.063); /* flap: a triangle pointing down the envelope */
  float flap=max(-f.y-.052+abs(f.x)*.52,max(f.y,max(abs(f.x)-.099,abs(q.y-.0045)-.0006)));
  vec2 s=q.xz-vec2(0.,.011); float rr=.017+.0018*sin(atan(s.y,s.x)*7.)+.001*sin(atan(s.y,s.x)*13.);
  float seal=max(length(s)-rr,abs(q.y-.0065)-.0022)-.0008;
  seal=max(seal,-max(abs(length(s)-.0105)-.0009,.0086-q.y));
  return min(body,min(flap,seal)); }
float ts_envelope(vec3 q){ vec2 s=q.xz-vec2(0.,.011); float r=length(s);
  if(r<.021&&q.y>.0048){ if(abs(r-.0105)<.0012) return .12; if(r<.005) return .18; return .26; }
  if(q.y>.004){ vec2 f=q.xz-vec2(0.,.063); if(abs(-f.y-.052+abs(f.x)*.52)<.0015) return .45; return .9; }
  if(q.y<.004&&q.y>.0005) return .7;
  vec2 u=q.xz; if(abs(abs(u.x)-(u.y+.063)*1.59)<.0012&&u.y<-.02) return .6; return .9; }
float s_square(vec3 q){ float bb=bnd(q,vec3(.06,.002,.05),vec3(.18,.01,.14)); if(bb>.2) return bb;
  float a=sdRBox(q-vec3(.07,.00125,0.),vec3(.16,.00125,.0125),.0006);
  float b=sdRBox(q-vec3(-.078,.00125,.1),vec3(.0125,.00125,.1),.0006);
  return min(a,b); }
float ts_square(vec3 q){ vec2 u=q.xz; float t=.8;
  if(abs(u.y)<.0125&&u.x>-.09){ float f=fract(u.x/.008); if(u.y>.006&&f<.14) t=.25; if(u.y>.0&&fract(u.x/.04)<.03) t=.25; if(u.y<-.009&&f<.14) t=.35; }
  else if(abs(u.x+.078)<.0125){ float f=fract(u.y/.008); if(u.x>-.072&&f<.14) t=.25; if(u.x>-.078&&fract(u.y/.04)<.03) t=.25; }
  return t; }
float s_compass(vec3 q){ float bb=bnd(q,vec3(0.,.11,0.),vec3(.1,.12,.04)); if(bb>.2) return bb;
  vec3 hd=vec3(0.,.19,0.); float head=sdCylZ(q-hd,.013,.005)-.0015;
  float hn=sdCylY(q-vec3(0.,.212,0.),.0045,.014)-.0005; float kn=sdCylY(q-vec3(0.,.228,0.),.007,.006)-.001;
  vec3 fl=vec3(-.068,.0,-.004), fr=vec3(.066,.0,.004);
  float l1=sdCapsule(q,hd+vec3(-.006,-.006,0.),fl+vec3(0.,.02,0.),.0045);
  float nd=sdCapsule(q,fl+vec3(0.,.02,0.),fl+vec3(0.,.001,0.),.0012);
  float l2=sdCapsule(q,hd+vec3(.006,-.006,0.),fr+vec3(-.004,.03,0.),.0045);
  float hold=sdCapsule(q,fr+vec3(-.004,.03,0.),fr+vec3(-.001,.01,0.),.0042);
  float lead=sdCapsule(q,fr+vec3(-.001,.01,0.),fr+vec3(0.,.001,0.),.0018);
  float bow=sdCapsule(q,vec3(-.032,.1,0.),vec3(.03,.1,0.),.0018); float nut=sdCylX(q-vec3(0.,.1,0.),.009,.0028)-.001;
  return min(min(min(head,hn),min(kn,l1)),min(min(nd,l2),min(min(hold,lead),min(bow,nut)))); }
float ts_compass(vec3 q){ if(q.y>.22) return fract(atan(q.z,q.x)*4.)<.4?.3:.6; if(q.y<.022) return q.x>0.?.2:.45;
  if(abs(q.y-.1)<.01&&abs(q.x)<.01) return fract(atan(q.z,q.y-.1)*3.)<.4?.35:.6; return .72+.2*step(.75,fract(q.y*50.)); }
