/* m48 "Trigonometric Functions" — a wooden unit-circle wheel standing upright on a stand with
   a crank arm and a peg on its rim, and beside it a long strip of paper with a smooth wave
   drawn on it, curling at the far end. */
#define CAM_POS vec3(-0.4251,0.3049,-0.6934)
#define CAM_TGT vec3(-0.1686,0.0310,0.1104)
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
#define WC vec3(-.08,.13,.1)
#define WR .1
#define ANG .75
vec3 wQ(vec3 p){ return place(p,WC,-.2); }
float wheel(vec3 p){ vec3 q=wQ(p); float r=length(q.xy);
  float d=max(abs(r-WR+.006)-.008,abs(q.z)-.006)-.001;
  d=min(d,max(r-.012,abs(q.z)-.01));
  for(int i=0;i<4;i++){ float a=float(i)*.7854; vec2 dir=vec2(cos(a),sin(a));
    d=min(d,max(abs(dot(q.xy,vec2(-dir.y,dir.x)))-.0022,max(abs(q.z)-.003,r-WR+.01))); }
  return d; }
float stand(vec3 p){ vec3 q=place(p,vec3(WC.x,0.,WC.z),-.2);
  float b=sdRBox(q-vec3(0.,.008,0.),vec3(.07,.008,.045),.003);
  float post=sdRBox(q-vec3(0.,.07,.02),vec3(.008,.07,.006),.002);
  return min(b,post); }
float arm(vec3 p){ vec3 q=wQ(p); vec2 e=vec2(cos(ANG),sin(ANG))*(WR-.006);
  float a=sdCapsule(q,vec3(0.,0.,-.012),vec3(e,-.012),.004);
  float peg=sdCylZ(q-vec3(e,-.02),.005,.012)-.001;
  float knob=length(q-vec3(e,-.034))-.008;
  return min(a,min(peg,knob)); }
#define SA .75
vec3 sK(vec3 p){ vec3 k=p-vec3(.14,0.,-.06); k.xz=rot(-.12)*k.xz; return k; }
vec3 sQ(vec3 p){ vec3 k=sK(p); vec3 v=vec3(0.,sin(SA),cos(SA)), n=vec3(0.,cos(SA),-sin(SA));
  return vec3(k.x,dot(k,n),dot(k,v)-.07); }
float strip(vec3 p){ vec3 q=sQ(p); float d=sdRBox(q-vec3(0.,-.006,0.),vec3(.15,.006,.07),.002);
  d=min(d,sdBox(q-vec3(0.,.0008,0.),vec3(.14,.0008,.058)));
  vec3 k=sK(p); float leg=sdRBox(k-vec3(0.,.045,.13*cos(SA)+.01),vec3(.12,.045,.005),.002);
  return max(min(d,leg),-p.y); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,wheel(p),3.);
  r=U(r,stand(p),4.);
  r=U(r,arm(p),5.);
  r=U(r,strip(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=wQ(p); float r=length(q.xy); float a=atan(q.y,q.x);
    if(r>WR-.012&&abs(q.z)>.005&&fract(a/6.2832*24.)<.1) return .3; return .62+.1*grain(q.zyx,40.); }
  if(id==4.) return .45+.1*grain(p,40.);
  if(id==5.) return .35;
  if(id==6.){ vec3 q=sQ(p); if(q.y<-.0005||abs(q.x)>.14||abs(q.z)>.055) return .5; float a=.94;
    if(abs(q.z)<.0012&&abs(q.x)<.125) a=.5;                                  /* axis */
    if(abs(q.x+.125)<.0012&&abs(q.z)<.045) a=.5;
    float w=.036*sin((q.x+.125)/.25*6.2832); if(abs(q.z-w)<.0026&&abs(q.x)<.125) a=.15;
    return a; }
  return .7; }
