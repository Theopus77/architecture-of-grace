/* Buddhist Texts Unit 17 "The Texts in Life, and Capstone" — pencil still life: a bronze
   incense bowl with three sticks standing in the ash, a string of prayer beads laid in a loop,
   and a lotus flower. Objects only. */
#define CAM_POS vec3(-0.5306,0.5229,-1.4479)
#define CAM_TGT vec3(-0.3475,0.0348,0.0773)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define IC vec3(.07,0.,.12)
float burner(vec3 p){ vec3 q=p-IC;
  float o=sdEll(q-vec3(0.,.055,0.),vec3(.085,.055,.085)); o=max(o,q.y-.09);
  float i=sdEll(q-vec3(0.,.06,0.),vec3(.078,.05,.078));
  float d=max(o,-i); d=min(d,sdTorus(q-vec3(0.,.09,0.),.063,.005));
  vec3 f=prep(q,3.); d=min(d,sdCone(f-vec3(.05,.01,0.),.012,.008,.012));
  float ash=sdCylY(q-vec3(0.,.075,0.),.068,.004);
  return min(d,ash); }
float sticks(vec3 p){ vec3 q=p-IC-vec3(0.,.075,0.); float d=1e5;
  for(int i=0;i<3;i++){ float fi=float(i)-1.; vec3 b=vec3(fi*.014,0.,fi*.004); vec3 t=b+vec3(fi*.03,.23-abs(fi)*.02,.0);
    d=min(d,sdCapsule(q,b,t,.0022)); d=min(d,sdCapsule(q,b,b+(t-b)*.3,.0032)); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,burner(IC+(p-IC)/1.3)*1.3,3.);
  r=U(r,sticks(IC+(p-IC)/1.3)*1.3,4.);
  r=U(r,malaD(p-vec3(-.14,0.,-.1),.1,44.),5.);
  r=U(r,lotus(ry(p-vec3(.28,0.,-.06),.4),1.6),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=(p-IC)/1.3; if(q.y>.07&&length(q.xz)<.066) return .75; if(abs(q.y-.06)<.003) return .25; return .4; }
  if(id==4.){ vec3 q=(p-IC)/1.3; return q.y<.15?.35:.55; }
  if(id==5.) return .4;
  if(id==6.) return .88;
  return .7; }
