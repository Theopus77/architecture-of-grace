/* AOG render kit — hubparts.glsl: objects for the course-hub pencil drawings (bible, hebrew
   bible, quran, talmud, buddhist, chinese classics, hindu texts, science, sound/rhythm).
   Include after selparts.glsl. Objects only: no figures, no real script (hint-lines only). */

/* ---- clay oil lamp: spout on +x, handle loop on -x; flame drawn separately (lampFlame) ---- */
float oilLamp(vec3 q,float s){
  float body=sdEll(q-vec3(0.,.02*s,0.),vec3(.05,.021,.04)*s);
  float sp=sdCapsule(q,vec3(.02*s,.021*s,0.),vec3(.078*s,.027*s,0.),.012*s);
  body=smin(body,sp,.012*s);
  body=max(body,-sdCylY(q-vec3(-.006*s,.045*s,0.),.011*s,.012*s));
  body=max(body,-sdCylY(q-vec3(.078*s,.04*s,0.),.004*s,.01*s));
  body=min(body,sdCylY(q-vec3(0.,.003*s,0.),.026*s,.003*s)-.001);
  vec3 h=q-vec3(-.05*s,.026*s,0.); float hd=length(vec2(length(h.xy)-.013*s,h.z))-.0045*s;
  return min(body,max(hd,h.x)); }
float oilLampT(vec3 q,float s){
  float r=length((q.xz-vec2(-.006*s,0.))/s);
  if(q.y>.03*s&&abs(r-.02)<.0025) return .35;            /* a pressed ring round the fill hole */
  return .5; }
float lampFlame(vec3 q,float s){ return sdEll(q-vec3(.08*s,.05*s,0.),vec3(.006,.017,.006)*s); }

/* ---- a flat ribbon from a to b, w half width (across x), t half thickness ---- */
float ribbon(vec3 p,vec3 a,vec3 b,float w,float t){   /* a, b share x; the strip is 2w wide in x */
  float dyz=sdSeg2(p.yz,a.yz,b.yz)-t; float dx=abs(p.x-a.x)-w;
  return length(max(vec2(dx,dyz),0.))+min(max(dx,dyz),0.); }

/* ---- a scroll lying flat: two rollers along z at x=±X, open sheet between ---- */
float roller(vec3 q,float L,float R){
  float rol=sdCylZ(q,R,L)-.001;
  float rod=sdCylZ(q,.006,L+.03);
  vec3 e=q; e.z=abs(e.z)-L-.012;
  float disc=sdCylZ(e,R+.012,.0035)-.0015;
  vec3 k=q; k.z=abs(k.z)-L-.042;
  float knob=sdEll(k,vec3(.011,.011,.016));
  return min(min(rol,rod),min(disc,knob)); }
float scrollD(vec3 q,float X,float L,float R){
  vec3 a=q-vec3(-X,R+.013,0.), b=q-vec3(X,R+.013,0.);
  float sheet=sdRBox(q-vec3(0.,.012+.004*cos(q.x/X*1.57),0.),vec3(X,.0012,L-.004),.0008);
  return min(min(roller(a,L,R),roller(b,L,R)),sheet); }
float scrollT(vec3 q,float X,float L,float R){
  if(abs(abs(q.x)-X)<R+.002&&abs(q.z)<L) return fract(atan(q.y-R-.013,abs(q.x)-X)*4.)<.08?.7:.9;
  if(abs(abs(q.x)-X)<R+.02) return .45;                  /* wooden rollers, discs and knobs */
  if(abs(q.x)<X-R-.012&&abs(q.z)<L-.02){                 /* three columns of hint-lines */
    float c=(q.x+X-R-.012)/(2.*(X-R-.012))*3.; float cf=fract(c);
    if(cf>.1&&cf<.9){ float l=fract((q.z+L)/.009); if(l<.22&&h1(vec2(floor(c),floor((q.z+L)/.009)))>.08) return .62; }
  }
  return .93; }

