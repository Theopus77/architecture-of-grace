/* Qur'an Unit 12 "Close Reading Meccan Surahs" — pencil still life: a magnifying glass resting on the right page of a book lying open, with a clay oil lamp and its small flame beside it.
   Pages carry only an ornamental frame and hint-lines, never words. No figures. */
#define CAM_POS vec3(-0.4974,0.2769,-0.6397)
#define CAM_TGT vec3(-0.2368,0.0165,0.0675)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
float sdEll(vec3 p,vec3 r){ float k0=length(p/r); float k1=length(p/(r*r)); return k0*(k0-1.)/max(k1,1e-6); }
vec3 place(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return q; }
/* closed book lying flat: bottom at y=0, half size s, spine along -x, page block open on three sides */
vec2 bookC(vec3 q,vec3 s){
  float cover=sdRBox(q-vec3(0.,s.y,0.),s,.0025);
  cover=max(cover,-sdBox(q-vec3(.012,s.y,0.),vec3(s.x,s.y-.0045,s.z+.01)));
  float spine=sdCylZ(vec3((q.x+s.x-.004)*1.6,q.y-s.y,q.z),s.y*1.02,s.z);   /* rounded spine */
  cover=min(cover,max(spine,q.x+s.x-.004));
  float pages=sdBox(q-vec3(.003,s.y,0.),vec3(s.x-.008,s.y-.005,s.z-.004));
  return vec2(pages,cover); }
/* tone of a closed book's cover: ornamental frame on the top face, bands on the spine */
float coverT(vec3 q,vec3 s,float base){
  if(q.y>2.*s.y-.0015){ vec2 b=abs(q.xz)-vec2(s.x-.016,s.z-.016); float m=max(b.x,b.y);
    if(abs(m)<.0016||abs(m+.006)<.0011) return base-.2;
    float c=length(q.xz*vec2(1.,1.))-.022; if(abs(c)<.0015||abs(c+.01)<.001) return base-.2; }
  if(q.x<-s.x+.006){ float b=abs(fract(q.z/(s.z*.5)+.5)-.5)*s.z*.5; if(b<.0035) return base-.18; }
  return base; }
/* open book (the ELA book scaled by k): lying flat, spine along z */
vec2 bookO(vec3 q,float k){ q/=k; float x=abs(q.x);
  float lift=.026*sin(clamp(x/.13,0.,1.)*1.9)-.016*exp(-x*55.)+.008;
  float pages=sdBox(vec3(x-.066,q.y-lift*.5-.006,q.z),vec3(.064,max(lift*.5,.003),.088))-.0015;
  float cover=sdRBox(vec3(x-.07,q.y-.0035,q.z),vec3(.073,.0035,.095),.0015);
  return vec2(pages,cover)*k; }
/* page marks: an ornamental frame and hint-lines, never words */
float pageT(vec3 q,float k){ q/=k; float x=abs(q.x); float a=.95;
  vec2 b=abs(vec2(x-.066,q.z))-vec2(.05,.072); float m=max(b.x,b.y);
  if(abs(m)<.0018||abs(m+.006)<.001) a=.45;
  if(m<-.011){ float l=fract((q.z+.2)/.012); if(l<.22) a=.64; }
  if(x<.004) a=.7; return a; }
/* a Talmud-style page: a central block of lines, commentary in finer lines around it */
float pageTal(vec3 q,float k){ q/=k; float x=abs(q.x); float a=.95; vec2 u=vec2(x-.066,q.z);
  vec2 b=abs(u)-vec2(.052,.074); float m=max(b.x,b.y);
  if(m>0.){ if(x<.004) a=.7; return a; }
  float c=sdBox2(u-vec2(0.,.008),vec2(.022,.04));
  if(c<0.){ float l=fract((q.z+.2)/.01); if(l<.28) a=.5; }
  else if(c>.006&&m<-.002){ float l=fract((q.z+.2)/.006); if(l<.3) a=.68; }
  if(abs(q.z-.064)<.005&&abs(u.x)<.016) a=.35;   /* the heading word-block, a plain bar */
  return a; }
