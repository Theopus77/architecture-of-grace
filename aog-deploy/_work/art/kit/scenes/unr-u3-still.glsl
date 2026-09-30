/* The Unseen Realm Unit 3 "Everyone Invited Home" - a welcome table: a round loaf on a plate, a water pitcher and
   a cup for a guest, and a large old house key. Objects only. */
#define CAM_POS vec3(-0.6744,0.3530,-0.8860)
#define CAM_TGT vec3(-0.2942,-0.0462,0.1597)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.68,.85,-.32)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "unrparts_a.glsl"
vec3 Q3(vec3 p){ return p-vec3(.02,0.,.04); }
vec3 Q4(vec3 p){ return Q3(p)-vec3(0.,.009,0.); }
vec3 Q5(vec3 p){ return p-vec3(-.2,0.,.04); }
vec3 Q6(vec3 p){ vec3 q=p-vec3(-.02,0.,-.19); q.xz=rot(.25)*q.xz; return q; }
vec3 Q7(vec3 p){ vec3 q=p-vec3(-.1,0.,.22); q.xz=rot(-2.2)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_plate2(Q3(p),.14),3.);
  r=U(r,o_rloaf(Q4(p),.085),4.);
  r=U(r,o_bcup(Q5(p),.042,.1),5.);
  r=U(r,o_key(Q6(p),.14),6.);
  r=U(r,o_pitcher(Q7(p)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;
  if(id==3.) return t_plate2(Q3(p),.14);
  if(id==4.) return t_rloaf(Q4(p),.085);
  if(id==5.) return t_bcup(Q5(p),.1);
  if(id==6.) return t_key(Q6(p),.14);
  if(id==7.) return t_pitcher(Q7(p));
  return .7; }
