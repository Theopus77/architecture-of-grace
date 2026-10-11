/* skt-u15 "Advanced Tricks and How Skill Is Built" — pencil still life: a skateboard turned wheels-up
   (a painted chevron graphic underneath, no logo), an open spiral notebook with a trick checklist and a
   spin-arrow sketch, a pencil and a stopwatch. Objects only. */
#define CAM_POS vec3(-0.8030,0.4492,-1.0400)
#define CAM_TGT vec3(-0.3416,-0.0782,0.0804)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sptmar.glsl"
#include "sktparts_b.glsl"
vec3 Qb(vec3 p){ vec3 q=p-vec3(-.03,0.,.12); q.xz=rot(-.2)*q.xz; return vec3(q.x,.135-q.y,-q.z); }
vec3 Qn(vec3 p){ vec3 q=p-vec3(.1,0.,-.17); q.xz=rot(.12)*q.xz; return q/1.3; }
vec3 Qp(vec3 p){ vec3 q=p-vec3(.2,.0125,-.2); q.xz=rot(.9)*q.xz; return q; }
vec3 Qs(vec3 p){ vec3 q=p-vec3(-.15,0.,-.17); q.xz=rot(.5)*q.xz; return q; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 b=sb_board(Qb(p),.4,.1,1.,.215,.027,.016); r=U(r,b.x,3.+b.y);
  r=U(r,sb_notebook(Qn(p))*1.3,6.);
  r=U(r,o_pencil(Qp(p),0.),7.);
  r=U(r,o_stopwatch(Qs(p),0.),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id>2.5&&id<5.5) return sbt_board(Qb(p),id-3.,.4,.1,1.,.215,.027,.016,2.);
  if(id==6.) return sbt_notebook(Qn(p));
  if(id==7.) return t_pencil(Qp(p),0.);
  if(id==8.) return t_stopwatch(Qs(p),0.);
  return .7; }
