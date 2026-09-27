/* FCS Unit 18 "Child Development and Care" — pencil still life of a young child's toys: a
   stacking-ring tower on its post, a baby rattle, and two soft picture-cube blocks. */
#define CAM_POS vec3(-0.4432,0.2950,-0.8001)
#define CAM_TGT vec3(-0.1982,0.0012,0.1108)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define ST vec3(.04,0.,.07)
float stacker(vec3 p){ vec3 q=p-ST;
  float base=sdCylY(q-vec3(0.,.012,0.),.065,.01)-.004;
  float post=sdCylY(q-vec3(0.,.1,0.),.009,.09);
  float cap=length((q-vec3(0.,.205,0.))/vec3(1.,.8,1.))*.8-.02;
  return min(min(base,post),cap); }
float ringR(int i){ return .058-float(i)*.0095; }
float ringY(int i){ float y=.027; for(int k=0;k<5;k++){ if(k>=i) break; y+=2.*(.012-float(k)*.0012)+.0005; } return y+(.012-float(i)*.0012); }
float rings(vec3 p){ vec3 q=p-ST; float d=1e5; for(int i=0;i<5;i++){ float h=.012-float(i)*.0012; d=min(d,(length(vec2(length(q.xz)-ringR(i)*.62,(q.y-ringY(i))*1.))-h*1.)); } return d; }
float rattle(vec3 p){ vec3 q=p-vec3(-.15,.02,-.05); q.xz=rot(.5)*q.xz; q.xy=rot(.05)*q.xy;
  float ball=length(q-vec3(.07,.005,0.))-.024; float hdl=sdCapsule(q,vec3(-.05,0.,0.),vec3(.05,.003,0.),.0075);
  float ringe=sdTorus((q-vec3(-.065,0.,0.)).xzy*vec3(1.,1.,1.),.018,.005);
  float collar=sdTorus((q-vec3(.047,.004,0.)).yxz,.01,.004);
  return min(min(ball,hdl),min(ringe,collar)); }
#define B1 vec3(.2,.032,-.06)
#define B2 vec3(.25,.032,.02)
float softBlock(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return sdRBox(q,vec3(.032),.012); }
float blockInk(vec3 p,vec3 c,float ry,int k){ vec3 q=p-c; q.xz=rot(ry)*q.xz;
  vec2 u=q.z<-.028?q.xy:q.x>.028?vec2(q.z,q.y):q.xz; if(abs(max(abs(u.x),abs(u.y))-.024)<.002) return .4;   /* stitched border */
  if(q.z<-.028){ if(k==0){ float s=length(u)-.012; if(abs(s)<.002) return .25; if(abs(u.y)<.001||abs(u.x)<.001) return .6; }   /* a sun */
    else { if(sdSeg2(u,vec2(-.012,-.01),vec2(0.,.012))<.002||sdSeg2(u,vec2(0.,.012),vec2(.012,-.01))<.002||sdSeg2(u,vec2(-.012,-.01),vec2(.012,-.01))<.002) return .25; } }  /* a triangle */
  if(q.x>.028&&length(u)<.012) return .45;
  return .85; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,stacker(p),3.);
  r=U(r,rings(p),4.);
  r=U(r,rattle(p),5.);
  r=U(r,softBlock(p,B1,-.3),6.);
  r=U(r,softBlock(p,B2,.2),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .6;
  if(id==4.){ vec3 q=p-ST; int k=0; float b=1e5; for(int i=0;i<5;i++){ float d=abs(q.y-ringY(i)); if(d<b){b=d;k=i;} } return k==0?.3:k==1?.75:k==2?.45:k==3?.85:.35; }
  if(id==5.){ vec3 q=p-vec3(-.15,.02,-.05); q.xz=rot(.5)*q.xz; if(q.x>.045) return fract(atan(q.z,q.y-.005)*1.5)<.5?.4:.85; return .7; }
  if(id==6.) return blockInk(p,B1,-.3,0);
  if(id==7.) return blockInk(p,B2,.2,1);
  return .7; }
