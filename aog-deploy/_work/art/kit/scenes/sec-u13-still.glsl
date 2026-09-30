/* sec-u13 — pencil still life (AOG-SEC-PENCIL-V1): a stack of three thick bound record volumes, a judge's gavel resting on its round block, and a folded newspaper. Objects only; no writing. */
#define CAM_POS vec3(-0.4666,0.3151,-1.0554)
#define CAM_TGT vec3(-0.2111,-0.0566,0.0365)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sptmar.glsl"
#include "secparts_b.glsl"
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0400); q.xz=rot(-0.1200)*q.xz; return q/1.1500; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(0.2600,0.0000,-0.1300); q.xz=rot(-0.4500)*q.xz; return q/1.0000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(-0.1900,0.0000,-0.1300); q.xz=rot(0.4500)*q.xz; return q/1.0000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,s_tomes(Q0(p))*1.1500,3.);
  r=U(r,s_gavel(Q1(p))*1.0000,4.);
  r=U(r,s_paper(Q2(p))*1.0000,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return ts_tomes(Q0(p));
  if(id==4.) return ts_gavel(Q1(p));
  if(id==5.) return ts_paper(Q2(p));
  return .7; }
