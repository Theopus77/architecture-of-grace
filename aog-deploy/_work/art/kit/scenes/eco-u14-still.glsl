/* Economics Unit 14 "Competition, Firms and Market Structure" — pencil still life: two
   little model shops side by side, each with its own awning, window and hanging sign —
   two firms competing for the same customers. */
#define CAM_POS vec3(-0.2234,0.2149,-0.7855)
#define CAM_TGT vec3(-0.1102,0.0163,0.0660)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
vec3 sq(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return q; }
#define S1 vec3(.0,0.,.16)
#define S2 vec3(.21,0.,.14)
vec2 shop(vec3 q,float h,float stripeW){
  float body=sdRBox(q-vec3(0.,h*.5,0.),vec3(.08,h*.5,.06),.003);
  body=min(body,sdRBox(q-vec3(0.,h+.008,0.),vec3(.085,.008,.065),.002));
  body=max(body,-sdBox(q-vec3(-.02,.05,-.06),vec3(.045,.03,.006)));
  body=max(body,-sdBox(q-vec3(.058,.04,-.06),vec3(.014,.04,.006)));
  vec3 a=q-vec3(0.,.1,-.078); a.yz=rot(-.5)*a.yz;
  float aw=sdRBox(a,vec3(.082,.0025,.026),.001);
  vec3 s=q-vec3(.0,h-.02,-.062); float sign2=sdRBox(s,vec3(.05,.014,.003),.002);
  return vec2(min(body,sign2),aw); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 a=shop(sq(p,S1,-.2),.15,.02); r=U(r,a.x,3.); r=U(r,a.y,4.);
  vec2 b=shop(sq(p,S2,-.35),.18,.03); r=U(r,b.x,5.); r=U(r,b.y,6.);
  r=U(r,coinStack(p-vec3(-.17,0.,-.02),.022,.003,5,1.),7.);
  r=U(r,coinStack(p-vec3(.38,0.,-.02),.022,.003,5,2.),7.);
  return r; }
float shopTone(vec3 q,float h){
  if(q.z<-.058&&abs(q.x+.02)<.045&&abs(q.y-.05)<.03) return abs(q.x+.02)<.002||abs(q.y-.05)<.002?.7:.25;
  if(q.z<-.058&&abs(q.x-.058)<.014&&q.y<.08) return .35;
  if(q.z<-.062&&abs(q.y-(h-.02))<.014&&abs(q.x)<.05) return abs(q.y-(h-.02))<.003&&abs(q.x)<.035?.4:.9;
  return .72; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return shopTone(sq(p,S1,-.2),.15);
  if(id==5.) return shopTone(sq(p,S2,-.35),.18)-.12;
  if(id==4.){ vec3 q=sq(p,S1,-.2); return fract(q.x/.03)<.5?.3:.92; }
  if(id==6.){ vec3 q=sq(p,S2,-.35); return fract(q.x/.04)<.5?.92:.45; }
  if(id==7.){ if(abs(n.y)>.7) return .72; return .5; }
  return .7; }
