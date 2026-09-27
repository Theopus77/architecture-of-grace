/* Practice room "US History: The World Wars and the Cold War" — pencil still life: a 1940s
   wooden cabinet radio with a round-topped case, speaker cloth and two dials (news from abroad),
   a pair of field binoculars, and a broken chunk of a concrete wall. No flags or emblems. */
#define CAM_POS vec3(-0.3466,0.3941,-0.7838)
#define CAM_TGT vec3(-0.2136,-0.0343,0.1089)
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
#define RAD vec3(-.02,0.,.06)
#define BIN vec3(.16,0.,-.07)
#define WAL vec3(-.17,0.,-.07)
vec3 rdQ(vec3 p){ vec3 q=p-RAD; q.xz=rot(-.25)*q.xz; return q; }
float radioD(vec3 q){ float body=sdRBox(q-vec3(0.,.07,0.),vec3(.09,.07,.05),.008);
  float arch=max(sdCylZ(q-vec3(0.,.1,0.),.09,.05)-.004,.1-q.y);
  float d=min(body,arch);
  float front=sdBox2(q.xy-vec2(0.,.12),vec2(.06,.05)); front=min(front,length(q.xy-vec2(0.,.15))-.06);
  d=max(d,-max(max(front-.0,-(q.y-.06)),q.z+.046));           /* recessed speaker opening */
  d=min(d,sdBox(q-vec3(0.,.12,-.044),vec3(.062,.06,.001)));
  for(int i=0;i<2;i++) d=min(d,sdCylZ(q-vec3((float(i)-.5)*.08,.032,-.052),.011,.005)-.001);
  d=min(d,sdRBox(q-vec3(0.,.004,0.),vec3(.095,.004,.054),.002));
  return d; }
vec3 bnQ(vec3 p){ vec3 q=p-BIN; q.xz=rot(.8)*q.xz; return q; }
float binD(vec3 q){ float d=1e3; for(int i=0;i<2;i++){ vec3 b=q-vec3(0.,.02,(float(i)-.5)*.045);
    d=min(d,sdCylX(b,.019,.035)-.002); d=min(d,sdCylX(b-vec3(.045,0.,0.),.022,.012)-.002); d=min(d,sdCylX(b-vec3(-.045,.0,0.),.012,.012)-.001); }
  d=min(d,sdRBox(q-vec3(0.,.02,0.),vec3(.03,.008,.02),.004)); d=max(d,-sdCylX(q-vec3(.06,.02,.0225),.017,.01)); d=max(d,-sdCylX(q-vec3(.06,.02,-.0225),.017,.01)); return d; }
float wallD(vec3 p){ vec3 q=place(p,WAL,.35); float top=.075+.018*sin(q.x*70.+1.)+.012*fbm(q.xz*60.)-.25*q.x;
  float d=sdRBox(q-vec3(0.,.05,0.),vec3(.05,.05,.02),.002); d=max(d,q.y-top);
  d+=.0015*fbm(q.xy*120.+q.z*50.);
  d=min(d,sdCapsule(q,vec3(-.022,.03,0.),vec3(-.03,.105,.004),.0025));
  d=min(d,sdCapsule(q,vec3(.018,.03,0.),vec3(.028,.088,-.006),.0025));
  return d*.8; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,radioD(rdQ(p)),3.);
  r=U(r,binD(bnQ(p)),4.);
  r=U(r,wallD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=rdQ(p); if(q.z<-.043&&q.y>.06){ return fract(q.x/.008)<.3?.45:.72; }
    if(q.z<-.047&&q.y<.05&&q.y>.015){ vec2 d=vec2(abs(q.x)-.04,q.y-.032); if(length(d)<.012) return .3; }
    return .5+.12*grain(q,60.); }
  if(id==4.){ vec3 q=bnQ(p); if(abs(q.x)<.03&&abs(q.x)>.02) return .3; return .38; }
  if(id==5.){ vec3 q=place(p,WAL,.35); if(q.y>.07+.018*sin(q.x*70.+1.)-.25*q.x&&abs(q.z)<.006) return .3; return .72-.16*fbm(q.xy*60.)+.1*vn3(q*300.); }
  return .7; }
