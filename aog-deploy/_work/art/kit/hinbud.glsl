/* AOG render kit — hinbud.glsl: shared still-life parts for the Hindu Texts (hin) and
   Buddhist Texts (bud) pencil banners. Include after lib.glsl and studio.glsl.
   Every part takes a point q in its own frame: origin at the centre of its base on the
   table, y up, x to the right. Sizes are in metres. Objects only: no figures of any deity,
   of the Buddha or of any teacher. Writing is hint-lines only, never script. */
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
float sdB2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
vec3 ry(vec3 q,float a){ q.xz=rot(a)*q.xz; return q; }
/* polar repeat around y: returns angle-folded point for n sectors */
vec3 prep(vec3 q,float n){ float a=atan(q.z,q.x); float s=6.2832/n; float k=floor(a/s+.5); q.xz=rot(k*s)*q.xz; return q; }

/* ---- a clay oil lamp (diya): a pinched almond bowl with a spout; flame sits at SPOUT ---- */
float diya(vec3 q,float s){ q/=s;
  vec3 a=q-vec3(0.,.018,0.); a.x*=mix(1.,.72,smoothstep(0.,.05,a.x));   /* drawn out toward the spout (+x) */
  float bowl=sdEll(a,vec3(.05,.022,.04));
  bowl=max(bowl,a.y-.012);
  float inner=sdEll(a-vec3(0.,.016,0.),vec3(.043,.022,.033));
  bowl=max(bowl,-inner);
  float rim=max(abs(sdEll(a*vec3(1.,1.,1.),vec3(.05,.03,.04)))-.002,abs(a.y-.012)-.0025);
  float foot=sdCylY(q-vec3(0.,.003,0.),.026,.003)-.001;
  float wick=sdCapsule(q,vec3(.028,.025,0.),vec3(.054,.034,0.),.0035);
  return min(min(bowl,foot),min(rim,wick))*s; }
/* a teardrop flame standing at the origin, height h */
float flameD(vec3 q,float h){ float t=clamp(q.y/h,0.,1.);
  float r=h*.24*pow(sin(3.1416*pow(t,.6)),.8)*(1.-.15*t);
  float d=length(q.xz)-r; d=max(d,max(-q.y,q.y-h)); return d*.7; }
#define DIYA_TIP(s) (vec3(.056,.037,0.)*(s))

/* ---- a palm-leaf manuscript: long leaves between two wooden boards, a cord through them ---- */
float palmBundle(vec3 q,float L,float W,float T){
  float b1=sdRBox(q-vec3(0.,.006,0.),vec3(L,.006,W),.004);
  float b2=sdRBox(q-vec3(0.,2.*T+.018,0.),vec3(L,.006,W),.004);
  float lv=sdRBox(q-vec3(0.,T+.012,0.),vec3(L-.006,T,W-.004),.002);
  lv+=.0012*sin(q.y*900.);                                /* the edges of the stacked leaves */
  float d=min(min(b1,b2),lv);
  float c1=sdTorus((q-vec3(-L*.35,T+.012,0.)).xzy*vec3(1.,1.,1.),.0,.0);
  vec3 c=q-vec3(-L*.34,T+.012,0.);                       /* a cord wound round the bundle */
  float cord=length(vec2(sdB2(c.yz,vec2(T+.013,W+.001)),c.x))-.0028;
  vec3 k=q-vec3(-L*.34,2.*T+.03,W*.2);
  float knot=length(k)-.006;
  float tail=sdCapsule(q,vec3(-L*.34,2.*T+.03,W*.2),vec3(-L*.34-.05,.004,W+.05),.0022);
  return min(d,min(min(cord,knot),tail)); }
float palmBundleTone(vec3 q,float L,float W,float T){
  if(q.y>T*2.+.012||q.y<.012) return fract(q.x*38.+fbm(q.xz*vec2(4.,60.))*1.5)<.3?.32:.42;   /* wood boards */
  return fract(q.y*1200.)<.4?.62:.86; }
/* one loose leaf lying flat, with hint lines and two string holes */
float leafD(vec3 q,float L,float W){ return sdRBox(q-vec3(0.,.0015,0.),vec3(L,.0015,W),.001)-.0003*sin(q.x*40.); }
float leafTone(vec3 q,float L,float W){ float a=.9;
  if(abs(q.z)<W-.006&&abs(q.x)<L-.012&&fract((q.z+W)/.0085)<.32&&length(vec2(abs(q.x)-L*.34,q.z))>.011) a=.45;
  if(abs(length(vec2(abs(q.x)-L*.34,q.z))-.0045)<.0012) a=.35;
  return a; }

