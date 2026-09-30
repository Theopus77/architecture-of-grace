/* spt-u2 — pencil still life (AOG-SPT-MAR-PENCIL-V1): an orange field cone standing on a sheet with a field plan drawn on it, and a stick of chalk. Objects only. Written by pencil/sptmar_scenes.py. */
#define CAM_POS vec3(-0.5800,0.5902,-0.9663)
#define CAM_TGT vec3(-0.3185,-0.0159,0.0677)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sptmar.glsl"
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0000); q.xz=rot(0.1200)*q.xz; return q/1.0000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(0.0800,0.0024,0.0300); q.xz=rot(0.0000)*q.xz; return q/1.0000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(-0.1100,0.0024,-0.0800); q.xz=rot(0.5000)*q.xz; return q/1.6000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_plan(Q0(p),1.0000)*1.0000,3.);
  r=U(r,o_cone(Q1(p),0.0000)*1.0000,4.);
  r=U(r,o_chalk(Q2(p),0.0000)*1.6000,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return t_plan(Q0(p),1.0000);
  if(id==4.) return t_cone(Q1(p),0.0000);
  if(id==5.) return t_chalk(Q2(p),0.0000);
  return .7; }
