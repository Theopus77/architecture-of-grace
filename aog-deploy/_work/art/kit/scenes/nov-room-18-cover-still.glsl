/* Novel cover, Book Two "The Year of the Inner Critic" (Room 18): a school desk by a wall of
   sticky notes; an open notebook with a pencil, a desk lamp, and a coach's whistle on its
   cord (the Inner Coach) lying beside the notebook. */
#define CAM_POS vec3(-0.2439,0.7863,-1.4956)
#define CAM_TGT vec3(0.0078,0.2452,0.1403)
#define SUN_DIR vec3(-.6,.8,-.4)
#define CAM_FOV 30.
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "novlib.glsl"
float whistle(vec3 q){
  float b=sdCylZ(q-vec3(0,.018,0),.018,.02); b=smin(b,sdRBox(q-vec3(.03,.012,0),vec3(.025,.008,.012),.003),.006);
  b=max(b,-sdBox(q-vec3(.0,.028,-.0),vec3(.006,.01,.03)));
  float ring=sdTorus((q-vec3(-.02,.018,0)).xzy,.008,.0025);
  float cord=sdTorus(q-vec3(-.07,.003,.02),.05,.0028);
  return min(min(b,ring),cord); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,stickyNotes(p-vec3(.02,.33,.418)),3.);
  r=U(r,sdRBox(p-vec3(.02,.33,.425),vec3(.24,.17,.008),.004),4.);
  vec3 nb=pl(p,vec3(-.03,0,-.05),.12);
  r=U(r,min(notebook(nb-vec3(-.075,0,0),vec2(.073,.1)),notebook(nb-vec3(.075,0,0),vec2(.073,.1))),5.);
  vec3 pc=pl(p,vec3(.02,.0233,-.02),2.5); r=U(r,pencil(pc),6.);
  r=U(r,deskLamp(pl(p,vec3(-.28,0,.2),.4)),7.);
  r=U(r,whistle(pl(p,vec3(.24,0,-.1),-.5)),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.){ float k=stickyInk(p-vec3(.02,.33,.418)); return k>0.?k:.93; }
  if(id==4.) return .5+.1*fbm(p.xy*90.);
  if(id==5.){ vec3 nb=pl(p,vec3(-.03,0,-.05),.12); float k=nbInk(vec3(abs(nb.x)-.075,nb.y,nb.z),vec2(.073,.1)); return k>0.?k:.93; }
  if(id==6.){ float k=pencilInk(pl(p,vec3(.02,.0233,-.02),2.5)); return k; }
  if(id==7.) return .55;
  if(id==8.) return .6;
  return .7; }
