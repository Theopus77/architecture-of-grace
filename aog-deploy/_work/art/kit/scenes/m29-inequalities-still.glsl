/* Practice room "Inequalities" — pencil still life: a pan balance tipped to one side, three
   stacked weights in the low pan and one small weight in the high pan (one side is more), with
   two spare weights on the table. */
#define CAM_POS vec3(-0.3192,0.4213,-0.7729)
#define CAM_TGT vec3(-0.1863,-0.0062,0.1185)
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
#define BAL vec3(0.,0.,.06)
#define TILT .34
#define ARM .12
#define PIV vec3(0.,.19,0.)
vec3 balQ(vec3 p){ vec3 q=p-BAL; q.xz=rot(.12)*q.xz; return q; }
vec3 endP(float s){ return PIV+vec3(s*ARM*cos(TILT),-s*ARM*sin(TILT),0.); }
float standD(vec3 q){ float d=sdRBox(q-vec3(0.,.008,0.),vec3(.07,.008,.04),.004);
  d=min(d,sdCylY(q-vec3(0.,.1,0.),.006,.09)); d=min(d,sdCone(q-vec3(0.,.198,0.),.001,.012,.012));
  vec3 b=q-PIV; b.xy=rot(-TILT)*b.xy; d=min(d,sdRBox(b,vec3(ARM,.004,.005),.002));
  d=min(d,length(b)-.009);
  vec3 n=q-PIV-vec3(0.,.035,0.); vec3 nb=q-PIV; nb.xy=rot(-TILT)*nb.xy; d=min(d,sdCapsule(nb,vec3(0.),vec3(0.,.045,0.),.002));
  return d; }
float hangD(vec3 q,float s,float ph){ vec3 e=endP(s); float d=1e3;
  for(int i=0;i<3;i++){ float a=float(i)*2.094+.5; vec3 r=e-vec3(0.,ph,0.)+vec3(cos(a)*.036,0.,sin(a)*.036); d=min(d,sdCapsule(q,e,r,.0008)); }
  return d; }
float panD(vec3 q,float s,float ph){ vec3 c=q-endP(s)+vec3(0.,ph,0.); float r=length(c.xz);
  return max(abs(c.y+.004-r*r*2.5)-.002,r-.042)-.0008; }
float wt(vec3 q,float R,float H){ float d=sdCylY(q-vec3(0.,H*.5,0.),R,H*.5)-.0015; d=min(d,sdCylY(q-vec3(0.,H+.004,0.),R*.35,.004)-.001); d=min(d,length(q-vec3(0.,H+.012,0.))-R*.4); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=balQ(p);
  r=U(r,standD(q),3.);
  float PH1=.07, PH2=.07;
  r=U(r,min(hangD(q,-1.,PH1),hangD(q,1.,PH2)),4.);
  r=U(r,min(panD(q,-1.,PH1),panD(q,1.,PH2)),5.);
  vec3 lo=q-endP(1.)+vec3(0.,PH2-.002,0.); vec3 hi=q-endP(-1.)+vec3(0.,PH1-.002,0.);
  float w=wt(lo-vec3(-.012,0.,.005),.017,.022); w=min(w,wt(lo-vec3(.016,0.,-.008),.014,.018)); w=min(w,wt(lo-vec3(.008,0.,.02),.011,.014));
  w=min(w,wt(hi,.009,.012));
  vec3 t=p-vec3(.18,0.,-.08); w=min(w,wt(t,.015,.02)); w=min(w,wt(t-vec3(.045,0.,.02),.01,.013));
  r=U(r,w,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=balQ(p); return q.y<.017?.5:.62; }
  if(id==4.) return .4;
  if(id==5.) return .78;
  if(id==6.) return .55;
  return .7; }
