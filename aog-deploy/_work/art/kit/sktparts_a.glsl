/* AOG render kit — sktparts_a.glsl: objects for the Skateboarding course pencil still lifes (batch sktA).
   Objects only, no people, no logos. Every object rests on y=0 in its own frame, front toward -z,
   long axis along x, sizes in metres. sk_<name>D is a distance, sk_<name>T a grey tone (0 dark .. 1 paper).
   Include after lib.glsl and studio.glsl. All names carry the sk_ prefix so this file sits beside sptmar.glsl. */
vec3 sk_place(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return q; }
float sk_rr2(vec2 p,vec2 b,float r){ vec2 d=abs(p)-b+r; return length(max(d,0.))+min(max(d.x,d.y),0.)-r; }
float sk_ext(float d2,float dy,float r){ vec2 w=vec2(d2+r,dy+r); return min(max(w.x,w.y),0.)+length(max(w,0.))-r; }
float sk_eD(vec3 p,vec3 r){ float k0=length(p/r); float k1=length(p/(r*r)); return k0*(k0-1.)/k1; }

/* ================= the skateboard: 0.80 m popsicle deck, two trucks, four wheels ================= */
#define SK_TX .205      /* truck centres at x = +-SK_TX */
#define SK_WZ .094      /* wheel centres at z = +-SK_WZ */
#define SK_WR .027      /* wheel radius */
float sk_deckH(float x){ float t=max(abs(x)-.25,0.); return .08+.36*(sqrt(t*t+.0009)-.03); }
float sk_deckD(vec3 q){
  float h=sk_deckH(q.x)+.008*q.z*q.z/.01;                       /* kicktails and a little concave */
  float dy=(abs(q.y-h-.006)-.006)*.9;
  float d2=length(vec2(max(abs(q.x)-.3,0.),q.z))-.1;            /* round nose and tail */
  return sk_ext(d2,dy,.0028); }
float sk_truck1(vec3 q){                                         /* one truck, q relative to its centre x */
  float base=sdRBox(q-vec3(0.,.0755,0.),vec3(.032,.0035,.034),.002);
  float riser=sdRBox(q-vec3(-.004,.066,0.),vec3(.02,.007,.018),.004);
  float bush=sdCylY(q-vec3(.006,.056,0.),.0105,.007)-.002;
  float king=sdCylY(q-vec3(.006,.058,0.),.0035,.017);
  float nut=sdCylY(q-vec3(.006,.044,0.),.0055,.003)-.0008;
  vec3 h=q-vec3(.0,.037,0.); float hz=clamp(abs(h.z)/.07,0.,1.);
  float hang=sdRBox(h,vec3(.011,mix(.0115,.0065,hz),.07),.005);
  float hb=sdRBox(q-vec3(0.,.047,0.),vec3(.009,.008,.022),.006);
  float axle=sdCylZ(q-vec3(0.,SK_WR,0.),.0038,.118);
  float an=sdCylZ(vec3(q.x,q.y-SK_WR,abs(q.z)-.116),.0055,.003)-.0006;
  return min(min(min(base,riser),min(bush,king)),min(min(nut,hang),min(min(hb,axle),an))); }
float sk_trucksD(vec3 q){ vec3 a=q; a.x=abs(a.x)-SK_TX; a.x*=sign(q.x); return sk_truck1(a); }
float sk_wheel1(vec3 w){                                         /* w relative to the wheel centre, axle along z, outer face +z */
  float d=sdCylZ(w,SK_WR-.0065,.0095)-.0065;
  float rec=sdCylZ(w-vec3(0.,0.,.016),.0115,.0035);
  return max(d,-rec); }
