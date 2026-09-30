/* sec-u8 — pencil still life (AOG-SEC-PENCIL-A): a drawing compass standing open on a drafting plan of a stone arch, with a set square and a pencil. Objects only. Written by pencil/sec_scenes_a.py. */
#define CAM_POS vec3(-0.4759,0.3679,-0.8609)
#define CAM_TGT vec3(-0.2558,-0.0123,0.0596)
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
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0000); q.xz=rot(0.0500)*q.xz; return q/1.0000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(0.1300,0.0016,0.0300); q.xz=rot(-0.1500)*q.xz; return q/1.1000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(-0.1600,0.0016,-0.1000); q.xz=rot(0.3000)*q.xz; return q/0.8000; }
vec3 Q3(vec3 p){ vec3 q=p-vec3(0.1000,0.0016,-0.1350); q.xz=rot(-0.1200)*q.xz; return q/1.0000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_aplan(Q0(p),0.0000)*1.0000,3.);
  r=U(r,o_divid(Q1(p),0.0000)*1.1000,4.);
  r=U(r,o_setsq(Q2(p),0.0000)*0.8000,5.);
  r=U(r,o_pencil(Q3(p),0.0000)*1.0000,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return t_aplan(Q0(p),0.0000);
  if(id==4.) return t_divid(Q1(p),0.0000);
  if(id==5.) return t_setsq(Q2(p),0.0000);
  if(id==6.) return t_pencil(Q3(p),0.0000);
  return .7; }
