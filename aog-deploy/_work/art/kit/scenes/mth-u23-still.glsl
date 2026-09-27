/* Math Unit 23 "Algebra II: Polynomial, Rational and Radical Functions" — pencil still life:
   the open-top box problem: a card box folded up from a sheet with its corners cut out, a
   flat sheet with four corner squares cut away beside it, and the four little cut squares. */
#define CAM_POS vec3(-0.4118,0.4474,-0.6779)
#define CAM_TGT vec3(-0.2260,-0.0637,0.1120)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
vec3 bxQ(vec3 p){ vec3 q=p-vec3(.06,0.,.1); q.xz=rot(.4)*q.xz; return q; }
#define BX vec3(.1,.055,.075)
float boxD(vec3 p){ vec3 q=bxQ(p)-vec3(0.,BX.y,0.);
  float outer=sdBox(q,BX); float inner=sdBox(q-vec3(0.,.004,0.),BX-vec3(.0025,0.,.0025)+vec3(0.,.002,0.));
  return max(outer,-inner)-.0008; }
vec3 shQ(vec3 p){ vec3 q=p-vec3(-.14,.0012,.0); q.xz=rot(-.15)*q.xz; return q; }
float sheet(vec3 p){ vec3 q=shQ(p); vec2 u=q.xz; float c=.04;
  float s=sdBox2(u,vec2(.12,.09)); vec2 a=abs(u)-vec2(.12,.09)+c; float cut=max(-a.x,-a.y)*-1.; 
  s=max(s,-sdBox2(abs(u)-vec2(.12,.09),vec2(c)));
  return max(s,abs(q.y)-.0012); }
float sq(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return max(sdBox2(q.xz,vec2(.02)),abs(q.y-.0012)-.0012); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,boxD(p),3.);
  r=U(r,sheet(p),4.);
  float s=min(sq(p,vec3(.02,0.,-.1),.3),sq(p,vec3(.065,0.,-.12),-.2));
  s=min(s,min(sq(p,vec3(.03,.0025,-.14),.9),sq(p,vec3(.24,0.,-.02),.5)));
  r=U(r,s,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bxQ(p); if(n.y>.5&&q.y<.01) return .45; return .82; }
  if(id==4.){ vec3 q=shQ(p); vec2 a=abs(q.xz); if(abs(a.x-.08)<.0012&&a.y<.05||abs(a.y-.05)<.0012&&a.x<.08) return .35; return .88; }
  if(id==5.) return .8;
  return .7; }