float sk_wheelsD(vec3 q){ vec3 w=vec3(abs(q.x)-SK_TX,q.y-SK_WR,abs(q.z)-SK_WZ); return sk_wheel1(w); }
float sk_deckT(vec3 q){
  float h=sk_deckH(q.x)+.008*q.z*q.z/.01;
  float top=q.y-h-.012;
  if(top>-.0018){                                                /* grip tape, with the four bolt heads over each truck */
    vec2 b=vec2(abs(abs(q.x)-SK_TX)-.019,abs(q.z)-.021);
    if(length(b)<.0042) return length(b)<.0026?.85:.55;
    return .3+.06*step(.6,vn(q.xz*900.)); }
  if(top>-.0105){ return fract(q.y/.0017)<.38?.5:.82; }          /* edge: the maple plies */
  return .8-.08*grain(q*vec3(1.,1.,1.),30.)*.6; }               /* bare underside */
float sk_trucksT(vec3 q){ vec3 a=q; a.x=abs(a.x)-SK_TX;
  if(q.y>.072) return .48;
  if(length(vec2(a.x-.006,q.z))<.013&&q.y>.048&&q.y<.064) return .3;      /* bushing */
  if(abs(q.z)>.112) return .4;                                               /* axle nuts */
  return .64+.12*step(.5,fract(q.y*120.))*step(abs(q.z),.06); }
float sk_wheelsT(vec3 q){ vec3 w=vec3(abs(q.x)-SK_TX,q.y-SK_WR,abs(q.z)-SK_WZ);
  float r=length(w.xy); if(w.z>.012&&r<.0125) return r<.006?.3:.55;
  if(w.z>.014&&r<.016) return .6; return .9; }

/* ================= a loose urethane wheel standing on its edge (axle along z) ================= */
float sk_looseWheelD(vec3 q){ vec3 w=q-vec3(0.,SK_WR,0.);
  float d=sk_wheel1(w); float bear=sdCylZ(w,.0105,.0115)-.0005; d=min(max(d,-sdCylZ(w,.0045,.03)),max(bear,-sdCylZ(w,.0045,.03)));
  return d; }
float sk_looseWheelT(vec3 q){ vec3 w=q-vec3(0.,SK_WR,0.); float r=length(w.xy);
  if(r<.0115&&abs(w.z)<.012) return r<.007?.25:.5; if(r<.016&&abs(w.z)>.013) return .62; return .9; }

/* ================= skate helmet: round shell with vents, padding rim and a chin strap ================= */
float sk_helmetD(vec3 q){
  vec3 c=q-vec3(0.,.0,.0);
  float sh=sk_eD(c,vec3(.108,.125,.13)); sh=abs(sh)-.009; sh=max(sh,-c.y+.012*(1.+c.z/.13)); /* lower at the back */
  float rim=sdTorus(vec3(c.x,c.y-.012,c.z*.83),.105,.009);
  sh=min(sh,max(rim,-c.y));
  for(int i=0;i<7;i++){                                          /* round vents on the crown */
    float az=-1.5708+(float(i)-3.)*.55; float el=(i==3)?1.2:.78;
    if(i==1||i==5) el=1.05;
    vec3 v=normalize(vec3(cos(el)*cos(az),sin(el),cos(el)*sin(az)));
    float t=dot(c,v); float l=length(c-v*t)-.011;
    sh=max(sh,-max(l,.06-t)); }
  return sh; }
float sk_strapD(vec3 q){                                         /* two strap ends falling to the table and a buckle */
  float s=sdCapsule(vec3(abs(q.x),q.y,q.z),vec3(.096,.035,.01),vec3(.07,.004,-.11),.0035);
  float s2=sdCapsule(q,vec3(-.07,.004,-.11),vec3(.07,.004,-.115),.0035);
  float b=sdRBox(q-vec3(.035,.006,-.114),vec3(.014,.005,.009),.002);
  return min(min(s,s2),b); }
float sk_helmetT(vec3 q){ vec3 c=q;
  if(c.y<.024) return .32;                                       /* foam rim */
  float a=atan(c.x,-c.z); if(abs(a)<.015&&c.y>.05) return .35;  /* a moulded seam over the crown */
  return .55+.05*vn(c.xy*260.); }
