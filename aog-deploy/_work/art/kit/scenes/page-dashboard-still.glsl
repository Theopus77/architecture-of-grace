/* Dashboard page — pencil still life of a teacher's desk: a pencil cup holding sharpened pencils
   (a ruler hidden among them), an apple, and an open spiral-bound week planner with boxed days and hint-lines. */
#define CAM_POS vec3(-0.4908,0.4055,-0.8210)
#define CAM_TGT vec3(-0.1823,-0.0172,0.0703)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define PC vec3(-.02,0.,.12)
#define PCR .042
#define PCH .11
#define AP vec3(-.14,0.,.02)
#define PL vec3(.15,0.,-.04)
#define PLR .28
/* standing pencils: base inside the cup, tilted outward */
vec3 pencilQ(vec3 p,int i){ float f=float(i);
  vec3 b=PC+vec3(.012*cos(f*2.2),.0,.012*sin(f*2.2)); vec3 q=p-b;
  q.xz=rot(f*1.7+.3)*q.xz; q.xy=rot(.1+.05*f)*q.xy; return q; }
float pLen(int i){ return i==0?.082:i==1?.07:.076; }
float pencils(vec3 p){ float d=1e3;
  for(int i=0;i<3;i++){ vec3 q=pencilQ(p,i); float L=pLen(i); d=min(d,pencilL(vec3(q.y-L-.02,q.x,q.z),L)); }
  return d; }
float pencilsT(vec3 p){ float best=1e3; float t=.6;
  for(int i=0;i<3;i++){ vec3 q=pencilQ(p,i); float L=pLen(i); vec3 u=vec3(q.y-L-.02,q.x,q.z);
    float d=pencilL(u,L); if(d<best){ best=d; t=pencilT(u,L); } }
  return t; }
float rulerS(vec3 p){ vec3 q=p-PC-vec3(-.015,0.,-.004); q.xz=rot(.6)*q.xz; q.xy=rot(-.14)*q.xy;
  return sdRBox(q-vec3(0.,.1,0.),vec3(.012,.1,.0015),.0008); }
float rulerT(vec3 p){ vec3 q=p-PC-vec3(-.015,0.,-.004); q.xz=rot(.6)*q.xz; q.xy=rot(-.14)*q.xy;
  float f=fract(q.y/.005); if(q.x>.004&&f<.18&&q.x>(fract(q.y/.025)<.2?-.002:.005)) return .25; return .8; }
float cupD(vec3 q){ float o=sdCylY(q-vec3(0.,PCH*.5,0.),PCR,PCH*.5)-.002;
  float i=sdCylY(q-vec3(0.,PCH*.5+.006,0.),PCR-.004,PCH*.5);
  return max(o,-i); }
float cupT(vec3 q){ if(length(q.xz)<PCR-.003) return .2;
  if(abs(q.y-PCH*.22)<.003||abs(q.y-PCH*.82)<.003) return .35; return .55; }
/* open week planner: spine along z, spiral in the middle */
vec3 plq(vec3 p){ return P(p,PL,PLR); }
float planD(vec3 q){ float w=.085, dd=.11;
  float x=abs(q.x);
  float pages=sdBox(vec3(x-w-.006,q.y-.007,q.z),vec3(w,.0035,dd))-.0006;
  float cover=sdRBox(vec3(x-w-.006,q.y-.002,q.z),vec3(w+.004,.002,dd+.004),.001);
  return min(pages,cover); }
float spiralD(vec3 q){ float dd=.11; float z=q.z-clamp(floor(q.z/.012+.5)*.012,-dd+.006,dd-.006);
  return sdTorus(vec3(q.x,q.y-.009,z).xzy,.0065,.0012); }
float planT(vec3 q){ float w=.085, dd=.11; float x=abs(q.x)-.006; if(q.y<.0095) return .45;
  if(x<.004) return .9;
  vec2 u=vec2(x-w,q.z);                                     /* page coords, centred */
  if(u.y>dd-.02){ if(abs(u.y-(dd-.01))<.0025&&abs(u.x)<w*.55) return .3; return .95; }   /* a heading bar */
  /* each page: three boxed days stacked, a thin rule line inside each */
  float bh=(2.*dd-.03)/3.; float yy=u.y+dd-.005; float k=fract(yy/bh);
  if(abs(u.x)>w-.01) return .95;
  if(abs(abs(u.x)-(w-.012))<.0012||k*bh<.0012) return .38;
  float kk=k*bh; if(kk>.012&&abs(fract(kk/.017)-.5)<.07&&u.x>-w+.02&&u.x<w-.03*h1(vec2(floor(yy/.017),sign(q.x)))) return .6;
  if(kk<.012&&kk>.004&&u.x<-w+.03&&u.x>-w+.014) return .3;  /* a short day label bar */
  return .95; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,cupD(p-PC),3.);
  r=U(r,pencils(p),4.);
  r=U(r,rulerS(p),5.);
  vec3 a=P(p,AP,.5);
  r=U(r,apple(a,.048,0.),6.);
  float lf=sdEll(P(a-vec3(0.,.048*2.1,0.),vec3(.012,0.,0.),.0)*vec3(1.,1.,1.),vec3(.018,.0018,.008));
  r=U(r,lf,7.);
  vec3 q=plq(p);
  r=U(r,planD(q),8.);
  r=U(r,spiralD(q),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return cupT(p-PC);
  if(id==4.) return pencilsT(p);
  if(id==5.) return rulerT(p);
  if(id==6.) return appleT(P(p,AP,.5),.048);
  if(id==7.) return .4;
  if(id==8.) return planT(plq(p));
  if(id==9.) return .3;
  return .7; }
