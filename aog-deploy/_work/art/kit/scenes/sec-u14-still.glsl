/* sec-u14 — pencil still life (AOG-SEC-PENCIL-V1): a hearing-room desk microphone, a water pitcher and a glass, and a blank wooden nameplate. Objects only; no writing. */
#define CAM_POS vec3(-0.5259,0.3281,-1.1142)
#define CAM_TGT vec3(-0.2574,0.0106,0.0704)
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
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0000); q.xz=rot(0.1000)*q.xz; return q/1.1500; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(0.2200,0.0000,0.1000); q.xz=rot(0.0000)*q.xz; return q/1.0000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(0.3000,0.0000,-0.0400); q.xz=rot(0.0000)*q.xz; return q/1.0000; }
vec3 Q3(vec3 p){ vec3 q=p-vec3(-0.1300,0.0000,-0.1500); q.xz=rot(0.2000)*q.xz; return q/1.0000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,s_mic(Q0(p))*1.1500,3.);
  r=U(r,s_pitcher(Q1(p))*1.0000,4.);
  r=U(r,s_glass(Q2(p))*1.0000,5.);
  r=U(r,s_plate(Q3(p))*1.0000,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return ts_mic(Q0(p));
  if(id==4.) return ts_pitcher(Q1(p));
  if(id==5.) return ts_glass(Q2(p));
  if(id==6.) return ts_plate(Q3(p));
  return .7; }
