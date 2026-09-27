/* U.S. History Unit 6 "Civil War and Reconstruction" (A Broken Nation) — pencil still life: a
   Civil War field drum with its rope tensioners and two crossed drumsticks on its head, a
   brass bugle, and a soldier's kepi cap on the table. No figures. */
#define CAM_POS vec3(-0.4007,0.4322,-0.8671)
#define CAM_TGT vec3(-0.2547,-0.0383,0.1132)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define DR vec3(-.02,0.,.1)
#define DRR .1
#define DH .09
float drum(vec3 q){ float shell=sdCylY(q-vec3(0,DH,0),DRR,DH-.012);
  float hoops=min(sdCylY(q-vec3(0,.012,0),DRR+.006,.012),sdCylY(q-vec3(0,2.*DH-.012,0),DRR+.006,.012))-.001;
  /* V-shaped ropes zigzag round the shell */
  float a=atan(q.z,q.x); float n=12.; float f=fract(a/6.2832*n); float yy=(q.y-.024)/(2.*DH-.048);
  float zig=abs(f-.5)*2.; float ropeD=abs(clamp(yy,0.,1.)-zig)*.06; float rope=max(max(length(q.xz)-DRR-.004,ropeD-.0025),abs(q.y-DH)-DH+.024);
  rope=max(rope,DRR-.001-length(q.xz));
  return min(min(shell,hoops),rope); }
float sticks(vec3 q){ vec3 c=q-vec3(0,2.*DH+.006,0);
  float s1=sdCapsule(c,vec3(-.1,.0,-.03),vec3(.08,.004,.06),.005), s2=sdCapsule(c,vec3(-.09,.004,.06),vec3(.1,.0,-.02),.005);
  float t1=length(c-vec3(.08,.004,.06))-.008, t2=length(c-vec3(.1,0.,-.02))-.008;
  return min(min(s1,s2),min(t1,t2)); }
float bugle(vec3 q){ /* a coiled bugle lying flat: one loop of tube, a flared bell and a mouthpiece */
  float loop=sdTorus(q-vec3(0,.009,0),.05,.007);
  loop=max(loop,-(q.x-.0))*1.; loop=min(loop,sdCapsule(q,vec3(0,.009,.05),vec3(.1,.009,.05),.007));
  loop=min(loop,sdCapsule(q,vec3(0,.009,-.05),vec3(.07,.009,-.05),.006));
  vec3 b=q-vec3(.1,.02,.05); float t=clamp(b.x/.07,0.,1.); float r=.007+.03*pow(t,2.5);
  float bell=max(abs(length(b.yz)-r)-.0016,max(-b.x,b.x-.07));
  float mp=sdCone((q-vec3(.08,.009,-.05)).yxz,.006,.004,.01);
  return min(min(loop,bell),mp); }
float kepi(vec3 q){ /* a soft cap with a sloping crown and a short visor */
  vec3 c=q-vec3(0,.03,0); float h=.03+.012*(c.x/.045); float crown=max(length(c.xz*vec2(1.,1.1))-.045,max(-c.y-.03,c.y-h));
  crown=smin(crown,length(c.xz*vec2(1.,1.1))-.045,.004); crown=max(crown,max(-c.y-.03,c.y-h));
  float band=max(length(c.xz*vec2(1.,1.1))-.047,abs(c.y+.022)-.008);
  vec3 v=q-vec3(-.05,.006,0.); v.xy=rot(.15)*v.xy; float visor=max(max(length(v.xz*vec2(1.3,1.))-.04,v.x),abs(v.y)-.0025);
  return min(min(crown,band),visor); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 d=L(p,DR,.2);
  r=U(r,drum(d),3.);
  r=U(r,sticks(d),4.);
  r=U(r,bugle(L(p,vec3(.16,0.,-.08),.4)),5.);
  r=U(r,kepi(L(p,vec3(-.21,0.,-.06),.6)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=L(p,DR,.2); if(q.y>2.*DH-.004&&length(q.xz)<DRR-.004) return .88;
    if(q.y<.024||q.y>2.*DH-.024) return fract(q.y/.006)<.3?.25:.35; if(length(q.xz)>DRR+.001) return .8;
    float a=atan(q.z,q.x); if(abs(fract(a/6.2832*12.+.25)-.5)<.03) return .3; return .6; }
  if(id==4.) return .5;
  if(id==5.) return .55;
  if(id==6.){ vec3 q=L(p,vec3(-.21,0.,-.06),.6); if(q.y<.014) return .25; return .38; }
  return .7; }
