/* sec-u11 — pencil still life (AOG-SEC-PENCIL-V1): an open ledger with ruled columns, a banker's desk lamp with a dark glass shade, and stacks of coins. Objects only; no writing. */
#define CAM_POS vec3(-0.7274,0.5028,-1.2187)
#define CAM_TGT vec3(-0.4150,-0.0367,0.0876)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sptmar.glsl"
#include "secparts_b.glsl"
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0600); q.xz=rot(-0.1500)*q.xz; return q/1.0000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(-0.2000,0.0000,-0.1200); q.xz=rot(0.1800)*q.xz; return q/1.0000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(0.1700,0.0000,-0.1000); q.xz=rot(0.0000)*q.xz; return q/1.7000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,s_banker(Q0(p))*1.0000,3.);
  r=U(r,s_ledger(Q1(p))*1.0000,4.);
  r=U(r,s_coins(Q2(p))*1.7000,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return ts_banker(Q0(p));
  if(id==4.) return ts_ledger(Q1(p));
  if(id==5.) return ts_coins(Q2(p));
  return .7; }
