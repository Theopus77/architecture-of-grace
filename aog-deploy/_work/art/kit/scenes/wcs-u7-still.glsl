/* WCS Unit 7 "Festivals, Arts and Everyday Life" — a hand drum with a laced body and two
   drumsticks leaning on it, and a wooden flute with finger holes lying in front. */
#define CAM_POS vec3(-0.2858,0.4034,-0.8551)
#define CAM_TGT vec3(-0.1447,-0.0506,0.0909)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define DC vec3(0.,0.,.06)
float drum(vec3 p){ vec3 q=p-DC; float r=.1-.012*sin(q.y/.15*3.1416);
  float d=max(length(q.xz)-r,abs(q.y-.075)-.075);
  d=min(d,sdTorus(q-vec3(0.,.148,0.),.1,.006)); d=min(d,sdTorus(q-vec3(0.,.004,0.),.1,.005));
  return d; }
float sticks(vec3 p){ /* two drumsticks leaning on the drum, feet on the table */
  vec3 a=DC+vec3(.2,.006,-.13), b=DC+vec3(.055,.162,-.065);
  float d=sdCapsule(p,a,b,.0045); d=min(d,length(p-b)-.011);
  a=DC+vec3(.23,.006,-.06); b=DC+vec3(.08,.162,-.01);
  d=min(d,sdCapsule(p,a,b,.0045)); d=min(d,length(p-b)-.011);
  return d; }
#define FL vec3(.12,.012,-.14)
float flute(vec3 p){ vec3 q=p-FL; q.xz=rot(.18)*q.xz; float d=sdCylX(q,.012,.15)-.001;
  d=min(d,sdCylX(q-vec3(-.15,0.,0.),.014,.008)); d=min(d,sdCylX(q-vec3(.15,0.,0.),.014,.008));
  for(int i=0;i<6;i++){ d=max(d,-(length(q.xz-vec2(-.02+float(i)*.024,0.))-.0035)); }
  d=max(d,-(length(q.xz-vec2(-.1,0.))-.005));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,drum(p),3.);
  r=U(r,sticks(p),4.);
  r=U(r,flute(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-DC; if(q.y>.143&&n.y>.7) return .9; if(q.y>.141||q.y<.01) return .35;
    float a=atan(q.z,q.x)/6.2832*16.; float t=q.y/.14; float z=abs(fract(a+t*.5)-.5); float z2=abs(fract(a-t*.5)-.5);
    if(min(z,z2)<.05) return .25; return .6+.1*grain(p,40.); }
  if(id==4.) return .5;
  if(id==5.){ vec3 q=p-FL; q.xz=rot(.18)*q.xz; if(abs(abs(q.x)-.15)<.008) return .3; return .6+.1*grain(p.zyx,60.); }
  return .7; }
