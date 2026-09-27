/* AOG render kit — novlib.glsl: shared still-life objects for the novel covers and the
   novel scene drawings (nov-*-still.glsl). Include after lib.glsl and studio.glsl.
   Every object is modelled in its own frame: base on y=0, facing the camera along -z,
   sizes in metres at "still-life" scale. Place it with pl(p, centre, turn). */
vec3 pl(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return q; }
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/max(k1,1e-5); }
float sdRCyl(vec3 p,float r,float h,float b){ vec2 d=vec2(length(p.xz)-r+b,abs(p.y)-h+b); return min(max(d.x,d.y),0.)+length(max(d,0.))-b; }
float sdE2(vec2 p,vec2 r){ return (length(p/r)-1.)*min(r.x,r.y); }   /* rough 2D ellipse */

/* ---- backpack: soft body, front pocket, top loop, two straps behind ---- */
float backpack(vec3 q){
  float b=sdRBox(q-vec3(0,.2,0),vec3(.14,.2,.075),.06);
  b+=.004*sin(q.y*40.+q.x*9.)*smoothstep(.1,.35,q.y);                 /* soft folds */
  float pk=sdRBox(q-vec3(0,.12,-.08),vec3(.105,.075,.035),.03);
  float loop=sdTorus((q-vec3(0,.405,.01)).xzy,.035,.008);
  float st=min(sdCapsule(q,vec3(-.075,.36,.085),vec3(-.09,.06,.1),.013),sdCapsule(q,vec3(.075,.36,.085),vec3(.09,.06,.1),.013));
  return min(min(smin(b,pk,.01),loop),st); }
float sdRBox2(vec2 p,vec2 b,float r){ vec2 d=abs(p)-b+r; return length(max(d,0.))+min(max(d.x,d.y),0.)-r; }
float backpackInk(vec3 q){                     /* zip lines and pocket seam */
  if(q.z<-.09&&abs(sdRBox2(q.xy-vec2(0,.12),vec2(.093,.063),.02))<.0025) return .25;
  if(q.z<-.05&&abs(q.y-.33)<.003&&abs(q.x)<.11) return .25;
  return -1.; }

/* ---- a clay pot with a leafy plant; s = scale ---- */
float pot(vec3 q,float s){ q/=s;
  float b=sdCone(q-vec3(0,.065,0),.045,.062,.065);
  float rim=sdRCyl(q-vec3(0,.125,0),.068,.012,.005);
  float hollow=sdCylY(q-vec3(0,.14,0),.056,.02);
  return max(min(b,rim),-hollow)*s; }
float leaves(vec3 q,float s,float n){ q/=s; float d=1e3;
  for(int i=0;i<9;i++){ if(float(i)>=n) break; float a=float(i)*2.39+.3; float up=.5+.35*fract(float(i)*.618);
    vec3 r=q-vec3(0,.13,0); r.xz=rot(a)*r.xz; r.xy=rot(-up)*r.xy;
    float L=.11+.04*fract(float(i)*.37);
    vec3 lq=r-vec3(L*.55,0,0); lq.y+=.35*lq.x*lq.x/L;           /* arching blade */
    d=min(d,sdEll(lq,vec3(L*.55,.006,.028)));
    d=min(d,sdCapsule(r,vec3(0),vec3(L*.1,0,0),.004)); }
  return d*s; }
float sprout(vec3 q,float s){ q/=s;
  float st=sdCapsule(q,vec3(0,.12,0),vec3(.004,.21,0),.004);
  vec3 a=q-vec3(-.03,.215,0); a.xy=rot(-.35)*a.xy; vec3 b=q-vec3(.034,.222,0); b.xy=rot(.3)*b.xy;
  float l=min(sdEll(a,vec3(.032,.006,.02)),sdEll(b,vec3(.036,.006,.022)));
  float soil=sdCylY(q-vec3(0,.122,0),.055,.006);
  return min(min(st,l),soil)*s; }

