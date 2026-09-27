/* Buddhist Texts Unit 4 "What the Buddhist Texts Are" — pencil still life: three woven
   baskets (the Three Baskets), each holding a palm-leaf manuscript bundle, with one more
   bundle tied with cord lying in front. Hint-lines only, no script. No figures. */
#define CAM_POS vec3(-0.2712,0.2773,-0.6878)
#define CAM_TGT vec3(-0.1828,-0.0099,0.0486)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define B1 vec3(-.14,0.,.12)
#define B2 vec3(.06,0.,.16)
#define B3 vec3(.25,0.,.1)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,basketD(p-B1,.085,.075),3.);
  r=U(r,basketD(p-B2,.095,.085),3.);
  r=U(r,basketD(p-B3,.085,.075),3.);
  vec3 a=ry(p-B1-vec3(0.,.06,0.),.3); a.xy=rot(.25)*a.xy; r=U(r,palmBundle(a,.1,.022,.01),4.);
  vec3 b=ry(p-B2-vec3(0.,.07,0.),-.2); b.xy=rot(-.2)*b.xy; r=U(r,palmBundle(b,.11,.022,.01),4.);
  vec3 c=ry(p-B3-vec3(0.,.06,0.),.6); c.xy=rot(.2)*c.xy; r=U(r,palmBundle(c,.1,.022,.01),4.);
  r=U(r,palmBundle(ry(p-vec3(.04,0.,-.07),-.08),.17,.03,.014),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 c=p-B2; float R=.095; if(length((p-B1).xz)<.1){c=p-B1;R=.085;} if(length((p-B3).xz)<.1){c=p-B3;R=.085;} return basketTone(c,R); }
  if(id==4.) return .62;
  if(id==5.) return palmBundleTone(ry(p-vec3(.04,0.,-.07),-.08)-vec3(0.,.008,0.),.17,.03,.014);
  return .7; }