/* the clay oil lamp of the Bible still life, at c, scale s, turned a */
float lampL(vec3 q){
  float body=(length((q-vec3(0,.026,0))/vec3(.058,.03,.05))-1.)*.03;
  float spout=sdCapsule(q,vec3(.03,.035,0),vec3(.085,.045,0),.012);
  spout=max(spout,-sdCapsule(q,vec3(.06,.05,0),vec3(.09,.056,0),.006));
  float body2=smin(body,spout,.01); body2=max(body2,-(length(q-vec3(-.005,.064,0))-.012));
  float handle=sdTorus((q-vec3(-.06,.035,0)).xzy,.017,.004);
  float foot=sdCylY(q-vec3(0,.004,0),.03,.004);
  return min(min(body2,handle),foot); }
float lampAt(vec3 p,vec3 c,float s,float a){ vec3 q=place(p,c,a)/s; if(length(q)>.2) return length(q)*s-.1*s; return lampL(q)*s; }
float flameL(vec3 q){ float t=clamp((q.y+.006)/.05,0.,1.); float r=.0105*pow(sin(3.1416*pow(t,.62)),.8)*(1.-.15*t);
  float d=length(q.xz)-r; d=max(d,max(-q.y-.006,q.y-.044)); return d*.7; }
float lampFlame(vec3 p,vec3 c,float s,float a){ vec3 q=place(p,c,a)/s-vec3(.088,.07,0.); return flameL(q)*s; }
/* a candlestick with a candle; base at y=0 */
float stickD(vec3 q){ if(length(q.xz)>.08) return length(q.xz)-.06;
  float d=sdCone(q-vec3(0,.011,0),.05,.03,.011)-.002;
  d=min(d,sdCone(q-vec3(0,.03,0),.02,.009,.01));
  d=min(d,sdCylY(q-vec3(0,.08,0),.0085,.05));
  d=min(d,sdTorus(q-vec3(0,.062,0),.011,.005)); d=min(d,sdTorus(q-vec3(0,.105,0),.01,.0045));
  d=min(d,sdCone(q-vec3(0,.134,0),.012,.026,.006)-.001);
  return d; }
float candleD(vec3 q){ float d=sdCylY(q-vec3(0,.2,0),.0115,.058)-.001; d=min(d,sdCylY(q-vec3(0,.263,0),.0012,.006)); return d; }
float candleFlame(vec3 q){ return flameL((q-vec3(0,.268,0))*1.)*1.; }
/* shallow bowl, bottom at y=0 */
float bowlD(vec3 q,float R,float h){ vec3 c=q-vec3(0,R,0); float s=abs(length(c)-R)-.0025; return max(s,q.y-h); }
/* coin */
float coinD(vec3 q){ return sdCylY(q-vec3(0,.0018,0),.0125,.0012)-.0006; }
/* a scroll lying on the table: two rolls on rods with a band of sheet between */
float scrollD(vec3 q){ if(length(q)>.2) return length(q)-.16; float d=1e5;
  for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 c=q-vec3(0.,.024,s*.03);
    d=min(d,sdCylX(c,.022,.085)-.001); d=min(d,sdCylX(c,.005,.125));
    d=min(d,sdCylX(c-vec3(.1,0,0),.017,.003)-.001); d=min(d,sdCylX(c+vec3(.1,0,0),.017,.003)-.001);
    d=min(d,length(c-vec3(.13,0,0))-.008); d=min(d,length(c+vec3(.13,0,0))-.008); }
  d=min(d,sdBox(q-vec3(0.,.0015,0.),vec3(.085,.0012,.03))); return d; }
/* a balance scale; base at y=0, beam along x */
float scaleD(vec3 q){ if(length(q-vec3(0,.15,0))>.34) return length(q-vec3(0,.15,0))-.3;
  float d=sdCone(q-vec3(0,.012,0),.07,.05,.012)-.002;
  d=min(d,sdCylY(q-vec3(0,.15,0),.008,.14)); d=min(d,length(q-vec3(0,.3,0))-.014);
  d=min(d,sdTorus(q-vec3(0,.04,0),.012,.005));
  d=min(d,sdCapsule(q,vec3(-.16,.28,0),vec3(.16,.28,0),.0055));
  d=min(d,sdCone(q-vec3(0,.265,-.001),.004,.001,.03));
  for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 c=q-vec3(s*.16,0.,0.);
    d=min(d,length(c-vec3(0,.28,0))-.009);
    for(int j=0;j<3;j++){ float a=float(j)*2.094+.5; vec3 e=vec3(cos(a)*.052,.1,sin(a)*.052);
      d=min(d,sdCapsule(c,vec3(0,.28,0),e+vec3(0,.02,0),.0013)); }
    d=min(d,bowlD(c-vec3(0,.085,0),.08,.035)); }
  return d; }
