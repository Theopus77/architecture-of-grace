/* spt-u14 — pencil still life (AOG-SPT-MAR-PENCIL-V1): two trophies, one taller than the other, and a few coins. Objects only. Written by pencil/sptmar_scenes.py. */
#define CAM_POS vec3(-0.3750,0.2786,-0.8264)
#define CAM_TGT vec3(-0.1740,0.0411,0.0598)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sptmar.glsl"
vec3 Q0(vec3 p){ vec3 q=p-vec3(-0.0600,0.0000,0.0200); q.xz=rot(0.0000)*q.xz; return q/1.2500; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(0.1000,0.0000,-0.0300); q.xz=rot(0.3000)*q.xz; return q/0.8000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(0.2100,0.0000,-0.1000); q.xz=rot(0.0000)*q.xz; return q/2.2000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_trophy(Q0(p),0.0000)*1.2500,3.);
  r=U(r,o_trophy(Q1(p),0.0000)*0.8000,4.);
  r=U(r,o_coins(Q2(p),4.0000)*2.2000,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return t_trophy(Q0(p),0.0000);
  if(id==4.) return t_trophy(Q1(p),0.0000);
  if(id==5.) return t_coins(Q2(p),4.0000);
  return .7; }
