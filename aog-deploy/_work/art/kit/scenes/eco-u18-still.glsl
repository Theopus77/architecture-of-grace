/* Economics Unit 18 "Trade, Taxes and the World Economy" — pencil still life: a stack of
   ribbed shipping containers, a small desk globe on top of the world, and a harbour crane
   hook hanging from a toy crane arm. */
#define CAM_POS vec3(-0.3997,0.2549,-0.8394)
#define CAM_TGT vec3(-0.2758,0.0373,0.0930)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define CC vec3(.06,0.,.16)
vec3 cq(vec3 p){ vec3 q=p-CC; q.xz=rot(-.3)*q.xz; return q; }
vec2 boxes(vec3 p){
  vec3 q=cq(p); float d=1e5;
  d=min(d,sdRBox(q-vec3(-.06,.03,0.),vec3(.1,.03,.035),.002));
  d=min(d,sdRBox(q-vec3(.1,.03,.01),vec3(.1,.03,.035),.002)*1.+.0*0.);
  d=min(d,sdRBox(q-vec3(.02,.09,0.),vec3(.1,.03,.035),.002));
  float crane=sdRBox(q-vec3(.2,.13,.06),vec3(.008,.13,.008),.002);
  crane=min(crane,sdRBox(q-vec3(.12,.25,.06),vec3(.1,.006,.006),.002));
  crane=min(crane,sdCylY(q-vec3(.05,.2,.06),.0012,.05));
  vec3 h=q-vec3(.05,.14,.06); float hook=max(abs(length(h.xy)-.012)-.003,abs(h.z)-.003); hook=max(hook,h.y-.004);
  crane=min(crane,sdRBox(q-vec3(.2,.006,.06),vec3(.03,.006,.03),.002));
  return vec2(d,min(crane,hook)); }
#define GC vec3(-.2,.07,.0)
vec2 globe(vec3 p){
  vec3 q=p-GC;
  float ball=length(q)-.055;
  vec3 m=q; m.xy=rot(-.41)*m.xy;
  float ring=max(abs(length(m.xy)-.063)-.003,abs(m.z)-.003);
  vec3 b=p-vec3(GC.x,0.,GC.z);
  float base=sdCone(b-vec3(0.,.008,0.),.04,.03,.008)-.002;
  float neck=sdCylY(b-vec3(0.,.012,0.),.005,.01);
  return vec2(ball,min(ring,min(base,neck))); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 b=boxes(p); r=U(r,b.x,3.); r=U(r,b.y,4.);
  vec2 g=globe(p); r=U(r,g.x,5.); r=U(r,g.y,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=cq(p); float lvl=floor(q.y/.06); float side=step(0.,q.x-.0);
    float v=lvl>0.?.45:(q.x<.0?.7:.55); if(abs(n.y)<.5&&fract(q.x/.008)<.3) v-=.12; return v; }
  if(id==4.) return .4;
  if(id==5.){ vec3 q=normalize(p-GC); float land=smoothstep(.5,.54,fbm3(q*1.9+vec3(1.1,4.7,.4))); return land>.5?.4:.85; }
  if(id==6.) return .4;
  return .7; }
