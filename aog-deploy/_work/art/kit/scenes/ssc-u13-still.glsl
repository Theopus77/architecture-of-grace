/* Social Studies Unit 13 "Geography of the World" — pencil still life: a desk globe on a
   tilted meridian ring and wooden stand, with a pair of binoculars and a small book. */
#define CAM_POS vec3(-0.3639,0.2807,-0.9733)
#define CAM_TGT vec3(-0.2233,0.0336,0.0851)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define GC vec3(.1,.17,.16)
#define GR .1
vec2 globe(vec3 p){
  vec3 q=p-GC;
  float ball=length(q)-GR;
  vec3 m=q; m.xy=rot(-.41)*m.xy;                            /* meridian ring tilted 23 degrees */
  float ring=max(abs(length(m.xy)-GR-.009)-.004,abs(m.z)-.004);
  ring=max(ring,-(m.y+GR*.3)*0.-1.);
  vec3 b=p-vec3(GC.x,0.,GC.z);
  float base=sdCone(b-vec3(0.,.012,0.),.07,.06,.012)-.002;
  float neck=sdCone(b-vec3(0.,.04,0.),.022,.012,.02);
  float arm=sdCapsule(p,vec3(GC.x,.05,GC.z),GC+vec3(rot(.41)*vec2(0.,-GR-.012),0.),.006);
  return vec2(ball,min(min(ring,base),min(neck,arm))); }
vec3 bq(vec3 p){ vec3 q=p-vec3(-.19,.03,-.02); q.xz=rot(.5)*q.xz; return q; }
float binoculars(vec3 p){
  vec3 q=bq(p);
  float d=1e5;
  for(int i=0;i<2;i++){ float s=float(i)*2.-1.; vec3 c=q-vec3(s*.034,0.,0.);
    float barrel=sdCone(c.xzy,.028,.024,.05)-.002;          /* along z */
    float eye=sdCylZ(c-vec3(0.,0.,.06),.016,.014)-.002;
    float obj=sdCylZ(c-vec3(0.,0.,-.052),.03,.006)-.002;
    obj=max(obj,-sdCylZ(c-vec3(0.,0.,-.06),.024,.006));
    d=min(d,min(min(barrel,eye),obj)); }
  d=min(d,sdCylZ(q-vec3(0.,.012,.02),.008,.045));
  return d; }
vec3 kq(vec3 p){ vec3 q=p-vec3(.33,.018,.02); q.xz=rot(-.4)*q.xz; return q; }
float book(vec3 p){ return bookD(kq(p),vec3(.065,.018,.085)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 g=globe(p); r=U(r,g.x,3.); r=U(r,g.y,4.);
  r=U(r,binoculars(p),5.);
  r=U(r,book(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=normalize(p-GC); q.xy=rot(-.41)*q.xy; q.xz=rot(2.4)*q.xz;
    float land=smoothstep(.5,.54,fbm3(q*1.9+vec3(3.1,1.7,.4))+.12*q.y*q.y);
    float lat=asin(q.y), lon=atan(q.z,q.x);
    float grid=min(abs(fract(lat/.2618+.5)-.5)*.2618,abs(fract(lon/.5236+.5)-.5)*.5236*cos(lat));
    float a=land>.5?.42:.84; if(grid<.004) a=min(a,.6);
    if(abs(land-.5)<.08) a=.25;
    return a; }
  if(id==4.) return .4;
  if(id==5.){ vec3 q=bq(p); return abs(q.z)<.04?.25:.45; }
  if(id==6.){ vec3 q=kq(p); if(abs(q.y)<.012&&(q.x>.06||abs(q.z)>.08)) return fract(q.y/.003)<.4?.8:.92; return .4; }
  return .7; }
