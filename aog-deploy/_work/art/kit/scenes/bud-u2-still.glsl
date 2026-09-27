/* Buddhist Texts Unit 2 "Jataka Tales" — pencil still life: a small carved wooden hare sitting
   up (from the hare in the moon), a plate of three mangoes (from the monkey king's mango tree),
   and a round moon-shaped paper lantern. Objects only. */
#define CAM_POS vec3(-0.2686,0.3207,-0.7690)
#define CAM_TGT vec3(-0.1695,0.0316,0.0569)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define HC vec3(.03,0.,.06)
vec3 hQ(vec3 p){ return ry(p-HC,-.5); }
float hare(vec3 p){ vec3 q=hQ(p);
  float body=sdEll(q-vec3(0.,.055,0.),vec3(.06,.052,.045));
  float haunch=sdEll(q-vec3(.03,.035,0.),vec3(.045,.035,.048));
  float chest=sdEll(q-vec3(-.035,.075,0.),vec3(.03,.04,.032));
  float head=sdEll(q-vec3(-.055,.125,0.),vec3(.032,.027,.026));
  float nose=sdEll(q-vec3(-.083,.118,0.),vec3(.012,.012,.012));
  float ear1=sdCapsule(q,vec3(-.045,.14,.011),vec3(-.02,.215,.02),.009);
  float ear2=sdCapsule(q,vec3(-.045,.14,-.011),vec3(-.005,.21,-.03),.009);
  float d=smin(smin(body,haunch,.02),chest,.02); d=smin(d,head,.015); d=smin(d,nose,.006); d=smin(d,min(ear1,ear2),.008);
  float paw=sdEll(q-vec3(-.06,.01,.015),vec3(.022,.01,.012)); paw=min(paw,sdEll(q-vec3(-.06,.01,-.015),vec3(.022,.01,.012)));
  float tail=length(q-vec3(.07,.04,0.))-.014;
  d=smin(d,min(paw,tail),.01);
  float base=sdRBox(q-vec3(0.,.004,0.),vec3(.085,.004,.055),.003);
  return min(d,base); }
float mango(vec3 q){ float d=sdEll(q-vec3(0.,.03,0.),vec3(.05,.03,.034)); d=smin(d,sdEll(q-vec3(.025,.028,-.006),vec3(.03,.027,.028)),.02); d=min(d,sdCapsule(q,vec3(-.048,.034,0.),vec3(-.056,.036,0.),.003)); return d*.9; }
vec3 pQ(vec3 p){ return p-vec3(.25,0.,.0); }
float plate(vec3 p){ return bowlD(pQ(p),.1,.014); }
float mleaf(vec3 q){ return max(sdEll(q,vec3(.055,.004,.016))*.5,abs(q.y)-.0015); }
float mangos(vec3 p){ vec3 q=pQ(p); vec3 l1=q-vec3(-.07,.09,.0); l1.xy=rot(.35)*l1.xy; vec3 l2=ry(q-vec3(-.06,.085,-.03),.7); l2.xy=rot(.2)*l2.xy; float lv=min(mleaf(l1),mleaf(l2)); lv=min(lv,sdCapsule(q,vec3(-.045,.078,0.),vec3(-.03,.07,0.),.0025)); return min(lv,min(min(mango(ry(q-vec3(-.03,.009,-.03),.4)),mango(ry(q-vec3(.035,.009,.02),-.8))),mango(ry(q-vec3(-.01,.05,.0),.3)))); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,hare(p),3.);
  r=U(r,plate(p),4.);
  r=U(r,mangos(p),5.);
  r=U(r,lanternD(p-vec3(-.17,0.,.14),vec3(.075,.07,.075)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=hQ(p); if(length(q-vec3(-.066,.132,.02))<.005||length(q-vec3(-.066,.132,-.02))<.005) return .1; return fract(q.y*60.+fbm(q.xz*30.)*1.2)<.3?.5:.6; }
  if(id==4.) return .45;
  if(id==5.) return .7;
  if(id==6.) return .92;
  return .7; }
