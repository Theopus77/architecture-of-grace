/* Economics Unit 5 "Markets, Prices and Money" — pencil still life: a small market stall
   with a striped awning and a crate of oranges on its counter, a hanging price tag, and a
   few coins on the table in front. */
#define CAM_POS vec3(-0.3399,0.2518,-0.8432)
#define CAM_TGT vec3(-0.2167,0.0353,0.0847)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define SC vec3(.08,0.,.16)
vec3 sq(vec3 p){ vec3 q=p-SC; q.xz=rot(-.25)*q.xz; return q; }
vec2 stall(vec3 p){
  vec3 q=sq(p);
  float counter=sdRBox(q-vec3(0.,.05,0.),vec3(.15,.05,.06),.003);
  float posts=1e5; for(int i=0;i<2;i++){ float s=float(i)*2.-1.; posts=min(posts,sdRBox(q-vec3(s*.14,.15,.045),vec3(.006,.1,.006),.002)); }
  vec3 a=q-vec3(0.,.23,-.01); a.yz=rot(.35)*a.yz;
  float aw=sdRBox(a,vec3(.16,.003,.07),.001);
  /* scalloped valance along the front edge */
  vec3 v=q-vec3(0.,.198,-.075);
  float val=sdRBox(v,vec3(.16,.012,.0015),.001);
  return vec2(min(counter,posts),min(aw,val)); }
float oranges(vec3 q){
  float d=1e5;
  for(int i=0;i<4;i++) for(int j=0;j<2;j++){ vec2 o=(h22(vec2(float(i),float(j)+3.))-.5)*.008;
    d=min(d,length(q-vec3(-.075+float(i)*.05+o.x,.155+o.y,-.02+float(j)*.045))-.026); }
  d=min(d,length(q-vec3(-.05,.19,.0))-.026); d=min(d,length(q-vec3(.0,.192,.005))-.026); d=min(d,length(q-vec3(.05,.19,.0))-.026);
  return d; }
vec2 crate(vec3 p){ vec3 q=sq(p); float c=crateD(q-vec3(0.,.1,0.),vec3(.11,.025,.045)); return vec2(c,oranges(q)); }
vec2 tag(vec3 p){
  vec3 q=sq(p);
  vec3 t=q-vec3(.13,.085,-.07);
  float card=sdRBox(t,vec3(.022,.016,.0012),.001);
  float str=sdCapsule(q,vec3(.13,.1,-.07),vec3(.13,.13,-.065),.001);
  return vec2(card,str); }
float coins(vec3 p){
  float d=coinD(p-vec3(-.08,.003,-.02),.022,.0028);
  d=min(d,coinD(p-vec3(-.04,.003,-.05),.02,.0028));
  d=min(d,coinStack(p-vec3(-.12,0.,.03),.022,.0028,4,4.));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 s=stall(p); r=U(r,s.x,3.); r=U(r,s.y,4.);
  vec2 c=crate(p); r=U(r,c.x,5.); r=U(r,c.y,6.);
  vec2 t=tag(p); r=U(r,t.x,7.); r=U(r,t.y,5.);
  r=U(r,coins(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=sq(p); if(q.y<.1&&fract(q.x/.03)<.08&&q.z<-.055) return .35; return .6+.1*grain(q.zxy,40.); }
  if(id==4.){ vec3 q=sq(p); return fract(q.x/.04)<.5?.3:.92; }
  if(id==5.) return .55;
  if(id==6.) return .6;
  if(id==7.){ vec3 t=sq(p)-vec3(.13,.085,-.07); if(length(t.xy-vec2(-.013,0.))<.003) return .2; if(abs(t.y)<.0025&&t.x>-.006&&t.x<.016) return .3; return .93; }
  if(id==8.){ if(abs(n.y)>.7) return .72; return .5; }
  return .7; }