/* ---- a wooden chair; s = scale (1 = adult, .7 = a small child's chair) ---- */
float chair(vec3 q,float s){ q/=s;
  float seat=sdRBox(q-vec3(0,.44,0),vec3(.21,.02,.2),.008);
  vec2 lx=vec2(abs(q.x)-.18,abs(q.z)-.17);
  float legs=sdRBox(vec3(lx.x,q.y-.21,lx.y),vec3(.018,.21,.018),.005);
  float posts=sdRBox(vec3(abs(q.x)-.18,q.y-.66,q.z-.18),vec3(.018,.22,.018),.005);
  float rail=sdRBox(q-vec3(0,.82,.18),vec3(.2,.05,.014),.008);
  float slat=sdRBox(vec3(abs(q.x)-.06,q.y-.63,q.z-.18),vec3(.012,.15,.01),.004);
  float bar=sdRBox(vec3(q.x,q.y-.14,abs(q.z)-.17),vec3(.17,.01,.01),.004);
  return min(min(min(seat,legs),min(posts,rail)),min(slat,bar))*s; }

/* ---- a park bench (seat and back slats on iron ends) ---- */
float bench(vec3 q){
  float d=1e3;
  for(int i=0;i<3;i++){ d=min(d,sdRBox(q-vec3(0,.42,-.1+float(i)*.075),vec3(.62,.012,.03),.006)); }
  for(int i=0;i<2;i++){ vec3 r=q-vec3(0,.56+float(i)*.11,.12); r.yz=rot(.2)*r.yz; d=min(d,sdRBox(r,vec3(.62,.035,.01),.006)); }
  vec3 e=vec3(abs(q.x)-.55,q.y,q.z);
  d=min(d,sdCapsule(e,vec3(0,0,-.15),vec3(0,.41,-.1),.014));
  d=min(d,sdCapsule(e,vec3(0,0,.1),vec3(0,.72,.16),.014));
  d=min(d,sdCapsule(e,vec3(0,.41,-.15),vec3(0,.41,.13),.012));
  d=min(d,sdCapsule(e,vec3(0,.52,-.16),vec3(0,.6,.1),.011));   /* arm rest */
  return d; }

/* ---- a watering can ---- */
float wateringCan(vec3 q){
  float b=sdRCyl(q-vec3(0,.09,0),.075,.09,.02);
  float sp=sdCapsule(q,vec3(.05,.07,0),vec3(.2,.2,0),.011);
  vec3 r=q-vec3(.215,.215,0); r.xy=rot(.8)*r.xy; float rose=sdCone(r,.012,.03,.018);
  vec3 h=q-vec3(-.02,.2,0); float hd=max(sdTorus(h.xzy,.075,.009),-h.y+.0);
  float top=sdRCyl(q-vec3(-.02,.185,0),.045,.008,.003);
  return min(min(b,sp),min(min(rose,hd),top)); }
/* a small trowel lying flat */
float trowel(vec3 q){
  float bl=sdEll(q-vec3(.08,.008,0),vec3(.07,.006,.04));
  float nk=sdCapsule(q,vec3(.01,.01,0),vec3(-.02,.02,0),.005);
  float hd=sdCapsule(q,vec3(-.03,.02,0),vec3(-.13,.02,0),.013);
  return min(min(bl,nk),hd); }

/* ---- fruit ---- */
float apple(vec3 q,float r){
  float d=length(q*vec3(1.,1.1,1.))-r;
  d+=r*.25*exp(-dot(q.xz,q.xz)/(r*r*.08))*smoothstep(.2*r,.9*r,q.y);
  d=min(d,sdCapsule(q,vec3(0,.7*r,0),vec3(.1*r,1.25*r,0),.07*r));
  return d; }
/* woven basket, open top, with a handle; r radius, h half height */
float basket(vec3 q,float r,float h){
  float sh=sdCone(q-vec3(0,h,0),r*.82,r,h);
  float d=max(abs(sh)-.006,q.y-2.*h);
  d=min(d,sdTorus(q-vec3(0,2.*h,0),r,.009));
  float hd=max(sdTorus((q-vec3(0,2.*h,0)).xzy,r*.95,.01),-(q.y-2.*h));
  return min(d,hd); }
float basketInk(vec3 q,float r,float h){   /* weave: rings and staggered stakes */
  float a=atan(q.z,q.x)*r; float y=q.y/(h*2.);
  float row=floor(y*9.); float ring=abs(fract(y*9.)-.5);
  float st=abs(fract(a/.035+.5*mod(row,2.))-.5);
  if(q.y<2.*h-.01&&(ring>.42||st>.44)) return .3;
  return -1.; }

