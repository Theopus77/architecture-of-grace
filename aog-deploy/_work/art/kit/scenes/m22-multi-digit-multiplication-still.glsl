/* m22 "Multi-Digit Multiplication" — a small whiteboard on a stand showing an area model (one
   rectangle cut into four boxes of different sizes), a wooden tray holding an array of marbles in
   rows, and a marker pen. */
#define CAM_POS vec3(-0.8284,0.3894,-0.9347)
#define CAM_TGT vec3(-0.2723,0.0000,0.2054)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_mid.glsl"
/* whiteboard: face toward -z, leaning back, bottom edge on the table */
#define BW .2
#define BH .145
vec3 wbQ(vec3 p){ vec3 q=p-vec3(.03,0.,.2); q.xz=rot(-.2)*q.xz; q.yz=rot(.2)*q.yz; return q-vec3(0.,BH+.004,0.); }
float wbFrame(vec3 p){ vec3 q=wbQ(p); float o=sdRBox(q,vec3(BW,BH,.009),.004);
  return max(o,-sdBox(q-vec3(0.,0.,-.006),vec3(BW-.012,BH-.012,.01))); }
float wbFace(vec3 p){ vec3 q=wbQ(p); return sdBox(q,vec3(BW-.011,BH-.011,.004)); }
float strut(vec3 p){ vec3 q=p-vec3(.03,0.,.2); q.xz=rot(-.2)*q.xz;
  return sdCapsule(q,vec3(0.,0.,.19),vec3(0.,.25,.09),.006); }
/* tray of marbles: 3 rows of 6 */
/* tray of marbles: 4 rows of 6 */
#define PT .03
vec3 trQ(vec3 p){ return place(p,vec3(.17,0.,-.06),-.25); }
vec2 cell(vec3 q){ return vec2(clamp(floor(q.x/PT)+.5,-2.5,2.5)*PT,clamp(floor(q.z/PT)+.5,-1.5,1.5)*PT); }
float tray(vec3 p){ vec3 q=trQ(p); float o=sdRBox(q-vec3(0.,.01,0.),vec3(.1,.01,.07),.005);
  vec2 c=cell(q); float dim=length(q-vec3(c.x,.03,c.y))-.015; return max(o,-dim); }
float marbles(vec3 p){ vec3 q=trQ(p); vec2 c=cell(q); return length(q-vec3(c.x,.0265,c.y))-.0125; }
/* a wooden block with a times sign carved on its face */
vec3 xbQ(vec3 p){ return place(p,vec3(-.1,.03,-.08),-.35)-vec3(0.,.0,0.); }
float xblock(vec3 p){ vec3 q=xbQ(p); float d=sdRBox(q,vec3(.03),.004);
  vec2 u=q.xy; float g=min(sdSeg2(u,vec2(-.016,-.016),vec2(.016,.016)),sdSeg2(u,vec2(-.016,.016),vec2(.016,-.016)))-.0035;
  return max(d,-max(g,abs(q.z+.03)-.003)); }
vec3 mkQ(vec3 p){ vec3 q=place(p,vec3(.02,.0082,-.2),.2); return q; }
float marker(vec3 p){ vec3 q=mkQ(p); float b=sdCylX(q,.0082,.055)-.001;
  float cap=sdCylX(q-vec3(.07,0.,0.),.0092,.022)-.001;
  float clip=sdRBox(q-vec3(.07,.0095,0.),vec3(.018,.0015,.0025),.001);
  float tip=max(length(q.yz)-.004*(1.-clamp((-q.x-.055)/.012,0.,1.)),abs(q.x+.061)-.006);
  return min(min(b,cap),min(clip,tip)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,wbFrame(p),3.);
  r=U(r,wbFace(p),4.);
  r=U(r,strut(p),3.);
  r=U(r,tray(p),5.);
  r=U(r,marbles(p),6.);
  r=U(r,marker(p),7.);
  r=U(r,xblock(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .5+.12*grain(wbQ(p),40.);
  if(id==4.){ vec2 u=wbQ(p).xy; float a=.96;
    vec2 lo=vec2(-.15,-.1), hi=vec2(.15,.1); vec2 cut=vec2(.055,.025);   /* one rectangle, four boxes */
    if(all(greaterThan(u,lo))&&all(lessThan(u,hi))){
      bool L=u.x<cut.x, T=u.y>cut.y;
      a=L&&T?.5:L?.72:T?.8:.92; }
    float e=min(min(abs(u.x-lo.x),abs(u.x-hi.x)),min(abs(u.y-lo.y),abs(u.y-hi.y)));
    if(u.x>lo.x-.002&&u.x<hi.x+.002&&u.y>lo.y-.002&&u.y<hi.y+.002){
      if(e<.0022||abs(u.x-cut.x)<.002||abs(u.y-cut.y)<.002) a=.18; }
    return a; }
  if(id==5.) return .55+.1*grain(trQ(p),50.);
  if(id==6.) return .4;
  if(id==8.){ vec3 q=xbQ(p); vec2 u=q.xy; float g=min(sdSeg2(u,vec2(-.016,-.016),vec2(.016,.016)),sdSeg2(u,vec2(-.016,.016),vec2(.016,-.016)));
    if(q.z<-.026&&g<.0045) return .15; return .72; }
  if(id==7.){ vec3 q=mkQ(p); return q.x>.048?.25:q.x<-.055?.2:.85; }
  return .7; }
