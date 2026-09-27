/* Practice room "Geometry: Circles, Area and Volume" — pencil still life: a tin can (a cylinder)
   and a paper cone of the same base and height standing beside it, and a drafting compass open
   over a circle it has drawn on a sheet of paper, one slice of the circle shaded. */
#define CAM_POS vec3(-0.3460,0.3113,-0.6709)
#define CAM_TGT vec3(-0.2311,-0.0588,0.0999)
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
#define CAN vec3(.02,0.,.07)
#define CON vec3(.14,0.,.05)
#define PAP vec3(-.12,0.,-.06)
#define CR .055
#define CH .13
float canD(vec3 q){ float d=sdCylY(q-vec3(0.,CH*.5,0.),.045,CH*.5)-.001;
  for(int i=0;i<3;i++) d=min(d,sdTorus(q-vec3(0.,.025+float(i)*.04,0.),.0455,.0012));
  d=min(d,sdTorus(q-vec3(0.,CH,0.),.044,.0025)); d=min(d,sdTorus(q-vec3(0.,.001,0.),.044,.0022));
  return d; }
float coneD(vec3 q){ return sdCone(q-vec3(0.,CH*.5,0.),.045,.001,CH*.5)-.0008; }
vec3 ppQ(vec3 p){ vec3 q=p-PAP; q.xz=rot(.15)*q.xz; return q; }
/* compass: needle point at the circle centre, pencil leg on the circle, hinge above */
vec3 cmQ(vec3 p){ vec3 q=ppQ(p); q.xz=rot(-.6)*q.xz; return q; }
float compassD(vec3 q){ vec3 H=vec3(CR*.5,.105,0.); vec3 A=vec3(0.,.004,0.), B=vec3(CR,.004,0.);
  float d=sdCapsule(q,A+vec3(0.,.008,0.),H,.0035); d=min(d,sdCapsule(q,B+vec3(0.,.012,0.),H,.0035));
  d=min(d,sdCapsule(q,A,A+vec3(0.,.01,0.),.0009));
  d=min(d,sdCapsule(q,B,B+vec3(0.,.018,0.),.0022));
  d=min(d,sdCylZ(q-H,.009,.005)-.001); d=min(d,sdCylY(q-H-vec3(0.,.018,0.),.003,.012));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,canD(p-CAN),3.);
  r=U(r,coneD(p-CON),4.);
  vec3 q=ppQ(p);
  r=U(r,sdBox(q-vec3(0.,.0008,0.),vec3(.085,.0007,.07)),5.);
  r=U(r,compassD(cmQ(p)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-CAN; if(q.y>CH-.002) return .6; if(abs(q.y-.065)<.022) return .82; return .6; }
  if(id==4.){ vec3 q=p-CON; float a=atan(q.z,q.x); if(abs(fract(a/6.2832*1.+q.y*3.)-.5)<.01) return .45; return .88; }
  if(id==5.){ vec3 q=cmQ(p); float r=length(q.xz), a=atan(q.z,q.x);
    if(abs(r-CR)<.0012) return .2;
    if(r<CR&&a>-.2&&a<.6){ if(abs(a+.2)*r<.0009||abs(a-.6)*r<.0009) return .25; return fract((q.x+q.z)/.004)<.3?.45:.9; }
    if(r<.002) return .3; return .94; }
  if(id==6.) return .45;
  return .7; }