/* ---- lamps and lights ---- */
float deskLamp(vec3 q){
  float base=sdRCyl(q-vec3(0,.012,0),.07,.012,.006);
  float a1=sdCapsule(q,vec3(0,.02,0),vec3(.05,.26,0),.008);
  float a2=sdCapsule(q,vec3(.05,.26,0),vec3(.2,.3,0),.008);
  vec3 s=q-vec3(.22,.25,0); s.xy=rot(-.5)*s.xy;
  float sh=max(abs(sdCone(s,.075,.035,.06))-.004,-s.y-.06);
  float bulb=length(s-vec3(0,-.03,0))-.025;
  return min(min(base,min(a1,a2)),min(sh,bulb)); }
/* a hand lantern: base, glass box, frame posts, cap and ring */
float lantern(vec3 q,float s){ q/=s;
  float base=sdRBox(q-vec3(0,.015,0),vec3(.06,.015,.06),.006);
  float glass=sdRBox(q-vec3(0,.1,0),vec3(.045,.07,.045),.004);
  float posts=sdRBox(vec3(abs(q.x)-.05,q.y-.1,abs(q.z)-.05),vec3(.007,.075,.007),.002);
  float cap=sdCone(q-vec3(0,.2,0),.065,.02,.03);
  float ring=sdTorus((q-vec3(0,.25,0)).xzy,.025,.005);
  float candle=sdCylY(q-vec3(0,.08,0),.015,.04);
  return min(min(min(base,glass),min(posts,cap)),min(ring,candle))*s; }
float lanternPost(vec3 q,float h){
  float post=sdRBox(q-vec3(0,h*.5,0),vec3(.018,h*.5,.018),.004);
  float arm=sdRBox(q-vec3(.05,h-.02,0),vec3(.06,.008,.008),.003);
  return min(min(post,arm),lantern(q-vec3(.1,h-.2*.6,0),.6)); }

/* ---- paper things ---- */
float notebook(vec3 q,vec2 sz){ return sdRBox(q-vec3(0,.008,0),vec3(sz.x,.008,sz.y),.003); }
float nbInk(vec3 q,vec2 sz){ vec2 u=q.xz; if(q.y<.013) return -1.;
  if(abs(u.x+sz.x*.8)<.002) return .4;                           /* margin */
  float l=fract(u.y/.018); if(l<.12&&abs(u.x)<sz.x*.85&&abs(u.y)<sz.y*.85) return .55;
  return -1.; }
/* pencil along +x, lying on a surface; s = scale */
float pencil(vec3 q){
  float R=.0066; vec2 h=abs(q.yz); float hex=max(h.x*.866+h.y*.5,h.y)-R*.87;
  float body=max(hex,abs(q.x+.005)-.115);
  float t=clamp((q.x-.11)/.028,0.,1.); float cone=max(length(q.yz)-R*(1.-t)*.95-.0003,max(.11-q.x,q.x-.138));
  float fer=max(length(q.yz)-R*.98,abs(q.x+.118)-.009);
  float era=max(length(q.yz)-R*.93,abs(q.x+.133)-.007)-.0006;
  return min(min(body,cone),min(fer,era)); }
float pencilInk(vec3 q){
  if(q.x>.11) return q.x>.127?.12:.88;
  if(q.x<-.126) return .5;
  if(q.x<-.11) return fract(q.x/.003)<.35?.3:.7;
  return .6; }
/* an unrolled map: a sheet with both ends curled */
float mapSheet(vec3 q,vec2 sz){
  float sheet=sdRBox(q-vec3(0,.002,0),vec3(sz.x,.002,sz.y),.001);
  float c1=abs(length((q-vec3(-sz.x,.018,0)).xy)-.016)-.0015; c1=max(c1,abs(q.z)-sz.y);
  float c2=abs(length((q-vec3(sz.x,.014,0)).xy)-.012)-.0015; c2=max(c2,abs(q.z)-sz.y);
  return min(sheet,min(c1,c2)); }

