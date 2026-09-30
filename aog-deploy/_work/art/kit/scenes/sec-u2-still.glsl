/* sec-u2 — pencil still life (AOG-SEC-PENCIL-A): a school slate propped up with a simple code grid and an X drawn on it in chalk, some cells marked with dots, a stick of chalk and a folded note closed with a round wax seal. Objects only. Written by pencil/sec_scenes_a.py. */
#define CAM_POS vec3(-0.2770,0.2190,-0.7316)
#define CAM_TGT vec3(-0.1029,0.0132,0.0361)
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
vec3 Q0(vec3 p){ vec3 q=p-vec3(0.0000,0.0000,0.0400); q.xz=rot(0.1200)*q.xz; return q/1.0000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(-0.0300,0.0000,-0.1000); q.xz=rot(0.4500)*q.xz; return q/1.2000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(0.2100,0.0000,-0.0700); q.xz=rot(-0.3000)*q.xz; return q/1.4500; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_slate(Q0(p),0.0000)*1.0000,3.);
  r=U(r,o_chalk(Q1(p),0.0000)*1.2000,4.);
  r=U(r,o_sealnote(Q2(p),0.0000)*1.4500,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return t_slate(Q0(p),0.0000);
  if(id==4.) return t_chalk(Q1(p),0.0000);
  if(id==5.) return t_sealnote(Q2(p),0.0000);
  return .7; }
