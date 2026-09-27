/* Practice room "Multiplication and Division: What They Mean" — pencil still life: an egg carton
   holding two rows of six eggs (equal groups in rows), and three small bowls in front, each
   holding the same four marbles. */
#define CAM_POS vec3(-0.1573,0.2015,-0.4657)
#define CAM_TGT vec3(-0.0764,-0.0588,0.0768)
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
#define CT vec3(.0,0.,.06)
#define CP .046
vec3 ctQ(vec3 p){ vec3 q=p-CT; q.xz=rot(.15)*q.xz; return q; }
float cartonD(vec3 q){ float d=sdRBox(q-vec3(0.,.02,0.),vec3(3.*CP,.02,CP),.004);
  vec2 c=vec2(q.x-(clamp(floor(q.x/CP+.5+.5),-2.,3.)-.5)*CP, q.z-(q.z>0.?.5:-.5)*CP);
  d=max(d,-(length(vec3(c.x,q.y-.042,c.y))-.022));
  d=max(d,-sdBox(q-vec3(0.,.046,0.),vec3(3.*CP-.004,.008,CP-.004)));
  return d; }
float eggsD(vec3 q){ vec2 c=vec2(q.x-(clamp(floor(q.x/CP+.5+.5),-2.,3.)-.5)*CP, q.z-(q.z>0.?.5:-.5)*CP);
  vec3 e=vec3(c.x,q.y-.045,c.y); return sdEll(e,vec3(.0175,.023,.0175)-vec3(0.,0.,0.)+vec3(0.,e.y*.12,0.)); }
vec3 bw(int i){ return vec3(-.1+float(i)*.1,0.,-.1); }
float bowlD(vec3 q){ float r=length(q.xz); float d=max(abs(length(q-vec3(0.,.05,0.))-.05)-.0025,q.y-.028); d=max(d,-q.y); d=min(d,sdCylY(q-vec3(0.,.002,0.),.02,.002)); return d; }
float marbles(vec3 q){ float d=1e3; for(int k=0;k<4;k++){ float a=float(k)*1.5708+.4; vec3 c=vec3(cos(a)*.017,.017,sin(a)*.017); if(k==3) c=vec3(0.,.027,0.)+vec3(.004,0.,.0);
    d=min(d,length(q-c)-.0095); } return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=ctQ(p);
  r=U(r,cartonD(q),3.);
  r=U(r,eggsD(q),4.);
  for(int i=0;i<3;i++){ vec3 b=place(p,bw(i),float(i));
    r=U(r,bowlD(b),5.); r=U(r,marbles(b),6.); }
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .7-.08*fbm(p.xz*120.);
  if(id==4.) return .92;
  if(id==5.) return .85;
  if(id==6.) return .45;
  return .7; }
