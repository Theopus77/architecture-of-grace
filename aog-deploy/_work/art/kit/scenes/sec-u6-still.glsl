/* sec-u6 — pencil still life (AOG-SEC-PENCIL-A): an open ledger book with ruled columns and rows of entries, an inkwell holding a feather quill and a small wooden gavel. Objects only. Written by pencil/sec_scenes_a.py. */
#define CAM_POS vec3(-0.5104,0.4112,-1.0196)
#define CAM_TGT vec3(-0.2520,-0.0115,0.0602)
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
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0000); q.xz=rot(0.0800)*q.xz; return q/1.6000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(0.2600,0.0000,0.0900); q.xz=rot(0.0000)*q.xz; return q/1.2000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(0.2700,0.0000,-0.1200); q.xz=rot(-0.9000)*q.xz; return q/1.3000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_ledger(Q0(p),0.0000)*1.6000,3.);
  r=U(r,o_inkwell(Q1(p),0.0000)*1.2000,4.);
  r=U(r,o_gavel2(Q2(p),0.0000)*1.3000,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return t_ledger(Q0(p),0.0000);
  if(id==4.) return t_inkwell(Q1(p),0.0000);
  if(id==5.) return t_gavel2(Q2(p),0.0000);
  return .7; }
