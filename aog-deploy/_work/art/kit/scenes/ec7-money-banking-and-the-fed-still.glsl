/* ec7 "Money, Banking and the Federal Reserve" — a small steel bank safe with a combination
   dial and handle, three stacks of coins, and a brass key. */
#define CAM_POS vec3(-0.3799,0.2361,-0.6341)
#define CAM_TGT vec3(-0.1487,-0.0105,0.0899)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
#define SF vec3(-.03,0.,.12)
vec3 sQ(vec3 p){ return place(p,SF,-.3); }
float safe(vec3 p){ vec3 q=sQ(p);
  float b=sdRBox(q-vec3(0.,.085,0.),vec3(.085,.075,.075),.008);
  float door=sdRBox(q-vec3(-.005,.085,-.076),vec3(.068,.06,.004),.003);
  float feet=1e5; for(int i=0;i<4;i++){ vec2 s=vec2(i<2?-1.:1.,mod(float(i),2.)<1.?-1.:1.);
    feet=min(feet,sdCylY(q-vec3(s.x*.07,.005,s.y*.06),.009,.005)); }
  return min(min(b,door),feet); }
float dial(vec3 p){ vec3 q=sQ(p)-vec3(-.015,.095,-.084);
  float a=atan(q.y,q.x);
  float d=sdCylZ(q,.026+.0012*step(0.,cos(a*40.)),.005)-.001;
  d=min(d,sdCylZ(q-vec3(0.,0.,-.006),.008,.004)-.001);
  vec3 h=sQ(p)-vec3(.04,.095,-.09); float hd=sdCylZ(h,.004,.008);
  for(int i=0;i<3;i++){ float an=float(i)*2.094+.4; hd=min(hd,sdCapsule(h,vec3(0.,0.,-.006),vec3(cos(an)*.022,sin(an)*.022,-.008),.0028)); hd=min(hd,length(h-vec3(cos(an)*.022,sin(an)*.022,-.008))-.005); }
  return min(d,hd); }
float coins(vec3 p){
  float d=coinStack(p-vec3(.12,0.,-.02),.02,.0045,14);
  d=min(d,coinStack(p-vec3(.17,0.,.03),.02,.0045,6));
  d=min(d,coinStack(p-vec3(.2,0.,-.05),.02,.0045,3));
  d=min(d,coinD(place(p,vec3(.08,0.,-.09),0.),.02,.004));
  return d; }
vec3 kQ(vec3 p){ vec3 q=p-vec3(.04,.004,-.13); q.xz=rot(.4)*q.xz; return q; }
float key(vec3 p){ vec3 q=kQ(p);
  float bow=sdTorus(q-vec3(-.04,0.,0.),.012,.004);
  float shaft=sdRBox(q-vec3(.005,0.,0.),vec3(.035,.0028,.005),.001);
  float teeth=sdBox(q-vec3(.02,0.,-.006),vec3(.018,.0028,.003));
  teeth=max(teeth,-(abs(fract(q.x/.007)-.5)*.007-.0015+ (q.z+.004)*.0));
  return min(min(bow,shaft),teeth); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,safe(p),3.);
  r=U(r,dial(p),4.);
  r=U(r,coins(p),5.);
  r=U(r,key(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=sQ(p); if(q.z<-.079&&abs(abs(q.x+.005)-.066)<.002) return .25; return .5; }
  if(id==4.){ vec3 q=sQ(p)-vec3(-.015,.095,-.084); float a=atan(q.y,q.x); float r=length(q.xy);
    if(r<.026&&r>.018&&fract(a/6.2832*20.)<.2) return .2; return .75; }
  if(id==5.){ if(abs(n.y)<.6) return fract(p.y/.0045)<.25?.35:.7; float r=length(fract(p.xz*25.)-.5); return .78; }
  if(id==6.) return .6;
  return .7; }
