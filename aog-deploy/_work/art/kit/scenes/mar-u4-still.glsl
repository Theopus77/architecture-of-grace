/* mar-u4 — pencil still life (AOG-SPT-MAR-PENCIL-V1): a rolled-up wrestling mat and a trophy. Objects only. Written by pencil/sptmar_scenes.py. */
#define CAM_POS vec3(-0.3241,0.2343,-0.7441)
#define CAM_TGT vec3(-0.1445,0.0219,0.0480)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sptmar.glsl"
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0600); q.xz=rot(0.2000)*q.xz; return q/1.0000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(0.2200,0.0000,-0.0800); q.xz=rot(0.0000)*q.xz; return q/1.0000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_rolledmat(Q0(p),0.0000)*1.0000,3.);
  r=U(r,o_trophy(Q1(p),0.0000)*1.0000,4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return t_rolledmat(Q0(p),0.0000);
  if(id==4.) return t_trophy(Q1(p),0.0000);
  return .7; }
