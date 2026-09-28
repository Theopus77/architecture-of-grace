/* Home door "Professional Development" — pencil still life on the drafting table: a stack of three
   teacher's notebooks, a mug of tea beside them, a pair of round reading glasses folded in front,
   and a pencil. For the grown-ups first. Hint-lines only, never words. */
#define CAM_POS vec3(-0.4010,0.2447,-0.5497)
#define CAM_TGT vec3(-0.1899,-0.0444,0.0601)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define BK vec3(-.04,0.,.05)
#define MG vec3(.14,0.,.09)
#define GL vec3(.05,0.,-.1)
#define PN vec3(-.1,.0068,-.1)
vec3 glQ(vec3 p){ vec3 q=p-GL; q.xz=rot(-.2)*q.xz; return q; }
float glassesD(vec3 p){ vec3 q=glQ(p);
  vec3 f=q-vec3(0.,.022,0.); f.yz=rot(-.25)*f.yz;
  vec3 e=vec3(abs(f.x)-.03,f.y,f.z);
  float rim=sdTorus(e.xzy,.022,.0022);
  float bridge=sdCapsule(f,vec3(-.009,.008,0.),vec3(.009,.008,0.),.0018);
  bridge=min(bridge,sdTorus((f-vec3(0.,.004,0.)).xzy,.008,.0016)+max(0.,-(f.y-.006)));
  float t1=sdCapsule(f,vec3(.052,.004,.003),vec3(-.03,.004,.012),.0017);
  float t2=sdCapsule(f,vec3(-.052,.0,.004),vec3(.03,-.002,.02),.0017);
  float lens=max(sdCylZ(vec3(e.x,e.y,f.z),.021,.0008),0.);
  return min(min(min(rim,bridge),min(t1,t2)),lens); }
vec2 books(vec3 p){ vec2 r=vec2(1e5);
  vec3 h1=vec3(.11,.014,.08), h2=vec3(.1,.013,.074), h3=vec3(.095,.012,.07);
  vec2 a=bookC(P(p,BK+vec3(0.,h1.y,0.),.08),h1);
  vec2 b=bookC(P(p,BK+vec3(.006,2.*h1.y+h2.y,0.),-.12),h2);
  vec2 c=bookC(P(p,BK+vec3(-.004,2.*h1.y+2.*h2.y+h3.y,.004),.25),h3);
  r.x=min(a.x,min(b.x,c.x)); r.y=min(a.y,min(b.y,c.y)); return r; }
float booksT(vec3 p){
  vec3 h1=vec3(.11,.014,.08), h2=vec3(.1,.013,.074), h3=vec3(.095,.012,.07);
  float y=p.y;
  if(y<2.*h1.y) return bookCT(P(p,BK+vec3(0.,h1.y,0.),.08),h1,.45);
  if(y<2.*h1.y+2.*h2.y) return bookCT(P(p,BK+vec3(.006,2.*h1.y+h2.y,0.),-.12),h2,.62);
  return bookCT(P(p,BK+vec3(-.004,2.*h1.y+2.*h2.y+h3.y,.004),.25),h3,.5); }
float pen(vec3 p){ vec3 q=p-PN; q.xz=rot(.35)*q.xz; return pencilL(q,.08); }
float penT(vec3 p){ vec3 q=p-PN; q.xz=rot(.35)*q.xz; return pencilT(q,.08); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 b=books(p); r=U(r,b.x,3.); r=U(r,b.y,4.);
  r=U(r,mug(P(p,MG,.6),.034,.085),5.);
  r=U(r,glassesD(p),6.);
  r=U(r,pen(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return booksT(p);
  if(id==4.) return fract(p.y/.0026)<.3?.72:.93;
  if(id==5.) return mugT(P(p,MG,.6),.034,.085,.62);
  if(id==6.) return .25;
  if(id==7.) return penT(p);
  return .7; }
