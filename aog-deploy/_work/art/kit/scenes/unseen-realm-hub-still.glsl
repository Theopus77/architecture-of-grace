/* The Unseen Realm hub: an old book open on the table, a rolled scroll, a clay oil lamp and a
   small clay model of a snow-capped mountain (Hermon). Objects only. */
#define CAM_POS vec3(-0.5420,0.4056,-0.9645)
#define CAM_TGT vec3(-0.2483,-0.0350,0.1126)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.68,.85,-.32)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "unrparts_a.glsl"
vec3 Q3(vec3 p){ vec3 q=p-vec3(0.,0.,0.); q.xz=rot(-.12)*q.xz; return q; }
vec3 Q5(vec3 p){ vec3 q=p-vec3(-.24,0.,-.17); q.xz=rot(-.35)*q.xz; return q; }
vec3 Q6(vec3 p){ vec3 q=p-vec3(.25,0.,-.16); q.xz=rot(2.7)*q.xz; return q; }
vec3 Q7(vec3 p){ return Q6(p)-vec3(.088,.064,0.); }
vec3 Q8(vec3 p){ vec3 q=p-vec3(.3,0.,.2); q.xz=rot(.5)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_bookpages(Q3(p)),3.);
  r=U(r,o_bookcover(Q3(p)),4.);
  r=U(r,o_roll(Q5(p)),5.);
  r=U(r,o_lamp(Q6(p)),6.);
  r=U(r,o_flame(Q7(p)),7.);
  r=U(r,o_mount(Q8(p),.2,.15),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;
  if(id==3.) return t_bookpages(Q3(p),0);
  if(id==4.) return t_bookcover(Q3(p));
  if(id==5.) return t_roll(Q5(p));
  if(id==6.) return t_lamp(Q6(p));
  if(id==7.) return t_flame(Q7(p));
  if(id==8.) return t_mount(Q8(p),.2,.15);
  return .7; }
