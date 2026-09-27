/* U.S. History Unit 4 "The Early Republic" (Starting a Government) — pencil still life: a
   short fluted classical column on its plinth (the new federal buildings), two stacks of
   coins (Hamilton's plan for the nation's money), and a rolled parchment tied with a
   ribbon (the Constitution). No figures, no writing. */
#define CAM_POS vec3(-0.4645,0.5516,-0.9931)
#define CAM_TGT vec3(-0.2955,0.0073,0.1412)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define CL vec3(-.02,0.,.1)
#define CN vec3(.17,0.,-.04)
#define RL vec3(-.2,0.,-.06)
float column(vec3 q){
  float plinth=sdRBox(q-vec3(0,.012,0),vec3(.06,.012,.06),.002);
  float torus=sdTorus(q-vec3(0,.03,0),.04,.007); float base2=sdCylY(q-vec3(0,.028,0),.045,.005);
  float a=atan(q.z,q.x); float fl=.0025*smoothstep(.4,1.,abs(cos(a*10.)));
  float r=.036-.004*(q.y-.04)/.2;
  float shaft=max(length(q.xz)-r+fl,abs(q.y-.14)-.1);
  float neck=sdTorus(q-vec3(0,.242,0),.034,.004);
  float echinus=sdCone(q-vec3(0,.254,0),.034,.048,.008);
  float abacus=sdRBox(q-vec3(0,.272,0),vec3(.053,.01,.053),.002);
  return min(min(min(plinth,torus),min(base2,shaft*.9)),min(neck,min(echinus,abacus))); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,column(L(p,CL,.3)),3.);
  r=U(r,min(coinsD(L(p,CN,0.),.022,11.,.0015),coinsD(L(p,CN+vec3(.055,0.,.03),0.),.022,6.,.0015)),4.);
  r=U(r,min(coinsD(L(p,CN+vec3(-.02,0.,-.05),0.),.022,1.,0.),coinsD(L(p,CN+vec3(.03,0.,-.06),.8)-vec3(0,.0,0),.022,1.,0.)),4.);
  r=U(r,rollD(L(p,RL,-.2),.025,.12),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=L(p,CL,.3); if(q.y>.04&&q.y<.24){ float a=atan(q.z,q.x); return abs(cos(a*10.))>.93?.4:.72; } return .66; }
  if(id==4.){ if(n.y>.8){ vec2 c=fract(p.xz*0.)+vec2(0.); return .55; } return fract(p.y/.0028)<.3?.35:.5; }
  if(id==5.){ vec3 q=L(p,RL,-.2); float t=rollT(q,.025,.12); if(abs(q.x)<.006&&length(q.yz-vec2(.025,0.))>.024) return .3; return t; }
  return .7; }