/* ---- rehal: an X-shaped folding wooden book stand; book open on the V ---- */
#define RH_T .55
float rehalBoard(vec3 q,float L,float hc){
  vec3 b=q-vec3(0.,hc,0.); b.xy=rot(RH_T)*b.xy;             /* board runs along local x */
  float d=sdRBox(b,vec3(L,.005,.07),.003);
  vec3 c=b-vec3(-L*.62,0.,0.); float arch=sdRBox(c,vec3(L*.28,.02,.035),.02);  /* cut-out in the legs */
  return max(d,-arch); }
float rehal(vec3 q,float L){ float hc=L*sin(RH_T);
  return min(rehalBoard(q,L,hc),rehalBoard(vec3(-q.x,q.y,q.z),L,hc)); }
vec3 rehalLocal(vec3 q,float L){ float hc=L*sin(RH_T);
  vec3 b=vec3(abs(q.x),q.y-hc,q.z); b.xy=rot(RH_T)*b.xy; return b; }
float rehalT(vec3 q,float L){ vec3 b=q-vec3(0.,L*sin(RH_T),0.);
  float ang=atan(b.y,b.x); return .42+.08*sin(q.z*60.+fbm(q.xz*30.)*3.); }
float rehalBook(vec3 q,float L,float w,float dd){
  vec3 b=rehalLocal(q,L);
  float pages=sdRBox(b-vec3(w,.005+.009,0.),vec3(w,.008,dd-.004),.002);
  float cover=sdRBox(b-vec3(w+.002,.0065,0.),vec3(w+.006,.0018,dd),.0012);
  return min(pages,cover); }
float rehalBookT(vec3 q,float L,float w,float dd){
  vec3 b=rehalLocal(q,L); vec2 u=vec2(b.x-w,b.z);
  if(b.y<.0145) return fract(b.y/.0022)<.3?.7:.9;         /* page edges */
  float fr=max(abs(u.x)/(w-.012),abs(u.y)/(dd-.014));    /* ornamental frame: double rule and corner leaves */
  if(abs(fr-1.)<.035||abs(fr-.93)<.02) return .45;
  if(fr<.9){ float l=fract((u.y+dd)/.011); if(l<.2&&abs(u.x)<w-.03) return .64; }
  return .95; }

/* ---- palm-leaf manuscript: leaves between two wooden boards, a cord round it (long along x) ---- */
float palm(vec3 q,vec3 h){
  float lv=sdRBox(q-vec3(0.,h.y,0.),vec3(h.x-.006,h.y-.007,h.z-.003),.006);
  float c1=sdRBox(q-vec3(0.,.004,0.),vec3(h.x,.004,h.z),.004);
  float c2=sdRBox(q-vec3(0.,2.*h.y-.004,0.),vec3(h.x,.004,h.z),.004);
  vec3 c=q-vec3(0.,h.y,0.); c.x=abs(c.x)-h.x*.42;
  float cord=length(vec2(sdB2(c.yz,vec2(h.y+.001,h.z+.001)),c.x))-.0022;
  return min(min(lv,min(c1,c2)),cord); }
float palmT(vec3 q,vec3 h){
  vec3 c=q-vec3(0.,h.y,0.); if(abs(abs(c.x)-h.x*.42)<.004) return .3;
  if(q.y<.0085||q.y>2.*h.y-.0085) return .42+.06*sin(q.x*140.+fbm(q.xz*40.)*4.);   /* wooden boards */
  return fract(q.y/.0016)<.3?.62:.86; }                    /* the stacked leaf edges */

/* ---- small hand bell: flared bell, collar and a turned handle ---- */
float bell(vec3 q,float s){
  float r=length(q.xz); float y=q.y/s;
  float prof=(.021+.026*pow(clamp(1.-y/.072,0.,1.),2.4))*s;
  float shell=max(r-prof,max(-q.y,q.y-.072*s));
  float dome=sdEll(q-vec3(0.,.07*s,0.),vec3(.018,.012,.018)*s);
  float col=sdCylY(q-vec3(0.,.085*s,0.),.009*s,.006*s)-.001;
  float hd=sdCapsule(q,vec3(0.,.09*s,0.),vec3(0.,.13*s,0.),.006*s);
  float kn=sdEll(q-vec3(0.,.138*s,0.),vec3(.011,.013,.011)*s);
  float lip=sdTorus(q-vec3(0.,.003*s,0.),.045*s,.003*s);
  return min(min(min(smin(shell,dome,.006*s),lip),col),min(hd,kn)); }
