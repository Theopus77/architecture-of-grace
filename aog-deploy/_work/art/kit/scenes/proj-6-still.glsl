/* FACS project 6 "No-bake energy bites" — pencil still life: a small tray lined with wax paper
   holding neat rows of round oat bites, all the same size and dotted with chips, and the mixing
   bowl behind with a spoon resting in it. */
#define CAM_POS vec3(-0.4909,0.5443,-0.7706)
#define CAM_TGT vec3(-0.2475,-0.0156,0.1348)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "projparts.glsl"
#define TC vec3(-.02,0.,-.01)
#define TR .12
#define BC vec3(.17,0.,.12)
vec3 trL(vec3 p){ vec3 q=p-TC; q.xz=rot(TR)*q.xz; return q; }
float tray(vec3 p){ vec3 q=trL(p);
  float d=sdRBox(q-vec3(0.,.011,0.),vec3(.14,.011,.095),.006);
  d=max(d,-sdRBox(q-vec3(0.,.018,0.),vec3(.13,.012,.085),.004));
  return d; }
float paper(vec3 p){ vec3 q=trL(p); q.y-=.0065+.0012*sin(q.x*60.+q.z*40.);
  return sdRBox(q,vec3(.122,.0008,.08),.0006); }
float bites(vec3 p){ vec3 q=trL(p); vec2 c=clamp(floor(q.xz/.052+.5),vec2(-2.,-1.),vec2(2.,1.));
  vec3 l=q-vec3(c.x*.052,.0075+.019,c.y*.052);
  float h=h1(c+3.);
  float d=length(l*vec3(1.,1.08,1.))-.02;
  d+=.0012*(vn3(l*420.+h*9.)-.5)+.0006*vn3(l*900.);
  return d*.85; }
float bowl(vec3 p){ return bowlD(p-BC,.1,.075); }
float mixD(vec3 p){ vec3 q=p-BC; return sdEll(q-vec3(0.,.045,0.),vec3(.093,.035,.093))+.002*vn3(q*300.); }
float spoon(vec3 p){ vec3 q=p-BC; vec3 a=vec3(-.02,.083,-.01), e=vec3(-.15,.13,-.07);
  vec3 b=q-a; b.xz=rot(.45)*b.xz; float bw=max(abs(sdEll(b,vec3(.03,.011,.02)))-.0015,b.y-.002);
  float h=sdCapsule(q,a+vec3(-.02,.004,-.01),e,.0055);
  return min(bw,h); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,tray(p),3.);
  r=U(r,paper(p),4.);
  r=U(r,bites(p),5.);
  r=U(r,bowl(p),6.);
  r=U(r,mixD(p),7.);
  r=U(r,spoon(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .6;
  if(id==4.) return .93;
  if(id==5.){ float c=vn3(p*380.); return c>.78?.15:.5+.1*vn3(p*900.); }
  if(id==6.){ vec3 q=p-BC; return abs(q.y-.055)<.003?.4:.75; }
  if(id==7.){ float c=vn3(p*380.); return c>.8?.2:.5; }
  if(id==8.) return .65;
  return .7; }
