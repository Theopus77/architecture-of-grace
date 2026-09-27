/* Economics Unit 17 "Money, Banking and the Federal Reserve" — pencil still life: a heavy
   bank safe with a round dial and a handle, a stack of gold bars and a few coins. */
#define CAM_POS vec3(-0.2744,0.2153,-0.7935)
#define CAM_TGT vec3(-0.1595,0.0133,0.0719)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define SC vec3(.1,0.,.16)
vec3 sq(vec3 p){ vec3 q=p-SC; q.xz=rot(-.3)*q.xz; return q; }
vec2 safe(vec3 p){
  vec3 q=sq(p);
  float body=sdRBox(q-vec3(0.,.11,0.),vec3(.09,.1,.08),.01);
  float door=sdRBox(q-vec3(0.,.11,-.08),vec3(.075,.085,.006),.004);
  float feet=1e5; for(int i=0;i<4;i++){ vec2 s=vec2(i<2?-1.:1.,(i%2==0)?-1.:1.); feet=min(feet,sdCylY(q-vec3(s.x*.07,.006,s.y*.06),.01,.006)); }
  float dial=sdCylZ(q-vec3(-.015,.13,-.09),.026,.006)-.002;
  float hand=sdCylZ(q-vec3(.04,.08,-.092),.006,.008);
  hand=min(hand,sdCapsule(q,vec3(.04,.08,-.1),vec3(.04,.05,-.1),.004)); hand=min(hand,sdCapsule(q,vec3(.04,.08,-.1),vec3(.066,.095,-.1),.004));
  float hinge=min(sdCylY(q-vec3(-.078,.16,-.086),.005,.015),sdCylY(q-vec3(-.078,.06,-.086),.005,.015));
  return vec2(min(min(body,door),min(feet,hinge)),min(dial,hand)); }
float bar(vec3 q){ vec2 w=vec2(.035-.25*max(q.y,0.),.015-.25*max(q.y,0.)); return max(sdBox2(q.xz,w)-.0,abs(q.y)-.01)*.9; }
vec3 gq(vec3 p){ vec3 q=p-vec3(-.19,0.,-.02); q.xz=rot(.4)*q.xz; return q; }
float gold(vec3 p){
  vec3 q=gq(p);
  float d=1e5;
  for(int i=0;i<3;i++) d=min(d,bar(q-vec3(0.,.01,-.035+float(i)*.035)));
  for(int i=0;i<2;i++){ vec3 c=q-vec3(0.,.031,-.017+float(i)*.035); d=min(d,bar(c)); }
  vec3 c=q-vec3(0.,.052,.0); c.xz=rot(1.57)*c.xz; d=min(d,bar(c));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 s=safe(p); r=U(r,s.x,3.); r=U(r,s.y,4.);
  r=U(r,gold(p),5.);
  r=U(r,coinStack(p-vec3(.33,0.,-.03),.022,.003,4,1.),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .35;
  if(id==4.){ vec3 q=sq(p)-vec3(-.015,.13,-.09); float a=atan(q.y,q.x); if(length(q.xy)>.018&&length(q.xy)<.028&&fract(a*20./6.2832)<.2) return .95; return .55; }
  if(id==5.) return .7;
  if(id==6.) return .6;
  return .7; }
