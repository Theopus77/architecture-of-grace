/* Practice room "Living Things" — pencil still life: a seedling growing in a clay pot, a
   smooth pebble beside it, and a hand lens lying on the table (one of these three is alive). */
#define CAM_POS vec3(-0.3285,0.4089,-0.7695)
#define CAM_TGT vec3(-0.1965,-0.0159,0.1153)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define POT vec3(0.,0.,.03)
#define PR .058
#define PH .105
#define PEB vec3(-.15,.026,-.05)
#define LENS vec3(.15,.008,-.08)
/* the seedling: a stem with pairs of leaves, the top pair still small */
vec3 lq(vec3 q,vec3 o,float ay,float az){ vec3 a=q-o; a.xz=rot(ay)*a.xz; a.xy=rot(az)*a.xy; return a; }
float plantD(vec3 p){
  vec3 q=p-POT; float top=.2;
  float stem=sdCapsule(q,vec3(0.,PH-.02,0.),vec3(.004,.15,.002),.0034);
  stem=min(stem,sdCapsule(q,vec3(.004,.15,.002),vec3(.0,top,.0),.0028));
  float l=leafD(lq(q,vec3(.004,.14,.002),.9,.55),.085,.05);
  l=min(l,leafD(lq(q,vec3(.004,.14,.002),.9+PI,.6),.08,.047));
  l=min(l,leafD(lq(q,vec3(.002,.175,0.),2.4,.7),.062,.038));
  l=min(l,leafD(lq(q,vec3(.002,.175,0.),2.4+PI,.65),.06,.036));
  l=min(l,leafD(lq(q,vec3(0.,top,0.),.9,.9),.03,.018));
  l=min(l,leafD(lq(q,vec3(0.,top,0.),.9+PI,1.),.028,.017));
  return min(stem,l); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,potD(p-POT,PR,PH),3.);
  r=U(r,soilD(p-POT,PR,PH),4.);
  r=U(r,plantD(p),5.);
  vec3 s=p-PEB; s.xz=rot(.4)*s.xz;
  r=U(r,sdEll(s,vec3(.05,.027,.037))+.0015*fbm(s.xz*60.),6.);
  vec3 l=place(p,LENS,.55);
  r=U(r,lensRim(l,.042),7.);
  r=U(r,lensGlass(l,.04),8.);
  r=U(r,lensHandle(l,.042),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-POT; if(q.y>PH*.86&&q.y<PH*.88) return .4; return .62+.08*fbm(p.xy*80.); }
  if(id==4.) return .25+.15*vn(p.xz*400.);
  if(id==5.){ vec3 q=p-POT; if(length(q.xz)<.006) return .62; return .5+.12*fbm(p.xz*200.); }
  if(id==6.) return .55+.2*fbm(p.xz*50.);
  if(id==7.) return .35;
  if(id==8.) return .92;
  if(id==9.){ vec3 l=place(p,LENS,.55); if(l.x<.062) return .3; return .45+.1*sin(l.x*300.); }
  return .7; }
