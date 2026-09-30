/* mar-u16 — pencil still life (AOG-SPT-MAR-PENCIL-V1): a balance scale with two empty pans, and a closed book. Objects only. Written by pencil/sptmar_scenes.py. */
#define CAM_POS vec3(-0.4278,0.3123,-1.0429)
#define CAM_TGT vec3(-0.1788,0.0181,0.0546)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sptmar.glsl"
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0300); q.xz=rot(0.0000)*q.xz; return q/1.0000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(0.2500,0.0000,-0.1000); q.xz=rot(0.3000)*q.xz; return q/0.8000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_balance(Q0(p),0.0000)*1.0000,3.);
  r=U(r,o_book(Q1(p),0.0150)*0.8000,4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return t_balance(Q0(p),0.0000);
  if(id==4.) return t_book(Q1(p),0.0150);
  return .7; }