/* ---- a plain half mask, lying face up or hung; its front looks along -z ---- */
float mask(vec3 q){
  float sh=abs(sdEll(q,vec3(.075,.095,.035)))-.003;
  sh=max(sh,q.z);                                                  /* front half only */
  sh=max(sh,-q.y-.035);                                            /* a half mask: top part */
  vec2 e=vec2(abs(q.x)-.03,q.y-.012); e.y+=4.*e.x*e.x; float eye=length(e*vec2(1.,3.2))-.011;
  sh=max(sh,-max(eye,abs(q.z+.03)-.05));
  float rib=sdCapsule(q,vec3(-.072,.01,.0),vec3(-.14,-.05,.04),.004);
  return min(sh,rib); }

/* ---- a brass pocket compass lying flat ---- */
float compass(vec3 q){
  float b=sdRCyl(q-vec3(0,.009,0),.045,.009,.004);
  float rim=sdTorus(q-vec3(0,.018,0),.043,.004);
  float face=sdCylY(q-vec3(0,.017,0),.039,.002);
  float bail=sdTorus((q-vec3(0,.009,-.056)).xzy,.012,.003);
  return min(min(max(b,-face),rim),min(bail,max(b,face-.001))); }
float compassInk(vec3 q){ if(q.y<.016) return -1.; vec2 u=q.xz; float r=length(u); if(r>.04) return -1.;
  float a=atan(u.y,u.x); float tk=abs(fract(a/(PI/8.))-.5);
  if(r>.031&&tk>.44) return .25;
  vec2 v=u; float nd=abs(v.x)*3.2+abs(v.y)*.35-.009;               /* needle */
  if(nd<0.) return v.y<0.?.15:.6;
  if(r<.004) return .2;
  return -1.; }

/* ---- a bowl (mended with gold seams in the tone pass) ---- */
float bowl(vec3 q,float r){
  vec3 c=q-vec3(0,r*.95,0);
  float s=abs(length(c)-r)-.005; s=max(s,c.y+r*.1);
  float foot=sdRCyl(q-vec3(0,.008,0),r*.4,.008,.003);
  return min(s,foot); }
float bowlInk(vec3 q,float r){        /* three wandering seams */
  vec3 c=q-vec3(0,r*.95,0); float a=atan(c.z,c.x); float y=c.y/r;
  float s1=abs(a-.4-.25*sin(y*9.)); float s2=abs(a+1.9-.2*sin(y*7.+1.)); float s3=abs(y+.45+.08*sin(a*5.));
  float m=min(min(s1,s2),s3*1.6);
  if(m<.035) return .2;
  return -1.; }
/* hanging tools: hammer and a wrench */
float hammer(vec3 q){ return min(sdRBox(q-vec3(0,-.1,0),vec3(.01,.11,.008),.004),sdRBox(q-vec3(0,.01,0),vec3(.05,.014,.012),.004)); }
float wrench(vec3 q){ float h=sdRBox(q-vec3(0,-.08,0),vec3(.009,.1,.004),.003);
  float hd=max(length(q.xy-vec2(0,.03))-.022,abs(q.z)-.004); hd=max(hd,-sdRBox(vec3(q.x,q.y-.05,q.z),vec3(.009,.02,.1),.002));
  return min(h,hd); }

/* ---- a lighthouse, on its own base; h = tower height ---- */
float lighthouse(vec3 q,float h){
  float t=sdCone(q-vec3(0,h*.5,0),h*.13,h*.085,h*.5);
  float gal=sdRCyl(q-vec3(0,h+.004,0),h*.12,.006,.002);
  float rail=max(abs(length(q.xz)-h*.118)-.002,abs(q.y-h-.02)-.012);
  float lr=sdCylY(q-vec3(0,h+.04,0),h*.07,.035);
  float cap=sdCone(q-vec3(0,h+.095,0),h*.085,.004,.022);
  float door=sdRBox(q-vec3(0,.02,-h*.125),vec3(.012,.022,.01),.003);
  return max(min(min(t,gal),min(min(rail,lr),cap)),-door); }
float lighthouseInk(vec3 q,float h){
  if(q.y<h&&fract(q.y/(h*.25))<.5) return .5;                      /* painted bands */
  if(q.y>h+.01&&q.y<h+.07&&abs(fract(atan(q.z,q.x)/.6)-.5)>.42) return .3;   /* lantern panes */
  if(q.y>h+.01&&q.y<h+.07) return .97;                             /* the light */
  return -1.; }
