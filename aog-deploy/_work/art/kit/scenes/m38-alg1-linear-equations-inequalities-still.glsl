/* Room "Algebra I: Linear Equations and Inequalities" — pencil still life: a staircase of
   wooden cube towers, one, two, three, four and five high (the same step each time), with a
   long ruler laid along their tops like a straight line, and one loose cube. */
#define CAM_POS vec3(-0.3920,0.2718,-0.6028)
#define CAM_TGT vec3(-0.1777,0.0269,0.0707)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define ST vec3(-.08,0.,.06)
#define C .03
vec3 stQ(vec3 p){ return place(p,ST,.25); }
float towersD(vec3 p){ vec3 q=stQ(p); float d=1e5;
  for(int i=0;i<5;i++){ float h=float(i+1)*C; d=min(d,sdRBox(q-vec3(float(i)*C*1.04,h*.5,0.),vec3(C*.5,h*.5,C*.5),.0025)); }
  return d; }
vec3 rlQ(vec3 p){ vec3 q=stQ(p)-vec3(-C*.5,C,C*.45); float a=atan(C,C*1.04); q.xy=rot(a)*q.xy; return q; }  /* along the slope */
float rulerD(vec3 p){ vec3 q=rlQ(p); return sdRBox(q-vec3(.1,.004,0.),vec3(.12,.0035,.016),.0015); }
float looseD(vec3 p){ return sdRBox(place(p,vec3(.1,C*.5,-.08),.6),vec3(C*.5),.0025); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,towersD(p),3.);
  r=U(r,rulerD(p),4.);
  r=U(r,looseD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=stQ(p); float s=abs(fract(q.y/C+.5)-.5)*C; return s<.0012&&q.y>.004?.3:.78; }
  if(id==4.){ vec3 q=rlQ(p)-vec3(.1,0.,0.); if(q.y>.006){ float t=fract(q.x/.01); float t5=fract(q.x/.05);
      if(q.z<-.006&&(t<.1&&q.z<-.011||t5<.03)) return .25; } return .62; }
  if(id==5.) return .7;
  return .7; }
