/* The Unseen Realm Unit 1 "God's Family in Heaven" - a paper pinwheel (the wind: real but unseen)
   standing in a clay pot with a young plant (the garden home), and a feather on the table, and a diamond kite with its tail. Objects only. */
#define CAM_POS vec3(-0.45,0.42,-1.0)
#define CAM_TGT vec3(-0.1,0.08,0.1)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.68,.85,-.32)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "unrparts_a.glsl"
#define PR .075
#define PH .12
vec3 Q3(vec3 p){ return p-vec3(.02,0.,.05); }
vec3 Q4(vec3 p){ return Q3(p)-vec3(-.02,PH-.016,.01); }
vec3 Q5(vec3 p){ vec3 q=Q3(p)-vec3(.028,PH-.016,-.012); q.xz=rot(-.45)*q.xz; return q; }
vec3 Q6(vec3 p){ vec3 q=p-vec3(-.19,0.,-.1); q.xz=rot(-.3)*q.xz; return q; }
vec3 Q7(vec3 p){ vec3 q=p-vec3(.24,0.,.16); q.xz=rot(-.35)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_pot(Q3(p),PR,PH),3.);
  r=U(r,o_sprout(Q4(p),.1,.04,3.),4.);
  r=U(r,o_pinwheel(Q5(p),.22,.065),5.);
  r=U(r,o_feather(Q6(p),.15),6.);
  r=U(r,o_kite(Q7(p),.1,.19,.1),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;
  if(id==3.) return t_pot(Q3(p),PR,PH);
  if(id==4.) return t_sprout(Q4(p));
  if(id==5.) return t_pinwheel(Q5(p),.22,.065);
  if(id==6.) return t_feather(Q6(p),.15);
  if(id==7.) return t_kite(Q7(p),.1,.19,.1);
  return .7; }
