/* sec-u17 — pencil still life (AOG-SEC-PENCIL-V1): a portable shortwave radio with its antenna raised, a pair of headphones, and a notebook with a column of checkmarks. Objects only; no writing. */
#define CAM_POS vec3(-0.2200,0.3000,-0.9500)
#define CAM_TGT vec3(0.0000,0.0400,0.0200)
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
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0600); q.xz=rot(-0.1000)*q.xz; return q/1.0000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(0.2700,0.0000,-0.0800); q.xz=rot(0.3500)*q.xz; return q/1.0000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(-0.2500,0.0000,-0.1200); q.xz=rot(0.1800)*q.xz; return q/1.0000; }
vec3 Q3(vec3 p){ vec3 q=p-vec3(-0.2000,0.0063,-0.1400); q.xz=rot(0.6000)*q.xz; return q/1.0000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,s_swradio(Q0(p))*1.0000,3.);
  r=U(r,s_phones(Q1(p))*1.0000,4.);
  r=U(r,s_notebook(Q2(p))*1.0000,5.);
  r=U(r,o_pencil(Q3(p),0.)*1.0000,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return ts_swradio(Q0(p));
  if(id==4.) return ts_phones(Q1(p));
  if(id==5.) return ts_notebook(Q2(p));
  if(id==6.) return t_pencil(Q3(p),0.);
  return .7; }
