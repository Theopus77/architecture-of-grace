/* Practice room "Buddhism: The Four Noble Truths" — pencil still life: a monk's lidded alms
   bowl on its ring stand, resting on a folded cloth (the simple middle way), a lotus flower
   open in front of it, and two fallen bodhi leaves (the tree). Objects only, no figures. */
#define CAM_POS vec3(-0.2554,0.3019,-0.8134)
#define CAM_TGT vec3(-0.1533,-0.0298,0.0374)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define BC vec3(.03,.009,.1)
/* the alms bowl: a round-bellied bowl with a slightly narrower mouth and a rolled lip */
float almsBowl(vec3 p){ vec3 q=p-BC;
  float o=sdEll(q-vec3(0.,.075,0.),vec3(.1,.07,.1)); o=max(o,q.y-.118);
  float i=sdEll(q-vec3(0.,.078,0.),vec3(.094,.065,.094));
  float d=max(o,-i);
  d=min(d,sdTorus(q-vec3(0.,.117,0.),.074,.004));
  return d; }
float lidD(vec3 p){ vec3 q=p-BC-vec3(0.,.118,0.);
  float dome=sdEll(q,vec3(.08,.03,.08)); dome=max(dome,-q.y);
  dome=min(dome,sdCylY(q,.081,.0025)-.0015);
  float knob=sdCylY(q-vec3(0.,.034,0.),.011,.004)-.002;
  knob=smin(knob,sdCylY(q-vec3(0.,.029,0.),.006,.004),.004);
  return min(dome,knob); }
float standD(vec3 p){ vec3 q=p-BC; return sdTorus(q-vec3(0.,.01,0.),.045,.009); }
/* a cloth folded into a flat square under the bowl */
float clothF(vec3 p){ vec3 q=p-vec3(BC.x,0.,BC.z); q.xz=rot(.3)*q.xz;
  float h=.0045+.0012*sin(q.x*45.+sin(q.z*30.));
  float d=sdRBox(q-vec3(0.,h,0.),vec3(.13,h,.12),.003);
  /* one folded edge standing up a little along the front */
  d=min(d,sdRBox(q-vec3(0.,.0055,-.117),vec3(.13,.0055,.006),.003));
  return d; }
#define LO vec3(.23,0.,-.07)
#define L1 vec3(-.13,0.,-.09)
#define L2 vec3(.06,0.,-.16)
vec3 l1q(vec3 p){ vec3 q=p-L1; q.xz=rot(2.5)*q.xz; return q; }
vec3 l2q(vec3 p){ vec3 q=p-L2; q.xz=rot(-.25)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,almsBowl(p),3.);
  r=U(r,lidD(p),4.);
  r=U(r,standD(p),5.);
  r=U(r,clothF(p),6.);
  r=U(r,lotus(ry(p-LO,.4),1.7),7.);
  r=U(r,bodhiLeaf(l1q(p),1.25),8.);
  r=U(r,bodhiLeaf(l2q(p),1.1),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BC; if(q.y>.108) return .4; return .34; }
  if(id==4.){ vec3 q=p-BC-vec3(0.,.118,0.); if(q.y<.004) return .28; return .4; }
  if(id==5.) return .45;
  if(id==6.){ vec3 q=p-vec3(BC.x,0.,BC.z); q.xz=rot(.3)*q.xz; if(abs(q.x)>.112) return .6; return .78; }
  if(id==7.) return .9;
  if(id==8.) return bodhiTone(l1q(p),1.25);
  if(id==9.) return bodhiTone(l2q(p),1.1);
  return .7; }
