/* Room "Linear Equations and Systems" — pencil still life: a school pan balance standing level,
   three cubes on one pan and a small bag and one cube on the other (both sides equal), with two
   spare cubes on the table. */
#define CAM_POS vec3(-0.4459,0.3064,-0.6929)
#define CAM_TGT vec3(-0.2028,0.0111,0.0716)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define BC vec3(.0,0.,.06)
#define PY .125
#define PX .12
vec3 bcQ(vec3 p){ return place(p,BC,.12); }
float balD(vec3 p){ vec3 q=bcQ(p);
  float base=sdRBox(q-vec3(0.,.012,0.),vec3(.1,.012,.05),.006);
  float post=sdCylY(q-vec3(0.,.06,0.),.008,.05);
  float pivot=sdCylZ(q-vec3(0.,.11,0.),.012,.012)-.002;
  float beam=sdRBox(q-vec3(0.,.106,0.),vec3(PX,.005,.008),.003);
  float needle=sdCone(q-vec3(0.,.132,0.),.004,.0005,.018);
  float stems=min(sdCylY(q-vec3(-PX+.01,.114,0.),.004,.01),sdCylY(q-vec3(PX-.01,.114,0.),.004,.01));
  return min(min(min(base,post),min(pivot,beam)),min(needle,stems)); }
float pansD(vec3 p){ vec3 q=bcQ(p); vec3 a=vec3(abs(q.x)-PX+.01,q.y-PY,q.z);
  float r=length(a.xz); float pan=max(abs(a.y-.012*r*r/(.055*.055))-.002,r-.055)-.001; pan=min(pan,sdTorus(a-vec3(0.,.012,0.),.055,.002));
  return pan; }
#define CB .019
float cubeAt(vec3 p,vec3 c,float a){ return sdRBox(place(p,c,a),vec3(CB),.002); }
float loadD(vec3 p,out float isBag){ vec3 q=bcQ(p); isBag=0.;
  vec3 L=vec3(-PX+.01,PY+.003+CB,0.), R=vec3(PX-.01,PY+.003+CB,0.);
  float d=cubeAt(q,L+vec3(-.018,0.,-.008),.1); d=min(d,cubeAt(q,L+vec3(.017,0.,.004),-.2)); d=min(d,cubeAt(q,L+vec3(-.002,2.*CB+.001,-.002),.3));
  d=min(d,cubeAt(q,R+vec3(.02,0.,.01),.4));
  /* a little tied cloth bag: the unknown */
  vec3 b=q-R-vec3(-.014,.004,-.006); float bag=sdEll(b,vec3(.022,.02,.02)); bag=smin(bag,sdCone(b-vec3(0.,.026,0.),.006,.012,.008),.006);
  bag=min(bag,sdTorus(b-vec3(0.,.02,0.),.007,.0025));
  if(bag<d) isBag=1.;
  return min(d,bag); }
float spareD(vec3 p){ return min(cubeAt(p,vec3(.08,CB,-.13),.5),cubeAt(p,vec3(.12,CB,-.11),-.2)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,balD(p),3.);
  r=U(r,pansD(p),4.);
  float ib; float l=loadD(p,ib); r=U(r,l,ib>.5?6.:5.);
  r=U(r,spareD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bcQ(p); if(q.y<.024) return .4+.12*grain(q,70.); return .55; }
  if(id==4.) return .75;
  if(id==5.) return .82;
  if(id==6.) return .45;
  return .7; }
