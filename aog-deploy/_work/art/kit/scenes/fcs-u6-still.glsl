/* FCS Unit 6 "The Needle and the Button" — pencil still life: a big wooden spool of thread, a
   needle lying threaded in front, a large four-hole button, and two more buttons on the table. */
#define CAM_POS vec3(-0.3951,0.2603,-0.7413)
#define CAM_TGT vec3(-0.1693,-0.0196,0.0989)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define SP vec3(.05,0.,.07)
float spool(vec3 p){ vec3 q=p-SP;
  float f1=sdCylY(q-vec3(0.,.01,0.),.065,.01)-.003, f2=sdCylY(q-vec3(0.,.17,0.),.065,.01)-.003;
  float core=sdCylY(q-vec3(0.,.09,0.),.04,.08);
  float hole=sdCylY(q-vec3(0.,.09,0.),.012,.1);
  return max(min(min(f1,f2),core),-hole); }
float thread(vec3 p){ vec3 q=p-SP; float r=length(q.xz);
  float t=max(abs(r-.047)-.009,abs(q.y-.09)-.068); t+=.0012*abs(sin(q.y*900.+atan(q.z,q.x)*.3));
  /* a loose end that drapes to the table and runs to the needle */
  float tail=sdCapsule(p,SP+vec3(-.055,.1,-.02),SP+vec3(-.095,.004,-.06),.0022);
  vec3 e=vec3(-.02,.004,-.11)+vec3(-.088*cos(.25),0.,-.088*sin(.25)); tail=min(tail,sdCapsule(p,SP+vec3(-.095,.004,-.06),e,.0022)); tail=min(tail,sdCapsule(p,e,e+vec3(.02,0.,-.03),.0022));
  return min(t,tail); }
/* a four-hole button: centre c (on the table), radius r, thickness h */
float button(vec3 p,vec3 c,float r,float h,float tilt){ vec3 q=p-c-vec3(0.,h,0.); q.yz=rot(tilt)*q.yz;
  float d=sdCylY(q,r,h)-.002; d=max(d,-(sdCylY(q-vec3(0.,h,0.),r*.78,h*.4)));      /* raised rim */
  vec2 u=abs(q.xz)-vec2(r*.22); d=max(d,-(length(vec3(u.x,0.,u.y))-r*.085+abs(q.y)*0.));
  return d; }
#define BN vec3(-.13,0.,-.04)
vec3 nq(vec3 p){ vec3 q=p-vec3(-.02,.004,-.11); q.xz=rot(-.25)*q.xz; return q; }
float needle(vec3 p){ vec3 q=nq(p);
  float body=sdCapsule(q,vec3(-.1,0.,0.),vec3(.08,0.,0.),.0038); float tip=sdCone(q.yxz-vec3(0.,.1,0.),.0038,.0003,.022);
  float eye=max(body,-sdRBox(q-vec3(-.088,0.,0.),vec3(.007,.01,.0014),.001));
  return min(eye,tip); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,spool(p),3.);
  r=U(r,thread(p),4.);
  r=U(r,button(p,BN,.055,.007,0.),5.);
  r=U(r,button(p,vec3(.21,0.,-.05),.036,.006,0.),6.);
  r=U(r,button(p,vec3(.27,0.,.03),.03,.006,0.),6.);
  r=U(r,needle(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .7;
  if(id==4.) return .32;
  if(id==5.) return .55;
  if(id==6.) return p.x>.25?.35:.8;
  if(id==7.) return .35;
  return .7; }
