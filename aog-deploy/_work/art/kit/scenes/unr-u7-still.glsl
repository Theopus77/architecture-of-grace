/* The Unseen Realm Unit 7 "Angels and the Angel of the LORD" - messengers: a rolled letter tied with
   a cord and sealed, a ram's horn for announcing news, and a small hand bell. Objects only. */
#define CAM_POS vec3(-0.6255,0.4026,-0.9600)
#define CAM_TGT vec3(-0.2238,-0.0191,0.1445)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.68,.85,-.32)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "unrparts_a.glsl"
#include "hubparts.glsl"
vec3 Q3(vec3 p){ vec3 q=p-vec3(-.02,0.,-.04); q.xz=rot(-.3)*q.xz; q/=1.6; return q; }
vec3 Q4(vec3 p){ vec3 q=p-vec3(.0,0.,-.2); q.xz=rot(-.6)*q.xz; return q; }
vec3 Q5(vec3 p){ return p-vec3(.2,0.,.12); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_letter(Q3(p))*1.6,3.);
  r=U(r,o_horn(Q4(p)),4.);
  r=U(r,bell(Q5(p),1.7),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;
  if(id==3.) return t_letter(Q3(p));
  if(id==4.) return t_horn(Q4(p));
  if(id==5.) return bellT(Q5(p),1.7);
  return .7; }
