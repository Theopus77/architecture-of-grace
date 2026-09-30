/* sec-u7 — pencil still life (AOG-SEC-PENCIL-A): a wooden cipher wheel standing on its little stand, its two rings marked with A, B, C and 1, 2, 3, in front of a thick old leather-bound book with clasps, and a magnifying glass. Objects only. Written by pencil/sec_scenes_a.py. */
#define CAM_POS vec3(-0.3653,0.2629,-0.8470)
#define CAM_TGT vec3(-0.1615,0.0221,0.0518)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sptmar.glsl"
#include "secparts_a.glsl"
vec3 Q0(vec3 p){ vec3 q=p-vec3(-0.0500,0.0000,0.1200); q.xz=rot(0.3000)*q.xz; return q/1.0000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(0.0700,0.0000,-0.0300); q.xz=rot(-0.1500)*q.xz; return q/1.1500; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(0.2300,0.0000,-0.1300); q.xz=rot(0.6000)*q.xz; return q/1.0000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_manu(Q0(p),0.0000)*1.0000,3.);
  r=U(r,o_cdisk(Q1(p),0.0000)*1.1500,4.);
  r=U(r,o_magnifier(Q2(p),0.0000)*1.0000,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return t_manu(Q0(p),0.0000);
  if(id==4.) return t_cdisk(Q1(p),0.0000);
  if(id==5.) return t_magnifier(Q2(p),0.0000);
  return .7; }
