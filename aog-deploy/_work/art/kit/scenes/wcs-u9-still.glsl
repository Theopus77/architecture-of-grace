/* WCS Unit 9 "Social Order in Asia" — a scholar's ink brush resting on a carved ink stone, an
   open folding fan standing behind, and a small cylindrical ink stick. */
#define CAM_POS vec3(-0.3090,0.3939,-0.8361)
#define CAM_TGT vec3(-0.1704,-0.0524,0.0939)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define IS vec3(.02,0.,-.02)
float stone(vec3 p){ vec3 q=p-IS; float d=sdRBox(q-vec3(0.,.016,0.),vec3(.09,.016,.06),.006);
  d=max(d,-(sdRBox(q-vec3(.015,.034,0.),vec3(.06,.01,.045),.012)));
  d=max(d,-(sdRBox(q-vec3(-.068,.034,0.),vec3(.012,.012,.04),.006)));
  return d; }
float brush(vec3 p){ vec3 a=IS+vec3(-.05,.04,-.075), b=a+vec3(.26,.012,-.02);
  float d=sdCapsule(p,a,b,.0065); vec3 ab=normalize(b-a);
  vec3 c=a-ab*.005; float t=clamp(dot(p-c,-ab),0.,.06); float r=.009*(1.-pow(t/.06,1.5))+.0008;
  d=min(d,length(p-c+ab*t)-r);
  d=min(d,sdCapsule(p,b,b+ab*.015,.0078));
  return d; }
#define FC vec3(.05,.0,.14)
float fan(vec3 p){ vec3 q=p-FC; q.yz=rot(-.25)*q.yz; /* fan leaning back */
  float r=length(q.xy); float a=atan(q.x,q.y);
  float d=max(max(abs(q.z)-.002-.002*abs(sin(a*14.)),max(r-.19,.05-r)),abs(a)-1.25);
  d=min(d,max(max(abs(q.z)-.004,r-.055),abs(a)-1.25));
  d=min(d,length(q)-.008);
  return d; }
float stick(vec3 p){ vec3 q=p-vec3(.2,.012,.03); q.xz=rot(.8)*q.xz; return sdRBox(q,vec3(.045,.011,.008),.003); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,stone(p),3.);
  r=U(r,brush(p),4.);
  r=U(r,fan(p),5.);
  r=U(r,stick(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-IS; if(q.y<.03&&q.y>.012&&abs(q.x-.015)<.05&&abs(q.z)<.035) return .15; return .35+.1*fbm3(p*90.); }
  if(id==4.){ vec3 a=IS+vec3(-.05,.04,-.075); float t=dot(p-a,normalize(vec3(.26,.012,-.02))); if(t<.0) return t<-.03?.12:.8; return .55; }
  if(id==5.){ vec3 q=p-FC; q.yz=rot(-.25)*q.yz; float r=length(q.xy); float a=atan(q.x,q.y);
    if(r<.06) return .35; if(abs(fract(a*14./3.1416)-.5)>.46) return .55;
    if(abs(r-.17)<.002) return .5; float m=sin(a*5.+r*40.)*.02+.12; if(abs(r-m)<.0025&&a>-.6&&a<.9) return .4; return .9; }
  if(id==6.) return .2;
  return .7; }