/* ---- a closed book lying flat (hardback, page block visible on three sides) ---- */
float bookD(vec3 q,vec3 b){
  float cov=sdRBox(q-vec3(0.,b.y,0.),vec3(b.x,b.y,b.z),.003);
  float pg=sdBox(q-vec3(.004,b.y,0.),vec3(b.x-.002,b.y-.0045,b.z-.004));
  float cut=sdBox(q-vec3(.006,b.y,0.),vec3(b.x,b.y-.0045,b.z-.004));
  return min(max(cov,-cut),pg); }
float bookTone(vec3 q,vec3 b,float c){
  if(abs(q.y-b.y)<b.y-.0048&&(q.x>-b.x+.006)) return fract(q.y*1500.)<.4?.72:.9;   /* page edges */
  float a=c; if(q.y>2.*b.y-.001&&abs(abs(q.z)-b.z*.7)<.0025) a*=.7;   /* two bands on the cover */
  return a; }

/* ---- a conch shell lying on its side, spire toward -x, opening facing the viewer ---- */
float conch(vec3 q,float s){ q/=s;
  vec3 a=q-vec3(0.,.034,0.);
  float body=sdEll(a-vec3(.01,0.,0.),vec3(.07,.034,.037));
  float t=clamp((-a.x-.03)/.07,0.,1.);
  float spire=length(a.yz)-(.03*(1.-t))-.002; spire=max(spire,max(a.x+.02,-a.x-.1));
  float canal=sdCapsule(a,vec3(.05,-.003,0.),vec3(.12,-.012,.002),.009);
  float d=smin(smin(body,spire,.012),canal,.012);
  /* a ring of blunt knobs on the shoulder, and stepped whorls up the spire */
  vec3 k=a-vec3(-.035,0.,0.); float ka=atan(k.z,k.y); float ks=6.2832/9.; float kk=floor(ka/ks+.5);
  vec2 kr=rot(kk*ks)*k.yz; d=smin(d,length(vec3(k.x,kr.x-.036,kr.y))-.008,.006);
  for(int i=0;i<3;i++){ float x=-.06-float(i)*.016; d=smin(d,sdTorus((a-vec3(x,0.,0.)).yxz,.026-float(i)*.007,.0035),.004); }
  /* spiral ridges round the spire and the body */
  float ang=atan(a.z,a.y); float sp=fract((a.x*38.)+ang/6.2832);
  d+=.0022*smoothstep(.0,.2,abs(sp-.5)-.3)*(1.-smoothstep(.02,.06,a.x));
  /* the long opening on the near side */
  float mouth=sdEll(a-vec3(.03,-.002,-.036),vec3(.065,.016,.014));
  d=max(d,-mouth);
  return d*s*.8; }

/* ---- a temple hand bell: a flared bell, a knop and a handle ---- */
float bellD(vec3 q,float s){ q/=s;
  float y=q.y; float r=.038-.024*smoothstep(.0,.07,y)+.005*exp(-y*60.);
  float shell=max(abs(length(q.xz)-r)-.0025,max(-y,y-.075));
  float top=sdEll(q-vec3(0.,.074,0.),vec3(.016,.01,.016));
  float lip=sdTorus(q-vec3(0.,.003,0.),.042,.0035);
  float knop=length(q-vec3(0.,.092,0.))-.009;
  float stem=sdCylY(q-vec3(0.,.12,0.),.0055,.03);
  float cap=sdEll(q-vec3(0.,.158,0.),vec3(.011,.014,.011));
  float clap=length(q-vec3(0.,.012,0.))-.008;
  return min(min(min(shell,top),min(lip,knop)),min(min(stem,cap),clap))*s; }

/* ---- a lotus flower: two rings of pointed petals round a seed pod ---- */
float petal(vec3 q,float L,float W,float tilt){   /* one petal along +x, tilted up by tilt */
  q.xy=rot(-tilt)*q.xy; float t=clamp(q.x/L,0.,1.);
  float w=W*sin(3.1416*pow(t,.7))*(1.-.3*t);
  float cup=q.y-.35*W*(q.z*q.z)/(W*W+1e-4)*.8;
  float d=max(abs(cup)-.0018,max(abs(q.z)-w,max(-q.x,q.x-L)));
  return d; }
