/* sec-u10 — pencil still life (AOG-SEC-PENCIL-V1): a punched-tin candle lantern, a printer's composing stick holding lines of metal type, and a folded printed sheet. Objects only; no writing. */
#define CAM_POS vec3(-0.7088,0.5329,-1.2517)
#define CAM_TGT vec3(-0.3885,-0.0205,0.0879)
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
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0600); q.xz=rot(0.0000)*q.xz; return q/1.0000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(-0.2400,0.0000,-0.1000); q.xz=rot(0.3500)*q.xz; return q/1.6000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(0.2500,0.0000,-0.0600); q.xz=rot(-0.3000)*q.xz; return q/1.1000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,s_lantern(Q0(p))*1.0000,3.);
  r=U(r,s_stick(Q1(p))*1.6000,4.);
  r=U(r,s_broadside(Q2(p))*1.1000,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return ts_lantern(Q0(p));
  if(id==4.) return ts_stick(Q1(p));
  if(id==5.) return ts_broadside(Q2(p));
  return .7; }
