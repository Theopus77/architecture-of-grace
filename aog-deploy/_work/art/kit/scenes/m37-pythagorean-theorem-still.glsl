/* Practice room "The Pythagorean Theorem" — pencil still life: a right triangle of wooden rods
   standing up, with sides 3, 4 and 5 marked in unit notches, a steel carpenter's square lying
   flat in front, and three square tiles stacked 3 by 3, 4 by 4 and 5 by 5 behind. */
#define CAM_POS vec3(-0.1812,0.2914,-0.5684)
#define CAM_TGT vec3(-0.0826,-0.0262,0.0934)
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
#define TU .045
#define TR vec3(-.1,0.,.04)
vec3 trQ(vec3 p){ vec3 q=p-TR; q.xz=rot(-.15)*q.xz; return q; }
/* triangle in the x-y plane: right angle at the origin, 4 units along x, 3 units up y */
float triD(vec3 q){ vec3 A=vec3(0.,.008,0.), B=vec3(4.*TU,.008,0.), C=vec3(0.,3.*TU+.008,0.);
  float d=sdCapsule(q,A,B,.006); d=min(d,sdCapsule(q,A,C,.006)); d=min(d,sdCapsule(q,B,C,.006));
  d=min(d,sdRBox(q-vec3(2.*TU,.003,0.),vec3(2.*TU+.02,.003,.02),.002));    /* a flat foot */
  return d; }
float triT(vec3 q){ vec3 A=vec3(0.,.008,0.), B=vec3(4.*TU,.008,0.), C=vec3(0.,3.*TU+.008,0.);
  if(q.y<.0065) return .6;
  float tA=dot(q-A,B-A)/dot(B-A,B-A)*4., tC=dot(q-A,C-A)/dot(C-A,C-A)*3., tH=dot(q-B,C-B)/dot(C-B,C-B)*5.;
  float dAB=sdCapsule(q,A,B,0.), dAC=sdCapsule(q,A,C,0.), dBC=sdCapsule(q,B,C,0.);
  float t=dAB<min(dAC,dBC)?tA:dAC<dBC?tC:tH;
  if(abs(fract(t+.5)-.5)<.05) return .25; return .72; }
vec3 sqQ(vec3 p){ return place(p,vec3(.12,.002,-.1),.5); }
float sqD(vec3 q){ float d=sdBox(q-vec3(.07,0.,0.),vec3(.07,.0018,.009)); d=min(d,sdBox(q-vec3(0.,0.,.05),vec3(.009,.0018,.05))); return d-.0006; }
vec3 tQ(vec3 p,int i){ float s=float(i+3)*.012; return place(p,vec3(.17,.004+float(i)*.008,.1),.3+float(i)*.12)-vec3(0.,0.,0.); }
float tilesD(vec3 p){ float d=1e3; for(int i=0;i<3;i++){ float s=float(i+3)*.012; d=min(d,sdRBox(tQ(p,2-i)-vec3(0.,.0,0.),vec3(float(5-i)*.012,.0036,float(5-i)*.012),.001)); } return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,triD(trQ(p)),3.);
  r=U(r,sqD(sqQ(p)),4.);
  float t=1e3; for(int i=0;i<3;i++){ vec3 q=place(p,vec3(.17,.004+float(i)*.0078,.1),.3+float(i)*.15); t=min(t,sdRBox(q,vec3(float(5-i)*.012,.0035,float(5-i)*.012),.001)); }
  r=U(r,t,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return triT(trQ(p));
  if(id==4.){ vec3 q=sqQ(p); if(q.y>.001&&(fract(q.x/.01)<.12&&q.z<-.003&&q.x>.012||fract(q.z/.01)<.12&&q.x<-.003&&q.z>.012)) return .25; return .62; }
  if(id==5.){ for(int i=0;i<3;i++){ vec3 q=place(p,vec3(.17,.004+float(i)*.0078,.1),.3+float(i)*.15); float h=float(5-i)*.012; if(abs(q.y-.0035)<.0015&&abs(q.x)<h+.001&&abs(q.z)<h+.001){ vec2 g=abs(fract((q.xz+h)/.012+.5)-.5); if(min(g.x,g.y)<.07) return .35; return .8; } } return .8; }
  return .7; }
