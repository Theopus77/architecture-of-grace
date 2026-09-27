/* World Religions Unit 22 "Religion and the World" (Law, Art, Science and Charity) — pencil
   still life: a small brass telescope on a tripod (science), a wooden judge's gavel on its
   round block (law), and a glass jar of coins for giving (charity). No figures. */
#define CAM_POS vec3(-0.4829,0.5055,-1.0469)
#define CAM_TGT vec3(-0.3097,-0.0519,0.1149)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define TS vec3(-.02,0.,.1)
#define GV vec3(-.2,0.,-.06)
#define JR vec3(.2,0.,-.02)
vec3 tq(vec3 p){ vec3 q=L(p,TS,.5)-vec3(0,.19,0); q.xy=rot(-.42)*q.xy; return q; }   /* tube along x, tilted up */
float scope(vec3 p){
  vec3 q=L(p,TS,.5); float d=1e5;
  for(int i=0;i<3;i++){ float a=float(i)*2.094+.4; d=min(d,sdCapsule(q,vec3(0,.185,0),vec3(cos(a)*.085,0.,sin(a)*.085),.0045)); }
  d=min(d,length(q-vec3(0,.19,0))-.014);
  vec3 t=tq(p);
  float tube=sdCylX(t-vec3(.02,0,0),.024,.1);
  float tube2=sdCylX(t-vec3(-.1,0,0),.018,.04);
  float eye=sdCylX(t-vec3(-.15,0,0),.011,.018);
  float hood=max(sdCylX(t-vec3(.13,0,0),.029,.018),-sdCylX(t-vec3(.14,0,0),.025,.02));
  float bands=min(sdCylX(t-vec3(.07,0,0),.0265,.004),sdCylX(t-vec3(-.03,0,0),.0265,.004));
  return min(d,min(min(tube,tube2),min(min(eye,hood),bands))); }
float gavel(vec3 q){ float blk=sdCylY(q-vec3(0,.01,0),.05,.01)-.002;
  vec3 h=q-vec3(.0,.043,.0); float head=sdCylX(h,.022,.045)-.002;
  float ring=min(sdTorus((h-vec3(.03,0,0)).yxz,.023,.003),sdTorus((h+vec3(.03,0,0)).yxz,.023,.003));
  float handle=sdCapsule(q,vec3(0,.043,-.02),vec3(.03,.03,-.16),.0065);
  return min(min(blk,head),min(ring,handle)); }
float jar(vec3 q){ float sh=max(abs(length(q.xz)-.045)-.002,max(-q.y,q.y-.11));
  float lidd=sdCylY(q-vec3(0,.117,0),.046,.008)-.002; float slot=sdBox(q-vec3(0,.125,0),vec3(.016,.01,.003));
  float coins=coinsD(q-vec3(0,.002,0),.04,18.,.002);
  float c2=max(length(q.xz)-.043,max(q.y-.055,-q.y));
  return min(min(sh,max(lidd,-slot)),c2); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,scope(p),3.);
  r=U(r,gavel(L(p,GV,-.4)),4.);
  r=U(r,jar(L(p,JR,0.)),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 t=tq(p); if(abs(t.x-.07)<.004||abs(t.x+.03)<.004) return .3; if(t.x>.115) return .3; return .52; }
  if(id==4.){ vec3 q=L(p,GV,-.4); if(q.y<.022) return .38; return .5+.1*grain(q.zyx,30.); }
  if(id==5.){ vec3 q=L(p,JR,0.); if(q.y>.108) return .4; if(q.y<.055){ return fract(q.y/.0028)<.3?.4:.62; } return .92; }
  return .7; }
