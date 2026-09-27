/* Hindu Texts Unit 7 "Key Teachings and Festivals" — pencil still life: a brass temple bell
   on its handle, a lotus flower and a clay oil lamp on a round tray. Objects only. */
#define CAM_POS vec3(-0.4105,0.5355,-1.0115)
#define CAM_TGT vec3(-0.2819,0.0211,0.0603)
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
  r=U(r,bellD(ry(p-TC-vec3(.07,.01,.07),.3),1.5),4.);
  r=U(r,lotus(ry(p-TC-vec3(-.1,.01,.03),.2),2.3),5.);
  r=U(r,diya(ry(p-TC-vec3(.08,.01,-.1),2.4),2.3),6.);
  r=U(r,flameD(ry(p-TC-vec3(.08,.01,-.1),2.4)-DIYA_TIP(2.3),.1),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-TC; float r=length(q.xz); if(abs(r-.15)<.003||abs(r-.16)<.0015) return .3; return .5; }
  if(id==4.){ vec3 q=(p-TC-vec3(.07,.01,.07))/1.5; if(abs(q.y-.03)<.002||abs(q.y-.012)<.0015) return .3; return .55; }
  if(id==5.) return .88;
  if(id==6.) return .5;
  if(id==7.){ vec3 q=ry(p-TC-vec3(.08,.01,-.1),2.4)-DIYA_TIP(2.3); return q.y<.035?.35:.85; }   /* dark wick-core, bright tip */
  return .7; }
