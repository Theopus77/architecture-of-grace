/* r6 "Hinduism: Dharma, Karma and the Gita" — a clay diya burning on a turned brass lamp stand,
   a palm-leaf manuscript between its wooden boards, and a lotus floating in a shallow bowl.
   Objects only: no figure of any deity or teacher; writing is hint-lines only. */
#define CAM_POS vec3(-0.6503,0.3401,-0.9695)
#define CAM_TGT vec3(-0.2081,0.0115,0.1425)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
vec3 place(vec3 p,vec3 c,float a){ vec3 q=p-c; q.xz=rot(a)*q.xz; return q; }
/* brass lamp stand: a turned profile, radius by height; the dish on top is at SH */
#define SC vec3(-.02,0.,.1)
#define SH .2
float standR(float y){
  float r=.012;
  r=max(r,.06*(1.-smoothstep(.0,.03,y))+.012);                 /* wide foot */
  r=max(r,.028*exp(-pow((y-.035)/.008,2.)));                   /* collar */
  r=max(r,.022*exp(-pow((y-.11)/.012,2.)));                    /* knop */
  r=max(r,.05*smoothstep(SH-.03,SH-.005,y));                    /* top dish */
  return r; }
float lstand(vec3 p){ vec3 q=p-SC; float d=(length(q.xz)-standR(q.y))*.7; d=max(d,max(-q.y,q.y-SH));
  return d; }
vec3 dyQ(vec3 p){ vec3 q=p-SC-vec3(0.,SH,0.); q.xz=rot(2.9)*q.xz; return q; }
float lamp(vec3 p){ return diya(dyQ(p),1.2); }
float flame(vec3 p){ return flameD(dyQ(p)-DIYA_TIP(1.2),.05); }
/* palm-leaf manuscript lying in front-left */
vec3 pmQ(vec3 p){ return place(p,vec3(-.06,0.,-.08),.18); }
float palm(vec3 p){ return palmBundle(pmQ(p),.15,.028,.012); }
/* shallow bowl with water and a lotus */
#define BC vec3(.23,0.,-.02)
float bowl(vec3 p){ vec3 q=p-BC; float r=length(q.xz);
  float o=sdEll(q-vec3(0.,.05,0.),vec3(.1,.05,.1)); float i=sdEll(q-vec3(0.,.056,0.),vec3(.093,.047,.093));
  float d=max(max(o,-i),q.y-.045); d=min(d,sdTorus(q-vec3(0.,.045,0.),.083,.004));
  return max(d,-q.y); }
float water(vec3 p){ vec3 q=p-BC; return max(sdEll(q-vec3(0.,.056,0.),vec3(.093,.047,.093)),q.y-.035); }
float flower(vec3 p){ return lotus(p-BC-vec3(0.,.033,0.),1.3); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,lstand(p),3.);
  r=U(r,lamp(p),4.);
  r=U(r,flame(p),5.);
  r=U(r,palm(p),6.);
  r=U(r,bowl(p),7.);
  r=U(r,water(p),8.);
  r=U(r,flower(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .5;
  if(id==4.) return .45;
  if(id==5.) return .97;
  if(id==6.) return palmBundleTone(pmQ(p),.15,.028,.012);
  if(id==7.) return .55;
  if(id==8.) return .8;
  if(id==9.) return .9;
  return .7; }
