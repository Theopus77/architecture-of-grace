/* The Unseen Realm Unit 1 "God's Family in Heaven" - a garden home: a clay pot with a young plant,
   a watering can, and a white feather on the table. Objects only. */
#define CAM_POS vec3(-0.5490,0.3686,-0.9590)
#define CAM_TGT vec3(-0.2060,0.0157,0.1192)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.68,.85,-.32)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "unrparts_a.glsl"
#define PR .08
#define PH .13
vec3 Q3(vec3 p){ return p-vec3(-.04,0.,.05); }
vec3 Q4(vec3 p){ return Q3(p)-vec3(0.,PH-.016,0.); }
vec3 Q5(vec3 p){ vec3 q=p-vec3(.21,0.,.14); q.xz=rot(-.5)*q.xz; return q; }
vec3 Q6(vec3 p){ vec3 q=p-vec3(.06,0.,-.15); q.xz=rot(-.25)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_pot(Q3(p),PR,PH),3.);
  r=U(r,o_sprout(Q4(p),.15,.055,4.),4.);
  r=U(r,wcan(Q5(p),.065,.13),5.);
  r=U(r,o_feather(Q6(p),.15),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;
  if(id==3.) return t_pot(Q3(p),PR,PH);
  if(id==4.) return t_sprout(Q4(p));
  if(id==5.) return wcanT(Q5(p),.065,.13);
  if(id==6.) return t_feather(Q6(p),.15);
  return .7; }
