/* Buddhist Texts Unit 12 "Close Reading the Suttas" — pencil still life: the emblem of the Deer
   Park, where the first teaching was given: an eight-spoked wheel standing on a low stone plinth
   with two small carved deer standing on either side, facing it. Objects only; no figures. */
#define CAM_POS vec3(-0.3380,0.3616,-0.8774)
#define CAM_TGT vec3(-0.2243,0.0584,0.0701)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define PC vec3(.06,0.,.1)
float plinth(vec3 p){ vec3 q=p-PC; float d=sdRBox(q-vec3(0.,.015,0.),vec3(.26,.015,.09),.004); d=min(d,sdRBox(q-vec3(0.,.036,0.),vec3(.24,.006,.08),.003)); return d; }
/* a small carved deer standing on four slim legs, facing +x */
float deer(vec3 q){
  float body=sdEll(q-vec3(0.,.1,0.),vec3(.058,.026,.022));
  float chest=sdEll(q-vec3(.035,.1,0.),vec3(.03,.027,.021));
  float neck=sdCapsule(q,vec3(.045,.11,0.),vec3(.068,.152,0.),.0095);
  float head=sdEll(q-vec3(.077,.16,0.),vec3(.021,.011,.011)); head=smin(head,sdEll(q-vec3(.095,.155,0.),vec3(.011,.007,.007)),.008);
  float ears=min(sdEll(q-vec3(.066,.172,.013),vec3(.006,.012,.004)),sdEll(q-vec3(.066,.172,-.013),vec3(.006,.012,.004)));
  float legs=1e5;
  for(int i=0;i<4;i++){ float lx=i<2?.035:-.04; float lz=(i==0||i==2)?.011:-.011; float kn=i<2?.01:-.008;
    legs=min(legs,sdCapsule(q,vec3(lx,.095,lz),vec3(lx+kn*.3,.045,lz),.0055)); legs=min(legs,sdCapsule(q,vec3(lx+kn*.3,.045,lz),vec3(lx,.004,lz),.0042)); }
  float tail=sdEll(q-vec3(-.06,.11,0.),vec3(.008,.006,.005));
  float d=smin(smin(body,chest,.015),neck,.012); d=smin(d,head,.008); d=min(d,ears); d=smin(d,legs,.01); d=smin(d,tail,.004);
  return d*.9; }
vec3 d1(vec3 p){ return ry(p-PC-vec3(-.17,.042,-.01),-.45)/1.1; }
vec3 d2(vec3 p){ vec3 q=p-PC-vec3(.17,.042,-.01); q.x=-q.x; return ry(q,-.45)/1.1; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,plinth(p),3.);
  r=U(r,dharmaWheel(p-PC-vec3(0.,.042,0.),.1),4.);
  r=U(r,deer(d1(p))*1.1,5.);
  r=U(r,deer(d2(p))*1.1,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-PC; if(abs(q.y-.03)<.002) return .35; return .62; }
  if(id==4.) return .5;
  if(id==5.){ vec3 q=d1(p); if(p.x>PC.x) q=d2(p); if(length(q-vec3(.083,.164,.009))<.0035||length(q-vec3(.083,.164,-.009))<.0035) return .12; return .6; }
  return .7; }