/* a rocky mound: an ellipsoid with gentle lumps */
float rock(vec3 q,vec3 r){ return sdEll(q,r)+(fbm3(q*14.)-.5)*.04*r.y/.1; }

/* ---- a small tree: trunk and a cloud of leaves ---- */
float tree(vec3 q,float h,float r){
  float tr=sdCone(q-vec3(0,h*.35,0),.018*h/.5,.01*h/.5,h*.35);
  vec3 c=q-vec3(0,h*.72,0);
  float cr=sdEll(c,vec3(r,r*.85,r));
  cr=smin(cr,length(c-vec3(r*.5,r*.15,-r*.2))-r*.6,.03);
  cr=smin(cr,length(c-vec3(-r*.55,r*.05,.1*r))-r*.55,.03);
  cr+=(fbm3(q*18.)-.5)*.03*r/.2;
  return min(tr,cr); }

/* ---- a wooden ladder leaning back at angle a (radians from upright) ---- */
float ladder(vec3 q,float h,float a){
  q.yz=rot(a)*q.yz;
  float rails=sdRBox(vec3(abs(q.x)-.07,q.y-h*.5,q.z),vec3(.01,h*.5,.012),.004);
  float y=q.y-clamp(floor(q.y/.1+.5)*.1,.1,h-.05);
  float rung=sdCapsule(vec3(q.x,y,q.z),vec3(-.07,0,0),vec3(.07,0,0),.007);
  return min(rails,rung); }
/* a wheelbarrow facing +x */
float wheelbarrow(vec3 q){
  vec3 t=q-vec3(0,.2,0); float tray=sdRBox(t,vec3(.2,.07,.13),.03);
  tray=max(tray,-sdRBox(t-vec3(0,.02,0),vec3(.185,.07,.115),.025));
  float wh=sdTorus((q-vec3(.25,.08,0)).xzy,.07,.014); float hub=sdCylZ(q-vec3(.25,.08,0),.015,.02);
  float h=min(sdCapsule(vec3(q.x,q.y,abs(q.z)),vec3(.25,.08,.06),vec3(-.4,.25,.12),.009),0.);
  h=sdCapsule(vec3(q.x,q.y,abs(q.z)),vec3(.25,.08,.06),vec3(-.4,.25,.12),.009);
  float legs=sdCapsule(vec3(q.x,q.y,abs(q.z)),vec3(-.12,.15,.1),vec3(-.14,0,.1),.008);
  return min(min(tray,min(wh,hub)),min(h,legs)); }

/* ---- bridges ---- */
float stoneBridge(vec3 q,float L,float w){       /* spans along x, an arch underneath */
  float deck=sdRBox(q-vec3(0,.11,0),vec3(L,.05,w),.005);
  deck=max(deck,-(length(q.xy-vec2(0,-.06))-.15));
  float par=sdRBox(vec3(q.x,q.y-.2,abs(q.z)-w+.01),vec3(L,.04,.012),.006);
  par=max(par,-(length(q.xy-vec2(0,-.06))-.15));
  return min(deck,par); }
float woodBridge(vec3 q,float L,float w){
  float dy=.06-.05*q.x*q.x/(L*L);
  float deck=sdRBox(q-vec3(0,dy+.06,0),vec3(L,.008,w),.003);
  float posts=sdRBox(vec3(mod(q.x+.09,.18)-.09,q.y-dy-.1,abs(q.z)-w),vec3(.007,.05,.007),.002);
  posts=max(posts,abs(q.x)-L);
  float rail=sdCapsule(vec3(q.x,q.y-dy-.15,abs(q.z)-w),vec3(-L,0,0),vec3(L,0,0),.006);
  float beams=sdRBox(vec3(q.x,q.y-dy-.04,abs(q.z)-w*.8),vec3(L,.012,.01),.003);
  return min(min(deck,posts),min(rail,beams)); }
float bridgeInk(vec3 q){ /* plank gaps / stone courses */
  if(fract(q.x/.025)<.1) return .35; return -1.; }

