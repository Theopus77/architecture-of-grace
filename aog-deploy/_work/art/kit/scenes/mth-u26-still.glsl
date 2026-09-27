/* Math Unit 26 "Statistics: From a Sample to a Claim" — pencil still life: a wooden bean
   machine (a Galton board) standing upright: a funnel at the top, rows of pegs, and beads
   piled in the slots below in the shape of a bell curve; two loose beads on the table. */
#define CAM_POS vec3(-0.5432,0.3604,-1.2034)
#define CAM_TGT vec3(-0.3725,0.0626,0.1289)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
vec3 gbQ(vec3 p){ vec3 q=p-vec3(.03,0.,.12); q.xz=rot(.18)*q.xz; return q; }
#define W .22
#define BR .01
float binH(int i){ float x=(float(i)-5.)/2.2; return .16*exp(-.5*x*x); }
vec2 board(vec3 p){ vec3 q=gbQ(p);
  float back=sdRBox(q-vec3(0.,.19,.02),vec3(W+.015,.19,.008),.004);
  float frame=min(sdRBox(q-vec3(-W-.008,.19,0.),vec3(.008,.19,.02),.003),sdRBox(q-vec3(W+.008,.19,0.),vec3(.008,.19,.02),.003));
  frame=min(frame,sdRBox(q-vec3(0.,.008,0.),vec3(W+.03,.008,.045),.003));
  /* funnel */
  vec2 u=q.xy-vec2(0.,.34); float fun=max(abs(abs(u.x)-(.012+max(u.y,0.)*1.1))-.003,abs(u.y-.02)-.02);
  frame=min(frame,max(fun,abs(q.z)-.012));
  /* dividers */
  for(int i=0;i<12;i++){ float x=-W+float(i)*(2.*W/11.); frame=min(frame,sdRBox(q-vec3(x,.095,0.),vec3(.0015,.08,.012),.001)); }
  /* pegs */
  float pegs=1e5;
  for(int r=0;r<5;r++){ float y=.32-float(r)*.016; float off=mod(float(r),2.)*.5;
    float x=q.x/.024-off; float k=clamp(floor(x+.5),-8.,8.); vec3 c=q-vec3((k+off)*.024,y,0.);
    pegs=min(pegs,sdCylZ(c,.0025,.012)); }
  frame=min(frame,pegs);
  /* beads in the bins */
  float beads=1e5;
  for(int i=0;i<11;i++){ float x=-W+(float(i)+.5)*(2.*W/11.); float h=binH(i);
    vec3 c=q-vec3(x,.016,0.); float k=clamp(floor(c.y/(2.*BR)),0.,max(floor(h/(2.*BR))-1.,0.));
    if(h>.01) beads=min(beads,length(c-vec3(0.,(k+.5)*2.*BR,0.))-BR*.95); }
  return vec2(frame,beads); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 b=board(p); r=U(r,b.x,3.); r=U(r,b.y,4.);
  r=U(r,min(length(p-vec3(-.17,.0075,-.02))-.0075,length(p-vec3(-.14,.0075,-.05))-.0075),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=gbQ(p); if(q.z>.011&&abs(q.x)<W) return .85; return .5; }
  if(id>=4.) return .3;
  return .7; }
