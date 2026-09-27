/* Social Studies Unit 22 "U.S. History: Civil Rights to Today" — pencil still life: an
   old broadcast microphone on a desk stand (the great speeches), a small portable radio,
   and a modern smartphone lying flat — voices from then to now. */
#define CAM_POS vec3(-0.3735,0.3078,-1.0198)
#define CAM_TGT vec3(-0.2262,0.0490,0.0892)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define MC vec3(.06,0.,.15)
vec3 mq(vec3 p){ vec3 q=p-MC; q.xz=rot(-.3)*q.xz; return q; }
vec2 mic(vec3 p){
  vec3 q=mq(p);
  float base=sdCylY(q-vec3(0.,.01,0.),.065,.01)-.003;
  float stem=sdCylY(q-vec3(0.,.1,0.),.006,.09);
  float collar=sdCylY(q-vec3(0.,.185,0.),.011,.006);
  /* yoke fork and the capsule-shaped head, tipped toward us */
  vec3 h=q-vec3(0.,.24,0.); h.yz=rot(.25)*h.yz;
  float fork=max(abs(length(h.xy)-.052)-.004,max(abs(h.z)-.006,h.y+.0)); fork=max(fork,-h.y-.06);
  float head=sdCapsule(h,vec3(0.,-.02,0.),vec3(0.,.03,0.),.04);
  float band=sdCylY(h,.043,.006);
  float pins=sdCylX(h,.007,.056);
  return vec2(min(min(base,stem),min(collar,min(fork,pins))),min(head,band)); }
vec3 rq(vec3 p){ vec3 q=p-vec3(-.2,0.,.0); q.xz=rot(.45)*q.xz; return q; }
vec2 radio(vec3 p){
  vec3 q=rq(p);
  float b=sdRBox(q-vec3(0.,.05,0.),vec3(.07,.05,.025),.008);
  float handle=max(abs(length(vec2(q.x,q.y-.1))-.045)-.004,max(abs(q.z)-.005,.1-q.y));
  float knob=sdCylZ(q-vec3(.045,.078,-.027),.009,.004);
  return vec2(b,min(handle,knob)); }
vec3 sq(vec3 p){ vec3 q=p-vec3(.34,.005,-.02); q.xz=rot(-.3)*q.xz; return q; }
float phone(vec3 p){ return sdRBox(sq(p),vec3(.04,.004,.08),.004)-.001; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 m=mic(p); r=U(r,m.x,3.); r=U(r,m.y,4.);
  vec2 d=radio(p); r=U(r,d.x,5.); r=U(r,d.y,6.);
  r=U(r,phone(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .45;
  if(id==4.){ vec3 q=mq(p); vec3 h=q-vec3(0.,.24,0.); h.yz=rot(.25)*h.yz;
    if(abs(h.y)<.007) return .35;
    vec2 u=vec2(atan(h.z,h.x)*.04,h.y); vec2 g=abs(fract(u/.006)-.5); return (g.x<.15||g.y<.15)?.4:.8; }   /* mesh grille */
  if(id==5.){ vec3 q=rq(p); if(q.z<-.02&&q.x<.02&&abs(q.y-.05)<.035){ vec2 g=fract(vec2(q.x,q.y)/.009)-.5; if(length(g)<.25) return .2; return .8; } return .5; }
  if(id==6.) return .35;
  if(id==7.){ vec3 q=sq(p); if(q.y>.003&&abs(q.x)<.035&&abs(q.z)<.07) return .18; return .5; }
  return .7; }
