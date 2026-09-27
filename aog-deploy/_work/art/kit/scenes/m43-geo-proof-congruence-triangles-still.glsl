/* Room m43 "Geometry: Proof, Congruence and Triangles" — pencil still life: two wooden
   triangles cut to exactly the same shape, one light and one dark, the second turned over
   (same three sides, marked with matching tick marks), and a drawing compass standing open
   over them. */
#define CAM_POS vec3(-0.4734,0.6928,-0.7766)
#define CAM_TGT vec3(-0.2727,-0.0344,0.0760)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
#define TA vec2(-.1,-.063)
#define TB vec2(.112,-.063)
#define TC vec2(-.028,.105)
vec3 t1Q(vec3 p){ return place(p,vec3(-.13,0.,-.02),.25); }
vec3 t2Q(vec3 p){ vec3 q=place(p,vec3(.13,0.,-.05),-2.6); q.x=-q.x; return q; }   /* the same triangle turned over */
float triD(vec3 q){ return extrude(sdTri2(q.xz,TA,TB,TC)+.003,q.y-.008,.008,.003); }
float ticks(vec2 u){ /* one tick on AB, two on BC, three on CA */
  float d=1e3;
  vec2 m=(TA+TB)*.5; vec2 t=normalize(TB-TA); vec2 nn=vec2(-t.y,t.x);
  d=min(d,sdSeg2(u,m-nn*.011,m+nn*.011));
  m=(TB+TC)*.5; t=normalize(TC-TB); nn=vec2(-t.y,t.x);
  for(int i=0;i<2;i++){ vec2 o=m+t*(float(i)-.5)*.009; d=min(d,sdSeg2(u,o-nn*.011,o+nn*.011)); }
  m=(TC+TA)*.5; t=normalize(TA-TC); nn=vec2(-t.y,t.x);
  for(int i=0;i<3;i++){ vec2 o=m+t*(float(i)-1.)*.009; d=min(d,sdSeg2(u,o-nn*.011,o+nn*.011)); }
  return d; }
#define CH vec3(.0,.15,.14)
float compassD(vec3 p){
  vec3 A=vec3(-.09,.0,.1), B=vec3(.09,.0,.17);
  float head=sdCylAB(p,CH-vec3(.0,0.,.012),CH+vec3(0.,0.,.012),.013);
  float knob=sdCapsule(p,CH+vec3(0.,.012,0.),CH+vec3(0.,.04,0.),.0045);
  vec3 a1=A+vec3(0.,.018,0.), b1=B+vec3(0.,.03,0.);
  float legA=sdCapsule(p,CH,a1,.006), legB=sdCapsule(p,CH,b1,.006);
  float needle=sdCapsule(p,a1,A+vec3(0.,.001,0.),.0012);
  vec3 hold=b1; float clamp_=sdCylAB(p,hold-vec3(0.,.006,0.),hold+vec3(0.,.008,0.),.0065);
  float lead=sdCapsule(p,hold,B+vec3(.0,.002,0.),.0022);
  return min(min(min(head,knob),min(legA,legB)),min(min(needle,clamp_),lead)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,triD(t1Q(p)),3.);
  r=U(r,triD(t2Q(p)),4.);
  r=U(r,compassD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=t1Q(p); if(n.y>.8&&ticks(q.xz)<.0022) return .15; return .82+.05*grain(p,80.); }
  if(id==4.){ vec3 q=t2Q(p); if(n.y>.8&&ticks(q.xz)<.0022) return .9; return .42+.06*grain(p,80.); }
  if(id==5.) return .55;
  return .7; }
