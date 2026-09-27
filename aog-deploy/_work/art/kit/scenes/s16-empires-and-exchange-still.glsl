/* Room s16 "World History: Empires and Exchange" — pencil still life of what a trade road
   carried: a bolt of silk with its end unrolled across the table, a small bowl heaped with
   peppercorns, a mariner's compass in a square wooden box, and old coins with square holes. */
#define CAM_POS vec3(-0.2332,0.2646,-0.6406)
#define CAM_TGT vec3(-0.1267,-0.0786,0.0748)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
vec3 skQ(vec3 p){ return place(p,vec3(-.02,0.,.08),-.2); }   /* bolt along local x */
float boltD(vec3 q){ float d=sdCylX(q-vec3(0.,.045,0.),.045,.1)-.002;
  
  float core=sdCylX(q-vec3(0.,.045,0.),.012,.108);
  return min(d,core); }
float drapeD(vec3 q){ /* the free end runs from under the bolt toward the viewer, rippling */
  float z=q.z; float w=.098; float y=.0045+.003*sin(q.x*45.+z*18.)*smoothstep(.0,-.1,z);
  float s=max(max(abs(q.x)-w,abs(q.y-y)-.0012),max(z-.0,-.19-z));
  return s*.8; }
#define BW vec3(.2,0.,.02)
float bowlSD(vec3 p){ return bowlD(p-BW,.05,.035); }
float pepperD(vec3 p){ vec3 q=p-BW; float r=length(q.xz); float h=.034+.018*exp(-r*r/.0012);
  vec3 c=vec3(q.x,0.,q.z); float bump=length(fract(q*vec3(1.,1.,1.)/.006+.5)-.5)*.006-.0028;
  return max(max(q.y-h,r-.047),.012-q.y)*.8; }
vec3 cbQ(vec3 p){ return place(p,vec3(.14,0.,-.13),.45); }
float compBoxD(vec3 q){ float b=sdRBox(q-vec3(0.,.012,0.),vec3(.045,.012,.045),.003);
  b=max(b,-sdCylY(q-vec3(0.,.02,0.),.036,.01));
  float bowl=sdCylY(q-vec3(0.,.012,0.),.036,.007);
  float glassRim=sdTorus(q-vec3(0.,.02,0.),.036,.0022);
  return min(b,min(bowl,glassRim)); }
float cashCoin(vec3 q,float R){ float d=sdCylY(q-vec3(0.,.0022,0.),R,.0014)-.0008; return max(d,-sdBox(q,vec3(R*.28,.01,R*.28))); }
float coinsD(vec3 p){ return min(min(cashCoin(place(p,vec3(-.16,0.,-.1),.3),.02),cashCoin(place(p,vec3(-.12,.0,-.14),.9),.018)),cashCoin(place(p,vec3(-.19,.0,-.15),.1),.017)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=skQ(p);
  r=U(r,boltD(q),3.);
  r=U(r,drapeD(q),4.);
  r=U(r,bowlSD(p),5.);
  r=U(r,pepperD(p),6.);
  r=U(r,compBoxD(cbQ(p)),7.);
  r=U(r,coinsD(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=skQ(p); if(abs(q.x)>.098){ float r=length(q.yz-vec2(.045,0.)); if(r<.013) return .4; return fract(r/.003)<.3?.6:.85; }
    if(abs(q.x)>.085&&abs(q.x)<.09) return .55; return .8; }
  if(id==4.){ vec3 q=skQ(p); if(abs(q.x)>.085&&abs(q.x)<.09) return .55; if(abs(q.z+.18)<.004) return .6; return .82; }
  if(id==5.) return .62;
  if(id==6.){ return .25+.35*step(.5,vn3(p*900.)); }
  if(id==7.){ vec3 q=cbQ(p); if(q.y>.018&&length(q.xz)<.036){ vec2 u=q.xz; float a=atan(u.y,u.x); float r=length(u);
      float pts=r-.03*(.35+.65*pow(abs(cos(a*2.)),8.)); if(pts<0.&&abs(pts)<.002) return .2; if(pts<0.) return (fract(a/1.5708+.125)<.5)?.35:.85;
      if(abs(r-.032)<.001) return .3; return .95; }
    return .5+.08*grain(p,70.); }
  if(id==8.) return .5;
  return .7; }
