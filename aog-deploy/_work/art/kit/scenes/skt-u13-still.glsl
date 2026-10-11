/* skt-u13 "Skateboarding, the City and the World" — pencil still life: a model city bench with metal
   skate stoppers clamped along its seat edge, a medal on its ribbon (no flags, no rings), and a rolled
   map tied with a band. Objects only. */
#define CAM_POS vec3(-0.6553,0.3472,-0.9288)
#define CAM_TGT vec3(-0.2634,0.0109,0.0792)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sktparts_b.glsl"
vec3 Qb(vec3 p){ vec3 q=p-vec3(0.,0.,.04); q.xz=rot(-.18)*q.xz; return q; }
vec3 Qm(vec3 p){ vec3 q=p-vec3(.2,0.,-.22); q.xz=rot(-.5)*q.xz; return q/1.4; }
vec3 Qr(vec3 p){ vec3 q=p-vec3(-.13,0.,-.16); q.xz=rot(-.6)*q.xz; return q; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec3 b=Qb(p); r=U(r,sb_bench(b),3.); r=U(r,sb_stoppers(b),4.);
  r=U(r,sb_medal(Qm(p))*1.4,5.);
  r=U(r,sb_roll(Qr(p),.1),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return sbt_bench(Qb(p));
  if(id==4.) return sbt_stoppers(Qb(p));
  if(id==5.) return sbt_medal(Qm(p));
  if(id==6.) return sbt_roll(Qr(p),.1);
  return .7; }
