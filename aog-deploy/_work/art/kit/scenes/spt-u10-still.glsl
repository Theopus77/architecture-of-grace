/* spt-u10 — pencil still life (AOG-SPT-MAR-PENCIL-V1): a trophy, a thick closed rulebook and a judge's gavel on its block. Objects only. Written by pencil/sptmar_scenes.py. */
#define CAM_POS vec3(-0.4893,0.2831,-1.0467)
#define CAM_TGT vec3(-0.2384,-0.0135,0.0598)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sptmar.glsl"
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0600); q.xz=rot(0.0000)*q.xz; return q/1.2500; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(-0.2000,0.0000,-0.0800); q.xz=rot(0.3000)*q.xz; return q/0.9000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(0.2000,0.0000,-0.1000); q.xz=rot(0.3000)*q.xz; return q/1.0000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_trophy(Q0(p),0.0000)*1.2500,3.);
  r=U(r,o_book(Q1(p),0.0300)*0.9000,4.);
  r=U(r,o_gavel(Q2(p),0.0000)*1.0000,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return t_trophy(Q0(p),0.0000);
  if(id==4.) return t_book(Q1(p),0.0300);
  if(id==5.) return t_gavel(Q2(p),0.0000);
  return .7; }
