/* Economics Unit 13 "Prices, Controls and Market Failure" — pencil still life: an old
   roadside gas pump with a round globe on top and a price dial, a hose and nozzle, and a
   small oil can. */
#define CAM_POS vec3(-0.4776,0.2924,-0.9556)
#define CAM_TGT vec3(-0.3369,0.0453,0.1029)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define PC vec3(.1,0.,.16)
vec3 pq(vec3 p){ vec3 q=p-PC; q.xz=rot(-.3)*q.xz; return q; }
vec2 pump(vec3 p){
  vec3 q=pq(p);
  float base=sdRBox(q-vec3(0.,.01,0.),vec3(.06,.01,.05),.003);
  float body=sdRBox(q-vec3(0.,.12,0.),vec3(.045,.11,.035),.012);
  float head=sdRBox(q-vec3(0.,.2,0.),vec3(.05,.03,.04),.01);
  float glob=length((q-vec3(0.,.26,0.))*vec3(1.,1.15,1.6))-.04; glob*=.6;
  float dial=sdCylZ(q-vec3(0.,.2,-.04),.022,.004);
  vec3 h=q-vec3(.05,.1,0.);
  float hose=sdTorus(vec3(h.x,h.y+.03,h.z).xzy*vec3(1.,1.,1.),.03,.004); hose=max(hose,-h.x);
  float noz=sdRBox(q-vec3(.052,.14,-.012),vec3(.008,.02,.008),.003);
  return vec2(min(min(base,body),min(head,glob)),min(dial,min(hose,noz))); }
vec3 oq(vec3 p){ vec3 q=p-vec3(-.18,0.,.0); q.xz=rot(.5)*q.xz; return q; }
float oilcan(vec3 p){
  vec3 q=oq(p);
  float body=sdCone(q-vec3(0.,.03,0.),.045,.035,.03)-.002;
  float top=sdCone(q-vec3(0.,.07,0.),.035,.008,.012);
  float spout=sdCapsule(q,vec3(0.,.08,0.),vec3(.09,.16,0.),.004);
  float hand=sdTorus((q-vec3(-.04,.05,0.)).xzy,.022,.004); hand=max(hand,q.x+.03);
  return min(min(body,top),min(spout,hand)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 a=pump(p); r=U(r,a.x,3.); r=U(r,a.y,4.);
  r=U(r,oilcan(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=pq(p); if(q.y>.23) return .92; if(q.z<-.03&&abs(q.y-.1)<.05&&abs(q.x)<.03) return .75; return .4; }
  if(id==4.){ vec3 q=pq(p); vec3 d=q-vec3(0.,.2,-.04); if(q.z<-.042&&length(d.xy)<.02){ if(sdSeg2(d.xy,vec2(0.),vec2(.01,.012))<.0015) return .1; float a=atan(d.y,d.x); if(length(d.xy)>.015&&fract(a*10./6.2832)<.2) return .2; return .95; } return .25; }
  if(id==5.) return .5;
  return .7; }