float bellT(vec3 q,float s){ float y=q.y/s;
  if(abs(y-.012)<.0025||abs(y-.058)<.002) return .3;       /* two turned bands */
  if(y>.08) return .4; return .55; }

/* ---- brass pedestal lamp: foot, stem with knops, a shallow oil bowl and a wick ---- */
float brassLamp(vec3 q,float s){
  float foot=sdCone(q-vec3(0.,.012*s,0.),.06*s,.03*s,.012*s)-.002;
  float stem=sdCylY(q-vec3(0.,.08*s,0.),.009*s,.07*s);
  float k1=sdEll(q-vec3(0.,.05*s,0.),vec3(.022,.012,.022)*s);
  float k2=sdEll(q-vec3(0.,.11*s,0.),vec3(.017,.009,.017)*s);
  vec3 b=q-vec3(0.,.165*s,0.);
  float bowl=max(sdEll(b,vec3(.07,.03,.07)*s),b.y-.01*s);
  bowl=max(bowl,-sdEll(b-vec3(0.,.012*s,0.),vec3(.062,.026,.062)*s));
  float rim=sdTorus(b-vec3(0.,.01*s,0.),.066*s,.004*s);
  vec3 sp=b-vec3(.062*s,.008*s,0.); float lip=sdEll(sp,vec3(.018,.006,.012)*s);
  return min(min(min(foot,stem),min(k1,k2)),min(min(bowl,rim),lip)); }
float brassLampT(vec3 q,float s){ float y=q.y/s;
  if(abs(y-.024)<.002||abs(y-.14)<.002) return .3; return .5; }
float brassFlame(vec3 q,float s){ return sdEll(q-vec3(.07*s,.19*s,0.),vec3(.006,.018,.006)*s); }

/* ---- bamboo slips bound with two cords, the far end rolled up (slips run along z) ---- */
float slips(vec3 q,float n,float w,float L){
  float W=n*w*.5;
  vec3 c=q; float i=clamp(floor((c.x+W)/w),0.,n-1.); c.x-= -W+(i+.5)*w;
  float flat_=sdRBox(c-vec3(0.,.003,0.),vec3(w*.5-.0008,.0025,L),.0015);
  vec3 r=q-vec3(W+.026,.028,0.);
  float roll=sdCylZ(r,.028,L)-.001;
  float cords=1e3; for(int k=-1;k<=1;k+=2){ vec3 e=q-vec3(0.,.0062,float(k)*L*.55);
    cords=min(cords,sdCapsule(e,vec3(-W-.004,0.,0.),vec3(W+.01,0.,0.),.0016)); }
  return min(min(flat_,roll),cords); }
float slipsT(vec3 q,float n,float w,float L){
  float W=n*w*.5;
  if(q.x>W+.002){ vec3 r=q-vec3(W+.026,.028,0.); return fract(atan(r.y,r.x)*16./6.2832)<.12?.45:.78; }
  if(abs(abs(q.z)-L*.55)<.0028&&q.y>.004) return .3;         /* the cords */
  float cx=fract((q.x+W)/w);
  if(cx<.07||cx>.93) return .45;                               /* the gaps between slips */
  if(abs(cx-.5)<.16&&abs(q.z)<L-.015){ float l=fract((q.z+L)/.013);   /* hint marks, never characters */
    if(l<.35&&h1(vec2(floor((q.x+W)/w),floor((q.z+L)/.013)))>.25) return .5; }
  return .8; }

/* ---- ink stone: a smooth slab with a well, and an ink stick lying on it ---- */
float inkStone(vec3 q,vec3 h){
  float s=sdRBox(q-vec3(0.,h.y,0.),h,.008);
  float face=sdRBox(q-vec3(0.,2.*h.y,.008),vec3(h.x-.012,.003,h.z-.02),.01);
  float well=sdRBox(q-vec3(0.,2.*h.y,-h.z+.016),vec3(h.x-.014,.005,.008),.007);
  return max(s,-min(face,well)); }