float lotus(vec3 q,float s){ q/=s;
  vec3 a=q-vec3(0.,.012,0.);
  float d=1e5;
  vec3 p1=prep(a,8.); d=min(d,petal(p1,.06,.022,.35));
  vec3 p2=prep(ry(a,.39),8.); d=min(d,petal(p2-vec3(0.,.006,0.),.05,.02,.85));
  vec3 p3=prep(ry(a,.2),6.); d=min(d,petal(p3-vec3(0.,.014,0.),.036,.016,1.25));
  float pod=sdCylY(a-vec3(0.,.02,0.),.013,.008)-.002;
  return min(d,pod)*s*.8; }

/* ---- a round-bellied metal or clay pot (kalash) with a narrow neck and a lip ---- */
float potD(vec3 q,float s){ q/=s;
  float y=q.y; float r=.05*sin(clamp(y/.1,0.,1.)*2.6+.35)+.002;
  r=max(r,.022+.01*smoothstep(.1,.125,y));
  float body=(length(q.xz)-r)*.8; body=max(body,max(-y,y-.13));
  body=max(body,-(length(q.xz)-(r-.004)));      /* a hollow neck */
  body=max(body,-max(-(y-.1),length(q.xz)-.03));
  float lip=sdTorus(q-vec3(0.,.13,0.),.03,.0045);
  float foot=sdCylY(q-vec3(0.,.003,0.),.03,.003)-.001;
  return min(min(body,lip),foot)*s; }

/* ---- a shallow round bowl (alms bowl, sweets bowl, colour powder bowl) ---- */
float bowlD(vec3 q,float R,float H){
  float o=sdEll(q-vec3(0.,H,0.),vec3(R,H,R)); o=max(o,q.y-H);
  float i=sdEll(q-vec3(0.,H+.001,0.),vec3(R-.005,H-.004,R-.005));
  float foot=sdCylY(q-vec3(0.,.003,0.),R*.45,.003);
  return min(max(o,-i),foot); }

/* ---- a spoked wheel standing on edge (face along z) ---- */
float wheelD(vec3 q,float R,float n,float w){
  vec3 c=q-vec3(0.,R,0.);
  float rim=sdTorus(c.xzy,R-.012,.0) ; rim=length(vec2(length(c.xy)-R+.009,c.z))-.0;
  rim=sdB2(vec2(length(c.xy)-R+.01,c.z),vec2(.01,w))-.002;
  float hub=sdCylZ(c,.028,w+.012)-.002;
  float a=atan(c.y,c.x); float sct=6.2832/n; float k=floor(a/sct+.5); vec2 r2=rot(k*sct)*c.xy;
  float spoke=length(vec2(r2.y,c.z))-.0055-.002*smoothstep(R*.9,.03,r2.x); spoke=max(spoke,max(-r2.x,r2.x-R+.01));
  float axle=sdCylZ(c,.009,w+.03);
  return min(min(rim,hub),min(spoke,axle)); }

/* ---- a bow: a recurved wooden stave with a straight string, lying in the x-y plane ---- */
float bowD(vec3 q,float L){
  float t=clamp(q.x/L,-1.,1.);
  float y=.075*(1.-t*t)-.012*pow(abs(t),6.)*8.*0.;      /* the arc of the stave */
  float yy=.07*(1.-t*t)+.018*smoothstep(.8,1.,abs(t));
  float th=.0075*(1.-.45*abs(t))+.002;
  float stave=max(length(vec2(q.y-yy,q.z))-th,abs(q.x)-L);
  float grip=max(length(vec2(q.y-yy,q.z))-.011,abs(q.x)-.025);
  float str=sdCapsule(q,vec3(-L*.985,.018+.0,0.),vec3(L*.985,.018,0.),.0012);
  return min(min(stave,grip),str)*.9; }
