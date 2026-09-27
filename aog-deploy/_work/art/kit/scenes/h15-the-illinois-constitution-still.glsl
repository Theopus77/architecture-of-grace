/* Room h15 "The Illinois Constitution" — pencil still life of two founding documents side by
   side: a long scroll lying open between its two rollers (hint-lines only, no words), a
   smaller scroll rolled and tied with a ribbon, and a wax-seal stamp standing by a plain
   round seal pressed on the open sheet. */
#define CAM_POS vec3(-0.1889,0.3139,-0.4921)
#define CAM_TGT vec3(-0.0870,-0.0257,0.0308)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
vec3 opQ(vec3 p){ return place(p,vec3(0.,0.,.02),-.15); }
float openD(vec3 q){ float sheet=sdBox(q-vec3(0.,.0015+.004*sin(q.x*20.)*0.,0.),vec3(.12,.0008,.075));
  float r1=sdCylZ(q-vec3(-.13,.015,0.),.015,.085)-.001, r2=sdCylZ(q-vec3(.13,.015,0.),.015,.085)-.001;
  return min(sheet,min(r1,r2)); }
float knobsD(vec3 q){ float d=1e5; for(int i=0;i<4;i++){ vec3 c=vec3(i<2?-.13:.13,.015,mod(float(i),2.)<1.?-.093:.093);
  d=min(d,sdCylZ(q-c,.0065,.009)-.002); d=min(d,length(q-c-vec3(0.,0.,sign(c.z)*.014))-.007); } return d; }
vec3 rlQ(vec3 p){ vec3 q=p-vec3(.04,.022,.15); q.xz=rot(.25)*q.xz; return q; }
float rollD(vec3 q){ return sdCylX(q,.022,.1)-.001; }
float ribbonD(vec3 q){ float band=max(abs(length(q.yz)-.0235)-.0012,abs(q.x)-.007);
  vec3 b=q-vec3(0.,.024,-.012); float bow=min(sdEll(b-vec3(-.012,0.,0.),vec3(.012,.004,.008)),sdEll(b-vec3(.012,0.,0.),vec3(.012,.004,.008)));
  float tails=min(sdCapsule(q,vec3(0.,.02,-.018),vec3(-.01,.0,-.04),.0025),sdCapsule(q,vec3(0.,.02,-.018),vec3(.014,.0,-.042),.0025));
  return min(band,min(bow,tails)); }
#define ST vec3(.2,0.,-.07)
float stampD(vec3 p){ vec3 q=p-ST;
  float base=sdCylY(q-vec3(0.,.008,0.),.017,.008)-.001;
  float neck=sdCylY(q-vec3(0.,.025,0.),.007,.012);
  float handle=sdEll(q-vec3(0.,.068,0.),vec3(.016,.036,.016));
  handle=smin(handle,sdCylY(q-vec3(0.,.036,0.),.009,.006),.006);
  return min(min(base,neck),handle); }
float sealD(vec3 p){ vec3 q=opQ(p)-vec3(.07,.0025,-.045); float d=sdCylY(q,.017+.002*sin(atan(q.z,q.x)*7.),.0022)-.0012; return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 o=opQ(p);
  r=U(r,openD(o),3.);
  r=U(r,knobsD(o),4.);
  vec3 l=rlQ(p);
  r=U(r,rollD(l),5.);
  r=U(r,ribbonD(l),6.);
  r=U(r,stampD(p),7.);
  r=U(r,sealD(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=opQ(p); if(abs(q.x)>.112) return .78; vec2 u=q.xz;
    if(abs(u.y-.055)<.004&&abs(u.x)<.06) return .45;
    if(u.y<.04&&u.y>-.06&&abs(u.x)<.095&&fract((u.y+.1)/.011)<.18){ float e=fract(sin(floor((u.y+.1)/.011)*5.1)*71.)*.05; if(u.x<.095-e) return .6; }
    if(abs(fract(u.x/.08+.5)-.5)<.02&&u.y<.042&&u.y>-.065) return .85;
    return .93; }
  if(id==4.) return .4+.08*grain(p,90.);
  if(id==5.){ vec3 q=rlQ(p); if(abs(q.x)>.098){ float r=length(q.yz); float a=atan(q.z,q.y); return fract(r/.004+a/6.2832)<.3?.45:.85; } return .88; }
  if(id==6.) return .35;
  if(id==7.){ vec3 q=p-ST; if(q.y<.017) return .45; return .5+.08*grain(p,90.); }
  if(id==8.){ vec3 q=opQ(p)-vec3(.07,.0025,-.045); if(abs(length(q.xz)-.011)<.0015) return .15; return .3; }
  return .7; }
