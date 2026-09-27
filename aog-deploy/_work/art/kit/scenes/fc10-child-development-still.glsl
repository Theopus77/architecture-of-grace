/* Room fc10 "Child Development and Care" — pencil still life of a toddler's toys: a
   stacking-ring toy (five rings, largest at the bottom, on a post with a round knob), a small
   tower of three wooden blocks carved 1, 2 and 3, and a baby rattle lying in front. */
#define CAM_POS vec3(-0.3695,0.4318,-0.8715)
#define CAM_TGT vec3(-0.2235,-0.0384,0.1085)
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
#define SC vec3(.0,0.,.06)
float stackBase(vec3 p){ vec3 q=p-SC;
  float base=sdCylY(q-vec3(0.,.012,0.),.07,.01)-.004;
  float post=sdCylY(q-vec3(0.,.1,0.),.009,.09);
  float knob=length(q-vec3(0.,.2,0.))-.024;
  return min(min(base,post),knob); }
float ringsD(vec3 p,out float k){ vec3 q=p-SC; float d=1e5; k=0.;
  for(int i=0;i<5;i++){ float fi=float(i); float R=.052-.0075*fi, r=.017-.0015*fi; float y=.026+r+fi*.0305-fi*fi*.0005;
    float t=sdTorus(q-vec3(0.,y,0.),R*.72,r*1.05); if(t<d){ d=t; k=fi; } }
  return d; }
#define BH .034
float block(vec3 p,vec3 c,float ry,int g,int g2){ vec3 q=p-c; q.xz=rot(ry)*q.xz;
  float d=sdRBox(q,vec3(BH),.005); if(d>.02) return d;
  d=carve(d,q.xy,g,.05,.0045,q.z+BH,.003);
  d=carve(d,vec2(-q.z,q.y),g2,.048,.004,q.x-BH,.003);
  return d; }
#define B1 vec3(-.17,BH,-.02)
#define B2 vec3(-.165,3.*BH+.001,-.018)
#define B3 vec3(-.1,BH,-.1)
float blocksD(vec3 p){ return min(min(block(p,B1,.25,49,50),block(p,B2,-.1,50,51)),block(p,B3,.5,51,49)); }
vec3 rtQ(vec3 p){ vec3 q=p-vec3(.14,.0,-.1); q.xz=rot(-.5)*q.xz; return q; }
float rattleD(vec3 q){
  float h=sdCapsule(q,vec3(-.06,.009,0.),vec3(.03,.012,0.),.008);
  float head=length(q-vec3(.065,.03,0.))-.03;
  float ring=sdTorus((q-vec3(.065,.03,0.)).yxz,.032,.004);
  float end=length(q-vec3(-.065,.011,0.))-.012;
  return min(min(h,head),min(ring,end)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,stackBase(p),3.);
  float k; r=U(r,ringsD(p,k),4.);
  r=U(r,blocksD(p),5.);
  r=U(r,rattleD(rtQ(p)),6.);
  return r; }
float blockInk(vec3 p,vec3 c,float ry,int g,int g2){ vec3 q=p-c; q.xz=rot(ry)*q.xz;
  if(q.z<-BH+.006&&glyph(q.xy/.05,g)*.05<.006) return .15;
  if(q.x>BH-.006&&glyph(vec2(-q.z,q.y)/.048,g2)*.048<.0055) return .15;
  return .8; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .7;
  if(id==4.){ float k; ringsD(p,k); return mod(k,2.)<.5?.45:.82; }
  if(id==5.){ float a=block(p,B1,.25,49,50), b=block(p,B2,-.1,50,51), c=block(p,B3,.5,51,49);
    if(a<=b&&a<=c) return blockInk(p,B1,.25,49,50); if(b<=c) return blockInk(p,B2,-.1,50,51); return blockInk(p,B3,.5,51,49); }
  if(id==6.){ vec3 q=rtQ(p); if(length(q-vec3(.065,.03,0.))<.034){ return .85; } return .55; }
  return .7; }
