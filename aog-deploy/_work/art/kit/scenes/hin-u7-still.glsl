/* Hindu Texts Unit 7 "Key Teachings and Festivals" — pencil still life: a brass temple bell
   on its handle, a lotus flower and a clay oil lamp on a round tray. Objects only. */
#define CAM_POS vec3(-0.4984,0.6338,-1.1714)
#define CAM_TGT vec3(-0.3489,0.0355,0.0753)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define TC vec3(.05,0.,.08)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  float tray=max(sdCylY(p-TC-vec3(0.,.005,0.),.2,.005)-.002,-sdCylY(p-TC-vec3(0.,.011,0.),.185,.003));
  tray=min(tray,sdTorus(p-TC-vec3(0.,.01,0.),.199,.004));
  r=U(r,tray,3.);
  r=U(r,bellD(ry(p-TC-vec3(.06,.01,.06),.3),1.9),4.);
  r=U(r,lotus(ry(p-TC-vec3(-.08,.01,-.04),.2),1.9),5.);
  r=U(r,diya(ry(p-TC-vec3(.1,.01,-.1),3.5),1.3),6.);
  r=U(r,flameD(ry(p-TC-vec3(.1,.01,-.1),3.5)-DIYA_TIP(1.3),.045),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-TC; float r=length(q.xz); if(abs(r-.15)<.003||abs(r-.16)<.0015) return .3; return .5; }
  if(id==4.){ vec3 q=(p-TC-vec3(.06,.01,.06))/1.9; if(abs(q.y-.03)<.002||abs(q.y-.012)<.0015) return .3; return .55; }
  if(id==5.) return .88;
  if(id==6.) return .5;
  if(id==7.) return .97;
  return .7; }
