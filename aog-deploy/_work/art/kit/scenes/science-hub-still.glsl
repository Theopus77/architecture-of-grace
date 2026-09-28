/* Science hub: a microscope, a glass beaker with marks on its side, and a magnifying glass. */
#define CAM_POS vec3(-0.5742,0.5580,-1.0532)
#define CAM_TGT vec3(-0.1799,0.0177,0.0860)
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

#define MS vec3(0.,0.,.04)
#define BK vec3(.26,0.,.02)
#define MG vec3(.1,0.,-.16)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,microscope(P(p,MS,-.5),1.6),3.);
  r=U(r,beaker(p-BK,.06,.14),4.);
  r=U(r,beakerLiquid(p-BK,.06,.14),5.);
  r=U(r,magnifier(P(p,MG,-.3),.06),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return microscopeT(P(p,MS,-.5),1.6);
  if(id==4.) return beakerT(p-BK,.06,.14);
  if(id==5.) return .62;
  if(id==6.) return magnifierT(P(p,MG,-.3),.06);
  return .7; }
