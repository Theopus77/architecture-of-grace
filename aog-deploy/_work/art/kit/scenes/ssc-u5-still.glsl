/* Social Studies Unit 5 "Illinois: Land and People" — pencil still life: a toy red barn
   with a gambrel roof, a round silo with a domed cap, and two ears of corn. */
#define CAM_POS vec3(-0.4780,0.2853,-0.9583)
#define CAM_TGT vec3(-0.3373,0.0380,0.1014)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define BC vec3(.06,0.,.14)
#define BRY -.3
vec3 bq(vec3 p){ vec3 q=p-BC; q.xz=rot(BRY)*q.xz; return q; }
/* gambrel profile in the yz plane: walls to y=.1, steep lower roof, shallow upper roof */
float gambrel(vec2 u,float hw){
  float z=abs(u.x);
  float d=max(z-hw,-u.y);
  float lower=dot(vec2(z,u.y-.1)-vec2(hw,0.),normalize(vec2(.045*2.2,.04)));
  float upper=dot(vec2(z,u.y-.155),normalize(vec2(.3,.7)))-.0;
  lower=(z*.04-(hw-z)*0.)*0.+dot(vec2(z-hw,u.y-.1),normalize(vec2(.055,.022)));
  return max(max(d,max(lower,upper)),-1.); }
vec2 barn(vec3 p){
  vec3 q=bq(p);
  float hw=.075;
  float prof=max(max(abs(q.z)-hw,-q.y),max(dot(vec2(abs(q.z)-hw,q.y-.1),normalize(vec2(.055,.022))),dot(vec2(abs(q.z),q.y-.175),normalize(vec2(.35,1.)))));
  float body=max(prof,abs(q.x)-.1)-.002;
  float roofO=max(max(max(abs(q.z)-hw-.012,q.y-.3),max(dot(vec2(abs(q.z)-hw-.012,q.y-.1),normalize(vec2(.055,.022))),dot(vec2(abs(q.z),q.y-.183),normalize(vec2(.35,1.))))),abs(q.x)-.11);
  float roof=max(roofO,-(prof-.0));
  roof=max(roof,.093-q.y);
  body=max(body,-sdBox(q-vec3(0.,.045,-hw),vec3(.035,.045,.004)));            /* big door recess */
  float loft=sdBox(q-vec3(0.,.13,-hw+.002),vec3(.014,.014,.004));
  body=max(body,-loft);
  return vec2(body,roof); }
vec2 silo(vec3 p){
  vec3 q=p-vec3(.24,0.,.2);
  float c=sdCylY(q-vec3(0.,.12,0.),.045,.12)-.002;
  float dome=max(length(q-vec3(0.,.24,0.))-.049,.238-q.y);
  return vec2(c,dome); }
vec3 cq(vec3 p){ vec3 q=p-vec3(-.19,.028,-.02); q.xz=rot(.35)*q.xz; return q; }
vec2 corn(vec3 p){
  vec3 q=cq(p);
  float t=clamp((q.x+.1)/.2,0.,1.);
  float r=.026*(1.-.55*t*t);
  float cob=length(vec2(length(q.yz)-r*.3,max(abs(q.x)-.1,0.)))-r*.7;
  cob=length(vec2(max(length(q.yz)-r,0.),0.))+max(abs(q.x)-.1,0.)*0.;
  cob=(length(q.yz)-r)*.9; cob=max(cob,abs(q.x)-.105);
  /* kernels as a small bump grid */
  float a=atan(q.z,q.y); float k=sin(a*9.)*sin(q.x*300.);
  cob-=.0015*k;
  vec3 q2=q-vec3(.01,-.004,.058); q2.xz=rot(.25)*q2.xz;
  float r2=.024*(1.-.5*pow(clamp((q2.x+.1)/.2,0.,1.),2.));
  float cob2=max((length(q2.yz)-r2)*.9-.0015*sin(atan(q2.z,q2.y)*9.)*sin(q2.x*300.),abs(q2.x)-.1);
  float husk=sdCapsule(q-vec3(-.13,-.01,.0),vec3(0.),vec3(.03,-.004,.0),.006);
  return vec2(min(cob,cob2),husk); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 b=barn(p); r=U(r,b.x,3.); r=U(r,b.y,4.);
  vec2 s=silo(p); r=U(r,s.x,5.); r=U(r,s.y,6.);
  vec2 c=corn(p); r=U(r,c.x,7.); r=U(r,c.y,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bq(p);
    if(q.z<-.07){ vec2 u=vec2(q.x,q.y-.045);
      if(abs(u.x)<.035&&abs(u.y)<.045){ if(abs(abs(u.x)-.0175)<.0018) return .8; if(abs(abs(u.x)-abs(u.y)*.39*2.)<.003&&abs(u.x)<.035) return .85; if(abs(u.x)>.032||abs(u.y)>.042) return .85; return .3; }
      if(abs(q.x)<.016&&abs(q.y-.13)<.016) return .25;
      if(abs(q.y-.1)<.002) return .85; }
    return fract(q.x/.012)<.12?.28:.42; }                                          /* red board-and-batten */
  if(id==4.) return .35;
  if(id==5.){ vec3 q=p-vec3(.24,0.,.2); return fract(q.y/.02)<.1?.45:.75; }
  if(id==6.) return .5;
  if(id==7.) return .78;
  if(id==8.) return .6;
  return .7; }
