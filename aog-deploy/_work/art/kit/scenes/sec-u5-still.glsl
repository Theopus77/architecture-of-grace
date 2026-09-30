/* sec-u5 — pencil still life (AOG-SEC-PENCIL-A): a folded plain cloak with a sword in its sheath lying across it, and a rolled parchment standing on end, tied with a ribbon and hung with a round wax seal. Objects only. Written by pencil/sec_scenes_a.py. */
#define CAM_POS vec3(-0.3299,0.2261,-0.6533)
#define CAM_TGT vec3(-0.1665,0.0181,0.0522)
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
vec3 Q0(vec3 p){ vec3 q=p-vec3(-0.0600,0.0000,0.0400); q.xz=rot(0.1500)*q.xz; return q/1.0000; }
vec3 Q1(vec3 p){ vec3 q=p-vec3(-0.0400,0.0000,0.0200); q.xz=rot(0.4200)*q.xz; return q/1.0000; }
vec3 Q2(vec3 p){ vec3 q=p-vec3(0.1600,0.0000,-0.0200); q.xz=rot(0.3000)*q.xz; return q/1.1000; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_mantle(Q0(p),0.0000)*1.0000,3.);
  r=U(r,o_sword(Q1(p),0.0000)*1.0000,4.);
  r=U(r,o_proll(Q2(p),1.0000)*1.1000,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return t_mantle(Q0(p),0.0000);
  if(id==4.) return t_sword(Q1(p),0.0000);
  if(id==5.) return t_proll(Q2(p),1.0000);
  return .7; }
