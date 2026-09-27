/* Buddhist Texts Unit 11 "Buddhist Texts Come to America" — pencil still life: an old
   travelling trunk with straps and corner plates, a stack of books on its lid, and a small
   sailing-steamship model beside it. Objects only. */
#define CAM_POS vec3(-0.3899,0.3102,-0.7994)
#define CAM_TGT vec3(-0.2864,0.0169,0.0629)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define TC vec3(.05,0.,.12)
vec3 tQ(vec3 p){ return ry(p-TC,-.15); }
float trunk(vec3 p){ vec3 q=tQ(p);
  float body=sdRBox(q-vec3(0.,.065,0.),vec3(.16,.065,.09),.006);
  float lid=sdRBox(q-vec3(0.,.14,0.),vec3(.163,.012,.093),.006);
  float straps=min(sdRBox(vec3(abs(q.x)-.08,q.y-.08,q.z),vec3(.012,.08,.096),.002),1e5);
  float corners=sdRBox(vec3(abs(q.x)-.155,q.y-.08,abs(q.z)-.085),vec3(.012,.08,.012),.003);
  float lock=sdRBox(q-vec3(0.,.12,-.095),vec3(.012,.014,.004),.002);
  float handle=sdTorus((q-vec3(-.168,.09,0.)).yxz*vec3(1.,1.,1.),.02,.004);
  return min(min(min(body,lid),min(straps,corners)),min(lock,handle)); }
vec3 bk1(vec3 p){ return ry(tQ(p)-vec3(-.02,.152,0.),.1); }
vec3 bk2(vec3 p){ return ry(tQ(p)-vec3(-.02,.184,0.),-.12); }
vec3 sh(vec3 p){ return ry(p-vec3(-.22,0.,-.06),.2); }
float ship(vec3 p){ vec3 q=sh(p); q.x*=.9;
  float hull=max(sdEll(q-vec3(0.,.035,0.),vec3(.09,.035,.025)),q.y-.04); hull=max(hull,-q.y+.005);
  float stand=sdRBox(q-vec3(0.,.003,0.),vec3(.04,.003,.015),.001);
  float cabin=sdRBox(q-vec3(0.,.05,0.),vec3(.04,.01,.014),.002);
  float stack=sdCylY(q-vec3(.0,.075,0.),.009,.018);
  float mast=min(sdCylY(q-vec3(.05,.08,0.),.002,.045),sdCylY(q-vec3(-.05,.08,0.),.002,.045));
  return min(min(hull,stand),min(min(cabin,stack),mast)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,trunk(p),3.);
  r=U(r,bookD(bk1(p),vec3(.11,.016,.075)),4.);
  r=U(r,bookD(bk2(p),vec3(.09,.014,.065)),5.);
  r=U(r,ship(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=tQ(p); if(abs(abs(q.x)-.08)<.013||(abs(abs(q.x)-.155)<.013&&abs(abs(q.z)-.085)<.013)) return .3; if(abs(q.y-.128)<.003) return .25; return .5; }
  if(id==4.) return bookTone(bk1(p),vec3(.11,.016,.075),.4);
  if(id==5.) return bookTone(bk2(p),vec3(.09,.014,.065),.6);
  if(id==6.){ vec3 q=sh(p); if(q.y<.02) return .35; return .7; }
  return .7; }
