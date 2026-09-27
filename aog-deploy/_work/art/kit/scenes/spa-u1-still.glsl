/* Spanish Unit 1 "Sounds of Spanish" — pencil still life: four wooden vowel blocks carved
   A, E, I and O (O stacked on top), with a painted maraca lying beside them. */
#define CAM_POS vec3(-0.3889,0.3566,-0.6731)
#define CAM_TGT vec3(-0.1988,-0.0237,0.1306)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define BH .05
#define B1 vec3(-.2,BH,.01)
#define B2 vec3(-.09,BH,-.015)
#define B3 vec3(.02,BH,.0)
#define B4 vec3(-.14,3.*BH+.001,.0)
/* maraca: an egg-shaped gourd head on a turned handle, lying on the table */
vec3 mq(vec3 p){ vec3 q=p-vec3(.2,.047,-.02); q.xz=rot(-.5)*q.xz; q.xy=rot(.12)*q.xy; return q; }
float maraca(vec3 p){ vec3 q=mq(p);
  float head=(length(q/vec3(.07,.045,.045))-1.)*.045;
  float neck=sdCone(vec3(q.y,q.x+.08,q.z),.012,.02,.02);
  float handle=sdCapsule(q,vec3(-.09,0.,0.),vec3(-.2,0.,0.),.0105);
  float knob=length(q-vec3(-.205,0.,0.))-.016;
  return smin(smin(head,neck,.01),min(handle,knob),.006); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,lblock(p,B1,.2,BH,65,69),3.);
  r=U(r,lblock(p,B2,-.05,BH,69,73),4.);
  r=U(r,lblock(p,B3,-.22,BH,73,79),5.);
  r=U(r,lblock(p,B4,.08,BH,79,85),6.);
  r=U(r,maraca(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return lblockInk(p,B1,.2,BH,65,69);
  if(id==4.) return lblockInk(p,B2,-.05,BH,69,73);
  if(id==5.) return lblockInk(p,B3,-.22,BH,73,79);
  if(id==6.) return lblockInk(p,B4,.08,BH,79,85);
  if(id==7.){ vec3 q=mq(p);
    if(q.x<-.07) return .5;                                  /* bare wooden handle */
    float a=atan(q.z,q.y); float x=q.x;
    if(abs(x-.0)<.006||abs(x-.035)<.005) return .25;          /* painted bands */
    if(x<.03&&x>-.03&&abs(fract(a*3./PI)-.5)<.12) return .4;  /* zigzag-free dots band */
    return .8; }
  return .7; }
