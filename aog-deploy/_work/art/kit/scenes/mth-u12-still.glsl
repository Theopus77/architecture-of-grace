/* Math Unit 12 "Ratios, Rates and Proportions" — pencil still life: two meshed wooden gears
   on a small stand, a big one with twenty-four teeth and a small one with twelve. */
#define CAM_POS vec3(-0.4181,0.2881,-0.8392)
#define CAM_TGT vec3(-0.2950,0.0733,0.1214)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float gear(vec2 u,float R,float n,float th){ float a=atan(u.y,u.x); float r=length(u);
  float s=2.*PI/n; float k=abs(mod(a+s*.25,s)-s*.5)/(s*.5);        /* 0..1 across a tooth */
  float tooth=smoothstep(.35,.65,k);
  return r-(R+th*tooth); }
vec2 gearD(vec3 q,float R,float n,float rot0){
  vec2 u=rot(rot0)*q.xy; float g=gear(u,R,n,.014);
  float d=max(g,abs(q.z)-.012)-.002;
  d=max(d,-(max(length(u)-R*.62,abs(q.z)-.006)));          /* recessed web */
  float hub=sdCylZ(q,R*.18,.02)-.002;
  float spokes=1e5; for(int i=0;i<4;i++){ vec2 v=rot(float(i)*PI/4.+rot0)*u; spokes=min(spokes,max(sdBox(vec3(v,q.z),vec3(R*.62,.008,.008)),0.)); }
  d=min(min(d,hub),spokes);
  float axle=sdCylZ(q-vec3(0.,0.,.03),.006,.05);
  return vec2(d,axle); }
#define G1 vec3(-.05,.15,.14)
#define G2 vec3(.125,.09,.13)
vec3 gQ(vec3 p,vec3 c){ vec3 q=p-c; q.xz=rot(.2)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 a=gearD(gQ(p,G1),.12,24.,0.);
  vec2 b=gearD(gQ(p,G2),.058,12.,PI/12.*.5);
  r=U(r,a.x,3.); r=U(r,b.x,4.);
  vec3 s=p-vec3(.03,0.,.19); s.xz=rot(.2)*s.xz;
  float stand=sdRBox(s-vec3(0.,.012,0.),vec3(.25,.012,.05),.004);
  stand=min(stand,sdRBox(s-vec3(0.,.15,.03),vec3(.24,.15,.012),.004));
  stand=min(stand,min(a.y,b.y));
  r=U(r,stand,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .62+.08*grain(gQ(p,G1),20.);
  if(id==4.) return .45;
  if(id==5.) return .8;
  return .7; }
