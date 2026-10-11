/* skt-u14 "Engineering the Board and the Ramp" — pencil still life: a big urethane skate wheel standing
   on its tread with its bearing showing, seven maple veneer plies fanned out behind it, a durometer
   dial gauge and a loose bearing. Objects only. */
#define CAM_POS vec3(-0.3700,0.1696,-0.4707)
#define CAM_TGT vec3(-0.1640,-0.0263,0.0442)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sktparts_b.glsl"
#define WR .038
#define WH .025
vec3 Qw(vec3 p){ vec3 q=p-vec3(.0,WR,-.035); q.xz=rot(.12)*q.xz; return q; }
vec3 Qp(vec3 p){ vec3 q=p-vec3(-.12,0.,.03); q.xz=rot(.25)*q.xz; return q/.75; }
vec3 Qd(vec3 p){ vec3 q=p-vec3(.1,0.,-.06); q.xz=rot(-.3)*q.xz; return q; }
vec3 Qb(vec3 p){ return p-vec3(-.035,0.,-.1); }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,sb_wheel(Qw(p),WR,WH),3.);
  r=U(r,sb_plies(Qp(p))*.75,4.);
  r=U(r,sb_duro(Qd(p)),5.);
  r=U(r,sb_bearing(Qb(p)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return sbt_wheel(Qw(p),WR,WH);
  if(id==4.) return sbt_plies(Qp(p));
  if(id==5.) return sbt_duro(Qd(p));
  if(id==6.) return sbt_bearing(Qb(p));
  return .7; }
