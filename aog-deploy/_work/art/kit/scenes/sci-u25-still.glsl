/* Science Unit 25 "Physics: Energy, Waves and Electricity" — pencil still life: a light bulb
   in its socket on a small board, wired to a battery, with a coil of copper wire. */
#define CAM_POS vec3(-0.6767,0.3046,-0.8314)
#define CAM_TGT vec3(-0.2888,0.0188,0.1893)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define LC vec3(.03,0.,.08)
vec2 bulb(vec3 p){ vec3 q=(p-LC)/1.5;
  float board=sdRBox(q-vec3(-.02,.008,0.),vec3(.1,.008,.06),.003);
  float sock=sdCylY(q-vec3(0.,.035,0.),.028,.02)-.003;
  vec3 b=q-vec3(0.,.07,0.);
  float thread=sdCylY(b,.019,.018)-.001+.0012*sin(b.y*600.);
  vec3 g=q-vec3(0.,.135,0.);
  float glass=smin(length(g)-.05,sdCone(q-vec3(0.,.1,0.),.02,.035,.02),.02);
  return vec2(min(min(board,sock),thread),glass)*1.5; }
float fil(vec3 p){ vec3 q=(p-LC)/1.5-vec3(0.,.135,-.0); 
  float d=min(sdCapsule(q,vec3(-.012,-.05,0.),vec3(-.012,.005,0.),.0012),sdCapsule(q,vec3(.012,-.05,0.),vec3(.012,.005,0.),.0012));
  float c=q.x; float cy=.005+.003*sin(c*600.); d=min(d,max(length(vec2(q.y-cy,q.z))-.0015,abs(q.x)-.012));
  return d*1.5; }
vec3 bq(vec3 p){ vec3 q=p-vec3(-.25,.024,.0); q.xz=rot(.35)*q.xz; return q; }
vec2 battery(vec3 p){ vec3 q=bq(p);
  float body=sdCylX(q,.024,.06)-.001;
  float nub=sdCylX(q-vec3(.064,0.,0.),.007,.005)-.001;
  return vec2(body,nub); }
float wires(vec3 p){
  vec3 a=bq(p);
  float w=1e5; vec3 A=vec3(-.25,.024,.0)+vec3(cos(.35)*.07,0.,sin(.35)*.07)*vec3(1.,1.,-1.);
  w=sdCapsule(p,A,vec3(-.14,.005,.0),.0025);
  w=min(w,sdCapsule(p,vec3(-.14,.005,.0),LC+vec3(-.045,.06,-.03),.0025));
  vec3 B=vec3(-.25,.024,.0)-vec3(cos(.35)*.07,0.,sin(.35)*.07)*vec3(1.,1.,-1.);
  w=min(w,sdCapsule(p,B,vec3(-.33,.004,.08),.0025)); w=min(w,sdCapsule(p,vec3(-.33,.004,.08),vec3(-.05,.004,.16),.0025));
  w=min(w,sdCapsule(p,vec3(-.05,.004,.16),LC+vec3(.045,.06,.03),.0025));
  return w; }
float coil(vec3 p){ vec3 q=p-vec3(.28,.03,.02); q.xz=rot(.3)*q.xz;
  float pitch=.008; float a=atan(q.z,q.y); float t=(q.x-a/6.2832*pitch)/pitch; float k=clamp(floor(t+.5),-7.,7.);
  float xx=(k+a/6.2832)*pitch;
  float d=length(vec2(length(q.yz)-.026,q.x-xx))-.003;
  float core=sdCylX(q,.02,.075)-.001;
  return min(d*.7,core); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 b=bulb(p); r=U(r,b.x,3.); r=U(r,b.y,4.);
  r=U(r,fil(p),5.);
  vec2 c=battery(p); r=U(r,c.x,6.); r=U(r,c.y,7.);
  r=U(r,wires(p),8.);
  r=U(r,coil(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.){ vec3 q=(p-LC)/1.5; return q.y>.05?.5:q.y>.02?.3:.6; }
  if(id==4.) return .93; if(id==5.) return .2;
  if(id==6.){ vec3 q=bq(p); if(abs(q.x-.03)<.002) return .2; return q.x>.03?.8:.35; }
  if(id==7.) return .6; if(id==8.) return .3; if(id==9.) return .45;
  return .7; }
