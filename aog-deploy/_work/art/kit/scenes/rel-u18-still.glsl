/* World Religions Unit 18 "Hinduism: Dharma, Karma and the Gita" (Lamps on a West Ridge
   Windowsill) — pencil still life for Diwali: three lit clay diyas in a row, a round brass
   water pot (lota), and a short string of marigold flowers. Objects only; no deity. */
#define CAM_POS vec3(-0.3780,0.3849,-0.7917)
#define CAM_TGT vec3(-0.2441,-0.0467,0.1076)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define D1 vec3(-.25,0.,-.05)
#define D2 vec3(-.09,0.,-.11)
#define D3 vec3(.07,0.,-.16)
#define LT vec3(.02,0.,.1)
#define DS 1.05
float lota(vec3 q){ vec3 c=q-vec3(0,.075,0);
  float b=length(c*vec3(1.,1.12,1.))-.075;
  float foot=sdCylY(q-vec3(0,.006,0),.04,.006)-.001;
  float neck=sdCone(q-vec3(0,.152,0),.032,.028,.012);
  float lip=sdTorus(q-vec3(0,.165,0),.04,.006);
  float d=min(smin(b,neck,.012),min(foot,lip));
  return max(d,-sdCylY(q-vec3(0,.17,0),.028,.03)); }
float marigolds(vec3 q){ float d=1e5;
  for(int i=0;i<8;i++){ float f=float(i); vec3 c=vec3(f*.028-.1,.013,.03*sin(f*.9));
    vec3 k=q-c; float r=length(k); float ruff=.002*sin(atan(k.z,k.x)*10.)*sin(acos(clamp(k.y/max(r,1e-4),-1.,1.))*8.);
    d=min(d,r-.013-ruff); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  float dy=min(diyaD(L(p,D1,-.3),DS),min(diyaD(L(p,D2,-.45),DS),diyaD(L(p,D3,-.6),DS)));
  r=U(r,dy,3.);
  float fl=min(diyaFlameD(L(p,D1,-.3),DS),min(diyaFlameD(L(p,D2,-.45),DS),diyaFlameD(L(p,D3,-.6),DS)));
  r=U(r,fl,4.);
  r=U(r,lota(L(p,LT,0.)),5.);
  r=U(r,marigolds(L(p,vec3(.24,0.,-.02),1.1)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ if(n.y>.6&&p.y>.03) return .3; return abs(p.y-.018)<.002?.35:.58; }
  if(id==4.) return .97;
  if(id==5.){ vec3 q=L(p,LT,0.); if(abs(q.y-.075)<.002||abs(q.y-.11)<.002) return .3; return .5; }
  if(id==6.) return .55+.2*fbm(p.xz*300.);
  return .7; }
