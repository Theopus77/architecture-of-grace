/* sp17 "A Whole Thought in Spanish" — a wooden toy train on a short length of track: an
   engine with a round boiler and a cab, coupled to one open car that carries a block (someone,
   and something they do). */
#define CAM_POS vec3(-0.3755,0.2221,-0.5299)
#define CAM_TGT vec3(-0.1733,0.0064,0.1036)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
#define TR vec3(.0,0.,.06)
#define TA -.22
vec3 tQ(vec3 p){ return place(p,TR,TA); }   /* track runs along x */
float track(vec3 q){ float d=1e5;
  for(int s=0;s<2;s++){ float z=s==0?-.024:.024; d=min(d,sdRBox(q-vec3(0.,.012,z),vec3(.24,.003,.003),.001)); }
  vec3 t=q; t.x=mod(t.x+.02,.04)-.02; float ties=sdRBox(t-vec3(0.,.005,0.),vec3(.008,.005,.042),.001);
  ties=max(ties,abs(q.x)-.24);
  return min(d,ties); }
float wheels(vec3 q,float x0,float n){ float d=1e5;
  for(int i=0;i<3;i++){ if(float(i)>=n) break; float x=x0+float(i)*.045;
    for(int s=0;s<2;s++){ float z=s==0?-.026:.026; d=min(d,sdCylZ(q-vec3(x,.03,z),.015,.004)-.001); } }
  return d; }
float engine(vec3 q){ vec3 e=q-vec3(.07,0.,0.);
  float chassis=sdRBox(e-vec3(0.,.04,0.),vec3(.075,.008,.03),.003);
  float boiler=sdCylX(e-vec3(.025,.07,0.),.026,.05)-.002;
  float cab=sdRBox(e-vec3(-.05,.085,0.),vec3(.028,.04,.032),.003);
  cab=max(cab,-sdRBox(e-vec3(-.05,.1,0.),vec3(.03,.012,.022),.002));
  float roof=sdRBox(e-vec3(-.05,.127,0.),vec3(.034,.004,.036),.002);
  float stack=sdCone(e-vec3(.055,.115,0.),.009,.014,.02);
  float dome=length(e-vec3(.01,.096,0.))-.012;
  float front=sdCylX(e-vec3(.077,.07,0.),.027,.003);
  float d=min(min(chassis,boiler),min(cab,roof)); d=min(d,min(stack,min(dome,front)));
  return min(d,wheels(e,-.045,3.)); }
float car(vec3 q){ vec3 c=q-vec3(-.1,0.,0.);
  float bed=sdRBox(c-vec3(0.,.045,0.),vec3(.055,.008,.03),.003);
  float walls=max(sdRBox(c-vec3(0.,.065,0.),vec3(.055,.02,.03),.002),-sdBox(c-vec3(0.,.075,0.),vec3(.049,.03,.024)));
  float coup=sdCapsule(c,vec3(.055,.045,0.),vec3(.085,.045,0.),.004);
  return min(min(bed,walls),min(coup,wheels(c,-.025,2.))); }
float cargo(vec3 q){ vec3 c=q-vec3(-.1,.083,0.); c.xz=rot(.3)*c.xz; return sdRBox(c,vec3(.022),.004); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=tQ(p);
  r=U(r,track(q),3.);
  r=U(r,engine(q),4.);
  r=U(r,car(q),5.);
  r=U(r,cargo(q),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  vec3 q=tQ(p);
  if(id==3.) return q.y>.008?.35:.6;
  if(id==4.){ vec3 e=q-vec3(.07,0.,0.); if(abs(abs(e.z)-.026)<.006&&e.y<.048) return .35;
    if(abs(e.x-.025)<.05&&abs(fract((e.x+.03)/.03)-.5)<.06) return .35; if(e.y>.123) return .35; return .7; }
  if(id==5.){ vec3 c=q-vec3(-.1,0.,0.); if(c.y<.048) return .35; return .6; }
  if(id==6.){ return .82; }
  return .7; }
