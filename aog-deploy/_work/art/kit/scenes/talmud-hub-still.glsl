/* Talmud hub card: a stack of three large folio volumes with raised bands on the spines, and a small oil lamp. Objects only. */
#define CAM_POS vec3(-0.4003,0.3467,-0.6750)
#define CAM_TGT vec3(-0.1445,-0.0037,0.0638)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#include "hubparts.glsl"

#define B1 vec3(0.,0.,.03)
#define H1 vec3(.14,.028,.1)
#define H2 vec3(.13,.026,.095)
#define H3 vec3(.125,.03,.09)
#define LP vec3(.21,0.,-.11)
vec3 q1(vec3 p){ return P(p,B1,.2)-vec3(0.,H1.y,0.); }
vec3 q2(vec3 p){ return P(p,B1+vec3(.008,0.,-.004),.29)-vec3(0.,2.*H1.y+H2.y,0.); }
vec3 q3(vec3 p){ return P(p,B1+vec3(-.006,0.,.004),.12)-vec3(0.,2.*H1.y+2.*H2.y+H3.y,0.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 a=bookC(q1(p),H1); r=U(r,a.x,3.); r=U(r,a.y,6.);
  vec2 b=bookC(q2(p),H2); r=U(r,b.x,4.); r=U(r,b.y,6.);
  vec2 c=bookC(q3(p),H3); r=U(r,c.x,5.); r=U(r,c.y,6.);
  r=U(r,oilLamp(P(p,LP,2.5),1.),7.);
  r=U(r,lampFlame(P(p,LP,2.5),1.),8.);
  return r; }
float spineBands(vec3 q,vec3 h,float cv){ if(q.x<-h.x+.004&&fract((q.z+h.z)/(h.z*.5))<.08) return cv*.5; return bookCT(q,h,cv); }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return spineBands(q1(p),H1,.38);
  if(id==4.) return spineBands(q2(p),H2,.5);
  if(id==5.) return spineBands(q3(p),H3,.42);
  if(id==6.) return fract(p.y/.0026)<.3?.72:.93;
  if(id==7.) return oilLampT(P(p,LP,2.5),1.);
  if(id==8.) return .97;
  return .7; }
