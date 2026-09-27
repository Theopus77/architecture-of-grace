/* Room "Multi-Digit Multiplication" — pencil still life: an open egg carton, two rows of six
   (an array: rows times columns), full of eggs, and two wooden number blocks carved 2 and 3. */
#define CAM_POS vec3(-0.3807,0.3510,-0.6524)
#define CAM_TGT vec3(-0.1460,-0.0094,0.0516)
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
#define CT vec3(-.04,0.,.06)
#define CS .05
#define BH .042
vec3 ctQ(vec3 p){ return place(p,CT,.2); }
/* the carton: a tray of 2 x 6 cups; lid folded open behind */
float cartonD(vec3 p){ vec3 q=ctQ(p);
  float tray=sdRBox(q-vec3(0.,.022,0.),vec3(CS*3.,.022,CS),.006);
  vec2 c=vec2(clamp(floor(q.x/CS)*CS+CS*.5,-CS*2.5,CS*2.5),q.z<0.?-CS*.5:CS*.5);
  float cup=length(vec3(q.x-c.x,(q.y-.05)*.8,q.z-c.y))-.024;
  float d=max(tray,-cup);
  /* the lid: hinged at the back, leaning back */
  vec3 l=q-vec3(0.,.044,CS); l.yz=rot(-1.25)*l.yz;
  float lid=sdRBox(l-vec3(0.,.012,CS),vec3(CS*3.,.012,CS),.006); lid=max(lid,-sdRBox(l-vec3(0.,.0,CS),vec3(CS*3.-.004,.012,CS-.004),.004));
  return min(d,lid); }
float eggsD(vec3 p){ vec3 q=ctQ(p);
  vec2 c=vec2(clamp(floor(q.x/CS)*CS+CS*.5,-CS*2.5,CS*2.5),q.z<0.?-CS*.5:CS*.5);
  vec3 e=vec3(q.x-c.x,q.y-.048,q.z-c.y); e.y*=.8; float d=(length(e)-.021-.003*e.y/.021)*.8;
  return d; }
float block(vec3 p,vec3 c,float ry,int g,int g2){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  float d=sdRBox(q,vec3(BH),.006);
  d=carve(d,q.xy,g,.062,.0055,q.z+BH,.004);
  d=carve(d,vec2(-q.z,q.y),g2,.058,.005,q.x-BH,.004);
  return d; }
float ink(vec3 p,vec3 c,float ry,int g,int g2){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  if(q.z<-BH+.008&&glyph(q.xy/.062,g)*.062<.0075) return .15;
  if(q.x>BH-.008&&glyph(vec2(-q.z,q.y)/.058,g2)*.058<.007) return .15;
  return .78; }
#define B1 vec3(.12,BH,-.13)
#define B2 vec3(.22,BH,-.1)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,cartonD(p),3.);
  r=U(r,eggsD(p),4.);
  r=U(r,block(p,B1,.25,50,51),5.);
  r=U(r,block(p,B2,-.3,51,50),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .6+.08*fbm(ctQ(p).xz*200.);
  if(id==4.) return .9;
  if(id==5.) return ink(p,B1,.25,50,51);
  if(id==6.) return ink(p,B2,-.3,51,50);
  return .7; }
