/* spt-u15 — pencil still life (AOG-SPT-MAR-PENCIL-V1): a thick rulebook, two ticket stubs and a stack of coins. Objects only. Written by pencil/sptmar_scenes.py. */
#define CAM_POS vec3(-0.3036,0.1680,-0.8013)
#define CAM_TGT vec3(-0.1170,-0.0525,0.0216)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sptmar.glsl"
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0000); q.xz=rot(0.2000)*q.xz; return q/1.0000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(0.1900,0.0000,-0.1000); q.xz=rot(0.4000)*q.xz; return q/1.6000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(0.2100,0.0018,-0.1400); q.xz=rot(-0.2000)*q.xz; return q/1.6000; }
vec3 Q3(vec3 p){ vec3 q=p-vec3(-0.1800,0.0000,-0.1000); q.xz=rot(0.0000)*q.xz; return q/2.2000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_book(Q0(p),0.0320)*1.0000,3.);
  r=U(r,o_ticket(Q1(p),0.0000)*1.6000,4.);
  r=U(r,o_ticket(Q2(p),0.0000)*1.6000,5.);
  r=U(r,o_coins(Q3(p),5.0000)*2.2000,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return t_book(Q0(p),0.0320);
  if(id==4.) return t_ticket(Q1(p),0.0000);
  if(id==5.) return t_ticket(Q2(p),0.0000);
  if(id==6.) return t_coins(Q3(p),5.0000);
  return .7; }
