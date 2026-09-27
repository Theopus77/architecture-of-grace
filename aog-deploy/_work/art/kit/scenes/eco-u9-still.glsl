/* Economics Unit 9 "Personal Finance" — pencil still life: a pocket calculator with a row
   of keys, a leather wallet with a card peeking out, and a small notebook with a pencil. */
#define CAM_POS vec3(-0.1590,0.2525,-0.9612)
#define CAM_TGT vec3(-0.0241,0.0155,0.0546)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
vec3 cq(vec3 p){ vec3 q=p-vec3(.12,0.,.12); q.xz=rot(-.3)*q.xz; q.yz=rot(-.6)*q.yz; return q; }
vec2 calc(vec3 p){
  vec3 q=cq(p)-vec3(0.,.05,0.);
  float body=sdRBox(q,vec3(.06,.01,.09),.008);
  float keys=1e5;
  for(int i=0;i<4;i++) for(int j=0;j<4;j++){ vec3 c=q-vec3(-.036+float(i)*.024,.011,-.07+float(j)*.024); keys=min(keys,sdRBox(c,vec3(.009,.003,.008),.002)); }
  float stand=sdRBox(p-vec3(.12,.02,.19),vec3(.05,.02,.01),.003);
  return vec2(min(body,stand),keys); }
vec3 wq(vec3 p){ vec3 q=p-vec3(.03,.012,.02); q.xz=rot(.35)*q.xz; return q; }
vec2 wallet(vec3 p){
  vec3 q=wq(p);
  float w=sdRBox(q,vec3(.075,.011,.05),.008);
  vec3 c=q-vec3(.02,.013,-.012); c.xz=rot(.2)*c.xz;
  float card=sdRBox(c,vec3(.045,.001,.028),.004);
  return vec2(w,card); }
vec3 nq(vec3 p){ vec3 q=p-vec3(.2,.008,.02); q.xz=rot(-.4)*q.xz; return q; }
vec2 notebook(vec3 p){
  vec3 q=nq(p);
  float b=sdRBox(q,vec3(.05,.008,.07),.002);
  vec3 r=q-vec3(.0,.016,0.); r.xz=rot(.5)*r.xz;
  float pen=sdCapsule(r,vec3(-.07,0.,0.),vec3(.07,0.,0.),.005);
  return vec2(b,pen); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 s=p/2.3;
  vec2 c=calc(s)*2.3; r=U(r,c.x,3.); r=U(r,c.y,4.);
  vec2 w=wallet(s)*2.3; r=U(r,w.x,5.); r=U(r,w.y,6.);
  vec2 n=notebook(s)*2.3; r=U(r,n.x,7.); r=U(r,n.y,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  p/=2.3;
  if(id==3.){ vec3 q=cq(p)-vec3(0.,.05,0.); if(q.y>.005&&q.z>.035&&q.z<.075&&abs(q.x)<.045) return .85; return .35; }  /* display window */
  if(id==4.) return .8;
  if(id==5.){ vec3 q=wq(p); if(abs(abs(q.x)-.068)<.0015||abs(abs(q.z)-.043)<.0015) return .6; return .3; }  /* stitching */
  if(id==6.){ vec3 c=wq(p)-vec3(.02,.013,-.012); c.xz=rot(.2)*c.xz; if(abs(c.z+.005)<.004) return .2; return .85; }
  if(id==7.){ vec3 q=nq(p); if(q.y>.006&&fract(q.z/.012)<.15&&abs(q.x)<.04) return .6; return .88; }
  if(id==8.) return .5;
  return .7; }
