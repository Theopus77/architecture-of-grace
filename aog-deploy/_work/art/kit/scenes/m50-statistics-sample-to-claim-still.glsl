/* Room "Statistics: From a Sample to a Claim" — pencil still life: a wide wooden bowl heaped
   with light and dark marbles (the population), a small scoop holding a handful of them (the
   sample), and a pair of dice. */
#define CAM_POS vec3(-0.3559,0.2868,-0.6126)
#define CAM_TGT vec3(-0.1409,-0.0435,0.0324)
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
#define BW vec3(-.05,0.,.07)
#define MR .0115
float bowlD(vec3 p){ vec3 q=p-BW; float r=length(q.xz);
  vec3 c=q-vec3(0.,.16,0.);
  float d=max(abs(length(c)-.17)-.005,q.y-.06); d=max(d,-q.y+.004);
  d=min(d,sdCylY(q-vec3(0.,.005,0.),.05,.005)-.002);
  d=min(d,max(sdTorus(q-vec3(0.,.06,0.),.1205,.005),0.));
  return d; }
/* marbles packed on a heap: a jittered grid on the surface y = heap(r) */
float heap(vec2 u){ float r=length(u); return .045+.025*(1.-r*r/.012); }
float marblesD(vec3 p,out float dark){ vec3 q=p-BW; dark=0.; float d=1e5;
  vec2 g=floor(q.xz/(2.*MR));
  for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){ vec2 cell=g+vec2(i,j); vec2 o=(h22(cell)-.5)*MR*.4;
    vec2 c=(cell+.5)*2.*MR+o; if(length(c)>.105) continue;
    float y=heap(c)+MR*.3*h1(cell*1.7); float e=length(q-vec3(c.x,y,c.y))-MR;
    if(e<d){ d=e; dark=step(.62,h1(cell+3.1)); } }
  return max(d,-1.); }
vec3 scQ(vec3 p){ vec3 q=p-vec3(.14,0.,-.08); q.xz=rot(-.5)*q.xz; return q; }
float scoopD(vec3 p){ vec3 q=scQ(p);
  vec3 c=q-vec3(0.,.035,0.); float cup=max(abs(length(c)-.034)-.0025,c.y); cup=max(cup,-c.y-.034);
  cup=min(cup,max(sdTorus(c,.034,.0025),0.));
  float handle=sdCapsule(q,vec3(.035,.033,0.),vec3(.12,.02,0.),.005);
  return min(cup,handle); }
float sampleD(vec3 p,out float dark){ vec3 q=scQ(p); float d=1e5; dark=0.;
  for(int i=0;i<5;i++){ float fi=float(i); vec3 c=vec3(.014*cos(fi*1.3+.4)*step(.5,fi),.034,.014*sin(fi*1.3+.4)*step(.5,fi)); if(i==4) c=vec3(0.,.052,0.); if(i==0) c=vec3(.0,.03,.0);
    float e=length(q-c)-MR; if(e<d){ d=e; dark=(i==1||i==3)?1.:0.; } }
  return d; }
float dieD(vec3 p,vec3 c,float a,vec3 tilt){ vec3 q=place(p,c,a); float s=.017; float d=sdRBox(q,vec3(s),.004);
  /* pips: 1 on top, 3 on front, 2 on right */
  d=max(d,-(length(q-vec3(0.,s,0.))-.0045));
  for(int i=-1;i<=1;i++){ d=max(d,-(length(q-vec3(float(i)*.009,float(i)*.009,-s))-.0038)); }
  d=max(d,-(length(q-vec3(s,.008,.008))-.0038)); d=max(d,-(length(q-vec3(s,-.008,-.008))-.0038));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bowlD(p),3.);
  float dk; float m=marblesD(p,dk); r=U(r,m,dk>.5?5.:4.);
  r=U(r,scoopD(p),6.);
  float ds; float s=sampleD(p,ds); r=U(r,s,ds>.5?5.:4.);
  r=U(r,min(dieD(p,vec3(.05,.017,-.16),.3,vec3(0.)),dieD(p,vec3(.1,.017,-.19),-.4,vec3(0.))),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45+.15*grain(p-BW,60.);
  if(id==4.) return .88;
  if(id==5.) return .3;
  if(id==6.) return .65;
  if(id==7.) return .85;
  return .7; }
