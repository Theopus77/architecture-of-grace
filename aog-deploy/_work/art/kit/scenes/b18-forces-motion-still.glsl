/* Practice room "Forces and Motion" — pencil still life: a wooden ramp with a ball about to
   roll down it, a toy cart waiting at the bottom, and a wooden block pushed against the cart. */
#define CAM_POS vec3(-0.2677,0.3458,-0.6977)
#define CAM_TGT vec3(-0.1491,-0.0364,0.0984)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define RAMP vec3(-.06,.06,.03)
#define CART vec3(.2,0.,.0)
vec3 rampQ(vec3 p){ vec3 q=p-RAMP; q.xz=rot(.12)*q.xz; return q; }
const vec2 RN=vec2(.371,.928);
float rampD(vec3 q){ float b=sdRBox(q,vec3(.16,.06,.05),.004); return max(b,dot(q.xy,RN)-.0); }
float ballD(vec3 p){ vec3 q=rampQ(p); vec2 s=vec2(-.09,.09*.4); return length(q-vec3(s+RN*.032,0.))-.032; }
vec3 cartQ(vec3 p){ vec3 q=p-CART; q.xz=rot(.08)*q.xz; return q; }
float cartBody(vec3 q){ float d=sdRBox(q-vec3(0.,.04,0.),vec3(.06,.017,.036),.005);
  d=max(d,-sdRBox(q-vec3(0.,.06,0.),vec3(.05,.012,.027),.003)); return d; }
float wheels(vec3 q){ vec3 w=vec3(abs(q.x)-.038,q.y-.018,abs(q.z)-.041);
  float d=sdCylZ(w,.018,.005)-.001; d=min(d,sdCylZ(vec3(abs(q.x)-.038,q.y-.018,q.z),.003,.045)); return d; }
float blockD(vec3 p){ vec3 q=place(p,vec3(.3,.025,-.01),.25); return sdRBox(q,vec3(.028,.025,.028),.004); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,rampD(rampQ(p)),3.);
  r=U(r,ballD(p),4.);
  vec3 c=cartQ(p);
  r=U(r,cartBody(c),5.);
  r=U(r,wheels(c),6.);
  r=U(r,blockD(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=rampQ(p); float g=grain(q.zyx*vec3(1.,1.,.3),60.); return .7+.12*g; }
  if(id==4.){ vec3 q=p; return .55; }
  if(id==5.){ vec3 q=cartQ(p); if(abs(q.y-.04)<.003) return .35; return .6; }
  if(id==6.){ vec3 q=cartQ(p); vec3 w=vec3(abs(q.x)-.038,q.y-.018,0.); return length(w.xy)<.007?.35:.28; }
  if(id==7.) return .75;
  return .7; }
