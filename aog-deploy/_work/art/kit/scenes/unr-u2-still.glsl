/* The Unseen Realm Unit 2 "Big Choices Go Wrong" - a wooden toy ark (Noah) beside a tall tower of
   toy blocks with a pointed top (Babel). Objects only. */
#define CAM_POS vec3(-0.6844,0.4008,-0.9540)
#define CAM_TGT vec3(-0.2727,0.0509,0.1781)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.68,.85,-.32)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "unrparts_a.glsl"
vec3 Q3(vec3 p){ vec3 q=p-vec3(.08,0.,-.06); q.xz=rot(.3)*q.xz; return q; }
vec3 Q4(vec3 p){ vec3 q=p-vec3(-.1,0.,.1); q.xz=rot(.2)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_ark(Q3(p)),3.);
  r=U(r,o_tower(Q4(p)),4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;
  if(id==3.) return t_ark(Q3(p));
  if(id==4.) return t_tower(Q4(p));
  return .7; }
