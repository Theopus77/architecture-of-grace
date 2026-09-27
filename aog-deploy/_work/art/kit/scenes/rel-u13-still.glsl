/* World Religions Unit 13 "How to Read a Sacred Text" (Three Books Behind the Glass) —
   pencil still life: a large old book lying open and tipped toward us, two closed books
   stacked behind it, and a pair of round reading glasses on the table. No figures,
   no real words. */
#define CAM_POS vec3(-0.2875,0.2607,-0.5878)
#define CAM_TGT vec3(-0.1866,-0.0646,0.0903)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define SH vec3(.0,0.,.08)
#define SR .22
/* an upright book: spine toward the viewer (-z), height h, thickness t, depth dd */
float ubook(vec3 q,float h,float t,float dd){
  float cover=sdRBox(q-vec3(0,h,0),vec3(t,h,dd),.002);
  float pages=sdBox(q-vec3(0,h,.004),vec3(t-.004,h-.004,dd));
  float cut=sdBox(q-vec3(0,h,dd+.004),vec3(t-.004,h-.004,.007));
  float spine=sdCylY(q-vec3(0,h,-dd+.004),t*1.,h-.001); spine=max(spine,-(q.z+dd-.004));
  return min(max(cover,-cut),min(pages,spine)); }
float bookT2(vec3 q,float h,float t,float dd,float cov){
  if(q.z>dd-.003&&abs(q.x)<t-.004) return fract(q.x/.0022)<.35?.72:.93;
  if(q.y>2.*h-.003&&abs(q.x)<t-.004&&q.z>-dd+.004) return fract(q.x/.0022)<.35?.72:.93;
  if(q.z<-dd+.002){ float y=q.y/(2.*h); if(abs(y-.15)<.012||abs(y-.85)<.012) return cov-.2;
    if(abs(y-.55)<.08&&abs(q.x)<t*.6) return cov+.25; }
  return cov; }
float bookend(vec3 q){ float b=sdRBox(q-vec3(0,.006,0),vec3(.012,.006,.05),.002);
  float up=sdRBox(q-vec3(0,.08,0),vec3(.012,.08,.05),.004);
  up=max(up,length((q-vec3(0,.16,.0)).yz*vec2(1.,.9))-.075+q.y*0.);
  return min(b,up); }
/* a big open book tipped toward us on a folded cloth, two closed books stacked behind */
vec3 obQ(vec3 p){ vec3 q=p-vec3(.0,.035,.0); q.xz=rot(-.12)*q.xz; q.yz=rot(-.42)*q.yz; return q; }
vec2 obD(vec3 p){ vec3 q=obQ(p)/1.05; float x=abs(q.x);
  float lift=.026*sin(clamp(x/.13,0.,1.)*1.9)-.016*exp(-x*55.)+.008;
  float pages=sdBox(vec3(x-.066,q.y-lift*.5,q.z),vec3(.064,max(lift*.5,.003),.088))-.0015;
  float cover=sdRBox(vec3(x-.07,q.y+.001,q.z),vec3(.073,.0035,.095),.0015);
  float prop=sdRBox(p-vec3(.0,.022,.07),vec3(.14,.022,.035),.008);
  return vec2(pages*1.05,min(cover*1.05,prop)); }
#define BA vec3(.19,0.,.14)
#define BAS vec3(.09,.02,.07)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 o=obD(p); r=U(r,o.x,4.); r=U(r,o.y,5.);
  r=U(r,min(bookD(L(p,BA,-.3),BAS),bookD(L(p,BA+vec3(0,2.*BAS.y,0),-.1),BAS*.9)),6.);
  r=U(r,glassesD(L(p,vec3(-.19,0.,-.12),.25)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==4.){ vec3 q=obQ(p)/1.05; float x=abs(q.x); float a=.94; float l=fract((q.z+.2)/.011);
    if(abs(x-.066)<.048&&abs(q.z)<.075&&l<.28) a=.62; if(x<.005) a=.7; return a; }
  if(id==5.) return .35;
  if(id==6.){ vec3 q=L(p,BA,-.3); if(q.y>2.*BAS.y) return bookT(L(p,BA+vec3(0,2.*BAS.y,0),-.1),BAS*.9,.55); return bookT(q,BAS,.35); }
  if(id==7.){ vec3 g=L(p,vec3(-.19,0.,-.12),.25)-vec3(0,.012,0); if(min(length(g.xy-vec2(-.03,0.)),length(g.xy-vec2(.03,0.)))<.021) return .93; return .3; }
  return .7; }