float inkStoneT(vec3 q,vec3 h){ if(q.y>2.*h.y-.004&&abs(q.x)<h.x-.012) return .22; return .4; }

/* ---- snare drum: shell, two hoops, lugs and a pale head ---- */
float drum(vec3 q,float r,float h){
  float sh=sdCylY(q-vec3(0.,h,0.),r,h)-.002;
  float hp1=sdTorus(q-vec3(0.,.008,0.),r+.002,.0055);
  float hp2=sdTorus(q-vec3(0.,2.*h-.008,0.),r+.002,.0055);
  float a=atan(q.z,q.x); float k=6.2832/8.; a=mod(a+k*.5,k)-k*.5;
  vec2 xz=vec2(cos(a),sin(a))*length(q.xz);
  float lug=sdRBox(vec3(xz.x-r-.006,q.y-h,xz.y),vec3(.005,h*.35,.006),.003);
  float rod=sdCapsule(vec3(xz.x-r-.009,q.y,xz.y),vec3(0.,.008,0.),vec3(0.,2.*h-.008,0.),.0018);
  return min(min(sh,min(hp1,hp2)),min(lug,rod)); }
float drumT(vec3 q,float r,float h){
  if(q.y>2.*h-.001&&length(q.xz)<r-.004) return .95;           /* the head */
  if(length(q.xz)>r+.002) return .4;                             /* lugs and rods */
  if(q.y<.014||q.y>2.*h-.014) return .45;                        /* hoops */
  return .6; }

/* ---- record player: plinth, platter, record, spindle, tone arm ---- */
float turntable(vec3 q,vec3 h){
  float pl=sdRBox(q-vec3(0.,h.y,0.),h,.006);
  vec3 p=q-vec3(-h.x*.18,2.*h.y,0.);
  float plat=sdCylY(p-vec3(0.,.006,0.),h.z*.8,.006)-.001;
  float rec=sdCylY(p-vec3(0.,.0135,0.),h.z*.78,.0012);
  float spin=sdCylY(p-vec3(0.,.018,0.),.003,.006);
  vec3 a=q-vec3(h.x*.72,2.*h.y,h.z*.62);
  float piv=sdCylY(a-vec3(0.,.012,0.),.012,.012)-.002;
  float arm=sdCapsule(a,vec3(0.,.026,0.),vec3(-h.x*.55,.022,-h.z*.62),.0035);
  float head=sdRBox(a-vec3(-h.x*.58,.019,-h.z*.66),vec3(.01,.005,.007),.002);
  float kn=sdCylY(q-vec3(h.x*.72,2.*h.y+.004,-h.z*.7),.01,.005)-.001;
  return min(min(min(pl,plat),min(rec,spin)),min(min(piv,arm),min(head,kn))); }
float turntableT(vec3 q,vec3 h){
  vec3 p=q-vec3(-h.x*.18,2.*h.y,0.); float r=length(p.xz);
  if(q.y>2.*h.y+.011&&q.y<2.*h.y+.016&&r<h.z*.79){
    if(r<h.z*.22) return .85;                                    /* the plain centre label */
    return fract(r/.0028)<.35?.22:.36; }                          /* the grooves */
  if(q.y<2.*h.y+.001) return .55;
  return .4; }

/* ---- tuning fork lying flat: stem along -x, two prongs along +x ---- */
float fork(vec3 q,float L){
  float stem=sdCapsule(q,vec3(-L*.55,.005,0.),vec3(-L*.12,.005,0.),.0045);
  float ball=length(q-vec3(-L*.57,.006,0.))-.006;
  vec3 u=q-vec3(-L*.02,.005,0.); float base=max(length(vec2(length(u.xz)-.012,u.y))-.0035,u.x);
  float p1=sdCapsule(q,vec3(-L*.02,.005,.012),vec3(L*.5,.005,.012),.0035);
  float p2=sdCapsule(q,vec3(-L*.02,.005,-.012),vec3(L*.5,.005,-.012),.0035);
  return min(min(min(stem,ball),base),min(p1,p2)); }

