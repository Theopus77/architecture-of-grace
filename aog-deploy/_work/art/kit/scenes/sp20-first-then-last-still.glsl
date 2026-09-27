/* sp20 "First, Then, Last — Telling a Day" — three wooden number blocks carved 1, 2 and 3 in a
   row (first, then, last), a breakfast bowl with a spoon (morning) and a small bedside lamp
   (night). */
#define CAM_POS vec3(-0.6291,0.3511,-0.6393)
#define CAM_TGT vec3(-0.1931,0.0047,0.1214)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#include "roomparts_e.glsl"
#define BH .036
vec3 lQ(vec3 p){ return p-vec3(-.02,0.,.1); }
vec3 wQ(vec3 p){ return plc(p,vec3(.17,0.,-.01),.3); }
vec3 sQ(vec3 p){ vec3 q=wQ(p)-vec3(-.005,.035,.01); q.xy=rot(-.28)*q.xy; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,lblock(p,vec3(-.12,BH,-.05),-.7,BH,49,49),3.);
  r=U(r,lblock(p,vec3(-.035,BH,-.09),-.5,BH,50,50),4.);
  r=U(r,lblock(p,vec3(.05,BH,-.13),-.3,BH,51,51),5.);
  r=U(r,lampFoot(lQ(p)),6.);
  r=U(r,lampShade(lQ(p)),7.);
  r=U(r,bowlE(wQ(p),.06),8.);
  r=U(r,spoonE(sQ(p),.06),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return lblockInk(p,vec3(-.12,BH,-.05),-.7,BH,49,49);
  if(id==4.) return lblockInk(p,vec3(-.035,BH,-.09),-.5,BH,50,50);
  if(id==5.) return lblockInk(p,vec3(.05,BH,-.13),-.3,BH,51,51);
  if(id==6.){ vec3 q=lQ(p); return q.y<.03?.35:.5; }
  if(id==7.){ vec3 q=lQ(p); return (abs(q.y-.12)<.003||abs(q.y-.2)<.003)?.4:.86; }
  if(id==8.){ vec3 q=wQ(p); float r=length(q.xz); return (abs(q.y-.03)<.0025&&r>.045)?.4:.88; }
  if(id==9.) return .55;
  return .7; }
