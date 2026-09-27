/* Hindu Texts Unit 3 "Lights, Colors and Kindness" — pencil still life: three clay oil lamps
   (diyas) with small flames for Diwali, and two small bowls heaped with coloured powder for
   Holi. Objects only. */
#define CAM_POS vec3(-0.2295,0.1968,-0.6457)
#define CAM_TGT vec3(-0.1485,-0.0394,0.0295)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define D1 vec3(.02,0.,.02)
#define D2 vec3(-.16,0.,.0)
#define D3 vec3(.17,0.,-.06)
#define S1 1.5
#define S2 1.15
#define S3 1.15
float powderBowl(vec3 q){ return bowlD(q,.045,.018); }
float heap(vec3 q){ float h=.028*exp(-dot(q.xz,q.xz)/.0009)+.012; return max(q.y-.02-h+.002*fbm(q.xz*200.),length(q.xz)-.04)*.7; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,diya(ry(p-D1,.5),S1),3.);
  r=U(r,diya(ry(p-D2,.3),S2),4.);
  r=U(r,diya(ry(p-D3,.9),S3),5.);
  r=U(r,flameD(ry(p-D1,.5)-DIYA_TIP(S1),.05),6.);
  r=U(r,flameD(ry(p-D2,.3)-DIYA_TIP(S2),.04),6.);
  r=U(r,flameD(ry(p-D3,.9)-DIYA_TIP(S3),.04),6.);
  r=U(r,powderBowl(p-vec3(-.02,0.,-.15)),7.);
  r=U(r,heap(p-vec3(-.02,0.,-.15)),8.);
  r=U(r,powderBowl(p-vec3(.28,0.,.06)),7.);
  r=U(r,heap(p-vec3(.28,0.,.06)),9.);
  return r; }
float diyaTone(vec3 q,float s){ q/=s; if(abs(q.y-.03)<.0025) return .35; if(q.y>.025&&length(q.xz)<.03) return .3; return .5; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return diyaTone(ry(p-D1,.5),S1);
  if(id==4.) return diyaTone(ry(p-D2,.3),S2);
  if(id==5.) return diyaTone(ry(p-D3,.9),S3);
  if(id==6.) return .97;
  if(id==7.) return .4;
  if(id==8.) return .62;
  if(id==9.) return .8;
  return .7; }
