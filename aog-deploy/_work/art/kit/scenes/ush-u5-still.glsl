/* U.S. History Unit 5 "Pushing National Boundaries" (The Age of Jackson, Politics of the
   Common Man) — pencil still life: a wooden model of a log cabin with a stone chimney, a
   wooden ballot box with a slot in its lid, and a folded ballot paper on the table. No
   figures, no writing. */
#define CAM_POS vec3(-0.3429,0.3993,-0.8049)
#define CAM_TGT vec3(-0.2071,-0.0380,0.1064)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define CB vec3(-.03,0.,.1)
#define BB vec3(.2,0.,-.03)
float cabin(vec3 q){
  vec2 hs=vec2(.12,.08); float lr=.0085; float H=.1;
  float y=q.y; float k=clamp(floor(y/(2.*lr)),0.,5.); float yc=k*2.*lr+lr;
  /* logs along x on the front/back walls, along z on the side walls, crossing at the corners */
  float lx=length(vec2(y-yc,abs(q.z)-hs.y))-lr; lx=max(lx,abs(q.x)-hs.x-.014);
  float lz=length(vec2(y-yc,abs(q.x)-hs.x))-lr; lz=max(lz,abs(q.z)-hs.y-.014);
  float walls=max(min(lx,lz),y-H-.002);
  float door=sdBox(q-vec3(-.03,.035,-hs.y),vec3(.018,.035,.02)); walls=max(walls,-door);
  float win=sdBox(q-vec3(.06,.055,-hs.y),vec3(.016,.014,.02)); walls=max(walls,-win);
  float fill=sdBox(q-vec3(0,.05,0),vec3(hs.x-.004,.05,hs.y-.004));
  /* gable roof along x */
  vec3 r=q-vec3(0,H,0); float roof=max(abs(r.x)-hs.x-.025,dot(vec2(abs(r.z),r.y),normalize(vec2(.55,1.)))-.055);
  roof=max(roof,-r.y); roof=max(roof,-(dot(vec2(abs(r.z),r.y),normalize(vec2(.55,1.)))-.047));
  float gable=max(max(abs(r.x)-hs.x+.002,dot(vec2(abs(r.z),r.y),normalize(vec2(.55,1.)))-.05),-r.y);
  float chim=sdRBox(q-vec3(hs.x+.02,.09,0.),vec3(.018,.09,.022),.003);
  return min(min(min(walls,fill),min(roof,gable)),chim); }
float ballot(vec3 q){ float b=sdRBox(q-vec3(0,.045,0),vec3(.055,.045,.045),.003);
  float lid=sdRBox(q-vec3(0,.094,0),vec3(.06,.006,.05),.002); float slot=sdBox(q-vec3(0,.1,0),vec3(.025,.01,.003));
  float knob=length(q-vec3(0,.06,-.047))-.005;
  return min(max(min(b,lid),-slot),knob); }
float paper(vec3 q){ return sdBox(q-vec3(0,.003,0),vec3(.04,.0015+.002*(q.x/.04)*0.,.028)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,cabin(L(p,CB,.3)),3.);
  r=U(r,ballot(L(p,BB,-.3)),4.);
  r=U(r,paper(L(p,BB+vec3(-.02,0.,-.1),.5)),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=L(p,CB,.3); if(q.x>.125&&q.y<.2&&q.x<.16){ vec2 s=vec2(q.z,q.y); vec2 c=fract(s/vec2(.014,.009)+vec2(floor(s.y/.009)*.5,0.)); return (c.x<.12||c.y<.18)?.3:.6; }
    if(q.y>.1){ return fract(q.x/.012+step(.5,fract(q.y/.012))*.5)<.1||fract(q.y/.012)<.12?.3:.5; }
    return .5+.1*grain(q.zyx,40.); }
  if(id==4.){ vec3 q=L(p,BB,-.3); if(abs(q.y-.087)<.002) return .3; return .5+.1*grain(q.yxz,30.); }
  if(id==5.){ vec3 q=L(p,BB+vec3(-.02,0.,-.1),.5); if(abs(q.x)<.0015) return .6; return .93; }
  return .7; }
