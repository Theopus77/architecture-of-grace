/* Crosswalk: IDEA legal detail — a wooden gavel resting on its round sound block, beside a stack of two law books. */
#define CAM_POS vec3(-0.4762,0.2891,-0.5925)
#define CAM_TGT vec3(-0.2420,-0.0318,0.0840)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.4)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#include "xwparts.glsl"

#define SB vec3(.1,0.,-.06)
float block(vec3 p){ vec3 q=p-SB; float d=sdCylY(q-vec3(0.,.012,0.),.06,.01)-.003;
  d=min(d,sdCylY(q-vec3(0.,.027,0.),.048,.004)-.002); return d; }
vec3 gq(vec3 p){ vec3 q=p-(SB+vec3(-.01,.0,0.)); q.xz=rot(.5)*q.xz; return q; }
float gavelHead(vec3 q){ vec3 h=q-vec3(-.015,.057,0.);
  float d=sdCylZ(h,.022,.05)-.003;
  d=min(d,sdCylZ(h-vec3(0.,0.,.047),.024,.006)-.002); d=min(d,sdCylZ(h+vec3(0.,0.,.047),.024,.006)-.002);
  return d; }
float gavelHandle(vec3 q){ return min(sdCapsule(q,vec3(-.01,.052,0.),vec3(-.2,.009,.01),.0065),
  length(q-vec3(-.205,.009,.01))-.011); }
#define B1 vec3(-.06,0.,.17)
#define B2 vec3(-.06,.056,.17)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 a=xwBookD(P(p,B1,.12),vec3(.15,.028,.11)); r=U(r,a.x,3.); r=U(r,a.y,4.);
  vec2 b=xwBookD(P(p,B2,-.08),vec3(.135,.022,.1)); r=U(r,b.x,5.); r=U(r,b.y,6.);
  r=U(r,block(p),7.);
  vec3 q=gq(p); r=U(r,gavelHead(q),8.); r=U(r,gavelHandle(q),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.){ vec3 q=P(p,B1,.12); return abs(abs(q.x+.15)-.0)<.012&&abs(abs(q.y-.028)-.012)<.002?.15:.3; }
  if(id==4.) return xwPagesT(P(p,B1,.12));
  if(id==5.){ vec3 q=P(p,B2-vec3(0.,.056,0.),-.08); return .5; }
  if(id==6.) return xwPagesT(P(p,B2,-.08));
  if(id==7.) return .32+.1*grain(p,40.);
  if(id==8.){ vec3 h=gq(p)-vec3(-.015,.057,0.); return abs(abs(h.z)-.036)<.0025?.2:.35+.08*grain(h,40.); }
  if(id==9.) return .42+.08*grain(gq(p),50.);
  return .7; }
