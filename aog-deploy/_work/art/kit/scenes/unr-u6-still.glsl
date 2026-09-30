/* The Unseen Realm Unit 6 "Babel and the Nations" - a big map unrolled on the table (the nations of
   Genesis 10), a tall clay water jar and a walking staff for Abram's journey. Objects only. */
#define CAM_POS vec3(-0.6718,0.4393,-1.0459)
#define CAM_TGT vec3(-0.2369,-0.0172,0.1500)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.68,.85,-.32)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "unrparts_a.glsl"
vec3 Q3(vec3 p){ vec3 q=p-vec3(.0,0.,-.02); q.xz=rot(-.08)*q.xz; return q; }
vec3 Q4(vec3 p){ return p-vec3(.22,0.,.17); }
vec3 Q6(vec3 p){ return Q4(p); }
vec3 Q5(vec3 p){ vec3 q=p-vec3(.02,0.,-.2); q.xz=rot(-.2)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,mapS(Q3(p),.2,.13),3.);
  r=U(r,o_jar(Q4(p),.26),4.);
  r=U(r,o_staff(Q5(p)),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;
  if(id==3.) return t_map2(Q3(p),.2,.13);
  if(id==4.) return t_jar(Q4(p),.26);
  if(id==5.) return t_staff(Q5(p));
  return .7; }
