/* Science Unit 1 "Pushes, Pulls and Stuff" — pencil still life: a toy wagon with its
   pull handle raised, a ball that has just been pushed, and a horseshoe magnet pulling
   two paper clips. */
#define CAM_POS vec3(-0.482,0.278,-0.962)
#define CAM_TGT vec3(-0.341,0.030,0.100)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define WG vec3(-.03,0.,.08)
#define WRY .35
vec3 wq(vec3 p){ vec3 q=p-WG; q.xz=rot(WRY)*q.xz; return q; }     /* wagon: x along its length */
float wheel(vec3 q){ /* wheel in the local yz plane at q=0, axis along z */
  float tire=sdTorus(q.xzy,.03,.009);
  float hub=sdCylZ(q,.009,.012);
  float a=atan(q.y,q.x); float sp=abs(fract(a/6.2832*6.)-.5)*6.2832/6.*length(q.xy)-.0028;
  float spokes=max(max(sp,length(q.xy)-.031),abs(q.z)-.003);
  return min(min(tire,hub),spokes); }
vec2 wagon(vec3 p){
  vec3 q=wq(p);
  float bed=sdRBox(q-vec3(0.,.085,0.),vec3(.12,.035,.07),.006);
  bed=max(bed,-sdRBox(q-vec3(0.,.1,0.),vec3(.11,.035,.06),.004));        /* open box */
  float rim=sdRBox(q-vec3(0.,.12,0.),vec3(.123,.004,.073),.003); rim=max(rim,-sdBox(q-vec3(0.,.12,0.),vec3(.112,.01,.062)));
  float axle=min(sdCylZ(q-vec3(.08,.04,0.),.004,.085),sdCylZ(q-vec3(-.08,.04,0.),.004,.085));
  float w=1e5;
  for(int i=0;i<4;i++){ vec3 c=vec3(i<2?.08:-.08,.04,(i%2==0)?.082:-.082); w=min(w,wheel(q-c)); }
  /* handle from the front axle, raised up and forward, with a T grip */
  vec3 h0=vec3(.13,.045,0.), h1=vec3(.29,.2,0.);
  float handle=sdCapsule(q,h0,h1,.0045);
  handle=min(handle,sdCylZ(q-h1,.006,.028)-.001);
  return vec2(min(min(bed,rim),min(axle,handle)),w); }
float ball(vec3 p){ return length(p-vec3(-.29,.05,.04))-.05; }
/* horseshoe magnet standing on its poles, arch up, two paper clips caught at the poles */
vec3 mq(vec3 p){ vec3 q=p-vec3(.33,0.,.05); q.xz=rot(-.45)*q.xz; return q; }
vec2 magnet(vec3 p){
  vec3 q=mq(p);
  vec2 u=q.xy-vec2(0.,.085);
  float arcD=abs(length(u)-.042)-.017; arcD=max(arcD,-u.y);
  float legs=max(abs(abs(u.x)-.042)-.017,max(u.y,-u.y-.085));
  float m=max(min(arcD,legs),abs(q.z)-.016)-.002;
  float clips=1e5;
  for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 c=q-vec3(s*.05,.0013,-.036); c.xz=rot(s*.5+.2)*c.xz;
    float o=length(vec2(length(vec2(c.x,max(abs(c.z)-.014,0.)))-.0065,c.y))-.0012;
    float i2=length(vec2(length(vec2(c.x-.0005,max(abs(c.z+.002)-.01,0.)))-.0038,c.y))-.0012;
    clips=min(clips,min(o,i2)); }
  return vec2(m,clips); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 w=wagon(p); r=U(r,w.x,3.); r=U(r,w.y,4.);
  r=U(r,ball(p),5.);
  vec2 m=magnet(p); r=U(r,m.x,6.); r=U(r,m.y,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .4;
  if(id==4.) return .3;
  if(id==5.){ vec3 q=p-vec3(-.29,.05,.04); q.xy=rot(.5)*q.xy; return abs(abs(q.y)-.022)<.0035?.35:.82; }  /* a ball with a band */
  if(id==6.){ vec3 q=mq(p); return q.y<.03?.88:.35; }                                       /* painted pole tips */
  if(id==7.) return .6;
  return .7; }
