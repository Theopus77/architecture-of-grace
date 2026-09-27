/* Room "The Interior Mathematics" — pencil still life: a drawing compass standing open on its
   two legs, a half-round protractor with tick marks lying flat, and a sharpened pencil. */
#define CAM_POS vec3(-0.4166,0.3562,-0.7267)
#define CAM_TGT vec3(-0.1595,0.0258,0.0628)
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
#define CP vec3(-.04,0.,.07)
#define HY .19
vec3 cpQ(vec3 p){ return place(p,CP,.05); }
float compassD(vec3 p){ vec3 q=cpQ(p);
  vec3 top=vec3(0.,HY,0.);
  vec3 f1=vec3(-.075,.004,0.), f2=vec3(.075,.012,0.);
  float leg1=sdCapsule(q,top-vec3(.004,.01,0.),f1+vec3(.006,.016,0.),.0048);
  float leg2=sdCapsule(q,top-vec3(-.004,.01,0.),f2+vec3(-.008,.03,0.),.0048);
  float needle=sdCone((q-f1-vec3(.003,.009,0.)).yxz*vec3(1.,1.,1.),.0,.0,.0);
  needle=sdCapsule(q,f1+vec3(.005,.015,0.),f1,.0012);
  /* the pencil holder on the right leg: a short clamp and a lead */
  vec3 ld=f2+vec3(-.008,.03,0.); vec3 dir=normalize(f2-ld);
  float clamp_=sdCapsule(q,ld-dir*.01,ld+dir*.004,.0068);
  float lead=sdCapsule(q,ld,f2,.0025);
  float head=sdCylZ(q-top,.011,.006)-.002;
  float handle=sdCapsule(q,top,top+vec3(0.,.03,0.),.0045);
  float screw=sdCylZ(q-top-vec3(0.,-.035,0.),.004,.02);
  float bar=sdCapsule(q,top+vec3(-.038,-.1,0.)*.9,top+vec3(.038,-.1,0.)*.9,.0025);
  return min(min(min(leg1,leg2),min(needle,clamp_)),min(min(lead,head),min(handle,bar))); }
vec3 prQ(vec3 p){ vec3 q=p-vec3(.1,0.,-.12); q.xz=rot(-.25)*q.xz; return q; }
float protD(vec3 p){ vec3 q=prQ(p);
  float r=length(q.xz);
  float d=max(max(r-.11,-q.z),abs(q.y-.0015)-.0015);
  d=max(d,-max(max(r-.065,-q.z+.014),abs(q.y)-.01));
  return d-.0005; }
vec3 pcQ(vec3 p){ vec3 q=p-vec3(.16,.0062,.07); q.xz=rot(1.9)*q.xz; q.yz=rot(.2)*q.yz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,compassD(p),3.);
  r=U(r,protD(p),4.);
  r=U(r,pencilD2(pcQ(p),.08),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=cpQ(p); if(q.y>HY-.015) return .3; return .6; }
  if(id==4.){ vec3 q=prQ(p); float r=length(q.xz); float a=atan(q.z,q.x);
    float t=fract(a/(3.1416/18.)); float t5=fract(a/(3.1416/36.));
    if(r>.094&&r<.11&&t<.08) return .2; if(r>.101&&t5<.1) return .35; if(abs(r-.09)<.0008) return .4;
    if(r<.012&&abs(q.x)<.0008) return .3; return .9; }
  if(id==5.) return pencilTone(pcQ(p),.08);
  return .7; }
