/* martial-arts-hub — pencil still life (AOG-SPT-MAR-PENCIL-V1): a sand timer and a rolled-up belt on a tatami mat, with a tea bowl beside the mat. Objects only. Written by pencil/sptmar_scenes.py. */
#define CAM_POS vec3(-0.4943,0.3230,-1.0143)
#define CAM_TGT vec3(-0.2476,0.0314,0.0739)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sptmar.glsl"
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0600); q.xz=rot(0.0000)*q.xz; return q/1.0000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(-0.0400,0.0600,0.0600); q.xz=rot(0.0000)*q.xz; return q/1.2000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(0.1200,0.0600,0.0200); q.xz=rot(0.3000)*q.xz; return q/1.0000; }
vec3 Q3(vec3 p){ vec3 q=p-vec3(0.3000,0.0000,-0.1200); q.xz=rot(0.0000)*q.xz; return q/1.0000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_tatami(Q0(p),0.0000)*1.0000,3.);
  r=U(r,o_hourglass(Q1(p),0.0000)*1.2000,4.);
  r=U(r,o_beltcoil(Q2(p),0.0000)*1.0000,5.);
  r=U(r,o_teabowl(Q3(p),0.0000)*1.0000,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return t_tatami(Q0(p),0.0000);
  if(id==4.) return t_hourglass(Q1(p),0.0000);
  if(id==5.) return t_beltcoil(Q2(p),0.0000);
  if(id==6.) return t_teabowl(Q3(p),0.0000);
  return .7; }
