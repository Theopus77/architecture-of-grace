/* Room "Algebra II: Polynomial and Rational Functions" — pencil still life: a wooden bead-maze
   toy with two bent wires: one rises, dips and rises again like a cubic, the other shoots up
   near one end like a rational curve; wooden beads ride on both. */
#define CAM_POS vec3(-0.3312,0.1746,-0.3600)
#define CAM_TGT vec3(-0.1356,0.0152,0.0720)
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
#define BM vec3(.0,0.,.05)
#define HW .14
vec3 bmQ(vec3 p){ return place(p,BM,-.15); }
float baseD(vec3 p){ vec3 q=bmQ(p); return sdRBox(q-vec3(0.,.012,0.),vec3(HW+.02,.012,.07),.006); }
/* the two wire curves, each as y(x) in the plane z = zc */
float y1(float x){ float u=x/HW; return .1+.07*(u*u*u-u*.9); }                 /* cubic */
float y2(float x){ float u=x/HW; return .05+.012/max(u+1.08,.05)*.9; }         /* rational: tall near the left end */
float wireD(vec3 p,int w){ vec3 q=bmQ(p); float zc=w==0?-.025:.03; float d=1e5; vec2 pr=vec2(-HW,.024);
  for(int i=0;i<=30;i++){ float x=-HW+float(i)*2.*HW/30.; vec2 c=vec2(x,w==0?y1(x):y2(x)); if(i==0) c=vec2(x,.024);
    if(i==30) c=vec2(x,.024);
    d=min(d,sdCapsule(q,vec3(pr,zc),vec3(c,zc),.0028)); pr=c; }
  return d; }
float beadsD(vec3 p){ vec3 q=bmQ(p); float d=1e5;
  for(int i=0;i<4;i++){ float x=-.08+float(i)*.045; vec3 c=vec3(x,y1(x),-.025); d=min(d,length(q-c)-.013); }
  for(int i=0;i<3;i++){ float x=-.02+float(i)*.05; vec3 c=vec3(x,y2(x),.03); d=min(d,sdCylX(q-c,.011,.008)-.003); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,baseD(p),3.);
  r=U(r,min(wireD(p,0),wireD(p,1)),4.);
  r=U(r,beadsD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45+.15*grain(bmQ(p),70.);
  if(id==4.) return .3;
  if(id==5.){ vec3 q=bmQ(p); return q.z<0.?(fract(q.x/.045+.5)<.5?.8:.5):.65; }
  return .7; }
