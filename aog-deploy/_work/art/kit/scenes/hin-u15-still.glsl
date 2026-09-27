/* Hindu Texts Unit 15 "Interpreters Across the Centuries" — pencil still life: a stack of
   three old books with a palm-leaf bundle on top (commentaries written over many centuries),
   an ink pot and a reed pen. Objects only. */
#define CAM_POS vec3(-0.2731,0.2778,-0.6655)
#define CAM_TGT vec3(-0.1864,0.0177,0.0571)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define SC vec3(.07,0.,.1)
vec3 b1(vec3 p){ return ry(p-SC,.05); }
vec3 b2(vec3 p){ return ry(p-SC-vec3(.01,.05,0.),-.1); }
vec3 b3(vec3 p){ return ry(p-SC-vec3(-.005,.092,.0),.14); }
vec3 pb(vec3 p){ return ry(p-SC-vec3(0.,.126,-.01),-.06); }
vec3 ik(vec3 p){ return p-vec3(-.17,0.,-.02); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,bookD(b1(p),vec3(.15,.025,.1)),3.);
  r=U(r,bookD(b2(p),vec3(.13,.021,.09)),4.);
  r=U(r,bookD(b3(p),vec3(.12,.017,.085)),5.);
  r=U(r,palmBundle(pb(p),.17,.028,.012),6.);
  vec3 k=ik(p); float pot=min(sdCylY(k-vec3(0.,.025,0.),.03,.025)-.004,sdCylY(k-vec3(0.,.055,0.),.016,.008)-.002);
  pot=max(pot,-sdCylY(k-vec3(0.,.06,0.),.011,.01));
  r=U(r,pot,7.);
  r=U(r,sdCapsule(k,vec3(.0,.03,0.),vec3(.11,.16,.03),.0035),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return bookTone(b1(p),vec3(.15,.025,.1),.35);
  if(id==4.) return bookTone(b2(p),vec3(.13,.021,.09),.55);
  if(id==5.) return bookTone(b3(p),vec3(.12,.017,.085),.4);
  if(id==6.) return palmBundleTone(pb(p)-vec3(0.,.008,0.),.17,.028,.012);
  if(id==7.) return .3;
  if(id==8.) return .6;
  return .7; }
