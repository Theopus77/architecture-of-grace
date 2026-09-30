/* mar-u14 — pencil still life (AOG-SPT-MAR-PENCIL-V1): a clipboard with a checklist, a whistle on it and a field cone. Objects only. Written by pencil/sptmar_scenes.py. */
#define CAM_POS vec3(-0.5314,0.6078,-0.9836)
#define CAM_TGT vec3(-0.2671,-0.0048,0.0613)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sptmar.glsl"
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0000); q.xz=rot(0.1500)*q.xz; return q/1.0000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(0.0300,0.0100,-0.0600); q.xz=rot(0.5000)*q.xz; return q/1.8000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(0.2400,0.0000,0.0600); q.xz=rot(0.0000)*q.xz; return q/1.0000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_clipboard(Q0(p),0.0000)*1.0000,3.);
  r=U(r,o_whistle(Q1(p),0.0000)*1.8000,4.);
  r=U(r,o_cone(Q2(p),0.0000)*1.0000,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return t_clipboard(Q0(p),0.0000);
  if(id==4.) return t_whistle(Q1(p),0.0000);
  if(id==5.) return t_cone(Q2(p),0.0000);
  return .7; }
