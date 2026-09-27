/* Science Unit 4 "Earth, Sky and Weather" — pencil still life: a school globe on its
   stand, an open umbrella resting on the table, and a rain gauge with its scale marks. */
#define CAM_POS vec3(-0.7708,0.3303,-0.8656)
#define CAM_TGT vec3(-0.3590,0.0269,0.2181)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define GC vec3(.03,0.,.06)
#define TILT .41
vec3 gq(vec3 p){ vec3 q=p-GC-vec3(0.,.19,0.); q.xy=rot(TILT)*q.xy; return q; }
vec2 globe(vec3 p){ vec3 q=p-GC;
  float base=sdCylY(q-vec3(0.,.008,0.),.07,.006)-.003;
  base=min(base,sdCone(q-vec3(0.,.035,0.),.02,.008,.022));
  vec3 g=gq(p);
  float mer=max(abs(length(g)-.108)-.004,abs(g.z)-.005); mer=max(mer,g.x+.02);
  float stem=sdCylY(q-vec3(0.,.06,0.),.005,.03);
  float axle=sdCylY(g,.003,.118);
  float ball=length(g)-.1;
  return vec2(min(min(base,stem),min(mer,axle)),ball); }
vec3 uq(vec3 p){ vec3 q=p-vec3(-.3,.085,.1); q.xz=rot(-.3)*q.xz; q.xy=rot(-1.0)*q.xy; return q-vec3(0.,.02,0.); }
float umb(vec3 p){ vec3 q=uq(p);
  float a=atan(q.z,q.x); float s=6.2832/8.; float fa=abs(mod(a,s)-s*.5)/(s*.5);
  float R=.19; vec3 c=vec3(0.,-.12,0.);
  float cap=abs(length(q-c)-R)-.002; float cut=.1+.012*(1.-fa*fa);
  cap=max(cap,-(q.y-(.0-.012*fa*fa)));
  float ribs=1e5; float aa=mod(a+s*.5,s)-s*.5; vec2 r2=length(q.xz)*vec2(cos(aa),sin(aa));
  ribs=max(abs(length(q-c)-R+.003)-.003,max(abs(r2.y)-.0025,-(q.y+.005)));
  float shaft=sdCapsule(q,vec3(0.,.075,0.),vec3(0.,-.22,0.),.004);
  vec3 h=q-vec3(.025,-.22,0.); float hook=max(length(vec2(length(h.xy)-.025,h.z))-.007,h.y);
  float tip=sdCapsule(q,vec3(0.,.07,0.),vec3(0.,.09,0.),.003);
  return min(min(cap,ribs),min(min(shaft,hook),tip)); }
#define RC vec3(.28,0.,.07)
vec2 gauge(vec3 p){ vec3 q=p-RC;
  float tube=abs(sdCylY(q-vec3(0.,.1,0.),.028,.1))-.002; tube=max(tube,q.y-.199);
  float fun=abs(sdCone(q-vec3(0.,.225,0.),.03,.05,.025))-.002;
  float water=sdCylY(q-vec3(0.,.05,0.),.025,.045);
  float base=sdCylY(q-vec3(0.,.006,0.),.045,.006)-.002;
  return vec2(min(min(tube,fun),base),water); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 g=globe(p); r=U(r,g.x,3.); r=U(r,g.y,4.);
  r=U(r,umb(p),5.);
  vec2 k=gauge(p); r=U(r,k.x,6.); r=U(r,k.y,7.);
  return r; }
float land(vec3 d){ return fbm3(d*2.2+vec3(3.1,1.,.4)); }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .4;
  if(id==4.){ vec3 d=normalize(gq(p)); float l=land(d);
    if(abs(l-.55)<.012) return .2;               /* coast */
    if(l>.55) return .62; float lat=abs(fract(asin(d.y)/.35)-.5); return lat<.03?.55:.82; }
  if(id==5.){ vec3 q=uq(p); float a=atan(q.z,q.x); return fract(a/6.2832*4.)<.5?.35:.8; }
  if(id==6.){ vec3 q=p-RC; float m=fract(q.y/.02); if(q.y>.02&&q.y<.19&&m<.12&&q.z<-.01&&abs(q.x)<.012) return .2; return .88; }
  if(id==7.) return .6;
  return .7; }
