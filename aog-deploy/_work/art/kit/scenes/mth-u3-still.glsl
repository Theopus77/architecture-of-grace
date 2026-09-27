/* Math Unit 3 "Place Value to 1,000" — pencil still life: base-ten blocks: a hundreds flat
   standing on edge, three tens rods lying in front and four ones cubes. */
#define CAM_POS vec3(-0.2969,0.2080,-0.7514)
#define CAM_TGT vec3(-0.1885,0.0187,0.0955)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define UN .022
/* hundreds flat: 10 x 10 units, one unit thick, standing upright leaning back a little */
vec3 flQ(vec3 p){ vec3 q=p-vec3(.05,0.,.12); q.xz=rot(.2)*q.xz; q.yz=rot(.12)*q.yz; q.y-=5.*UN; return q; }
float flatD(vec3 p){ return sdRBox(flQ(p),vec3(5.*UN,5.*UN,.5*UN),.002); }
/* tens rod lying along its length */
vec3 rdQ(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return q; }
float rodD(vec3 p,vec3 c,float ry){ return sdRBox(rdQ(p,c,ry),vec3(5.*UN,.5*UN,.5*UN),.002); }
float oneD(vec3 p,vec3 c,float ry){ return sdRBox(rdQ(p,c,ry),vec3(.5*UN),.002); }
#define R1 vec3(-.06,.5*UN,-.05)
#define R2 vec3(-.05,.5*UN,-.05+UN*1.05)
#define R3 vec3(-.07,1.5*UN+.001,-.05+UN*.5)
float rodT(vec3 p,vec3 c,float ry){ vec3 q=rdQ(p,c,ry); float g=abs(fract(q.x/UN)-.5); return g>.45?.3:.65; }
float grid(vec2 u){ vec2 f=abs(fract(u/UN)-.5); return max(f.x,f.y); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,flatD(p),3.);
  r=U(r,rodD(p,R1,.12),4.); r=U(r,rodD(p,R2,.12),6.); r=U(r,rodD(p,R3,.14),7.);
  float ones=min(oneD(p,vec3(.15,.5*UN,-.03),.3),oneD(p,vec3(.182,.5*UN,-.04),.1));
  ones=min(ones,min(oneD(p,vec3(.165,1.5*UN+.001,-.035),.5),oneD(p,vec3(.15,.5*UN,-.07),-.2)));
  r=U(r,ones,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=flQ(p); vec2 f=abs(fract(q.xy/UN+.5)-.5); float g=min(f.x,f.y); return g<.06?.3:.8; }
  if(id==4.) return rodT(p,R1,.12);
  if(id==6.) return rodT(p,R2,.12);
  if(id==7.) return rodT(p,R3,.14);
  if(id==5.) return .55;
  return .7; }
