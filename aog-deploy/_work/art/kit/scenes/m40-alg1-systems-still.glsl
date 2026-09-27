/* m40 "Algebra I: Systems" — a wooden geoboard with two rubber bands stretched across it as
   two straight lines that cross, a push-pin marking the one point on both, and two spare
   bands on the table. */
#define CAM_POS vec3(-0.5357,0.3797,-0.8846)
#define CAM_TGT vec3(-0.2131,0.0356,0.1261)
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
#define BD vec3(.0,0.,.04)
#define PS .045
vec3 bQ(vec3 p){ vec3 q=place(p,BD,.12)-vec3(0.,.14,0.); q.yz=rot(-1.05)*q.yz; return q; }
float board(vec3 p){ vec3 k=place(p,BD,.12); float prop=sdRBox(k-vec3(0.,.06,.09),vec3(.1,.06,.008),.003);
  vec3 q=bQ(p); return min(prop,sdRBox(q-vec3(0.,.008,0.),vec3(.155,.008,.155),.003)); }
float pegs(vec3 p){ vec3 q=bQ(p); vec2 c=clamp(floor(q.xz/PS+.5),-3.,3.); vec3 k=q-vec3(c.x*PS,.02,c.y*PS);
  return min(sdCylY(k,.0028,.006),sdCylY(k-vec3(0.,.007,0.),.0045,.0012)-.0008); }
float band(vec3 q,vec2 a,vec2 b){ vec2 n=normalize(vec2(b.y-a.y,a.x-b.x))*.0034;
  float d=sdCapsule(q,vec3(a.x+n.x,.021,a.y+n.y),vec3(b.x+n.x,.021,b.y+n.y),.0024);
  d=min(d,sdCapsule(q,vec3(a.x-n.x,.021,a.y-n.y),vec3(b.x-n.x,.021,b.y-n.y),.0024));
  return d; }
float bands(vec3 p){ vec3 q=bQ(p);
  float d=band(q,vec2(-3.,-3.)*PS,vec2(3.,2.)*PS);
  d=min(d,band(q-vec3(0.,.0045,0.),vec2(-3.,2.)*PS,vec2(3.,-2.)*PS));
  return d; }
float pin(vec3 p){ vec3 q=bQ(p); vec2 x=vec2(.3333,-.2222)*PS; vec3 k=q-vec3(x.x,.024,x.y);
  float needle=sdCylY(k-vec3(0.,.004,0.),.0012,.006);
  float body=sdCone(k-vec3(0.,.018,0.),.006,.0035,.008)-.001;
  float head=sdCylY(k-vec3(0.,.03,0.),.009,.004)-.002;
  return min(needle,min(body,head)); }
float spare(vec3 p){ vec3 q=p-vec3(.23,.0012,-.1); float d=sdTorus(vec3(q.x,q.y,q.z*1.4),.02,.0012);
  vec3 r=p-vec3(.27,.0012,-.05); r.xz=rot(.8)*r.xz; d=min(d,sdTorus(vec3(r.x,r.y,r.z*1.7),.018,.0012));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,board(p),3.);
  r=U(r,pegs(p),4.);
  r=U(r,bands(p),5.);
  r=U(r,pin(p),6.);
  r=U(r,spare(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .78+.1*grain(bQ(p),40.);
  if(id==4.) return .5;
  if(id==5.) return .25;
  if(id==6.) return .4;
  if(id==7.) return .3;
  return .7; }
