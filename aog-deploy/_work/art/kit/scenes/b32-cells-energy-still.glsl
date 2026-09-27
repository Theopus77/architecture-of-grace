/* Practice room "Biology: Cells and Energy" — pencil still life: a broad leaf standing in a
   small glass of water (sunlight stored as sugar), a petri dish of cells, and two sugar cubes. */
#define CAM_POS vec3(-0.4827,0.5132,-1.0150)
#define CAM_TGT vec3(-0.3129,-0.0335,0.1242)
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
#define VAS vec3(0.,0.,.05)
#define DISH vec3(-.14,0.,-.07)
#define SUG vec3(.1,0.,-.08)
float vaseD(vec3 q){ float d=sdCylY(q-vec3(0.,.045,0.),.03,.045)-.002; d=max(d,-sdCylY(q-vec3(0.,.055,0.),.025,.045)); return d; }
vec3 leafQ(vec3 p){ vec3 q=p-VAS-vec3(0.,.1,0.); q.xz=rot(.35)*q.xz; q.xy=rot(1.3)*q.xy; return q; }
float bigLeaf(vec3 q){ q.z-=q.y*q.y*3.+.02*sin(q.x*20.)*q.x;
  float d2=leaf2(q.xy,.17,.1); float d=max(d2,abs(q.z)-.0013)*.7;
  d=min(d,sdCapsule(q,vec3(-.08,0.,0.),vec3(.0,0.,0.),.003));
  return d; }
float dishD(vec3 q){ float d=sdCylY(q-vec3(0.,.009,0.),.085,.009)-.001; d=max(d,-sdCylY(q-vec3(0.,.013,0.),.08,.009));
  return d; }
float gelD(vec3 q){ return sdCylY(q-vec3(0.,.006,0.),.08,.005); }
float sugD(vec3 p,vec3 c,float ry,float y){ vec3 q=place(p,c,ry); q.y-=y+.022; return sdRBox(q,vec3(.022),.003)+.0006*vn3(q*900.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,vaseD(p-VAS),3.);
  r=U(r,bigLeaf(leafQ(p)),4.);
  r=U(r,dishD(p-DISH),5.);
  r=U(r,gelD(p-DISH),6.);
  r=U(r,sugD(p,SUG,.3,0.),7.);
  r=U(r,sugD(p,SUG+vec3(.05,0.,.016),-.2,0.),7.);
  r=U(r,sugD(p,SUG+vec3(.024,0.,.008),.5,.044),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-VAS; if(q.y<.06&&q.y>.055) return .3; if(q.y<.06) return .72; return .9; }
  if(id==4.){ vec3 q=leafQ(p); float x=q.x+.0; 
    if(abs(q.y)<.0016) return .25;                                     /* midrib */
    float v=abs(fract((x-abs(q.y)*1.3)/.028)-.5); if(v<.05&&abs(q.y)>.003) return .35;   /* side veins */
    return .52; }
  if(id==5.) return .9;
  if(id==6.){ vec3 q=p-DISH; vec3 v=voro(q.xz*85.); if(v.y<.08) return .3; if(v.x<.12) return .4; return .82; }
  if(id==7.) return .93;
  return .7; }
