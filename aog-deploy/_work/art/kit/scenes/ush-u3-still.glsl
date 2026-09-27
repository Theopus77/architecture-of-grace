/* U.S. History Unit 3 "A New Nation" (Two Lanterns and a Fast Horse) — pencil still life: two
   tin lanterns with candles, one a little behind the other (the Old North Church signal), and
   a goose-quill pen standing in an inkwell beside a rolled parchment (the Declaration of
   Independence). No figures, no real writing. */
#define CAM_POS vec3(-0.4062,0.5838,-1.0942)
#define CAM_TGT vec3(-0.2243,-0.0019,0.1262)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define L1 vec3(-.08,0.,.12)
#define L2 vec3(.07,0.,.16)
#define LS 1.25
#define IW vec3(.2,0.,-.02)
#define RL vec3(-.03,0.,-.1)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,min(lanternD(L(p,L1,.3),LS),lanternD(L(p,L2,-.2),LS)),3.);
  r=U(r,min(lanternCandle(L(p,L1,.3),LS),lanternCandle(L(p,L2,-.2),LS)),4.);
  vec3 iq=L(p,IW,-.4);
  r=U(r,inkwellD(iq),5.);
  r=U(r,quillD(iq*vec3(1.,1.,1.)),6.);
  r=U(r,rollD(L(p,RL,.1),.02,.12),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 a=L(p,L1,.3), b=L(p,L2,-.2); vec3 q=length(p.xz-L1.xz)<length(p.xz-L2.xz)?a:b; return lanternT(q,LS); }
  if(id==4.) return .95;
  if(id==5.) return .3;
  if(id==6.) return quillT(L(p,IW,-.4));
  if(id==7.) return rollT(L(p,RL,.1),.02,.12);
  return .7; }