/* a plain clay jug with a handle; base at y=0 */
float jugD(vec3 q,float H){ if(length(q-vec3(0,H*.5,0))>H*.8) return length(q-vec3(0,H*.5,0))-H*.7;
  float y=q.y/H; float body=.16+.24*sin(3.1416*clamp(y/.8,0.,1.)); float r=mix(body,.12,smoothstep(.62,.82,y))+.03*smoothstep(.93,1.,y);
  r*=H; float d=(length(q.xz)-r)*.7; d=max(d,max(-q.y,q.y-H));
  d=max(d,-max(length(q.xz)-r+.004,H*.9-q.y));
  float hd=sdTorus((q-vec3(-.25*H,.66*H,0)).xzy,.12*H,.02*H);
  return min(d,hd); }
/* a potted plant pot; base at y=0, height h */
float potD(vec3 q,float r,float h){ float y=q.y; float rr=r*(.78+.22*y/h); float d=(length(q.xz)-rr)*.9; d=max(d,max(-y,y-h));
  d=min(d,sdTorus(q-vec3(0,h,0),rr+.002,.008)); return d; }
/* a leaf: flattened ellipsoid along its local x, bent down */
float leafD(vec3 q,float L,float W){ q.y+=1.2*q.x*q.x/L; return sdEll(q-vec3(L,0,0),vec3(L,.003,W)); }
/* a magnifying glass lying on the table: lens centre c, handle toward +x (turned a) */
float magD(vec3 q){ vec3 r=q-vec3(0,.012,0);
  float ring=sdTorus(r,.055,.006); float lens=sdEll(r,vec3(.053,.004,.053));
  float h=sdCapsule(r,vec3(.062,0,0),vec3(.19,.006,0),.009);
  float fer=sdCylX(r-vec3(.068,0,0),.011,.008)-.001;
  return min(min(ring,lens),min(h,fer)); }
/* a reed pen: tapered, with a cut nib at +x */
float reedD(vec3 q,float L){ float t=clamp(q.x/L*.5+.5,0.,1.); float r=.0055*(1.-.25*t); if(t>.9) r*=1.-(t-.9)*9.;
  return max(length(q.yz)-r,abs(q.x)-L)*.9; }
/* ink pot, base at y=0 */
float inkD(vec3 q){ float y=q.y; float r=.03-.012*smoothstep(.035,.045,y); float d=(length(q.xz)-r)*.9; d=max(d,max(-y,y-.052));
  d=min(d,sdTorus(q-vec3(0,.052,0),.017,.004)); d=max(d,-(sdCylY(q-vec3(0,.05,0),.013,.02))); return d; }
/* a standing book, spine toward -z (the viewer), bottom at y=0, s = (depth, thickness, height)/2 */
vec3 bsQ(vec3 q,vec3 s){ return vec3(q.z,q.x+s.y,q.y-s.z); }
/* a palm frond or long leaf from the origin along +x: arching, with a midrib */
float frondD(vec3 q,float L,float W){ float t=clamp(q.x/L,0.,1.); q.y-=.35*L*sin(t*1.5)-.9*L*t*t; float w=W*sin(3.1416*pow(t,.7))+.002;
  return max(max(abs(q.z)-w,abs(q.y)-.0025),max(-q.x,q.x-L))*.8; }
/* a potted palm: pot r, trunk height h, n fronds */
float palmD(vec3 q,float h){ if(length(q-vec3(0,h*.7,0))>h*1.4) return length(q-vec3(0,h*.7,0))-h*1.2;
  float d=sdCone(q-vec3(0,h*.5,0),.018,.012,h*.5)+.002*sin(q.y*300.)*0.;
  for(int i=0;i<8;i++){ float a=float(i)*.785+.3; vec3 c=q-vec3(0,h,0); c.xz=rot(a)*c.xz; float up=mod(float(i),2.)<.5?.5:.15; c.xy=rot(-up)*c.xy;
    d=min(d,frondD(c,h*.75,h*.12)); }
  return d; }
