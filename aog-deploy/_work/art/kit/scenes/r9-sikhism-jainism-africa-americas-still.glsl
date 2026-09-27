/* Room r9 "Sikhism, Jainism, and the Traditions of Africa and the Americas" — pencil still
   life of objects only, no figures: a Yoruba talking drum (an hourglass drum laced with cords)
   standing on end, a coiled grass basket, a small clay oil lamp, and a plain steel bangle (a
   kara) lying on the table. */
#define CAM_POS vec3(-0.3325,0.2227,-0.7672)
#define CAM_TGT vec3(-0.1368,0.0006,0.0770)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
vec3 place(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return q; }
/* the talking drum: an hourglass body, two drumheads with rims, cords running end to end */
#define DH .21
vec3 place3(vec3 p){ vec3 q=p-vec3(0.,0.,.07); q.xz=rot(.3)*q.xz; return q; }
float drumR(float y){ float t=y/DH; float w=abs(t-.5)*2.; return .017+.03*pow(w,2.4); }
float drumD(vec3 q){ float y=clamp(q.y,.012,DH-.012);
  float body=max(length(q.xz)-drumR(y),max(.012-q.y,q.y-(DH-.012)))*.85;
  float rimB=sdTorus(q-vec3(0.,.012,0.),.049,.005), rimT=sdTorus(q-vec3(0.,DH-.012,0.),.049,.005);
  float head=sdCylY(q-vec3(0.,DH-.011,0.),.048,.002);
  float foot=sdCylY(q-vec3(0.,.005,0.),.046,.005)-.001;
  /* cords: a cage of thin lines from rim to rim, standing a little off the waist */
  float a=atan(q.z,q.x); float n=12.; float ca=(floor(a/(6.2832/n))+.5)*6.2832/n;
  float rc=.046;
  vec3 cp=vec3(cos(ca)*rc,q.y,sin(ca)*rc); float cord=length((q-cp).xz)-.0009;
  cord=max(cord,max(.012-q.y,q.y-(DH-.012)));
  return min(min(min(body,rimB),min(rimT,head)),min(foot,cord*.8)); }
/* a coiled grass basket: a shallow bowl, the coils as rounded ribs */
vec3 bsQ(vec3 p){ return place(p,vec3(.21,0.,.14),.0); }
float coilBasket(vec3 q){ float R=.075,H=.05;
  float r=length(q.xz); float prof=R*(.62+.38*sqrt(clamp(q.y/H,0.,1.)));
  float wall=max(abs(r-prof)-.0045,max(-q.y,q.y-H));
  wall-=.0018*abs(sin(q.y/H*3.1416*7.));
  float fl=sdCylY(q-vec3(0.,.004,0.),R*.62,.004);
  float rim=sdTorus(q-vec3(0.,H,0.),R,.005);
  return min(min(wall*.8,fl),rim); }
vec3 lpQ(vec3 p){ return place(p,vec3(.13,0.,-.08),-.4); }
vec3 kaQ(vec3 p){ return p-vec3(-.03,.0055,-.12); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.6-dot(p.xz-CAM_TGT.xz,normalize(CAM_TGT.xz-CAM_POS.xz)),2.);
  r=U(r,drumD(place3(p)),3.);
  r=U(r,coilBasket(bsQ(p)),4.);
  vec3 l=lpQ(p);
  r=U(r,diya(l,.95),5.);
  r=U(r,flameD(l-DIYA_TIP(.95),.028),6.);
  r=U(r,sdTorus(kaQ(p),.036,.0055),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=place3(p); float rr=length(q.xz);
    if(q.y>DH-.013&&rr<.046) return .88;                              /* skin head */
    if(rr>drumR(clamp(q.y,.012,DH-.012))+.002&&q.y>.017&&q.y<DH-.017) return .82;   /* pale cords */
    if(abs(q.y-DH*.5)<.012) return .45;                                /* a wrapped band at the waist */
    return .35+.1*grain(q.yxz,40.); }
  if(id==4.){ vec3 q=bsQ(p); float c=fract(q.y/.05*7.+.5); if(q.y>.001&&(c<.1||c>.9)) return .35;
    float st=fract(atan(q.z,q.x)*9.+q.y*40.); return st<.12?.5:.72; }   /* stitches across the coils */
  if(id==5.) return .5;
  if(id==6.) return .95;
  if(id==7.) return .78;
  return .7; }
