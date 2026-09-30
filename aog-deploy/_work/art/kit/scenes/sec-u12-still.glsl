/* sec-u12 — pencil still life (AOG-SEC-PENCIL-V1): a bundle of letters tied with a ribbon bow, a wax seal stamp beside a stick of sealing wax, and an inkwell with a quill. Objects only; no writing. */
#define CAM_POS vec3(-0.6959,0.5705,-1.0845)
#define CAM_TGT vec3(-0.4035,0.0254,0.1120)
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
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0000); q.xz=rot(0.1500)*q.xz; return q/1.6000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0000); q.xz=rot(0.1500)*q.xz; return q/1.6000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(0.2000,0.0000,-0.0200); q.xz=rot(0.0000)*q.xz; return q/1.3000; }
vec3 Q3(vec3 p){ vec3 q=p-vec3(0.1700,0.0000,-0.1500); q.xz=rot(0.5000)*q.xz; return q/1.2000; }
vec3 Q4(vec3 p){ vec3 q=p-vec3(-0.1900,0.0000,0.1300); q.xz=rot(0.2000)*q.xz; return q/1.2000; }
vec3 Q5(vec3 p){ vec3 q=p-vec3(-0.1900,0.0000,0.1300); q.xz=rot(0.2000)*q.xz; return q/1.2000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,s_letters(Q0(p))*1.6000,3.);
  r=U(r,s_ribbon(Q1(p))*1.6000,4.);
  r=U(r,s_seal(Q2(p))*1.3000,5.);
  r=U(r,s_wax(Q3(p))*1.2000,6.);
  r=U(r,s_inkwell(Q4(p))*1.2000,7.);
  r=U(r,s_quill(Q5(p))*1.2000,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return ts_letters(Q0(p));
  if(id==4.) return ts_ribbon(Q1(p));
  if(id==5.) return ts_seal(Q2(p));
  if(id==6.) return ts_wax(Q3(p));
  if(id==7.) return ts_inkwell(Q4(p));
  if(id==8.) return ts_quill(Q5(p));
  return .7; }
