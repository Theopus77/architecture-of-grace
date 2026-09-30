/* sec-u3 — pencil still life (AOG-SEC-PENCIL-A): a squared building stone with chiselled faces and a small carved mason's mark, a steel square standing against it, a round wooden mallet and a chisel. Objects only. Written by pencil/sec_scenes_a.py. */
#define CAM_POS vec3(-0.3150,0.3064,-0.8785)
#define CAM_TGT vec3(-0.1057,-0.0361,0.0157)
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
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0400); q.xz=rot(0.3500)*q.xz; return q/1.0000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(-0.0040,0.0000,-0.0658); q.xz=rot(0.3500)*q.xz; return q/1.0000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(0.1400,0.0000,-0.1500); q.xz=rot(-0.2500)*q.xz; return q/1.0000; }
vec3 Q3(vec3 p){ vec3 q=p-vec3(-0.1200,0.0000,-0.1300); q.xz=rot(0.3000)*q.xz; return q/1.0000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_stone(Q0(p),0.0000)*1.0000,3.);
  r=U(r,o_msq(Q1(p),1.0000)*1.0000,4.);
  r=U(r,o_mallet(Q2(p),0.0000)*1.0000,5.);
  r=U(r,o_chisel(Q3(p),0.0000)*1.0000,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return t_stone(Q0(p),0.0000);
  if(id==4.) return t_msq(Q1(p),1.0000);
  if(id==5.) return t_mallet(Q2(p),0.0000);
  if(id==6.) return t_chisel(Q3(p),0.0000);
  return .7; }