/* ---- garden gate, open; posts at x=+-w ---- */
float gate(vec3 q,float w,float h,float open){
  float posts=sdRBox(vec3(abs(q.x)-w,q.y-h*.55,q.z),vec3(.025,h*.55,.025),.005);
  float caps=sdSphere(vec3(abs(q.x)-w,q.y-h*1.12,q.z),.03);
  vec3 g=q-vec3(-w+.03,0,0); g.xz=rot(open)*g.xz;
  float frame=sdRBox(g-vec3(w*.95,h*.5,0),vec3(w*.95,h*.45,.01),.004);
  frame=max(frame,-sdRBox(g-vec3(w*.95,h*.5,0),vec3(w*.95-.018,h*.45-.018,.1),.002));
  float bars=sdRBox(vec3(mod(g.x,.06)-.03,g.y-h*.5,g.z),vec3(.005,h*.45,.005),.002);
  bars=max(bars,sdRBox(g-vec3(w*.95,h*.5,0),vec3(w*.95,h*.45,.1),.0));
  return min(min(posts,caps),min(frame,bars)); }
/* a signpost with two arrow boards */
float signpost(vec3 q,float h){
  float post=sdRBox(q-vec3(0,h*.5,0),vec3(.012,h*.5,.012),.003);
  vec3 a=q-vec3(.07,h*.85,0); float b1=sdRBox(a,vec3(.07,.018,.005),.003);
  b1=max(b1,dot(vec2(abs(a.y),a.x),normalize(vec2(1.,.8)))-.07*.8);
  vec3 c=q-vec3(-.06,h*.68,0); c.xz=rot(.5)*c.xz; float b2=sdRBox(c,vec3(.06,.017,.005),.003);
  b2=max(b2,dot(vec2(abs(c.y),-c.x),normalize(vec2(1.,.8)))-.06*.8);
  return min(post,min(b1,b2)); }

/* ---- a small model house: walls, pitched roof, chimney; windows and door recessed ---- */
float house(vec3 q,vec3 s){
  float w=sdRBox(q-vec3(0,s.y,0),s,.004);
  vec3 r=q-vec3(0,2.*s.y,0); float roof=max(abs(r.z)*.9+r.y*.95-s.z*1.05,-r.y); roof=max(roof,abs(r.x)-s.x-.02);
  roof=max(roof,-r.y+.0)-.004;
  float ch=sdRBox(q-vec3(s.x*.55,2.*s.y+s.z*.75,s.z*.3),vec3(.018,s.z*.45,.018),.003);
  vec2 wu=vec2(abs(q.x)-s.x*.52,q.y-s.y*1.15);
  float win=sdRBox(vec3(wu.x,wu.y,q.z+s.z),vec3(s.x*.2,s.y*.3,.008),.002);
  float dr=sdRBox(vec3(q.x,q.y-s.y*.5,q.z+s.z),vec3(s.x*.13,s.y*.5,.008),.002);
  return max(min(min(w,roof),ch),-min(win,dr)); }
float houseInk(vec3 q,vec3 s){
  vec2 wu=vec2(abs(q.x)-s.x*.52,q.y-s.y*1.15);
  if(q.z>-s.z+.003&&q.z<-s.z+.012&&abs(wu.x)<s.x*.2&&abs(wu.y)<s.y*.3){       /* lit window, with bars */
    if(abs(wu.x)<.003||abs(wu.y)<.003) return .3; return 1.; }
  if(q.z>-s.z+.003&&abs(q.x)<s.x*.13&&q.y<s.y) return .98;
  if(q.y<2.*s.y&&fract(q.y/.02)<.12) return .5;                   /* clapboards */
  return -1.; }
/* a stone to hold in the hand */
float stone(vec3 q,vec3 r){ return sdEll(q-vec3(0,r.y,0),r)+(vn3(q*60.)-.5)*.002; }
/* a candle in a low holder */
float candle(vec3 q){ return min(sdRCyl(q-vec3(0,.006,0),.04,.006,.003),min(sdCylY(q-vec3(0,.05,0),.015,.045),sdEll(q-vec3(0,.11,0),vec3(.006,.014,.006)))); }

