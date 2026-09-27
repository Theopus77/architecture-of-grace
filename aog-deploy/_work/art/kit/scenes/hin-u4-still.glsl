/* Hindu Texts Unit 4 "What the Hindu Texts Are" — pencil still life: a palm-leaf manuscript
   bundled between two wooden boards and tied with a cord, one loose leaf lying open before it
   with hint-lines only, and a clay oil lamp. No script, no figures. */
#define CAM_POS vec3(-0.3200,0.3392,-0.8115)
#define CAM_TGT vec3(-0.2149,0.0331,0.0627)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define PB vec3(.0,0.,.06)
#define LF vec3(.0,.056,.06)
#define DL vec3(.27,0.,.1)
vec3 pbQ(vec3 p){ return ry(p-PB,.35); }
vec3 lfQ(vec3 p){ vec3 q=ry(p-LF,.28); q.y-=.012*sin(q.x*9.+1.)+.004; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,palmBundle(pbQ(p),.22,.03,.018),3.);
  r=U(r,leafD(lfQ(p),.21,.028),4.);
  vec3 st=p-DL; float stand=min(min(sdCone(st-vec3(0.,.012,0.),.05,.03,.012)-.002,sdCylY(st-vec3(0.,.08,0.),.009-.002*sin(st.y*90.),.07)),sdCylY(st-vec3(0.,.152,0.),.034,.004)-.002);
  r=U(r,stand,7.);
  r=U(r,diya(ry(p-DL-vec3(0.,.158,0.),2.6),.95),5.);
  r=U(r,flameD(ry(p-DL-vec3(0.,.158,0.),2.6)-DIYA_TIP(.95),.042),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return palmBundleTone(pbQ(p)-vec3(0.,.008,0.),.22,.03,.018);
  if(id==4.) return leafTone(lfQ(p),.21,.028);
  if(id==5.) return .5;
  if(id==6.) return .97;
  if(id==7.){ vec3 st=p-DL; return abs(fract(st.y*55.)-.5)<.1?.3:.5; }
  return .7; }
