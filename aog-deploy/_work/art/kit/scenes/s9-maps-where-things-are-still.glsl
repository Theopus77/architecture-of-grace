/* s9 "Maps: Where Things Are" — a paper map folded in panels lying open on the table, with
   roads, a river and a compass rose drawn on it, a brass pocket compass resting on one
   corner, and a push-pin marking a place. */
#define CAM_POS vec3(-0.3915,0.3710,-0.5261)
#define CAM_TGT vec3(-0.2038,0.0329,0.1048)
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
#define SA .95
vec3 sK(vec3 p){ vec3 k=p-vec3(-.03,0.,.1); k.xz=rot(-.15)*k.xz; return k; }
vec3 mQ(vec3 p){ vec3 k=sK(p); vec3 v=vec3(0.,sin(SA),cos(SA)), n=vec3(0.,cos(SA),-sin(SA));
  return vec3(k.x,dot(k,n),dot(k,v)-.1); }
float mapD(vec3 p){ vec3 q=mQ(p); float pn=.055; float fold=.005*abs(fract(q.x/pn)-.5)*2.;   /* accordion folds */
  float d=sdBox(q-vec3(0.,fold,0.),vec3(.15,.0008,.095))*.7;
  vec3 k=sK(p); float leg=sdRBox(k-vec3(0.,.08,.19*cos(SA)+.012),vec3(.1,.08,.005),.002);
  return max(min(d,leg),-p.y); }
vec3 cQ(vec3 p){ return p-vec3(.14,0.,.0); }
float compass(vec3 p){ vec3 q=cQ(p);
  float c=sdCylY(q-vec3(0.,.012,0.),.036,.008)-.003;
  c=max(c,-sdCylY(q-vec3(0.,.022,0.),.03,.004));
  float ring=sdTorus((q-vec3(0.,.012,.042)).xzy*vec3(1.,1.,1.),.007,.002);
  float stem=sdCylZ(q-vec3(0.,.012,.037),.004,.004);
  return min(c,min(ring,stem)); }
float needle(vec3 p){ vec3 q=cQ(p)-vec3(0.,.019,0.); q.xz=rot(.3)*q.xz;
  vec2 u=q.xz; float d=max(abs(u.x)*6.+abs(u.y)-.026,abs(q.y)-.0012); return min(d,sdCylY(q,.003,.002)); }
float glassC(vec3 p){ vec3 q=cQ(p); return sdCylY(q-vec3(0.,.021,0.),.03,.0005); }
float pin(vec3 p){ vec3 k=p-vec3(.06,.0,-.03);
  return min(sdCylY(k-vec3(0.,.008,0.),.0012,.008),min(sdCone(k-vec3(0.,.022,0.),.007,.004,.008)-.001,sdCylY(k-vec3(0.,.034,0.),.01,.004)-.002)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,mapD(p),3.);
  r=U(r,compass(p),4.);
  r=U(r,needle(p),5.);
  r=U(r,pin(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=mQ(p); if(abs(q.x)>.15||abs(q.z)>.095||q.y<-.002) return .45; vec2 u=q.xz; float a=.93;
    float coast=fbm(u*12.+vec2(2.,5.))-.5+(u.x+.02)*2.5; if(coast<0.) a=.78; if(abs(coast)<.015) a=.25;   /* shoreline */
    float riv=u.y-.03*sin(u.x*40.)-.01; if(abs(riv)<.0022&&coast>0.) a=.4;                                  /* river */
    float rd1=sdSeg2(u,vec2(-.02,-.09),vec2(.14,.08)); float rd2=sdSeg2(u,vec2(.0,.09),vec2(.14,-.08));
    if((rd1<.002||rd2<.002)&&coast>0.) a=.2;
    if(coast>0.&&length(u-vec2(.075,.005))<.008) a=.2;                                                      /* a town */
    vec2 c=u-vec2(-.11,-.06); float rose=min(sdSeg2(c,vec2(0.,-.024),vec2(0.,.024)),sdSeg2(c,vec2(-.018,0.),vec2(.018,0.)));
    if(rose<.0016) a=.2; if(abs(length(c)-.013)<.001) a=.3;
    if(abs(fract(q.x/.055)-.5)>.485) a=min(a,.7);                                                         /* creases */
    return a; }
  if(id==4.){ vec3 q=cQ(p); if(q.y>.018&&length(q.xz)<.03){ float a=atan(q.z,q.x); float r=length(q.xz);
      if(r>.024&&fract(a/6.2832*16.)<.15) return .3; return .9; } return .5; }
  if(id==5.){ vec3 q=cQ(p)-vec3(0.,.019,0.); q.xz=rot(.3)*q.xz; return q.z>0.?.2:.8; }
  if(id==6.) return .35;
  return .7; }
