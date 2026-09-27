/* Math Unit 1 "Counting and Numbers" — pencil still life: a wooden counting frame (an
   abacus with ten beads on each rod, some slid across as if counting) beside three number
   blocks carved 1, 2 and 3. */
#define CAM_POS vec3(-0.468,0.298,-0.989)
#define CAM_TGT vec3(-0.326,0.050,0.120)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define AB vec3(.1,0.,.1)
#define ARY -.25
vec3 aq(vec3 p){ vec3 q=p-AB; q.xz=rot(ARY)*q.xz; return q; }
float counted(int row){ return row==0?7.:row==1?3.:row==2?5.:2.; }  /* beads slid to the left */
vec2 abacus(vec3 p){
  vec3 q=aq(p);
  float posts=min(sdRBox(q-vec3(-.17,.13,0.),vec3(.012,.13,.018),.003),sdRBox(q-vec3(.17,.13,0.),vec3(.012,.13,.018),.003));
  float bars=min(sdRBox(q-vec3(0.,.25,0.),vec3(.19,.012,.02),.004),sdRBox(q-vec3(0.,.03,0.),vec3(.19,.01,.02),.003));
  float feet=min(sdRBox(q-vec3(-.17,.006,0.),vec3(.022,.006,.05),.003),sdRBox(q-vec3(.17,.006,0.),vec3(.022,.006,.05),.003));
  float frame=min(min(posts,bars),feet);
  float rods=1e5, beads=1e5;
  for(int r=0;r<4;r++){ float y=.075+float(r)*.047; vec3 c=q-vec3(0.,y,0.);
    rods=min(rods,sdCylX(c,.0025,.16));
    float n=counted(r);
    for(int i=0;i<10;i++){ float fi=float(i);
      float x= fi<n ? -.148+fi*.0205 : .148-(9.-fi)*.0205;
      vec3 b=c-vec3(x,0.,0.);
      beads=min(beads,(length(b/vec3(.0098,.017,.017))-1.)*.0098); } }
  return vec2(min(frame,rods),beads); }
#define BH .047
float nblock(vec3 p,vec3 c,float ry,int g,int g2){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  float d=sdRBox(q,vec3(BH),.005); if(d>.02) return d;
  d=carve(d,q.xy,g,.068,.0058,q.z+BH,.0035);
  d=carve(d,vec2(-q.z,q.y),g2,.064,.0053,q.x-BH,.0035);
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 a=abacus(p); r=U(r,a.x,3.); r=U(r,a.y,4.);
  r=U(r,nblock(p,vec3(-.29,BH,.06),.3,49,50),5.);
  r=U(r,nblock(p,vec3(-.18,BH,.03),-.05,50,51),6.);
  r=U(r,nblock(p,vec3(-.235,3.*BH+.0005,.05),.15,51,49),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .45;
  if(id==4.){ vec3 q=aq(p); float r=floor((q.y-.075)/.047+.5); return mod(r,2.)<.5?.3:.75; }
  if(id>=5.) return .78;
  return .7; }
