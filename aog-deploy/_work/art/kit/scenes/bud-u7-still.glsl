/* Buddhist Texts Unit 7 "Festivals and Communities" — pencil still life: a round paper
   festival lantern, a square floating lantern of the kind set on the river at Obon, and a
   lotus-shaped candle holder for Vesak. Objects only. */
#define CAM_POS vec3(-0.3746,0.3593,-0.9177)
#define CAM_TGT vec3(-0.2569,0.0260,0.0625)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
vec3 fQ(vec3 p){ return ry(p-vec3(.16,0.,-.04),.4); }
float floatLantern(vec3 p){ vec3 q=fQ(p);
  float base=sdRBox(q-vec3(0.,.008,0.),vec3(.06,.008,.06),.002);
  float frame=1e5; vec3 a=vec3(abs(q.x)-.045,q.y,abs(q.z)-.045); frame=sdRBox(a-vec3(0.,.06,0.),vec3(.004,.05,.004),.001);
  float topf=max(sdRBox(q-vec3(0.,.11,0.),vec3(.049,.004,.049),.001),-sdBox(q-vec3(0.,.11,0.),vec3(.041,.01,.041)));
  float paper=max(sdBox(q-vec3(0.,.06,0.),vec3(.044,.048,.044)),-sdBox(q-vec3(0.,.06,0.),vec3(.042,.06,.042)));
  float candle=sdCylY(q-vec3(0.,.03,0.),.009,.015);
  return min(min(base,frame),min(min(topf,paper),candle)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,lanternD(p-vec3(-.02,0.,.14),vec3(.1,.11,.1)),3.);
  r=U(r,sdCylY(p-vec3(-.02,.004,.14),.04,.004),3.);
  r=U(r,floatLantern(p),4.);
  vec3 l=ry(p-vec3(-.17,0.,-.06),.2); r=U(r,lotus(l,1.3),5.);
  r=U(r,sdCylY(l-vec3(0.,.035,0.),.008,.015),6.);
  r=U(r,flameD(l-vec3(0.,.05,0.),.03),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-vec3(-.02,.122,.14); if(abs(fract(q.y/(.11*.18))-.5)>.42) return .5; return .88; }
  if(id==4.){ vec3 q=fQ(p); vec3 a=vec3(abs(q.x),q.y,abs(q.z)); if(max(a.x,a.z)>.0435&&max(a.x,a.z)<.046&&q.y>.015&&q.y<.106) return .9; return .4; }
  if(id==5.) return .85;
  if(id==6.) return .92;
  if(id==7.) return .97;
  return .7; }
