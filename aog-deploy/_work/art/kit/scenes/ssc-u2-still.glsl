/* Social Studies Unit 2 "Our Community" — pencil still life: a little wooden street: two
   toy houses, a shop with a striped awning, a round tree and a mailbox on a post. */
#define CAM_POS vec3(-0.3001,0.2478,-0.8480)
#define CAM_TGT vec3(-0.1771,0.0316,0.0786)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
vec3 lq(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return q; }
#define H1 vec3(-.02,0.,.14)
#define H2 vec3(.2,0.,.1)
#define SH vec3(.4,0.,.16)
vec2 houses(vec3 p){
  vec2 a=gableHouse(lq(p,H1,-.2),vec3(.075,.06,.06),.9,.012);
  vec2 b=gableHouse(lq(p,H2,-.3),vec3(.06,.085,.055),1.1,.012);
  vec3 q=lq(p,H2,-.3); b.x=min(b.x,sdRBox(q-vec3(.03,.2,.0),vec3(.01,.03,.01),.002));   /* chimney */
  b.x=max(b.x,-sdBox(q-vec3(0.,.035,-.055),vec3(.014,.035,.005)));
  q=lq(p,H1,-.2); a.x=max(a.x,-sdBox(q-vec3(-.03,.03,-.06),vec3(.013,.03,.005)));
  return vec2(min(a.x,b.x),min(a.y,b.y)); }
vec2 shop(vec3 p){
  vec3 q=lq(p,SH,-.45);
  float body=sdRBox(q-vec3(0.,.07,0.),vec3(.07,.07,.055),.003);
  body=min(body,sdRBox(q-vec3(0.,.15,0.),vec3(.076,.01,.06),.003));             /* flat roof parapet */
  body=max(body,-sdBox(q-vec3(0.,.05,-.055),vec3(.055,.035,.006)));             /* shop window */
  /* awning: a sloped slab with a scalloped front edge */
  vec3 a=q-vec3(0.,.1,-.075); a.yz=rot(-.45)*a.yz;
  float aw=sdRBox(a,vec3(.07,.0025,.028),.001);
  return vec2(body,aw); }
vec2 tree(vec3 p){
  vec3 q=p-vec3(-.2,0.,.1);
  float trunk=sdCone(q-vec3(0.,.05,0.),.012,.008,.05);
  vec3 c=q-vec3(0.,.15,0.);
  float crown=length(c)-.065+.006*fbm3(c*60.);
  crown=smin(crown,length(c-vec3(.03,-.02,.02))-.045,.02);
  return vec2(trunk,crown*.8); }
float mailbox(vec3 p){
  vec3 q=lq(p,vec3(-.1,0.,-.06),.4);
  float post=sdRBox(q-vec3(0.,.045,0.),vec3(.006,.045,.006),.001);
  vec3 b=q-vec3(0.,.1,0.);
  float box=max(min(sdBox(b-vec3(0.,-.005,0.),vec3(.014,.009,.03)),sdCylZ(b-vec3(0.,.004,0.),.014,.03)),-b.y-.014)-.0015;
  float flag=sdRBox(b-vec3(.017,.012,.012),vec3(.0012,.014,.004),.0005);
  return min(post,min(box,flag)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 h=houses(p); r=U(r,h.x,3.); r=U(r,h.y,4.);
  vec2 s=shop(p); r=U(r,s.x,5.); r=U(r,s.y,6.);
  vec2 t=tree(p); r=U(r,t.x,7.); r=U(r,t.y,8.);
  r=U(r,mailbox(p),9.);
  return r; }
float win(vec2 u,vec2 hs){ if(abs(u.x)<hs.x&&abs(u.y)<hs.y){ if(abs(u.x)<.0018||abs(u.y)<.0018||abs(u.x)>hs.x-.002||abs(u.y)>hs.y-.002) return .8; return .28; } return -1.; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=lq(p,H1,-.2); float w=-1.;
    if(q.z<-.057){ w=max(w,win(vec2(q.x-.035,q.y-.065),vec2(.017,.016))); if(abs(q.x+.03)<.013&&q.y<.06) return .3; }
    q=lq(p,H2,-.3);
    if(q.z<-.052&&q.y<.3){ w=max(w,win(vec2(abs(q.x)-.032,q.y-.12),vec2(.013,.016))); w=max(w,win(vec2(q.x-.035,q.y-.045),vec2(.012,.014))); if(abs(q.x)<.014&&q.y<.07) return .3; }
    if(w>0.) return w; return .78; }
  if(id==4.) return .45;
  if(id==5.){ vec3 q=lq(p,SH,-.45); if(q.z<-.05&&abs(q.x)<.055&&q.y>.015&&q.y<.085) return abs(q.x)<.002?.7:.3; return .74; }
  if(id==6.){ vec3 q=lq(p,SH,-.45); return fract(q.x/.028)<.5?.3:.9; }    /* awning stripes */
  if(id==7.) return .35;
  if(id==8.) return .45;
  if(id==9.) return .4;
  return .7; }