/* an arrow along +x from -L to L: shaft, a leaf-shaped iron head, three feathers */
float arrowD(vec3 q,float L){
  float shaft=max(length(q.yz)-.0035,abs(q.x)-L);
  vec3 h=q-vec3(L+.02,0.,0.); float t=clamp((h.x+.02)/.04,0.,1.);
  float head=max(sdB2(vec2(abs(h.y),h.z),vec2(.011*sin(3.1416*pow(t,.6)),.0016)),abs(h.x)-.02);
  vec3 f=q-vec3(-L+.04,0.,0.); float fe=1e5;
  for(int i=0;i<3;i++){ vec2 yz=rot(float(i)*2.094)*f.yz; float tt=clamp((f.x+.035)/.07,0.,1.);
    fe=min(fe,max(sdB2(vec2(yz.x-.006-.005*tt,yz.y),vec2(.006*tt+.001,.0008)),abs(f.x)-.035)); }
  float nock=max(length(q.yz)-.0045,abs(q.x+L)-.006);
  return min(min(shaft,head),min(fe,nock)); }

/* ---- a stupa: square plinth, drum, dome, a small railing box and a stack of parasols ---- */
float stupaD(vec3 q,float s){ q/=s;
  float base=sdRBox(q-vec3(0.,.012,0.),vec3(.09,.012,.09),.002);
  float base2=sdRBox(q-vec3(0.,.03,0.),vec3(.075,.008,.075),.002);
  float drum=sdCylY(q-vec3(0.,.048,0.),.062,.012)-.001;
  float ring=sdTorus(q-vec3(0.,.061,0.),.061,.003);
  float dome=max(sdEll(q-vec3(0.,.06,0.),vec3(.058,.055,.058)),.06-q.y);
  float harm=sdRBox(q-vec3(0.,.123,0.),vec3(.014,.009,.014),.001);
  float hcap=sdRBox(q-vec3(0.,.134,0.),vec3(.019,.0025,.019),.001);
  float mast=sdCylY(q-vec3(0.,.17,0.),.0028,.035);
  float d=min(min(min(base,base2),min(drum,ring)),min(min(dome,harm),min(hcap,mast)));
  for(int i=0;i<3;i++){ float fy=.148+float(i)*.017; float fr=.02-float(i)*.005;
    d=min(d,sdCone(q-vec3(0.,fy,0.),fr,.002,.0035)); }
  return d*s; }

/* ---- an eight-spoked Dharma wheel on a small stand (face along z) ---- */
float dharmaWheel(vec3 q,float R){
  vec3 c=q-vec3(0.,R+.035,0.);
  float rim=sdB2(vec2(length(c.xy)-R+.008,c.z),vec2(.008,.008))-.002;
  float inner=sdB2(vec2(length(c.xy)-R*.34,c.z),vec2(.006,.009))-.001;
  float hub=sdCylZ(c,.012,.012)-.002;
  float a=atan(c.y,c.x); float sct=6.2832/8.; float k=floor(a/sct+.5); vec2 r2=rot(k*sct)*c.xy;
  float spoke=max(length(vec2(r2.y*(1.+1.2*smoothstep(R*.5,R,r2.x)),c.z))-.005,max(-r2.x,r2.x-R+.012));
  float knob=length(vec2(length(c.xy)-R-.008,c.z))-.0; knob=1e5;
  vec2 kk=vec2(r2.x-R-.008,r2.y); knob=length(vec3(kk,c.z))-.007;
  float stand=sdRBox(q-vec3(0.,.012,0.),vec3(.06,.012,.035),.003);
  float post=sdRBox(q-vec3(0.,.03,0.),vec3(.012,.012,.01),.002);
  return min(min(min(rim,inner),min(hub,spoke)),min(min(knob,stand),post)); }

/* ---- a round paper lantern with ribs, a top cap, a bottom cap and a hanging loop ---- */
float lanternD(vec3 q,vec3 r){
  vec3 c=q-vec3(0.,r.y+.012,0.);
  float body=sdEll(c,r);
  body+=.0012*smoothstep(.3,.5,abs(fract(c.y/(r.y*.18))-.5));   /* ribs */
  body=max(body,abs(c.y)-r.y*.86);
  float cap1=sdCylY(c-vec3(0.,r.y*.86,0.),r.x*.45,.006)-.001;
  float cap2=sdCylY(c+vec3(0.,r.y*.86,0.),r.x*.45,.006)-.001;
  float loop=sdTorus((c-vec3(0.,r.y*.86+.022,0.)).xzy,.013,.0022);
  return min(min(body,cap1),min(cap2,loop))*.9; }

