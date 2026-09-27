/* Practice room "Religion and the World" — pencil still life: a desk globe on its stand, a
   judge's gavel resting beside its round sound block, and two closed books (faith, the world
   and the law that may not favour or forbid it). */
#define CAM_POS vec3(-0.3976,0.2793,-1.0354)
#define CAM_TGT vec3(-0.2485,0.0177,0.0848)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define GC vec3(.02,.17,.17)
#define GR .1
vec2 globe(vec3 p){
  vec3 q=p-GC;
  float ball=length(q)-GR;
  vec3 m=q; m.xy=rot(-.41)*m.xy;                            /* meridian ring tilted 23 degrees */
  float ring=max(abs(length(m.xy)-GR-.009)-.004,abs(m.z)-.004);
  vec3 b=p-vec3(GC.x,0.,GC.z);
  float base=sdCone(b-vec3(0.,.012,0.),.07,.06,.012)-.002;
  float neck=sdCone(b-vec3(0.,.04,0.),.022,.012,.02);
  float arm=sdCapsule(p,vec3(GC.x,.05,GC.z),GC+vec3(rot(.41)*vec2(0.,-GR-.012),0.),.006);
  return vec2(ball,min(min(ring,base),min(neck,arm))); }
/* sound block: a turned round block, bottom at y=0 */
#define SB vec3(.16,0.,.0)
float blockD(vec3 p){ vec3 q=p-SB;
  float d=sdCylY(q-vec3(0.,.012,0.),.058,.012)-.003;
  d=min(d,sdCylY(q-vec3(0.,.026,0.),.05,.004)-.002);
  return d; }
/* gavel lying on the table: head axis along local z, handle along local x */
#define GV vec3(.06,.024,-.15)
vec3 gq(vec3 p){ vec3 q=p-GV; q.xz=rot(-.2)*q.xz; return q; }
float gHead(vec3 q){
  float a=abs(q.z);
  float r=.024-.004*smoothstep(.025,.045,a)+.002*smoothstep(.012,.014,a)*(1.-smoothstep(.016,.018,a));
  float d=sdCylZ(q,r,.047)-.002;
  return d; }
float gHandle(vec3 q){ vec3 h=q; h.xy=rot(-.085)*h.xy;
  float L=.2; float t=clamp(h.x/L,0.,1.);
  float r=.0075+.003*t-.0025*smoothstep(.85,1.,t)+.002*smoothstep(.97,1.,t);
  return sdCapsule(h,vec3(.02,0.,0.),vec3(L,0.,0.),r); }
/* a closed hardback: two boards and a rounded spine round a page block set in a little */
float bookE(vec3 q,vec3 s){
  float t=.0035;
  float b1=sdRBox(q-vec3(0.,t*.5,0.),vec3(s.x,t*.5,s.z),.0012);
  float b2=sdRBox(q-vec3(0.,2.*s.y-t*.5,0.),vec3(s.x,t*.5,s.z),.0012);
  float pg=sdRBox(q-vec3(.002,s.y,0.),vec3(s.x-.004,s.y-t+.0004,s.z-.004),.0015);
  float sp=max(sdCylZ(q-vec3(-s.x+.006,s.y,0.),s.y,s.z),q.x+s.x-.006);
  return min(min(b1,b2),min(pg,sp)); }
/* two closed books, one on the other */
vec3 k1(vec3 p){ vec3 q=p-vec3(-.15,0.,.03); q.xz=rot(.35)*q.xz; return q; }
vec3 k2(vec3 p){ vec3 q=p-vec3(-.145,.036,.028); q.xz=rot(.18)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 g=globe(p); r=U(r,g.x,3.); r=U(r,g.y,4.);
  r=U(r,blockD(p),5.);
  vec3 q=gq(p);
  r=U(r,gHead(q),6.);
  r=U(r,gHandle(q),7.);
  r=U(r,bookE(k1(p),vec3(.075,.018,.1)),8.);
  r=U(r,bookE(k2(p),vec3(.062,.014,.085)),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=normalize(p-GC); q.xy=rot(-.41)*q.xy; q.xz=rot(1.2)*q.xz;
    float land=smoothstep(.5,.54,fbm3(q*1.9+vec3(3.1,1.7,.4))+.12*q.y*q.y);
    float lat=asin(q.y), lon=atan(q.z,q.x);
    float grid=min(abs(fract(lat/.2618+.5)-.5)*.2618,abs(fract(lon/.5236+.5)-.5)*.5236*cos(lat));
    float a=land>.5?.5:.9; if(grid<.004) a=min(a,.6);
    if(abs(land-.5)<.08) a=.25;
    return a; }
  if(id==4.) return .4;
  if(id==5.){ vec3 q=p-SB; if(abs(q.y-.024)<.0015) return .3; return .5+.08*grain(q*vec3(1.,1.,1.),30.); }
  if(id==6.){ vec3 q=gq(p); float a=abs(q.z); if(abs(a-.015)<.0022) return .22; return .42+.06*grain(q.zyx,40.); }
  if(id==7.) return .48;
  if(id==8.){ vec3 q=k1(p); if(abs(q.y-.018)<.014&&(q.x>.069||abs(q.z)>.094)) return .9; return .38; }
  if(id==9.){ vec3 q=k2(p); if(abs(q.y-.014)<.010&&(q.x>.056||abs(q.z)>.079)) return .92; return .62; }
  return .7; }
