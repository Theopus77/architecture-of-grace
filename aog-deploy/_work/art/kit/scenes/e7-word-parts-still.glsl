/* Room e7 "Word Parts: Prefixes, Suffixes, Roots" — pencil still life: toy building bricks
   snapped into one row (a short front brick, a long root brick, a short end brick: a long
   word carrying its parts), one more brick waiting, and a thick dictionary with thumb-index
   notches on its edge. */
#define CAM_POS vec3(-0.2695,0.2617,-0.5840)
#define CAM_TGT vec3(-0.1691,-0.0615,0.0893)
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
#define U8 .024   /* one stud pitch */
#define BH .029
float brick(vec3 q,float nx,float nz){ vec3 hs=vec3(nx*U8*.5-.0004,BH*.5,nz*U8*.5-.0004);
  float b=sdRBox(q-vec3(0.,BH*.5,0.),hs,.0012);
  vec2 g=q.xz/U8+vec2(nx,nz)*.5; vec2 c=(clamp(floor(g),vec2(0.),vec2(nx,nz)-1.)+.5-vec2(nx,nz)*.5)*U8;
  float stud=sdCylY(q-vec3(c.x,BH+.0025,c.y),.0072,.0025)-.0007;
  return min(b,stud); }
vec3 rowQ(vec3 p){ return place(p,vec3(-.02,0.,-.03),-.28); }
float brickA(vec3 q){ return brick(q-vec3(-.084,0.,0.),2.,2.); }
float brickB(vec3 q){ return brick(q-vec3(0.,0.,0.),5.,2.); }
float brickC(vec3 q){ return brick(q-vec3(.096,0.,0.),3.,2.); }
vec3 looseQ(vec3 p){ vec3 q=p-vec3(-.19,0.,-.1); q.xz=rot(.8)*q.xz; return q; }
vec3 dQ(vec3 p){ return place(p,vec3(.16,0.,.12),-1.25); }
float dictD(vec3 q){ vec3 s=vec3(.1,.035,.075);
  float d=bookD(q,s);
  for(int i=0;i<6;i++){ float z=-.06+.024*float(i); d=max(d,-sdCylY(q-vec3(s.x+.003,.012+.0055*float(i),z),.009,.005)); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=rowQ(p);
  r=U(r,brickA(q),3.);
  r=U(r,brickB(q),4.);
  r=U(r,brickC(q),5.);
  r=U(r,brick(looseQ(p),2.,2.),6.);
  r=U(r,dictD(dQ(p)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45;
  if(id==4.) return .82;
  if(id==5.) return .6;
  if(id==6.) return .7;
  if(id==7.){ vec3 q=dQ(p); if(abs(n.y)<.5&&q.x>-.09){ if(n.x>.5||abs(n.z)>.5) return fract(q.y/.003)<.3?.72:.9; } return .38; }
  return .7; }