/* ---- telescope on a short tripod, tube tilted up by a ---- */
float telescope(vec3 q,float a){
  vec3 t=q-vec3(0,.3,0); t.xy=rot(a)*t.xy;
  float tube=sdCone(t.yxz-vec3(0,0,0),.028,.036,.2); tube=sdCylX(t,.03,.2);
  float obj=sdCylX(t-vec3(.2,0,0),.038,.03);
  float eye=sdCylX(t-vec3(-.23,0,0),.012,.04);
  float band=sdCylX(t,.034,.012);
  float legs=1e3; for(int i=0;i<3;i++){ float b=float(i)*2.094+.4; legs=min(legs,sdCapsule(q,vec3(0,.29,0),vec3(.16*cos(b),0,.16*sin(b)),.007)); }
  return min(min(min(tube,obj),min(eye,band)),legs); }
float bookStack(vec3 q){ float d=1e3;
  for(int i=0;i<3;i++){ vec3 b=q-vec3(.01*float(i),.018+float(i)*.036,0); b.xz=rot(float(i)*.2-.2)*b.xz; d=min(d,sdRBox(b,vec3(.12-.01*float(i),.017,.085),.004)); }
  return d; }
float sdStar5(vec2 p,float r,float rf){ const vec2 k1=vec2(0.809016994375,-0.587785252292); const vec2 k2=vec2(-k1.x,k1.y);
  p.x=abs(p.x); p-=2.0*max(dot(k1,p),0.0)*k1; p-=2.0*max(dot(k2,p),0.0)*k2; p.x=abs(p.x); p.y-=r;
  vec2 ba=rf*vec2(-k1.y,k1.x)-vec2(0,1); float h=clamp(dot(p,ba)/dot(ba,ba),0.0,r); return length(p-ba*h)*sign(p.y*ba.x-p.x*ba.y); }
float star5(vec3 q,float r){ float d=sdStar5(q.xy,r,.45); return length(max(vec2(d,abs(q.z)-.003),0.))+min(max(d,abs(q.z)-.003),0.)-.001; }
float brush(vec3 q){ float h=sdCapsule(q,vec3(-.12,.008,0),vec3(.06,.008,0),.006);
  vec3 t=q-vec3(.085,.008,0); float tip=sdCone(t.yxz,.008,.0005,.026); tip=max(length(t.yz)-.008*(1.-(t.x+.026)/.052),abs(t.x)-.026);
  return min(h,tip); }

/* ---- a frog hand puppet, sitting upright ---- */
float frog(vec3 q){
  float body=sdEll(q-vec3(0,.1,0),vec3(.08,.11,.07));
  float head=sdEll(q-vec3(0,.23,-.01),vec3(.095,.06,.075));
  float d=smin(body,head,.03);
  vec3 e=vec3(abs(q.x)-.045,q.y-.28,q.z+.02); d=smin(d,length(e)-.028,.012);
  vec3 a=vec3(abs(q.x)-.085,q.y-.12,q.z+.02); d=smin(d,sdCapsule(a,vec3(0,.04,0),vec3(.02,-.02,-.03),.018),.02);
  d=smin(d,sdEll(vec3(abs(q.x)-.06,q.y-.012,q.z+.05),vec3(.035,.012,.04)),.02);
  return d; }
float frogInk(vec3 q){
  vec3 e=vec3(abs(q.x)-.045,q.y-.285,q.z+.045); if(length(e.xy)<.011&&q.z<-.03) return .1;     /* pupils */
  vec2 m=vec2(q.x,q.y-.205); if(q.z<-.06&&abs(length(m-vec2(0,.05))-.06)<.0028&&m.y<.02) return .2; /* smile */
  vec3 h=q-vec3(0,.11,-.07); vec2 hp=h.xy*14.; hp.y-=sqrt(abs(hp.x))*.4;
  if(q.z<-.04&&length(hp)<.28&&h.y>-.05) return .25;                /* a small heart stitched on */
  return -1.; }
