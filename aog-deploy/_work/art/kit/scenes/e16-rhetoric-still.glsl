/* Practice room "Rhetoric: How a Writer Persuades" — pencil still life: an old-style speaker's
   microphone on a stand, a stack of speech cards with hint-lines, and a glass of water. */
#define CAM_POS vec3(-0.4709,0.4875,-0.9665)
#define CAM_TGT vec3(-0.3087,-0.0352,0.1227)
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
#define MIC vec3(0.,0.,.05)
#define CARDS vec3(-.17,0.,-.06)
#define GLS vec3(.17,0.,-.04)
vec3 micQ(vec3 p){ vec3 q=p-MIC; q.xz=rot(.35)*q.xz; return q; }
float standD(vec3 q){ float d=cylS(q,.055,.014,.005);
  d=min(d,sdCylY(q-vec3(0.,.08,0.),.0055,.07));
  d=min(d,sdCapsule(q,vec3(-.046,.15,0.),vec3(.046,.15,0.),.0045));      /* the yoke */
  d=min(d,sdCapsule(vec3(abs(q.x),q.y,q.z),vec3(.046,.15,0.),vec3(.046,.205,0.),.0045));
  d=min(d,sdCylX(vec3(abs(q.x)-.041,q.y-.205,q.z),.008,.004)-.001);
  return d; }
float headD(vec3 q){ vec3 y=q-vec3(0.,.205,0.); return sdRBox(y,vec3(.034,.05,.024),.022); }
vec3 cardQ(vec3 p,float k){ vec3 q=p-CARDS-vec3(0.,.0015+k*.003,0.); q.xz=rot(.25+k*.09)*q.xz; return q; }
float cardsD(vec3 p){ float d=1e3; for(int k=0;k<5;k++) d=min(d,sdRBox(cardQ(p,float(k)),vec3(.085,.0012,.055),.0008)); return d; }
float glassD(vec3 q){ float d=sdCone(q-vec3(0.,.05,0.),.027,.033,.05)-.0015; d=max(d,-sdCone(q-vec3(0.,.056,0.),.024,.03,.05)); return d; }
float waterD(vec3 q){ return sdCone(q-vec3(0.,.034,0.),.025,.029,.032); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 m=micQ(p);
  r=U(r,standD(m),3.);
  r=U(r,headD(m),4.);
  r=U(r,cardsD(p),5.);
  vec3 g=p-GLS;
  r=U(r,glassD(g),6.);
  r=U(r,waterD(g),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .4;
  if(id==4.){ vec3 y=micQ(p)-vec3(0.,.205,0.); if(abs(y.y)<.004) return .25;   /* the band round the middle */
    return fract(y.y/.006)<.3?.35:.62; }
  if(id==5.){ vec3 q=cardQ(p,4.); if(q.y>0.&&q.y<.003&&abs(q.x)<.07&&abs(q.z)<.042){ float l=fract((q.z+.042)/.016); if(l<.25&&!(q.z>.03&&q.x>.03)) return .2; } return .92; }
  if(id==6.) return .9;
  if(id==7.) return .75;
  return .7; }