float sk_strapT(vec3 q){ if(abs(q.x-.035)<.016&&q.z<-.104) return .7; return .3; }

/* ================= knee pad (or a smaller elbow pad): curved sleeve, hard cap, two straps ================= */
float sk_padD(vec3 q,float s){ q/=s;
  vec2 c=vec2(q.y,q.z); float r=length(c);
  float arch=max(abs(r-.055)-.016,-q.y); arch=sk_ext(arch,abs(q.x)-.085,.006);
  float cap=sk_eD(q-vec3(0.,.062,-.005),vec3(.06,.026,.055));
  float band=max(abs(r-.056)-.0195,abs(abs(q.x)-.062)-.008); band=max(band,-q.y);
  return min(smin(arch,cap,.008),band)*s; }
float sk_padT(vec3 q,float s){ q/=s; vec2 c=vec2(q.y,q.z); float r=length(c);
  if(abs(abs(q.x)-.062)<.008&&r>.073) return .25;               /* straps */
  float e=length((q-vec3(0.,.062,-.005))/vec3(.06,.026,.055));
  if(e<1.08){ if(abs(e-.72)<.04) return .3; return .45; }        /* hard cap with a moulded ring */
  if(q.y<.006) return .4; return .74+.06*vn(q.xz*500.); }

/* ================= sneaker (toe toward +x) ================= */
float sk_sole2(vec2 u){ return smin(length(u-vec2(-.085,0.))-.04,length((u-vec2(.06,.004))*vec2(1.,1.04))-.049,.07); }
float sk_shoeSoleD(vec3 q){ float d2=sk_sole2(q.xz); return sk_ext(d2,abs(q.y-.0135)-.0135,.005); }
float sk_shoeUpperD(vec3 q){
  float u=sk_eD(q-vec3(-.03,.022,0.),vec3(.125,.078,.046));
  float toe=sk_eD(q-vec3(.072,.022,.002),vec3(.072,.04,.046));
  float d=smin(u,toe,.03); d=max(d,.024-q.y);
  d=max(d,sk_sole2(q.xz)-.001);
  float open=sk_eD(q-vec3(-.075,.11,0.),vec3(.058,.03,.034)); d=max(d,-open);
  float tongue=sdRBox(q-vec3(-.008,.088,0.),vec3(.03,.006,.021),.005); tongue=max(tongue,sk_eD(q-vec3(-.02,.05,0.),vec3(.06,.05,.03)));
  return min(d,tongue); }
float sk_shoeSoleT(vec3 q){ if(q.y>.025) return .85; if(abs(q.y-.012)<.0016) return .4; if(q.y<.004) return .55; return .9; }
float sk_shoeUpperT(vec3 q){
  if(q.y<.044&&q.x>.085) return .88;                             /* toe cap */
  if(q.y<.036&&q.x<.085) return .84;                             /* foxing band */
  if(q.x>-.045&&q.x<.055&&abs(q.z)<.026&&q.y>.06){              /* laces crossing over the tongue */
    float f=fract((q.x+.045)/.02); float l=abs(abs(q.z)-.026*abs(2.*f-1.));
    if(abs(abs(q.z)-.024)<.003&&abs(f-.5)>.4) return .2;
    if(l<.0022) return .25; return .78; }
  if(q.x<-.08&&q.y>.07) return .4;                               /* heel collar */
  return .56+.05*vn(q.xy*300.); }

