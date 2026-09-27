/* Science Unit 11 "Forces, Motion and Energy" — pencil still life: a Newton's cradle with
   one ball raised, an apple, and a coiled spring. */
#define CAM_POS vec3(-0.4695,0.2296,-0.6317)
#define CAM_TGT vec3(-0.1746,0.0123,0.1440)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define NC vec3(.02,0.,.08)
#define NRY .35
vec3 nq(vec3 p){ vec3 q=p-NC; q.xz=rot(NRY)*q.xz; return q; }
#define BR .022
#define TOP .2
vec2 cradle(vec3 p){ vec3 q=nq(p);
  float base=sdRBox(q-vec3(0.,.008,0.),vec3(.13,.008,.065),.004);
  float fr=1e5;
  for(int i=0;i<2;i++){ float z=i==0?-.055:.055;
    fr=min(fr,sdCapsule(q,vec3(-.115,.016,z),vec3(-.115,TOP,z),.004));
    fr=min(fr,sdCapsule(q,vec3(.115,.016,z),vec3(.115,TOP,z),.004));
    fr=min(fr,sdCapsule(q,vec3(-.115,TOP,z),vec3(.115,TOP,z),.004)); }
  float balls=1e5, str=1e5;
  for(int i=0;i<5;i++){ float x=float(i-2)*2.*BR; vec3 piv=vec3(x,TOP,0.); float L=TOP-.075;
    float a=i==0?-.75:0.; vec3 c=piv+vec3(sin(a)*L,-cos(a)*L,0.);
    balls=min(balls,length(q-c)-BR+.0005);
    str=min(str,min(sdCapsule(q,piv+vec3(0.,0.,-.055),c,.0012),sdCapsule(q,piv+vec3(0.,0.,.055),c,.0012))); }
  return vec2(min(base,fr),min(balls,str)); }
#define AP vec3(-.25,0.,.0)
vec2 apple(vec3 p){ vec3 q=p-AP-vec3(0.,.048,0.);
  float r=length(q.xz); float d=length(q*vec3(1.,1.08,1.))-.05;
  d+= .012*exp(-r*r/.0003)*step(0.,q.y)*1.2;
  d+= .01*exp(-r*r/.0002)*step(q.y,0.);
  float stem=sdCapsule(q,vec3(0.,.035,0.),vec3(.006,.07,0.),.003);
  vec3 l=q-vec3(.006,.062,0.); l.xy=rot(-.6)*l.xy; float leaf=.7*sdEll(l-vec3(.022,0.,0.),vec3(.022,.002,.01));
  return vec2(d*.8,min(stem,leaf)); }
float spring(vec3 p){ vec3 q=p-vec3(.31,.0,.03); 
  float pitch=.014; float y=clamp(q.y,.01,.13);
  float a=atan(q.z,q.x); float t=(q.y-.01-a/6.2832*pitch)/pitch; float k=floor(t+.5);
  float yy=.01+(k+a/6.2832)*pitch; yy=clamp(yy,.006,.134);
  float d=length(vec2(length(q.xz)-.03,q.y-yy))-.0035;
  return max(d,-.001)*.6+ (q.y<-.001?1.:0.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 c=cradle(p); r=U(r,c.x,3.); r=U(r,c.y,4.);
  vec2 a=apple(p); r=U(r,a.x,5.); r=U(r,a.y,6.);
  r=U(r,spring(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .35; if(id==4.) return .7;
  if(id==5.){ vec3 q=p-AP; float s=fract(atan(q.z,q.x)*3.)*.08; return .45+s; }
  if(id==6.) return .35; if(id==7.) return .55;
  return .7; }
