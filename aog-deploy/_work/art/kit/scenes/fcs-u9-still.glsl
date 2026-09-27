/* FCS Unit 9 "Kitchen Safety and Sanitation" — pencil still life: a trigger spray bottle of
   cleaner, a clean cutting board standing on its edge, and a dial food thermometer lying in front. */
#define CAM_POS vec3(-0.30,0.36,-0.84)
#define CAM_TGT vec3(-0.05,0.06,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define SB vec3(.0,0.,.03)
vec3 sq(vec3 p){ vec3 q=p-SB; q.xz=rot(.5)*q.xz; return q; }
float spray(vec3 p){ vec3 q=sq(p);
  float body=sdRBox(q-vec3(0.,.085,0.),vec3(.042,.085,.03),.022);
  float neck=sdCone(q-vec3(0.,.185,0.),.03,.015,.018);
  float cap=sdCylY(q-vec3(0.,.21,0.),.018,.01)-.002;
  vec3 h=q-vec3(-.02,.24,0.); float head=sdRBox(h,vec3(.045,.018,.014),.009);
  head=min(head,sdRBox(q-vec3(-.07,.248,0.),vec3(.015,.009,.009),.004));
  vec3 t=q-vec3(-.045,.205,0.); t.xy=rot(.3)*t.xy; float trig=sdRBox(t,vec3(.006,.022,.008),.004);
  return min(min(body,neck),min(min(cap,head),trig)); }
vec3 bq(vec3 p){ vec3 q=p-vec3(.19,0.,.13); q.xz=rot(-.35)*q.xz; q.yz=rot(-.14)*q.yz; return q; }
float board(vec3 p){ vec3 q=bq(p); float b=sdRBox(q-vec3(0.,.13,0.),vec3(.1,.13,.009),.008);
  b=max(b,-sdCylZ(q-vec3(0.,.225,0.),.015,.02)); return b; }
float thermo(vec3 p){ vec3 q=p-vec3(-.12,.007,-.08); q.xz=rot(-.15)*q.xz;
  float dial=sdCylY(q,.028,.006)-.002; float stem=sdCapsule(q,vec3(.03,-.002,0.),vec3(.2,-.002,0.),.0022);
  float clip=sdRBox(q-vec3(.07,.001,.008),vec3(.03,.002,.003),.001);
  return min(min(dial,stem),clip); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,board(p),3.);
  r=U(r,spray(p),4.);
  r=U(r,thermo(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bq(p); return .7+.08*sin(q.x*90.+fbm(q.xy*20.)*4.); }
  if(id==4.){ vec3 q=sq(p); if(q.y>.2) return .3;
    if(q.z<-.028&&abs(q.x)<.032&&q.y>.05&&q.y<.13){ if(abs(q.y-.11)<.005&&abs(q.x)<.022) return .3; if(abs(q.y-.075)<.003&&abs(q.x)<.018) return .5;
      return .9; } return .62; }
  if(id==5.){ vec3 q=p-vec3(-.12,.007,-.08); q.xz=rot(-.15)*q.xz; float r=length(q.xz);
    if(q.y>.006&&r<.024){ vec2 u=q.xz; if(sdSeg2(u,vec2(0.),vec2(.015,.01))<.0018) return .1; float a=atan(u.y,u.x);
      if(r>.018&&abs(fract(a/(PI/8.))-.5)>.4) return .25; return .95; } return r<.032?.4:.7; }
  return .7; }