/* ---- microscope (faces -x): base, curved arm, stage, tilted tube, eyepiece, focus knob ---- */
float microscope(vec3 q,float s){ q/=s;
  float base=sdRBox(q-vec3(0.,.012,0.),vec3(.06,.012,.045),.008);
  float pil=sdRBox(q-vec3(.04,.045,0.),vec3(.012,.025,.012),.004);
  float arm=max(abs(length(q.xy-vec2(-.005,.1))-.055)-.011,max(-q.x+.005,abs(q.z)-.011));
  arm=max(arm,-(q.y-.07)*.0+(-(q.y-.06)));
  float st=sdRBox(q-vec3(-.012,.085,0.),vec3(.04,.004,.038),.002);
  vec3 t=q-vec3(-.03,.16,0.); t.xy=rot(-.35)*t.xy;
  float tube=sdCylY(t,.014,.05)-.001;
  float eye=sdCylY(t-vec3(0.,.062,0.),.011,.014)-.001;
  float cup=sdTorus(t-vec3(0.,.076,0.),.009,.003);
  float nose=sdCylY(t-vec3(0.,-.056,0.),.018,.008)-.002;
  float obj=sdCone(t-vec3(0.,-.075,0.),.006,.009,.014);
  float knob=sdCylZ(q-vec3(.04,.12,0.),.016,.022)-.002;
  float clip=sdRBox(q-vec3(-.02,.091,.022),vec3(.022,.0015,.003),.001);
  return min(min(min(base,pil),min(arm,st)),min(min(min(tube,eye),min(cup,nose)),min(min(obj,knob),clip)))*s; }
float microscopeT(vec3 q,float s){ q/=s;
  if(abs(q.z)>.019&&length(q.xy-vec2(.04,.12))<.017) return fract(atan(q.y-.12,q.x-.04)*6./3.1416)<.3?.3:.45;
  if(q.y<.026) return .38;
  if(q.y>.08&&q.y<.092) return .5;
  return .42; }

/* ---- glass beaker with a lip, a spout and liquid inside; graduation marks ---- */
float beaker(vec3 q,float r,float h){
  float o=sdCylY(q-vec3(0.,h*.5,0.),r,h*.5)-.002;
  float i=sdCylY(q-vec3(0.,h*.5+.004,0.),r-.0035,h*.5);
  float b=max(o,-i);
  float lip=sdTorus(q-vec3(0.,h,0.),r,.0025);
  float sp=sdCapsule(q,vec3(-r+.004,h-.002,0.),vec3(-r-.008,h+.004,0.),.004);
  sp=max(sp,-sdCapsule(q,vec3(-r+.004,h+.002,0.),vec3(-r-.008,h+.008,0.),.0025));
  return min(min(b,lip),sp); }
float beakerLiquid(vec3 q,float r,float h){ return sdCylY(q-vec3(0.,h*.22+.004,0.),r-.004,h*.22); }
float beakerT(vec3 q,float r,float h){
  float a=atan(q.z,q.x);
  if(abs(a+1.9)<.35&&q.y>h*.2&&q.y<h*.85){ float m=fract(q.y/(h*.13)); if(m<.09) return .4; }
  return .88; }

/* ---- magnifying glass lying flat: ring, lens, handle along +x ---- */
float magnifier(vec3 q,float R){
  float ring=length(vec2(length(q.xz)-R,q.y-.007))-.0055;
  float lens=max(sdCylY(q-vec3(0.,.007,0.),R,.0022),0.);
  float neck=sdCylX(q-vec3(R+.012,.007,0.),.005,.012);
  float hd=sdCapsule(q,vec3(R+.022,.008,0.),vec3(R+.1,.009,0.),.0085);
  return min(min(ring,sdCylY(q-vec3(0.,.007,0.),R,.0022)),min(neck,hd)); }
float magnifierT(vec3 q,float R){
  if(length(q.xz)<R-.004) return .96;
  if(q.x>R+.02) return .3; return .45; }