/* a small chalkboard on an easel */
float chalkboard(vec3 q,vec2 s){
  vec3 b=q-vec3(0,s.y+.08,0); b.yz=rot(.12)*b.yz;
  float fr=sdRBox(b,vec3(s.x,s.y,.012),.004);
  float board=sdRBox(b-vec3(0,0,-.006),vec3(s.x-.02,s.y-.02,.01),.002);
  float legs=min(sdCapsule(vec3(abs(q.x)-s.x*.8,q.y,q.z),vec3(0,0,-.03),vec3(0,s.y*2.1,.02),.008),sdCapsule(q,vec3(0,0,.25),vec3(0,s.y*1.9,.06),.008));
  float tray=sdRBox(q-vec3(0,.075,-.03),vec3(s.x,.006,.02),.003);
  return min(max(fr,-board+.004),min(board,min(legs,tray))); }
float heartShape(vec2 p){ p.x=abs(p.x); if(p.y+p.x>1.) return sqrt(dot(p-vec2(.25,.75),p-vec2(.25,.75)))-sqrt(2.)/4.;
  return sqrt(min(dot(p-vec2(0,1),p-vec2(0,1)),dot(p-.5*max(p.x+p.y,0.),p-.5*max(p.x+p.y,0.))))*sign(p.x-p.y); }
/* a wooden box / crate */
float woodBox(vec3 q,vec3 s){ return sdRBox(q-vec3(0,s.y,0),s,.006); }

/* ---- a row of school lockers standing on the floor, doors facing -z ---- */
float lockers(vec3 q,float n,vec3 s){ /* s = one locker's half size */
  float body=sdRBox(q-vec3(0,s.y,0),vec3(s.x*n,s.y,s.z),.004);
  float x=q.x+s.x*n; float cell=mod(x,2.*s.x)-s.x;
  float seam=sdBox(vec3(cell,q.y-s.y,q.z+s.z),vec3(.002,s.y*.98,.003));
  float vents=1e3;
  float handle=sdRBox(vec3(cell-s.x*.6,q.y-s.y*1.,q.z+s.z+.006),vec3(.006,.03,.006),.002);
  float hook=sdCapsule(vec3(cell,q.y-s.y*1.55,q.z+s.z),vec3(0,0,0),vec3(0,-.02,-.03),.004);
  return min(max(body,-seam),min(handle,hook)); }
float lockersInk(vec3 q,float n,vec3 s){
  float x=q.x+s.x*n; float cell=mod(x,2.*s.x)-s.x;
  if(q.z<-s.z+.004&&abs(q.y-s.y*1.75)<s.y*.12&&abs(cell)<s.x*.6&&fract(q.y/.012)<.35) return .2;   /* vents */
  if(q.z<-s.z+.004&&abs(abs(cell)-s.x*.9)<.003) return .35;
  return -1.; }
float phone(vec3 q){ return sdRBox(q-vec3(0,.005,0),vec3(.037,.005,.075),.008); }
float phoneInk(vec3 q){ if(q.y>.008&&abs(q.x)<.031&&abs(q.z)<.066) return .22; return -1.; }

/* a cork board on the wall with sticky notes (board faces -z, centre c on the wall plane) */
float stickyNotes(vec3 q){ float d=1e3;
  for(int i=0;i<12;i++){ float fi=float(i); vec2 c=vec2(mod(fi,4.)*.1-.15,floor(fi/4.)*.1-.1)+vec2(sin(fi*3.1),cos(fi*1.7))*.012;
    vec3 n=q-vec3(c,0.); n.xy=rot(sin(fi*2.3)*.12)*n.xy; d=min(d,sdRBox(n,vec3(.035,.035,.0015),.001)); }
  return d; }
float stickyInk(vec3 q){ vec2 u=q.xy; float l=fract(u.y/.014); if(l<.14&&fract(u.x/.1+.5)>.2&&fract(u.x/.1+.5)<.75) return .5; return -1.; }
/* a suitcase standing up, handle on top */
float suitcase(vec3 q,vec3 s){
  float b=sdRBox(q-vec3(0,s.y,0),s,.02);
  float h=max(sdTorus((q-vec3(0,2.*s.y,0)).xzy,.04,.008),-(q.y-2.*s.y));
  return min(b,h); }
/* a pair of shoes, side by side */
float shoe(vec3 q){ float d=sdEll(q-vec3(0,.035,0),vec3(.045,.035,.12)); d=max(d,-q.y);
  float op=sdEll(q-vec3(0,.075,.04),vec3(.03,.03,.05)); return max(d,-op); }