/* ---- a folded cloth under things: a soft slab with a sag ---- */
float clothD(vec3 q,vec2 b){ float h=.004+.0015*sin(q.x*40.+sin(q.z*30.)); return sdRBox(q-vec3(0.,h,0.),vec3(b.x,h,b.y),.003); }

/* ---- a bodhi leaf lying flat: heart-shaped with a long drip tip (tip toward +x) ---- */
float bodhiLeaf2(vec2 u){   /* 2D distance to the leaf outline, leaf about .1 long */
  vec2 v=u; float t=clamp((v.x+.05)/.1,0.,1.);
  float w=.045*pow(sin(3.1416*pow(t,.75)),.9)*(1.-.25*t);
  w=max(w,0.)+ .0*t;
  float body=abs(v.y)-w; body=max(body,max(-v.x-.05,v.x-.05));
  float tip=sdSeg2(v,vec2(.03,0.),vec2(.1,.008))-.004*(1.-clamp((v.x-.03)/.07,0.,1.));
  return min(body,tip); }
float bodhiLeaf(vec3 q,float s){ q/=s; float c=.004*sin(q.x*30.)+.006*q.y*0.; float d=max(bodhiLeaf2(q.xz),abs(q.y-.0015-.004*sin(q.x*25.+1.)*smoothstep(-.05,.05,q.x))-.0012); return d*s*.8; }
float bodhiTone(vec3 q,float s){ q/=s; vec2 u=q.xz; if(abs(u.y)<.0015&&u.x<.07) return .35;
  float vs=abs(fract((u.x-abs(u.y)*1.3)/.018)-.5); if(vs<.06&&bodhiLeaf2(u)<-.004) return .5; return .72; }

/* ---- a woven basket: a round tub with an over-under weave and a rolled rim ---- */
float basketD(vec3 q,float R,float H){
  float wall=max(abs(length(q.xz)-R+.002*q.y/H)-.004,max(-q.y,q.y-H));
  float a=atan(q.z,q.x); float w=.0015*sin(a*R*260.)*sin(q.y*300.);
  wall+=w;
  float floor1=sdCylY(q-vec3(0.,.004,0.),R,.004);
  float rim=sdTorus(q-vec3(0.,H,0.),R,.006);
  return min(min(wall,floor1),rim); }
float basketTone(vec3 q,float R){ float a=atan(q.z,q.x); float s=sin(a*R*260.)*sin(q.y*300.); return s>0.?.55:.38; }

/* ---- a string of round beads (mala) laid in a loose loop ---- */
float malaD(vec3 q,float R,float n){ float a=atan(q.z,q.x); float k=floor(a/(6.2832/n)+.5); float aa=k*6.2832/n;
  float rr=R*(1.+.15*sin(aa*2.+1.));
  vec3 c=vec3(cos(aa)*rr,.0065,sin(aa)*rr*.75);
  float d=length(q-c)-.0065;
  float k2=k+1.; float ab=k2*6.2832/n; float rb=R*(1.+.15*sin(ab*2.+1.)); d=min(d,length(q-vec3(cos(ab)*rb,.0065,sin(ab)*rb*.75))-.0065);
  float k3=k-1.; float ac=k3*6.2832/n; float rc=R*(1.+.15*sin(ac*2.+1.)); d=min(d,length(q-vec3(cos(ac)*rc,.0065,sin(ac)*rc*.75))-.0065);
  return d; }

/* ---- a small pagoda: stacked tiers with upturned eaves and a finial ---- */
float pagodaD(vec3 q,float s){ q/=s; float d=sdRBox(q-vec3(0.,.012,0.),vec3(.05,.012,.05),.002);
  for(int i=0;i<4;i++){ float fi=float(i); float y0=.024+fi*.045; float w=.04-fi*.006;
    d=min(d,sdRBox(q-vec3(0.,y0+.016,0.),vec3(w*.75,.016,w*.75),.002));
    vec3 e=q-vec3(0.,y0+.034,0.); float ew=w+.02; vec2 m=abs(e.xz); float c=max(m.x,m.y);
    float roof=e.y-(-.012*(c/ew)+.006*pow(c/ew,6.)); roof=max(abs(roof)-.003,c-ew);
    d=min(d,roof); }
  d=min(d,sdCylY(q-vec3(0.,.23,0.),.003,.035));
  for(int i=0;i<3;i++) d=min(d,sdTorus(q-vec3(0.,.22+float(i)*.012,0.),.006,.002));
  return d*s; }
