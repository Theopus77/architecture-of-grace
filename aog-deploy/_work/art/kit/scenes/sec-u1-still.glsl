/* sec-u1 — pencil still life (AOG-SEC-PENCIL-A): a wooden club sign standing on two little feet, with rows of painted strokes for its hand-lettered words, a small tin box with a keyhole and an old key lying in front. Objects only. Written by pencil/sec_scenes_a.py. */
#define CAM_POS vec3(-0.3734,0.2508,-0.8346)
#define CAM_TGT vec3(-0.1722,0.0130,0.0518)
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
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0600); q.xz=rot(0.1000)*q.xz; return q/1.0000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(0.2300,0.0000,-0.0500); q.xz=rot(-0.3500)*q.xz; return q/1.0000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(0.1000,0.0000,-0.1400); q.xz=rot(0.5000)*q.xz; return q/1.3000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_sign(Q0(p),0.0000)*1.0000,3.);
  r=U(r,o_tin(Q1(p),0.0000)*1.0000,4.);
  r=U(r,o_skey(Q2(p),0.0000)*1.3000,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return t_sign(Q0(p),0.0000);
  if(id==4.) return t_tin(Q1(p),0.0000);
  if(id==5.) return t_skey(Q2(p),0.0000);
  return .7; }
