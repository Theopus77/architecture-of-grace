/* Science Unit 17 "Biology: Genetics and Inheritance" — pencil still life: a DNA double-helix
   model on a wooden stand, beside a stack of two books. */
#define CAM_POS vec3(-0.9121,0.3599,-0.9917)
#define CAM_TGT vec3(-0.4418,0.0134,0.2460)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define DC vec3(.03,0.,.08)
vec2 dna(vec3 p){ vec3 q=p-DC;
  float base=sdCylY(q-vec3(0.,.01,0.),.06,.008)-.004;
  float rod=sdCylY(q-vec3(0.,.17,0.),.004,.16);
  vec3 h=q-vec3(0.,.04,0.);
  float pitch=.1; float R=.045;
  /* two backbones: nearest point on each helix by sampling the turn */
  float bb=1e5, rungs=1e5;
  float t0=h.y/pitch*6.2832;
  for(int s=0;s<2;s++){ float off=float(s)*3.1416;
    for(int k=-2;k<=2;k++){ float t=t0+float(k)*.4; 
      vec3 c=vec3(R*cos(t+off),t/6.2832*pitch,R*sin(t+off));
      vec3 c2=vec3(R*cos(t+.4+off),(t+.4)/6.2832*pitch,R*sin(t+.4+off));
      bb=min(bb,sdCapsule(h,c,c2,.007)); } }
  bb=max(bb,max(-h.y+.0,h.y-.26));
  float ys=h.y; float kk=floor(ys/.02+.5)*.02; kk=clamp(kk,.01,.25); float t=kk/pitch*6.2832;
  vec3 a=vec3(R*cos(t),kk,R*sin(t)), b=vec3(-R*cos(t),kk,-R*sin(t));
  rungs=sdCapsule(h,a,b,.0035);
  float balls=min(length(h-a)-.009,length(h-b)-.009);
  return vec2(min(base,rod),min(min(bb,balls),rungs)); }
vec2 books(vec3 p){ vec3 q=p-vec3(-.23,0.,.0); q.xz=rot(.35)*q.xz;
  float b1=sdRBox(q-vec3(0.,.02,0.),vec3(.1,.02,.075),.004);
  vec3 r=q-vec3(.01,.056,.0); r.xz=rot(-.25)*r.xz; float b2=sdRBox(r,vec3(.085,.016,.062),.004);
  float pg1=sdBox(q-vec3(.005,.02,0.),vec3(.1,.016,.071)); float pg2=sdBox(r-vec3(.005,0.,0.),vec3(.085,.012,.058));
  return vec2(min(b1,b2),min(pg1,pg2)-.0005); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 d=dna(p); r=U(r,d.x,3.); r=U(r,d.y,4.);
  vec2 b=books(p); r=U(r,b.x,5.); r=U(r,b.y,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .4;
  if(id==4.){ vec3 h=p-DC-vec3(0.,.04,0.); float r=length(h.xz); if(r<.035) return fract(h.y/.04+(h.x>0.?.5:0.))<.5?.35:.8; return .55; }
  if(id==5.) return .38;
  if(id==6.){ return fract(p.y/.003)<.4?.7:.88; }
  return .7; }