/* ================= vintage strap-on roller skate: steel plate, toe clamps, heel cup, steel wheels ================= */
float sk_rskateD(vec3 q){
  float plate=sdRBox(q-vec3(0.,.042,0.),vec3(.12,.0035,.038),.003);
  float plate2=sdRBox(q-vec3(-.04,.0465,0.),vec3(.07,.0015,.03),.0012);
  float cup=max(abs(length(q.xz-vec2(-.085,0.))-.04)-.0022,abs(q.y-.058)-.013); cup=max(cup,q.x+.085);
  cup=min(cup,sdRBox(vec3(q.x+.06,q.y-.058,abs(q.z)-.04),vec3(.025,.013,.0022),.0015));
  float jaw=sdRBox(vec3(q.x-.085,q.y-.058,abs(q.z)-.04),vec3(.016,.013,.0025),.0018);
  float screw=sdCylZ(q-vec3(.085,.051,0.),.0035,.04);
  float key=sdCylX(q-vec3(.102,.051,0.),.0055,.004)-.001;
  float tr=sdRBox(vec3(abs(q.x)-.085,q.y-.031,q.z),vec3(.013,.008,.014),.004);
  float ax=sdCylZ(vec3(abs(q.x)-.085,q.y-.02,q.z),.0032,.05);
  return min(min(min(plate,plate2),min(cup,jaw)),min(min(screw,key),min(tr,ax))); }
float sk_rskateWheelsD(vec3 q){ vec3 w=vec3(abs(q.x)-.085,q.y-.02,abs(q.z)-.046);
  float d=sdCylZ(w,.018,.0055)-.002; float hub=sdCylZ(w,.006,.009); return min(max(d,-max(sdCylZ(w-vec3(0.,0.,.0075),.012,.002),-hub)),hub); }
float sk_rskateStrapD(vec3 q){ vec2 c=vec2(q.y-.046,q.z); float d=max(abs(length(c)-.044)-.0022,abs(q.x+.052)-.011); d=max(d,-(q.y-.05));
  float buck=sdRBox(vec3(q.x+.052,q.y-.075,q.z-.03),vec3(.012,.006,.004),.002); return min(d,buck); }
float sk_rskateT(vec3 q){
  if(q.y>.039&&q.y<.0485&&abs(q.z)<.04){ if(abs(q.x+.11)<.002||abs(q.x-.03)<.0015) return .3;
    if(length(vec2(abs(q.x+.04)-.05,q.z))<.004) return .35; return .7; }
  if(q.x>.095) return .45;
  return .6+.1*step(.5,fract(q.y*150.)); }
float sk_rskateWheelsT(vec3 q){ vec3 w=vec3(abs(q.x)-.085,q.y-.02,abs(q.z)-.046); float r=length(w.xy);
  if(r<.006) return .35; if(r<.0125&&w.z>.004) return .55+.25*step(.5,fract(atan(w.y,w.x)*4./3.14159)); return .72; }
float sk_rskateStrapT(vec3 q){ if(q.y>.066&&q.z>.024) return .7; if(abs(abs(q.x+.052)-.008)<.0012) return .25; return .32; }

/* ================= a narrow clay-and-steel wheel and a plank ================= */
float sk_clayWheelD(vec3 q){ vec3 w=q-vec3(0.,.02,0.); float d=sdCylZ(w,.018,.006)-.002; float hub=sdCylZ(w,.007,.01)-.001; return min(d,hub); }
float sk_clayWheelT(vec3 q){ vec3 w=q-vec3(0.,.02,0.); float r=length(w.xy); if(r<.0085) return .35; if(abs(r-.014)<.0012) return .4; return .62+.12*vn(w.xy*700.); }
float sk_plankD(vec3 q){ return sdRBox(q-vec3(0.,.011,0.),vec3(.3,.011,.048),.004)+.0012*vn(q.xz*90.); }
float sk_plankT(vec3 q){ if(q.y>.02){ vec2 n=vec2(abs(q.x)-.24,abs(q.z)-.028); if(length(n)<.004) return .2; }
  if(abs(q.x)>.296) return fract(length(q.yz-vec2(.0,-.08))/.006)<.3?.45:.7;
  return .66+.18*(grain(q,70.)-.5); }