/* spectacles lying flat, lenses along x, temples toward +z */
float specD(vec3 q){ if(length(q)>.12) return length(q)-.09;
  float a=sdTorus(q-vec3(-.027,.0035,0),.021,.0024), b=sdTorus(q-vec3(.027,.0035,0),.021,.0024);
  float lens=min(sdEll(q-vec3(-.027,.0035,0),vec3(.02,.0012,.02)),sdEll(q-vec3(.027,.0035,0),vec3(.02,.0012,.02)));
  float br=sdCapsule(q,vec3(-.007,.006,-.006),vec3(.007,.006,-.006),.002);
  float t=min(sdCapsule(q,vec3(-.048,.0035,.003),vec3(-.045,.003,.085),.0017),sdCapsule(q,vec3(.048,.0035,.003),vec3(.045,.003,.085),.0017));
  return min(min(a,b),min(min(lens,br),t)); }
/* a quill: shaft up local y, vane toward +x */
float quillD(vec3 q,float L){ float s=sdCapsule(q,vec3(0),vec3(0,L,0),.0022);
  vec3 v=q-vec3(.009,L*.64,0); v.xy=rot(-.06)*v.xy; float vane=sdEll(v,vec3(.017,L*.36,.0015));
  vane=max(vane,-(q.y-L*.3)); return min(s,vane); }
/* an octagon in 2D */
float oct2(vec2 p,float r){ p=abs(p); return max(max(p.x,p.y),(p.x+p.y)*.7071)-r; }
/* a lantern with pierced panels (fanous): base at y=0 */
float lanternD(vec3 q){ if(length(q-vec3(0,.15,0))>.24) return length(q-vec3(0,.15,0))-.2;
  float foot=max(oct2(q.xz,.05-.012*clamp(q.y/.025,0.,1.)),abs(q.y-.0125)-.0125);
  float body=max(oct2(q.xz,.062),abs(q.y-.11)-.085);
  float band=max(oct2(q.xz,.068),abs(q.y-.03)-.006); float band2=max(oct2(q.xz,.068),abs(q.y-.19)-.006);
  float t=clamp((q.y-.196)/.08,0.,1.); float roof=max(oct2(q.xz,.07*(1.-t)+.01*t),abs(q.y-.236)-.04);
  float fin=length(q-vec3(0,.285,0))-.013; float ring=sdTorus((q-vec3(0,.313,0)).xzy,.017,.0035);
  return min(min(min(foot,body),min(band,band2)),min(roof,min(fin,ring))); }
float lanternT(vec3 q){ if(q.y<.025||q.y>.196) return .45; if(abs(q.y-.03)<.007||abs(q.y-.19)<.007) return .35;
  float a=atan(q.z,q.x); float seg=mod(a+3.1416/8.,3.1416/4.)-3.1416/8.; if(abs(seg)>.36) return .3;   /* the frame edges */
  vec2 u=vec2(seg*.065,q.y-.11); vec2 c=vec2(u.x,mod(u.y+.013,.026)-.013);
  vec2 aa=abs(c); vec2 rr=abs(rot(.785)*c); float st=min(max(aa.x,aa.y),max(rr.x,rr.y));
  if(st<.0065) return .2; if(abs(st-.009)<.0012) return .4; return .7; }
/* the rahle, the X-shaped folding book stand of the first Qur'an still life, scaled by S (base at y=0) */
float star2(vec2 f){ vec2 a=abs(f); vec2 r=abs(rot(.785398)*f); return min(max(a.x,a.y),max(r.x,r.y)); }
float rBoard(vec3 q,float s){
  vec3 a=q-vec3(0,.26,0); a.yz=rot(s*.62)*a.yz;
  float d=sdRBox(a,vec3(.2,.34,.009),.003);
  float st=star2((a.xy-vec2(0.,-.19))/.07)*.07-.03; d=max(d,-st);
  d=max(d,-(length(vec2(a.x,(a.y+.34)*.8))-.1));
  return d; }
float rahleL(vec3 q){ float d=min(rBoard(q,1.),rBoard(q,-1.)); return max(d,-q.y); }
vec3 rbq(vec3 q){ q-=vec3(0.,.565,-.02); q.yz=rot(-.62)*q.yz; return q; }
vec2 rBook(vec3 q){ q=rbq(q)/1.22; float x=abs(q.x);
  float curl=.02*sin(clamp(x/.2,0.,1.)*3.1416)+.022*(1.-exp(-x*25.));
  float pages=sdBox(vec3(x-.1,q.y-curl*.8,q.z),vec3(.097,.014,.14))-.001;
  float cover=sdRBox(vec3(x-.104,q.y+.014+curl*.3,q.z),vec3(.107,.004,.149),.002);
  return vec2(pages,cover)*1.22; }
