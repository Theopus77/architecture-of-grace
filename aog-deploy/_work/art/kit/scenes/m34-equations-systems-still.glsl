/* m34 "Linear Equations and Systems" — both sides stay equal: a pan balance hanging level, with
   two wooden blocks and a weight on one pan and three weights on the other, and a spare pair of
   weights on the table. */
#define CAM_POS vec3(-0.7132,0.3721,-0.9629)
#define CAM_TGT vec3(-0.2480,0.0524,0.1709)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.45,1.3,-.35)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_mid.glsl"
#define BHT .27
#define BA .15
#define BL .16
#define TILT 0.
vec3 blQ(vec3 p){ return place(p,vec3(.0,0.,.1),-.12); }
vec3 panC(float s){ vec3 e=balEnd(BHT,BA,TILT,s); return vec3(e.x,e.y-BL+.004,0.); }
float loadsL(vec3 p){ vec3 q=blQ(p)-panC(-1.);
  float c1=sdRBox(q-vec3(-.024,.022,.008),vec3(.02),.0025);
  float c2=sdRBox(place(q,vec3(.02,.022,-.012),.5),vec3(.02),.0025);
  return min(c1,c2); }
float weightsL(vec3 p){ vec3 q=blQ(p)-panC(-1.); return weightD(q-vec3(.01,.002,.035),.014); }
float weightsR(vec3 p){ vec3 q=blQ(p)-panC(1.);
  return min(min(weightD(q-vec3(-.024,.002,.012),.017),weightD(q-vec3(.022,.002,.016),.016)),weightD(q-vec3(0.,.002,-.026),.015)); }
float spare(vec3 p){ vec3 q=p-vec3(.2,0.,-.14); return min(weightD(q,.018),weightD(q-vec3(.05,0.,.01),.014)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 b=balanceD(blQ(p),BHT,BA,TILT,BL);
  r=U(r,b.x,3.);
  r=U(r,b.y,4.);
  r=U(r,loadsL(p),5.);
  r=U(r,min(min(weightsL(p),weightsR(p)),spare(p)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45;
  if(id==4.) return .7;
  if(id==5.) return .8;
  if(id==6.) return .5;
  return .7; }
