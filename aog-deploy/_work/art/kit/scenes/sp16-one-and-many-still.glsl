/* sp16 "One and Many, Big and Little" — la silla, las sillas: one big wooden toy chair and two
   little chairs just like it in front, with a big striped ball and a little one beside them.
   @params {"mat":{"3":[0.58,1.3,1.0],"4":[0.62,1.3,1.0],"5":[0.62,1.3,1.0],"6":[0.66,1.3,1.0],"7":[0.66,1.3,1.0]},
            "texlines":{"3":[0.12,0.4,0.45],"4":[0.12,0.4,0.45],"5":[0.12,0.4,0.45],"6":[0.12,0.4,0.8],"7":[0.12,0.4,0.8]}} */
#define CAM_POS vec3(-0.4254,0.4846,-0.9576)
#define CAM_TGT vec3(-0.2651,-0.0317,0.1180)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define C1 vec3(-.02,0.,.1)
#define C1R 3.55
#define C2 vec3(-.13,0.,-.08)
#define C2R 3.3
#define C3 vec3(-.02,0.,-.12)
#define C3R 2.95
#define B1 vec3(.16,0.,.0)
#define B2 vec3(.1,0.,-.13)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,chair(P(p,C1,C1R),.12),3.);
  r=U(r,chair(P(p,C2,C2R)*2.,.12)*.5,4.);
  r=U(r,chair(P(p,C3,C3R)*2.,.12)*.5,5.);
  r=U(r,ball(P(p,B1,.4),.06),6.);
  r=U(r,ball(P(p,B2,1.2)*2.,.06)*.5,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return chairT(P(p,C1,C1R),.12);
  if(id==4.) return chairT(P(p,C2,C2R)*2.,.12);
  if(id==5.) return chairT(P(p,C3,C3R)*2.,.12);
  if(id==6.) return ballT(P(p,B1,.4),.06);
  if(id==7.) return ballT(P(p,B2,1.2)*2.,.06);
  return .7; }
