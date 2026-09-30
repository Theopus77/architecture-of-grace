/* sec-u15 — pencil still life (AOG-SEC-PENCIL-V1): two open books on wooden reading stands side by side, with a magnifying glass on the table between them. Objects only; no writing. */
#define CAM_POS vec3(-0.4518,0.2471,-0.7969)
#define CAM_TGT vec3(-0.2511,-0.0630,0.0420)
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
vec3 Q0(vec3 p){ vec3 q=p-vec3(-0.1600,0.0000,0.0000); q.xz=rot(0.2200)*q.xz; return q/1.0000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(-0.1600,0.0000,0.0000); q.xz=rot(0.2200)*q.xz; return q/1.0000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(0.1600,0.0000,0.0000); q.xz=rot(-0.2200)*q.xz; return q/1.0000; }
vec3 Q3(vec3 p){ vec3 q=p-vec3(0.1600,0.0000,0.0000); q.xz=rot(-0.2200)*q.xz; return q/1.0000; }
vec3 Q4(vec3 p){ vec3 q=p-vec3(-0.0400,0.0000,-0.1700); q.xz=rot(0.3500)*q.xz; return q/1.0000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,s_bookstand(Q0(p))*1.0000,3.);
  r=U(r,s_obook(Q1(p))*1.0000,4.);
  r=U(r,s_bookstand(Q2(p))*1.0000,5.);
  r=U(r,s_obook(Q3(p))*1.0000,6.);
  r=U(r,s_lens(Q4(p))*1.0000,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return ts_bookstand(Q0(p));
  if(id==4.) return ts_obook(Q1(p),0.);
  if(id==5.) return ts_bookstand(Q2(p));
  if(id==6.) return ts_obook(Q3(p),1.);
  if(id==7.) return ts_lens(Q4(p));
  return .7; }
