/* Buddhist Texts Unit 13 "Close Reading the Dhammapada" — pencil still life: a palm-leaf
   manuscript untied and open on a low wooden reading table, its top leaf showing hint-lines,
   with a clay oil lamp and a lotus beside it. No script, no figures. */
#define CAM_POS vec3(-0.2775,0.3941,-0.8216)
#define CAM_TGT vec3(-0.1757,-0.0213,0.0264)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define TB vec3(.05,0.,.1)
float table(vec3 p){ vec3 q=p-TB;
  float top=sdRBox(q-vec3(0.,.1,0.),vec3(.2,.009,.1),.004);
  vec3 l=vec3(abs(q.x)-.17,q.y,abs(q.z)-.065);
  float leg=sdRBox(l-vec3(0.,.046,0.),vec3(.012,.046,.012),.003)-.002*sin(l.y*120.);
  float apron=sdRBox(q-vec3(0.,.083,0.),vec3(.18,.009,.085),.002);
  return min(min(top,leg),apron); }
vec3 lq(vec3 p){ return ry(p-TB-vec3(0.,.109,0.),.04); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,table(p),3.);
  vec3 q=lq(p);
  r=U(r,palmBundle(q-vec3(0.,0.,.045),.17,.025,.006),4.);
  r=U(r,leafD(ry(q-vec3(.0,.0,-.035),-.06),.17,.028),5.);
  r=U(r,diya(ry(p-vec3(.3,0.,-.06),2.7),1.2),6.);
  r=U(r,flameD(ry(p-vec3(.3,0.,-.06),2.7)-DIYA_TIP(1.2),.042),7.);
  r=U(r,lotus(ry(p-vec3(-.2,0.,-.1),.4),1.1),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-TB; return fract(q.x*35.+fbm(q.xz*vec2(3.,50.))*1.4)<.3?.33:.43; }
  if(id==4.) return palmBundleTone(lq(p)-vec3(0.,.008,.045),.17,.025,.006);
  if(id==5.) return leafTone(ry(lq(p)-vec3(.0,.0,-.035),-.06),.17,.028);
  if(id==6.) return .5;
  if(id==7.) return .97;
  if(id==8.) return .88;
  return .7; }
