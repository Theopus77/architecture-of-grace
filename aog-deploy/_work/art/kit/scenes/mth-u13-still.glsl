/* Math Unit 13 "The Number System" — pencil still life: a tall wooden-backed thermometer
   standing on its foot, its scale running above and below zero, beside three ice cubes and a
   long number-line ruler lying on the table. */
#define CAM_POS vec3(-0.4544,0.2238,-0.8513)
#define CAM_TGT vec3(-0.3310,0.0085,0.1113)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define TC vec3(.04,0.,.1)
#define TS .62
vec3 thQ(vec3 p){ vec3 q=p-TC; q.xz=rot(.18)*q.xz; return q/TS; }
vec2 thermo(vec3 p){ vec3 q=thQ(p);
  float board=sdRBox(q-vec3(0.,.17,0.),vec3(.055,.15,.01),.006);
  float top=sdCylZ(q-vec3(0.,.32,0.),.055,.01)-.006; board=min(board,max(top,-(q.y-.3)));
  float foot=sdRBox(q-vec3(0.,.012,.0),vec3(.07,.012,.045),.005);
  board=min(board,foot);
  float tube=sdCapsule(q,vec3(0.,.07,-.014),vec3(0.,.29,-.014),.0055);
  float bulb=length(q-vec3(0.,.062,-.014))-.013;
  return vec2(board,min(tube,bulb))*TS; }
vec3 nlQ(vec3 p){ vec3 q=p-vec3(-.1,.005,-.07); q.xz=rot(.1)*q.xz; return q; }
float nline(vec3 p){ return sdRBox(nlQ(p),vec3(.22,.005,.03),.002); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 t=thermo(p); r=U(r,t.x,3.); r=U(r,t.y,4.);
  r=U(r,nline(p),5.);
  vec3 c=p-vec3(-.11,.036,.1); c.xz=rot(.4)*c.xz; r=U(r,sdRBox(c,vec3(.036),.009),6.);
  c=p-vec3(-.29,.034,.12); c.xz=rot(-.3)*c.xz; r=U(r,sdRBox(c,vec3(.034),.009),7.);
  c=p-vec3(-.2,.03,-.04); c.xz=rot(.15)*c.xz; r=U(r,sdRBox(c,vec3(.03),.008),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=thQ(p); if(q.z<-.008&&q.y>.08&&q.y<.28&&abs(q.x)>.012&&abs(q.x)<.034){
      float f=fract((q.y-.08)/.02); float big=abs(q.y-.16)<.002?1.:0.;
      if(big>0.) return .05; if(f<.1&&abs(q.x)<(fract((q.y-.08)/.04)<.1?.034:.024)) return .2; }
    return .72; }
  if(id==4.){ vec3 q=thQ(p); return q.y<.2?.15:.92; }
  if(id==5.){ vec3 q=nlQ(p); if(q.y>.004){ if(abs(q.z)<.0015&&abs(q.x)<.2) return .15;
      float f=abs(fract(q.x/.04+.5)-.5)*.04; if(abs(q.x)<.201&&f<.0018&&abs(q.z)<(abs(q.x)<.01?.02:.012)) return .15; }
    return .82; }
  if(id>=6.) return .88;
  return .7; }
