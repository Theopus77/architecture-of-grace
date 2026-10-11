/* skt-u17 "Starting or Returning as an Adult" — pencil still life: a vented skate helmet with its
   strap loop, a pair of wrist guards and a short cruiser board with soft wheels behind them. Objects only. */
#define CAM_POS vec3(-0.3729,0.4378,-0.9390)
#define CAM_TGT vec3(-0.2853,-0.0605,0.0563)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sktparts_b.glsl"
#define CB .36,.11,.25,.19,.03,.02
vec3 Qh(vec3 p){ vec3 q=p-vec3(-.03,0.,-.06); q.xz=rot(.5)*q.xz; return q; }
vec3 Qc(vec3 p){ vec3 q=p-vec3(.06,0.,.24); q.xz=rot(-.22)*q.xz; return q; }
vec3 Qg1(vec3 p){ vec3 q=p-vec3(.18,0.,-.1); q.xz=rot(-.6)*q.xz; return q; }
vec3 Qg2(vec3 p){ vec3 q=p-vec3(.21,0.,.0); q.xz=rot(2.4)*q.xz; return q; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,sb_helmet(Qh(p)),3.);
  vec2 b=sb_board(Qc(p),CB); r=U(r,b.x,4.+b.y);
  r=U(r,min(sb_guard(Qg1(p)),sb_guard(Qg2(p))),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return sbt_helmet(Qh(p));
  if(id>3.5&&id<6.5) return sbt_board(Qc(p),id-4.,CB,3.);
  if(id==7.){ vec3 a=Qg1(p), b=Qg2(p); return sbt_guard(sb_guard(a)<sb_guard(b)?a:b); }
  return .7; }
