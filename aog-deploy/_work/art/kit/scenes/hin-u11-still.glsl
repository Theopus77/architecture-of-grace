/* Hindu Texts Unit 11 "Hindu Texts in History" — pencil still life: finds from the old Indus
   cities: a clay toy cart on two solid wheels, a painted clay storage jar, and a small square
   stamp seal with a plain carved border. Objects only. */
#define CAM_POS vec3(-0.3637,0.3812,-0.9103)
#define CAM_TGT vec3(-0.2477,-0.0059,0.0573)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define JC vec3(.13,0.,.12)
float jar(vec3 p){ vec3 q=p-JC; float y=q.y;
  float r=.075*sin(clamp(y/.2,0.,1.)*2.5+.45)+.012; r=max(r,.045+.008*smoothstep(.19,.2,y));
  float d=(length(q.xz)-r)*.8; d=max(d,max(-y,y-.21));
  d=max(d,-max(length(q.xz)-.038,.17-y));
  d=min(d,sdTorus(q-vec3(0.,.21,0.),.045,.006));
  return d; }
vec3 cQ(vec3 p){ return ry(p-vec3(-.08,0.,-.05),.45); }
float cart(vec3 p){ vec3 q=cQ(p);
  float bed=sdRBox(q-vec3(0.,.05,0.),vec3(.08,.008,.045),.003);
  float sides=max(sdRBox(q-vec3(0.,.07,0.),vec3(.08,.022,.045),.003),-sdBox(q-vec3(0.,.08,0.),vec3(.072,.03,.037)));
  float wh=1e5; for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 w=q-vec3(-.01,.04,s*.055); wh=min(wh,sdCylZ(w,.04,.006)-.002); wh=min(wh,sdCylZ(w,.008,.012)); }
  float axle=sdCylZ(q-vec3(-.01,.04,0.),.004,.065);
  float pole=sdCapsule(q,vec3(.08,.05,0.),vec3(.16,.035,0.),.005);
  return min(min(bed,sides),min(min(wh,axle),pole)); }
vec3 sQ(vec3 p){ return ry(p-vec3(.1,0.,-.14),-.35); }
float seal(vec3 p){ vec3 q=sQ(p); float d=sdRBox(q-vec3(0.,.011,0.),vec3(.032,.011,.032),.003);
  float boss=sdEll(q-vec3(0.,.024,0.),vec3(.012,.008,.012));
  return min(d,boss); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,jar(p),3.);
  r=U(r,cart(p),4.);
  r=U(r,seal(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-JC; float y=q.y; if(abs(y-.15)<.004||abs(y-.13)<.002) return .25;
    if(y>.07&&y<.12){ float a=atan(q.z,q.x); if(abs(y-.095-.012*sin(a*10.))<.003) return .25; float c=length(vec2(fract(a*10./6.2832+.5)-.5,(y-.095)*25.)); if(c<.12) return .3; } return .55; }
  if(id==4.){ vec3 q=cQ(p); if(abs(abs(q.z)-.058)<.004&&abs(length(q.xy-vec2(-.01,.04))-.03)<.002) return .3; return .5; }
  if(id==5.){ vec3 q=sQ(p); vec2 b=abs(q.xz)-vec2(.024); if(q.y>.018&&abs(max(b.x,b.y))<.0025) return .3; return .62; }
  return .7; }
