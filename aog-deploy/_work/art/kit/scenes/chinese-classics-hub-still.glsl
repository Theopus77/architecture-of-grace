/* Chinese classics hub: a row of bamboo slips bound with cords, one end rolled up (hint marks only, no characters), a brush and an ink stone. Objects only. */
#define CAM_POS vec3(-0.2970,0.2212,-0.5212)
#define CAM_TGT vec3(-0.1053,-0.0413,0.0322)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#include "hubparts.glsl"

#define SL vec3(-.04,0.,.03)
#define IS vec3(.17,0.,-.06)
#define IH vec3(.05,.011,.07)
#define BR vec3(.05,0.,-.12)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,slips(P(p,SL,.12),14.,.013,.1),3.);
  r=U(r,inkStone(P(p,IS,-.2),IH),4.);
  r=U(r,sdRBox(P(p,IS,-.2)-vec3(.012,2.*IH.y+.008,.025),vec3(.035,.006,.009),.003),5.);
  r=U(r,brush(P(p,BR,.25),.2),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return slipsT(P(p,SL,.12),14.,.013,.1);
  if(id==4.) return inkStoneT(P(p,IS,-.2),IH);
  if(id==5.) return .25;
  if(id==6.) return brushT(P(p,BR,.25),.2);
  return .7; }
