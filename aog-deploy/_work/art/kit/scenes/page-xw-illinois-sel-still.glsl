/* Crosswalk: Illinois SEL standards — a paper map sheet with the outline of Illinois pinned to the table, a drafting compass lying open on it and a pencil. */
#define CAM_POS vec3(-0.3389,0.1915,-0.4875)
#define CAM_TGT vec3(-0.1558,-0.0593,0.0413)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.4)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#include "xwparts.glsl"

#define MP vec3(.0,0.,.05)
vec3 mq(vec3 p){ return P(p,MP,.08); }
float sheet(vec3 q){ return sdRBox(q-vec3(0.,.0012,0.),vec3(.16,.0008,.13),.0005); }
float ilD(vec2 u){ u/=.2; float d=1e3;
  vec2 pts[17]=vec2[17](vec2(-.30,.52),vec2(.10,.52),vec2(.11,.34),vec2(.19,.2),vec2(.21,.0),vec2(.2,-.22),vec2(.17,-.34),
    vec2(.12,-.4),vec2(.05,-.52),vec2(-.03,-.45),vec2(-.08,-.38),vec2(-.13,-.24),vec2(-.24,-.1),vec2(-.33,.08),vec2(-.35,.2),vec2(-.28,.34),vec2(-.36,.46));
  for(int i=0;i<17;i++){ d=min(d,sdSeg2(u,pts[i],pts[(i+1)%17])); }
  return d*.2; }
float pins(vec3 p){ float d=1e3; vec2 c[4]=vec2[4](vec2(-.145,.115),vec2(.145,.115),vec2(-.145,-.115),vec2(.145,-.115));
  for(int i=0;i<4;i++){ vec3 q=mq(p)-vec3(c[i].x,0.,c[i].y);
    d=min(d,sdCylY(q-vec3(0.,.006,0.),.0075,.0035)-.0015); d=min(d,sdCylY(q-vec3(0.,.013,0.),.0045,.005)-.001); }
  return d; }
#define CP vec3(.13,0.,-.02)
vec3 kq(vec3 p){ return P(p,CP,-.4); }
float compass(vec3 q){ vec3 h=q-vec3(0.,.012,0.);
  float hinge=sdCylY(h,.011,.006)-.002; float knob=sdCylY(h-vec3(0.,.012,0.),.004,.008)-.001;
  float l1=sdCapsule(h,vec3(0.,0.,0.),vec3(.03,-.006,-.12),.0045);
  float l2=sdCapsule(h,vec3(0.,0.,0.),vec3(-.03,-.006,-.12),.0045);
  float nd=sdCapsule(h,vec3(.03,-.006,-.12),vec3(.032,-.01,-.135),.0015);
  float ld=sdCapsule(h,vec3(-.03,-.006,-.12),vec3(-.032,-.01,-.135),.0025);
  return min(min(hinge,knob),min(min(l1,l2),min(nd,ld))); }
#define PN vec3(-.03,0.,-.15)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,sheet(mq(p)),3.); r=U(r,pins(p),4.); r=U(r,compass(kq(p)),5.);
  r=U(r,xwPencilD(P(p,PN,.2),.07),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.){ vec3 q=mq(p); float d=ilD(q.xz-vec2(.0,.0));
    if(d<.0018) return .2;
    if(abs(q.x)>.15||abs(q.z)>.12) return .96;
    if(fract((q.x+.16)/.04)<.03||fract((q.z+.13)/.04)<.03) return .82;
    return .95; }
  if(id==4.) return .35; if(id==5.) return .45;
  if(id==6.) return xwPencilT(P(p,PN,.2),.07);
  return .7; }