float rPageT(vec3 q){ q=rbq(q)/1.22; float x=abs(q.x); float a=.94;
  vec2 b=abs(vec2(x-.1,q.z))-vec2(.078,.118); float m=max(b.x,b.y);
  if(abs(m)<.002||abs(m+.007)<.0012) a=.45;
  if(m<-.012){ float l=fract((q.z+.2)/.0155); if(l<.2) a=.66; }
  if(abs(q.z-.098)<.009&&abs(x-.1)<.05&&m<-.009) a=.55;
  if(x<.008) a=.72; return a; }
/* a small tabletop lectern: base, post and a slanted board; returns the board's frame via bq */
vec3 lecB(vec3 q){ vec3 b=q-vec3(0,.2,0); b.yz=rot(-.45)*b.yz; return b; }
float lecternD(vec3 q){ if(length(q-vec3(0,.12,0))>.3) return length(q-vec3(0,.12,0))-.25;
  float base=sdRBox(q-vec3(0,.01,0),vec3(.08,.01,.07),.004);
  float post=sdRBox(q-vec3(0,.1,.01),vec3(.018,.09,.018),.003);
  vec3 b=lecB(q); float board=sdRBox(b-vec3(0,-.008,0),vec3(.14,.008,.1),.003);
  float lip=sdRBox(b-vec3(0,.006,-.098),vec3(.14,.01,.005),.002);
  return min(min(base,post),min(board,lip)); }
/* a feathered carob-like young tree: trunk and leafy clusters (two ids) */
float trunkD(vec3 q){ float d=sdCapsule(q,vec3(0,0,0),vec3(.01,.16,0),.011);
  d=smin(d,sdCapsule(q,vec3(.01,.15,0),vec3(-.06,.23,.01),.006),.01);
  d=smin(d,sdCapsule(q,vec3(.01,.15,0),vec3(.08,.24,-.01),.006),.01);
  d=smin(d,sdCapsule(q,vec3(.01,.16,0),vec3(.01,.27,.03),.006),.01); return d; }
float crownD(vec3 q){ if(length(q-vec3(0,.26,0))>.2) return length(q-vec3(0,.26,0))-.16;
  float d=sdEll(q-vec3(-.07,.25,.01),vec3(.065,.045,.06)); d=smin(d,sdEll(q-vec3(.085,.26,-.01),vec3(.07,.05,.06)),.03);
  d=smin(d,sdEll(q-vec3(.01,.3,.03),vec3(.08,.05,.07)),.03);
  return (d+.018*fbm3(q*45.)-.006)*.7; }


vec3 oQ0(vec3 p){ return place(p,vec3(-.02,0.,.06),-0.12); }
vec3 oQ(vec3 p){ vec3 q=oQ0(p); q.y-=0.03; q.yz=rot(-0.3)*q.yz; return q; }
float oProp(vec3 p){ vec3 q=oQ0(p); return sdRBox(q-vec3(0,0.03*.6,.07),vec3(.18,0.03*.6,.05),.006); }

#define LP vec3(.33,0.,.1)
float mag(vec3 p){ vec3 q=oQ(p)/1.5; q-=vec3(.075,.03,-.01); q.xz=rot(.6)*q.xz; q.xy=rot(.07)*q.xy; return magD(q)*1.5; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,1.4-p.z,2.);
  vec2 b=bookO(oQ(p),1.5); r=U(r,b.x,3.); r=U(r,min(b.y,oProp(p)),4.); r=U(r,mag(p),5.);
  r=U(r,lampAt(p,LP,1.2,3.4),6.); r=U(r,lampFlame(p,LP,1.2,3.4),7.); return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return pageT(oQ(p),1.5); if(id==4.) return .35; if(id==7.) return .97;
  if(id==5.){ vec3 q=oQ(p)/1.5; q-=vec3(.075,.03,-.01); q.xz=rot(.6)*q.xz; if(length(q.xz)<.05) return .93; return .35; }
  return .5; }

