/* Novel scene room-207-u2: a workbench lamp shining on a mended bowl with gold seams, tools hung neatly on the wall */
#define CAM_POS vec3(-0.2043,0.4005,-1.4435)
#define CAM_TGT vec3(0.0164,0.2349,0.1014)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.5,.8,-.4)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "novlib.glsl"
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);

  r=U(r,.35-p.z,2.);
  r=U(r,bowl(pl(p,vec3(.05,0,0),0.),.1),3.);
  r=U(r,deskLamp(pl(p,vec3(-.3,0,.12),.2)),4.);
  r=U(r,min(hammer(p-vec3(.1,.45,.33)),wrench(p-vec3(.22,.45,.335))),5.);
  r=U(r,min(sdCylZ(p-vec3(.1,.47,.34),.004,.02),sdCylZ(p-vec3(.22,.49,.34),.004,.02)),5.);
  r=U(r,sdRBox(pl(p,vec3(.3,0,-.1),.3)-vec3(0,.02,0),vec3(.04,.02,.03),.005),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;

  if(id==2.) return fract(p.x*30.)<.08&&fract(p.y*30.)<.08?.4:.9;
  if(id==3.){ float k=bowlInk(pl(p,vec3(.05,0,0),0.),.1); return k>0.?k:.85; }
  if(id==4.) return .5; if(id==5.) return .45; if(id==6.) return .55;
  return .6; }
