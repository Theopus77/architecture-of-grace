/* sp6 "Tener, Gustar and Stem Changes" — a lace-up boot (the boot shape of the stem-changing
   verbs) standing beside a cupcake with a cherry on a small plate (me gusta). */
#define CAM_POS vec3(-0.5726,0.3849,-0.5802)
#define CAM_TGT vec3(-0.1709,0.0295,0.0972)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_e.glsl"
vec3 bQ(vec3 p){ return place(p,vec3(-.03,0.,.06),-1.45); }
vec3 cQ(vec3 p){ return place(p,vec3(.14,0.,-.07),0.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 b=bQ(p);
  r=U(r,bootD(b),3.);
  r=U(r,bootSole(b),4.);
  vec3 c=cQ(p);
  r=U(r,plateD(c,.075),5.);
  vec3 c2=c-vec3(0.,.008,0.);
  r=U(r,cupcakeCup(c2),6.);
  r=U(r,cupcakeTop(c2),7.);
  r=U(r,cherry(c2),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return bootTone(bQ(p),n);
  if(id==4.) return .25;
  if(id==5.){ float r=length(cQ(p).xz); return abs(r-.066)<.0015?.5:.92; }
  if(id==6.){ vec3 q=cQ(p); float a=atan(q.z,q.x); return .62+.2*cos(a*20.); }
  if(id==7.) return .9;
  if(id==8.) return .3;
  return .7; }
