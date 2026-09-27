/* Math Unit 20 "Geometry: Reasoning, Congruence and Triangles" — pencil still life: a
   drawing compass standing open beside two matching wooden triangles, one the mirror of
   the other (congruent shapes). */
#define CAM_POS vec3(-0.4552,0.2204,-0.6278)
#define CAM_TGT vec3(-0.3587,0.0521,0.1247)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define PV vec3(.02,.19,.1)
#define LA vec3(-.07,.004,.08)
#define LB vec3(.1,.004,.06)
vec2 compass(vec3 p){
  float legA=sdCapsule(p,PV+vec3(0.,-.02,0.),LA+vec3(0.,.02,0.),.0065);
  float legB=sdCapsule(p,PV+vec3(0.,-.02,0.),LB+vec3(0.,.03,0.),.0065);
  float tipA=sdCone((p-LA-vec3(0.,.011,0.)),.0015,.004,.011);
  float head=sdRBox(p-PV-vec3(0.,-.012,0.),vec3(.016,.02,.01),.006);
  float grip=sdCylY(p-PV-vec3(0.,.022,0.),.004,.016)-.002;
  float hinge=sdCylZ(p-PV-vec3(0.,-.015,0.),.013,.013)-.001;
  /* pencil held in leg B */
  vec3 d=normalize(LB-PV); vec3 pb=LB+vec3(0.,.03,0.);
  float pen=sdCapsule(p,pb,LB+vec3(0.,.004,0.)+vec3(.004,0.,0.),.0045);
  float metal=min(min(legA,legB),min(min(head,grip),hinge));
  return vec2(min(metal,tipA),pen); }
vec3 skQ(vec3 p){ vec3 q=p-vec3(.0,.0012,.06); q.xz=rot(.08)*q.xz; return q; }
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
vec3 seQ(vec3 p){ vec3 q=p-vec3(-.12,.005,-.14); q.xz=rot(.2)*q.xz; return q; }
/* a thick wooden triangle standing on its long edge; m=-1 mirrors it */
float triD(vec3 p,vec3 c,float ry,float m){ vec3 q=p-c; q.xz=rot(ry)*q.xz; q.x*=m; vec2 u=q.xy;
  vec2 A=vec2(-.1,0.),B=vec2(.1,0.),C=vec2(-.04,.16);
  float e1=-u.y, e2=dot(u-B,normalize(vec2(C.y-B.y,B.x-C.x))), e3=dot(u-C,normalize(vec2(A.y-C.y,C.x-A.x)));
  float t=max(max(e1,e2),e3);
  return max(t+.004,abs(q.z)-.012)-.004; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,triD(p,vec3(-.3,0.,.14),.25,1.),3.);
  r=U(r,triD(p,vec3(-.15,0.,.17),-.2,-1.),7.);
  vec2 c=compass(p); r=U(r,c.x,4.); r=U(r,c.y,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .7+.08*grain(p,30.);
  if(id==33.){ vec2 u=p.xz; vec2 A=LA.xz, B=LB.xz, C=vec2(.03,-.07);
    float d=min(min(sdSeg2(u,A,B),sdSeg2(u,B,C)),sdSeg2(u,C,A));
    float r=length(B-A); float arc=abs(length(u-A)-length(C-A)); if(arc<.0016&&abs(atan(u.y-A.y,u.x-A.x)-atan(C.y-A.y,C.x-A.x))<.25) return .25;
    float arc2=abs(length(u-B)-length(C-B)); if(arc2<.0016&&abs(atan(u.y-B.y,u.x-B.x)-atan(C.y-B.y,C.x-B.x))<.25) return .25;
    if(d<.0022) return .08; return .95; }
  if(id==4.) return .5;
  if(id==5.) return .35;
  if(id==7.) return .45+.08*grain(p,30.);
  return .7; }
