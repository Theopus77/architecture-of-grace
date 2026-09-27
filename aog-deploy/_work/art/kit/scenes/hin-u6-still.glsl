/* Hindu Texts Unit 6 "The Mahabharata and the Gita" — pencil still life: a great wooden
   chariot wheel standing on edge, and a conch shell lying before it. Objects only. */
#define CAM_POS vec3(-0.6124,0.4743,-1.3614)
#define CAM_TGT vec3(-0.4388,0.0405,0.0848)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define WC vec3(.06,0.,.12)
vec3 whQ(vec3 p){ vec3 q=ry(p-WC,-.45); return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,wheelD(whQ(p),.19,12.,.02),3.);
  r=U(r,conch(ry(p-vec3(-.13,0.,-.1),.25),2.),4.);
  r=U(r,sdRBox(p-vec3(.06,.008,.12),vec3(.07,.008,.05),.003),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=whQ(p)-vec3(0.,.19,0.); float r=length(q.xy); if(r>.165) return fract(atan(q.y,q.x)*6./3.1416)<.04?.2:.4; return .45; }
  if(id==4.){ vec3 a=ry(p-vec3(-.13,0.,-.1),.25)/2.-vec3(0.,.034,0.); if(sdEll(a-vec3(.03,-.002,-.036),vec3(.07,.02,.018))<0.) return .3; return .9; }
  if(id==5.) return .5;
  return .7; }
