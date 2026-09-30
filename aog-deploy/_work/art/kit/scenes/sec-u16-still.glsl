/* sec-u16 — pencil still life (AOG-SEC-PENCIL-V1): an open file box with folders standing inside, a closed folder with a blank label, a rubber stamp and a paper clip. Objects only; no writing. */
#define CAM_POS vec3(-0.3320,0.3140,-0.8234)
#define CAM_TGT vec3(-0.1320,-0.0494,0.0127)
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
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0600); q.xz=rot(0.1200)*q.xz; return q/1.0000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(0.1000,0.0000,-0.2100); q.xz=rot(-0.1500)*q.xz; return q/1.0000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(0.1900,0.0045,-0.2600); q.xz=rot(0.3000)*q.xz; return q/1.1000; }
vec3 Q3(vec3 p){ vec3 q=p-vec3(0.0000,0.0045,-0.1700); q.xz=rot(-1.3000)*q.xz; return q/1.5000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,s_docbox(Q0(p))*1.0000,3.);
  r=U(r,s_folder(Q1(p))*1.0000,4.);
  r=U(r,s_rstamp(Q2(p))*1.1000,5.);
  r=U(r,s_clip(Q3(p))*1.5000,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return ts_docbox(Q0(p));
  if(id==4.) return ts_folder(Q1(p));
  if(id==5.) return ts_rstamp(Q2(p));
  if(id==6.) return ts_clip(Q3(p));
  return .7; }
